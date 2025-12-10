export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increased to 10MB to prevent payload errors
    },
  },
};

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS,GET');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET (Prevents the ugly JSON error if a redirect happens)
  if (req.method === 'GET') {
    return res.status(200).send('Image Download Service Ready. Please submit via POST.');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let base64Data = '';

    // Handle different content types (JSON vs Form Data)
    if (req.body && req.body.imageData) {
      base64Data = req.body.imageData;
    } else {
      // Fallback for raw body parsing if needed
      return res.status(400).send("No image data found in request body.");
    }

    // Clean up the base64 string
    base64Data = base64Data.replace(/^data:image\/\w+;base64,/, "");
    
    // Create buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Force the browser/webview to treat this as a file download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="m-star-roast-${Date.now()}.png"`);
    res.setHeader('Content-Length', buffer.length);
    
    // Send the binary data
    res.send(buffer);

  } catch (error) {
    console.error("Download Helper Error:", error);
    res.status(500).send("Failed to process download");
  }
}