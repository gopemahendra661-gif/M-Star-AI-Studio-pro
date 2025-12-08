import { GeneratorMode, Language } from "../types";

export const generateContent = async (
  prompt: string,
  mode: GeneratorMode,
  language: Language
): Promise<string[]> => {
  
  try {
    // We now call our own Vercel Serverless Function
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, mode, language }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate content");
    }

    return data.results || [];

  } catch (error: any) {
    console.error("Generation Error:", error);
    throw new Error(error.message || "Something went wrong. Please try again.");
  }
};