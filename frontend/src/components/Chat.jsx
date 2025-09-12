import React, { useRef, useEffect, useState } from 'react';
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
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState('Ask about universities, courses, fees...');
  const [aiFollowUpQuestion, setAiFollowUpQuestion] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Function to generate context-aware placeholder text
  const generateContextualPlaceholder = (messages) => {
    // If no messages, show initial placeholder
    if (messages.length === 0) {
      return 'Ask about universities, courses, fees...';
    }

    // If only user messages (no assistant response yet), keep initial placeholder
    const hasAssistantMessage = messages.some(msg => msg.role === 'assistant');
    if (!hasAssistantMessage) {
      return 'Ask about universities, courses, fees...';
    }

    // If we have an AI-generated follow-up question, use it
    if (aiFollowUpQuestion) {
      return aiFollowUpQuestion;
    }

    // Fallback to static context-aware placeholders
    const lastAssistantMessage = [...messages].reverse().find(msg => msg.role === 'assistant');
    if (lastAssistantMessage) {
      const messageText = lastAssistantMessage.text.toLowerCase();
      
      // MBA related context
      if (messageText.includes('mba') || messageText.includes('master of business')) {
        const placeholders = [
          'Tell me about MBA specializations...',
          'Compare MBA fees across universities...',
          'What are the admission requirements?',
          'Show me MBA programs in Finance...',
          'Which MBA has best placement records?'
        ];
        return placeholders[Math.floor(Math.random() * placeholders.length)];
      }
      
      // Engineering related context
      if (messageText.includes('btech') || messageText.includes('engineering') || messageText.includes('b.e.')) {
        const placeholders = [
          'Tell me about Computer Science Engineering...',
          'Compare B.Tech fees and duration...',
          'What are the top engineering colleges?',
          'Show me Mechanical Engineering programs...',
          'Which engineering branch has best scope?'
        ];
        return placeholders[Math.floor(Math.random() * placeholders.length)];
      }
      
      // Online courses context
      if (messageText.includes('online') || messageText.includes('distance')) {
        const placeholders = [
          'Tell me about online learning platforms...',
          'Compare online vs regular courses...',
          'What are the examination patterns?',
          'Show me flexible study options...',
          'Which online courses are UGC approved?'
        ];
        return placeholders[Math.floor(Math.random() * placeholders.length)];
      }
      
      // Fees related context
      if (messageText.includes('fee') || messageText.includes('cost') || messageText.includes('price')) {
        const placeholders = [
          'Break down the fee structure...',
          'Tell me about scholarship options...',
          'Compare total costs including expenses...',
          'What are the payment options?',
          'Show me most affordable programs...'
        ];
        return placeholders[Math.floor(Math.random() * placeholders.length)];
      }
      
      // University specific context
      if (messageText.includes('university') || messageText.includes('college') || messageText.includes('institute')) {
        const placeholders = [
          'Tell me about admission process...',
          'Compare different universities...',
          'What are the eligibility criteria?',
          'Show me placement statistics...',
          'Which university is best for my field?'
        ];
        return placeholders[Math.floor(Math.random() * placeholders.length)];
      }
      
      // General follow-up
      const generalPlaceholders = [
        'Tell me more about this...',
        'Compare different options...',
        'What are the requirements?',
        'Show me more details...',
        'Which one would you recommend?'
      ];
      return generalPlaceholders[Math.floor(Math.random() * generalPlaceholders.length)];
    }
    
    return 'Ask a follow-up...';
  };

  // Convert plain text cues into markdown headings for consistent rendering
  const formatMessage = (text) => {
    if (!text) return text;
    // Promote lines starting with "Semester <number>" to h2
    let formatted = text.replace(/(^|\n)\s*Semester\s+(\d+)\s*(\n|$)/g, (m, p1, num, p3) => `${p1}## Semester ${num}\n`);
    // Optional: Promote lines that look like numbered section titles like "1. <Title>" to h3
    formatted = formatted.replace(/(^|\n)\s*\d+\.\s+([^\n]+)\s*(\n|$)/g, (m, p1, title, p3) => `${p1}### ${title.trim()}\n`);
    // Convert horizontal line separators (---) to markdown horizontal rules
    formatted = formatted.replace(/(^|\n)\s*---\s*(\n|$)/g, (m, p1, p2) => `${p1}\n\n---\n\n`);
    return formatted;
  };

  // Custom link component to open links in new tab
  const CustomLink = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="external-link">
      {children}
    </a>
  );

  // Handle scroll to show/hide scroll-to-bottom button
  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold
      setShowScrollButton(!isAtBottom && messages.length > 0);
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  // Add scroll event listener to chat container
  useEffect(() => {
    const scrollContainer = listRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [messages.length]);

  // Add global scroll event listener to detect scrolling anywhere on the page
  useEffect(() => {
    const handleGlobalScroll = () => {
      if (listRef.current && messages.length > 0) {
        handleScroll();
      }
    };

    // Add scroll listener to window
    window.addEventListener('scroll', handleGlobalScroll);
    
    // Also add wheel event listener for mouse wheel scrolling
    window.addEventListener('wheel', handleGlobalScroll);
    
    // Add touch event listener for mobile scrolling
    window.addEventListener('touchmove', handleGlobalScroll);
    
    return () => {
      window.removeEventListener('scroll', handleGlobalScroll);
      window.removeEventListener('wheel', handleGlobalScroll);
      window.removeEventListener('touchmove', handleGlobalScroll);
    };
  }, [messages.length]);

  // Also check scroll position when messages change
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        handleScroll();
      }, 100);
    }
  }, [messages.length]);

  // Periodic check for scroll position (fallback for hidden scrollbar issues)
  useEffect(() => {
    if (messages.length > 0) {
      const interval = setInterval(() => {
        if (listRef.current) {
          handleScroll();
        }
      }, 500); // Check every 500ms

      return () => clearInterval(interval);
    }
  }, [messages.length]);

  // Only auto-scroll to bottom when user is already at the bottom (like ChatGPT)
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      // Only auto-scroll if user is already at the bottom
      if (isAtBottom) {
        setTimeout(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }, 50);
      }
    }
  }, [messages, typing]);

  // Update placeholder when messages change, but only when not typing
  useEffect(() => {
    if (!typing) {
      const newPlaceholder = generateContextualPlaceholder(messages);
      setDynamicPlaceholder(newPlaceholder);
    }
  }, [messages, aiFollowUpQuestion, typing]);

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;
    
    // Check if user is at bottom before adding new message
    const wasAtBottom = listRef.current ? 
      (listRef.current.scrollTop + listRef.current.clientHeight >= listRef.current.scrollHeight - 100) : false;
    
    const userMsg = { id: Date.now(), role: 'user', text: question };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    
    // Clear AI follow-up question when user sends new message
    setAiFollowUpQuestion('');
    
    // Add a placeholder message for the streaming response
    const assistantMsgId = Date.now() + 1;
    setMessages((m) => [...m, { id: assistantMsgId, role: 'assistant', text: '' }]);
    
    // If user was at bottom, scroll to show new messages, otherwise keep current position
    if (wasAtBottom) {
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      }, 100);
    }
    
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
                
                // Set AI-generated follow-up question as placeholder
                if (data.followUpQuestion) {
                  setAiFollowUpQuestion(data.followUpQuestion);
                }
                
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
      <div className="max-w-4xl mx-auto flex flex-col bg-neutral-900 border-0 rounded-none overflow-hidden shadow-none h-[calc(100vh-80px)] relative w-full">
        <div 
          className="flex-1 overflow-y-auto flex flex-col gap-4 md:gap-6 p-4 md:p-5 pb-20 md:pb-24 scroll-smooth max-h-none relative"
          ref={listRef}
        >
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className={`fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                isDarkTheme 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title="Scroll to bottom"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
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
              <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-base leading-relaxed relative break-words overflow-hidden ${
                m.role === 'user' 
                  ? 'bg-blue-900 text-white rounded-br-md' 
                  : isDarkTheme 
                    ? 'bg-neutral-800 text-white border border-gray-600 rounded-bl-md shadow-lg' 
                    : 'bg-white text-black border border-gray-200 rounded-bl-md shadow-lg'
              }`}>
                {/* Check if message contains HTML table */}
                {m.text.includes('<table') ? (
                  <div>
                    {/* Render text before table */}
                    {m.text.split('<table')[0] && (
                      <div className="text-base leading-relaxed mb-6 message-content">
                        <ReactMarkdown 
                          components={{
                            a: CustomLink
                          }}
                        >
                          {formatMessage(m.text.split('<table')[0])}
                        </ReactMarkdown>
                      </div>
                    )}
                    
                    {/* Render the table */}
                    <div 
                      className="table-container text-base my-6"
                      dangerouslySetInnerHTML={{ 
                        __html: m.text.substring(m.text.indexOf('<table'), m.text.lastIndexOf('</table>') + 8)
                      }}
                    />
                    
                    {/* Render text after table */}
                    {m.text.split('</table>')[1] && (
                      <div className="text-base leading-relaxed mt-6 message-content">
                        <ReactMarkdown 
                          components={{
                            a: CustomLink
                          }}
                        >
                          {formatMessage(m.text.split('</table>')[1])}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-base leading-relaxed space-y-4 message-content">
                    <ReactMarkdown 
                      components={{
                        a: CustomLink
                      }}
                    >
                      {formatMessage(m.text)}
                    </ReactMarkdown>
                  </div>
                )}
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
              placeholder={dynamicPlaceholder}
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
