// import React, { useState, useRef, useEffect } from 'react';
// import Chat from './Chat';
// import UniversitySlider from './universitySlider';
// import { askQuery } from "../lib/api";

// const Home = () => {
//   const [isChatActive, setIsChatActive] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [suggestedPlaceholder, setSuggestedPlaceholder] = useState("");
//   const messagesEndRef = useRef(null);

//   // Scroll to bottom when new messages arrive
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isLoading]);

//   // Function to process response and convert dashes to styled HR elements
//   const processResponse = (text) => {
//     const hr = '<hr class="my-3 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />';
//     // Normalize various dash patterns to a placeholder
//     let processed = text
//       .replace(/\n\s*---\s*\n/g, `\n${hr}\n`)
//       .replace(/---/g, hr)
//       .replace(/<hr[^>]*>/gi, hr); // normalize any hr to our hr

//     // Convert simple markdown bold **text** to HTML <strong>text</strong>
//     processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

//     // Collapse consecutive hrs into a single one
//     processed = processed.replace(new RegExp(`(${hr}\n?){2,}`, 'g'), `${hr}\n`);

//     // Add top margin before acknowledgement (first section) and bottom margin after follow-up
//     const topSpacer = '<div class="mt-3 md:mt-4"></div>';
//     const bottomSpacer = '<div class="mb-4 md:mb-6"></div>';
//     processed = `${topSpacer}${processed}${bottomSpacer}`;

//     return processed;
//   };

//   const handleQuery = async (queryText, conversationHistory) => {
//     setIsLoading(true);
    
//     try {
//       let liveText = '';
//       // Push a placeholder assistant message we will update incrementally
//       const tempIndex = messages.length + 1; // after user message added in handleChatSubmit
//       setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

//       const { fullResponse, followUpQuestions } = await askQuery(queryText, conversationHistory, (delta) => {
//         // Append delta and update the last assistant message only, no auto scroll
//         liveText += delta;
//         const processedLive = processResponse(liveText);
//         setMessages(prev => {
//           const copy = [...prev];
//           // Update last message which should be assistant placeholder
//           copy[copy.length - 1] = { role: 'assistant', content: processedLive };
//           return copy;
//         });
//       });

//       // Ensure final processed content is set
//       const processedResponse = processResponse(fullResponse);
//       setMessages(prev => {
//         const copy = [...prev];
//         copy[copy.length - 1] = { role: 'assistant', content: processedResponse };
//         return copy;
//       });

//       // Prefer model-embedded follow-ups: extract first bullet after a follow-up heading; fallback to API followUpQuestions
//       try {
//         const text = fullResponse || '';
//         // Search for the first list item after a follow-up heading or a “Would you like me to:” block
//         const headingRegex = /(Follow-?up Questions|Here are some follow-?up questions[^:]*:|Would you like me to:)[\s\S]*?/i;
//         const match = text.match(headingRegex);
//         if (match) {
//           const tail = text.slice(text.indexOf(match[0]) + match[0].length);
//           const bulletMatch = tail.match(/\n\s*[•\-]\s*(.+)/);
//           if (bulletMatch && bulletMatch[1]) {
//             setSuggestedPlaceholder(bulletMatch[1].trim());
//           } else if (Array.isArray(followUpQuestions) && followUpQuestions.length > 0) {
//             setSuggestedPlaceholder(followUpQuestions[0]);
//           }
//         } else if (Array.isArray(followUpQuestions) && followUpQuestions.length > 0) {
//           setSuggestedPlaceholder(followUpQuestions[0]);
//         }
//       } catch (_) {}
//     } catch (err) {
//       console.error("Query failed", err);
//       setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleChatSubmit = async (query) => {
//     // Add user message
//     const userMessage = { role: 'user', content: query };
//     setMessages([userMessage]);
//     setIsChatActive(true);
    
//     // Send query with current (empty) history for now
//     await handleQuery(query, []);
//   };

