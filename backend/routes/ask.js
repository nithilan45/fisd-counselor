const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Perplexity API configuration
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

if (!PERPLEXITY_API_KEY) {
  console.error('ERROR: PERPLEXITY_API_KEY environment variable is required');
  process.exit(1);
}

// Ask a question using Perplexity API with web search
router.post('/', async (req, res) => {
  try {
    const { question, history } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log(`Processing question: ${question}`);

    // Read local PDFs for context
    const pdfsDir = path.join(__dirname, '../pdfs');
    const files = await fs.promises.readdir(pdfsDir);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    const pdfContext = pdfFiles.length > 0 
      ? `\n\nI also have access to these FISD documents: ${pdfFiles.join(', ')}. Use information from these documents when relevant.`
      : '';

    // Build conversation context as a single string
    let conversationContext = '';
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6); // Last 3 exchanges
      conversationContext = recentHistory.map(h => {
        const role = h.role === 'assistant' || h.type === 'bot' ? 'Assistant' : 'User';
        return `${role}: ${h.content}`;
      }).join('\n');
    }

    // Build messages with proper alternation
    const messages = [
      {
        role: 'system',
        content: `You are a helpful FISD (Frisco Independent School District) counselor assistant.
        Answer questions about FISD policies, procedures, and academic guidance using both web search
        and the provided FISD document context.

        IMPORTANT ACRONYMS:
        - OCPE = Off-Campus PE (Physical Education)

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
        content: conversationContext 
          ? `Previous conversation:\n${conversationContext}\n\nCurrent question: ${question}`
          : question
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

    // Generate follow-up questions
    let followUps = [];
    try {
      const followupMessages = [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates 3 concise follow-up questions. Respond ONLY with a JSON array of exactly 3 strings. No other text.'
        },
        {
          role: 'user',
          content: `Based on this conversation about FISD, generate 3 short follow-up questions that a student might ask next:\n\nQuestion: ${question}\nAnswer: ${answer}`
        }
      ];

      const followupResponse = await axios.post(PERPLEXITY_API_URL, {
        model: 'sonar-pro',
        messages: followupMessages,
      }, {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const rawFollowups = followupResponse.data.choices[0].message.content;
      console.log('Raw followups:', rawFollowups);
      
      try {
        followUps = JSON.parse(rawFollowups);
        if (!Array.isArray(followUps)) throw new Error('Not array');
        followUps = followUps.map(x => String(x).trim()).filter(Boolean).slice(0, 3);
      } catch (parseError) {
        console.log('JSON parse failed, trying text parsing:', parseError.message);
        // Fallback: split by newlines and clean up
        followUps = rawFollowups
          .split('\n')
          .map(s => s.replace(/^[-*\d.\s]+/, '').trim())
          .filter(s => s.length > 0)
          .slice(0, 3);
      }
      
      console.log('Processed followups:', followUps);
    } catch (followupError) {
      console.error('Followup generation error:', followupError.message);
      // Fallback followups based on common FISD topics
      followUps = [
        'What are the GPA requirements?',
        'How do I choose an endorsement?',
        'What AP courses are available?'
      ];
    }

    res.json({ success: true, answer, sources, question, followUps });

  } catch (error) {
    console.error('Ask error:', error.response ? error.response.data : error.message);
    res.status(500).json({
      error: 'Failed to process question',
      details: error.response ? error.response.data : error.message
    });
  }
});

module.exports = router;