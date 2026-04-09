import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Sky Airline Tickets | Cheap Flights & Airline Reservations</title>
        <meta name="description" content="Book cheap airline tickets and manage your flight reservations with Sky Airline Tickets. 24/7 live agents for US, UK, Canada, UAE, Australia travelers." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://skyairlinetickets.com" />
        <meta property="og:title" content="Sky Airline Tickets | Cheap Flights & Airline Reservations" />
        <meta property="og:description" content="Book flights with major airlines. 24/7 live agent support. Best price guarantee." />
        <meta property="og:url" content="https://skyairlinetickets.com" />
        <meta property="og:type" content="website" />
        <meta name="geo.region" content="US, GB, CA, AU, AE" />
        <link rel="alternate" hrefLang="en-us" href="https://skyairlinetickets.com" />
        <link rel="alternate" hrefLang="en-gb" href="https://skyairlinetickets.com" />
        <link rel="alternate" hrefLang="en-ca" href="https://skyairlinetickets.com" />
        <link rel="alternate" hrefLang="en-au" href="https://skyairlinetickets.com" />
        <link rel="alternate" hrefLang="x-default" href="https://skyairlinetickets.com" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          "name": "Sky Airline Tickets",
          "url": "https://skyairlinetickets.com",
          "telephone": "+18889185556",
          "description": "Airline ticket booking and travel support for US, UK, Canada, UAE and Australia travelers.",
          "areaServed": ["US", "GB", "CA", "AU", "AE"],
          "availableLanguage": "English"
        })}} />
      </Head>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #222; }
        a { text-decoration: none; }
        .nav { background: #00205b; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; height: 64px; }
        .nav-logo { color: #fff; font-size: 1.4rem; font-weight: 800; }
        .nav-logo span { color: #f0a500; }
        .nav-phone { color: #fff; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; }
        .nav-phone a { color: #f0a500; font-weight: 700; font-size: 1.1rem; }
        .hero { background: linear-gradient(135deg, #00205b 0%, #003580 50%, #0055aa 100%); color: #fff; padding: 80px 40px 60px; text-align: center; position: relative; overflow: hidden; }
        .hero::before { content: "✈"; position: absolute; font-size: 300px; opacity: 0.04; top: -60px; right: -40px; }
        .hero h1 { font-size: 2.8rem; font-weight: 800; margin-bottom: 16px; line-height: 1.2; }
        .hero h1 span { color: #f0a500; }
        .hero p { font-size: 1.15rem; opacity: 0.9; max-width: 600px; margin: 0 auto 32px; }
        .hero-cta { display: inline-flex; align-items: center; gap: 10px; background: #cc0000; color: #fff; padding: 18px 40px; border-radius: 50px; font-size: 1.2rem; font-weight: 700; }
        .hero-cta:hover { background: #aa0000; }
        .hero-sub { margin-top: 18px; font-size: 0.9rem; opacity: 0.7; }
        .trust { background: #f0a500; padding: 14px 40px; display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; }
        .trust span { font-size: 13px; font-weight: 600; color: #00205b; display: flex; align-items: center; gap: 6px; }
        .section { padding: 60px 40px; max-width: 1100px; margin: 0 auto; }
        .section-title { text-align: center; font-size: 1.8rem; font-weight: 700; color: #00205b; margin-bottom: 8px; }
        .section-sub { text-align: center; color: #666; margin-bottom: 40px; font-size: 0.95rem; }
        .airlines-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
        .airline-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px 16px; text-align: center; transition: all 0.2s; }
        .airline-card:hover { border-color: #00205b; box-shadow: 0 4px 16px rgba(0,32,91,0.1); transform: translateY(-2px); }
        .airline-card .icon { font-size: 2rem; margin-bottom: 8px; }
        .airline-card .name { font-size: 0.9rem; font-weight: 600; color: #333; }
        .airline-card .num { font-size: 0.8rem; color: #cc0000; font-weight: 500; margin-top: 4px; }
        .services-bg { background: #f8f9fb; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
        .service-card { background: #fff; border-radius: 10px; padding: 28px 20px; text-align: center; border: 1px solid #eee; }
        .service-card .sicon { font-size: 2.2rem; margin-bottom: 12px; }
        .service-card h3 { font-size: 1rem; color: #00205b; margin-bottom: 6px; }
        .service-card p { font-size: 0.85rem; color: #666; line-height: 1.6; }
        .cta-band { background: #cc0000; color: #fff; text-align: center; padding: 50px 40px; }
        .cta-band h2 { font-size: 2rem; margin-bottom: 12px; }
        .cta-band p { font-size: 1rem; opacity: 0.9; margin-bottom: 24px; }
        .cta-band a { background: #fff; color: #cc0000; padding: 16px 44px; border-radius: 50px; font-weight: 700; font-size: 1.15rem; display: inline-block; }
        .disclaimer { background: #f5f5f5; border-top: 1px solid #ddd; padding: 32px 40px; }
        .disclaimer p { font-size: 11.5px; color: #888; line-height: 1.7; max-width: 960px; margin: 0 auto; text-align: center; }
        .footer { background: #00205b; color: #aaa; padding: 24px 40px; text-align: center; font-size: 13px; }
        .footer a { color: #f0a500; margin: 0 8px; }
        .sticky-call { position: fixed; bottom: 24px; right: 24px; background: #cc0000; color: #fff; border-radius: 50px; padding: 14px 24px; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 999; display: flex; align-items: center; gap: 8px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{box-shadow:0 4px 20px rgba(204,0,0,0.4)} 50%{box-shadow:0 4px 32px rgba(204,0,0,0.8)} }
        @media(max-width:600px){ .hero h1{font-size:1.8rem} .nav{padding:0 20px} .trust{gap:16px} .section{padding:40px 20px} }
        @keyframes pulse { 0%,100%{box-shadow:0 4px 20px rgba(204,0,0,0.4)} 50%{box-shadow:0 4px 32px rgba(204,0,0,0.8)} }
      `}</style>

      <nav className="nav">
        <div className="nav-logo">Sky<span>Airline</span>Tickets</div>
        <div className="nav-phone">📞 <a href="tel:+18889185556">1-888-918-5556</a> &nbsp;|&nbsp; 24/7 Support</div>
      </nav>

      <section className="hero">
        <h1>Book Flights &amp; Manage<br /><span>Airline Reservations</span></h1>
        <p>Get instant help with flight bookings, cancellations, changes, and more. Live travel agents available 24/7 for US, UK, Canada, UAE, and Australia travelers.</p>
        <a href="tel:+18889185556" className="hero-cta">📞 Call Now: 1-888-918-5556</a>
        <p className="hero-sub">Toll-free · No hold time · Instant assistance</p>
      </section>

      <div className="trust">
        <span>✈️ All Major Airlines</span>
        <span>🕐 24/7 Live Agents</span>
        <span>🌍 US · UK · CA · UAE · AU</span>
        <span>💳 Best Price Guarantee</span>
        <span>🔒 Secure &amp; Trusted</span>
        <span>⭐ 50,000+ Happy Travelers</span>
      </div>

      <div className="section">
        <h2 className="section-title">Airlines We Support</h2>
        <p className="section-sub">We provide booking and support for all major US and international carriers.</p>
        <div className="airlines-grid">
          {[
            "Delta Airlines","United Airlines","American Airlines","Southwest Airlines",
            "Spirit Airlines","JetBlue Airways","Alaska Airlines","Frontier Airlines",
            "Allegiant Air","Sun Country Airlines"
          ].map(name => (
            <div key={name} className="airline-card">
              <div className="icon">✈️</div>
              <div className="name">{name}</div>
              <div className="num">📞 1-888-918-5556</div>
            </div>
          ))}
        </div>
      </div>

      <div className="services-bg">
        <div className="section">
          <h2 className="section-title">How We Help You</h2>
          <p className="section-sub">Our agents handle everything — fast, easy, no hold time.</p>
          <div className="services-grid">
            {[
              { icon: "🎫", title: "New Reservations", desc: "Book one-way, round-trip or multi-city flights at the best available fares." },
              { icon: "🔄", title: "Flight Changes", desc: "Change your travel dates, times or destination quickly and hassle-free." },
              { icon: "❌", title: "Cancellations", desc: "Cancel flights and get help understanding refund and credit policies." },
              { icon: "💰", title: "Refund Requests", desc: "Track and expedite refund claims with direct airline support." },
              { icon: "🧳", title: "Baggage Help", desc: "Resolve lost, delayed or damaged baggage issues with our agents." },
              { icon: "💺", title: "Seat Upgrades", desc: "Request seat upgrades, extra legroom or premium cabin availability." },
              { icon: "📋", title: "Name Corrections", desc: "Fix name errors on tickets before your flight quickly." },
              { icon: "🌐", title: "Group Bookings", desc: "Book 10+ passengers at group rates with dedicated support." },
            ].map(s => (
              <div key={s.title} className="service-card">
                <div className="sicon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cta-band">
        <h2>Need Help Right Now?</h2>
        <p>Our travel experts are standing by — no automated menus, no long waits.</p>
        <a href="tel:+18889185556">📞 Call 1-888-918-5556</a>
      </div>

      <div className="disclaimer">
        <p>
          <strong>Disclaimer:</strong> SkyAirlineTickets.com is an independent travel services company and is not affiliated with, endorsed by, or officially connected to Delta Airlines, United Airlines, American Airlines, Southwest Airlines, Spirit Airlines, JetBlue Airways, Alaska Airlines, Frontier Airlines, Allegiant Air, Sun Country Airlines, or any other airline or travel company. All airline names, logos, and trademarks are the property of their respective owners. We are a third-party booking and customer service provider. Fares, fees, and policies are subject to change without notice. Calling our number connects you to our independent travel agents. This website is for informational and booking assistance purposes only.
        </p>
      </div>

      <footer className="footer">
        <div>© {new Date().getFullYear()} SkyAirlineTickets.com · All rights reserved</div>
        <div style={{ marginTop: 8 }}>
          <a href="/page/airlines/delta-airlines/customer-service">Delta Help</a>
          <a href="/page/airlines/united-airlines/customer-service">United Help</a>
          <a href="/page/airlines/american-airlines/customer-service">American Help</a>
        </div>
      </footer>

      <a href="tel:+18889185556" className="sticky-call">📞 Call Now</a>
    </>
  );
}