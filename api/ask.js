const axios = require('axios');

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

    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
    if (!PERPLEXITY_API_KEY) {
      return res.status(500).json({ error: 'Perplexity API key not configured' });
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

    return res.status(200).json({ 
      success: true, 
      answer, 
      sources, 
      question, 
      followUps 
    });

  } catch (error) {
    console.error('Ask error:', error.response ? error.response.data : error.message);
    return res.status(500).json({
      error: 'Failed to process question',
      details: error.response ? error.response.data : error.message
    });
  }
}