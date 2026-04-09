import axios from "axios";
import Head from "next/head";

const API = process.env.NEXT_PUBLIC_API_URL;

function trackCall(slug) {
  try { axios.post(`${API}/track-call/${slug}`); } catch {}
}

// Curated Pexels airplane/travel images (free, stable URLs)
const heroImages = [
  "https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop",
  "https://images.pexels.com/photos/912050/pexels-photo-912050.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop",
  "https://images.pexels.com/photos/62623/wing-plane-flying-airplane-62623.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop",
  "https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop",
  "https://images.pexels.com/photos/723240/pexels-photo-723240.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop",
  "https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop",
  "https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop",
  "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop",
];

function getHeroImage(airline) {
  // Pick a consistent image per airline using a simple hash
  let hash = 0;
  for (let i = 0; i < airline.length; i++) hash += airline.charCodeAt(i);
  return heroImages[hash % heroImages.length];
}

export default function PageView({ page }) {
  if (!page) return (
    <div style={{ padding: 80, textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>Page not found.</h2>
      <a href="/" style={{ color: "#e00" }}>← Back to Home</a>
    </div>
  );

  const heroImg = getHeroImage(page.airline);

  // Fix: ensure meta description is 150-160 chars and never empty
  const metaDesc = page.meta
    ? (page.meta.length > 160 ? page.meta.substring(0, 157) + "..." : page.meta)
    : `Get expert help with ${page.title}. Call our 24/7 travel agents for ${page.airline} assistance at 1-888-918-5556.`;

  // Fix: strip any <h1> tags from AI content to avoid multiple H1s
  const cleanContent = (page.content || "").replace(/<h1[^>]*>.*?<\/h1>/gi, (match) => {
    const text = match.replace(/<[^>]+>/g, "");
    return `<h2>${text}</h2>`;
  });

  const pageUrl = `https://skyairlinetickets.com/page/${page.slug}`;

  return (
    <>
      <Head>
        <title>{page.title} | SkyAirlineTickets</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image" content={heroImg} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta name="robots" content="index, follow" />
        {/* Geo targeting — US, CA, UK, UAE, AU, Europe */}
        <meta name="language" content="en" />
        <meta httpEquiv="content-language" content="en-US, en-GB, en-CA, en-AU, en-AE" />
        <meta name="geo.region" content="US, GB, CA, AU, AE" />
        <meta name="geo.placename" content="United States, United Kingdom, Canada, Australia, UAE" />
        {/* hreflang for target markets */}
        <link rel="alternate" hrefLang="en-us" href={pageUrl} />
        <link rel="alternate" hrefLang="en-gb" href={pageUrl} />
        <link rel="alternate" hrefLang="en-ca" href={pageUrl} />
        <link rel="alternate" hrefLang="en-au" href={pageUrl} />
        <link rel="alternate" hrefLang="en-ae" href={pageUrl} />
        <link rel="alternate" hrefLang="en-eu" href={pageUrl} />
        <link rel="alternate" hrefLang="x-default" href={pageUrl} />
        {/* JSON-LD structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": page.title,
          "description": metaDesc,
          "image": heroImg,
          "url": pageUrl,
          "author": { "@type": "Organization", "name": "SkyAirlineTickets" },
          "publisher": { "@type": "Organization", "name": "SkyAirlineTickets", "url": "https://skyairlinetickets.com" },
          "audience": { "@type": "Audience", "geographicArea": { "@type": "AdministrativeArea", "name": "US, CA, GB, AU, AE, EU" } },
          "inLanguage": "en"
        }) }} />
      </Head>

      <style>{`
        body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fa; color: #222; }
        .hero { position: relative; width: 100%; height: 340px; overflow: hidden; }
        .hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; }
        .hero-overlay h1 { color: #fff; font-size: 2rem; margin: 0 0 10px; text-shadow: 0 2px 8px rgba(0,0,0,0.5); max-width: 800px; }
        .hero-overlay p { color: #ffe; font-size: 1rem; margin: 0; }
        .cta-bar { background: #cc0000; color: #fff; text-align: center; padding: 18px; font-size: 1.1rem; }
        .cta-bar a { color: #fff; font-weight: bold; font-size: 1.2rem; text-decoration: none; background: #fff; color: #cc0000; padding: 10px 28px; border-radius: 30px; margin-left: 14px; }
        .trust-bar { display: flex; justify-content: center; gap: 32px; background: #fff; padding: 14px 20px; border-bottom: 1px solid #eee; font-size: 13px; color: #555; flex-wrap: wrap; }
        .trust-bar span { display: flex; align-items: center; gap: 6px; }
        .container { max-width: 860px; margin: 0 auto; padding: 36px 24px 60px; }
        .intro { background: #fff; border-left: 4px solid #cc0000; padding: 20px 24px; border-radius: 8px; margin-bottom: 28px; font-size: 1.05rem; line-height: 1.7; }
        .main-content h2 { color: #cc0000; font-size: 1.35rem; margin-top: 36px; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; }
        .main-content p { line-height: 1.8; font-size: 1rem; }
        .main-content ul, .main-content ol { padding-left: 22px; line-height: 2; }
        .main-content li { margin-bottom: 4px; }
        .faq { margin-top: 40px; }
        .faq h2 { color: #cc0000; font-size: 1.35rem; margin-bottom: 16px; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; }
        .faq-item { background: #fff; border: 1px solid #eee; border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
        .faq-item h3 { margin: 0; padding: 14px 18px; font-size: 0.98rem; cursor: pointer; background: #fafafa; color: #333; }
        .faq-item p { margin: 0; padding: 0 18px 14px; font-size: 0.95rem; line-height: 1.7; color: #555; }
        .cta-bottom { background: linear-gradient(135deg, #cc0000, #ff4444); color: #fff; text-align: center; padding: 40px 20px; border-radius: 12px; margin-top: 48px; }
        .cta-bottom h2 { margin: 0 0 8px; font-size: 1.6rem; }
        .cta-bottom p { margin: 0 0 20px; opacity: 0.9; }
        .cta-bottom a { background: #fff; color: #cc0000; padding: 14px 36px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 1.1rem; }
        .internal-links { margin-top: 40px; background: #fff; padding: 24px; border-radius: 8px; border: 1px solid #eee; }
        .internal-links h3 { color: #333; margin-top: 0; }
        @media (max-width: 600px) { .hero-overlay h1 { font-size: 1.3rem; } .trust-bar { gap: 14px; } }
      `}</style>

      {/* Hero Image - descriptive alt for SEO */}
      <div className="hero">
        <img src={heroImg} alt={`${page.airline} - ${page.keyword || page.title} help and support`} width="1200" height="400" />
        <div className="hero-overlay">
          <p style={{ color: "#ffe", fontSize: "1rem", margin: 0 }}>Fast • Reliable • 24/7 Support</p>
        </div>
      </div>

      {/* Single H1 — visible, outside overlay, crawlable */}
      <div style={{ background: "#1a1a2e", color: "#fff", textAlign: "center", padding: "18px 20px" }}>
        <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700 }}>{page.title}</h1>
      </div>

      {/* Top CTA Bar */}
      <div className="cta-bar">
        📞 Speak to a Live Agent Now — No Hold Time!
        <a href="tel:+18889185556" onClick={() => trackCall(page.slug)}>Call 1-888-918-5556</a>
      </div>

      {/* Trust Signals */}
      <div className="trust-bar">
        <span>🇺🇸 US Toll-Free Support</span>
        <span>🇬🇧 UK Travelers Welcome</span>
        <span>🇦🇪 UAE / Dubai Routes</span>
        <span>🇦🇺 Australia & NZ</span>
        <span>🕐 24/7 Live Agents</span>
        <span>⭐ 50,000+ Happy Travelers</span>
      </div>

      {/* Main Content — H1s from AI stripped to H2 to avoid duplicates */}
      <div className="container">
        <div dangerouslySetInnerHTML={{ __html: cleanContent }} />

        {/* Bottom CTA */}
        <div className="cta-bottom">
          <h2>Need Help? We&apos;re Here 24/7</h2>
          <p>Our travel experts are ready to assist you right now — no waiting, no hassle.</p>
          <a href="tel:+18889185556" onClick={() => trackCall(page.slug)}>📞 Call 1-888-918-5556</a>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const slug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug;
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/page/${slug}`);
    return { props: { page: res.data } };
  } catch {
    return { props: { page: null } };
  }
}
