import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { Form, Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration, ServerRouter, UNSAFE_withComponentProps, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, useNavigation, useSubmit } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region app/entry.server.tsx
var entry_server_exports = /* @__PURE__ */ __exportAll({
	default: () => handleRequest,
	streamTimeout: () => streamTimeout
});
var streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, _loadContext) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const userAgent = request.headers.get("user-agent");
		const readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
		const { pipe, abort } = renderToPipeableStream(/* @__PURE__ */ jsx(ServerRouter, {
			context: routerContext,
			url: request.url
		}), {
			[readyOption]() {
				shellRendered = true;
				const body = new PassThrough();
				const stream = createReadableStreamFromReadable(body);
				responseHeaders.set("Content-Type", "text/html");
				resolve(new Response(stream, {
					headers: responseHeaders,
					status: responseStatusCode
				}));
				pipe(body);
			},
			onShellError(error) {
				reject(error);
			},
			onError(error) {
				responseStatusCode = 500;
				if (shellRendered) console.error(error);
			}
		});
		setTimeout(abort, 6e3);
	});
}
//#endregion
//#region app/data/datasources.ts
var DATASOURCES = {
	series: {
		id: "series",
		buildUrl: (params) => `/resources/series?code=${encodeURIComponent(params.code)}&range=${encodeURIComponent(params.range)}`
	},
	latest: {
		id: "latest",
		buildUrl: (params) => `/resources/latest?codes=${encodeURIComponent(params.codes.join(","))}`
	},
	commodities: {
		id: "commodities",
		buildUrl: () => "/resources/commodities"
	}
};
//#endregion
//#region app/context/dataProvider.tsx
var GLOBAL_POLLING_KEY = "live-polling:enabled";
/**
* Owns every live data key: who's fetched, who's polling, and at what rate.
* Components never fetch directly — they declare a datasource id + params and
* their own live preference, and this store dedupes the rest.
*
* Two cross-cutting controls sit above individual subscriptions:
*  - tab visibility: polling pauses while the tab is hidden, and does one
*    catch-up fetch per active key when it becomes visible again
*  - a global on/off switch (Settings), for killing all polling at once —
*    useful on a metered free-tier API budget
*/
var DataStore = class {
	entries = /* @__PURE__ */ new Map();
	pageVisible = true;
	globalPollingEnabled = true;
	globalListeners = /* @__PURE__ */ new Set();
	constructor() {
		if (typeof document !== "undefined") {
			this.pageVisible = document.visibilityState !== "hidden";
			document.addEventListener("visibilitychange", () => {
				const wasVisible = this.pageVisible;
				this.pageVisible = document.visibilityState !== "hidden";
				if (this.pageVisible && !wasVisible) this.entries.forEach((entry, key) => {
					if (this.effectiveInterval(entry) > 0) this.fetchNow(entry.sourceId, key, entry.params);
				});
				this.rescheduleAll();
			});
		}
	}
	ensure(key, sourceId, params) {
		let entry = this.entries.get(key);
		if (!entry) {
			entry = {
				sourceId,
				params,
				snapshot: {
					data: void 0,
					error: void 0,
					isLoading: false,
					updatedAt: null
				},
				listeners: /* @__PURE__ */ new Set(),
				subscribers: /* @__PURE__ */ new Map(),
				timer: null,
				inFlight: null
			};
			this.entries.set(key, entry);
		}
		return entry;
	}
	patch(key, patch) {
		const entry = this.entries.get(key);
		if (!entry) return;
		entry.snapshot = {
			...entry.snapshot,
			...patch
		};
		entry.listeners.forEach((notify) => notify());
	}
	/** Seed a key with SSR/loader data so the first render never re-fetches. */
	seed(key, sourceId, params, data) {
		if (this.ensure(key, sourceId, params).snapshot.data === void 0) this.patch(key, {
			data,
			updatedAt: Date.now()
		});
	}
	getSnapshot(key, sourceId, params) {
		return this.ensure(key, sourceId, params).snapshot;
	}
	async fetchNow(sourceId, key, params) {
		const entry = this.entries.get(key);
		if (!entry || entry.inFlight) return entry?.inFlight;
		const config = DATASOURCES[sourceId];
		if (!config) return;
		this.patch(key, { isLoading: true });
		const request = (async () => {
			try {
				const url = config.buildUrl(params);
				const headers = "headers" in config ? config.headers : void 0;
				const res = await fetch(url, { headers });
				const json = await res.json().catch(() => null);
				if (!res.ok && !json) throw new Error(`${sourceId} request failed: ${res.status}`);
				this.patch(key, {
					data: json,
					error: void 0,
					isLoading: false,
					updatedAt: Date.now()
				});
			} catch (error) {
				this.patch(key, {
					error,
					isLoading: false
				});
			} finally {
				entry.inFlight = null;
			}
		})();
		entry.inFlight = request;
		return request;
	}
	/** The fastest interval any subscriber asked for, or 0 if polling is paused/off/empty. */
	effectiveInterval(entry) {
		if (!this.globalPollingEnabled || !this.pageVisible) return 0;
		const active = Array.from(entry.subscribers.values()).filter((ms) => ms > 0);
		return active.length ? Math.min(...active) : 0;
	}
	reschedule(key) {
		const entry = this.entries.get(key);
		if (!entry) return;
		if (entry.timer) {
			clearInterval(entry.timer);
			entry.timer = null;
		}
		const interval = this.effectiveInterval(entry);
		if (interval <= 0) return;
		entry.timer = setInterval(() => this.fetchNow(entry.sourceId, key, entry.params), interval);
	}
	rescheduleAll() {
		this.entries.forEach((_entry, key) => this.reschedule(key));
	}
	subscribe(sourceId, key, params, subscriberId, intervalMs, onChange) {
		const entry = this.ensure(key, sourceId, params);
		entry.listeners.add(onChange);
		entry.subscribers.set(subscriberId, intervalMs);
		if (entry.snapshot.data === void 0 && !entry.inFlight) this.fetchNow(sourceId, key, params);
		this.reschedule(key);
		return () => {
			entry.listeners.delete(onChange);
			entry.subscribers.delete(subscriberId);
			this.reschedule(key);
		};
	}
	setGlobalPolling(enabled) {
		this.globalPollingEnabled = enabled;
		try {
			window.localStorage.setItem(GLOBAL_POLLING_KEY, enabled ? "1" : "0");
		} catch {}
		if (enabled) this.entries.forEach((entry, key) => {
			if (Array.from(entry.subscribers.values()).some((ms) => ms > 0)) this.fetchNow(entry.sourceId, key, entry.params);
		});
		this.rescheduleAll();
		this.globalListeners.forEach((l) => l());
	}
	isGlobalPollingEnabled() {
		return this.globalPollingEnabled;
	}
	initGlobalPollingFromStorage() {
		try {
			const stored = window.localStorage.getItem(GLOBAL_POLLING_KEY);
			if (stored !== null) {
				this.globalPollingEnabled = stored === "1";
				this.rescheduleAll();
			}
		} catch {}
	}
	subscribeGlobalPolling(onChange) {
		this.globalListeners.add(onChange);
		return () => this.globalListeners.delete(onChange);
	}
};
var DataStoreContext = createContext(null);
function DataProvider({ children }) {
	const storeRef = useRef(null);
	if (!storeRef.current) storeRef.current = new DataStore();
	useEffect(() => {
		storeRef.current?.initGlobalPollingFromStorage();
	}, []);
	return /* @__PURE__ */ jsx(DataStoreContext.Provider, {
		value: storeRef.current,
		children
	});
}
function useStore() {
	const store = useContext(DataStoreContext);
	if (!store) throw new Error("useLiveData must be used within <DataProvider>");
	return store;
}
/**
* Subscribe to a named datasource. No fetcher to write — the provider resolves
* `sourceId` against the registry and fetches internally. Multiple components
* requesting the same sourceId+params share one cached entry and one poll
* timer (running at the fastest interval any of them asked for), and polling
* automatically pauses when the tab is hidden or the global toggle is off.
*/
function useLiveData(sourceId, params, options = {}) {
	const store = useStore();
	const subscriberId = useId();
	const key = `${sourceId}:${JSON.stringify(params)}`;
	const seededKeys = useRef(/* @__PURE__ */ new Set());
	if (options.initialData !== void 0 && !seededKeys.current.has(key)) {
		store.seed(key, sourceId, params, options.initialData);
		seededKeys.current.add(key);
	}
	const live = options.live ?? { enabled: false };
	const intervalMs = live.enabled ? live.intervalMs ?? 15e3 : 0;
	const subscribe = useCallback((onChange) => store.subscribe(sourceId, key, params, subscriberId, intervalMs, onChange), [
		store,
		sourceId,
		key,
		subscriberId,
		intervalMs
	]);
	const getSnapshot = useCallback(() => store.getSnapshot(key, sourceId, params), [
		store,
		key,
		sourceId
	]);
	const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
	return {
		data: snapshot.data,
		error: snapshot.error,
		isLoading: snapshot.isLoading,
		lastUpdated: snapshot.updatedAt,
		refresh: () => store.fetchNow(sourceId, key, params)
	};
}
//#endregion
//#region app/root.tsx
var root_exports = /* @__PURE__ */ __exportAll({
	ErrorBoundary: () => ErrorBoundary,
	Layout: () => Layout,
	default: () => root_default
});
var THEME_INIT_SCRIPT = `
  try {
    var t = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
  } catch (e) {}
`;
function Layout({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsxs("head", { children: [
			/* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
			/* @__PURE__ */ jsx("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			}),
			/* @__PURE__ */ jsx("title", { children: "Oil Prices — rr-vite-express" }),
			/* @__PURE__ */ jsx("link", {
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			}),
			/* @__PURE__ */ jsx("link", {
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			}),
			/* @__PURE__ */ jsx("link", {
				href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap",
				rel: "stylesheet"
			}),
			/* @__PURE__ */ jsx(Meta, {}),
			/* @__PURE__ */ jsx(Links, {}),
			/* @__PURE__ */ jsx("script", { dangerouslySetInnerHTML: { __html: THEME_INIT_SCRIPT } }),
			/* @__PURE__ */ jsx("style", { children: CSS })
		] }), /* @__PURE__ */ jsxs("body", { children: [
			children,
			/* @__PURE__ */ jsx(ScrollRestoration, {}),
			/* @__PURE__ */ jsx(Scripts, {})
		] })]
	});
}
var root_default = UNSAFE_withComponentProps(function App() {
	return /* @__PURE__ */ jsx(DataProvider, { children: /* @__PURE__ */ jsx(Outlet, {}) });
});
var ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary({ error }) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (error instanceof Error) details = error.message;
	return /* @__PURE__ */ jsxs("main", {
		style: { padding: "2rem" },
		children: [/* @__PURE__ */ jsx("h1", { children: message }), /* @__PURE__ */ jsx("p", { children: details })]
	});
});
var CSS = `
  :root[data-theme="dark"] {
    --canvas: #0A0E13;
    --surface: #12181F;
    --border: #1A222B;
    --text-primary: #E7ECF0;
    --text-muted: #8A97A3;
  }
  :root[data-theme="light"] {
    --canvas: #F6F5F2;
    --surface: #FFFFFF;
    --border: #E2DFD6;
    --text-primary: #12181F;
    --text-muted: #5A6A78;
  }
  :root { --brand: #E8672E; --font-heading: 'Space Grotesk', 'Inter', sans-serif; --font-body: 'Inter', -apple-system, sans-serif; --font-mono: 'IBM Plex Mono', 'SFMono-Regular', monospace; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: var(--canvas); color: var(--text-primary); font-family: var(--font-body); }
  a { color: inherit; }
  h1, h2, h3 { font-family: var(--font-heading); letter-spacing: -0.01em; margin: 0; }
  ::selection { background: var(--brand); color: white; }

  .app-shell { display: flex; align-items: stretch; min-height: 100vh; }
  .app-main { flex: 1; min-width: 0; }
  .app-content { max-width: 1080px; margin: 0 auto; padding: 1.5rem; padding-bottom: 84px; }
  @media (min-width: 768px) { .app-content { padding: 1.5rem 2rem; padding-bottom: 2rem; } }

  .sidebar { width: 220px; flex-shrink: 0; position: sticky; top: 0; height: 100vh; border-right: 1px solid var(--border); padding: 1.25rem 0.75rem; display: none; flex-direction: column; gap: 2px; }
  @media (min-width: 768px) { .sidebar { display: flex; } }
  .brand { display: flex; align-items: center; gap: 8px; padding: 0 0.5rem 1.25rem; }
  .brand-mark { width: 10px; height: 10px; border-radius: 2px; background: var(--brand); transform: rotate(45deg); }
  .brand-name { font-family: var(--font-heading); font-weight: 700; font-size: 1rem; }
  .sidebar-link { display: flex; align-items: center; gap: 10px; padding: 0.6rem 0.75rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; color: var(--text-muted); text-decoration: none; }
  .sidebar-link.active { background: var(--surface); color: var(--brand); }

  .bottom-nav { display: flex; justify-content: space-around; position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface); border-top: 1px solid var(--border); padding: 6px 0 max(6px, env(safe-area-inset-bottom)); z-index: 20; }
  @media (min-width: 768px) { .bottom-nav { display: none; } }
  .bottom-nav-link { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; text-decoration: none; color: var(--text-muted); font-size: 0.62rem; font-weight: 600; padding: 4px 0; }
  .bottom-nav-link.active { color: var(--brand); }

  .topbar { position: sticky; top: 0; z-index: 10; background: var(--canvas); border-bottom: 1px solid var(--border); padding: 0.75rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
  @media (min-width: 768px) { .topbar { padding: 0.75rem 2rem; } }
  .mobile-only { display: flex; }
  .desktop-only { display: none; }
  @media (min-width: 768px) { .mobile-only { display: none; } .desktop-only { display: flex; } }

  .ticker { overflow: hidden; border-bottom: 1px solid var(--border); background: var(--surface); }
  .api-key-banner { font-size: 0.78rem; color: var(--text-muted); background: var(--surface); border-bottom: 1px solid var(--border); padding: 0.6rem 1.5rem; }
  .api-key-banner code { font-family: var(--font-mono); background: var(--border); padding: 1px 5px; border-radius: 4px; color: var(--text-primary); }
  @media (min-width: 768px) { .api-key-banner { padding: 0.6rem 2rem; } }  .ticker-track { display: flex; gap: 2rem; padding: 0.5rem 1.5rem; white-space: nowrap; animation: ticker-scroll 30s linear infinite; width: max-content; }
  .ticker-item { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-muted); }
  @keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  .card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 10px; padding: 1rem 1.1rem; }
  .chart-tooltip { position: absolute; top: 8px; transform: translateX(-50%); display: flex; flex-direction: column; gap: 2px; padding: 6px 8px; border-radius: 6px; background: var(--text-primary); color: var(--canvas); pointer-events: none; font-family: var(--font-mono); font-size: 0.7rem; white-space: nowrap; }
  .chart-tooltip span { opacity: 0.72; font-family: var(--font-body); font-size: 0.65rem; }
  .icon-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.9rem; padding: 4px 6px; border-radius: 6px; }
  .icon-btn:hover { background: var(--border); }

  .btn { font-family: var(--font-body); font-weight: 600; font-size: 0.78rem; padding: 0.35rem 0.7rem; border-radius: 6px; border: 1px solid var(--brand); background: var(--brand); color: white; cursor: pointer; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-outline { background: transparent; color: var(--text-primary); border-color: var(--border); }

  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: var(--border); color: var(--text-muted); font-size: 0.65rem; font-weight: 600; white-space: nowrap; }

  .pill { border-radius: 999px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-size: 0.8rem; font-weight: 600; padding: 0.4rem 0.9rem; cursor: pointer; flex-shrink: 0; }
  .pill.active { background: var(--text-primary); color: var(--canvas); border-color: var(--text-primary); }
  .category-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }

  .grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
  @media (min-width: 640px) { .grid-2 { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 640px) { .grid-stats { grid-template-columns: repeat(4, 1fr); } }

  .muted { color: var(--text-muted); }
  .mono { font-family: var(--font-mono); }
  select, input { font-family: var(--font-body); background: var(--surface); color: var(--text-primary); border: 1px solid var(--border); border-radius: 6px; padding: 0.35rem 0.6rem; font-size: 0.82rem; }

  .pulse-dot { box-shadow: 0 0 0 0 rgba(95, 168, 124, 0.55); animation: pulse 2s infinite; }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(95,168,124,0.55); } 70% { box-shadow: 0 0 0 6px rgba(95,168,124,0); } 100% { box-shadow: 0 0 0 0 rgba(95,168,124,0); } }
`;
//#endregion
//#region app/lib/oilPriceApi.server.ts
var BASE_URL = "https://api.oilpriceapi.com/v1";
var OilPriceApiError = class extends Error {
	status;
	constructor(message, status) {
		super(message);
		this.name = "OilPriceApiError";
		this.status = status;
	}
};
var commodityCache = null;
var COMMODITY_CACHE_MS = 1440 * 60 * 1e3;
function hasApiKey() {
	return Boolean(process.env.OILPRICEAPI_KEY);
}
async function apiFetch(path, params = {}) {
	const url = new URL(`${BASE_URL}${path}`);
	Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
	const key = process.env.OILPRICEAPI_KEY;
	const res = await fetch(url.toString(), {
		headers: key ? { Authorization: `Token ${key}` } : void 0,
		signal: AbortSignal.timeout(8e3)
	});
	if (!res.ok) {
		const apiError = (await res.json().catch(() => null))?.error;
		if (res.status === 401) throw new OilPriceApiError("Missing or invalid OILPRICEAPI_KEY", 401);
		if (res.status === 403 && apiError?.code === "EMAIL_CONFIRMATION_REQUIRED") throw new OilPriceApiError("OilPriceAPI requires email confirmation before serving more requests. Confirm your account at https://www.oilpriceapi.com/confirm", 403);
		if (res.status === 429) throw new OilPriceApiError("OilPriceAPI rate limit hit — slow down polling", 429);
		throw new OilPriceApiError(apiError?.message || `OilPriceAPI request failed (${res.status})`, res.status);
	}
	return res.json();
}
/**
* Latest prices for the given codes. Uses the authenticated endpoint when
* OILPRICEAPI_KEY is set; otherwise falls back to the public /demo/prices
* endpoint (no key required, WTI/Brent/Nat Gas only, 20 req/hour).
*/
async function fetchLatestPrices(codes) {
	const json = hasApiKey() ? await apiFetch("/prices/latest", { by_code: codes.join(",") }) : await apiFetch("/demo/prices");
	const rows = hasApiKey() ? json.data?.prices ?? (json.data?.code ? [json.data] : []) : json.data?.prices ?? [];
	const out = {};
	for (const row of rows) {
		if (!codes.includes(row.code)) continue;
		const time = row.created_at ?? row.updated_at ?? (/* @__PURE__ */ new Date()).toISOString();
		out[row.code] = {
			time,
			price: row.price
		};
	}
	return out;
}
/** The API catalog is authoritative and changes rarely, so cache it for a day. */
async function fetchCommodities() {
	if (!hasApiKey()) throw new OilPriceApiError("The live commodity catalog requires OILPRICEAPI_KEY", 401);
	if (commodityCache && commodityCache.expiresAt > Date.now()) return commodityCache.value;
	const json = await apiFetch("/commodities");
	const commodities = (Array.isArray(json.data) ? json.data : []).filter((item) => item?.code && item?.name).map((item) => ({
		code: item.code,
		name: item.name,
		currency: item.currency || "USD",
		category: item.category || "other",
		description: item.description || "Live commodity from OilPriceAPI.",
		unit: item.unit || "unit",
		unitDescription: item.unit_description,
		updateFrequency: item.update_frequency
	}));
	commodityCache = {
		value: commodities,
		expiresAt: Date.now() + COMMODITY_CACHE_MS
	};
	return commodities;
}
/** Raw/aggregated spot points for one commodity. Requires OILPRICEAPI_KEY. */
async function fetchHistory(code, range) {
	if (!hasApiKey()) throw new OilPriceApiError("Historical data requires OILPRICEAPI_KEY — the free demo endpoint only covers latest prices", 401);
	const interval = range === "past_day" ? "1h" : "1d";
	return ((await apiFetch(`/prices/${range}`, {
		by_code: code,
		interval,
		per_page: "100"
	})).data?.prices ?? []).map((r) => ({
		time: r.created_at ?? (/* @__PURE__ */ new Date()).toISOString(),
		price: r.price
	})).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}
