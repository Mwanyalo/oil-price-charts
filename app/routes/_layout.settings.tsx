import { useEffect, useState } from "react";
import { useWatchlist } from "../context/watchlist";
import { useCatalog } from "../context/catalog";

export default function Settings() {
  const { codes, untrack, maxSize } = useWatchlist();
  const { byCode } = useCatalog();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 520 }}>
      <h1 style={{ fontSize: "1.5rem" }}>Settings</h1>

      <Section title="Appearance">
        <Row>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>Dark mode</div>
            <div className="muted" style={{ fontSize: "0.75rem" }}>Applies across the app, saved to this browser.</div>
          </div>
          <Switch checked={theme === "dark"} onChange={toggleTheme} />
        </Row>
      </Section>

      <Section title="Watchlist">
        <p className="muted" style={{ fontSize: "0.8rem", marginTop: 0 }}>
          Tracking {codes.length}/{maxSize}. Manage what's tracked here or from the Markets page.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {codes.map((code) => (
            <Row key={code}>
              <span style={{ fontSize: "0.85rem" }}>{byCode[code]?.name || code}</span>
              <button className="btn btn-outline" disabled={codes.length <= 1} onClick={() => untrack(code)}>
                Untrack
              </button>
            </Row>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3 className="muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>
        {title}
      </h3>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>{children}</div>;
}

function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        width: 38,
        height: 22,
        borderRadius: 999,
        border: "1px solid var(--border)",
        background: checked ? "var(--brand)" : "var(--border)",
        position: "relative",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "white",
          transition: "left 0.15s ease",
        }}
      />
    </button>
  );
}
