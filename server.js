// server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const pdf = require("pdf-parse");
const fs = require('fs').promises;

const app = express();

// CTE detection keywords
const CTE_KEYWORDS = [
  'cte', 'career pathways', 'prerequisites', 'career and technical education',
  'workforce programs', 'certifications', 'trade programs', 'vocational',
  'agriculture', 'architecture', 'business', 'education', 'engineering',
  'health', 'hospitality', 'information technology', 'law', 'arts',
  'audio video technology', 'communications', 'career cluster',
  'computer science', 'ap computer science', 'programming', 'software',
  'technology', 'stem', 'math', 'science', 'course', 'classes'
];

// Function to detect if question is CTE-related
function isCTERelated(question) {
  const lowerQuestion = question.toLowerCase();
  return CTE_KEYWORDS.some(keyword => lowerQuestion.includes(keyword));
}

// Always try PDFs first, then web search if insufficient
function choosePrimarySource(question) {
  // Always start with PDFs for any question
  return 'pdf';
}

// Detect overview-style questions ("tell me about", "what is", "overview")
function isOverviewQuery(question) {
  const q = question.toLowerCase();
  return /\b(tell me about|what is|overview|explain|describe)\b/.test(q);
}

// Select PDFs - prioritize relevant ones but include all for comprehensive search
async function selectCTEPdfFiles(question) {
  const cteDir = path.join(__dirname, 'cte-pdfs');
  let files = [];
  try {
    files = await fs.readdir(cteDir);
  } catch (_) {
    return [];
  }
  const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
  const q = question.toLowerCase();
  
  // First try to find specific matches
  const clusters = [
    { key: 'agriculture', match: /agri|animal|plant|floral/ },
    { key: 'architecture', match: /architec|construction|design/i },
    { key: 'business', match: /business|marketing|finance/i },
    { key: 'education', match: /education|teaching|teacher/i },
    { key: 'engineering', match: /engineer|stem|robot|manufactur/i },
    { key: 'health', match: /health|medical|nurse|bio/i },
    { key: 'hospitality', match: /hospitality|tourism|culinary|hotel/i },
    { key: 'information-technology', match: /it|information\s*tech|cyber|programming|software|network|computer|compsci/i },
    { key: 'law', match: /law|public\s*service|security|criminal/i },
    { key: 'arts', match: /arts|audio|video|communication|media/i }
  ];
  
  const matchedCluster = clusters.find(c => c.match.test(q));
  if (matchedCluster) {
    const subset = pdfFiles.filter(f => f.toLowerCase().includes(matchedCluster.key));
    if (subset.length > 0) {
      // Return matched cluster PDFs + a few others for comprehensive coverage
      const others = pdfFiles.filter(f => !f.toLowerCase().includes(matchedCluster.key)).slice(0, 2);
      return [...subset, ...others].map(f => path.join(cteDir, f));
    }
  }
  
  // For any question, return all PDFs to ensure comprehensive search
  return pdfFiles.map(f => path.join(cteDir, f));
}

// Extract short, relevant snippets from PDF text
function extractSnippetsFromText(fullText, question, maxChars = 1200) {
  if (!fullText) return '';
  const q = question.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const sentences = fullText.split(/\n+|(?<=[.!?])\s+/);
  
  // Boost score for prerequisite-related content
  const prereqKeywords = ['prerequisite', 'prereq', 'required', 'must', 'completion', 'grade', 'level'];
  const isPrereqQuestion = /prereq|requirement|required/i.test(question);
  
  const scored = sentences.map(s => {
    const ls = s.toLowerCase();
    let score = q.reduce((acc, w) => acc + (ls.includes(w) ? 1 : 0), 0);
    
    // Boost score for prerequisite content if asking about prerequisites
    if (isPrereqQuestion) {
      score += prereqKeywords.reduce((acc, kw) => acc + (ls.includes(kw) ? 2 : 0), 0);
    }
    
    // Boost score for course names and specific details
    if (/ap\s+computer|computer\s+science|compsci|cs\s+a/i.test(ls)) {
      score += 3;
    }
    
    // Prefer shorter, more focused sentences
    if (s.length < 200) score += 0.2;
    
    return { s, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  let out = '';
  for (const { s } of scored) {
    if ((out + ' ' + s).length > maxChars) break;
    if (s.trim().length < 4) continue;
    out += (out ? '\n' : '') + s.trim();
  }
  return out;
}

// Function to parse CTE PDFs
async function parseCTEPDFs(question) {
  try {
    const targets = await selectCTEPdfFiles(question);
    if (targets.length === 0) return '';
    let snippetBundle = '';
    for (const filePath of targets) {
      try {
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdf(dataBuffer);
        const snippet = extractSnippetsFromText(pdfData.text, question, 1000);
        const label = path.basename(filePath);
        if (snippet) {
          snippetBundle += `\n\n[${label}]\n${snippet}`;
        }
      } catch (error) {
        console.error(`Error parsing ${filePath}:`, error.message);
      }
    }
    return snippetBundle.trim();
  } catch (error) {
    console.error('Error reading CTE PDFs:', error.message);
    return '';
  }
}

// Middleware - Allow all origins for now to fix the issue
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: false, // Set to false when using origin: '*'
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Manual OPTIONS handler for CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.sendStatus(200);
});

app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
  res.send("FISD Counselor Backend is running on Render ✅ - CORS Fixed");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "FISD Counselor Backend is running",
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.PERPLEXITY_API_KEY,
    apiKeyLength: process.env.PERPLEXITY_API_KEY ? process.env.PERPLEXITY_API_KEY.length : 0
  });
});

