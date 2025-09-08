import React from 'react';

const Header = ({ 
  isDarkTheme, 
  setIsDarkTheme, 
  messages, 
  setMessages 
}) => {
  const handleNewChat = () => {
    if (!messages.length) return;
    // Archive current chat into localStorage (history list)
    const historyKey = 'ecampus-chat-history';
    const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const title = messages.find(m => m.role === 'user')?.text?.slice(0, 60) || 'New chat';
    existing.unshift({ id: Date.now(), title, messages });
    localStorage.setItem(historyKey, JSON.stringify(existing));
    // Start new chat
    setMessages([]);
    localStorage.removeItem('ecampus-chat-messages');
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('ecampus-chat-messages');
  };

  return (
    <div className={`px-4 py-4 md:px-6 border-b shadow-sm flex justify-between items-center ${
      isDarkTheme 
        ? 'bg-black border-gray-600 text-white' 
        : 'bg-white border-gray-200 text-black'
    }`}>
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center justify-center gap-3 text-lg md:text-2xl font-bold">
           <img src="https://www.ecampusapp.com/wp-content/themes/markup/myassets/img/logo--Purple.webp" alt="eCampus" className='w-39 h-10'/>
        </div>
        <span className="text-xs md:text-sm hidden sm:block">Your Distance Learning</span>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <button
          className={`px-2 py-1.5 md:px-3 md:py-2 border rounded-lg text-xs md:text-sm cursor-pointer transition-colors ${
            isDarkTheme 
              ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' 
              : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
          }`}
          onClick={handleNewChat}
        >
          New Chat
        </button>
        <button
          className={`px-2 py-1.5 md:px-3 md:py-2 border rounded-lg text-xs md:text-sm cursor-pointer transition-colors ${
            isDarkTheme 
              ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' 
              : 'bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100'
          }`}
          onClick={handleClearChat}
        >
          Clear Chat
        </button>
        <button 
          className={`w-8 h-8 md:w-10 md:h-10 border-0 rounded-full flex items-center justify-center cursor-pointer text-base md:text-lg transition-transform hover:scale-110 ${
            isDarkTheme 
              ? 'bg-gray-600 text-white hover:bg-gray-500' 
              : 'bg-gray-100 text-black hover:bg-gray-200'
          }`}
          onClick={() => setIsDarkTheme(!isDarkTheme)}
        >
          {isDarkTheme ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
};

export default Header;
