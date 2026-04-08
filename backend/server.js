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
  const page = await Page.findOne({ slug });
  if (!page) return res.status(404).json({ error: "Not found" });
  res.json(page);
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

  const callCTA = `
<div style="background:#ffcc00;padding:15px;text-align:center;">
  <h2>📞 Talk to a Live Agent Now</h2>
  <p>24/7 Support Available – No Wait</p>
  <a href="tel:+18889185556" style="background:red;color:white;padding:10px 20px;text-decoration:none;">
    Call Now: 1-888-918-5556
  </a>
</div>
`;

  const finalContent = callCTA + aiContent + callCTA + "<h3>Related Pages</h3>" + links;

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
    `<url><loc>https://skyairlinetickets.com/page/${p.slug}</loc></url>`
  ).join("");

  res.header("Content-Type", "application/xml");
  res.send(`<?xml version="1.0"?><urlset>${urls}</urlset>`);
});

app.get("/rank-check", async (req, res) => {
  const { keyword, slug } = req.query;
  const GCSE_KEY = process.env.GOOGLE_CSE_KEY;
  const GCSE_CX  = process.env.GOOGLE_CSE_CX;
  const pageUrl  = `https://skyairlinetickets.com/page/${slug}`;

  if (!GCSE_KEY || !GCSE_CX) {
    return res.json({ rank: null, indexed: null, error: "Google CSE not configured" });
  }

  try {
    // Check ranking for the keyword
    const rankRes = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: { key: GCSE_KEY, cx: GCSE_CX, q: keyword, num: 10 }
    });
    const items = rankRes.data.items || [];
    const rankPosition = items.findIndex(item => item.link.includes(slug));
    const rank = rankPosition >= 0 ? rankPosition + 1 : null;

    // Check if page is indexed via site: search
    const indexRes = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: { key: GCSE_KEY, cx: GCSE_CX, q: `site:${pageUrl}`, num: 1 }
    });
    const indexed = (indexRes.data.searchInformation?.totalResults || "0") !== "0";

    res.json({ rank, indexed });
  } catch (e) {
    res.json({ rank: null, indexed: null, error: e.message });
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
