// Standard Node.js Serverless Function
export const config = {
  maxDuration: 25, // Increased duration for DeepSeek/Reasoning models
};

// User Requested Models (Mapped to valid OpenRouter Free IDs)
const FALLBACK_MODELS = [
  "deepseek/deepseek-v3:free",                   // DeepSeek V3 (Requested)
  "deepseek/deepseek-r1:free",                   // DeepSeek R1 (Requested)
  "google/gemini-2.0-flash-thinking-exp:free",   // High Logic Backup
  "meta-llama/llama-3.3-70b-instruct:free",      // Best Llama (Requested Llama Variant)
  "google/gemini-2.0-flash-lite-preview-02-05:free" // Fallback Speed
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
      return res.status(500).json({ error: 'Server Config Error: API Key missing in Vercel.' });
    }

    const systemInstruction = getSystemInstruction(language);

    const userPrompt = mode === 'Auto Detect' 
      ? `User Input: "${prompt}". Detect the intent and generate the best matching content in ${language}. Return JSON.`
      : `Mode: ${mode}. User Input: "${prompt}". Generate content specifically for this mode in ${language}. Return JSON.`;

    let lastError = null;

    // Fallback Loop
    for (const model of FALLBACK_MODELS) {
      try {
        console.log(`Trying model: ${model}`);
        
        // Timeout 15s for DeepSeek models which can be slower
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

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
            max_tokens: 1500,
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          if (response.status === 401) throw new Error("Invalid API Key");
          throw new Error(`API Error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const contentString = data.choices?.[0]?.message?.content;

        if (!contentString) throw new Error("Empty response from AI");

        // --- DEEPSEEK CLEANING LOGIC ---
        // DeepSeek R1 often returns <think>...</think> tags. We must remove them.
        let cleanJson = contentString.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        
        // Remove markdown
        cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
        
        // Extract JSON object
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
          console.log("JSON Parse Failed, falling back to line split. Raw:", cleanJson);
          // Fallback: Split by lines if JSON fails
          results = cleanJson.split('\n')
            .map(line => line.replace(/^\d+\.\s*/, '').replace(/^- \s*/, '').replace(/^"|",?$/g, '').trim())
            .filter(l => l.length > 5 && !l.includes("Results") && !l.includes("Here is") && !l.includes("{") && !l.includes("}"));
        }

        if (results.length === 0) throw new Error("No results found in AI response");

        return res.status(200).json({ results });

      } catch (error) {
        console.warn(`Model ${model} failed:`, error.message);
        lastError = error;
        // Continue to next model
      }
    }

    console.error("All models failed:", lastError);
    return res.status(503).json({ error: `AI Busy: ${lastError?.message || 'Try again later'}` });

  } catch (error) {
    console.error("Handler Error:", error);
    return res.status(500).json({ error: error.message });
  }
}