const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

const Page = require("./models/Page");
const GeoVisit = require("./models/GeoVisit");
const generateContent = require("./utils/ai");
const generateLinks = require("./utils/internalLinks");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

app.get("/pages", async (req,res)=>{
  const pages = await Page.find().sort({createdAt:-1});
  res.json(pages);
});

app.get("/page/*", async (req, res) => {
  const slug = req.params[0];
  const page = await Page.findOneAndUpdate(
    { slug },
    { $inc: { pageViews: 1 } },
    { new: true }
  );
  if (!page) return res.status(404).json({ error: "Not found" });

  // Log geo data from visitor IP (fire-and-forget)
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  if (ip && ip !== "127.0.0.1" && ip !== "::1") {
    axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 4000 })
      .then(g => {
        if (g.data && !g.data.error) {
          GeoVisit.create({ slug, country: g.data.country_name, city: g.data.city, region: g.data.region, ip });
        }
      })
      .catch(() => {});
  }

  res.json(page);
});

app.post("/track-call/*", async (req, res) => {
  const slug = req.params[0];
  await Page.findOneAndUpdate({ slug }, { $inc: { callClicks: 1 } });
  res.json({ success: true });
});

// GET /geo-stats?slug=... (omit slug for all pages)
app.get("/geo-stats", async (req, res) => {
  const match = req.query.slug ? { slug: req.query.slug } : {};

  const [byCountry, byCity, recent] = await Promise.all([
    GeoVisit.aggregate([
      { $match: match },
      { $group: { _id: "$country", visits: { $sum: 1 } } },
      { $sort: { visits: -1 } },
      { $limit: 20 }
    ]),
    GeoVisit.aggregate([
      { $match: match },
      { $group: { _id: { city: "$city", country: "$country" }, visits: { $sum: 1 } } },
      { $sort: { visits: -1 } },
      { $limit: 20 }
    ]),
    GeoVisit.find(match).sort({ createdAt: -1 }).limit(50).select("slug country city createdAt -_id")
  ]);

  res.json({ byCountry, byCity, recent });
});

app.delete("/page/*", async (req, res) => {
  const slug = req.params[0];
  await Page.deleteOne({ slug });
  res.json({ success: true });
});

app.post("/generate", async (req, res) => {
  try {
    const { airline, keyword } = req.body;
    if (!airline || !keyword) return res.status(400).json({ error: "airline and keyword are required" });

    const slug = `airlines/${airline.toLowerCase().replace(/\s+/g, "-")}/${keyword.toLowerCase().replace(/\s+/g, "-")}`;

    const existing = await Page.findOne({ slug });
    if (existing) return res.json(existing);

    const existingPages = await Page.find({}, "airline slug");
    const meta = `Get help with ${airline} ${keyword} — tips, steps, and FAQs.`;

    const aiContent = await generateContent(airline, keyword);
    const links = generateLinks({ airline, slug }, existingPages);

    const finalContent = aiContent + `<div class="internal-links"><h3>Related Pages</h3>${links}</div>`;

    const page = await Page.create({
      airline,
      keyword,
      slug,
      title: `${airline} ${keyword}`,
      meta,
      content: finalContent
    });

    res.json(page);
  } catch (e) {
    console.error("Generate error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get("/sitemap.xml", async (req, res) => {
  const pages = await Page.find();
  const locales = [
    { hreflang: "en-us", suffix: "" },
    { hreflang: "en-gb", suffix: "" },
    { hreflang: "en-ca", suffix: "" },
    { hreflang: "en-au", suffix: "" },
    { hreflang: "en-ae", suffix: "" },
    { hreflang: "x-default", suffix: "" },
  ];

  const urls = pages.map(p => {
    const loc = `https://skyairlinetickets.com/page/${p.slug}`;
    const alternates = locales.map(l =>
      `<xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${loc}" />`
    ).join("");
    return `<url><loc>${loc}</loc>${alternates}<changefreq>weekly</changefreq><priority>0.8</priority></url>`;
  }).join("");

  res.header("Content-Type", "application/xml; charset=utf-8");
  res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`);
});

app.get("/rank-check", async (req, res) => {
  const { keyword, slug } = req.query;
  const GCSE_KEY = process.env.GOOGLE_CSE_KEY;
  const GCSE_CX  = process.env.GOOGLE_CSE_CX;
  const BING_KEY = process.env.BING_SEARCH_KEY;
  const pageUrl  = `https://skyairlinetickets.com/page/${slug}`;

  if (!GCSE_KEY || !GCSE_CX) {
    return res.json({ rank: null, indexed: null, bingIndexed: null, error: "Google CSE not configured" });
  }

  try {
    // Google: ranking check
    const rankRes = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: { key: GCSE_KEY, cx: GCSE_CX, q: keyword, num: 10 }
    });
    const items = rankRes.data.items || [];
    const rankPosition = items.findIndex(item => item.link.includes(slug));
    const rank = rankPosition >= 0 ? rankPosition + 1 : null;

    // Google: index check
    const indexRes = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: { key: GCSE_KEY, cx: GCSE_CX, q: `site:${pageUrl}`, num: 1 }
    });
    const indexed = (indexRes.data.searchInformation?.totalResults || "0") !== "0";

    // Bing: index check via Bing Web Search API
    let bingIndexed = null;
    if (BING_KEY) {
      try {
        const bingRes = await axios.get("https://api.bing.microsoft.com/v7.0/search", {
          params: { q: `site:${pageUrl}`, count: 1 },
          headers: { "Ocp-Apim-Subscription-Key": BING_KEY }
        });
        const total = bingRes.data.webPages?.totalEstimatedMatches || 0;
        bingIndexed = total > 0;
      } catch { bingIndexed = null; }
    } else {
      // Fallback: check via Bing site: link (no API key needed — just a signal)
      bingIndexed = "no-key";
    }

    res.json({ rank, indexed, bingIndexed });
  } catch (e) {
    res.json({ rank: null, indexed: null, bingIndexed: null, error: e.message });
  }
});

