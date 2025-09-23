// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const uploadRoutes = require('./routes/upload');
const askRoutes = require('./routes/ask');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure pdfs directory exists
const pdfsDir = path.join(__dirname, 'pdfs');
fs.ensureDirSync(pdfsDir);
console.log('PDFs directory ensured:', pdfsDir);

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/ask', askRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FISD Counselor Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`FISD Counselor Backend running on port ${PORT}`);
});
