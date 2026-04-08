const axios = require("axios");

async function generateContent(airline, keyword) {
  const prompt = `
Write a high-quality SEO article for:

${airline} ${keyword}

Include:
- H1 title
- 3 sections
- Step-by-step help
- 5 FAQs
- Call-to-action

Make it human-like and unique.
`;

  const res = await axios.post("https://api.openai.com/v1/chat/completions", {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  }, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_KEY}`
    }
  });

  return res.data.choices[0].message.content;
}

module.exports = generateContent;
