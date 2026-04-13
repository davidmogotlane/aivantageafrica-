// api/aiva.js — Vercel Serverless Function
// This keeps your Anthropic API key server-side. Never exposed to the browser.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (prompt.length > 2000) {
    return res.status(400).json({ error: "Prompt too long" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system:
          "You are AIVA — AIVANTAGEAFRICA's AI assistant. You help African solopreneurs, founders, and freelancers generate high-converting copy, strategy, and business content. Be bold, direct, Africa-aware, and ultra-practical. Output in clean plain text only. No markdown symbols.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err?.error?.message || "API error" });
    }

    const data = await response.json();
    const text = data.content?.map((b) => b.text || "").join("") || "";
    return res.status(200).json({ result: text });
  } catch (error) {
    console.error("AIVA API error:", error);
    return res.status(500).json({ error: "Server error. Please retry." });
  }
}
