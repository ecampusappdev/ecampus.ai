const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openaiApiKey = process.env.OPENAI_API_KEY;
const modelFromEnv = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!openaiApiKey) {
  console.warn('Warning: OPENAI_API_KEY is not set. The /api/query endpoint will return 500.');
}

const openaiClient = new OpenAI({ apiKey: openaiApiKey });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/query', async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Invalid request: question is required' });
    }

    if (!openaiApiKey) {
      return res.status(500).json({ error: 'Server not configured: missing OPENAI_API_KEY' });
    }

    const systemPrompt = [
      'You are an assistant for an online university discovery chat.',
      'Rules:',
      '- Only recommend online programs/courses (no offline or on-campus).',
      '- Include fees (approximate if needed), duration, and eligibility.',
      '- Keep the response as one clear, cohesive paragraph (no lists).',
      '- Avoid recommending in-person/offline programs.',
      '- Be concise, factual, and specific.',
    ].join(' ');

    const userPrompt = `User question: ${question}`;

    const completion = await openaiClient.chat.completions.create({
      model: modelFromEnv,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 350,
    });

    const answer = completion.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';
    res.json({ answer });
  } catch (error) {
    console.error('Error in /api/query:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


