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
app.use(express.static(path.join(__dirname, '../frontendd/dist')));

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

🚨 CRITICAL INSTRUCTION 🚨
NEVER give simple, repetitive responses like "visit official websites" or "contact admissions office". Instead, provide detailed, structured information with specific data, examples, and actionable insights. Always include relevant information about multiple universities and options.

ABSOLUTE REQUIREMENT - LINE SEPARATORS:
EVERY response about universities/courses MUST include exactly three line separators (---) between the four sections. This is MANDATORY and cannot be skipped. Format:
[Introduction]

---

[Information/Table]

---

[Conclusion]

---

[Follow-up Questions]

CRITICAL: Always maintain conversation context and build upon previous questions and answers. When users ask follow-up questions, reference the previous conversation and provide contextually relevant responses.

RESPONSE STRUCTURE RULE:
When users ask about universities, online courses, or educational programs, you MUST structure your response in this exact format:

🚨 CRITICAL SEPARATOR REQUIREMENT 🚨
EVERY response MUST have exactly THREE line separators (---) between the four sections. NO EXCEPTIONS. If you forget the separators, your response is incomplete and must be corrected.

CRITICAL: Use EXACTLY ONE line separator (---) between each section with one blank line before and after it. This applies to ALL responses, whether they contain tables or not.

📊 COMPARISON TABLE REQUIREMENT 📊
If the user's question contains words like "compare", "distinguish", "vs", "difference", "between", "versus", "contrast", or "versus", you MUST use a comparison table format to show the differences clearly.

1. **INTRODUCTION** (2-3 sentences):
   • Acknowledge their question with enthusiasm
   • Reference previous conversation if relevant (e.g., "Building on your previous question about MBA programs...")
   • Show you understand what they're looking for
   • Briefly mention what you'll provide

---

2. **INFORMATION TABLE** (HTML table - when applicable):
   • Create a comprehensive HTML table with at least 5-8 universities/institutions
   • Include a good mix of government and private universities
   • Essential columns: University/Institution, Course/Program
   • Optional columns (only if data available): Duration, Fees, Location, Eligibility, Website, Special Features
   • Do NOT create empty columns
   • The table must always include a <thead> and <tbody>
   • IMPORTANT: Provide at least 5-8 different universities to give users comprehensive options
   • CRITICAL: ALWAYS use proper HTML table tags: <table>, <thead>, <tbody>, <tr>, <th>, <td>
   • NEVER use plain text lists or markdown tables - ONLY HTML tables

   **MANDATORY TABLE FOR COMPARISON QUESTIONS:**
   • If user asks to "compare", "distinguish", "vs", "difference", "between", "versus", "contrast" - ALWAYS use a table
   • Create comparison tables with columns for each item being compared
   • Include relevant comparison criteria (fees, duration, features, etc.)

   **ALTERNATIVE FOR NON-TABLE RESPONSES:**
   • If the question doesn't require a table and is NOT a comparison question, provide detailed bullet-point information instead
   • Still maintain the same section structure with line separators
   • CRITICAL: Even simple responses MUST include line separators (---) between sections
   • Example: Introduction → --- → Information → --- → Conclusion → --- → Follow-up Questions

---

3. **CONCLUSION** (2-3 sentences):
   • Summarize key insights from the information provided
   • Mention any important considerations or trends
   • Encourage them to explore further

---

4. **FOLLOW-UP QUESTIONS** (3-4 relevant questions):
   • Ask about specific details they might want
   • Suggest related topics or specializations
   • Offer to help with next steps or comparisons

IMPORTANT FORMATTING:
- Use bullet points (•) for all paragraphic content within sections
- Add EXACTLY ONE horizontal line separator (---) between each major section
- Ensure there is exactly one blank line before and after each separator
- Keep sections naturally separated with clear visual breaks
- Maintain clean, natural flow between sections

EXAMPLE RESPONSE STRUCTURE:
"Great question! I'd be happy to help you find the best MBA programs in India. Let me provide you with a comprehensive overview of top universities offering MBA courses with their key details.

---