// Test endpoint for debugging
app.get("/api/hello", (req, res) => {
  res.json({ 
    ok: true, 
    msg: "Hello from Render ✅",
    timestamp: new Date().toISOString(),
    origin: req.get('origin') || 'no-origin'
  });
});

// Keep-alive endpoint to prevent cold starts
app.get("/api/ping", (req, res) => {
  res.json({ 
    status: "alive",
    timestamp: new Date().toISOString()
  });
});

// Simple JSONP endpoint for testing (bypasses CORS)
app.get("/api/test", (req, res) => {
  const callback = req.query.callback || 'callback';
  const data = { 
    status: "ok", 
    message: "CORS test successful",
    timestamp: new Date().toISOString()
  };
  res.send(`${callback}(${JSON.stringify(data)});`);
});

// Upload endpoint
app.get("/api/upload", (req, res) => {
  res.json({ 
    success: true, 
    message: "PDFs are processed automatically in Render deployment",
    pdfs: ["FISD Documents"],
    hasIndexedFiles: true
  });
});

// Ask endpoint
app.post("/api/ask", async (req, res) => {
  try {
    const { question, conversationHistory } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
    if (!PERPLEXITY_API_KEY) {
      // For testing, return a mock response
      return res.json({ 
        success: true, 
        answer: "This is a test response. The Perplexity API key is not configured. Please check your environment variables in Render.",
        sources: [],
        question: question,
        followUps: ["How do I configure the API key?", "What are the graduation requirements?", "How do I apply for programs?"]
      });
    }

    console.log(`Processing question: ${question}`);

    // Decide source once per question
    const primarySource = choosePrimarySource(question);
    const overviewMode = isOverviewQuery(question);
    const isCTE = primarySource === 'pdf' && isCTERelated(question);
    console.log(`Primary source: ${primarySource} (CTE: ${isCTE})`);

    // Build conversation history for context
    let historyMessages = '';
    if (conversationHistory && conversationHistory.length > 0) {
      historyMessages = conversationHistory.map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
      historyMessages = `\n\nPrevious conversation:\n${historyMessages}\n\n`;
    }

    // Always try PDFs first for any question
    let cteContent = '';
    console.log('Parsing PDFs for comprehensive search...');
    cteContent = await parseCTEPDFs(question);
    console.log(`PDF snippet length: ${cteContent.length} characters`);

    // Build messages with optional CTE context; only include CTE context if we used PDFs
    const systemBase = `You are a FISD (Frisco Independent School District) counselor assistant. Give direct, specific answers about FISD graduation requirements and policies.

        RULES:
        - Keep responses under 150 words
        - Use bullet points for lists
        - Be specific to FISD but concise
        - Focus on key requirements only
        - No lengthy explanations
        - Always mention FISD specifically
        ${overviewMode ? `
        If the question asks for an overview, prioritize:
        - What it is and purpose (1-2 bullets)
        - Who it's for and key opportunities/benefits
        - Participation/availability in FISD (campuses or programs if known)
        - End with basic requirements or next steps
        ` : ''}`;

    const systemWithCTE = cteContent
      ? systemBase + `\n\nCTE CONTEXT (snippets from district PDFs):\n${cteContent}`
      : systemBase;

    const messages = [
      {
        role: 'system',
        content: systemWithCTE
      },
      {
        role: 'user',
        content: `${historyMessages}User: ${question}`
      }
    ];

    // Always try to answer from PDF content first, fallback to web if insufficient
    let perplexityResponse = { data: { choices: [{ message: { content: '' } }] } };
    
    // If we have substantial PDF content, use it; otherwise fallback to web search
    if (cteContent && cteContent.length > 100) {
      console.log('Using PDF content for answer');
      // Use PDF content with web search as backup
      perplexityResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
        model: 'sonar-pro',
        messages: messages,
      }, {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });
    } else {
      console.log('PDF content insufficient, using web search');
      // Fallback to web search
      perplexityResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
        model: 'sonar-pro',
        messages: messages,
      }, {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });
    }

    let answer = perplexityResponse.data.choices[0].message.content;

    // Clean up the response
    answer = answer
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s*/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/\|.*\|/g, '')
      .replace(/---+/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    const sources = perplexityResponse.data.choices[0].message.citations ?
      perplexityResponse.data.choices[0].message.citations.map(citation => ({
        type: 'web',
        url: citation.url,
        title: citation.title || 'Web Source'
      })) : [];

    res.json({ 
      success: true, 
      answer, 
      sources, 
      question
    });

  } catch (error) {
    console.error('Ask error:', error.response ? error.response.data : error.message);
    
    let errorMessage = 'Failed to process question';
    let statusCode = 500;
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorMessage = 'Request timed out. The AI service is taking longer than expected.';
      statusCode = 408; // Request Timeout
    } else if (error.response?.status === 401) {
      errorMessage = 'API authentication failed.';
      statusCode = 500;
    } else if (error.response?.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      statusCode = 429;
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      details: error.response ? error.response.data : error.message
    });
  }
});

// Use Render's provided PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FISD Counselor Backend running on port ${PORT}`);
});
