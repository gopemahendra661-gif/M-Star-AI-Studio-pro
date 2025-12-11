
// generate.js - PROFESSIONAL VERSION
// Standard Node.js Serverless Function

export const config = {
  maxDuration: 60,
};

// Updated FREE Models List
const FREE_MODELS = [
  "meta-llama/llama-3-8b-instruct:free",         // Most Reliable
  "google/gemma-2-9b-it:free",                   // Google's Stable Model
  "qwen/qwen-2.5-7b-instruct:free",              // Good JSON response
  "mistralai/mistral-7b-instruct:free",          // Solid Backup
  "huggingfaceh4/zephyr-7b-beta:free",           // Creative
  "meta-llama/llama-3.2-3b-instruct:free",       // Fast & Lightweight
  "microsoft/phi-3-mini-128k-instruct:free"      // Backup
];

const getSystemInstruction = (language, mode) => {
  let langRule = "Reply ONLY in Hinglish (Hindi + English mix).";
  if (language === 'Hindi') langRule = "Reply ONLY in Hindi (Devanagari script).";
  if (language === 'English') langRule = "Reply ONLY in English.";

  return `
You are "M-Star AI Studio", an expert viral content strategist and professional copywriter.
Your goal is to generate high-quality, "real-world" usable content for social media and professional use.

CRITICAL: Return ONLY a VALID JSON object with a "results" array.
LANGUAGE: ${langRule}

MODE: ${mode}

--- SPECIFIC INSTRUCTIONS PER MODE ---

1. **SCRIPT WRITING** (YouTube Shorts / Reels):
   - Output: 2 Complete, distinct scripts.
   - **Structure (Use '\\n' for line breaks)**:
     TITLE: [Catchy Title]
     
     [HOOK]: (0-3s visual/audio hook to stop scrolling)
     
     [SCENE]: (Brief visual direction)
     
     [BODY]: (Main fast-paced content)
     
     [CTA]: (Strong Call to Action - Subscribe/Follow)

2. **DESCRIPTION WRITING** (Instagram / YouTube):
   - Output: 3 Distinct variations.
   - **Structure**:
     [Hook Line for first 2 lines]
     
     [Engaging Summary of content]
     
     Key Points:
     • [Bullet Point 1]
     • [Bullet Point 2]
     • [Bullet Point 3]
     
     [30 relevant SEO hashtags]

3. **TITLE GENERATOR** (YouTube / Blog):
   - Output: 10 High CTR (Click-Through Rate) titles.
   - Techniques: Curiosity Gaps, Negativity Bias, "How To", Listicle Numbers.
   - Style: Punchy, Viral, Shocking.

4. **STYLISH NAME**:
   - Output: 10 Variations.
   - Convert text into Unicode fonts: 𝐁𝐨𝐥𝐝, 𝐼𝑡𝑎𝑙𝑖𝑐, 𝕲𝖔𝖙𝖍𝖎𝖈, 𝒞𝓊𝓇𝓈𝒾𝓋𝑒, Ⓒⓘⓡⓒⓛⓔⓓ, Ｓｐａｃｅｄ, etc.
   - No emojis, just the text styles.

5. **ROAST**:
   - Output: 8 Savage lines.
   - Style: Witty, funny, sarcastic, maybe a bit mean but harmless.

6. **SHAYARI**:
   - Output: 6 High-quality Shayaris.
   - Strict Rhyme (Kafiya) & Meter.
   - Format: 2 lines (Sher) or 4 lines.
   - Use deep Urdu/Hindi words (Ishq, Zindagi, Dard).

7. **BIO / STATUS / CAPTION / QUOTES**:
   - Output: 8 Viral lines.
   - Style: Aesthetic, Attitude, or Deep depending on context.

8. **HASHTAGS**:
   - Output: 15 Highly relevant, niche-specific hashtags.

OUTPUT FORMAT EXAMPLE:
{
  "results": [
    "Item 1 content...",
    "Item 2 content..."
  ]
}
`;
};

// Helper function to parse AI response
const parseAIResponse = (contentString) => {
  try {
    if (!contentString || typeof contentString !== 'string') return [];

    let cleanText = contentString.trim();
    
    // Cleanup markdown
    cleanText = cleanText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/g, '');
    
    // Try Parsing
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = cleanText.substring(jsonStart, jsonEnd + 1);
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.results && Array.isArray(parsed.results)) {
          return parsed.results.filter(i => typeof i === 'string' && i.length > 2);
        }
      } catch(e) { console.log("JSON parse error", e); }
    }

    // Fallback: Split by newlines if JSON fails
    return cleanText.split('\n')
      .map(l => l.replace(/^\d+[\.\)]\s*/, '').replace(/^[\-\*]\s*/, '').trim())
      .filter(l => l.length > 5 && !l.includes('{') && !l.includes('}'));

  } catch (error) {
    console.error("Parse Error:", error);
    return [];
  }
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, mode = 'Auto Detect', language = 'Hinglish' } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'Server Config Error: Missing API Key' });
    if (!prompt || prompt.length < 2) return res.status(400).json({ error: 'Prompt too short' });

    const systemInstruction = getSystemInstruction(language, mode);
    const userPrompt = `Generate ${mode} for: "${prompt}" in ${language}.`;

    // Try models sequentially
    for (const model of FREE_MODELS) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://m-star-ai.vercel.app", 
            "X-Title": "M-Star AI Studio",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 2000, // Increased for scripts
            response_format: { type: "json_object" }
          })
        });

        if (response.status === 429) continue; // Rate limit, try next
        if (!response.ok) continue;

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        const results = parseAIResponse(content);
        
        if (results.length > 0) {
          return res.status(200).json({ results, modelUsed: model });
        }
      } catch (e) {
        console.warn(`Model ${model} failed`, e);
      }
    }

    return res.status(503).json({ error: "All AI models are currently busy. Please try again in a moment." });

  } catch (error) {
    console.error("Handler Fatal Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