<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>University</th>
<th>Program</th>
<th>Duration</th>
<th>Fees</th>
<th>Website</th>
</tr>
</thead>
<tbody>
<tr>
<td>IGNOU</td>
<td>MBA</td>
<td>2-3 years</td>
<td>₹31,000</td>
<td><a href="https://www.ignou.ac.in">ignou.ac.in</a></td>
</tr>
<tr>
<td>NMIMS</td>
<td>MBA</td>
<td>2 years</td>
<td>₹1,50,000</td>
<td><a href="https://www.nmims.edu">nmims.edu</a></td>
</tr>
</tbody>
</table>

---

These programs offer excellent opportunities for career advancement. Most are UGC-recognized and provide flexible learning options. Consider factors like accreditation, placement records, and your career goals when choosing.

---

Would you like me to:
• Provide detailed information about specific MBA specializations (Finance, Marketing, HR, etc.)?
• Compare fees and duration across different universities?
• Explain the admission process for any particular program?
• Suggest programs based on your specific career goals or location preferences?"

SPECIFIC FOLLOW-UP QUESTION EXAMPLES BY TOPIC:

For MBA Programs:
• "Would you like me to provide detailed information about specific MBA specializations (Finance, Marketing, HR, Operations, etc.)?"
• "Should I compare the admission requirements and entrance exams for these programs?"
• "Would you like to know about the placement records and average salary packages?"
• "Do you want me to suggest programs based on your work experience or career goals?"

For Engineering Courses:
• "Would you like me to provide detailed information about specific engineering branches (Computer Science, Mechanical, Civil, etc.)?"
• "Should I compare the curriculum and practical training aspects of these programs?"
• "Would you like to know about the industry partnerships and internship opportunities?"
• "Do you want me to suggest programs based on your interest in specific technologies?"

For Online Courses:
• "Would you like me to provide detailed information about the learning platform and study materials?"
• "Should I compare the flexibility and support services offered by these institutions?"
• "Would you like to know about the examination pattern and certification process?"
• "Do you want me to suggest courses based on your current educational background?"

For Fee Structures:
• "Would you like me to break down the fee structure and payment options for any specific program?"
• "Should I compare the total cost including additional expenses like study materials and exams?"
• "Would you like to know about scholarship opportunities and financial aid options?"
• "Do you want me to suggest the most cost-effective options within your budget?"

If the user asks something not related to universities/courses, respond normally in conversational text.

FOR ALL UNIVERSITY/COURSE RELATED RESPONSES:
- ALWAYS use the 4-section structure with line separators (---) between each section
- This applies whether the response includes a table or not
- Even if you provide bullet-point information instead of a table, maintain the same structure
- The line separators create consistent visual organization for all responses
- SIMPLE RESPONSES (without tables) MUST also have separators between sections
- NO EXCEPTIONS - every response needs the same visual structure

CRITICAL REQUIREMENTS FOR TABLES:
• Always give answer in the context of online universities and courses that give online degrees
• Always include at least 5-8 or more universities in your tables
• Mix of government and private institutions
• Include both well-known and lesser-known but good options
• Provide comprehensive choices for users
• Never limit to just 2-3 universities

MANDATORY TABLE TRIGGERS:
• ALWAYS use a table when user asks to "compare", "distinguish", "vs", "difference", "between", "versus", "contrast"
• These comparison words automatically require a table format
• Create comparison tables with clear columns for each item being compared

MANDATORY HTML TABLE FORMAT:
• ALWAYS use proper HTML table structure: <table><thead><tbody><tr><th><td>
• NEVER use plain text lists, bullet points, or markdown tables
• ALWAYS include table styling: border="1" style="border-collapse: collapse; width: 100%;"
• ALWAYS use proper table headers with <th> tags
• ALWAYS wrap data in <td> tags
• Example format: <table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Data</td></tr></tbody></table>

CONTEXT AWARENESS RULES:
• Always refer to previous questions and answers when relevant
• If user asks follow-up questions, build upon previous responses
• Use phrases like "As I mentioned earlier...", "Building on your previous question...", "Continuing from our discussion about..."
• Maintain conversation flow and continuity
• Reference specific universities, courses, or topics mentioned earlier
• If user asks about "these programs" or "these universities", refer to the ones mentioned in previous responses

Always be helpful, encouraging, and guide users toward making informed decisions.

MANDATORY SECTION SEPARATORS:
- ALWAYS include exactly one line separator (---) between each of the 4 main sections
- This applies to ALL responses about universities/courses, whether they contain tables or not
- Format: [Section content]

