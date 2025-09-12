// import React, { useState, useRef, useEffect } from 'react';
// import Chat from './Chat';
// import UniversitySlider from './universitySlider';
// import { askQuery } from "../lib/api";

// const Home = () => {
//   const [isChatActive, setIsChatActive] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Scroll to bottom when new messages arrive
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isLoading]);

//   const handleQuery = async (queryText, conversationHistory) => {
//     setIsLoading(true);
    
//     try {
//       const responseText = await askQuery(queryText, conversationHistory);
//       setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
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
    
//     // Send query
//     await handleQuery(query, []);
//   };

//   const handleBackToHome = () => {
//     setIsChatActive(false);
//     setMessages([]);
//   };

//   return (
//     <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
//       <div className='w-[99%] h-[95vh] bg-gradient-to-r from-[#434343] to-[#000000] rounded-[20px] flex flex-col items-center px-4 pb-10 md:pb-14 animate-gradient-x'>

//         {!isChatActive ? (
//           // Home view
//           <>
//             <div className="flex-1 w-full flex flex-col items-center justify-center">
//               <h1 className="text-white/75 text-2xl md:text-4xl font-semibold tracking-tight text-center mb-8">
//                 Explore your best career path!!
//               </h1>
//               <div className='mt-6 md:mt-6'>
//                 <Chat onSubmit={handleChatSubmit} />
//               </div>
//             </div>

//             <div className="mt-auto w-full pb-6 md:pb-8">
//               <UniversitySlider/>
//             </div>
//           </>
//         ) : (
//           // Chat view
//           <>
//             {/* Header with back button */}
//             <div className="w-full flex items-center justify-between py-4">
//               <button
//                 onClick={handleBackToHome}
//                 className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                 </svg>
//                 <span className="text-sm">Back to Home</span>
//               </button>
//               <h1 className="text-white/75 text-lg font-semibold">Career Guidance Chat</h1>
//               <div className="w-20"></div> {/* Spacer for centering */}
//             </div>

//             {/* Messages area */}
//             <div className="flex-1 w-full flex justify-center overflow-y-auto scrollbar-hidden py-5">
//               <div className="w-full max-w-4xl px-4 space-y-4">
//                 {messages.map((message, index) => (
//                   <div
//                     key={index}
//                     className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
//                   >
//                     <div
//                       className={`max-w-[80%] rounded-2xl px-4 py-3 ${
//                         message.role === 'user'
//                           ? 'bg-blue-600 text-white'
//                           : 'bg-neutral-800 text-white/90 border border-white/10'
//                       }`}
//                     >
//                       <div className="whitespace-pre-wrap break-words text-sm md:text-base">
//                         {message.content}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
                
//                 {isLoading && (
//                   <div className="flex justify-start">
//                     <div className="bg-neutral-800 text-white/90 border border-white/10 rounded-2xl px-4 py-3">
//                       <div className="flex items-center space-x-2">
//                         <div className="flex space-x-1">
//                           <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
//                           <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                           <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                         </div>
//                         <span className="text-sm">Thinking...</span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>
//             </div>

//             {/* Input at bottom */}
//             <div className="w-full">
//               <Chat 
//                 onSubmit={async (query) => {
//                   const userMessage = { role: 'user', content: query };
//                   setMessages(prev => [...prev, userMessage]);
//                   await handleQuery(query, messages);
//                 }} 
//                 isInChatMode={true}
//               />
//             </div>
//           </>
//         )}
//       </div>      
//     </div>
//   );
// };

// export default Home;

import React, { useState, useRef, useEffect } from 'react';
import Chat from './Chat';
import UniversitySlider from './universitySlider';
import { askQuery } from "../lib/api";

const Home = () => {
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleQuery = async (queryText, conversationHistory) => {
    setIsLoading(true);
    
    try {
      const responseText = await askQuery(queryText, conversationHistory);
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (err) {
      console.error("Query failed", err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (query) => {
    // Add user message
    const userMessage = { role: 'user', content: query };
    setMessages([userMessage]);
    setIsChatActive(true);
    
    // Send query
    await handleQuery(query, []);
  };

  const handleBackToHome = () => {
    setIsChatActive(false);
    setMessages([]);
  };

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center p-2 md:p-4 lg:p-6 overflow-hidden">
      <div className={`w-full h-[95vh] bg-gradient-to-r from-[#434343] to-[#000000] rounded-[20px] flex flex-col items-center px-3 md:px-4 ${isChatActive ? 'pb-4' : 'pb-10 md:pb-14'} animate-gradient-x`}>

        {!isChatActive ? (
          // Home view
          <>
            <div className="flex-1 w-full flex flex-col items-center justify-center">
              <h1 className="text-white/75 text-2xl md:text-4xl font-semibold tracking-tight text-center mb-8">
                Explore your best career path!!
              </h1>
              <div className='mt-6 md:mt-6'>
                <Chat onSubmit={handleChatSubmit} />
              </div>
            </div>

            <div className="mt-auto w-full pb-4 md:pb-8">
              <UniversitySlider/>
            </div>
          </>
        ) : (
          // Chat view
          <>
            {/* Header with back button */}
            <div className="w-full flex items-center justify-between py-2 md:py-4">
              <button
                onClick={handleBackToHome}
                className="flex items-center space-x-1 md:space-x-2 text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm md:text-sm">Back to Home</span>
              </button>
              <h1 className="text-white/75 text-sm md:text-lg font-semibold">Career Guidance Chat</h1>
              <div className="w-16 md:w-20"></div> {/* Spacer for centering */}
            </div>

            {/* Messages area */}
            <div className="flex-1 w-full flex justify-center overflow-y-auto scrollbar-hidden py-2 md:py-4 min-h-0">
              <div className="w-full max-w-4xl px-2 md:px-4 space-y-2 md:space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl md:rounded-2xl px-2 md:px-4 py-1.5 md:py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-800 text-white/90 border border-white/10'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words text-sm md:text-base">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-800 text-white/90 border border-white/10 rounded-xl md:rounded-2xl px-2 md:px-4 py-1.5 md:py-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/60 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input at bottom - always visible */}
            <div className="w-full flex-shrink-0 pt-1 pb-1">
              <Chat 
                onSubmit={async (query) => {
                  const userMessage = { role: 'user', content: query };
                  setMessages(prev => [...prev, userMessage]);
                  await handleQuery(query, messages);
                }} 
                isInChatMode={true}
              />
            </div>
          </>
        )}
      </div>      
    </div>
  );
};

export default Home;