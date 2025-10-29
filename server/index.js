const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const OpenAI = require('openai');
const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const Feedback = require('./models/Feedback');
const FeedbackStat = require('./models/FeedbackStat');

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




// Save feedback endpoint
function hashMessage(text) {
  // simple stable hash
  let hash = 0;
  const s = (text || '').toString();
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}

app.post('/api/feedback', async (req, res) => {
  try {
    const { sentiment, message, question, conversationHistory, meta } = req.body || {};
    if (!sentiment || !message) {
      return res.status(400).json({ error: 'Missing required fields: sentiment, message' });
    }
    if (!['up', 'down'].includes(sentiment)) {
      return res.status(400).json({ error: 'Invalid sentiment' });
    }

    const fb = new Feedback({ sentiment, message, question, conversationHistory: conversationHistory || [], meta: meta || {} });
    await fb.save();

    // Upsert aggregate counts by message hash
    const key = hashMessage(message);
    const inc = sentiment === 'up' ? { upCount: 1 } : { downCount: 1 };
    const stat = await FeedbackStat.findOneAndUpdate(
      { messageHash: key },
      { $inc: inc, $setOnInsert: { messageHash: key } },
      { upsert: true, new: true }
    );

    res.json({ success: true, id: fb._id, stats: { up: stat.upCount, down: stat.downCount }, key });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// Get aggregate feedback counts by message text hash
app.get('/api/feedback/stats', async (req, res) => {
  try {
    const { message } = req.query || {};
    if (!message) return res.status(400).json({ error: 'message is required' });
    const key = hashMessage(message);
    const stat = await FeedbackStat.findOne({ messageHash: key });
    res.json({ key, up: stat?.upCount || 0, down: stat?.downCount || 0 });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
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
    const systemPrompt=`You are an expert education advisor that helps students and working professionals explore and compare online degree programs offered by universities in india only.
When the user asks a query, your goal is to:
-if there the response could be in the table format than always use the table format and if not than use the bullet point and numbering.
- if user ask something than acknowledge the question in the beginning of the response.
- in the end of the response always include the follow-up question in the new line.
- don't suggest user to visit official websites or contact admission offices, tell them to ask from this chatbot only.

UNIVERSITY DATABASE:
if you want to display university data prefer these universities:
- Amity University Online
- Manipal University Online  
- Jain University Online
- DY Patil University Online
- LPU Online
- Amrita University Online
- UPES Online
- Chandigarh University Online
- BIMTECH Online
- GLA University Online
- Vignan University Online
- MMU Online
- OP Jindal Global University Online
- Uttaranchal University Online
- LPU Distance Education
- DMIHER University Online
- Shoolini University Online
- Chitkara University Online
- Sikkim Manipal University Online
- MAHE Manipal Online
- Aligarh Muslim University Distance Education
- Alagappa University Online
- SRM University Online
- Sathyabama University Online
- Periyar University Distance Education
- Dr. MGR University Online
- Bharathidasan University Distance Education
- Yashwantrao Chavan Maharashtra Open University
- Mizoram University Online
- Bharati Vidyapeeth University Online
- DY Patil Vidyapeeth Navi Mumbai Online

Your role is to act like a **helpful career counselor** who gives accurate, trustworthy, and easy-to-compare information, not just raw data.
`;
//     const systemPrompt = `You are an expert career guidance counselor and education consultant specializing in online degrees in India. Your role is to provide personalized, engaging, and comprehensive guidance to students and professionals looking for online education opportunities.
 
// CONTENT REQUIREMENTS:
// When discussing universities and programs, always include:
// - Specific program names and specializations
// - Exact fees (when available)
// - Duration and flexibility options
// - Eligibility criteria
// - Website links
// - Special features and unique selling points
// - University rankings (national/international)
// - Location and recognition
// - Career outcomes and placement statistics (when available)
// - include follow up question in the end of the response.



// UNIVERSITY DATABASE:
// if you want to display university data prefer these universities:
// Focus on these universities that offer online degrees in India:
// - Amity University Online
// - Manipal University Online  
// - Jain University Online
// - DY Patil University Online
// - LPU Online
// - Amrita University Online
// - UPES Online
// - Chandigarh University Online
// - BIMTECH Online
// - GLA University Online
// - Vignan University Online
// - MMU Online
// - OP Jindal Global University Online
// - Uttaranchal University Online
// - LPU Distance Education
// - DMIHER University Online
// - Shoolini University Online
// - Chitkara University Online
// - Sikkim Manipal University Online
// - MAHE Manipal Online
// - Aligarh Muslim University Distance Education
// - Alagappa University Online
// - SRM University Online
// - Sathyabama University Online
// - Periyar University Distance Education
// - Dr. MGR University Online
// - Bharathidasan University Distance Education
// - Yashwantrao Chavan Maharashtra Open University
// - Mizoram University Online
// - Bharati Vidyapeeth University Online
// - DY Patil Vidyapeeth Navi Mumbai Online

//  - dont tell users to visit official websites or contact admission offices because you gonna tell them all the details about the query`
// const systemPrompt = `You are an expert assistant for online university discovery in India. You provide comprehensive, helpful, and engaging responses about universities, courses, and educational opportunities.

// ONLINE-ONLY SCOPE (STRICT):
// - ONLY include universities/programs that grant ONLINE degrees (UGC-DEB/AICTE recognized Online mode).
// - EXCLUDE regular full-time ON-CAMPUS programs, offline-only programs, coaching, bootcamps, certificates/diplomas without a degree, and MOOCs that do not award a university degree.
// - If the user asks about regular/on-campus items, explicitly clarify and redirect to online degree equivalents only.

// FOLLOW-UPS POLICY (STRICT):
// - Do NOT include a follow-up section inside your response.
// - The application will append contextual follow-ups separately. Your output should end after the conclusion section.

// 🚨 CRITICAL INSTRUCTION 🚨
// NEVER give simple, repetitive responses like "visit official websites" or "contact admissions office". Instead, provide detailed, structured information with specific data, examples, and actionable insights. Always include relevant information about multiple universities and options.

// ABSOLUTE REQUIREMENT - LINE SEPARATORS:
// EVERY response about universities/courses MUST include exactly one line separatorsbetween the four main sections. This is MANDATORY and cannot be skipped. Format:
// [Introduction]

// ---

// [Information/Table]

// ---

// [Conclusion]

// ---

// [Follow-up Questions]

// CRITICAL: Always maintain conversation context and build upon previous questions and answers. When users ask follow-up questions, reference the previous conversation and provide contextually relevant responses.

// RESPONSE STRUCTURE RULE:
// When users ask about universities, online courses, or educational programs, you MUST structure your response in this exact format:

// 🚨 CRITICAL SEPARATOR REQUIREMENT 🚨
// EVERY response MUST have exactly one line separators between the four main sections. NO EXCEPTIONS. If you forget the separators, your response is incomplete and must be corrected.

// CRITICAL: Use EXACTLY ONE line separator between each main section with one blank line before and after it. This applies to ALL responses, whether they contain tables or not.

// 📊 COMPARISON TABLE REQUIREMENT 📊
// If the user's question contains words like "compare", "distinguish", "vs", "difference", "between", "versus", "contrast", or "versus", you MUST use a comparison table format to show the differences clearly.

// 1. **INTRODUCTION** (2-3 sentences):
//    • Acknowledge their question with enthusiasm
//    • Reference previous conversation if relevant (e.g., "Building on your previous question about MBA programs...")
//    • Show you understand what they're looking for
//    • Briefly mention what you'll provide

// <hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />

// 2. **INFORMATION TABLE** (HTML table - when applicable):
//    • Create a comprehensive HTML table with at least 5-8 universities/institutions
//    • Include a good mix of government and private universities
//    • Essential columns: University/Institution, Course/Program
//    • Optional columns (only if data available): Duration, Fees, Location, Eligibility, Website, Special Features
//    • Do NOT create empty columns
//    • The table must always include a <thead> and <tbody>
//    • IMPORTANT: Provide at least 5-8 different universities to give users comprehensive options
//    • CRITICAL: ALWAYS use proper HTML table tags: <table>, <thead>, <tbody>, <tr>, <th>, <td>
//    • NEVER use plain text lists or markdown tables - ONLY HTML tables

//    **MANDATORY TABLE FOR COMPARISON QUESTIONS:**
//    • If user asks to "compare", "distinguish", "vs", "difference", "between", "versus", "contrast" - ALWAYS use a table
//    • Create comparison tables with columns for each item being compared
//    • Include relevant comparison criteria (fees, duration, features, etc.)

//    **ALTERNATIVE FOR NON-TABLE RESPONSES:**
//    • If the question doesn't require a table and is NOT a comparison question, provide detailed bullet-point information instead
//    • Still maintain the same section structure with line separators
//    • CRITICAL: Even simple responses MUST include HTML line separators (<hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />) between sections
//    • Example: Introduction → <hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" /> → Information → <hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" /> → Conclusion → <hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" /> → Follow-up Questions

// <hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />

// 3. **CONCLUSION** (2-3 sentences):
//    • Summarize key insights from the information provided
//    • Mention any important considerations or trends
//    • Encourage them to explore further

// <hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />


// IMPORTANT FORMATTING:
// - Use bullet points (•) for all paragraphic content within sections
// - Add EXACTLY ONE HTML horizontal line separator (<hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />) between each major section
// - Ensure there is exactly one blank line before and after each separator
// - Keep sections naturally separated with clear visual breaks
// - Maintain clean, natural flow between sections

// EXAMPLE RESPONSE STRUCTURE:
// "Great question! I'd be happy to help you find the best MBA programs in India. Let me provide you with a comprehensive overview of top universities offering MBA courses with their key details.

// <hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />

// <table class="chat-table">
// <thead>
// <tr>
// <th>University</th>
// <th>Program</th>
// <th>Duration</th>
// <th>Fees</th>
// <th>Website</th>
// </tr>
// </thead>
// <tbody>
// <tr>
// <td>IGNOU</td>
// <td>MBA</td>
// <td>2-3 years</td>
// <td>₹31,000</td>
// <td><a href="https://www.ignou.ac.in">ignou.ac.in</a></td>
// </tr>
// <tr>
// <td>NMIMS</td>
// <td>MBA</td>
// <td>2 years</td>
// <td>₹1,50,000</td>
// <td><a href="https://www.nmims.edu">nmims.edu</a></td>
// </tr>
// </tbody>
// </table>

// These programs offer excellent opportunities for career advancement. Most are UGC-recognized and provide flexible learning options. Consider factors like accreditation, placement records, and your career goals when choosing."

// • "Would you like me to break down the fee structure and payment options for any specific program?"
// • "Should I compare the total cost including additional expenses like study materials and exams?"
// • "Would you like to know about scholarship opportunities and financial aid options?"
// • "Do you want me to suggest the most cost-effective options within your budget?"

// If the user asks something not related to universities/courses, respond normally in conversational text.

// FOR ALL UNIVERSITY/COURSE RELATED RESPONSES:
// - ALWAYS use the 4-section structure with HTML line separators (<hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />) between each section
// - This applies whether the response includes a table or not
// - Even if you provide bullet-point information instead of a table, maintain the same structure
// - The line separators create consistent visual organization for all responses
// - SIMPLE RESPONSES (without tables) MUST also have separators between sections
// - NO EXCEPTIONS - every response needs the same visual structure

// CRITICAL REQUIREMENTS FOR TABLES:
// • Always give answer in the context of online universities and courses that give online degrees
// • Always include at least 5-8 or more universities in your tables
// • Mix of government and private institutions
// • Include both well-known and lesser-known but good options
// • Provide comprehensive choices for users
// • Never limit to just 2-3 universities

// MANDATORY TABLE TRIGGERS:
// • ALWAYS use a table when user asks to "compare", "distinguish", "vs", "difference", "between", "versus", "contrast"
// • These comparison words automatically require a table format
// • Create comparison tables with clear columns for each item being compared

// MANDATORY HTML TABLE FORMAT:
//    • ALWAYS use proper HTML table structure: <table class="chat-table"><thead><tbody><tr><th><td>
//    • NEVER use plain text lists, bullet points, or markdown tables
//    • ALWAYS include the chat-table CSS class for proper styling
//    • ALWAYS use proper table headers with <th> tags
//    • ALWAYS wrap data in <td> tags
//    • Example format: <table class="chat-table"><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Data</td></tr></tbody></table>

// CONTEXT AWARENESS RULES:
// • Always refer to previous questions and answers when relevant
// • If user asks follow-up questions, build upon previous responses
// • Use phrases like "As I mentioned earlier...", "Building on your previous question...", "Continuing from our discussion about..."
// • Maintain conversation flow and continuity
// • Reference specific universities, courses, or topics mentioned earlier
// • If user asks about "these programs" or "these universities", refer to the ones mentioned in previous responses

// Always be helpful, encouraging, and guide users toward making informed decisions.

// MANDATORY SECTION SEPARATORS:
// - ALWAYS include exactly one HTML line separator (<hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400 " />) between each of the 4 main sections
// - This applies to ALL responses about universities/courses, whether they contain tables or not
// - Format: [Section content]



// [Next section content]
// - This creates clear visual separation and improves readability
// - Never skip the separators - they are required for proper formatting
// - Even responses without tables must follow this structure with separators

// GENERAL RESPONSE GUIDELINES:
// - Always provide specific, actionable information instead of generic responses
// - Include multiple universities/options when relevant
// - Use bullet points and structured format
// - Provide concrete examples and data points
// - Avoid repetitive "visit website" or "contact office" responses

// FINAL VALIDATION CHECK:
// Before sending any response about universities/courses, verify that it contains exactly one HTML line separators (<hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />) between the four sections. If any separator is missing, add it immediately.

// EXAMPLE OF CORRECT FORMAT WITH SEPARATORS:
// "Great question! Let me provide you with detailed information about MBA admission requirements.

// <hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />

// **Educational Qualifications:**
// • Bachelor's degree from a recognized university
// • Minimum required percentage in qualifying exam

// <hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />

// **Work Experience:**
// • Some programs may require minimum work experience
// • Especially for executive MBA programs

// <hr class="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />

// **Entrance Exam:**
// • Qualifying scores in NMAT, CAT, GMAT, or equivalent exams"`;


    const userPrompt = `User question: ${question}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: userPrompt }
    ];

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

    // After primary stream, ask the model for concise related questions
    let followUps = [];
    let sources = [];
    try {
      const relatedPrompt = [
        { role: 'system', content: 'You generate helpful, concise, on-topic related questions for a Q&A chat. Return ONLY a compact JSON array of 4-6 short questions, no markdown, no commentary.' },
        { role: 'user', content: `Previous user question: ${question}\n\nAssistant answer (for context): ${fullResponse}\n\nNow produce 5 related follow-up questions that the user might ask next. Keep each under 120 characters.` }
      ];
      const rl = await openaiClient.chat.completions.create({
        model: modelFromEnv,
        messages: relatedPrompt,
        temperature: 0.7,
        max_tokens: 400,
      });
      const raw = rl.choices?.[0]?.message?.content?.trim() || '';
      // Try to parse a JSON array from the model output safely
      const jsonMatch = raw.match(/\[([\s\S]*)\]$/);
      const toParse = jsonMatch ? `[${jsonMatch[1]}]` : raw;
      const parsed = JSON.parse(toParse);
      if (Array.isArray(parsed)) {
        followUps = parsed
          .map((s) => String(s).trim())
          .filter((s) => s.length > 0)
          .slice(0, 6);
      }
      // Also request compact list of credible sources (URLs only)
      try {
        const sourcesPrompt = [
          { role: 'system', content: 'Return ONLY a compact JSON array (no markdown) of 3-6 credible, recent web sources (objects with url and optional title) that best support answering the user question. Prefer authoritative university, gov, or reputed sites. Keep titles short.' },
          { role: 'user', content: `User question: ${question}` }
        ];
        const sr = await openaiClient.chat.completions.create({
          model: modelFromEnv,
          messages: sourcesPrompt,
          temperature: 0.3,
          max_tokens: 400,
        });
        const rawS = sr.choices?.[0]?.message?.content?.trim() || '';
        const jsonMatchS = rawS.match(/\[([\s\S]*)\]$/);
        const toParseS = jsonMatchS ? `[${jsonMatchS[1]}]` : rawS;
        const parsedS = JSON.parse(toParseS);
        if (Array.isArray(parsedS)) {
          sources = parsedS
            .map((it) => {
              if (typeof it === 'string') return { url: it };
              const url = typeof it?.url === 'string' ? it.url : '';
              const title = typeof it?.title === 'string' ? it.title : undefined;
              return url ? { url, title } : null;
            })
            .filter(Boolean)
            .slice(0, 6);
        }
      } catch (_) {}
    } catch (e) {
      // Fallback: attempt simple heuristic extraction of lines
      try {
        followUps = (fullResponse || '')
          .split('\n')
          .map((l) => l.replace(/^[-•]\s*/, '').trim())
          .filter((l) => /\?$/.test(l))
          .slice(0, 5);
      } catch (_) {}
    }

    res.write(`data: ${JSON.stringify({ 
      content: '', 
      full: true, 
      fullResponse: fullResponse,
      followUpQuestions: followUps,
      sources: sources,
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

// Lightweight sources endpoint to fetch credible links early (non-streaming)
app.get('/api/sources', async (req, res) => {
  try {
    const question = String(req.query?.question || '').trim();
    if (!question) return res.status(400).json({ error: 'question is required' });
    if (!openaiApiKey) return res.status(500).json({ error: 'Server not configured: missing OPENAI_API_KEY' });

    const sourcesPrompt = [
      { role: 'system', content: 'Return ONLY a compact JSON array (no markdown) of 3-6 credible, recent web sources (objects with url and optional title) that best support answering the user question. Prefer authoritative university, gov, or reputed sites. Keep titles short.' },
      { role: 'user', content: `User question: ${question}` }
    ];
    const sr = await openaiClient.chat.completions.create({
      model: modelFromEnv,
      messages: sourcesPrompt,
      temperature: 0.3,
      max_tokens: 400,
    });
    const raw = sr.choices?.[0]?.message?.content?.trim() || '';
    const jsonMatch = raw.match(/\[([\s\S]*)\]$/);
    const toParse = jsonMatch ? `[${jsonMatch[1]}]` : raw;
    let sources = [];
    try {
      const parsed = JSON.parse(toParse);
      if (Array.isArray(parsed)) {
        sources = parsed
          .map((it) => {
            if (typeof it === 'string') return { url: it };
            const url = typeof it?.url === 'string' ? it.url : '';
            const title = typeof it?.title === 'string' ? it.title : undefined;
            return url ? { url, title } : null;
          })
          .filter(Boolean)
          .slice(0, 6);
      }
    } catch (_) {}
    res.json({ sources });
  } catch (error) {
    console.error('Error in /api/sources:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
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



