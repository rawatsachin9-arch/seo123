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

  const [bingStatus, setBingStatus] = useState("");
  const [tab, setTab] = useState("pages"); // "pages" | "geo"
  const [geo, setGeo] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const loadGeo = async () => {
    setGeoLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/geo-stats`);
      setGeo(res.data);
    } catch {}
    setGeoLoading(false);
  };

  const submitToBing = async () => {
    setBingStatus("submitting");
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/indexnow`);
      if (res.data.success) setBingStatus(`✅ Submitted ${res.data.submitted} URLs to Bing!`);
      else setBingStatus(`❌ ${res.data.error}`);
    } catch {
      setBingStatus("❌ Failed to submit");
    }
    setTimeout(() => setBingStatus(""), 6000);
  };

  const checkAllSEO = async () => {
    for (const p of filtered) {
      await checkSEO(p);
      await new Promise(r => setTimeout(r, 400));
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

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["pages", "geo"].map(t => (
          <button key={t} onClick={() => { setTab(t); if (t === "geo") loadGeo(); }}
            style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: tab === t ? "bold" : "normal",
              background: tab === t ? "#0070f3" : "#eee", color: tab === t ? "#fff" : "#333", fontSize: 14 }}>
            {t === "pages" ? "📄 Pages" : "🌍 Geo Stats"}
          </button>
        ))}
      </div>
      {tab === "pages" && (<>
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
        <button onClick={submitToBing} disabled={bingStatus === "submitting"} style={{ background: "#008272", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
          {bingStatus === "submitting" ? "⏳ Submitting…" : "🔎 Submit All to Bing"}
        </button>
      </div>
      {bingStatus && bingStatus !== "submitting" && (
        <div style={{ background: bingStatus.startsWith("✅") ? "#d4edda" : "#f8d7da", color: bingStatus.startsWith("✅") ? "#155724" : "#721c24", padding: "10px 16px", borderRadius: 8, marginBottom: 14, fontSize: 14 }}>
          {bingStatus}
        </div>
      )}

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
              <th style={th}>🔵 Bing</th>
              <th style={th}>🔴 Google</th>
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
                    {seo?.checking ? <span style={badge("gray")}>⏳</span>
                      : seo?.bingIndexed === true  ? <span style={badge("green")}>✅ Yes</span>
                      : seo?.bingIndexed === false ? <span style={badge("red")}>❌ No</span>
                      : seo?.bingIndexed === "no-key" ? <a href={`https://www.bing.com/search?q=site:${pageUrl}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#008272" }}>Check ↗</a>
                      : "—"}
                  </td>
                  <td style={td}>
                    {seo?.checking ? <span style={badge("gray")}>⏳ Checking…</span>
                      : seo?.indexed === true  ? <span style={badge("green")}>✅ Yes</span>
                      : seo?.indexed === false ? <span style={badge("red")}>❌ No</span>
                      : <a href={`https://www.google.com/search?q=site:${pageUrl}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#0070f3" }}>Check ↗</a>}
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
      </>)}

      {tab === "geo" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>🌍 Visitor Geography</h2>
            <button onClick={loadGeo} style={{ background: "#0070f3", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
              🔄 Refresh
            </button>
          </div>

          {/* Target markets */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { flag: "🇺🇸", name: "USA" },
              { flag: "🇨🇦", name: "Canada" },
              { flag: "🇬🇧", name: "UK" },
              { flag: "🇦🇪", name: "UAE" },
              { flag: "🇦🇺", name: "Australia" },
              { flag: "🇪🇺", name: "Europe" },
            ].map(m => (
              <span key={m.name} style={{ background: "#e8f4fd", border: "1px solid #bee3f8", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 500 }}>
                {m.flag} {m.name}
              </span>
            ))}
            <span style={{ fontSize: 12, color: "#888", alignSelf: "center", marginLeft: 4 }}>— active target markets</span>
          </div>

          {geoLoading && <p>Loading geo data…</p>}

          {!geoLoading && geo && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

              {/* By Country */}
              <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 20 }}>
                <h3 style={{ margin: "0 0 14px", color: "#333" }}>🗺️ Top Countries</h3>
                {geo.byCountry.length === 0 && <p style={{ color: "#999", fontSize: 13 }}>No data yet. Visits will appear here after pages are viewed.</p>}
                {geo.byCountry.map((c, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                    <span style={{ fontSize: 14 }}>🌐 {c._id || "Unknown"}</span>
                    <span style={badge("blue")}>{c.visits} visits</span>
                  </div>
                ))}
              </div>

              {/* By City */}
              <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 20 }}>
                <h3 style={{ margin: "0 0 14px", color: "#333" }}>🏙️ Top Cities</h3>
                {geo.byCity.length === 0 && <p style={{ color: "#999", fontSize: 13 }}>No data yet.</p>}
                {geo.byCity.map((c, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                    <span style={{ fontSize: 14 }}>📍 {c._id.city || "Unknown"}, {c._id.country || ""}</span>
                    <span style={badge("purple")}>{c.visits} visits</span>
                  </div>
                ))}
              </div>

              {/* Recent Visits */}
              <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 20, gridColumn: "1 / -1" }}>
                <h3 style={{ margin: "0 0 14px", color: "#333" }}>🕐 Recent 50 Visits</h3>
                {geo.recent.length === 0 && <p style={{ color: "#999", fontSize: 13 }}>No visits yet.</p>}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                      <th style={th}>Page</th>
                      <th style={th}>Country</th>
                      <th style={th}>City</th>
                      <th style={th}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geo.recent.map((v, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ ...td, fontSize: 11, color: "#555", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.slug}</td>
                        <td style={td}>🌐 {v.country || "—"}</td>
                        <td style={td}>📍 {v.city || "—"}</td>
                        <td style={{ ...td, color: "#888", fontSize: 12 }}>{new Date(v.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const th = { padding: "10px 12px", fontWeight: "bold" };
const td = { padding: "8px 12px", verticalAlign: "middle" };
const badge = (color) => ({
  background: color === "green" ? "#d4edda" : color === "red" ? "#f8d7da" : color === "orange" ? "#fff3cd" : color === "blue" ? "#cce5ff" : color === "purple" ? "#e2d9f3" : "#e9ecef",
  color: color === "green" ? "#155724" : color === "red" ? "#721c24" : color === "orange" ? "#856404" : color === "blue" ? "#004085" : color === "purple" ? "#4a235a" : "#555",
  padding: "2px 8px",
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 500,
});
