import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratorMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const M_STAR_SYSTEM_INSTRUCTION = `
You are "M-Star AI Studio", a viral content generator engine.

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
`;

export const generateContent = async (
  prompt: string,
  mode: GeneratorMode
): Promise<string[]> => {
  try {
    const userPrompt = mode === GeneratorMode.AUTO 
      ? `User Input: "${prompt}". Detect the intent and generate the best matching content.`
      : `Mode: ${mode}. User Input: "${prompt}". Generate content specifically for this mode.`;

    // Define the schema to ensure we get a clean list of strings to display in the UI
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        results: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of generated content lines (roasts, captions, names, etc.)"
        }
      },
      required: ["results"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: M_STAR_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8, // Slightly high for creativity
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const parsed = JSON.parse(jsonText);
    return parsed.results || [];

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
};
