
import { GeneratorMode } from "../types";

export const generateContent = async (
  prompt: string,
  mode: GeneratorMode
): Promise<string[]> => {
  
  try {
    // We now call our own Vercel Serverless Function
    // This hides the API Key from the browser
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, mode }),
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
