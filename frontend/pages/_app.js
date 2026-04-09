import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const hideCall = ["/admin", "/login", "/seo-dashboard"].includes(router.pathname);

  return (
    <>
      <Component {...pageProps} />
      {!hideCall && (
        <a href="tel:+18889185556" style={{
          position: "fixed", bottom: 24, right: 24,
          background: "#cc0000", color: "#fff",
          padding: "13px 22px", borderRadius: 50,
          fontWeight: 700, fontSize: 15,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          zIndex: 9999, textDecoration: "none",
          display: "flex", alignItems: "center", gap: 6
        }}>📞 Call Now</a>
      )}
    </>
  );
}
