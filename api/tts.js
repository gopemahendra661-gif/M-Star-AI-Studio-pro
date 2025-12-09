export default async function handler(req, res) {
  // Allow CORS for stability
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { text, voice } = req.query;

  if (!text) {
    return res.status(400).send("Text is required");
  }

  // StreamElements API URL
  const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${voice || 'Aditi'}&text=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(ttsUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    
    if (!response.ok) {
      throw new Error(`TTS API Error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mp3');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);

  } catch (error) {
    console.error("TTS Proxy Error:", error);
    res.status(500).send("Failed to generate audio");
  }
}