function isOilPriceApiKeyConfigured() {
	return hasApiKey();
}
//#endregion
//#region app/routes/resources.commodities.tsx
var resources_commodities_exports = /* @__PURE__ */ __exportAll({ loader: () => loader$5 });
async function loader$5() {
	try {
		return Response.json({
			commodities: await fetchCommodities(),
			source: "oilpriceapi"
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to fetch commodities";
		const status = error instanceof OilPriceApiError ? error.status ?? 502 : 502;
		return Response.json({
			commodities: [],
			source: "unavailable",
			error: message
		}, { status });
	}
}
//#endregion
//#region app/routes/resources.latest.tsx
var resources_latest_exports = /* @__PURE__ */ __exportAll({ loader: () => loader$4 });
async function loader$4({ request }) {
	const codesParam = new URL(request.url).searchParams.get("codes");
	const codes = codesParam ? codesParam.split(",").filter(Boolean) : [];
	if (!codes.length) return Response.json({
		updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		prices: {}
	});
	try {
		const prices = await fetchLatestPrices(codes);
		return Response.json({
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			prices
		});
	} catch (err) {
		const status = err instanceof OilPriceApiError ? err.status ?? 502 : 502;
		const message = err instanceof Error ? err.message : "Failed to fetch latest prices";
		return Response.json({
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			prices: {},
			error: message
		}, { status });
	}
}
//#endregion
//#region app/routes/resources.series.tsx
var resources_series_exports = /* @__PURE__ */ __exportAll({ loader: () => loader$3 });
async function loader$3({ request }) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code") || "";
	const range = url.searchParams.get("range") || "past_day";
	if (!code) return Response.json({
		code,
		range,
		data: [],
		error: "A commodity code is required"
	}, { status: 400 });
	try {
		const data = await fetchHistory(code, range);
		return Response.json({
			code,
			range,
			data
		});
	} catch (err) {
		const status = err instanceof OilPriceApiError ? err.status ?? 502 : 502;
		const message = err instanceof Error ? err.message : "Failed to fetch history";
		return Response.json({
			code,
			range,
			data: [],
			error: message
		}, { status });
	}
}
//#endregion
//#region app/components/layout/navConfig.ts
var NAV_ITEMS = [
	{
		to: "/",
		label: "Dashboard",
		icon: "◆",
		end: true
	},
	{
		to: "/markets",
		label: "Markets",
		icon: "◇"
	},
	{
		to: "/history",
		label: "History",
		icon: "◷"
	},
	{
		to: "/settings",
		label: "Settings",
		icon: "⚙"
	}
];
//#endregion
//#region app/components/layout/Sidebar.tsx
function Sidebar() {
	return /* @__PURE__ */ jsxs("nav", {
		"aria-label": "Primary",
		className: "sidebar",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "brand",
			children: [/* @__PURE__ */ jsx("span", { className: "brand-mark" }), /* @__PURE__ */ jsx("span", {
				className: "brand-name",
				children: "Oil Prices"
			})]
		}), NAV_ITEMS.map(({ to, label, icon, end }) => /* @__PURE__ */ jsxs(NavLink, {
			to,
			end,
			className: ({ isActive }) => `sidebar-link${isActive ? " active" : ""}`,
			children: [/* @__PURE__ */ jsx("span", {
				"aria-hidden": true,
				children: icon
			}), /* @__PURE__ */ jsx("span", { children: label })]
		}, to))]
	});
}
//#endregion
//#region app/components/layout/BottomNav.tsx
function BottomNav() {
	return /* @__PURE__ */ jsx("nav", {
		"aria-label": "Primary",
		className: "bottom-nav",
		children: NAV_ITEMS.map(({ to, label, icon, end }) => /* @__PURE__ */ jsxs(NavLink, {
			to,
			end,
			className: ({ isActive }) => `bottom-nav-link${isActive ? " active" : ""}`,
			children: [/* @__PURE__ */ jsx("span", {
				"aria-hidden": true,
				style: { fontSize: "1.1rem" },
				children: icon
			}), /* @__PURE__ */ jsx("span", { children: label })]
		}, to))
	});
}
//#endregion
//#region app/data/priceFormat.ts
function seriesChange(series) {
	if (!series || series.length < 2) return {
		abs: 0,
		pct: 0
	};
	const first = series[0].price;
	const abs = series[series.length - 1].price - first;
	return {
		abs,
		pct: first ? abs / first * 100 : 0
	};
}
function formatPrice(value, currency = "USD") {
	if (value == null || !Number.isFinite(value)) return "—";
	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(value);
	} catch {
		return `$${value.toFixed(2)}`;
	}
}
function formatPercent(value, digits = 2) {
	if (value == null || !Number.isFinite(value)) return "—";
	return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}
