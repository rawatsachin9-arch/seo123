export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <div style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: "red",
        padding: "15px",
        borderRadius: "50%",
        zIndex: 9999
      }}>
        <a href="tel:+18889185556" style={{color:"#fff", fontSize:"18px"}}>
          📞 Call
        </a>
      </div>
    </>
  );
}