//   const handleBackToHome = () => {
//     setIsChatActive(false);
//     setMessages([]);
//     setSuggestedPlaceholder("");
//     // Force a full reload to reset any persisted UI state/placeholder
//     window.location.reload();
//   };

//   return (
//     <div className="h-screen bg-black flex flex-col items-center justify-center p-2 md:p-4 lg:p-6 overflow-hidden">
//       <div className={`w-full h-[95vh] bg-gradient-to-r from-[#434343] to-[#000000] rounded-[20px] flex flex-col items-center px-3 md:px-4 ${isChatActive ? 'pb-4' : 'pb-10 md:pb-14'} animate-gradient-x`}>

//         {!isChatActive ? (
//           // Home view
//           <>
//             <div className="flex-1 w-full flex flex-col items-center justify-center">
//               <h1 className="text-white/75 text-2xl md:text-4xl font-semibold tracking-tight text-center mb-8">
//                 Explore your best career path!!
//               </h1>
//               <div className='mt-6 md:mt-6'>
//                 <Chat onSubmit={handleChatSubmit} placeholder={suggestedPlaceholder} />
//               </div>
//             </div>

//             <div className="mt-auto w-full pb-4 md:pb-8">
//               <UniversitySlider/>
//             </div>
//           </>
//         ) : (
//           // Chat view
//           <>
//             {/* Header with back button */}
//             <div className="w-full flex items-center justify-between py-2 md:py-4">
//               <button
//                 onClick={handleBackToHome}
//                 className="flex items-center space-x-1 md:space-x-2 text-white/70 hover:text-white transition-colors"
//               >
//                 <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                 </svg>
//                 <span className="text-sm md:text-sm">Back to Home</span>
//               </button>
//               <h1 className="text-white/75 text-sm md:text-lg font-semibold">Career Guidance Chat</h1>
//               <div className="w-16 md:w-20"></div> {/* Spacer for centering */}
//             </div>

//             {/* Messages area */}
//             <div className="flex-1 w-full flex justify-center overflow-y-auto scrollbar-hidden py-2 md:py-4 min-h-0">
//               <div className="w-full max-w-4xl px-2 md:px-4 space-y-2 md:space-y-4">
//                 {messages.map((message, index) => (
//                   <div
//                     key={index}
//                     className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
//                   >
//                     <div
//                       className={`max-w-[85%] rounded-xl md:rounded-2xl px-2 md:px-4 py-1.5 md:py-3 ${
//                         message.role === 'user'
//                           ? 'bg-blue-600 text-white'
//                           : 'bg-neutral-800 text-white/90 border border-white/10'
//                       }`}
//                       style={{ overflowX: message.role !== 'user' ? 'auto' : 'hidden' }}
//                     >
//                       <div 
//                         className="whitespace-pre-wrap break-words text-sm md:text-base"
//                         dangerouslySetInnerHTML={{ __html: message.content }}
//                       />
//                     </div>
//                   </div>
//                 ))}
                
//                 {isLoading && (
//                   <div className="flex justify-start">
//                     <div className="bg-neutral-800 text-white/90 border border-white/10 rounded-xl md:rounded-2xl px-2 md:px-4 py-1.5 md:py-3">
//                       <div className="flex items-center space-x-2">
//                         <div className="flex space-x-1">
//                           <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/60 rounded-full animate-bounce"></div>
//                           <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                           <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                         </div>
//                         <span className="text-sm">Thinking...</span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>
//             </div>

//             {/* Input at bottom - always visible */}
//             <div className="w-full flex-shrink-0 pt-1 pb-1">
//               <Chat 
//                 onSubmit={async (query) => {
//                   const userMessage = { role: 'user', content: query };
//                   setMessages(prev => [...prev, userMessage]);
//                   await handleQuery(query, messages);
//                 }} 
//                 isInChatMode={true}
//                 placeholder={suggestedPlaceholder}
//               />
//             </div>
//           </>
//         )}
//       </div>      
//     </div>
//   );
// };

