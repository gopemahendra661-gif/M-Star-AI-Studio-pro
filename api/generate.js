export const config = {
  runtime: 'edge',
};

// 5 Best Free Fallback Models (High Quality & Speed)
const FALLBACK_MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05:free", // Super Fast & Smart
  "meta-llama/llama-3.3-70b-instruct:free",          // Best Open Source Logic
  "deepseek/deepseek-r1-distill-llama-70b:free",     // High Reasoning
  "mistral/mistral-nemo:free",                       // Reliable & Quick
  "microsoft/phi-3-medium-128k-instruct:free"        // Strong Backup
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

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { prompt, mode, language = 'Hinglish' } = await request.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server Config Error: API Key missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
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
            // Removed response_format: { type: "json_object" } to maximize compatibility with all models
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter API Error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const contentString = data.choices?.[0]?.message?.content;

        if (!contentString) throw new Error("Empty response from AI");

        // Aggressive JSON Cleaning
        let cleanJson = contentString.trim();
        
        // Remove markdown code blocks if present
        cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
        
        // Find the first '{' and last '}'
        const startIndex = cleanJson.indexOf("{");
        const endIndex = cleanJson.lastIndexOf("}");
        
        if (startIndex !== -1 && endIndex !== -1) {
          cleanJson = cleanJson.substring(startIndex, endIndex + 1);
        } else {
           throw new Error("Could not find JSON in response");
        }

        let parsed;
        try {
          parsed = JSON.parse(cleanJson);
        } catch (e) {
          throw new Error("JSON Parse Failed");
        }

        let results = [];
        if (parsed.results && Array.isArray(parsed.results)) {
          results = parsed.results;
        } else {
          // If JSON is valid but structure is wrong, fallback to splitting lines
          results = cleanJson.split('\n').filter(l => l.length > 5);
        }

        if (results.length === 0) throw new Error("No results found in JSON");

        // If successful, return immediately
        return new Response(JSON.stringify({ results }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.warn(`Model ${model} failed:`, error.message);
        lastError = error;
        // Continue to next model in loop
      }
    }

    // If loop finishes without success
    throw new Error(`All AI models failed. Last error: ${lastError?.message || 'Unknown'}`);

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}