// import React, { useState, useRef, useEffect } from "react";

// const Chat = ({ onSubmit, isInChatMode = false }) => {
//   const [query, setQuery] = useState("");
//   const textareaRef = useRef(null);

//   const suggestions = [
//     "Best Online MBA Programs",
//     "Top Distance Learning Universities",
//     "Affordable Online Degrees",
//     "Career Options After 12th",
//     "Best Courses in AI & Data Science",
//   ];

//   // Auto-resize textarea
//   useEffect(() => {
//     const el = textareaRef.current;
//     if (!el) return;
//     el.style.height = "auto";
//     el.style.height = Math.min(el.scrollHeight, 200) + "px";
//   }, [query]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const trimmed = query.trim();
//     if (!trimmed) return;
    
//     // Call the onSubmit prop with the query
//     await onSubmit(trimmed);
//     setQuery(""); // Clear the input after submission
    
//     // Reset textarea height
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit(e);
//     }
//   };

//   const handleSuggestionClick = (text) => {
//     setQuery(text);
//     textareaRef.current?.focus();
//   };

//   return (
//     <div className={`w-full flex flex-col items-center gap-4 ${isInChatMode ? 'max-w-4xl mx-auto' : 'max-w-xl'}`}>
//       {/* Input */}
//       <form onSubmit={handleSubmit} className="relative w-full">
//         <div className={`relative bg-neutral-900 rounded-[20px] px-4 py-2 border border-blue-900 focus-within:border-blue-400 transition-all duration-200 flex items-end ${isInChatMode ? 'sticky bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-6 pb-4' : ''}`}>
//           <textarea
//             ref={textareaRef}
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Ask anything..."
//             rows={1}
//             className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm md:text-base resize-none leading-6 py-1 md:py-1.5 min-h-[45px] max-h-52 overflow-y-auto scrollbar-hidden"
//           />

//           <button
//             type="submit"
//             aria-label="Send"
//             className="ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 mb-1 transition-colors self-end"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 5l7 7-7 7"
//               />
//             </svg>
//           </button>
//         </div>
//       </form>

//       {/* Suggestion chips - only show when not in chat mode */}
//       {!isInChatMode && (
//         <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8">
//           {suggestions.map((s, i) => (
//             <button
//               key={i}
//               onClick={() => handleSuggestionClick(s)}
//               className="px-3 md:px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs md:text-sm rounded-full shadow-md transition"
//             >
//               {s}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Chat;


// import React, { useState, useRef, useEffect } from "react";

// const Chat = ({ onSubmit, isInChatMode = false }) => {
//   const [query, setQuery] = useState("");
//   const textareaRef = useRef(null);

//   const suggestions = [
//     "Best Online MBA Programs",
//     "Top Distance Learning Universities",
//     "Affordable Online Degrees",
//     "Career Options After 12th",
//     "Best Courses in AI & Data Science",
//   ];

//   // Auto-resize textarea
//   useEffect(() => {
//     const el = textareaRef.current;
//     if (!el) return;
//     el.style.height = "auto";
//     el.style.height = Math.min(el.scrollHeight, 200) + "px";
//   }, [query]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const trimmed = query.trim();
//     if (!trimmed) return;
    
//     // Call the onSubmit prop with the query
//     await onSubmit(trimmed);
//     setQuery(""); // Clear the input after submission
    
//     // Reset textarea height
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit(e);
//     }
//   };

//   const handleSuggestionClick = (text) => {
//     setQuery(text);
//     textareaRef.current?.focus();
//   };

//   return (
//     <div className={`w-full flex flex-col items-center gap-4 ${isInChatMode ? 'max-w-4xl mx-auto' : 'max-w-xl'}`}>
//       {/* Input */}
//       <form onSubmit={handleSubmit} className="relative w-full">
//         <div className="relative bg-neutral-900 rounded-[20px] px-4 py-2 border border-blue-900 focus-within:border-blue-400 transition-all duration-200 flex items-end">
//           <textarea
//             ref={textareaRef}
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Ask anything..."
//             rows={1}
//             className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm md:text-base resize-none leading-6 py-1 md:py-1.5 min-h-[45px] max-h-52 overflow-y-auto scrollbar-hidden"
//           />

//           <button
//             type="submit"
//             aria-label="Send"
//             className="ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 mb-1 transition-colors self-end"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 5l7 7-7 7"
//               />
//             </svg>
//           </button>
//         </div>
//       </form>

//       {/* Suggestion chips - only show when not in chat mode */}
//       {!isInChatMode && (
//         <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8">
//           {suggestions.map((s, i) => (
//             <button
//               key={i}
//               onClick={() => handleSuggestionClick(s)}
//               className="px-3 md:px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs md:text-sm rounded-full shadow-md transition"
//             >
//               {s}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Chat;


import React, { useState, useRef, useEffect } from "react";

const Chat = ({ onSubmit, isInChatMode = false }) => {
  const [query, setQuery] = useState("");
  const textareaRef = useRef(null);

  const suggestions = [
    "Best Online MBA Programs",
    "Top Distance Learning Universities",
    "Affordable Online Degrees",
    "Career Options After 12th",
    "Best Courses in AI & Data Science",
  ];

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // Optimistically clear input immediately
    setQuery("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Call the onSubmit prop with the submitted text
    await onSubmit(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (text) => {
    setQuery(text);
    textareaRef.current?.focus();
  };

  return (
    <div className={`w-full flex flex-col items-center gap-4 ${isInChatMode ? 'max-w-4xl mx-auto px-2' : 'max-w-xl'}`}>
      {/* Input */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative mt-3 bg-neutral-900 rounded-[10px] px-3 py-2 border border-blue-900 focus-within:border-blue-400 transition-all duration-200 flex items-end">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm md:text-base resize-none leading-6 py-1 md:py-1.5 min-h-[36px] md:min-h-[40px] max-h-28 md:max-h-32 overflow-y-auto scrollbar-hidden"
          />

          <button
            type="submit"
            aria-label="Send"
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-colors flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </form>

      {/* Suggestion chips - only show when not in chat mode */}
      {!isInChatMode && (
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(s)}
              className="px-3 md:px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs md:text-sm rounded-full shadow-md transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chat;