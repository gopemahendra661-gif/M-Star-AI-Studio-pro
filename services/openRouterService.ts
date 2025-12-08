import { GeneratorMode } from "../types";

// 5 Free/Cheap Fallback Models (Order of priority)
const FALLBACK_MODELS = [
  "google/gemini-2.0-flash-thinking-exp:free",      // High Logic
  "google/gemini-2.0-flash-lite-preview-02-05:free", // Fast
  "meta-llama/llama-3.2-3b-instruct:free",          // Good Hinglish
  "mistral/mistral-7b-instruct:free",               // Reliable
  "microsoft/phi-3-mini-128k-instruct:free"         // Backup
];

const M_STAR_SYSTEM_INSTRUCTION = `
You are "M-Star AI Studio", a viral content generator.

Your job:
- Generate Roast, Compliment, WhatsApp Bio, Stylish Font Names, Captions, Viral Status, Hashtags.
- Auto-detect mode based on user text if mode is AUTO.

CONTENT RULES:
1. Reply ONLY in Hinglish (Hindi + English mix).
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
You MUST return a valid JSON object. Do not include markdown code blocks (like \`\`\`json).
Structure:
{
  "results": [
    "Line 1 content...",
    "Line 2 content...",
    "Line 3 content..."
  ]
}
`;

export const generateContent = async (
  prompt: string,
  mode: GeneratorMode
): Promise<string[]> => {
  
  // Use Vercel env var or local fallback
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key missing. Please set OPENROUTER_API_KEY in Vercel.");
  }

  const userPrompt = mode === GeneratorMode.AUTO 
    ? `User Input: "${prompt}". Detect the intent and generate the best matching content in Hinglish.`
    : `Mode: ${mode}. User Input: "${prompt}". Generate content specifically for this mode in Hinglish.`;

  let lastError = null;

  // Fallback Loop
  for (const model of FALLBACK_MODELS) {
    try {
      console.log(`Attempting with model: ${model}`);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://m-star-ai.vercel.app", // Required by OpenRouter
          "X-Title": "M-Star AI Studio",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: M_STAR_SYSTEM_INSTRUCTION },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" } // Hint for JSON mode
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const contentString = data.choices?.[0]?.message?.content;

      if (!contentString) {
        throw new Error("Empty response from AI");
      }

      // Robust JSON Parsing (Handles cases where AI adds text around JSON)
      const cleanJson = contentString.replace(/```json\n?|```/g, "").trim();
      const startIndex = cleanJson.indexOf("{");
      const endIndex = cleanJson.lastIndexOf("}");
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error("Invalid JSON format in response");
      }

      const jsonStr = cleanJson.substring(startIndex, endIndex + 1);
      const parsed = JSON.parse(jsonStr);

      if (parsed.results && Array.isArray(parsed.results)) {
        return parsed.results;
      } else {
         // If structure is wrong but we got text, split by newlines as fallback
         return contentString.split('\n').filter((l: string) => l.length > 5);
      }

    } catch (error: any) {
      console.warn(`Model ${model} failed:`, error.message);
      lastError = error;
      // Continue to next model in loop
    }
  }

  // If all models fail
  console.error("All fallback models failed.");
  throw new Error("Servers are busy. Please try again in a moment.");
};
