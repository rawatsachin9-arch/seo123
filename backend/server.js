const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log(`Backend running on port ${PORT}`));
