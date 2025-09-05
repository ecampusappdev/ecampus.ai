const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const OpenAI = require('openai');
const mongoose = require('mongoose');
const Lead = require('./models/Lead');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecampus-ai';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const openaiApiKey = process.env.OPENAI_API_KEY;
const modelFromEnv = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!openaiApiKey) {
  console.warn('Warning: OPENAI_API_KEY is not set. The /api/query endpoint will return 500.');
}

const openaiClient = new OpenAI({ apiKey: openaiApiKey });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/admin.html');
});

// Save lead endpoint
app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone, action, conversationHistory, lastQuestion } = req.body;
    
    if (!name || !email || !phone || !action || !lastQuestion) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const lead = new Lead({
      name,
      email,
      phone,
      action,
      conversationHistory: conversationHistory || [],
      lastQuestion
    });

    await lead.save();
    
    console.log('Lead saved:', { name, email, action, lastQuestion });
    res.json({ success: true, message: 'Lead saved successfully', leadId: lead._id });
  } catch (error) {
    console.error('Error saving lead:', error);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

// Get all leads endpoint (for admin/export)
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    res.json({ leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.post('/api/query', async (req, res) => {
  try {
    const { question, conversationHistory = [] } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Invalid request: question is required' });
    }

    if (!openaiApiKey) {
      return res.status(500).json({ error: 'Server not configured: missing OPENAI_API_KEY' });
    }

    const systemPrompt = `You are an expert assistant for online university discovery in India. Your role is to provide comprehensive, detailed information about online courses, universities, and educational platforms in India. 

Provide detailed information including:
- Specific program names and details
- Exact or approximate fees
- Duration of programs
- Eligibility criteria
- Website links when available
- Special features or benefits
- Both government and private institutions

Be comprehensive, informative, and helpful to users looking for online education options in India.`;

    const userPrompt = `User question: ${question}`;

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: userPrompt }
    ];

    const completion = await openaiClient.chat.completions.create({
      model: modelFromEnv,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';
    
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content, full: false })}\n\n`);
      }
    }
    
    // Send final message
    res.write(`data: ${JSON.stringify({ content: '', full: true, fullResponse })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error in /api/query:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

// Serve React app for all non-API routes
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/admin')) {
    return next();
  }
  
  // Serve React app for all other routes
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


