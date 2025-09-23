const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Perplexity API configuration
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

if (!PERPLEXITY_API_KEY) {
  console.error('ERROR: PERPLEXITY_API_KEY environment variable is required');
}

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, conversationHistory } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!PERPLEXITY_API_KEY) {
      return res.status(500).json({ error: 'Perplexity API key not configured' });
    }

    console.log(`Processing question: ${question}`);

    // Read local PDFs for context (in Vercel, these would be in the build)
    const pdfsDir = path.join(process.cwd(), 'backend', 'pdfs');
    let pdfFiles = [];
    
    try {
      const files = await fs.promises.readdir(pdfsDir);
      pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    } catch (error) {
      console.log('No PDFs directory found, continuing without PDF context');
    }

    const pdfContext = pdfFiles.length > 0
      ? `\n\nI also have access to these FISD documents: ${pdfFiles.join(', ')}. Use information from these documents when relevant.`
      : '';

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
        Answer questions about FISD policies, procedures, and academic guidance using both web search
        and the provided FISD document context.

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

        Use the conversation context to understand references and maintain topic continuity.
        ${pdfContext}`
      },
      {
        role: 'user',
        content: `${historyMessages}User: ${question}`
      }
    ];

    const perplexityResponse = await axios.post(PERPLEXITY_API_URL, {
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

    // Aggressively clean up the response - remove ALL formatting
    answer = answer
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up multiple newlines
      .replace(/^\s*[-*+]\s+/gm, '') // Remove bullet points
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
      .replace(/\|.*\|/g, '') // Remove tables
      .replace(/---+/g, '') // Remove horizontal lines
      .replace(/\[.*?\]/g, '') // Remove citations in brackets
      .replace(/\n\s*\n/g, ' ') // Convert double newlines to spaces
      .replace(/\s+/g, ' ') // Clean up multiple spaces
      .trim();

    const sources = perplexityResponse.data.choices[0].message.citations ?
      perplexityResponse.data.choices[0].message.citations.map(citation => ({
        type: 'web',
        url: citation.url,
        title: citation.title || 'Web Source'
      })) : [];

    // Add PDF sources if we have them
    if (pdfFiles.length > 0) {
      sources.push({
        type: 'pdf',
        filename: 'FISD Documents',
        page: 'Referenced'
      });
    }

    // Generate follow-up questions based on the answer and context
    const followUpPrompt = `Based on the following conversation and the last answer, generate exactly three very short, concise, and relevant follow-up questions. Do not number them or add any introductory phrases. Just provide the questions separated by newlines.
    Conversation:
    ${historyMessages}User: ${question}
    Assistant: ${answer}
    Follow-up questions:`;

    const followUpResponse = await axios.post(PERPLEXITY_API_URL, {
      model: 'sonar-pro',
      messages: [{ role: 'user', content: followUpPrompt }],
      max_tokens: 100,
    }, {
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    let followUps = [];
    if (followUpResponse.data.choices && followUpResponse.data.choices[0] && followUpResponse.data.choices[0].message) {
      const rawFollowUps = followUpResponse.data.choices[0].message.content;
      console.log('Raw followups:', rawFollowUps);
      followUps = rawFollowUps
        .split('\n')
        .map(q => q.replace(/^\s*[-*+\d\.]*\s*/, '').trim()) // Remove any leading bullets/numbers
        .filter(q => q.length > 5) // Filter out very short or empty lines
        .slice(0, 3); // Ensure exactly three
      console.log('Processed followups:', followUps);
    }

    res.json({ success: true, answer, sources, question, followUps });

  } catch (error) {
    console.error('Ask error:', error.response ? error.response.data : error.message);
    res.status(500).json({
      error: 'Failed to process question',
      details: error.response ? error.response.data : error.message
    });
  }
}
