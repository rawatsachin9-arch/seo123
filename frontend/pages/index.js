import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [pages, setPages] = useState([]);
  const [airline, setAirline] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pages`);
      setPages(res.data);
    } catch (e) {
      console.error("Failed to load pages:", e.message);
    }
  };

  const generate = async () => {
    if (!airline.trim() || !keyword.trim()) {
      setError("Please enter both airline and keyword.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/generate`, { airline, keyword });
      setSuccess(`✅ Page generated: ${res.data.title}`);
      load();
    } catch (e) {
      const msg = e.response?.data?.error || e.message;
      setError(`❌ Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 800 }}>
      <h1>SEO Tool Dashboard</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <input
          placeholder="Airline (e.g. Delta)"
          value={airline}
          onChange={e => setAirline(e.target.value)}
          style={{ padding: "8px 12px", fontSize: 15, flex: 1, minWidth: 180, border: "1px solid #ccc", borderRadius: 4 }}
        />
        <input
          placeholder="Keyword (e.g. flight cancellation)"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ padding: "8px 12px", fontSize: 15, flex: 2, minWidth: 220, border: "1px solid #ccc", borderRadius: 4 }}
        />
        <button
          onClick={generate}
          disabled={loading}
          style={{ padding: "8px 20px", fontSize: 15, background: loading ? "#aaa" : "#0070f3", color: "#fff", border: "none", borderRadius: 4, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {error && <div style={{ background: "#fff0f0", border: "1px solid #faa", padding: "10px 14px", borderRadius: 4, marginBottom: 12, color: "#c00" }}>{error}</div>}
      {success && <div style={{ background: "#f0fff4", border: "1px solid #6c6", padding: "10px 14px", borderRadius: 4, marginBottom: 12, color: "#060" }}>{success}</div>}

      <p style={{ color: "#666", fontSize: 14 }}>{pages.length} pages in database</p>

      {pages.map(p => (
        <div key={p.slug} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
          <a href={`/page/${p.slug}`} style={{ color: "#0070f3" }}>{p.title}</a>
        </div>
      ))}
    </div>
  );
}
