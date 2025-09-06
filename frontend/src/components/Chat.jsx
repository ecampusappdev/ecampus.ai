import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { WelcomeSection, UniversityCarousel } from './index';

const Chat = ({ 
  messages, 
  setMessages, 
  input, 
  setInput, 
  typing, 
  setTyping, 
  isDarkTheme 
}) => {
  const listRef = useRef(null);

  // Convert plain text cues into markdown headings for consistent rendering
  const formatMessage = (text) => {
    if (!text) return text;
    // Promote lines starting with "Semester <number>" to h2
    let formatted = text.replace(/(^|\n)\s*Semester\s+(\d+)\s*(\n|$)/g, (m, p1, num, p3) => `${p1}## Semester ${num}\n`);
    // Optional: Promote lines that look like numbered section titles like "1. <Title>" to h3
    formatted = formatted.replace(/(^|\n)\s*\d+\.\s+([^\n]+)\s*(\n|$)/g, (m, p1, title, p3) => `${p1}### ${title.trim()}\n`);
    return formatted;
  };

  // Custom link component to open links in new tab
  const CustomLink = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="external-link">
      {children}
    </a>
  );

  useEffect(() => {
    if (listRef.current) {
      setTimeout(() => {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }, 100);
    }
  }, [messages, typing]);

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;
    const userMsg = { id: Date.now(), role: 'user', text: question };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    
    // Add a placeholder message for the streaming response
    const assistantMsgId = Date.now() + 1;
    setMessages((m) => [...m, { id: assistantMsgId, role: 'assistant', text: '' }]);
    
    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.text
      }));

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question,
          conversationHistory 
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.full) {
                // Final message, add action buttons
                setMessages((m) => m.map(msg => 
                  msg.id === assistantMsgId 
                    ? { ...msg, text: data.fullResponse }
                    : msg
                ));
                setTyping(false);
                return;
              } else if (data.content) {
                // Stream content
                setMessages((m) => m.map(msg => 
                  msg.id === assistantMsgId 
                    ? { ...msg, text: msg.text + data.content }
                    : msg
                ));
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (err) {
      setMessages((m) => m.map(msg => 
        msg.id === assistantMsgId 
          ? { ...msg, text: 'Error contacting server.' }
          : msg
      ));
      setTyping(false);
    }
  }

  return (
    <div className="block h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] max-w-screen mx-0 px-0 md:px-4">
      <div className="max-w-4xl mx-auto flex flex-col bg-neutral-900 border-0 rounded-none overflow-hidden shadow-none h-[calc(100vh-80px)] relative">
        <div 
          className="flex-1 overflow-y-auto flex flex-col gap-4 md:gap-6 p-4 md:p-5 pb-20 md:pb-24 scroll-smooth max-h-none relative"
          ref={listRef}
        >
          {/* Fixed Welcome Section in Center */}
          {messages.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 w-full pointer-events-none z-10">
              <div className="pointer-events-auto">
                <WelcomeSection isDarkTheme={isDarkTheme} />
              </div>
            </div>
          )}
          
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col gap-3 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-sm leading-relaxed relative whitespace-pre-wrap break-words ${
                m.role === 'user' 
                  ? 'bg-blue-900 text-white rounded-br-md' 
                  : isDarkTheme 
                    ? 'bg-neutral-800 text-white border border-gray-600 rounded-bl-md shadow-lg' 
                    : 'bg-white text-black border border-gray-200 rounded-bl-md shadow-lg'
              }`}>
                <ReactMarkdown 
                  components={{
                    a: CustomLink
                  }}
                >
                  {formatMessage(m.text)}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          
          {typing && (
            <div className="flex flex-col gap-3 items-start">
              <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-sm leading-relaxed relative whitespace-pre-wrap break-words flex items-center gap-3 ${
                isDarkTheme 
                  ? 'bg-neutral-900 text-white border border-gray-600' 
                  : 'bg-white text-black border border-gray-200'
              }`}>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '-0.32s'}}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '-0.16s'}}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
                <span>thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* University Carousel - shown when no messages */}
        {messages.length === 0 && (
          <div className="w-full max-w-7xl mx-auto px-4 pb-4">
            <UniversityCarousel isDarkTheme={isDarkTheme} />
          </div>
        )}

        <div className={`px-1 py-4 md:py-6 sticky bottom-0 z-10 ${
          isDarkTheme 
            ? 'bg-black' 
            : 'bg-white'
        }`}>
          <form onSubmit={handleSend} className={`flex items-center rounded-2xl shadow-xl border transition-all duration-200 w-full ${
            isDarkTheme 
              ? 'bg-neutral-800 border-neutral-700 hover:border-neutral-600' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a follow-up..."
              className={`flex-1 px-6 py-4 border-0 outline-none text-base bg-transparent rounded-2xl ${
                isDarkTheme 
                  ? 'text-white placeholder-gray-400' 
                  : 'text-gray-900 placeholder-gray-500'
              }`}
              autoFocus
            />
            <button 
              type="submit" 
              className={`m-2 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${
                input.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-lg' 
                  : isDarkTheme
                    ? 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!input.trim()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
