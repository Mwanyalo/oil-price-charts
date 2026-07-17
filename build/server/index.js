import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { Form, Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration, ServerRouter, UNSAFE_withComponentProps, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, useNavigation, useSubmit } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { jsx, jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
			/* @__PURE__ */ jsx("title", { children: "Oil Prices" }),
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
	return /* @__PURE__ */ jsx(Outlet, {});
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
  .ticker-track { display: flex; gap: 2rem; padding: 0.5rem 1.5rem; white-space: nowrap; animation: ticker-scroll 30s linear infinite; width: max-content; }
  .ticker-item { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-muted); }
  @keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 1rem 1.1rem; }
  .icon-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.9rem; padding: 4px 6px; border-radius: 4px; transition: color 0.2s; }
  .icon-btn:hover { color: var(--text-primary); }

  .btn { font-family: var(--font-body); font-weight: 600; font-size: 0.78rem; padding: 0.35rem 0.7rem; border-radius: 4px; border: 1px solid var(--brand); background: var(--brand); color: white; cursor: pointer; transition: opacity 0.2s; }
  .btn:hover { opacity: 0.9; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-outline { background: transparent; color: var(--text-primary); border-color: var(--border); }

  .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; background: transparent; color: var(--text-muted); border: 1px solid var(--border); font-size: 0.65rem; font-weight: 600; white-space: nowrap; }

  .pill { border-radius: 4px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-size: 0.8rem; font-weight: 600; padding: 0.4rem 0.9rem; cursor: pointer; flex-shrink: 0; transition: all 0.2s; }
  .pill:hover { border-color: var(--text-primary); color: var(--text-primary); }
  .pill.active { background: var(--text-primary); color: var(--canvas); border-color: var(--text-primary); }
  .category-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }

  .grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
  @media (min-width: 640px) { .grid-2 { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 640px) { .grid-stats { grid-template-columns: repeat(4, 1fr); } }

  .muted { color: var(--text-muted); }
  .mono { font-family: var(--font-mono); }
  select, input { font-family: var(--font-body); background: var(--surface); color: var(--text-primary); border: 1px solid var(--border); border-radius: 6px; padding: 0.35rem 0.6rem; font-size: 0.82rem; }

  .pulse-dot { animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
`;
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
//#region app/data/utils.ts
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
		return `${value.toFixed(2)} ${currency}`;
	}
}
function formatPercent(value) {
	if (value == null || !Number.isFinite(value)) return "—";
	return `${value >= 0 ? "" : ""}${Math.abs(value).toFixed(2)}%`;
}
function formatRelativeTime(iso) {
	if (!iso) return "never";
	try {
		const date = new Date(iso);
		const ms = Date.now() - date.getTime();
		const sec = Math.floor(ms / 1e3);
		const min = Math.floor(sec / 60);
		const hr = Math.floor(min / 60);
		if (sec < 60) return `${sec}s ago`;
		if (min < 60) return `${min}m ago`;
		if (hr < 24) return `${hr}h ago`;
		return `${Math.floor(hr / 24)}d ago`;
	} catch {
		return "—";
	}
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
					children: "Oil Prices"
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
//#region app/data/catalog.ts
var CATALOG = [
	{
		code: "WTI_USD",
		name: "Crude Oil (WTI)",
		category: "energy",
		currency: "USD",
		unit: "barrel",
		update_frequency: "every 20s",
		description: "US benchmark crude, priced for delivery at Cushing, OK."
	},
	{
		code: "BRENT_CRUDE_USD",
		name: "Crude Oil (Brent)",
		category: "energy",
		currency: "USD",
		unit: "barrel",
		update_frequency: "every 20s",
		description: "North Sea benchmark used to price ~2/3 of global crude."
	},
	{
		code: "NATGAS_USD",
		name: "Natural Gas",
		category: "energy",
		currency: "USD",
		unit: "MMBtu",
		update_frequency: "every 20s",
		description: "Henry Hub natural gas futures reference price."
	},
	{
		code: "GOLD_USD",
		name: "Gold",
		category: "metals",
		currency: "USD",
		unit: "troy oz",
		update_frequency: "every 20s",
		description: "Spot gold, the classic macro safe-haven asset."
	},
	{
		code: "SILVER_USD",
		name: "Silver",
		category: "metals",
		currency: "USD",
		unit: "troy oz",
		update_frequency: "every 20s",
		description: "Spot silver, industrial + precious metal demand mix."
	},
	{
		code: "COPPER_USD",
		name: "Copper",
		category: "metals",
		currency: "USD",
		unit: "lb",
		update_frequency: "every 20s",
		description: "Industrial bellwether, tracks global construction demand."
	},
	{
		code: "WHEAT_USD",
		name: "Wheat",
		category: "agriculture",
		currency: "USD",
		unit: "bushel",
		update_frequency: "every 20s",
		description: "Chicago wheat futures, a global food-price benchmark."
	},
	{
		code: "CORN_USD",
		name: "Corn",
		category: "agriculture",
		currency: "USD",
		unit: "bushel",
		update_frequency: "every 20s",
		description: "Chicago corn futures, feed and ethanol demand driver."
	}
];
var CATALOG_BY_CODE = Object.fromEntries(CATALOG.map((c) => [c.code, c]));
var DEFAULT_WATCHLIST = [
	"WTI_USD",
	"BRENT_CRUDE_USD",
	"NATGAS_USD"
];
var CHART_PALETTE = [
	"#E8672E",
	"#2FBEB0",
	"#E0B23C",
	"#7C9EFF",
	"#E85D9E",
	"#4FD1C5",
	"#C6A15B",
	"#9AA7B4"
];
function buildColorMap(codes) {
	const map = {};
	codes.forEach((code) => {
		const idx = CATALOG.findIndex((c) => c.code === code);
		map[code] = CHART_PALETTE[(idx >= 0 ? idx : 0) % CHART_PALETTE.length];
	});
	return map;
}
function humanizeCategory(slug) {
	return slug.split("_").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}
//#endregion
//#region app/components/layout/TickerTape.tsx
function TickerTape({ codes, latest, colors }) {
	if (codes.length === 0) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "ticker",
		children: /* @__PURE__ */ jsx("div", {
			className: "ticker-track",
			children: [...codes, ...codes].map((code, i) => {
				const meta = CATALOG_BY_CODE[code];
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
	const [codes, setCodes] = useState(DEFAULT_WATCHLIST);
	useEffect(() => {
		try {
			const raw = window.localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed) && parsed.length > 0) setCodes(parsed);
			}
		} catch {}
	}, []);
	useEffect(() => {
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
		} catch {}
	}, [codes]);
	const value = useMemo(() => {
		const isTracked = (code) => codes.includes(code);
		return {
			codes,
			isTracked,
			atLimit: codes.length >= MAX_SIZE,
			maxSize: MAX_SIZE,
			untrack: (code) => setCodes((prev) => prev.length > 1 ? prev.filter((c) => c !== code) : prev),
			toggle: (code) => setCodes((prev) => {
				if (prev.includes(code)) return prev.length > 1 ? prev.filter((c) => c !== code) : prev;
				if (prev.length >= MAX_SIZE) return prev;
				return [...prev, code];
			})
		};
	}, [codes]);
	return /* @__PURE__ */ jsx(WatchlistContext.Provider, {
		value,
		children
	});
}
function useWatchlist() {
	const ctx = useContext(WatchlistContext);
	if (!ctx) throw new Error("useWatchlist must be used within WatchlistProvider");
	return ctx;
}
//#endregion
//#region app/routes/_layout.tsx
var _layout_exports = /* @__PURE__ */ __exportAll({
	default: () => _layout_default,
	loader: () => loader$3
});
async function loader$3({}) {
	const latestByCode = {};
	for (const c of CATALOG) latestByCode[c.code] = {
		time: (/* @__PURE__ */ new Date()).toISOString(),
		price: 0
	};
	return {
		latestByCode,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
var _layout_default = UNSAFE_withComponentProps(function LayoutRoute({ loaderData }) {
	return /* @__PURE__ */ jsx(WatchlistProvider, { children: /* @__PURE__ */ jsx(Shell, {
		latestByCode: loaderData.latestByCode,
		updatedAt: loaderData.updatedAt
	}) });
});
function Shell({ latestByCode, updatedAt }) {
	const { codes } = useWatchlist();
	const colors = buildColorMap(codes);
	return /* @__PURE__ */ jsxs("div", {
		className: "app-shell",
		children: [
			/* @__PURE__ */ jsx(Sidebar, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "app-main",
				children: [
					/* @__PURE__ */ jsx(TopBar, { lastUpdated: updatedAt }),
					/* @__PURE__ */ jsx(TickerTape, {
						codes,
						latest: latestByCode,
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
						children: CATALOG_BY_CODE[code]?.name || code
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
function TrendChart({ data, color = "#E8672E", currency = "USD", height = 220 }) {
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
	const width = 800;
	const padding = 28;
	const prices = data.map((d) => d.price);
	const min = Math.min(...prices);
	const max = Math.max(...prices);
	const range = max - min || 1;
	const innerH = height - padding * 2;
	const linePath = data.map((d, i) => {
		return [i / (data.length - 1) * width, padding + innerH - (d.price - min) / range * innerH];
	}).map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
	const areaPath = `${linePath} L ${width} ${height - padding} L 0 ${height - padding} Z`;
	const gradientId = `trend-${color.replace("#", "")}`;
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("svg", {
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
			})
		]
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
process.env.VITE_OILPRICE_API_KEY;
process.env.VITE_BASE_API;
/**
* Calculate the change (absolute and percentage) in a price series
*/
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
//#endregion
//#region app/routes/_layout.history.tsx
var _layout_history_exports = /* @__PURE__ */ __exportAll({
	default: () => _layout_history_default,
	loader: () => loader$2
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
async function loader$2({ request }) {
	const url = new URL(request.url);
	return {
		code: url.searchParams.get("code") || DEFAULT_WATCHLIST[0],
		range: url.searchParams.get("range") || "past_month",
		data: [],
		stats: {
			high: 0,
			low: 0,
			avg: 0,
			changePct: 0
		}
	};
}
var _layout_history_default = UNSAFE_withComponentProps(function History({ loaderData }) {
	const { codes } = useWatchlist();
	const submit = useSubmit();
	const navigation = useNavigation();
	const colorMap = buildColorMap(codes);
	const { code, range } = loaderData;
	const [data, setData] = useState(loaderData.data);
	const [stats, setStats] = useState(loaderData.stats);
	const [isApiError, setIsApiError] = useState(false);
	const meta = CATALOG_BY_CODE[code];
	const accent = colorMap[code] || "#8A97A3";
	const isLoading = navigation.state !== "idle" || data.length === 0;
	useEffect(() => {
		async function fetchData() {
			try {
				setIsApiError(false);
				setIsApiError(true);
				return;
			} catch (err) {
				console.warn("Failed to fetch history data:", err);
				setIsApiError(true);
			}
		}
		fetchData();
	}, [code, range]);
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
					children: "A single server fetch per selection — the URL is the source of truth, so this page works without JavaScript too."
				})] }), /* @__PURE__ */ jsxs(Form, {
					method: "get",
					style: {
						display: "flex",
						gap: 8
					},
					onChange: (e) => submit(e.currentTarget),
					children: [/* @__PURE__ */ jsx("select", {
						name: "code",
						defaultValue: code,
						children: (codes.length ? codes : DEFAULT_WATCHLIST).map((c) => /* @__PURE__ */ jsx("option", {
							value: c,
							children: CATALOG_BY_CODE[c]?.name || c
						}, c))
					}), /* @__PURE__ */ jsx("select", {
						name: "range",
						defaultValue: range,
						children: RANGE_OPTIONS.map((r) => /* @__PURE__ */ jsx("option", {
							value: r.value,
							children: r.label
						}, r.value))
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
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
				style: { opacity: isLoading ? .6 : 1 },
				children: [/* @__PURE__ */ jsxs("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: 8,
						marginBottom: 16
					},
					children: [/* @__PURE__ */ jsx("span", { style: {
						width: 8,
						height: 8,
						borderRadius: "50%",
						background: accent
					} }), /* @__PURE__ */ jsxs("h3", {
						style: { fontSize: "1rem" },
						children: [
							meta?.name || code,
							" —",
							" ",
							RANGE_OPTIONS.find((r) => r.value === range)?.label
						]
					})]
				}), /* @__PURE__ */ jsx(TrendChart, {
					data,
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
function CommodityCard({ commodity, tracked, disabled, disabledReason, latestPrice, onToggle }) {
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
			latestPrice != null ? /* @__PURE__ */ jsx("div", {
				style: {
					fontFamily: "var(--font-mono)",
					fontWeight: 700,
					fontSize: "1.1rem",
					marginBottom: 8
				},
				children: formatPrice(latestPrice, commodity.currency)
			}) : /* @__PURE__ */ jsx("p", {
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
					paddingTop: 4
				},
				children: [/* @__PURE__ */ jsxs("span", {
					style: {
						fontSize: "0.68rem",
						color: "#8b8b90",
						fontFamily: "var(--font-mono)"
					},
					children: ["per ", commodity.unit]
				}), /* @__PURE__ */ jsx("button", {
					className: `btn${tracked ? " btn-outline" : ""}`,
					onClick: onToggle,
					disabled,
					title: disabled ? disabledReason : void 0,
					children: tracked ? "− Untrack" : "+ Track"
				})]
			})
		]
	});
}
//#endregion
//#region app/routes/_layout.markets.tsx
var _layout_markets_exports = /* @__PURE__ */ __exportAll({
	default: () => _layout_markets_default,
	loader: () => loader$1
});
async function loader$1({}) {
	const latestByCode = {};
	for (const c of CATALOG) latestByCode[c.code] = 0;
	return { latestByCode };
}
var _layout_markets_default = UNSAFE_withComponentProps(function Markets({ loaderData }) {
	const [category, setCategory] = useState(null);
	const [search, setSearch] = useState("");
	const [latestByCode, setLatestByCode] = useState(loaderData.latestByCode);
	const { codes, isTracked, toggle, atLimit, maxSize } = useWatchlist();
	useEffect(() => {
		async function fetchPrices() {
			try {
				return;
			} catch (err) {
				console.warn("Failed to fetch latest prices:", err);
			}
		}
		fetchPrices();
		const interval = setInterval(fetchPrices, 3e4);
		return () => clearInterval(interval);
	}, []);
	const categories = useMemo(() => Array.from(new Set(CATALOG.map((c) => c.category))).sort(), []);
	const filtered = useMemo(() => {
		let list = CATALOG;
		if (category) list = list.filter((c) => c.category === category);
		if (search.trim()) {
			const q = search.trim().toLowerCase();
			list = list.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
		}
		return list;
	}, [category, search]);
	return /* @__PURE__ */ jsxs("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			gap: "1.75rem"
		},
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
			style: { fontSize: "1.5rem" },
			children: "Markets"
		}), /* @__PURE__ */ jsx("p", {
			className: "muted",
			style: {
				fontSize: "0.85rem",
				marginTop: 4
			},
			children: "Browse the catalog and track what you want to follow it will show up on the Dashboard."
		})] }), /* @__PURE__ */ jsxs("div", { children: [
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
						CATALOG.length,
						" commodities available · tracking ",
						codes.length,
						"/",
						maxSize
					]
				}), /* @__PURE__ */ jsx("input", {
					placeholder: "Search commodities…",
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
						latestPrice: loaderData.latestByCode[commodity.code],
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
function StatCard({ label, price, currency, unit, changePct, sparkline, accent, isActive, onClick, onRemove }) {
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
	return {
		series: {},
		generatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
var _layout__index_default = UNSAFE_withComponentProps(function Dashboard({ loaderData }) {
	const { codes, untrack } = useWatchlist();
	const colorMap = buildColorMap(codes);
	const [focused, setFocused] = useState(codes[0]);
	const [seriesByCode, setSeriesByCode] = useState(loaderData.series);
	const [lastUpdated, setLastUpdated] = useState(loaderData.generatedAt);
	useEffect(() => {
		if (!codes.includes(focused)) setFocused(codes[0]);
	}, [codes, focused]);
	useEffect(() => {
		async function fetchLiveData() {
			try {
				console.warn("API key not configured - showing placeholder data");
				return;
			} catch (err) {
				console.warn("Failed to fetch live data:", err);
			}
		}
		fetchLiveData();
	}, [codes]);
	useEffect(() => {
		const id = setInterval(async () => {
			try {
				return;
			} catch (err) {
				console.warn("Failed to update prices:", err);
			}
		}, 2e4);
		return () => clearInterval(id);
	}, [codes]);
	const focusedMeta = CATALOG_BY_CODE[focused];
	const focusedAccent = colorMap[focused] || "#8A97A3";
	const focusedSeries = seriesByCode[focused];
	return /* @__PURE__ */ jsxs("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			gap: "1.5rem"
		},
		children: [
			codes.length === 0 && /* @__PURE__ */ jsxs("div", {
				style: {
					background: "var(--surface)",
					border: "1px solid var(--border)",
					borderRadius: "6px",
					padding: "1rem",
					color: "var(--text-muted)",
					fontSize: "0.85rem"
				},
				children: [
					"No oil prices trached yet.",
					/* @__PURE__ */ jsx("a", {
						href: "/markets",
						style: {
							color: "inherit",
							textDecoration: "underline"
						},
						children: "Markets"
					}),
					" ",
					"to start tracking."
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-3",
				children: codes.map((code) => {
					const series = seriesByCode[code];
					const change = seriesChange(series);
					const last = series?.[series.length - 1];
					const meta = CATALOG_BY_CODE[code];
					return /* @__PURE__ */ jsx(StatCard, {
						label: meta?.name || code,
						accent: colorMap[code] || "#8A97A3",
						price: last?.price,
						currency: meta?.currency,
						unit: meta?.unit,
						changePct: series ? change.pct : null,
						sparkline: series,
						isActive: focused === code,
						onClick: () => setFocused(code),
						onRemove: codes.length > 1 ? () => untrack(code) : void 0
					}, code);
				})
			}),
			/* @__PURE__ */ jsxs("div", {
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
							background: focusedAccent
						} }), /* @__PURE__ */ jsxs("h3", {
							style: { fontSize: "1rem" },
							children: [focusedMeta?.name || focused, " trend"]
						})]
					}), /* @__PURE__ */ jsx(LiveBadge, {
						live: true,
						lastUpdated
					})]
				}), /* @__PURE__ */ jsx(TrendChart, {
					data: focusedSeries,
					color: focusedAccent,
					currency: focusedMeta?.currency
				})]
			})
		]
	});
});
//#endregion
//#region \0virtual:react-router/server-manifest
var server_manifest_default = {
	"entry": {
		"module": "/assets/entry.client-DerSPEEn.js",
		"imports": ["/assets/jsx-runtime-Cvv8R5mo.js", "/assets/errorBoundaries-BXWPBLUz.js"],
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
			"module": "/assets/root-40zBI95a.js",
			"imports": [
				"/assets/jsx-runtime-Cvv8R5mo.js",
				"/assets/errorBoundaries-BXWPBLUz.js",
				"/assets/lib-CAyYMtqv.js"
			],
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
			"module": "/assets/_layout-Brm3ob5O.js",
			"imports": [
				"/assets/jsx-runtime-Cvv8R5mo.js",
				"/assets/lib-CAyYMtqv.js",
				"/assets/utils-BeYTUkT5.js",
				"/assets/LiveBadge-BsnKA6FW.js",
				"/assets/watchlist-Qq03c4hu.js",
				"/assets/errorBoundaries-BXWPBLUz.js"
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
			"module": "/assets/_layout.settings-D-BJnCsU.js",
			"imports": ["/assets/jsx-runtime-Cvv8R5mo.js", "/assets/watchlist-Qq03c4hu.js"],
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
			"module": "/assets/_layout.history-B59uulIU.js",
			"imports": [
				"/assets/jsx-runtime-Cvv8R5mo.js",
				"/assets/lib-CAyYMtqv.js",
				"/assets/utils-BeYTUkT5.js",
				"/assets/watchlist-Qq03c4hu.js",
				"/assets/api-Cgyh9mhe.js",
				"/assets/errorBoundaries-BXWPBLUz.js"
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
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/_layout.markets-CCCvq6Ju.js",
			"imports": [
				"/assets/jsx-runtime-Cvv8R5mo.js",
				"/assets/utils-BeYTUkT5.js",
				"/assets/watchlist-Qq03c4hu.js"
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
			"module": "/assets/_layout._index-DCwTzaJ_.js",
			"imports": [
				"/assets/jsx-runtime-Cvv8R5mo.js",
				"/assets/utils-BeYTUkT5.js",
				"/assets/LiveBadge-BsnKA6FW.js",
				"/assets/watchlist-Qq03c4hu.js",
				"/assets/api-Cgyh9mhe.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		}
	},
	"url": "/assets/manifest-577b3240.js",
	"version": "577b3240",
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
