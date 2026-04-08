import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Admin() {
  const router = useRouter();
  const [pages, setPages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [seoData, setSeoData] = useState({});   // { [slug]: { rank, indexed, checking } }
  const [cseConfigured, setCseConfigured] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/login");
    } else {
      setAuthed(true);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    router.replace("/login");
  };

  const load = async () => {
    setLoading(true);
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pages`);
    setPages(res.data);
    setLoading(false);
  };

  const deletePage = async (slug) => {
    if (!confirm("Delete this page?")) return;
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/page/${encodeURIComponent(slug)}`);
    load();
  };

  const checkSEO = async (p) => {
    setSeoData(prev => ({ ...prev, [p.slug]: { checking: true } }));
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/rank-check`, {
        params: { keyword: p.keyword || p.title, slug: p.slug }
      });
      if (res.data.error === "Google CSE not configured") setCseConfigured(false);
      setSeoData(prev => ({ ...prev, [p.slug]: { ...res.data, checking: false } }));
    } catch {
      setSeoData(prev => ({ ...prev, [p.slug]: { rank: null, indexed: null, checking: false, error: "Failed" } }));
    }
  };

  const checkAllSEO = async () => {
    for (const p of filtered) {
      await checkSEO(p);
      await new Promise(r => setTimeout(r, 400)); // slight delay to avoid rate limits
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = pages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.airline.toLowerCase().includes(search.toLowerCase())
  );

  if (!authed) return null;

  return (
    <div style={{ fontFamily: "sans-serif", padding: 40, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 style={{ margin: 0 }}>🛠️ Admin Panel</h1>
        <button onClick={logout} style={{ background: "#333", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}>Logout</button>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total Pages", value: pages.length, color: "#0070f3" },
          { label: "Total Views", value: pages.reduce((s, p) => s + (p.pageViews || 0), 0), color: "#6f42c1" },
          { label: "Total Calls", value: pages.reduce((s, p) => s + (p.callClicks || 0), 0), color: "#cc0000" },
          { label: "Avg Conv %", value: (() => { const v = pages.reduce((s,p)=>s+(p.pageViews||0),0); const c = pages.reduce((s,p)=>s+(p.callClicks||0),0); return v > 0 ? (c/v*100).toFixed(1)+"%" : "—"; })(), color: "#28a745" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: `2px solid ${s.color}`, borderRadius: 10, padding: "14px 24px", minWidth: 130, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: "bold", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {!cseConfigured && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
          ⚠️ <strong>Google CSE not configured.</strong> Add <code>GOOGLE_CSE_KEY</code> and <code>GOOGLE_CSE_CX</code> to your backend <code>.env</code> to enable rank &amp; index checking.
          &nbsp;<a href="https://programmablesearchengine.google.com" target="_blank" rel="noreferrer">Get free API keys →</a>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          placeholder="Search by title or airline..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "8px 12px", flex: 1, minWidth: 200, fontSize: 15, border: "1px solid #ddd", borderRadius: 8, boxSizing: "border-box" }}
        />
        <button onClick={checkAllSEO} style={{ background: "#0070f3", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
          🔍 Check All Rank &amp; Index
        </button>
      </div>

      {loading ? <p>Loading...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
              <th style={th}>#</th>
              <th style={th}>Title</th>
              <th style={th}>Airline</th>
              <th style={th}>👁 Views</th>
              <th style={th}>📞 Calls</th>
              <th style={th}>Conv %</th>
              <th style={th}>Indexed?</th>
              <th style={th}>Rank (top 10)</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const seo = seoData[p.slug];
              const pageUrl = `https://skyairlinetickets.com/page/${p.slug}`;
              return (
                <tr key={p.slug} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={td}>{i + 1}</td>
                  <td style={td}>
                    <a href={`/page/${p.slug}`} target="_blank" rel="noreferrer" style={{ fontWeight: 500 }}>{p.title}</a>
                    <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{p.slug}</div>
                  </td>
                  <td style={td}>{p.airline}</td>
                  <td style={{ ...td, textAlign: "center" }}>
                    <span style={badge("gray")}>{p.pageViews || 0}</span>
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>
                    <span style={badge(p.callClicks > 0 ? "green" : "gray")}>{p.callClicks || 0}</span>
                  </td>
                  <td style={{ ...td, textAlign: "center", fontSize: 12 }}>
                    {p.pageViews > 0 ? `${((p.callClicks || 0) / p.pageViews * 100).toFixed(1)}%` : "—"}
                  </td>
                  <td style={td}>
                    {seo?.checking ? <span style={badge("gray")}>⏳ Checking…</span>
                      : seo?.indexed === true  ? <span style={badge("green")}>✅ Indexed</span>
                      : seo?.indexed === false ? <span style={badge("red")}>❌ Not Indexed</span>
                      : <a href={`https://www.google.com/search?q=site:${pageUrl}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#0070f3" }}>Check on Google ↗</a>}
                  </td>
                  <td style={td}>
                    {seo?.checking ? <span style={badge("gray")}>⏳</span>
                      : seo?.rank  ? <span style={badge("green")}>#{seo.rank} in top 10</span>
                      : seo?.rank === null && seo?.indexed !== undefined ? <span style={badge("orange")}>Not in top 10</span>
                      : "—"}
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    <button onClick={() => checkSEO(p)} disabled={seo?.checking}
                      style={{ background: "#0070f3", color: "#fff", border: "none", padding: "4px 9px", cursor: "pointer", borderRadius: 4, marginRight: 6, fontSize: 12 }}>
                      {seo?.checking ? "…" : "🔍 SEO"}
                    </button>
                    <button onClick={() => deletePage(p.slug)}
                      style={{ background: "red", color: "#fff", border: "none", padding: "4px 10px", cursor: "pointer", borderRadius: 4, fontSize: 12 }}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = { padding: "10px 12px", fontWeight: "bold" };
const td = { padding: "8px 12px", verticalAlign: "middle" };
const badge = (color) => ({
  background: color === "green" ? "#d4edda" : color === "red" ? "#f8d7da" : color === "orange" ? "#fff3cd" : "#e9ecef",
  color: color === "green" ? "#155724" : color === "red" ? "#721c24" : color === "orange" ? "#856404" : "#555",
  padding: "2px 8px",
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 500,
});
