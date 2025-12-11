
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratorMode } from "../types";

const M_STAR_SYSTEM_INSTRUCTION = `
You are "M-Star AI Studio", an expert viral content strategist.
Your goal is to generate professional, "real-world" usable content with proper structure.

LANGUAGE RULES:
- Hinglish: Mix of Hindi and English (Roman script).
- Hindi: Devanagari script.
- English: Standard English.

CONTENT MODES & STRUCTURE:

1. **SCRIPT WRITING** (Shorts/Reels):
   - Provide 2 distinct scripts.
   - Format:
     **TITLE**: [Catchy Title]
     **HOOK**: [Visual/Audio Hook]
     **BODY**: [Fast-paced content]
     **CTA**: [Call to Action]
   - Use '\\n' for formatting.

2. **DESCRIPTION WRITING**:
   - Provide 3 variations.
   - Format: Catchy first line + Summary + Bullet points + Hashtags.

3. **TITLE GENERATOR**:
   - Provide 10 High CTR titles.
   - Use Power Words, Curiosity Gaps.

4. **STYLISH NAME**:
   - Provide 10 variations using Unicode fonts (Bold, Gothic, Cursive, etc.).
   - No emojis.

5. **SHAYARI**:
   - Strict Rhyme (Kafiya) & Meter.
   - Deep Urdu/Hindi words.

6. **ROAST/QUOTES/STATUS/CAPTION**:
   - Viral, short, 1-2 lines.

RETURN JSON format with "results" array.
`;

export const generateContent = async (
  prompt: string,
  mode: GeneratorMode
): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const userPrompt = mode === GeneratorMode.AUTO 
      ? `User Input: "${prompt}". Detect the intent and generate the best matching content.`
      : `Mode: ${mode}. User Input: "${prompt}". Generate content specifically for this mode.`;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        results: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of generated content items."
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
        temperature: 0.85,
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
