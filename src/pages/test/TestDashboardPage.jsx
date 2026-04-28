import { useEffect, useMemo, useRef, useState } from "react";
import { baseURL } from "@/constant/baseURL";

const API = baseURL.replace(/\/$/, "");

const SUITE_BUTTONS = [
  { key: "all",      label: "Run All",          variant: "primary" },
  { key: "visible",  label: "Run All (Visible)" },
  { key: "employee", label: "Employee" },
  { key: "admin",    label: "Admin" },
  { key: "whitebox", label: "White-box" },
  { key: "lab",      label: "Lab (10 cases)" },
];

const fmtMs = (ms) => (ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`);
const fmtTime = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

// fetch + JSON with content-type checking. If the backend returns HTML
// (because the /api/test route isn't mounted yet) we surface a clear message
// instead of "Unexpected token '<'".
async function fetchJson(url, init) {
  let res;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new Error(`Backend unreachable at ${url} — is it running on the right port?`);
  }
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!ct.includes("application/json")) {
    if (/<!doctype|<html/i.test(text)) {
      throw new Error(
        `Backend returned HTML instead of JSON for ${url}. ` +
        `The /api/test routes aren't loaded — restart the backend after the latest changes.`
      );
    }
    throw new Error(`Unexpected response (${res.status}) from ${url}: ${text.slice(0, 120)}`);
  }
  let data;
  try { data = JSON.parse(text); }
  catch (e) { throw new Error(`Invalid JSON from ${url}: ${e.message}`); }
  if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);
  return data;
}

