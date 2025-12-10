export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS Headers - APK compatible
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle POST request (Used by our Form Submit)
  if (req.method === 'POST') {
    try {
      let base64Data = '';

      if (req.body && req.body.imageData) {
        base64Data = req.body.imageData;
      } else if (req.body && req.body.data) {
        base64Data = req.body.data;
      } else {
        return res.status(400).json({ 
          error: 'No image data provided',
          hint: 'Send { imageData: "base64string" } in POST body'
        });
      }

      // Clean base64 string
      base64Data = base64Data.replace(/^data:image\/\w+;base64,/, '');
      
      // Decode
      const buffer = Buffer.from(base64Data, 'base64');

      // Return image directly as attachment
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="m-star-roast-${Date.now()}.png"`);
      res.setHeader('Content-Length', buffer.length);
      
      // Robust Cache Control for WebViews
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.send(buffer);

    } catch (error) {
      console.error('POST handler error:', error);
      return res.status(500).json({ 
        error: 'Failed to process image',
        details: error.message 
      });
    }
  }

  // Fallback for GET (if accessed directly)
  return res.status(200).send('Image Download Service Ready. Please use POST.');
}