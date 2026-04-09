const axios = require("axios");

const TARGET_MARKETS = "United States, Canada, United Kingdom, UAE (Dubai/Abu Dhabi), Australia, and Europe (including Germany, France, Italy, Spain)";

async function generateContent(airline, keyword) {
  const prompt = `You are an expert travel content writer targeting international travelers from ${TARGET_MARKETS}.

Write a detailed, high-quality SEO page for people searching: "${airline} ${keyword}".

IMPORTANT TARGETING RULES:
- Write in American English (primary audience: USA, Canada)
- Include natural references to travelers from the US, UK, UAE, Australia and Europe
- Mention USD pricing examples where relevant
- Reference calling from US/Canada toll-free numbers
- Include tips specific to international travelers (time zones, layovers, currency)
- Make the content feel globally relevant but US-first

Return ONLY valid HTML (no markdown, no code blocks). Use this exact structure:

<section class="intro">
  <p>[2-3 sentence compelling intro about ${airline} and ${keyword} — mention international travelers]</p>
</section>

<section class="main-content">
  <h2>[Section 1 heading related to ${keyword}]</h2>
  <p>[detailed paragraph — include tips for US, UK and international passengers]</p>
  <ul><li>[tip 1]</li><li>[tip 2]</li><li>[tip 3]</li><li>[tip 4]</li></ul>

  <h2>[Section 2 heading - step by step guide]</h2>
  <ol><li>[step 1]</li><li>[step 2]</li><li>[step 3]</li><li>[step 4]</li><li>[step 5]</li></ol>

  <h2>[Section 3 heading - tips for international travelers]</h2>
  <p>[paragraph covering advice for travelers from US, Canada, UK, UAE, Australia, Europe]</p>
  <ul><li>[tip for US/Canada travelers]</li><li>[tip for UK/Europe travelers]</li><li>[tip for UAE/Australia travelers]</li></ul>
</section>

<section class="faq">
  <h2>Frequently Asked Questions</h2>
  <div class="faq-item"><h3>[Question 1 about ${airline} ${keyword} from US travelers?]</h3><p>[Answer]</p></div>
  <div class="faq-item"><h3>[Question 2 — relevant for UK or European passengers?]</h3><p>[Answer]</p></div>
  <div class="faq-item"><h3>[Question 3 — relevant for UAE or Australian travelers?]</h3><p>[Answer]</p></div>
  <div class="faq-item"><h3>[Question 4?]</h3><p>[Answer]</p></div>
  <div class="faq-item"><h3>[Question 5?]</h3><p>[Answer]</p></div>
</section>

Make content 100% human-like, unique, helpful and at least 900 words total. Do NOT include <html>, <head>, <body> tags. Do NOT use <h1> tags anywhere — use <h2> for all section headings.`;

  const res = await axios.post("https://api.openai.com/v1/chat/completions", {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8
  }, {
    headers: { Authorization: `Bearer ${process.env.OPENAI_KEY}` }
  });

  return res.data.choices[0].message.content;
}

module.exports = generateContent;