export default function TestDashboardPage() {
  const [results, setResults]   = useState({ lastUpdated: null, suites: {} });
  const [enabled, setEnabled]   = useState(false);
  const [routeMissing, setRouteMissing] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [job, setJob]           = useState(null); // { id, suite, label, log, status, exitCode }
  const [filter, setFilter]     = useState("");
  const [modalSrc, setModalSrc] = useState(null);
  const [error, setError]       = useState("");
  const pollRef = useRef(null);

  // ---- data loading ----
  const loadResults = async () => {
    try {
      const r = await fetchJson(`${API}/api/test/results`);
      setResults(r || { lastUpdated: null, suites: {} });
      setBackendError("");
    } catch (e) {
      setError(`Could not load results: ${e.message}`);
      if (/HTML instead of JSON/.test(e.message)) setRouteMissing(true);
      if (/unreachable/i.test(e.message)) setBackendError(e.message);
    }
  };
  const loadStatus = async () => {
    try {
      const s = await fetchJson(`${API}/api/test/status`);
      setEnabled(!!s.enabled);
      setRouteMissing(false);
      setBackendError("");
    } catch (e) {
      setEnabled(false);
      if (/HTML instead of JSON/.test(e.message)) setRouteMissing(true);
      if (/unreachable/i.test(e.message)) setBackendError(e.message);
    }
  };

  useEffect(() => {
    loadResults();
    loadStatus();
    const t = setInterval(() => { if (!pollRef.current) loadResults(); }, 5000);
    return () => clearInterval(t);
  }, []);

  // ---- run a suite ----
  const runSuite = async (suite) => {
    if (job && job.status === "running") return;
    setError("");
    try {
      const start = await fetchJson(`${API}/api/test/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suite }),
      });
      setJob({ ...start, status: "running", log: "" });
      pollRef.current = setInterval(() => poll(start.jobId), 1000);
    } catch (e) {
      setError(`Failed to start: ${e.message}`);
      if (/HTML instead of JSON/.test(e.message)) setRouteMissing(true);
    }
  };

  const poll = async (id) => {
    try {
      const j = await fetchJson(`${API}/api/test/run/${id}`);
      setJob((prev) => ({ ...(prev || {}), ...j }));
      if (j.status === "done") {
        clearInterval(pollRef.current);
        pollRef.current = null;
        await loadResults();
      }
    } catch (e) { /* keep polling */ }
  };

  // ---- derived ----
  const allRows = useMemo(() => {
    const rows = [];
    for (const s of Object.values(results.suites || {})) {
      for (const c of s.cases || []) rows.push({ ...c, suite: s.suite });
    }
    return rows;
  }, [results]);

  const totals = useMemo(() => {
    const pass = allRows.filter((r) => r.status === "PASS").length;
    const fail = allRows.filter((r) => r.status === "FAIL").length;
    return { total: allRows.length, pass, fail, rate: allRows.length ? Math.round((pass / allRows.length) * 100) : 0 };
  }, [allRows]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((r) =>
      [r.id, r.title, r.status, r.suite, r.note, r.error].some((v) => (v || "").toString().toLowerCase().includes(q))
    );
  }, [allRows, filter]);

  const galleryItems = useMemo(() => {
    const items = [];
    for (const r of allRows) {
      for (const s of r.screenshots || []) {
        if (s.endsWith(".txt")) continue;
        items.push({ name: s, fail: r.status === "FAIL", caseId: r.id });
      }
    }
    return items;
  }, [allRows]);

  const screenshotUrl = (name) => `${API}/test-screenshots/${encodeURIComponent(name)}`;
  const isRunning = job && job.status === "running";

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div>
          <h1 style={S.h1}>🧪 Test Dashboard</h1>
          <p style={S.sub}>Troublynx / Octabit Company Management Portal</p>
        </div>
        <div style={S.actions}>
          {SUITE_BUTTONS.map((b) => (
            <button
              key={b.key}
              onClick={() => runSuite(b.key)}
              disabled={isRunning || !enabled}
              style={{ ...S.btn, ...(b.variant === "primary" ? S.btnPrimary : {}), ...(isRunning || !enabled ? S.btnDisabled : {}) }}
              title={!enabled ? "Set ENABLE_TEST_HARNESS=1 on the backend to enable" : ""}
            >
              {b.label}
            </button>
          ))}
          <button onClick={loadResults} style={{ ...S.btn, ...S.btnGhost }}>↻ Refresh</button>
        </div>
      </header>

      {backendError && (
        <div style={S.error}>
          <strong>Backend not reachable.</strong> {backendError}<br />
          Make sure <code style={S.code}>npm run dev</code> is running in <code style={S.code}>management_portal_backend/</code>.
        </div>
      )}

      {routeMissing && !backendError && (
        <div style={S.error}>
          <strong>Backend is up but the /api/test routes aren't loaded.</strong><br />
          Stop the backend, then restart it after the latest <code style={S.code}>index.js</code> changes:
          <pre style={{ ...S.code, display: "block", padding: 10, marginTop: 8 }}>
{`# bash
cd management_portal_backend
ENABLE_TEST_HARNESS=1 npm run dev

# PowerShell
cd management_portal_backend
$env:ENABLE_TEST_HARNESS="1"; npm run dev`}
          </pre>
          Verify by opening <a href={`${API}/api/test/status`} target="_blank" rel="noreferrer">{API}/api/test/status</a> — it should return JSON.
        </div>
      )}

      {!enabled && !routeMissing && !backendError && (
        <div style={S.warn}>
          <strong>Test runner is disabled.</strong> The dashboard is read-only. To enable Run buttons,
          start the backend with <code style={S.code}>ENABLE_TEST_HARNESS=1 npm run dev</code>
          (PowerShell: <code style={S.code}>$env:ENABLE_TEST_HARNESS="1"; npm run dev</code>).
        </div>
      )}

      {error && <div style={S.error}>{error}</div>}

      {job && (
        <div style={S.runBox}>
          <div style={S.runHead}>
            <strong>{isRunning ? "Running" : "Finished"}: {job.label || job.suite}</strong>
            {isRunning && <span style={S.spinner} />}
            {!isRunning && <span style={S.muted}>Exit code: {job.exitCode} · {fmtTime(job.finishedAt)}</span>}
          </div>
          <pre style={S.logBox}>{job.log || "(starting…)"}</pre>
        </div>
      )}

      <section style={S.statsRow}>
        <Stat label="Total cases" value={totals.total} />
        <Stat label="Passed"      value={totals.pass} variant="pass" />
        <Stat label="Failed"      value={totals.fail} variant="fail" />
        <Stat label="Pass rate"   value={totals.total ? `${totals.rate}%` : "—"} />
        <Stat label="Last run"    value={fmtTime(results.lastUpdated)} small />
      </section>

      <section style={S.chartsRow}>
        <ChartCard title="Pass / Fail">
          <DonutChart pass={totals.pass} fail={totals.fail} />
        </ChartCard>
        <ChartCard title="Per-suite results">
          <SuiteBars suites={results.suites || {}} />
        </ChartCard>
      </section>

      <section style={S.section}>
        <h2 style={S.h2}>Test results</h2>
        <div style={S.filterRow}>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by ID, title, status, suite…"
            style={S.filterInput}
          />
          <span style={S.muted}>{filtered.length} of {allRows.length}</span>
        </div>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Suite", "ID", "Title", "Status", "Duration", "Note / Error", "JS errors", "Evidence"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={S.tdEmpty}>No results yet — click a Run button above.</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={`${r.suite}-${r.id}-${i}`} style={i % 2 ? { background: "#fafbfc" } : null}>
                  <td style={S.td}><span style={S.suiteTag}>{r.suite}</span></td>
                  <td style={S.td}><strong>{r.id}</strong></td>
                  <td style={S.td}>{r.title}</td>
                  <td style={S.td}>
                    <span style={{ ...S.badge, ...(r.status === "PASS" ? S.badgePass : S.badgeFail) }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={S.td}>{fmtMs(r.ms || 0)}</td>
                  <td style={S.td}>{r.note || r.error || ""}</td>
                  <td style={{ ...S.td, color: "#b91c1c", fontSize: 12, maxWidth: 220 }}>
                    {(r.errors || []).slice(0, 3).join(" · ") || <span style={S.muted}>—</span>}
                  </td>
                  <td style={S.td}>
                    <div style={S.thumbs}>
                      {(r.screenshots || []).map((s) => s.endsWith(".txt")
                        ? <span key={s} style={S.txtThumb} title={s}>TXT</span>
                        : <img key={s} src={screenshotUrl(s)} title={s} style={S.thumb}
                               onClick={() => setModalSrc(screenshotUrl(s))} alt={s} />
                      )}
                      {(!r.screenshots || r.screenshots.length === 0) && <span style={S.muted}>—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={S.section}>
        <h2 style={S.h2}>Screenshot gallery</h2>
        <p style={S.muted}>Click any thumbnail for full size. Failure shots have a red border.</p>
        {galleryItems.length === 0 ? (
          <p style={S.muted}>No screenshots yet.</p>
        ) : (
          <div style={S.gallery}>
            {galleryItems.map((it) => (
              <div key={it.name} style={{ ...S.galleryItem, ...(it.fail ? S.galleryItemFail : {}) }}
                   onClick={() => setModalSrc(screenshotUrl(it.name))}>
                <img src={screenshotUrl(it.name)} loading="lazy" style={S.galleryImg} alt={it.name} />
                <div style={S.galleryCap}><strong>{it.caseId}</strong> — {it.name}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {modalSrc && (
        <div style={S.modal} onClick={() => setModalSrc(null)}>
          <img src={modalSrc} style={S.modalImg} alt="" />
        </div>
      )}
    </div>
  );
}

// ---------------- sub-components ----------------
function Stat({ label, value, variant, small }) {
  const accent = variant === "pass" ? "#16a34a" : variant === "fail" ? "#dc2626" : "#2e75b6";
  return (
    <div style={{ ...S.statCard, borderLeftColor: accent }}>
      <span style={S.statLbl}>{label}</span>
      <span style={{ ...S.statNum, fontSize: small ? 14 : 26, fontWeight: small ? 500 : 600, color: small ? "#374151" : "#111827" }}>
        {value}
      </span>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={S.chartCard}>
      <h3 style={S.chartTitle}>{title}</h3>
      {children}
    </div>
  );
}

// SVG donut — no chart lib dependency
function DonutChart({ pass, fail }) {
  const total = pass + fail;
  if (total === 0) return <p style={S.muted}>No data.</p>;
  const r = 60, cx = 80, cy = 80, c = 2 * Math.PI * r;
  const passLen = (pass / total) * c;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#dc2626" strokeWidth="20" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#16a34a" strokeWidth="20"
              strokeDasharray={`${passLen} ${c - passLen}`} transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="22" fontWeight="600" fill="#111827">
        {Math.round((pass / total) * 100)}%
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="11" fill="#6b7280">passed</text>
    </svg>
  );
}

// SVG stacked bars per suite
function SuiteBars({ suites }) {
  const keys = Object.keys(suites);
  if (keys.length === 0) return <p style={S.muted}>No data.</p>;
  const max = Math.max(1, ...keys.map((k) => (suites[k].passCount || 0) + (suites[k].failCount || 0)));
  const W = 360, barH = 26, gap = 10;
  const H = keys.length * (barH + gap) + 20;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      {keys.map((k, i) => {
        const y = i * (barH + gap) + 10;
        const p = suites[k].passCount || 0;
        const f = suites[k].failCount || 0;
        const total = p + f;
        const labelX = 80;
        const passW = (p / max) * (W - labelX - 60);
        const failW = (f / max) * (W - labelX - 60);
        return (
          <g key={k}>
            <text x={4} y={y + barH / 2 + 4} fontSize="12" fill="#374151">{k}</text>
            <rect x={labelX} y={y} width={passW} height={barH} fill="#16a34a" />
            <rect x={labelX + passW} y={y} width={failW} height={barH} fill="#dc2626" />
            <text x={labelX + passW + failW + 6} y={y + barH / 2 + 4} fontSize="12" fill="#374151">
              {p}/{total}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------- styles ----------------
const S = {
  page:    { padding: 0, background: "#f4f6fa", minHeight: "100vh", color: "#1f2937", fontFamily: "system-ui, Segoe UI, Roboto, sans-serif" },
  header:  { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
             padding: "18px 28px", background: "linear-gradient(135deg,#1f4e79,#2e75b6)", color: "#fff" },
  h1:      { margin: 0, fontSize: 22 },
  sub:     { margin: "2px 0 0", opacity: 0.85, fontSize: 13 },
  actions: { display: "flex", flexWrap: "wrap", gap: 8 },
  btn:     { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)",
             padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  btnPrimary:  { background: "#f59e0b", borderColor: "#f59e0b" },
  btnGhost:    { background: "transparent" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },

  warn:    { margin: "16px 28px", padding: "12px 16px", background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8 },
  error:   { margin: "16px 28px", padding: "10px 14px", background: "#fee2e2", border: "1px solid #dc2626", color: "#991b1b", borderRadius: 8 },
  code:    { background: "#fff7ed", padding: "1px 6px", borderRadius: 4, fontFamily: "Consolas, monospace", fontSize: 12 },

  runBox:  { margin: "16px 28px", padding: "12px 16px", background: "#fff8e1", border: "1px solid #f59e0b", borderRadius: 10 },
  runHead: { display: "flex", alignItems: "center", gap: 12, marginBottom: 6 },
  spinner: { width: 14, height: 14, border: "2px solid #f59e0b", borderTopColor: "transparent", borderRadius: "50%",
             display: "inline-block", animation: "tdspin 0.8s linear infinite" },
  logBox:  { maxHeight: 240, overflow: "auto", background: "#111827", color: "#d1d5db", padding: "10px 14px",
             borderRadius: 6, fontFamily: "Consolas, monospace", fontSize: 12, whiteSpace: "pre-wrap", margin: 0 },

  statsRow:    { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, padding: "12px 28px" },
  statCard:    { background: "#fff", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4,
                 boxShadow: "0 1px 3px rgba(0,0,0,0.05)", borderLeft: "4px solid #2e75b6" },
  statLbl:     { fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 },
  statNum:     { fontSize: 26, fontWeight: 600 },

  chartsRow: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: 18, padding: "0 28px" },
  chartCard: { background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  chartTitle:{ margin: "0 0 8px", fontSize: 14, color: "#4b5563" },

  section: { padding: "18px 28px" },
  h2:      { fontSize: 18, margin: "0 0 12px", color: "#1f4e79" },

  filterRow:  { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 },
  filterInput:{ flex: 1, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 },
  muted:      { color: "#6b7280", fontSize: 12 },

  tableWrap: { background: "#fff", borderRadius: 10, overflow: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  table:     { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:        { padding: "9px 12px", textAlign: "left", borderBottom: "1px solid #f3f4f6", background: "#f9fafb",
               color: "#4b5563", fontWeight: 600, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.5 },
  td:        { padding: "9px 12px", borderBottom: "1px solid #f3f4f6", verticalAlign: "top" },
  tdEmpty:   { padding: 24, textAlign: "center", color: "#6b7280" },

  badge:     { display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
               textTransform: "uppercase", letterSpacing: 0.4 },
  badgePass: { background: "#dcfce7", color: "#15803d" },
  badgeFail: { background: "#fee2e2", color: "#b91c1c" },
  suiteTag:  { display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11,
               background: "#e0e7ff", color: "#3730a3", fontWeight: 500 },

  thumbs:    { display: "flex", flexWrap: "wrap", gap: 4 },
  thumb:     { width: 60, height: 40, objectFit: "cover", borderRadius: 3, cursor: "pointer", border: "1px solid #e5e7eb" },
  txtThumb:  { width: 60, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center",
               background: "#fee2e2", color: "#b91c1c", borderRadius: 3, fontSize: 11, fontWeight: 600 },

  gallery:    { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 },
  galleryItem:    { background: "#fff", borderRadius: 8, overflow: "hidden", cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)", border: "2px solid transparent" },
  galleryItemFail:{ borderColor: "#dc2626" },
  galleryImg:     { width: "100%", height: 110, objectFit: "cover", display: "block" },
  galleryCap:     { padding: "6px 8px", fontSize: 11, wordBreak: "break-all" },

  modal:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex",
              alignItems: "center", justifyContent: "center", zIndex: 1000, cursor: "zoom-out", padding: 24 },
  modalImg: { maxWidth: "100%", maxHeight: "100%", boxShadow: "0 0 30px rgba(0,0,0,0.5)" },
};

// inject keyframes once
if (typeof document !== "undefined" && !document.getElementById("td-spin")) {
  const tag = document.createElement("style");
  tag.id = "td-spin";
  tag.textContent = "@keyframes tdspin{to{transform:rotate(360deg)}}";
  document.head.appendChild(tag);
}
