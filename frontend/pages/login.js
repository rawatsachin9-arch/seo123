import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem("admin_token", res.data.token);
        router.push("/admin");
      }
    } catch (err) {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: 6, color: "#1a1a1a" }}>🔐 Admin Login</h2>
        <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>skyairlinetickets.com</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          {error && <p style={{ color: "red", fontSize: 13, marginBottom: 10 }}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: "100vh",
    background: "#f4f6fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#fff",
    padding: "40px 36px",
    borderRadius: 12,
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    minWidth: 340,
    textAlign: "center",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "10px 14px",
    marginBottom: 14,
    fontSize: 15,
    border: "1px solid #ddd",
    borderRadius: 8,
    boxSizing: "border-box",
    outline: "none",
  },
  btn: {
    width: "100%",
    padding: "11px 0",
    background: "#e00",
    color: "#fff",
    fontSize: 16,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: 4,
  },
};
