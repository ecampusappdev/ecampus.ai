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

//     const systemPrompt = `You are an expert assistant for online university discovery in India. Your role is to provide comprehensive, detailed information about online courses, universities, and educational platforms in India.

// Provide detailed information including:
// - Specific program names and details
// - Exact or approximate fees
// - Duration of programs
// - Eligibility criteria
// - Website links when available
// - Special features or benefits
// - Both government and private institutions

// Be comprehensive, informative, and helpful to users looking for online education options in India.`;

const systemPrompt = `You are an expert assistant for online university discovery in India. You provide comprehensive, helpful, and engaging responses about universities, courses, and educational opportunities.

RESPONSE STRUCTURE RULE:
When users ask about universities, online courses, or educational programs, you MUST structure your response in this exact format:

1. **INTRODUCTION** (2-3 sentences):
   - Acknowledge their question with enthusiasm
   - Show you understand what they're looking for
   - Briefly mention what you'll provide

2. **INFORMATION TABLE** (HTML table):
   - Create a comprehensive HTML table with at least 5-8 universities/institutions
   - Include a good mix of government and private universities
   - Essential columns: University/Institution, Course/Program
   - Optional columns (only if data available): Duration, Fees, Location, Eligibility, Website, Special Features
   - Do NOT create empty columns
   - The table must always include a <thead> and <tbody>
   - IMPORTANT: Provide at least 5-8 different universities to give users comprehensive options

3. **CONCLUSION** (2-3 sentences):
   - Summarize key insights from the table
   - Mention any important considerations or trends
   - Encourage them to explore further

4. **FOLLOW-UP QUESTIONS** (3-4 relevant questions):
   - Ask about specific details they might want
   - Suggest related topics or specializations
   - Offer to help with next steps or comparisons

EXAMPLE RESPONSE STRUCTURE:
"Great question! I'd be happy to help you find the best MBA programs in India. Let me provide you with a comprehensive overview of top universities offering MBA courses with their key details.

[HTML TABLE WITH AT LEAST 5-8 UNIVERSITIES HERE]

These programs offer excellent opportunities for career advancement. Most are UGC-recognized and provide flexible learning options. Consider factors like accreditation, placement records, and your career goals when choosing.

Would you like me to:
- Provide detailed information about specific MBA specializations (Finance, Marketing, HR, etc.)?
- Compare fees and duration across different universities?
- Explain the admission process for any particular program?
- Suggest programs based on your specific career goals or location preferences?"

SPECIFIC FOLLOW-UP QUESTION EXAMPLES BY TOPIC:

For MBA Programs:
- "Would you like me to provide detailed information about specific MBA specializations (Finance, Marketing, HR, Operations, etc.)?"
- "Should I compare the admission requirements and entrance exams for these programs?"
- "Would you like to know about the placement records and average salary packages?"
- "Do you want me to suggest programs based on your work experience or career goals?"

For Engineering Courses:
- "Would you like me to provide detailed information about specific engineering branches (Computer Science, Mechanical, Civil, etc.)?"
- "Should I compare the curriculum and practical training aspects of these programs?"
- "Would you like to know about the industry partnerships and internship opportunities?"
- "Do you want me to suggest programs based on your interest in specific technologies?"

For Online Courses:
- "Would you like me to provide detailed information about the learning platform and study materials?"
- "Should I compare the flexibility and support services offered by these institutions?"
- "Would you like to know about the examination pattern and certification process?"
- "Do you want me to suggest courses based on your current educational background?"

For Fee Structures:
- "Would you like me to break down the fee structure and payment options for any specific program?"
- "Should I compare the total cost including additional expenses like study materials and exams?"
- "Would you like to know about scholarship opportunities and financial aid options?"
- "Do you want me to suggest the most cost-effective options within your budget?"

If the user asks something not related to universities/courses, respond normally in conversational text.

CRITICAL REQUIREMENTS FOR TABLES:
- always give answer in the context of online universities and courses that give online degrees
- Always include at least 5-8 universities in your tables
- Mix of government and private institutions
- Include both well-known and lesser-known but good options
- Provide comprehensive choices for users
- Never limit to just 2-3 universities

Always be helpful, encouraging, and guide users toward making informed decisions.`;


    const userPrompt = `User question: ${question}`;

    // Function to generate follow-up questions using AI
    async function generateFollowUpQuestions(response) {
      try {
        const followUpPrompt = `Based on this answer about universities and courses in India: "${response}", 
        suggest 3 short follow-up questions a student might ask. 
        Make them specific, helpful, and directly related to the content.
        Format as a simple list, one question per line, without numbering or bullets.`;

        const followUpCompletion = await openaiClient.chat.completions.create({
          model: modelFromEnv,
          messages: [
            { role: 'system', content: 'You are a helpful assistant that suggests relevant follow-up questions for students.' },
            { role: 'user', content: followUpPrompt }
          ],
          max_tokens: 150,
          temperature: 0.7
        });

        const followUpText = followUpCompletion.choices[0].message.content.trim();
        const questions = followUpText.split('\n').filter(q => q.trim()).map(q => q.trim());
        
        return questions.length > 0 ? questions[0] : 'Ask a follow-up question...';
      } catch (error) {
        console.error('Error generating follow-up questions:', error);
        return 'Ask a follow-up question...';
      }
    }

    // Function to clean up tables with empty columns
    function cleanTableResponse(response) {
      try {
        if (!response.includes('<table')) return response;
        
        // Extract table content
        const tableMatch = response.match(/<table[^>]*>([\s\S]*?)<\/table>/);
        if (!tableMatch) return response;
        
        const tableContent = tableMatch[1];
        const headerMatch = tableContent.match(/<thead>([\s\S]*?)<\/thead>/);
        const bodyMatch = tableContent.match(/<tbody>([\s\S]*?)<\/tbody>/);
        
        if (!headerMatch || !bodyMatch) return response;
        
        // Get header columns
        const headerCells = headerMatch[1].match(/<th[^>]*>([^<]*)<\/th>/g) || [];
        const headers = headerCells.map(cell => cell.replace(/<[^>]*>/g, '').trim());
        
        // Get first row to check for empty columns
        const firstRowMatch = bodyMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/);
        if (!firstRowMatch) return response;
        
        const firstRowCells = firstRowMatch[1].match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
        const firstRowData = firstRowCells.map(cell => cell.replace(/<[^>]*>/g, '').trim());
        
        // Find columns with data
        const columnsWithData = [];
        headers.forEach((header, index) => {
          if (firstRowData[index] && firstRowData[index] !== '' && firstRowData[index] !== '-') {
            columnsWithData.push(index);
          }
        });
        
        // If all columns have data, return original response
        if (columnsWithData.length === headers.length) return response;
        
        // Rebuild table with only columns that have data
        let newTable = response.replace(/<table[^>]*>/, '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0; font-family: Arial, sans-serif;">');
        
        // Update header
        const newHeaders = columnsWithData.map(index => headerCells[index]).join('');
        newTable = newTable.replace(/<thead>[\s\S]*?<\/thead>/, `<thead><tr>${newHeaders}</tr></thead>`);
        
        // Update all body rows
        const allRows = bodyMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || [];
        const newRows = allRows.map(row => {
          const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
          const newCells = columnsWithData.map(index => cells[index] || '').join('');
          return row.replace(/<tr[^>]*>[\s\S]*?<\/tr>/, `<tr>${newCells}</tr>`);
        });
        
        newTable = newTable.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>${newRows.join('')}</tbody>`);
        
        return newTable;
      } catch (error) {
        console.error('Error cleaning table:', error);
        return response;
      }
    }

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
        // Clean up the table response to remove empty columns
        const cleanedResponse = cleanTableResponse(fullResponse);
        
        // Generate follow-up questions using AI
        const followUpQuestion = await generateFollowUpQuestions(cleanedResponse);
        
        res.write(`data: ${JSON.stringify({ 
          content: '', 
          full: true, 
          fullResponse: cleanedResponse,
          followUpQuestion: followUpQuestion
        })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error in /api/query:', error);
    
    // Check if headers have already been sent (streaming started)
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ content: '', full: true, fullResponse: 'Error: Failed to get response from AI. Please try again.' })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: 'Failed to get response from AI' });
    }
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


