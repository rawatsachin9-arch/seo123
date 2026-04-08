import { useState, useEffect } from "react";
import axios from "axios";

export default function Admin() {
  const [pages, setPages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { load(); }, []);

  const filtered = pages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.airline.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "sans-serif", padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <h1>🛠️ Admin Panel</h1>
      <p>Total Pages: <strong>{pages.length}</strong></p>

      <input
        placeholder="Search by title or airline..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: "8px 12px", width: "100%", marginBottom: 20, fontSize: 16, boxSizing: "border-box" }}
      />

      {loading ? <p>Loading...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
              <th style={th}>#</th>
              <th style={th}>Title</th>
              <th style={th}>Airline</th>
              <th style={th}>Slug</th>
              <th style={th}>Created</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.slug} style={{ borderBottom: "1px solid #eee" }}>
                <td style={td}>{i + 1}</td>
                <td style={td}>
                  <a href={`/page/${p.slug}`} target="_blank" rel="noreferrer">{p.title}</a>
                </td>
                <td style={td}>{p.airline}</td>
                <td style={{ ...td, fontSize: 11, color: "#888" }}>{p.slug}</td>
                <td style={td}>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td style={td}>
                  <button
                    onClick={() => deletePage(p.slug)}
                    style={{ background: "red", color: "#fff", border: "none", padding: "4px 10px", cursor: "pointer", borderRadius: 4 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = { padding: "10px 12px", fontWeight: "bold" };
const td = { padding: "8px 12px" };
