// server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Middleware - Allow all origins for now to fix the issue
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
  res.send("FISD Counselor Backend is running on Render ✅");
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

    // Build conversation history for context
    let historyMessages = '';
    if (conversationHistory && conversationHistory.length > 0) {
      historyMessages = conversationHistory.map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
      historyMessages = `\n\nPrevious conversation:\n${historyMessages}\n\n`;
    }

    const messages = [
      {
        role: 'system',
        content: `You are a helpful FISD (Frisco Independent School District) counselor assistant.
        Answer questions about FISD policies, procedures, and academic guidance using web search.

        CRITICAL INSTRUCTIONS:
        - Give COMPREHENSIVE, DETAILED answers that fully address the question
        - Include ALL relevant information, examples, and specifics
        - When listing activities, programs, or requirements, be THOROUGH and complete
        - NO formatting symbols like asterisks, bullets, dashes, or markdown
        - NO tables, headers, or complex formatting
        - NO "Based on my search" or "According to" phrases
        - Just answer the question directly and comprehensively
        - Keep it conversational and human-like
        - If you need to list items, use simple text like "Activities include: item 1, item 2, item 3, item 4, item 5"
        - Be as detailed as possible while staying readable
        - Always provide sources at the end in simple format

        Use the conversation context to understand references and maintain topic continuity.`
      },
      {
        role: 'user',
        content: `${historyMessages}User: ${question}`
      }
    ];

    const perplexityResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'sonar-pro',
      messages: messages,
    }, {
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    let answer = perplexityResponse.data.choices[0].message.content;

    // Clean up the response
    answer = answer
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s*/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/\|.*\|/g, '')
      .replace(/---+/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\n\s*\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const sources = perplexityResponse.data.choices[0].message.citations ?
      perplexityResponse.data.choices[0].message.citations.map(citation => ({
        type: 'web',
        url: citation.url,
        title: citation.title || 'Web Source'
      })) : [];

    // Generate simple follow-up questions
    const followUps = [
      "What are the requirements for this?",
      "How do I apply for this?",
      "What are the benefits of this program?"
    ];

    res.json({ 
      success: true, 
      answer, 
      sources, 
      question, 
      followUps 
    });

  } catch (error) {
    console.error('Ask error:', error.response ? error.response.data : error.message);
    res.status(500).json({
      error: 'Failed to process question',
      details: error.response ? error.response.data : error.message
    });
  }
});

// Use Render's provided PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FISD Counselor Backend running on port ${PORT}`);
});
