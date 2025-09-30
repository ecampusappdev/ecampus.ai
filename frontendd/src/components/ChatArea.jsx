import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import UniversitySlider from './universitySlider';

export default function ChatArea({ onSubmit, placeholder }) {
  const navigate = useNavigate();
  // Initialize theme from localStorage immediately to prevent flash
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true; // Default to dark if no preference
  });

  useEffect(() => {
    // Listen for theme changes
    const handleThemeChange = (event) => {
      setIsDarkMode(event.detail.isDarkMode);
    };

    window.addEventListener('themeChanged', handleThemeChange);
    
    // Theme is already initialized in useState, no need to load again

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  const handleSubmit = async (text) => {
    if (typeof onSubmit === 'function') {
      try { await onSubmit(text); } catch (_) {}
    }
    navigate('/chat', { state: { initialQuery: text } });
  };

  return (
    <div className="h-full w-full flex flex-col items-start justify-center pt-2 pb-2 md:pt-4 md:pb-4 lg:pt-6 lg:pb-6">
      <div className={`w-full h-[95vh] rounded-[20px] flex flex-col items-center px-2 sm:px-3 md:px-4 pt-3 md:pt-4 pb-10 md:pb-14 transition-colors duration-300 ${
        isDarkMode ? 'bg-neutral-800' : 'bg-white'
      }`}>
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <h1 className={`text-2xl md:text-4xl font-semibold tracking-tight text-center mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-white/75' : 'text-gray-800'
          }`}>
            Explore your best career path!!
          </h1>
          <div className='mt-4'>
            <Chat onSubmit={handleSubmit} placeholder={placeholder} isDarkMode={isDarkMode} />
          </div>
        </div>
        <div className="mt-auto w-full pb-4 md:pb-6">
          <UniversitySlider/>
        </div>
      </div>
    </div>
  );
}


