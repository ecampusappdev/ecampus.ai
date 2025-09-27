

import React, { useState, useRef, useEffect } from "react";

const Chat = ({ onSubmit = () => {}, isInChatMode = false, placeholder, isDarkMode = true }) => {
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
        <div className={`relative mt-3 rounded-[10px] px-3 py-2 border transition-all duration-300 flex items-end ${
          isDarkMode 
            ? 'bg-neutral-900 border-blue-900 focus-within:border-blue-400' 
            : 'bg-gray-200 border-gray-400 focus-within:border-blue-800'
        }`}>
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask anything about universities, courses, fees..."}
            rows={1}
            className={`flex-1 bg-transparent outline-none text-sm md:text-base resize-none leading-6 py-1 md:py-1.5 min-h-[32px] md:min-h-[40px] max-h-28 md:max-h-32 overflow-y-auto scrollbar-hidden transition-colors duration-300 ${
              isDarkMode 
                ? 'text-white placeholder-gray-400' 
                : 'text-gray-800 placeholder-gray-500'
            }`}
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
              className={`px-3 md:px-4 py-1.5 text-xs md:text-sm rounded-full shadow-md transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white' 
                  : 'bg-gray-200 hover:bg-gray-400 text-gray-800'
              }`}
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


