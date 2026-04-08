const axios = require("axios");

async function generateContent(airline, keyword) {
  const prompt = `You are an expert travel content writer. Write a detailed, high-quality SEO page for people searching: "${airline} ${keyword}".

Return ONLY valid HTML (no markdown, no code blocks). Use this exact structure:

<section class="intro">
  <p>[2-3 sentence compelling intro about ${airline} and ${keyword}]</p>
</section>

<section class="main-content">
  <h2>[Section 1 heading related to ${keyword}]</h2>
  <p>[detailed paragraph]</p>
  <ul><li>[tip 1]</li><li>[tip 2]</li><li>[tip 3]</li><li>[tip 4]</li></ul>

  <h2>[Section 2 heading - step by step guide]</h2>
  <ol><li>[step 1]</li><li>[step 2]</li><li>[step 3]</li><li>[step 4]</li><li>[step 5]</li></ol>

  <h2>[Section 3 heading - tips and tricks]</h2>
  <p>[detailed paragraph with advice]</p>
  <ul><li>[tip]</li><li>[tip]</li><li>[tip]</li></ul>
</section>

<section class="faq">
  <h2>Frequently Asked Questions</h2>
  <div class="faq-item"><h3>[Question 1 about ${airline} ${keyword}?]</h3><p>[Answer]</p></div>
  <div class="faq-item"><h3>[Question 2?]</h3><p>[Answer]</p></div>
  <div class="faq-item"><h3>[Question 3?]</h3><p>[Answer]</p></div>
  <div class="faq-item"><h3>[Question 4?]</h3><p>[Answer]</p></div>
  <div class="faq-item"><h3>[Question 5?]</h3><p>[Answer]</p></div>
</section>

Make content 100% human-like, unique, helpful and at least 800 words total. Do NOT include <html>, <head>, <body> tags.`;

  const res = await axios.post("https://api.openai.com/v1/chat/completions", {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8
  }, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_KEY}`
    }
  });

  return res.data.choices[0].message.content;
}

module.exports = generateContent;
