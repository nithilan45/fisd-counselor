const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for existing PDFs in the build
    const pdfsDir = path.join(process.cwd(), 'backend', 'pdfs');
    let pdfFiles = [];
    
    try {
      const files = await fs.promises.readdir(pdfsDir);
      pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    } catch (error) {
      console.log('No PDFs directory found');
    }

    res.json({ 
      success: true, 
      message: 'PDFs are processed automatically in Vercel deployment',
      pdfs: pdfFiles,
      hasIndexedFiles: pdfFiles.length > 0
    });

  } catch (error) {
    console.error('Upload check error:', error);
    res.status(500).json({
      error: 'Failed to check PDFs',
      details: error.message
    });
  }
}