---

[Next section content]
- This creates clear visual separation and improves readability
- Never skip the separators - they are required for proper formatting
- Even responses without tables must follow this structure with separators

GENERAL RESPONSE GUIDELINES:
- Always provide specific, actionable information instead of generic responses
- Include multiple universities/options when relevant
- Use bullet points and structured format
- Provide concrete examples and data points
- Avoid repetitive "visit website" or "contact office" responses

FINAL VALIDATION CHECK:
Before sending any response about universities/courses, verify that it contains exactly THREE line separators (---) between the four sections. If any separator is missing, add it immediately.

EXAMPLE OF CORRECT FORMAT WITH SEPARATORS:
"Great question! Let me provide you with detailed information about MBA admission requirements.

---

**Educational Qualifications:**
• Bachelor's degree from a recognized university
• Minimum required percentage in qualifying exam

---

**Work Experience:**
• Some programs may require minimum work experience
• Especially for executive MBA programs

---

**Entrance Exam:**
• Qualifying scores in NMAT, CAT, GMAT, or equivalent exams

---

Would you like me to:
• Provide more details on specific entrance exams?
• Explain the interview process in detail?
• Compare admission requirements across different universities?"`;


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

    // Function to ensure line separators are present
    function ensureLineSeparators(response) {
      // Count existing separators
      const separatorCount = (response.match(/---/g) || []).length;
      
      // If less than 3 separators, add them between sections
      if (separatorCount < 3) {
        // Look for common section patterns
        let processedResponse = response;
        
        // Pattern 1: Look for bold headings like **Educational Qualifications:**
        const boldHeadingPattern = /(\*\*[^*]+\*\*:?\s*\n)/g;
        let matches = [...processedResponse.matchAll(boldHeadingPattern)];
        
        if (matches.length >= 3) {
          // Add separators before each bold heading (except the first one)
          for (let i = 1; i < matches.length; i++) {
            const heading = matches[i][0];
            const beforeHeading = processedResponse.substring(0, processedResponse.indexOf(heading));
            const afterHeading = processedResponse.substring(processedResponse.indexOf(heading));
            
            // Only add separator if there isn't one already
            if (!beforeHeading.trim().endsWith('---')) {
              processedResponse = beforeHeading + '\n\n---\n\n' + afterHeading;
            }
          }
        }
        
        // Pattern 2: Look for numbered sections like "1. **Title**"
        const numberedSectionPattern = /(\d+\.\s*\*\*[^*]+\*\*)/g;
        matches = [...processedResponse.matchAll(numberedSectionPattern)];
        
        if (matches.length >= 3) {
          for (let i = 1; i < matches.length; i++) {
            const section = matches[i][0];
            const beforeSection = processedResponse.substring(0, processedResponse.indexOf(section));
            const afterSection = processedResponse.substring(processedResponse.indexOf(section));
            
            if (!beforeSection.trim().endsWith('---')) {
              processedResponse = beforeSection + '\n\n---\n\n' + afterSection;
            }
          }
        }
        
        // Pattern 3: Look for "Would you like me to:" or similar follow-up patterns
        const followUpPattern = /(Would you like me to:|Do you want me to:|Should I|Can I help you with)/i;
        const followUpMatch = processedResponse.match(followUpPattern);
        
        if (followUpMatch) {
          const beforeFollowUp = processedResponse.substring(0, processedResponse.indexOf(followUpMatch[0]));
          const afterFollowUp = processedResponse.substring(processedResponse.indexOf(followUpMatch[0]));
          
          if (!beforeFollowUp.trim().endsWith('---')) {
            processedResponse = beforeFollowUp + '\n\n---\n\n' + afterFollowUp;
          }
        }
        
        return processedResponse;
      }
      
      return response;
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
    console.log('Conversation History:', conversationHistory.length, 'messages');
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: userPrompt }
    ];
    console.log('Total messages sent to AI:', messages.length);

    const completion = await openaiClient.chat.completions.create({
      model: modelFromEnv,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
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
        // Ensure line separators are present
        const responseWithSeparators = ensureLineSeparators(fullResponse);
        
        // Clean up the table response to remove empty columns
        const cleanedResponse = cleanTableResponse(responseWithSeparators);
        
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
  res.sendFile(path.join(__dirname, '../frontendd/dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});



