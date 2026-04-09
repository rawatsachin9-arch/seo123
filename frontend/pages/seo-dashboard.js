import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const TARGET_MARKETS = {
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "Dallas", "Atlanta", "San Francisco", "Las Vegas", "Boston"],
  "Canada":         ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Winnipeg", "Quebec City"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Glasgow", "Edinburgh", "Liverpool", "Bristol", "Leeds"],
  "UAE":            ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"],
  "Australia":      ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra"],
  "Germany":        ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"],
  "France":         ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Bordeaux"],
  "Italy":          ["Rome", "Milan", "Naples", "Turin", "Florence", "Venice"],
  "Spain":          ["Madrid", "Barcelona", "Seville", "Valencia", "Bilbao", "Malaga"],
  "Netherlands":    ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
};

const DEFAULT_AIRLINES = [
  "Delta Airlines","United Airlines","American Airlines","Southwest Airlines",
  "Spirit Airlines","Frontier Airlines","JetBlue Airways","Alaska Airlines",
  "Allegiant Air","Sun Country Airlines"
];

export default function SeoDashboard() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [pages, setPages] = useState([]);
  const [airline, setAirline] = useState("");
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("United States");
  const [city, setCity] = useState("New York");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Bulk state
  const [bulkCountry, setBulkCountry] = useState("United States");
  const [bulkCity, setBulkCity] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null); // { done, total }
  const [customAirlineInput, setCustomAirlineInput] = useState("");
  const [customAirlines, setCustomAirlines] = useState([]);
  const [pageLimit, setPageLimit] = useState(""); // empty = no limit
  const pollRef = useRef(null);

  const cities = TARGET_MARKETS[country] || [];
  const bulkCities = TARGET_MARKETS[bulkCountry] || [];

  const allAirlines = [...new Set([...DEFAULT_AIRLINES, ...customAirlines])];
  const keywordsCount = 10;
  const totalPossible = allAirlines.length * keywordsCount;
  const willGenerate = pageLimit ? Math.min(parseInt(pageLimit) || 0, totalPossible) : totalPossible;

  const load = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pages`);
      setPages(res.data);
    } catch (e) { console.error(e.message); }
  };

  const addAirline = () => {
    const name = customAirlineInput.trim();
    if (!name) return;
    if (!customAirlines.includes(name) && !DEFAULT_AIRLINES.includes(name)) {
      setCustomAirlines(prev => [...prev, name]);
    }
    setCustomAirlineInput("");
  };

  const removeAirline = (name) => setCustomAirlines(prev => prev.filter(a => a !== name));

  const startPoll = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const s = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bulk-status`);
        setBulkProgress({ done: s.data.done, total: s.data.total });
        load();
        if (!s.data.running) {
          clearInterval(pollRef.current);
          setBulkLoading(false);
          setSuccess(`✅ Generation complete! ${s.data.done}/${s.data.total} pages created.`);
        }
      } catch {}
    }, 5000);
  };

  const generateAll = async () => {
    setBulkLoading(true); setError(""); setSuccess(""); setBulkProgress(null);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/generate-all`, {
        country: bulkCountry,
        city: bulkCity || null,
        customAirlines,
        limit: pageLimit ? parseInt(pageLimit) : 0
      });
      setBulkProgress({ done: 0, total: res.data.total });
      setSuccess(`🚀 ${res.data.message}`);
      startPoll();
    } catch (e) {
      setError(`❌ ${e.response?.data?.error || e.message}`);
      setBulkLoading(false);
    }
  };

  const stopGeneration = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/bulk-stop`);
      setSuccess("⛔ Stop signal sent — generation will stop after current page.");
      if (pollRef.current) clearInterval(pollRef.current);
      setBulkLoading(false);
    } catch {}
  };

  const generate = async () => {
    if (!airline.trim() || !keyword.trim()) { setError("Please enter both airline and keyword."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/generate`, { airline, keyword, country, city });
      setSuccess(`✅ Page generated: ${res.data.title} (targeting ${city}, ${country})`);
      load();
    } catch (e) {
      setError(`❌ ${e.response?.data?.error || e.message}`);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/login"); return; }
    setAuthed(true);
    load();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const inp = { padding: "9px 12px", fontSize: 14, border: "1px solid #ddd", borderRadius: 6, background: "#fff", width: "100%", boxSizing: "border-box" };
  const card = { background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10, padding: 24, marginBottom: 20 };

  if (!authed) return null;

  return (
    <div style={{ padding: "32px 40px", fontFamily: "'Segoe UI', sans-serif", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>✈️ SEO Tool Dashboard</h1>
        <a href="/admin" style={{ fontSize: 13, color: "#0070f3" }}>← Back to Admin</a>
      </div>
      <p style={{ margin: "0 0 28px", color: "#888", fontSize: 13 }}>{pages.length} pages in database</p>

      {/* ── Single Page ── */}
      <div style={card}>
        <h2 style={{ margin: "0 0 16px", fontSize: 16, color: "#333" }}>📄 Generate Single Page</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <input placeholder="Airline (e.g. Delta Airlines)" value={airline} onChange={e => setAirline(e.target.value)} style={inp} />
          <input placeholder="Keyword (e.g. flight cancellation)" value={keyword} onChange={e => setKeyword(e.target.value)} style={inp} />
          <select value={country} onChange={e => { setCountry(e.target.value); setCity(TARGET_MARKETS[e.target.value]?.[0] || ""); }} style={inp}>
            {Object.keys(TARGET_MARKETS).map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={city} onChange={e => setCity(e.target.value)} style={inp}>
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={generate} disabled={loading}
            style={{ padding: "10px 28px", fontSize: 14, background: loading ? "#aaa" : "#0070f3", color: "#fff", border: "none", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer", fontWeight: 600 }}>
            {loading ? "Generating…" : "Generate Page"}
          </button>
          <span style={{ fontSize: 13, color: "#555" }}>📍 <strong>{city}, {country}</strong></span>
        </div>
      </div>

      {/* ── Bulk Generator ── */}
      <div style={card}>
        <h2 style={{ margin: "0 0 6px", fontSize: 16, color: "#333" }}>⚡ Bulk Generate</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#888" }}>Generates airline × keyword combinations. Add extra airlines, set a page limit, and stop anytime.</p>

        {/* Target market */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 4 }}>Target Country</label>
            <select value={bulkCountry} onChange={e => { setBulkCountry(e.target.value); setBulkCity(""); }} style={inp}>
              {Object.keys(TARGET_MARKETS).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 4 }}>Target City</label>
            <select value={bulkCity} onChange={e => setBulkCity(e.target.value)} style={inp}>
              <option value="">— Country-level (auto) —</option>
              {bulkCities.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Add custom airline */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 4 }}>Add Custom Airline</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="e.g. Air India, Emirates, Ryanair…"
              value={customAirlineInput}
              onChange={e => setCustomAirlineInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addAirline()}
              style={{ ...inp, flex: 1 }}
            />
            <button onClick={addAirline}
              style={{ padding: "9px 20px", background: "#0070f3", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, whiteSpace: "nowrap" }}>
              + Add
            </button>
          </div>
          {customAirlines.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {customAirlines.map(a => (
                <span key={a} style={{ background: "#e8f4fd", border: "1px solid #bee3f8", borderRadius: 20, padding: "3px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  {a}
                  <span onClick={() => removeAirline(a)} style={{ cursor: "pointer", color: "#e00", fontWeight: "bold", fontSize: 15, lineHeight: 1 }}>×</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Page limit + count preview */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 4 }}>Page Limit <span style={{ color: "#aaa" }}>(leave blank = generate all)</span></label>
            <input
              type="number" min="1" max="1000"
              placeholder={`Max ${totalPossible} (${allAirlines.length} airlines × ${keywordsCount} keywords)`}
              value={pageLimit}
              onChange={e => setPageLimit(e.target.value)}
              style={inp}
            />
          </div>
          <div style={{ background: "#f0f7ff", border: "1px solid #bee3f8", borderRadius: 6, padding: "10px 16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ fontSize: 11, color: "#555" }}>Will generate</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#0070f3", lineHeight: 1.2 }}>{willGenerate}</span>
            <span style={{ fontSize: 11, color: "#888" }}>{allAirlines.length} airlines × {keywordsCount} keywords{pageLimit ? ` (limited to ${pageLimit})` : ""}</span>
          </div>
        </div>

        {/* Airlines list preview */}
        <details style={{ marginBottom: 14 }}>
          <summary style={{ fontSize: 13, color: "#555", cursor: "pointer" }}>📋 View all {allAirlines.length} airlines in queue</summary>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
            {allAirlines.map(a => (
              <span key={a} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 4, padding: "2px 10px", fontSize: 12, color: "#444" }}>{a}</span>
            ))}
          </div>
        </details>

        {/* Progress bar */}
        {bulkProgress && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 4 }}>
              <span>Progress: {bulkProgress.done} / {bulkProgress.total} pages</span>
              <span>{bulkProgress.total > 0 ? Math.round(bulkProgress.done / bulkProgress.total * 100) : 0}%</span>
            </div>
            <div style={{ background: "#e9ecef", borderRadius: 8, height: 10, overflow: "hidden" }}>
              <div style={{ background: "#28a745", height: "100%", width: `${bulkProgress.total > 0 ? (bulkProgress.done / bulkProgress.total * 100) : 0}%`, transition: "width 0.5s" }} />
            </div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>~{Math.round((bulkProgress.total - bulkProgress.done) * 3 / 60)} min remaining</div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={generateAll} disabled={bulkLoading}
            style={{ padding: "10px 28px", fontSize: 14, background: bulkLoading ? "#aaa" : "#28a745", color: "#fff", border: "none", borderRadius: 6, cursor: bulkLoading ? "not-allowed" : "pointer", fontWeight: 600 }}>
            {bulkLoading ? `⏳ Generating… (${bulkProgress?.done || 0}/${bulkProgress?.total || "?"})` : `⚡ Start Bulk Generate (${willGenerate} pages)`}
          </button>
          {bulkLoading && (
            <button onClick={stopGeneration}
              style={{ padding: "10px 24px", fontSize: 14, background: "#dc3545", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
              ⛔ Stop Generation
            </button>
          )}
        </div>
      </div>

      {error   && <div style={{ background: "#fff0f0", border: "1px solid #faa", padding: "10px 14px", borderRadius: 6, marginBottom: 12, color: "#c00", fontSize: 14 }}>{error}</div>}
      {success && <div style={{ background: "#f0fff4", border: "1px solid #6c6", padding: "10px 14px", borderRadius: 6, marginBottom: 12, color: "#060", fontSize: 14 }}>{success}</div>}

      {/* ── Pages List ── */}
      <div style={card}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16, color: "#333" }}>📋 All Pages ({pages.length})</h2>
        {pages.length === 0 && <p style={{ color: "#aaa", fontSize: 13 }}>No pages yet.</p>}
        {pages.map(p => (
          <div key={p.slug} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href={`/page/${p.slug}`} target="_blank" rel="noreferrer" style={{ color: "#0070f3", fontSize: 14, textDecoration: "none" }}>{p.title}</a>
            <span style={{ fontSize: 11, color: "#aaa" }}>{p.airline}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