function formatRelativeTime(iso) {
	if (!iso) return "never";
	const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1e3));
	if (seconds < 5) return "just now";
	if (seconds < 60) return `${seconds}s ago`;
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.round(hours / 24)}d ago`;
}
//#endregion
//#region app/components/ui/LiveBadge.tsx
function LiveBadge({ live, lastUpdated }) {
	const [, tick] = useState(0);
	useEffect(() => {
		const id = setInterval(() => tick((n) => n + 1), 5e3);
		return () => clearInterval(id);
	}, []);
	return /* @__PURE__ */ jsxs("span", {
		style: {
			display: "inline-flex",
			alignItems: "center",
			gap: 6
		},
		children: [/* @__PURE__ */ jsx("span", {
			style: {
				width: 6,
				height: 6,
				borderRadius: "50%",
				background: live ? "#5fa87c" : "#5a5a5f"
			},
			className: live ? "pulse-dot" : void 0
		}), /* @__PURE__ */ jsxs("span", {
			style: {
				fontFamily: "var(--font-mono)",
				fontSize: "0.78rem",
				color: "#8b8b90"
			},
			children: [
				live ? "LIVE" : "PAUSED",
				" · ",
				formatRelativeTime(lastUpdated)
			]
		})]
	});
}
//#endregion
//#region app/components/ui/ThemeToggle.tsx
function ThemeToggle() {
	const [theme, setTheme] = useState("dark");
	useEffect(() => {
		const initial = window.localStorage.getItem("theme") === "light" ? "light" : "dark";
		setTheme(initial);
		document.documentElement.setAttribute("data-theme", initial);
	}, []);
	const toggle = () => {
		const next = theme === "dark" ? "light" : "dark";
		setTheme(next);
		document.documentElement.setAttribute("data-theme", next);
		window.localStorage.setItem("theme", next);
	};
	return /* @__PURE__ */ jsx("button", {
		"aria-label": "Toggle color mode",
		onClick: toggle,
		className: "icon-btn",
		title: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
		children: theme === "dark" ? "☀" : "☾"
	});
}
//#endregion
//#region app/components/layout/TopBar.tsx
function TopBar({ lastUpdated }) {
	return /* @__PURE__ */ jsxs("header", {
		className: "topbar",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "brand mobile-only",
				children: [/* @__PURE__ */ jsx("span", { className: "brand-mark" }), /* @__PURE__ */ jsx("span", {
					className: "brand-name",
					children: "Crude Signal"
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "desktop-only",
				children: /* @__PURE__ */ jsx(LiveBadge, {
					live: true,
					lastUpdated
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 10
				},
				children: [/* @__PURE__ */ jsx("div", {
					className: "mobile-only",
					children: /* @__PURE__ */ jsx(LiveBadge, {
						live: true,
						lastUpdated
					})
				}), /* @__PURE__ */ jsx(ThemeToggle, {})]
			})
		]
	});
}
//#endregion
//#region app/context/catalog.tsx
var CatalogContext = createContext({
	commodities: [],
	byCode: {},
	isLoading: false
});
function CatalogProvider({ commodities: initialCommodities = [], children }) {
	const { data, error, isLoading } = useLiveData("commodities", {}, {
		live: { enabled: false },
		initialData: initialCommodities.length ? {
			commodities: initialCommodities,
			source: "oilpriceapi"
		} : void 0
	});
	const commodities = data?.commodities ?? initialCommodities;
	const byCode = useMemo(() => Object.fromEntries(commodities.map((commodity) => [commodity.code, commodity])), [commodities]);
	const catalogError = data?.error || (error instanceof Error ? error.message : void 0);
	const value = useMemo(() => ({
		commodities,
		byCode,
		error: catalogError,
		isLoading
	}), [
		commodities,
		byCode,
		catalogError,
		isLoading
	]);
	return /* @__PURE__ */ jsx(CatalogContext.Provider, {
		value,
		children
	});
}
function useCatalog() {
	return useContext(CatalogContext);
}
//#endregion
//#region app/components/layout/TickerTape.tsx
function TickerTape({ codes, colors, initialPrices }) {
	const { byCode } = useCatalog();
	const { data } = useLiveData("latest", { codes }, {
		live: {
			enabled: true,
			intervalMs: 300 * 1e3
		},
		initialData: initialPrices ? {
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			prices: initialPrices
		} : void 0
	});
	if (codes.length === 0) return null;
	const latest = data?.prices ?? {};
	return /* @__PURE__ */ jsx("div", {
		className: "ticker",
		children: /* @__PURE__ */ jsx("div", {
			className: "ticker-track",
			children: [...codes, ...codes].map((code, i) => {
				const meta = byCode[code];
				const point = latest[code];
				return /* @__PURE__ */ jsxs("span", {
					className: "ticker-item",
					children: [
						/* @__PURE__ */ jsx("span", { style: {
							width: 6,
							height: 6,
							borderRadius: "50%",
							background: colors[code],
							display: "inline-block"
						} }),
						meta?.name || code,
						/* @__PURE__ */ jsx("strong", {
							style: { fontFamily: "var(--font-mono)" },
							children: point ? formatPrice(point.price, meta?.currency) : "—"
						})
					]
				}, `${code}-${i}`);
			})
		})
	});
}
//#endregion
//#region app/context/watchlist.tsx
var STORAGE_KEY = "watchlist:codes";
var MAX_SIZE = 6;
var WatchlistContext = createContext(null);
function WatchlistProvider({ children }) {
	const { commodities, byCode } = useCatalog();
	const [codes, setCodes] = useState([]);
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => {
		try {
			const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
			if (Array.isArray(parsed)) setCodes(parsed.filter((code) => typeof code === "string"));
		} catch {}
		setHydrated(true);
	}, []);
	useEffect(() => {
		if (!commodities.length) return;
		setCodes((current) => {
			const valid = current.filter((code) => byCode[code]);
			return valid.length ? valid : commodities.slice(0, 3).map((commodity) => commodity.code);
		});
	}, [commodities, byCode]);
	useEffect(() => {
		if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
	}, [codes, hydrated]);
	const value = useMemo(() => ({
		codes,
		isTracked: (code) => codes.includes(code),
		atLimit: codes.length >= MAX_SIZE,
		maxSize: MAX_SIZE,
		untrack: (code) => setCodes((current) => current.filter((item) => item !== code)),
		toggle: (code) => setCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : current.length >= MAX_SIZE ? current : [...current, code])
	}), [codes]);
	return /* @__PURE__ */ jsx(WatchlistContext.Provider, {
		value,
		children
	});
}
function useWatchlist() {
	const context = useContext(WatchlistContext);
	if (!context) throw new Error("useWatchlist must be used within WatchlistProvider");
	return context;
}
//#endregion
//#region app/data/catalog.ts
var CHART_PALETTE = [
	"#E8672E",
	"#2FBEB0",
	"#E0B23C",
	"#7C9EFF",
	"#E85D9E",
	"#4FD1C5"
];
function buildColorMap(codes) {
	return Object.fromEntries(codes.map((code) => {
		return [code, CHART_PALETTE[[...code].reduce((sum, character) => sum + character.charCodeAt(0), 0) % CHART_PALETTE.length]];
	}));
}
function humanizeCategory(slug) {
	return slug.split("_").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
}
//#endregion
//#region app/routes/_layout.tsx
var _layout_exports = /* @__PURE__ */ __exportAll({
	default: () => _layout_default,
	loader: () => loader$2,
	shouldRevalidate: () => shouldRevalidate
});
async function loader$2({}) {
	let commodities = [];
	let catalogError;
	try {
		commodities = await fetchCommodities();
	} catch (error) {
		catalogError = error instanceof Error ? error.message : "Unable to load the OilPriceAPI catalog.";
	}
	return {
		commodities,
		hasApiKey: isOilPriceApiKeyConfigured(),
		catalogError
	};
}
function shouldRevalidate() {
	return false;
}
var _layout_default = UNSAFE_withComponentProps(function LayoutRoute({ loaderData }) {
	return /* @__PURE__ */ jsx(CatalogProvider, {
		commodities: loaderData.commodities,
		children: /* @__PURE__ */ jsx(WatchlistProvider, { children: /* @__PURE__ */ jsx(Shell, {
			hasApiKey: loaderData.hasApiKey,
			catalogError: loaderData.catalogError
		}) })
	});
});
function Shell({ hasApiKey, catalogError }) {
	const { codes } = useWatchlist();
	const colors = buildColorMap(codes);
	return /* @__PURE__ */ jsxs("div", {
		className: "app-shell",
		children: [
			/* @__PURE__ */ jsx(Sidebar, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "app-main",
				children: [
					/* @__PURE__ */ jsx(TopBar, { lastUpdated: null }),
					!hasApiKey && /* @__PURE__ */ jsxs("div", {
						className: "api-key-banner",
						children: [
							"Running on the free no-key demo feed (latest WTI/Brent/Nat Gas only, refreshed hourly). Set ",
							/* @__PURE__ */ jsx("code", { children: "OILPRICEAPI_KEY" }),
							" in ",
							/* @__PURE__ */ jsx("code", { children: ".env" }),
							" for the live catalog and history."
						]
					}),
					catalogError && /* @__PURE__ */ jsxs("div", {
						className: "api-key-banner",
						children: ["Live catalog unavailable: ", catalogError]
					}),
					/* @__PURE__ */ jsx(TickerTape, {
						codes,
						colors
					}),
					/* @__PURE__ */ jsx("main", {
						className: "app-content",
						children: /* @__PURE__ */ jsx(Outlet, {})
					})
				]
			}),
			/* @__PURE__ */ jsx(BottomNav, {})
		]
	});
}
//#endregion
//#region app/routes/_layout.settings.tsx
var _layout_settings_exports = /* @__PURE__ */ __exportAll({ default: () => _layout_settings_default });
var _layout_settings_default = UNSAFE_withComponentProps(function Settings() {
	const { codes, untrack, maxSize } = useWatchlist();
	const { byCode } = useCatalog();
	const [theme, setTheme] = useState("dark");
	useEffect(() => {
		const stored = window.localStorage.getItem("theme");
		setTheme(stored === "light" ? "light" : "dark");
	}, []);
	const toggleTheme = () => {
		const next = theme === "dark" ? "light" : "dark";
		setTheme(next);
		document.documentElement.setAttribute("data-theme", next);
		window.localStorage.setItem("theme", next);
	};
	return /* @__PURE__ */ jsxs("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			gap: "1.5rem",
			maxWidth: 520
		},
		children: [
			/* @__PURE__ */ jsx("h1", {
				style: { fontSize: "1.5rem" },
				children: "Settings"
			}),
			/* @__PURE__ */ jsx(Section, {
				title: "Appearance",
				children: /* @__PURE__ */ jsxs(Row, { children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					style: {
						fontWeight: 600,
						fontSize: "0.85rem"
					},
					children: "Dark mode"
				}), /* @__PURE__ */ jsx("div", {
					className: "muted",
					style: { fontSize: "0.75rem" },
					children: "Applies across the app, saved to this browser."
				})] }), /* @__PURE__ */ jsx(Switch, {
					checked: theme === "dark",
					onChange: toggleTheme
				})] })
			}),
			/* @__PURE__ */ jsxs(Section, {
				title: "Watchlist",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "muted",
					style: {
						fontSize: "0.8rem",
						marginTop: 0
					},
					children: [
						"Tracking ",
						codes.length,
						"/",
						maxSize,
						". Manage what's tracked here or from the Markets page."
					]
				}), /* @__PURE__ */ jsx("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: 8
					},
					children: codes.map((code) => /* @__PURE__ */ jsxs(Row, { children: [/* @__PURE__ */ jsx("span", {
						style: { fontSize: "0.85rem" },
						children: byCode[code]?.name || code
					}), /* @__PURE__ */ jsx("button", {
						className: "btn btn-outline",
						disabled: codes.length <= 1,
						onClick: () => untrack(code),
						children: "Untrack"
					})] }, code))
				})]
			})
		]
	});
});
function Section({ title, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "card",
		children: [/* @__PURE__ */ jsx("h3", {
			className: "muted",
			style: {
				fontSize: "0.75rem",
				textTransform: "uppercase",
				letterSpacing: "0.04em",
				marginBottom: 10
			},
			children: title
		}), /* @__PURE__ */ jsx("div", {
			style: {
				borderTop: "1px solid var(--border)",
				paddingTop: 12,
				display: "flex",
				flexDirection: "column",
				gap: 10
			},
			children
		})]
	});
}
function Row({ children }) {
	return /* @__PURE__ */ jsx("div", {
		style: {
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center"
		},
		children
	});
}
function Switch({ checked, onChange }) {
	return /* @__PURE__ */ jsx("button", {
		role: "switch",
		"aria-checked": checked,
		onClick: onChange,
		style: {
			width: 38,
			height: 22,
			borderRadius: 999,
			border: "1px solid var(--border)",
			background: checked ? "var(--brand)" : "var(--border)",
			position: "relative",
			cursor: "pointer",
			padding: 0
		},
		children: /* @__PURE__ */ jsx("span", { style: {
			position: "absolute",
			top: 2,
			left: checked ? 18 : 2,
			width: 16,
			height: 16,
			borderRadius: "50%",
			background: "white",
			transition: "left 0.15s ease"
		} })
	});
}
//#endregion
//#region app/components/charts/TrendChart.tsx
function formatPointTime(value) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit"
	}).format(date);
}
function TrendChart({ data, color = "#E8672E", currency = "USD", height = 220 }) {
	const [activeIndex, setActiveIndex] = useState(null);
	const svgRef = useRef(null);
	const gradientId = useId();
	if (!data || data.length < 2) return /* @__PURE__ */ jsx("div", {
		style: {
			height,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			color: "#6b6b70"
		},
		children: "Not enough data"
	});
	const width = 800, padding = 28, prices = data.map((d) => d.price);
	const min = Math.min(...prices), max = Math.max(...prices), range = max - min || 1, innerH = height - padding * 2;
	const points = data.map((d, i) => ({
		x: i / (data.length - 1) * width,
		y: padding + innerH - (d.price - min) / range * innerH
	}));
	const linePath = points.map((point, i) => `${i ? "L" : "M"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
	const areaPath = `${linePath} L ${width} ${height - padding} L 0 ${height - padding} Z`;
	const active = activeIndex === null ? null : {
		point: points[activeIndex],
		data: data[activeIndex]
	};
	const selectFromPointer = (clientX) => {
		const rect = svgRef.current?.getBoundingClientRect();
		if (!rect) return;
		setActiveIndex(Math.max(0, Math.min(data.length - 1, Math.round((clientX - rect.left) / rect.width * (data.length - 1)))));
	};
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
		style: { position: "relative" },
		children: [/* @__PURE__ */ jsxs("svg", {
			ref: svgRef,
			viewBox: `0 0 ${width} ${height}`,
			width: "100%",
			height,
			preserveAspectRatio: "none",
			role: "img",
			"aria-label": "Interactive price trend. Move across the chart to inspect a point.",
			tabIndex: 0,
			onPointerMove: (event) => selectFromPointer(event.clientX),
			onPointerLeave: () => setActiveIndex(null),
			onKeyDown: (event) => {
				if (event.key === "ArrowLeft") setActiveIndex((i) => Math.max(0, (i ?? data.length - 1) - 1));
				if (event.key === "ArrowRight") setActiveIndex((i) => Math.min(data.length - 1, (i ?? -1) + 1));
			},
			children: [
				/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
					id: gradientId,
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "1",
					children: [/* @__PURE__ */ jsx("stop", {
						offset: "0%",
						stopColor: color,
						stopOpacity: .3
					}), /* @__PURE__ */ jsx("stop", {
						offset: "100%",
						stopColor: color,
						stopOpacity: 0
					})]
				}) }),
				[
					.25,
					.5,
					.75
				].map((f) => /* @__PURE__ */ jsx("line", {
					x1: 0,
					x2: width,
					y1: padding + innerH * f,
					y2: padding + innerH * f,
					stroke: "#27272a",
					strokeWidth: 1
				}, f)),
				/* @__PURE__ */ jsx("path", {
					d: areaPath,
					fill: `url(#${gradientId})`,
					stroke: "none"
				}),
				/* @__PURE__ */ jsx("path", {
					d: linePath,
					fill: "none",
					stroke: color,
					strokeWidth: 2
				}),
				active && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("line", {
					x1: active.point.x,
					x2: active.point.x,
					y1: padding,
					y2: height - padding,
					stroke: "#8b8b90",
					strokeDasharray: "4 4"
				}), /* @__PURE__ */ jsx("circle", {
					cx: active.point.x,
					cy: active.point.y,
					r: 5,
					fill: "var(--surface)",
					stroke: color,
					strokeWidth: 2.5
				})] })
			]
		}), active && /* @__PURE__ */ jsxs("div", {
			className: "chart-tooltip",
			style: { left: `${Math.min(88, Math.max(2, active.point.x / width * 100))}%` },
			children: [/* @__PURE__ */ jsx("strong", { children: formatPrice(active.data.price, currency) }), /* @__PURE__ */ jsx("span", { children: formatPointTime(active.data.time) })]
		})]
	}), /* @__PURE__ */ jsxs("div", {
		style: {
			display: "flex",
			justifyContent: "space-between",
			fontSize: "0.75rem",
			color: "#8b8b90",
			marginTop: 4
		},
		children: [/* @__PURE__ */ jsx("span", { children: formatPrice(min, currency) }), /* @__PURE__ */ jsx("span", { children: formatPrice(max, currency) })]
	})] });
}
//#endregion
//#region app/routes/_layout.history.tsx
var _layout_history_exports = /* @__PURE__ */ __exportAll({
	default: () => _layout_history_default,
	loader: () => loader$1
});
var RANGE_OPTIONS = [
	{
		value: "past_day",
		label: "24 hours"
	},
	{
		value: "past_week",
		label: "7 days"
	},
	{
		value: "past_month",
		label: "30 days"
	}
];
async function loader$1({ request }) {
	const url = new URL(request.url);
	return {
		code: url.searchParams.get("code") || "",
		range: url.searchParams.get("range") || "past_month"
	};
}
var _layout_history_default = UNSAFE_withComponentProps(function History({ loaderData }) {
	const { codes } = useWatchlist();
	const { byCode } = useCatalog();
	const submit = useSubmit();
	const navigation = useNavigation();
	const { code, range } = loaderData;
	const selectedCode = code || codes[0] || "";
	const meta = byCode[selectedCode];
	const accent = buildColorMap(codes)[selectedCode] || "#8A97A3";
	const { data, isLoading: isFetching, refresh } = useLiveData("series", {
		code: selectedCode,
		range
	}, { live: { enabled: false } });
	const chartData = data?.data ?? [];
	const errorMessage = data?.error;
	const stats = chartData.length ? {
		high: Math.max(...chartData.map((point) => point.price)),
		low: Math.min(...chartData.map((point) => point.price)),
		avg: chartData.reduce((total, point) => total + point.price, 0) / chartData.length,
		changePct: seriesChange(chartData).pct
	} : null;
	return /* @__PURE__ */ jsxs("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			gap: "1.5rem"
		},
		children: [
			/* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: 12
				},
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					style: { fontSize: "1.5rem" },
					children: "History"
				}), /* @__PURE__ */ jsx("p", {
					className: "muted",
					style: {
						fontSize: "0.85rem",
						marginTop: 4
					},
					children: "The URL is the source of truth; chart data refreshes in the background so changing views stays instant."
				})] }), /* @__PURE__ */ jsxs(Form, {
					method: "get",
					style: {
						display: "flex",
						gap: 8
					},
					onChange: (event) => submit(event.currentTarget),
					children: [/* @__PURE__ */ jsx("select", {
						name: "code",
						defaultValue: selectedCode,
						children: codes.map((value) => /* @__PURE__ */ jsx("option", {
							value,
							children: byCode[value]?.name || value
						}, value))
					}), /* @__PURE__ */ jsx("select", {
						name: "range",
						defaultValue: range,
						children: RANGE_OPTIONS.map((option) => /* @__PURE__ */ jsx("option", {
							value: option.value,
							children: option.label
						}, option.value))
					})]
				})]
			}),
			stats && /* @__PURE__ */ jsxs("div", {
				className: "grid grid-stats",
				style: { gridTemplateColumns: "repeat(2, 1fr)" },
				children: [
					/* @__PURE__ */ jsx(StatBlock, {
						label: "High",
						value: formatPrice(stats.high, meta?.currency)
					}),
					/* @__PURE__ */ jsx(StatBlock, {
						label: "Low",
						value: formatPrice(stats.low, meta?.currency)
					}),
					/* @__PURE__ */ jsx(StatBlock, {
						label: "Average",
						value: formatPrice(stats.avg, meta?.currency)
					}),
					/* @__PURE__ */ jsx(StatBlock, {
						label: "Change",
						value: formatPercent(stats.changePct),
						tone: stats.changePct >= 0 ? "up" : "down"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "card",
				style: { opacity: navigation.state !== "idle" ? .6 : 1 },
				children: [/* @__PURE__ */ jsxs("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: 12,
						marginBottom: 16
					},
					children: [/* @__PURE__ */ jsxs("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 8
						},
						children: [/* @__PURE__ */ jsx("span", { style: {
							width: 8,
							height: 8,
							borderRadius: "50%",
							background: accent
						} }), /* @__PURE__ */ jsxs("h3", {
							style: { fontSize: "1rem" },
							children: [
								meta?.name || selectedCode,
								" — ",
								RANGE_OPTIONS.find((option) => option.value === range)?.label
							]
						})]
					}), /* @__PURE__ */ jsxs("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 10
						},
						children: [/* @__PURE__ */ jsx("span", {
							className: "mono muted",
							style: { fontSize: "0.72rem" },
							children: "ON DEMAND"
						}), /* @__PURE__ */ jsx("button", {
							className: "btn btn-outline",
							onClick: () => refresh(),
							disabled: isFetching,
							children: isFetching ? "Refreshing..." : "Refresh"
						})]
					})]
				}), errorMessage ? /* @__PURE__ */ jsx("p", {
					className: "muted",
					style: { fontSize: "0.85rem" },
					children: errorMessage
				}) : /* @__PURE__ */ jsx(TrendChart, {
					data: chartData,
					color: accent,
					currency: meta?.currency,
					height: 320
				})]
			})
		]
	});
});
function StatBlock({ label, value, tone }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "card",
		children: [/* @__PURE__ */ jsx("div", {
			className: "muted",
			style: {
				fontSize: "0.72rem",
				marginBottom: 4
			},
			children: label
		}), /* @__PURE__ */ jsx("div", {
			className: "mono",
			style: {
				fontWeight: 700,
				fontSize: "1.05rem",
				color: tone === "up" ? "#5fa87c" : tone === "down" ? "#c96b6b" : void 0
			},
			children: value
		})]
	});
}
//#endregion
//#region app/components/commodities/CategoryTabs.tsx
function CategoryTabs({ categories, active, onChange }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "category-tabs",
		children: [/* @__PURE__ */ jsx("button", {
			className: `pill${active === null ? " active" : ""}`,
			onClick: () => onChange(null),
			children: "All"
		}), categories.map((cat) => /* @__PURE__ */ jsx("button", {
			className: `pill${active === cat ? " active" : ""}`,
			onClick: () => onChange(cat),
			children: humanizeCategory(cat)
		}, cat))]
	});
}
//#endregion
//#region app/components/commodities/CommodityCard.tsx
function CommodityCard({ commodity, tracked, disabled, disabledReason, onToggle }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "card",
		style: { borderColor: tracked ? "#8f5432" : void 0 },
		children: [
			/* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "start",
					marginBottom: 6
				},
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					style: {
						fontWeight: 600,
						fontSize: "0.9rem"
					},
					children: commodity.name
				}), /* @__PURE__ */ jsx("div", {
					style: {
						fontFamily: "var(--font-mono)",
						fontSize: "0.75rem",
						color: "#8b8b90"
					},
					children: commodity.code
				})] }), /* @__PURE__ */ jsx("span", {
					className: "badge",
					children: humanizeCategory(commodity.category)
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				style: {
					fontSize: "0.78rem",
					color: "#8b8b90",
					minHeight: 34,
					marginTop: 0
				},
				children: commodity.description
			}),
			/* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					paddingTop: 4,
					gap: 6
				},
				children: [
					/* @__PURE__ */ jsxs("span", {
						style: {
							fontSize: "0.68rem",
							color: "#8b8b90",
							fontFamily: "var(--font-mono)"
						},
						children: ["per ", commodity.unit]
					}),
					commodity.updateFrequency && /* @__PURE__ */ jsx("span", {
						className: "badge",
						children: commodity.updateFrequency
					}),
					/* @__PURE__ */ jsx("button", {
						className: `btn${tracked ? " btn-outline" : ""}`,
						onClick: onToggle,
						disabled,
						title: disabled ? disabledReason : void 0,
						children: tracked ? "− Untrack" : "+ Track"
					})
				]
			})
		]
	});
}
//#endregion
//#region app/routes/_layout.markets.tsx
var _layout_markets_exports = /* @__PURE__ */ __exportAll({ default: () => _layout_markets_default });
var _layout_markets_default = UNSAFE_withComponentProps(function Markets() {
	const [category, setCategory] = useState(null);
	const [search, setSearch] = useState("");
	const { codes, isTracked, toggle, atLimit, maxSize } = useWatchlist();
	const { commodities, error, isLoading } = useCatalog();
	const categories = useMemo(() => Array.from(new Set(commodities.map((c) => c.category))).sort(), [commodities]);
	const filtered = useMemo(() => {
		let list = commodities;
		if (category) list = list.filter((c) => c.category === category);
		if (search.trim()) {
			const q = search.trim().toLowerCase();
			list = list.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
		}
		return list;
	}, [
		category,
		search,
		commodities
	]);
	return /* @__PURE__ */ jsxs("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			gap: "1.75rem"
		},
		children: [/* @__PURE__ */ jsxs("div", { children: [
			/* @__PURE__ */ jsx("h1", {
				style: { fontSize: "1.5rem" },
				children: "Markets"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "muted",
				style: {
					fontSize: "0.85rem",
					marginTop: 4
				},
				children: "A live, searchable catalog from OilPriceAPI. Track any instrument to add it to your dashboard."
			}),
			isLoading && /* @__PURE__ */ jsx("p", {
				className: "muted",
				style: { fontSize: "0.8rem" },
				children: "Loading live catalog..."
			}),
			error && /* @__PURE__ */ jsxs("p", {
				className: "muted",
				style: { fontSize: "0.8rem" },
				children: ["Live catalog unavailable: ", error]
			})
		] }), /* @__PURE__ */ jsxs("div", { children: [
			/* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "end",
					flexWrap: "wrap",
					gap: 10,
					marginBottom: 12
				},
				children: [/* @__PURE__ */ jsxs("p", {
					className: "muted",
					style: {
						fontSize: "0.8rem",
						margin: 0
					},
					children: [
						commodities.length,
						" commodities available · tracking ",
						codes.length,
						"/",
						maxSize
					]
				}), /* @__PURE__ */ jsx("input", {
					placeholder: "Search commodities...",
					value: search,
					onChange: (e) => setSearch(e.target.value),
					style: { width: 220 }
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				style: { marginBottom: 16 },
				children: /* @__PURE__ */ jsx(CategoryTabs, {
					categories,
					active: category,
					onChange: setCategory
				})
			}),
			filtered.length === 0 && /* @__PURE__ */ jsx("p", {
				className: "muted",
				style: { fontSize: "0.85rem" },
				children: "No commodities match that search."
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-3",
				children: filtered.map((commodity) => {
					const tracked = isTracked(commodity.code);
					return /* @__PURE__ */ jsx(CommodityCard, {
						commodity,
						tracked,
						disabled: tracked ? codes.length <= 1 : atLimit,
						disabledReason: tracked ? "Keep at least one commodity tracked" : `You're tracking ${maxSize}/${maxSize} — untrack one to add another`,
						onToggle: () => toggle(commodity.code)
					}, commodity.code);
				})
			})
		] })]
	});
});
//#endregion
//#region app/components/charts/Sparkline.tsx
function Sparkline({ data, color = "#8A97A3", height = 44 }) {
	if (!data || data.length < 2) return /* @__PURE__ */ jsx("div", { style: { height } });
	const width = 240;
	const prices = data.map((d) => d.price);
	const min = Math.min(...prices);
	const range = Math.max(...prices) - min || 1;
	const linePath = data.map((d, i) => {
		return [i / (data.length - 1) * width, height - (d.price - min) / range * height];
	}).map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
	const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
	const gradientId = `spark-${color.replace("#", "")}`;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: `0 0 ${width} ${height}`,
		width: "100%",
		height,
		preserveAspectRatio: "none",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
				id: gradientId,
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ jsx("stop", {
					offset: "0%",
					stopColor: color,
					stopOpacity: .35
				}), /* @__PURE__ */ jsx("stop", {
					offset: "100%",
					stopColor: color,
					stopOpacity: 0
				})]
			}) }),
			/* @__PURE__ */ jsx("path", {
				d: areaPath,
				fill: `url(#${gradientId})`,
				stroke: "none"
			}),
			/* @__PURE__ */ jsx("path", {
				d: linePath,
				fill: "none",
				stroke: color,
				strokeWidth: 1.75
			})
		]
	});
}
//#endregion
//#region app/components/ui/StatCard.tsx
function StatCard({ label, price, currency, unit, changePct, sparkline, accent, isActive, onClick, onRemove, note }) {
	const up = (changePct ?? 0) >= 0;
	return /* @__PURE__ */ jsxs("div", {
		onClick,
		role: onClick ? "button" : void 0,
		tabIndex: onClick ? 0 : void 0,
		className: "card",
		style: {
			position: "relative",
			borderColor: isActive ? accent : void 0,
			background: isActive ? `${accent}0f` : void 0,
			cursor: onClick ? "pointer" : void 0,
			textAlign: "left"
		},
		children: [
			onRemove && /* @__PURE__ */ jsx("button", {
				"aria-label": `Stop tracking ${label}`,
				onClick: (e) => {
					e.stopPropagation();
					onRemove();
				},
				className: "icon-btn",
				style: {
					position: "absolute",
					top: 10,
					right: 10
				},
				children: "✕"
			}),
			/* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "start",
					marginBottom: 4,
					paddingRight: onRemove ? 24 : 0
				},
				children: [/* @__PURE__ */ jsxs("span", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: 8
					},
					children: [/* @__PURE__ */ jsx("span", { style: {
						width: 8,
						height: 8,
						borderRadius: "50%",
						background: accent,
						flexShrink: 0
					} }), /* @__PURE__ */ jsx("span", {
						style: {
							fontWeight: 600,
							fontSize: "0.85rem",
							color: "#8b8b90"
						},
						children: label
					})]
				}), changePct != null && /* @__PURE__ */ jsxs("span", {
					style: {
						fontFamily: "var(--font-mono)",
						fontSize: "0.75rem",
						fontWeight: 600,
						color: up ? "#5fa87c" : "#c96b6b",
						display: "flex",
						alignItems: "center",
						gap: 2
					},
					children: [
						up ? "▲" : "▼",
						" ",
						formatPercent(changePct)
					]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				style: {
					fontFamily: "var(--font-mono)",
					fontWeight: 700,
					fontSize: "1.5rem",
					lineHeight: 1.2
				},
				children: formatPrice(price, currency)
			}),
			/* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					marginBottom: 8
				},
				children: [/* @__PURE__ */ jsxs("span", {
					style: {
						fontSize: "0.75rem",
						color: "#8b8b90"
					},
					children: ["per ", unit || "unit"]
				}), isActive && /* @__PURE__ */ jsx("span", {
					style: {
						fontSize: "0.65rem",
						fontWeight: 700,
						letterSpacing: "0.04em",
						textTransform: "uppercase",
						color: accent
					},
					children: "Charting"
				})]
			}),
			/* @__PURE__ */ jsx(Sparkline, {
				data: sparkline,
				color: accent
			}),
			note && /* @__PURE__ */ jsx("p", {
				style: {
					fontSize: "0.68rem",
					color: "#c96b6b",
					marginTop: 6,
					marginBottom: 0
				},
				children: note
			})
		]
	});
}
//#endregion
//#region app/routes/_layout._index.tsx
var _layout__index_exports = /* @__PURE__ */ __exportAll({
	default: () => _layout__index_default,
	loader: () => loader
});
async function loader({}) {
	return { series: {} };
}
var _layout__index_default = UNSAFE_withComponentProps(function Dashboard({ loaderData }) {
	const { codes, untrack } = useWatchlist();
	const { byCode } = useCatalog();
	const colorMap = buildColorMap(codes);
	const [focused, setFocused] = useState(codes[0]);
	useEffect(() => {
		if (!codes.includes(focused)) setFocused(codes[0]);
	}, [codes, focused]);
	if (!codes.length) return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
		style: { fontSize: "1.5rem" },
		children: "Dashboard"
	}), /* @__PURE__ */ jsx("p", {
		className: "muted",
		children: "Waiting for the live OilPriceAPI catalog."
	})] });
	return /* @__PURE__ */ jsxs("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			gap: "1.5rem"
		},
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
				style: { fontSize: "1.5rem" },
				children: "Dashboard"
			}), /* @__PURE__ */ jsx("p", {
				className: "muted",
				style: {
					fontSize: "0.85rem",
					marginTop: 4
				},
				children: "Each card polls OilPriceAPI every 2 minutes. The focused chart below polls faster (60s) — they share one cached fetch per commodity, so tracking both isn't double the requests. Intervals are deliberately conservative to fit a free-tier quota (200 requests/month)."
			})] }),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-3",
				children: codes.map((code) => /* @__PURE__ */ jsx(LiveStatCard, {
					code,
					accent: colorMap[code] || "#8A97A3",
					isFocused: focused === code,
					onFocus: () => setFocused(code),
					onRemove: codes.length > 1 ? () => untrack(code) : void 0,
					initialSeries: loaderData.series[code],
					meta: byCode[code]
				}, code))
			}),
			/* @__PURE__ */ jsx(FocusedChart, {
				code: focused,
				accent: colorMap[focused] || "#8A97A3",
				initialSeries: loaderData.series[focused],
				meta: byCode[focused]
			})
		]
	});
});
function LiveStatCard({ code, accent, isFocused, onFocus, onRemove, initialSeries, meta }) {
	const { data, error } = useLiveData("series", {
		code,
		range: "past_day"
	}, {
		live: {
			enabled: true,
			intervalMs: 120 * 1e3
		},
		initialData: initialSeries ? {
			code,
			range: "past_day",
			data: initialSeries
		} : void 0
	});
	const series = data?.data;
	const change = seriesChange(series);
	const last = series?.[series.length - 1];
	const errorMessage = data?.error || (error instanceof Error ? error.message : void 0);
	return /* @__PURE__ */ jsx(StatCard, {
		label: meta?.name || code,
		accent,
		price: last?.price,
		currency: meta?.currency,
		unit: meta?.unit,
		changePct: series?.length ? change.pct : null,
		sparkline: series,
		isActive: isFocused,
		onClick: onFocus,
		onRemove,
		note: errorMessage
	});
}
function FocusedChart({ code, accent, initialSeries, meta }) {
	const { data, error, lastUpdated } = useLiveData("series", {
		code,
		range: "past_day"
	}, {
		live: {
			enabled: true,
			intervalMs: 60 * 1e3
		},
		initialData: initialSeries ? {
			code,
			range: "past_day",
			data: initialSeries
		} : void 0
	});
	const errorMessage = data?.error || (error instanceof Error ? error.message : void 0);
	return /* @__PURE__ */ jsxs("div", {
		className: "card",
		children: [/* @__PURE__ */ jsxs("div", {
			style: {
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				flexWrap: "wrap",
				gap: 12,
				marginBottom: 12
			},
			children: [/* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 8
				},
				children: [/* @__PURE__ */ jsx("span", { style: {
					width: 8,
					height: 8,
					borderRadius: "50%",
					background: accent
				} }), /* @__PURE__ */ jsxs("h3", {
					style: { fontSize: "1rem" },
					children: [meta?.name || code, " trend"]
				})]
			}), /* @__PURE__ */ jsx(LiveBadge, {
				live: true,
				lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : null
			})]
		}), errorMessage ? /* @__PURE__ */ jsx("p", {
			className: "muted",
			style: { fontSize: "0.8rem" },
			children: errorMessage
		}) : /* @__PURE__ */ jsx(TrendChart, {
			data: data?.data,
			color: accent,
			currency: meta?.currency
		})]
	});
}
//#endregion
//#region \0virtual:react-router/server-manifest
var server_manifest_default = {
	"entry": {
		"module": "/assets/entry.client-CDGwW0Z7.js",
		"imports": ["/assets/jsx-runtime-DTtwqBT8.js", "/assets/errorBoundaries-DOl9lQkM.js"],
		"css": []
	},
	"routes": {
		"root": {
			"id": "root",
			"parentId": void 0,
			"path": "",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": true,
			"module": "/assets/root-Hekx4p2n.js",
			"imports": [
				"/assets/jsx-runtime-DTtwqBT8.js",
				"/assets/errorBoundaries-DOl9lQkM.js",
				"/assets/lib-ChYhUxQr.js",
				"/assets/dataProvider-D4DgfuRd.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/resources.commodities": {
			"id": "routes/resources.commodities",
			"parentId": "root",
			"path": "resources/commodities",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": false,
			"hasErrorBoundary": false,
			"module": "/assets/resources.commodities-BvRk9kiK.js",
			"imports": [],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/resources.latest": {
			"id": "routes/resources.latest",
			"parentId": "root",
			"path": "resources/latest",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": false,
			"hasErrorBoundary": false,
			"module": "/assets/resources.latest-BvRk9kiK.js",
			"imports": [],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/resources.series": {
			"id": "routes/resources.series",
			"parentId": "root",
			"path": "resources/series",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": false,
			"hasErrorBoundary": false,
			"module": "/assets/resources.series-BvRk9kiK.js",
			"imports": [],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/_layout": {
			"id": "routes/_layout",
			"parentId": "root",
			"path": void 0,
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/_layout-0nBnLpU_.js",
			"imports": [
				"/assets/jsx-runtime-DTtwqBT8.js",
				"/assets/lib-ChYhUxQr.js",
				"/assets/dataProvider-D4DgfuRd.js",
				"/assets/priceFormat-Ct-rlSGV.js",
				"/assets/LiveBadge-zhftmByq.js",
				"/assets/watchlist-CGoPXEaI.js",
				"/assets/catalog-CvRidDoR.js",
				"/assets/errorBoundaries-DOl9lQkM.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/_layout.settings": {
			"id": "routes/_layout.settings",
			"parentId": "routes/_layout",
			"path": "settings",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/_layout.settings-D2uE8W5Q.js",
			"imports": [
				"/assets/jsx-runtime-DTtwqBT8.js",
				"/assets/watchlist-CGoPXEaI.js",
				"/assets/dataProvider-D4DgfuRd.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/_layout.history": {
			"id": "routes/_layout.history",
			"parentId": "routes/_layout",
			"path": "history",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/_layout.history--BbZ8z7h.js",
			"imports": [
				"/assets/jsx-runtime-DTtwqBT8.js",
				"/assets/lib-ChYhUxQr.js",
				"/assets/dataProvider-D4DgfuRd.js",
				"/assets/priceFormat-Ct-rlSGV.js",
				"/assets/watchlist-CGoPXEaI.js",
				"/assets/catalog-CvRidDoR.js",
				"/assets/TrendChart-B1b7Mtol.js",
				"/assets/errorBoundaries-DOl9lQkM.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/_layout.markets": {
			"id": "routes/_layout.markets",
			"parentId": "routes/_layout",
			"path": "markets",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/_layout.markets-C1HWNryi.js",
			"imports": [
				"/assets/jsx-runtime-DTtwqBT8.js",
				"/assets/watchlist-CGoPXEaI.js",
				"/assets/catalog-CvRidDoR.js",
				"/assets/dataProvider-D4DgfuRd.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/_layout._index": {
			"id": "routes/_layout._index",
			"parentId": "routes/_layout",
			"path": void 0,
			"index": true,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/_layout._index-Ca_izj2o.js",
			"imports": [
				"/assets/jsx-runtime-DTtwqBT8.js",
				"/assets/dataProvider-D4DgfuRd.js",
				"/assets/priceFormat-Ct-rlSGV.js",
				"/assets/LiveBadge-zhftmByq.js",
				"/assets/watchlist-CGoPXEaI.js",
				"/assets/catalog-CvRidDoR.js",
				"/assets/TrendChart-B1b7Mtol.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		}
	},
	"url": "/assets/manifest-5de906e9.js",
	"version": "5de906e9",
	"sri": void 0
};
//#endregion
//#region \0virtual:react-router/server-build
var assetsBuildDirectory = "build\\client";
var basename = "/";
var future = {
	"unstable_enableNodeReadableStream": false,
	"unstable_optimizeDeps": false
};
var ssr = true;
var isSpaMode = false;
var prerender = [];
var routeDiscovery = {
	"mode": "lazy",
	"manifestPath": "/__manifest"
};
var publicPath = "/";
var entry = { module: entry_server_exports };
var routes = {
	"root": {
		id: "root",
		parentId: void 0,
		path: "",
		index: void 0,
		caseSensitive: void 0,
		module: root_exports
	},
	"routes/resources.commodities": {
		id: "routes/resources.commodities",
		parentId: "root",
		path: "resources/commodities",
		index: void 0,
		caseSensitive: void 0,
		module: resources_commodities_exports
	},
	"routes/resources.latest": {
		id: "routes/resources.latest",
		parentId: "root",
		path: "resources/latest",
		index: void 0,
		caseSensitive: void 0,
		module: resources_latest_exports
	},
	"routes/resources.series": {
		id: "routes/resources.series",
		parentId: "root",
		path: "resources/series",
		index: void 0,
		caseSensitive: void 0,
		module: resources_series_exports
	},
	"routes/_layout": {
		id: "routes/_layout",
		parentId: "root",
		path: void 0,
		index: void 0,
		caseSensitive: void 0,
		module: _layout_exports
	},
	"routes/_layout.settings": {
		id: "routes/_layout.settings",
		parentId: "routes/_layout",
		path: "settings",
		index: void 0,
		caseSensitive: void 0,
		module: _layout_settings_exports
	},
	"routes/_layout.history": {
		id: "routes/_layout.history",
		parentId: "routes/_layout",
		path: "history",
		index: void 0,
		caseSensitive: void 0,
		module: _layout_history_exports
	},
	"routes/_layout.markets": {
		id: "routes/_layout.markets",
		parentId: "routes/_layout",
		path: "markets",
		index: void 0,
		caseSensitive: void 0,
		module: _layout_markets_exports
	},
	"routes/_layout._index": {
		id: "routes/_layout._index",
		parentId: "routes/_layout",
		path: void 0,
		index: true,
		caseSensitive: void 0,
		module: _layout__index_exports
	}
};
var allowedActionOrigins = false;
//#endregion
export { allowedActionOrigins, server_manifest_default as assets, assetsBuildDirectory, basename, entry, future, isSpaMode, prerender, publicPath, routeDiscovery, routes, ssr };
