import { useEffect, useState } from 'react';
import { Header, Chat, LeadForm } from './components';

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('ecampus-chat-messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', email: '', phone: '', action: '' });
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem('ecampus-theme');
    return saved ? JSON.parse(saved) : false;
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ecampus-chat-messages', JSON.stringify(messages));
  }, [messages]);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('ecampus-theme', JSON.stringify(isDarkTheme));
  }, [isDarkTheme]);

  return (
    <div className={`h-screen w-screen flex flex-col fixed top-0 left-0 z-[1000] ${
      isDarkTheme 
        ? 'bg-black text-white' 
        : 'bg-white text-black'
    }`}>
      <Header 
        isDarkTheme={isDarkTheme}
        setIsDarkTheme={setIsDarkTheme}
        messages={messages}
        setMessages={setMessages}
      />
      
      <Chat 
        messages={messages}
        setMessages={setMessages}
        input={input}
        setInput={setInput}
        typing={typing}
        setTyping={setTyping}
        isDarkTheme={isDarkTheme}
      />
      
      <LeadForm 
        showLeadForm={showLeadForm}
        setShowLeadForm={setShowLeadForm}
        leadData={leadData}
        setLeadData={setLeadData}
        messages={messages}
        setMessages={setMessages}
      />
    </div>
  );
}

export default App
