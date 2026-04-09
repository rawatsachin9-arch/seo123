import { useState, useEffect } from "react";
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

export default function Home() {
  const [pages, setPages] = useState([]);
  const [airline, setAirline] = useState("");
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("United States");
  const [city, setCity] = useState("New York");
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkCountry, setBulkCountry] = useState("United States");
  const [bulkCity, setBulkCity] = useState(""); // empty = all cities
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const cities = TARGET_MARKETS[country] || [];
  const bulkCities = TARGET_MARKETS[bulkCountry] || [];

  // page count for bulk: airlines × keywords (× cities if city-level)
  const airlinesCount = 10;
  const keywordsCount = 10;
  const bulkPageCount = bulkCity
    ? airlinesCount * keywordsCount  // 1 city selected
    : airlinesCount * keywordsCount; // same base; city is embedded in content

  const load = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pages`);
      setPages(res.data);
    } catch (e) { console.error(e.message); }
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

  const generateAll = async () => {
    setBulkLoading(true); setError(""); setSuccess("");
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/generate-all`, { country: bulkCountry, city: bulkCity || null });
      setSuccess(`🚀 ${res.data.message} — refresh to see pages as they generate.`);
      const poll = setInterval(() => load(), 10000);
      setTimeout(() => clearInterval(poll), 300000);
    } catch (e) {
      setError(`❌ ${e.response?.data?.error || e.message}`);
    } finally { setBulkLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const s = { input: { padding: "9px 12px", fontSize: 14, border: "1px solid #ddd", borderRadius: 6, background: "#fff" } };

  return (
    <div style={{ padding: "32px 40px", fontFamily: "'Segoe UI', sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 24 }}>✈️ SEO Tool Dashboard</h1>
      <p style={{ margin: "0 0 28px", color: "#888", fontSize: 13 }}>{pages.length} pages in database</p>

      {/* ── Single Page Generator ── */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10, padding: 24, marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 16, color: "#333" }}>📄 Generate Single Page</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <input placeholder="Airline (e.g. Delta Airlines)" value={airline} onChange={e => setAirline(e.target.value)} style={s.input} />
          <input placeholder="Keyword (e.g. flight cancellation)" value={keyword} onChange={e => setKeyword(e.target.value)} style={s.input} />
          <select value={country} onChange={e => { setCountry(e.target.value); setCity(TARGET_MARKETS[e.target.value]?.[0] || ""); }} style={s.input}>
            {Object.keys(TARGET_MARKETS).map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={city} onChange={e => setCity(e.target.value)} style={s.input}>
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={generate} disabled={loading}
            style={{ padding: "10px 28px", fontSize: 14, background: loading ? "#aaa" : "#0070f3", color: "#fff", border: "none", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer", fontWeight: 600 }}>
            {loading ? "Generating…" : "Generate Page"}
          </button>
          {country && city && (
            <span style={{ fontSize: 13, color: "#555" }}>📍 Targeting: <strong>{city}, {country}</strong></span>
          )}
        </div>
      </div>

      {/* ── Bulk Generator ── */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10, padding: 24, marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 16, color: "#333" }}>⚡ Bulk Generate</h2>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: "#888" }}>Generates all airline × keyword combinations for the selected market.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          <select value={bulkCountry} onChange={e => { setBulkCountry(e.target.value); setBulkCity(""); }} style={s.input}>
            {Object.keys(TARGET_MARKETS).map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={bulkCity} onChange={e => setBulkCity(e.target.value)} style={s.input}>
            <option value="">— All cities (country-level) —</option>
            {bulkCities.map(c => <option key={c}>{c}</option>)}
          </select>
          <div style={{ background: "#f0f7ff", border: "1px solid #bee3f8", borderRadius: 6, padding: "8px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>Pages to generate</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#0070f3" }}>{bulkPageCount}</span>
            <span style={{ fontSize: 11, color: "#888" }}>10 airlines × 10 keywords</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={generateAll} disabled={bulkLoading}
            style={{ padding: "10px 28px", fontSize: 14, background: bulkLoading ? "#aaa" : "#28a745", color: "#fff", border: "none", borderRadius: 6, cursor: bulkLoading ? "not-allowed" : "pointer", fontWeight: 600 }}>
            {bulkLoading ? "Queuing…" : `⚡ Generate All for ${bulkCity || bulkCountry}`}
          </button>
          <span style={{ fontSize: 13, color: "#888" }}>~{Math.round(bulkPageCount * 3 / 60)} min at 3s/page</span>
        </div>
      </div>

      {error   && <div style={{ background: "#fff0f0", border: "1px solid #faa", padding: "10px 14px", borderRadius: 6, marginBottom: 12, color: "#c00", fontSize: 14 }}>{error}</div>}
      {success && <div style={{ background: "#f0fff4", border: "1px solid #6c6", padding: "10px 14px", borderRadius: 6, marginBottom: 12, color: "#060", fontSize: 14 }}>{success}</div>}

      {/* ── Pages List ── */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10, padding: 20 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16, color: "#333" }}>📋 All Pages</h2>
        {pages.length === 0 && <p style={{ color: "#aaa", fontSize: 13 }}>No pages yet. Generate one above.</p>}
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

