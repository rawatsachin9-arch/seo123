const mongoose = require("mongoose");
require("dotenv").config({ path: "../backend/.env" });

// Use worker's own mongoose instance for the model
const { Schema } = mongoose;
const PageSchema = new Schema({
  airline: String,
  keyword: String,
  slug: { type: String, unique: true },
  title: String,
  meta: String,
  content: String
}, { timestamps: true });
const Page = mongoose.models.Page || mongoose.model("Page", PageSchema);

const generateContent = require("../backend/utils/ai");
const generateVariations = require("../backend/utils/variations");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => { console.error("MongoDB error:", err); process.exit(1); });

const airlines = ["Delta Airlines", "United Airlines", "American Airlines"];
const keywords = [
  "change flight",
  "cancel booking",
  "customer service",
  "name correction"
];

async function run() {
  for (let airline of airlines) {
    for (let keyword of keywords) {
      const variations = generateVariations(airline, keyword);

      for (let v of variations) {
        const slug = v.replace(/\s+/g, "-").toLowerCase();

        const exists = await Page.findOne({ slug });
        if (exists) continue;

        console.log("Generating:", slug);

        const content = await generateContent(airline, v);

        await Page.create({
          airline,
          keyword: v,
          slug,
          title: v,
          meta: `Get help with ${airline}`,
          content
        });

        // delay (IMPORTANT)
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  console.log("Bulk generation done 🚀");
  process.exit();
}

run();
