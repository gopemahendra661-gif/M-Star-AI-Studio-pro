// DEPRECATED: We now use client-side blob download.
// This file remains only to handle old cached links or odd redirects gracefully.

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Just return a friendly message if anyone ends up here.
  res.status(200).send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #f8fafc;">
        <h2 style="color: #334155;">Download Notice</h2>
        <p style="color: #64748b;">M-Star AI Studio now uses direct client-side downloads for better speed.</p>
        <p style="color: #64748b;">Please go back to the app and try saving again.</p>
        <button onclick="history.back()" style="padding: 10px 20px; background: #db2777; color: white; border: none; border-radius: 8px; margin-top: 20px; cursor: pointer;">Go Back</button>
      </body>
    </html>
  `);
}