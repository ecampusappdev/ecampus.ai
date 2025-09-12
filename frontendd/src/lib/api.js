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
    return text;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let aggregated = '';
  let finalFullResponse = '';

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
          // Server signals final payload with fullResponse
          if (evt.fullResponse) finalFullResponse = evt.fullResponse;
        } else if (evt.content) {
          aggregated += evt.content;
          if (onDelta) onDelta(evt.content);
        }
      } catch (_) {
        // ignore malformed chunks
      }
    }
  }

  return finalFullResponse || aggregated.trim();
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
