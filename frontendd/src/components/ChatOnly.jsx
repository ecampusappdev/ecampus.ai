import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Chat from './Chat';
import { askQuery, submitFeedback } from '../lib/api';

export default function ChatOnly() {
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPlaceholder, setSuggestedPlaceholder] = useState("");
  const [feedbackMap, setFeedbackMap] = useState({});
  const [finalizedMap, setFinalizedMap] = useState({});
  const [relatedMap, setRelatedMap] = useState({}); // { [index]: string[] }
  const [copiedMap, setCopiedMap] = useState({});
  const [condensedMap, setCondensedMap] = useState({});
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isAtBottomRef = useRef(true);

  // Hydrate messages from localStorage on mount (persist chat across reloads)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chat_messages');
      console.log('ChatOnly hydrating from localStorage:', saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          console.log('ChatOnly restored messages:', parsed);
        }
      }
    } catch (error) {
      console.error('ChatOnly error hydrating:', error);
    }
  }, []);

  // Persist messages on change
  useEffect(() => {
    try {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
      console.log('ChatOnly saved to localStorage:', messages.length, 'messages');
    } catch (error) {
      console.error('ChatOnly error saving:', error);
    }
  }, [messages]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const threshold = 60;
      isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (isAtBottomRef.current) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [messages.length]);

  const processResponse = (text) => {
    let processed = text || '';
    processed = processed.replace(/<hr[^>]*>/gi, '\n\n---\n\n').replace(/\n\s*---\s*\n/g, '\n\n---\n\n');
    processed = processed.replace(/^\s*•\s+/gm, '- ');
    processed = processed.replace(/(\S)\s*(\*\*Would you like to know[^*]*\*\*)\s*$/i, '$1\n\n$2');
    return processed;
  };

  const handleQuery = async (queryText, conversationHistory) => {
    setIsLoading(true);
    try {
      let liveText = '';
      const placeholderIndex = messages.length + 1;
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const { fullResponse, followUpQuestions } = await askQuery(queryText, conversationHistory, (delta) => {
        liveText += delta;
        const processedLive = processResponse(liveText);
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: processedLive };
          return copy;
        });
      });

      const processedResponse = processResponse(fullResponse);
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'assistant', content: processedResponse };
        return copy;
      });
      setFinalizedMap(prev => ({ ...prev, [placeholderIndex]: true }));
      if (Array.isArray(followUpQuestions) && followUpQuestions.length > 0) {
        setRelatedMap(prev => ({ ...prev, [placeholderIndex]: followUpQuestions.slice(0, 6) }));
      }

      try {
        const text = fullResponse || '';
        const headingRegex = /(Follow-?up Questions|Here are some follow-?up questions[^:]*:|Would you like me to:)[\s\S]*?/i;
        const match = text.match(headingRegex);
        if (match) {
          const tail = text.slice(text.indexOf(match[0]) + match[0].length);
          const bulletMatch = tail.match(/\n\s*[•\-]\s*(.+)/);
          if (bulletMatch && bulletMatch[1]) setSuggestedPlaceholder(bulletMatch[1].trim());
          else if (Array.isArray(followUpQuestions) && followUpQuestions.length > 0) setSuggestedPlaceholder(followUpQuestions[0]);
        } else if (Array.isArray(followUpQuestions) && followUpQuestions.length > 0) setSuggestedPlaceholder(followUpQuestions[0]);
      } catch (_) {}
    } catch (err) {
      console.error('Query failed', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (query) => {
    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    await handleQuery(query, messages);
  };

  useEffect(() => {
    // Only bootstrap initialQuery if there are no persisted messages
    if (messages.length > 0) return;
    const q = String(location.state?.initialQuery || '').trim();
    if (q) {
      history.replaceState({}, '');
      (async () => {
        const userMessage = { role: 'user', content: q };
        setMessages([userMessage]);
        await handleQuery(q, []);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center py-2 md:py-4 lg:py-6">
      <div id="mainPanel" className="relative w-full h-[95vh] bg-neutral-800 rounded-[20px] flex flex-col items-center px-3 md:px-4 pb-3">
        {/* Mobile toggle inside panel */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('openSidebar'))}
          className="absolute left-2 top-2 md:hidden w-12 h-12 bg-black/80 text-white rounded-lg flex items-center justify-center shadow-lg"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="w-full relative flex items-center justify-between py-2 md:py-3">
          <button onClick={() => {
            // Clear localStorage when going back to home
            try {
              localStorage.removeItem('chat_messages');
            } catch (_) {}
            navigate('/');
          }} className="hidden md:flex items-center justify-center w-10 h-10 text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 top-1 text-white/80 text-sm md:text-lg font-semibold"> eCampus AI Chat</h1>
          <div className="w-12" />
        </div>

        {/* Messages */}
        <div ref={scrollContainerRef} className="flex-1 w-full flex justify-center overflow-y-auto scrollbar-hidden py-2 min-h-0">
          <div className="w-full max-w-4xl px-2 md:px-3 space-y-2">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-lg md:rounded-xl text-sm md:text-base leading-relaxed ${message.role === 'user' ? 'max-w-[85%] px-3 md:px-3.5 py-1.5 md:py-2.5 my-3 md:my-5 bg-slate-500 text-white' : 'max-w-full p-0 bg-transparent text-white/90 border-0 chat-message rounded-none'}`}
                  style={{ overflowX: message.role !== 'user' ? 'auto' : 'hidden' }}
                >
                  <div className="prose prose-invert max-w-none overflow-x-auto scrollbar-hidden">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>

                  {message.role !== 'user' && message.content && (
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <button
                        aria-label="Copy response"
                        className="cursor-pointer inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80"
                        onClick={() => {
                          navigator.clipboard.writeText(message.content);
                          setCopiedMap(prev => ({ ...prev, [index]: true }));
                          setTimeout(() => setCopiedMap(prev => ({ ...prev, [index]: false })), 2000);
                        }}
                      >
                        {copiedMap[index] ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        )}
                      </button>
                      <button
                        aria-label="Like this answer"
                        className="cursor-pointer inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80"
                        onClick={async () => {
                          const newSentiment = feedbackMap[index] === 'up' ? null : 'up';
                          setFeedbackMap(prev => ({ ...prev, [index]: newSentiment }));
                          try { await submitFeedback({ sentiment: newSentiment || 'neutral', message: message.content, conversationHistory: messages, meta: { index } }); } catch (_) {}
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={feedbackMap[index] === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={`w-4 h-4 ${feedbackMap[index] === 'up' ? 'text-white' : 'text-white/80'}`}> <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21h-3A1.5 1.5 0 0 1 3 19.5v-7A1.5 1.5 0 0 1 4.5 11h3V21Zm3-10.5 3.75-6.5a1.5 1.5 0 0 1 2.63 1.5L15.75 9h3.38a1.5 1.5 0 0 1 1.48 1.74l-1.2 7.2A2.25 2.25 0 0 1 17.17 20H10.5V10.5Z" /></svg>
                      </button>
                      <button
                        aria-label="Dislike this answer"
                        className="cursor-pointer inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80"
                        onClick={async () => {
                          const newSentiment = feedbackMap[index] === 'down' ? null : 'down';
                          setFeedbackMap(prev => ({ ...prev, [index]: newSentiment }));
                          try { await submitFeedback({ sentiment: newSentiment || 'neutral', message: message.content, conversationHistory: messages, meta: { index } }); } catch (_) {}
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={feedbackMap[index] === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={`w-4 h-4 rotate-180 ${feedbackMap[index] === 'down' ? 'text-white' : 'text-white/80'}`}> <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21h-3A1.5 1.5 0 0 1 3 19.5v-7A1.5 1.5 0 0 1 4.5 11h3V21Zm3-10.5 3.75-6.5a1.5 1.5 0 0 1 2.63 1.5L15.75 9h3.38a1.5 1.5 0 0 1 1.48 1.74l-1.2 7.2A2.25 2.25 0 0 1 17.17 20H10.5V10.5Z" /></svg>
                      </button>
                    </div>
                  )}
                  {message.role !== 'user' && finalizedMap[index] && Array.isArray(relatedMap[index]) && relatedMap[index].length > 0 && (
                    <div className="mt-4 border-t border-white/10 pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6 md:w-7 md:h-7 text-white/80">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8l8-4 8 4-8 4-8-4zM4 16l8 4 8-4M4 12l8 4 8-4" />
                        </svg>
                        <div className="text-base md:text-lg font-semibold uppercase tracking-wide text-white/85">Related</div>
                      </div>
                      <div className="flex flex-col divide-y divide-white/10">
                        {relatedMap[index].map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleChatSubmit(q)}
                            className="group cursor-pointer w-full flex items-center justify-between gap-3 py-2 text-left text-white/85 hover:text-white hover:bg-white/5 px-2 rounded-md"
                          >
                            <span className="truncate">{q}</span>
                            <span className="flex-shrink-0 text-white/70 group-hover:text-white cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4.5 h-4.5 cursor-pointer">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                              </svg>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-800 text-white/90 border border-white/10 rounded-lg md:rounded-xl px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="w-full flex-shrink-0 pt-1 pb-1">
          <Chat onSubmit={handleChatSubmit} isInChatMode={true} placeholder={suggestedPlaceholder} />
          {messages.some(m => m.role !== 'user') && (
            <p className="mt-2 text-center text-[11px] md:text-xs text-white/50">
              eCampusAI can make mistakes. Please double-check responses.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}



