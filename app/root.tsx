import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from 'react-router';

const THEME_INIT_SCRIPT = `
  try {
    var t = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
  } catch (e) {}
`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>Oil Prices</title>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap'
          rel='stylesheet'
        />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <style>{CSS}</style>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{message}</h1>
      <p>{details}</p>
    </main>
  );
}

const CSS = `
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