app.post("/indexnow", async (req, res) => {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return res.status(400).json({ error: "INDEXNOW_KEY not set in .env" });

  const pages = await Page.find({}, "slug");
  const urls = pages.map(p => `https://skyairlinetickets.com/page/${p.slug}`);

  try {
    const response = await axios.post("https://www.bing.com/indexnow", {
      host: "skyairlinetickets.com",
      key,
      keyLocation: `https://skyairlinetickets.com/${key}.txt`,
      urlList: urls
    }, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      timeout: 15000
    });

    res.json({ success: true, submitted: urls.length, status: response.status });
  } catch (e) {
    const errDetail = e.response ? `HTTP ${e.response.status}: ${JSON.stringify(e.response.data)}` : e.message;
    res.json({ success: false, error: errDetail });
  }
});

app.post("/generate-all", async (req, res) => {
  const airlines = require("../data/airlines.json");
  const keywords = require("../data/keywords.json");

  const pairs = [];
  for (const airline of airlines) {
    for (const keyword of keywords) {
      const slug = `airlines/${airline.toLowerCase().replace(/\s+/g, "-")}/${keyword.toLowerCase().replace(/\s+/g, "-")}`;
      const exists = await Page.findOne({ slug });
      if (!exists) pairs.push({ airline, keyword, slug });
    }
  }

  if (pairs.length === 0) return res.json({ message: "All pages already exist", generated: 0 });

  // respond immediately, generate in background
  res.json({ message: `Queued ${pairs.length} pages for generation`, total: pairs.length });

  (async () => {
    const generateLinks = require("./utils/internalLinks");
    let done = 0;
    for (const { airline, keyword, slug } of pairs) {
      try {
        const existingPages = await Page.find({}, "airline slug");
        const meta = `Get help with ${airline} ${keyword} — tips, steps, and FAQs.`;
        const aiContent = await generateContent(airline, keyword);
        const links = generateLinks({ airline, slug }, existingPages);
        await Page.create({
          airline, keyword, slug,
          title: `${airline} ${keyword}`,
          meta, content: aiContent + `<div class="internal-links"><h3>Related Pages</h3>${links}</div>`
        });
        done++;
        console.log(`Bulk [${done}/${pairs.length}]: ${slug}`);
      } catch (e) {
        console.error(`Bulk failed ${slug}:`, e.message);
      }
      await new Promise(r => setTimeout(r, 3000));
    }
    console.log(`Bulk generation complete: ${done}/${pairs.length}`);
  })();
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "rawatsachin9@gmail.com";
  const ADMIN_PASS  = process.env.ADMIN_PASS  || "Farebulk@123$";
  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    return res.json({ success: true, token: "admin-secret-token" });
  }
  res.status(401).json({ success: false, message: "Invalid credentials" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log(`Backend running on port ${PORT}`));
