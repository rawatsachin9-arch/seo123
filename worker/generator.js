const mongoose = require("mongoose");
require("dotenv").config({ path: "../backend/.env" });

const { Schema } = mongoose;
const PageSchema = new Schema({
  airline: String,
  keyword: String,
  slug: { type: String, unique: true },
  title: String,
  meta: String,
  content: String,
  callClicks: { type: Number, default: 0 },
  pageViews: { type: Number, default: 0 }
}, { timestamps: true });
const Page = mongoose.models.Page || mongoose.model("Page", PageSchema);

const generateContent = require("../backend/utils/ai");
const generateLinks = require("../backend/utils/internalLinks");

const airlines = require("../data/airlines.json");
const keywords = require("../data/keywords.json");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => { console.error("MongoDB error:", err); process.exit(1); });

async function run() {
  let generated = 0;
  let skipped = 0;

  for (const airline of airlines) {
    for (const keyword of keywords) {
      const slug = `airlines/${airline.toLowerCase().replace(/\s+/g, "-")}/${keyword.toLowerCase().replace(/\s+/g, "-")}`;

      const exists = await Page.findOne({ slug });
      if (exists) { skipped++; continue; }

      console.log(`[${generated + 1}] Generating: ${slug}`);

      try {
        const existingPages = await Page.find({}, "airline slug");
        const meta = `Get help with ${airline} ${keyword} — tips, steps, and FAQs.`;
        const aiContent = await generateContent(airline, keyword);
        const links = generateLinks({ airline, slug }, existingPages);
        const finalContent = aiContent + `<div class="internal-links"><h3>Related Pages</h3>${links}</div>`;

        await Page.create({
          airline,
          keyword,
          slug,
          title: `${airline} ${keyword}`,
          meta,
          content: finalContent
        });

        generated++;
        console.log(`  ✅ Done (${generated} generated, ${skipped} skipped)`);
      } catch (e) {
        console.error(`  ❌ Failed: ${e.message}`);
      }

      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log("Bulk generation done 🚀");
  process.exit();
}

run();
