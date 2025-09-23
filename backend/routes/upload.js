const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Check if we have any PDFs in the pdfs directory
router.get('/vector-store', async (req, res) => {
  try {
    const pdfsDir = path.join(__dirname, '../pdfs');
    
    // Ensure pdfs directory exists
    if (!fs.existsSync(pdfsDir)) {
      fs.mkdirSync(pdfsDir, { recursive: true });
    }

    const files = await fs.promises.readdir(pdfsDir);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

    res.json({
      hasIndexedFiles: pdfFiles.length > 0,
      files: pdfFiles,
      count: pdfFiles.length
    });
  } catch (error) {
    console.error('Error checking PDFs:', error);
    res.status(500).json({ error: 'Failed to check PDF status' });
  }
});

// Get input directory path
router.get('/input-dir', (req, res) => {
  const inputDir = path.join(__dirname, '../pdfs');
  res.json({ inputDir });
});

// Process PDFs (simplified - just returns success since PDFs are already there)
router.post('/process', async (req, res) => {
  try {
    const pdfsDir = path.join(__dirname, '../pdfs');
    const files = await fs.promises.readdir(pdfsDir);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

    res.json({
      success: true,
      message: `Found ${pdfFiles.length} PDF files ready for processing`,
      files: pdfFiles
    });
  } catch (error) {
    console.error('Error processing PDFs:', error);
    res.status(500).json({ error: 'Failed to process PDFs' });
  }
});

module.exports = router;