// Standard Node.js Serverless Function
export const config = {
  maxDuration: 60, // Maximum allowed duration for reliable fallbacks
};

// 100% FREE & STABLE OpenRouter Models List
// Removed all "Experimental", "Preview" or "DeepSeek" models that cause 404/400 errors or high traffic issues.
const FREE_MODELS = [
  "meta-llama/llama-3-8b-instruct:free",         // Most Reliable & Free
  "google/gemma-2-9b-it:free",                   // Google's Stable Free Model
  "mistralai/mistral-7b-instruct:free",          // Solid Backup
  "huggingfaceh4/zephyr-7b-beta:free",           // Good for creative text
  "meta-llama/llama-3.2-3b-instruct:free",       // Fast & Lightweight
  "microsoft/phi-3-mini-128k-instruct:free"      // Backup
];

const getSystemInstruction = (language) => {
  let langRule = "Reply ONLY in Hinglish (Hindi + English mix).";
  if (language === 'Hindi') langRule = "Reply ONLY in Hindi (Devanagari script).";
  if (language === 'English') langRule = "Reply ONLY in English.";

  return `
You are "M-Star AI Studio", a viral content generator.

Your job:
- Generate Roast, Compliment, WhatsApp Bio, Stylish Font Names, Captions, Viral Status, Hashtags.
- Auto-detect mode based on user text if mode is AUTO.

CONTENT RULES:
1. ${langRule}
2. Never add warnings or moral lectures.
3. Keep lines punchy, viral, short.
4. Emojis allowed but not too many.
5. All responses must be completely unique & non-cringe.
6. For roasts: keep it funny, harmless, witty.
7. For compliments: smooth & classy.
8. For bio: 1–2 line short bios + stylish fonts.
9. If user gives a name, treat it as "Stylish Font Name Mode".

MODES:
1) ROAST MODE: "🔥 Roast Pack" (Funny savage lines)
2) COMPLIMENT MODE: Smooth classy compliments.
3) BIO MODE: Attitude/Love bios + font variations.
4) CAPTION MODE: Attitude, Love, Sad, Gym, Travel, Friendship, Life.
5) STATUS MODE: Viral WhatsApp status lines.
6) STYLISH NAME MODE: Stylish font versions of the name.
7) HASHTAG MODE: Viral niche hashtags.

OUTPUT FORMAT:
You MUST return a VALID JSON object. 
Do not wrap it in markdown code blocks like \`\`\`json. Just raw JSON string.

Structure:
{
  "results": [
    "Line 1 content...",
    "Line 2 content...",
    "Line 3 content..."
  ]
}
`;
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, mode, language = 'Hinglish' } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("API Key Missing");
      return res.status(500).json({ error: 'Server Config Error: OPENROUTER_API_KEY is missing in Vercel.' });
    }

    const systemInstruction = getSystemInstruction(language);

    const userPrompt = mode === 'Auto Detect' 
      ? `User Input: "${prompt}". Detect the intent and generate the best matching content in ${language}. Return JSON.`
      : `Mode: ${mode}. User Input: "${prompt}". Generate content specifically for this mode in ${language}. Return JSON.`;

    let lastError = null;
    let successfulModel = null;

    // Iterate through FREE models
    for (const model of FREE_MODELS) {
      try {
        console.log(`Trying Free Model: ${model}`);
        
        // Timeout 25s
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

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
            temperature: 0.85,
            max_tokens: 1000,
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Special handling for Rate Limits
        if (response.status === 429) {
          console.warn(`Model ${model} Rate Limited (429). Skipping.`);
          continue; // Try next model immediately
        }

        // Handle 404/400 (Model unavailable)
        if (response.status === 404 || response.status === 400) {
          console.warn(`Model ${model} not found/invalid (${response.status}). Skipping.`);
          continue;
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter Error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const contentString = data.choices?.[0]?.message?.content;

        if (!contentString) throw new Error("Empty response from AI");

        // --- RESPONSE CLEANER ---
        let cleanJson = contentString.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
        
        const startIndex = cleanJson.indexOf("{");
        const endIndex = cleanJson.lastIndexOf("}");
        
        if (startIndex !== -1 && endIndex !== -1) {
          cleanJson = cleanJson.substring(startIndex, endIndex + 1);
        }

        let results = [];
        try {
          const parsed = JSON.parse(cleanJson);
          if (parsed.results && Array.isArray(parsed.results)) {
            results = parsed.results;
          } else if (Array.isArray(parsed)) {
             results = parsed;
          }
        } catch (e) {
          // Fallback: Line Splitter
          results = cleanJson.split('\n')
            .map(line => line.replace(/^\d+\.\s*/, '').replace(/^- \s*/, '').replace(/^"|",?$/g, '').trim())
            .filter(l => l.length > 5 && !l.includes("Results") && !l.includes("Here is") && !l.includes("{") && !l.includes("}"));
        }

        if (results.length === 0) throw new Error("No usable results found in response");

        // Success!
        successfulModel = model;
        console.log(`Success with model: ${successfulModel}`);
        return res.status(200).json({ results });

      } catch (error) {
        console.warn(`Model ${model} failed:`, error.message);
        lastError = error;
        // Continue to next model
      }
    }

    console.error("All free models failed:", lastError);
    return res.status(503).json({ 
      error: `All AI models are currently busy. Please wait 10 seconds and try again. (Reason: ${lastError?.message})` 
    });

  } catch (error) {
    console.error("Handler Error:", error);
    return res.status(500).json({ error: error.message });
  }
}