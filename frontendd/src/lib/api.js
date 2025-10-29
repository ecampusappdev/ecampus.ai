export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function askQuery(question, conversationHistory = [], onDelta) {
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, conversationHistory })
  });
  if (!res.ok) throw new Error('Failed to query');

  // Parse Server-Sent Events (SSE) stream
  const reader = res.body?.getReader();
  if (!reader) {
    // Fallback to text if no stream
    const text = await res.text();
    if (onDelta) onDelta(text);
    return { fullResponse: text, followUpQuestions: [] };
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let aggregated = '';
  let finalFullResponse = '';
  let finalFollowUps = [];
  let finalSources = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE messages are separated by double newlines
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data:')) continue;
      const jsonStr = line.slice(5).trim();
      if (!jsonStr) continue;
      try {
        const evt = JSON.parse(jsonStr);
        if (evt.full) {
          // Server signals final payload with fullResponse and follow-ups
          if (evt.fullResponse) finalFullResponse = evt.fullResponse;
          if (Array.isArray(evt.followUpQuestions)) finalFollowUps = evt.followUpQuestions;
          if (Array.isArray(evt.sources)) finalSources = evt.sources;
        } else if (evt.content) {
          aggregated += evt.content;
          if (onDelta) onDelta(evt.content);
        }
      } catch (_) {
        // ignore malformed chunks
      }
    }
  }

  const finalText = finalFullResponse || aggregated.trim();
  return { fullResponse: finalText, followUpQuestions: finalFollowUps, sources: finalSources };
}

export async function saveLead(payload) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to save lead');
  return res.json();
}

export async function health() {
  const res = await fetch(`/health`);
  return res.json();
}

export async function submitFeedback({ sentiment, message, question, conversationHistory, meta }) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sentiment, message, question, conversationHistory, meta })
  });
  if (!res.ok) throw new Error('Failed to submit feedback');
  return res.json();
}

export async function fetchFeedbackStats(message) {
  const params = new URLSearchParams({ message });
  const res = await fetch(`${API_BASE}/feedback/stats?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchSources(question) {
  const params = new URLSearchParams({ question });
  const res = await fetch(`${API_BASE}/sources?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch sources');
  const data = await res.json();
  return Array.isArray(data?.sources) ? data.sources : [];
}