// export default Home;


import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Chat from './Chat';
import UniversitySlider from './universitySlider';
import { askQuery } from "../lib/api";
import { submitFeedback, fetchFeedbackStats } from "../lib/api";

const Home = () => {
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPlaceholder, setSuggestedPlaceholder] = useState("");
  const messagesEndRef = useRef(null);
  const [feedbackMap, setFeedbackMap] = useState({}); // { [index]: 'up' | 'down' }
  const [finalizedMap, setFinalizedMap] = useState({}); // { [index]: true when streaming finished }
  const [copiedMap, setCopiedMap] = useState({}); // { [index]: true when copied }
  const scrollContainerRef = useRef(null);
  const isAtBottomRef = useRef(true);
  // Determine the latest assistant message index for feedback controls
  const lastAssistantIndex = messages.reduce((acc, m, i) => (m.role !== 'user' ? i : acc), -1);
  // Track which assistant messages need condensed table styling
  const [condensedMap, setCondensedMap] = useState({}); // { [index]: true }
  // Track whether the user is at bottom and only auto-scroll if they are
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const threshold = 60;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
      isAtBottomRef.current = atBottom;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // When messages grow, scroll to bottom only if user was at bottom
  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (isAtBottomRef.current) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages.length]);

  // After render, detect tables that would overflow and mark them to use condensed styles
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const next = {};
    messages.forEach((m, i) => {
      if (m.role === 'user') return;
      const msgRoot = container.querySelector(`[data-message-index="${i}"]`);
      if (!msgRoot) return;
      const table = msgRoot.querySelector('table');
      if (!table) return;
      const parent = table.parentElement;
      if (!parent) return;
      const needsScroll = table.scrollWidth > parent.clientWidth;
      if (needsScroll) next[i] = true;
    });
    setCondensedMap(next);
  }, [messages]);

  // Process response for markdown rendering (clean/sanitize and normalize)
  const processResponse = (text) => {
    let processed = text || '';

    // 1) Normalize horizontal rules to markdown hr
    processed = processed
      .replace(/<hr[^>]*>/gi, '\n\n---\n\n')
      .replace(/\n\s*---\s*\n/g, '\n\n---\n\n');

    // 2) Convert HTML headings/strong to markdown
    processed = processed.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1');
    processed = processed.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1');
    processed = processed.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1');
    processed = processed.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');

    // 3) Strip any remaining HTML tags (leftovers injected by previous logic)
    processed = processed.replace(/<[^>]+>/g, '');

    // 4) Normalize bullets that use • into markdown '-'
    processed = processed.replace(/^\s*•\s+/gm, '- ');

    // 5) Ensure the follow-up prompt appears on its own paragraph at the end
    processed = processed.replace(/(\S)\s*(\*\*Would you like to know[^*]*\*\*)\s*$/i, '$1\n\n$2');

    return processed;
  };

  const handleQuery = async (queryText, conversationHistory) => {
    setIsLoading(true);
    
    try {
      let liveText = '';
      // Add assistant placeholder and remember its index
      const placeholderIndex = messages.length + 1; // after user message appended by caller
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
      // Mark this assistant message as finalized so actions can appear
      setFinalizedMap(prev => ({ ...prev, [placeholderIndex]: true }));

      // Handle follow-ups
      try {
        const text = fullResponse || '';
        const headingRegex = /(Follow-?up Questions|Here are some follow-?up questions[^:]*:|Would you like me to:)[\s\S]*?/i;
        const match = text.match(headingRegex);
        if (match) {
          const tail = text.slice(text.indexOf(match[0]) + match[0].length);
          const bulletMatch = tail.match(/\n\s*[•\-]\s*(.+)/);
          if (bulletMatch && bulletMatch[1]) {
            setSuggestedPlaceholder(bulletMatch[1].trim());
          } else if (Array.isArray(followUpQuestions) && followUpQuestions.length > 0) {
            setSuggestedPlaceholder(followUpQuestions[0]);
          }
        } else if (Array.isArray(followUpQuestions) && followUpQuestions.length > 0) {
          setSuggestedPlaceholder(followUpQuestions[0]);
        }
      } catch (_) {}
    } catch (err) {
      console.error("Query failed", err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (query) => {
    const userMessage = { role: 'user', content: query };
    setMessages([userMessage]);
    setIsChatActive(true);
    await handleQuery(query, []);
  };

  const handleBackToHome = () => {
    setIsChatActive(false);
    setMessages([]);
    setSuggestedPlaceholder("");
    window.location.reload();
  };

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center p-2 md:p-4 lg:p-6 overflow-hidden">
      <div className={`w-full h-[95vh] bg-gradient-to-r from-[#434343] to-[#000000] rounded-[20px] flex flex-col items-center px-3 md:px-4 ${isChatActive ? 'pb-3' : 'pb-10 md:pb-14'} animate-gradient-x`}>

        {!isChatActive ? (
          <>
            <div className="flex-1 w-full flex flex-col items-center justify-center">
              <h1 className="text-white/75 text-2xl md:text-4xl font-semibold tracking-tight text-center mb-6">
                Explore your best career path!!
              </h1>
              <div className='mt-4'>
                <Chat onSubmit={handleChatSubmit} placeholder={suggestedPlaceholder} />
              </div>
            </div>

            <div className="mt-auto w-full pb-4 md:pb-6">
              <UniversitySlider/>
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="w-full flex items-center justify-between py-2 md:py-3">
              <button
                onClick={handleBackToHome}
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back to Home</span>
              </button>
              <h1 className="text-white/80 text-sm md:text-lg font-semibold">Career Guidance Chat</h1>
              <div className="flex items-center">
               
              </div>
            </div>

            {/* Chat messages */}
            <div ref={scrollContainerRef} className="flex-1 w-full flex justify-center overflow-y-auto scrollbar-hidden py-2 min-h-0">
              <div className="w-full max-w-4xl px-2 md:px-3 space-y-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-lg md:rounded-xl text-sm md:text-base leading-relaxed ${
                        message.role === 'user'
                          ? 'max-w-[85%] px-3 md:px-3.5 py-1.5 md:py-2.5 my-3 md:my-5 bg-slate-500 text-white'
                          : 'max-w-full p-0 bg-transparent text-white/90 border-0 chat-message rounded-none'
                      }`}
                      style={{ overflowX: message.role !== 'user' ? 'auto' : 'hidden' }}
                      classNameGroup
                      data-message-index={index}
                    >
                      <div className="prose prose-invert max-w-none overflow-x-auto scrollbar-hidden">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({ node, ...props }) => (
                              <table
                                className={`border-collapse table-fixed w-full mb-6 ${condensedMap[index] ? 'text-[12px] md:text-[13px]' : 'text-[14px] md:text-[15px]'}`}
                                {...props}
                              />
                            ),
                            th: ({ node, ...props }) => (
                              <th
                                className={`border bg-black-500 border-white/20 ${condensedMap[index] ? 'px-2 py-1' : 'px-3 py-2'} text-left break-words whitespace-normal`}
                                {...props}
                              />
                            ),
                            td: ({ node, ...props }) => (
                              <td
                                className={`border border-white/10 ${condensedMap[index] ? 'px-2 py-1' : 'px-3 py-2'} align-top break-words whitespace-normal`}
                                {...props}
                              />
                            ),
                            thead: ({ node, ...props }) => (
                              <thead className="bg-white/5" {...props} />
                            ),
                            h1: ({ node, ...props }) => (
                              <h1 className="text-2xl md:text-3xl font-bold mb-4 mt-6" {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2 className="text-xl md:text-2xl font-bold mb-3 mt-5" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 className="text-lg md:text-xl font-semibold mb-3 mt-4" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="mb-1" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="mb-4" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol className="mb-4" {...props} />
                            )
                          }}
                        >
{message.content}
                        </ReactMarkdown>
                      </div>
                      {message.role !== 'user' && message.content && finalizedMap[index] && (
                        <div className="mt-1 flex items-center justify-end gap-1">
                          <button
                            aria-label="Copy response"
                            className="cursor-pointer inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80"
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              setCopiedMap(prev => ({ ...prev, [index]: true }));
                              setTimeout(() => {
                                setCopiedMap(prev => ({ ...prev, [index]: false }));
                              }, 2000);
                            }}
                          >
                            {copiedMap[index] ? (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                          <button
                            aria-label="Like this answer"
                            className="cursor-pointer inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80"
                            onClick={async () => {
                              console.log('Like button clicked for index:', index);
                              const newSentiment = feedbackMap[index] === 'up' ? null : 'up';
                              setFeedbackMap(prev => ({ ...prev, [index]: newSentiment }));
                              try {
                                const r = await submitFeedback({
                                  sentiment: newSentiment || 'neutral',
                                  message: message.content,
                                  question: messages.find(m => m.role === 'user')?.content,
                                  conversationHistory: messages,
                                  meta: { index }
                                });
                                console.log('Feedback submitted successfully:', r);
                              } catch (e) { 
                                console.error('Feedback submission error:', e);
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={feedbackMap[index] === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={`w-4 h-4 ${feedbackMap[index] === 'up' ? 'text-white' : 'text-white/80'}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21h-3A1.5 1.5 0 0 1 3 19.5v-7A1.5 1.5 0 0 1 4.5 11h3V21Zm3-10.5 3.75-6.5a1.5 1.5 0 0 1 2.63 1.5L15.75 9h3.38a1.5 1.5 0 0 1 1.48 1.74l-1.2 7.2A2.25 2.25 0 0 1 17.17 20H10.5V10.5Z" />
                            </svg>
                          </button>
                          <span className="text-xs text-white/50" data-feedback-up-count></span>
                          <button
                            aria-label="Dislike this answer"
                            className="cursor-pointer inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80"
                            onClick={async () => {
                              console.log('Dislike button clicked for index:', index);
                              const newSentiment = feedbackMap[index] === 'down' ? null : 'down';
                              setFeedbackMap(prev => ({ ...prev, [index]: newSentiment }));
                              try {
                                const r = await submitFeedback({
                                  sentiment: newSentiment || 'neutral',
                                  message: message.content,
                                  question: messages.find(m => m.role === 'user')?.content,
                                  conversationHistory: messages,
                                  meta: { index }
                                });
                                console.log('Feedback submitted successfully:', r);
                              } catch (e) { 
                                console.error('Feedback submission error:', e);
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={feedbackMap[index] === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={`w-4 h-4 rotate-180 ${feedbackMap[index] === 'down' ? 'text-white' : 'text-white/80'}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21h-3A1.5 1.5 0 0 1 3 19.5v-7A1.5 1.5 0 0 1 4.5 11h3V21Zm3-10.5 3.75-6.5a1.5 1.5 0 0 1 2.63 1.5L15.75 9h3.38a1.5 1.5 0 0 1 1.48 1.74l-1.2 7.2A2.25 2.25 0 0 1 17.17 20H10.5V10.5Z" />
                            </svg>
                          </button>
                          <span className="text-xs text-white/50" data-feedback-down-count></span>
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
              <Chat 
                onSubmit={async (query) => {
                  const userMessage = { role: 'user', content: query };
                  setMessages(prev => [...prev, userMessage]);
                  await handleQuery(query, messages);
                }} 
                isInChatMode={true}
                placeholder={suggestedPlaceholder}
              />
            </div>
          </>
        )}
      </div>      
    </div>
  );
};

export default Home;
