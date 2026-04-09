const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

const Page = require("./models/Page");
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
  res.json(page);
});

app.post("/track-call/*", async (req, res) => {
  const slug = req.params[0];
  await Page.findOneAndUpdate({ slug }, { $inc: { callClicks: 1 } });
  res.json({ success: true });
});

app.delete("/page/*", async (req, res) => {
  const slug = req.params[0];
  await Page.deleteOne({ slug });
  res.json({ success: true });
});

app.post("/generate", async (req, res) => {
  const { airline, keyword } = req.body;

  const slug = `airlines/${airline.toLowerCase().replace(/\s+/g, "-")}/${keyword.replace(/\s+/g, "-")}`;

  const existingPages = await Page.find();

  const aiContent = await generateContent(airline, keyword);

  const links = generateLinks(
    { airline, slug },
    existingPages
  );

  const finalContent = `<div class="intro"><p>${page?.meta || ""}</p></div>` + aiContent + `<div class="internal-links"><h3>Related Pages</h3>${links}</div>`;

  const page = await Page.create({
    airline,
    keyword,
    slug,
    title: `${airline} ${keyword}`,
    meta: `Get help with ${airline} ${keyword}`,
    content: finalContent
  });

  res.json(page);
});

app.get("/sitemap.xml", async (req, res) => {
  const pages = await Page.find();

  const urls = pages.map(p =>
    `<url><loc>https://skyairlinetickets.com/page/${p.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
  ).join("");

  res.header("Content-Type", "application/xml; charset=utf-8");
  res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
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
