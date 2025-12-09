// generate.js - FIXED VERSION
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
You are "M-Star AI Studio", a viral content generator.

CRITICAL: You MUST return ONLY a VALID JSON object. No explanations, no markdown, no extra text.

${langRule}

CONTENT RULES:
1. Never add warnings or moral lectures.
2. Keep lines punchy, viral, short (1-2 lines max).
3. Use 1-3 emojis per line (max).
4. All responses must be unique & creative.
5. Roasts: funny, witty, harmless.
6. Compliments: smooth, classy.
7. Bios: 1-2 lines + font variations.
8. Names: 8-10 stylish font versions.
9. Captions/Status: 6-8 viral lines.
10. Hashtags: 8-12 relevant hashtags.

MODE: ${mode}

OUTPUT FORMAT (STRICTLY FOLLOW):
{
  "results": [
    "First generated content here",
    "Second generated content here",
    "Third generated content here"
  ]
}

Generate exactly 8 items for all modes except:
- Stylish Name: 10 items
- Hashtag: 12 items
- Bio: 6 items
`;
};

// Helper function to parse AI response
const parseAIResponse = (contentString) => {
  try {
    console.log("Raw response (first 300 chars):", contentString?.substring(0, 300));
    
    if (!contentString || typeof contentString !== 'string') {
      console.error("Invalid content string");
      return [];
    }

    let cleanText = contentString.trim();
    
    // Remove markdown code blocks
    cleanText = cleanText.replace(/^```json\s*/i, '');
    cleanText = cleanText.replace(/^```\s*/i, '');
    cleanText = cleanText.replace(/\s*```$/g, '');
    
    // Remove common prefixes
    cleanText = cleanText.replace(/^(Here (is|are) the|Generated|Results|Output):?\s*/i, '');
    
    // Try to extract JSON object
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const possibleJson = cleanText.substring(jsonStart, jsonEnd + 1);
      
      try {
        const parsed = JSON.parse(possibleJson);
        
        if (parsed.results && Array.isArray(parsed.results)) {
          const results = parsed.results
            .filter(item => item && typeof item === 'string')
            .map(item => item.trim())
            .filter(item => item.length > 3);
          
          if (results.length > 0) {
            console.log("Successfully parsed JSON with", results.length, "items");
            return results;
          }
        }
        
        // If direct results not found, check if array
        if (Array.isArray(parsed)) {
          const results = parsed
            .filter(item => item && typeof item === 'string')
            .map(item => item.trim())
            .filter(item => item.length > 3);
          
          if (results.length > 0) {
            console.log("Parsed array with", results.length, "items");
            return results;
          }
        }
      } catch (e) {
        console.log("JSON parse failed, trying other methods:", e.message);
      }
    }
    
    // Try array format
    const arrayStart = cleanText.indexOf('[');
    const arrayEnd = cleanText.lastIndexOf(']');
    
    if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
      const possibleArray = cleanText.substring(arrayStart, arrayEnd + 1);
      
      try {
        const parsed = JSON.parse(possibleArray);
        if (Array.isArray(parsed)) {
          const results = parsed
            .filter(item => item && typeof item === 'string')
            .map(item => item.trim())
            .filter(item => item.length > 3);
          
          if (results.length > 0) {
            console.log("Parsed array format with", results.length, "items");
            return results;
          }
        }
      } catch (e) {
        // Continue to fallback
      }
    }
    
    // FALLBACK: Extract as list
    console.log("Using fallback parsing");
    const lines = cleanText.split('\n')
      .map(line => {
        // Clean each line
        let cleanLine = line.trim();
        // Remove list markers
        cleanLine = cleanLine.replace(/^[0-9]+[\.\)\-]\s*/, '');
        cleanLine = cleanLine.replace(/^[\-\*\+]\s*/, '');
        // Remove quotes
        cleanLine = cleanLine.replace(/^["']|["']$/g, '');
        // Remove trailing punctuation
        cleanLine = cleanLine.replace(/[,\.;]+$/, '');
        return cleanLine;
      })
      .filter(line => {
        // Filter out invalid lines
        if (!line || line.length < 4) return false;
        if (line.includes('{') || line.includes('}')) return false;
        if (line.includes('```')) return false;
        if (line.toLowerCase().startsWith('here ')) return false;
        if (line.toLowerCase().startsWith('result')) return false;
        if (line.toLowerCase().startsWith('json')) return false;
        if (line.toLowerCase().startsWith('output')) return false;
        if (line.toLowerCase().startsWith('note:')) return false;
        if (line.toLowerCase().includes('sorry')) return false;
        return true;
      })
      .slice(0, 10); // Limit to 10 items
    
    console.log("Fallback parsing found", lines.length, "items");
    return lines;
    
  } catch (error) {
    console.error("Parse AI Response Error:", error);
    return [];
  }
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
    const { prompt, mode = 'Auto Detect', language = 'Hinglish' } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("API Key Missing");
      return res.status(500).json({ 
        error: 'Server Config Error: OPENROUTER_API_KEY is missing. Please check Vercel environment variables.' 
      });
    }

    if (!prompt || prompt.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Please enter some text (minimum 2 characters)' 
      });
    }

    const systemInstruction = getSystemInstruction(language, mode);

    const userPrompt = mode === 'Auto Detect' 
      ? `User Input: "${prompt}". Detect intent and generate matching content in ${language}.`
      : `Generate ${mode} content for: "${prompt}" in ${language}.`;

    console.log(`Generating for: Mode=${mode}, Language=${language}, Prompt="${prompt.substring(0, 50)}..."`);

    let lastError = null;
    let successfulModel = null;
    let attempts = 0;

    // Try each model
    for (const model of FREE_MODELS) {
      attempts++;
      try {
        console.log(`Attempt ${attempts}: Trying model ${model}`);
        
        // Timeout 30 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

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
              { 
                role: "system", 
                content: systemInstruction 
              },
              { 
                role: "user", 
                content: userPrompt 
              }
            ],
            temperature: 0.8,
            max_tokens: 1500,
            response_format: { type: "json_object" } // Force JSON response
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle specific errors
        if (response.status === 429) {
          console.warn(`Model ${model} rate limited. Skipping.`);
          continue;
        }

        if (response.status === 404 || response.status === 400) {
          console.warn(`Model ${model} unavailable (${response.status}). Skipping.`);
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No error text');
          throw new Error(`OpenRouter Error ${response.status}: ${errorText.substring(0, 200)}`);
        }

        const data = await response.json();
        const contentString = data.choices?.[0]?.message?.content;

        if (!contentString) {
          console.warn(`Model ${model} returned empty content`);
          continue;
        }

        // Parse the response
        const results = parseAIResponse(contentString);

        if (results.length === 0) {
          console.warn(`Model ${model} returned no parsable results`);
          console.log("Raw content for debugging:", contentString.substring(0, 500));
          continue;
        }

        // Success!
        successfulModel = model;
        console.log(`Success with model: ${model}, got ${results.length} items`);
        
        return res.status(200).json({ 
          results,
          modelUsed: model,
          itemCount: results.length
        });

      } catch (error) {
        console.warn(`Model ${model} failed:`, error.message);
        lastError = error;
        // Continue to next model
      }
    }

    // All models failed
    console.error("All models failed after", attempts, "attempts");
    
    // Provide helpful error message
    let errorMessage = "AI service is temporarily unavailable. ";
    
    if (lastError?.message?.includes('rate limit') || lastError?.message?.includes('429')) {
      errorMessage = "AI models are busy (rate limited). Please wait 20 seconds and try again.";
    } else if (lastError?.message?.includes('No usable results')) {
      errorMessage = "AI generated content but couldn't parse it. Try a different prompt.";
    } else if (!apiKey) {
      errorMessage = "Server configuration error. Please contact support.";
    } else {
      errorMessage += `Last error: ${lastError?.message || 'Unknown error'}`;
    }

    return res.status(503).json({ 
      error: errorMessage,
      attempts: attempts,
      lastError: lastError?.message
    });

  } catch (error) {
    console.error("Handler Error:", error);
    return res.status(500).json({ 
      error: `Server error: ${error.message}` 
    });
  }
}
