export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Allow images up to 4MB
    },
  },
};

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
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
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).send("No image data provided");
    }

    // Remove the data URL prefix (e.g., "data:image/png;base64,")
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
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