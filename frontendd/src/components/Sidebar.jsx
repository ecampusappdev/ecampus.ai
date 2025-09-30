// import React, { useState } from 'react';

// // Sidebar with outer black background and inner animated gradient panel
// // - Collapsible via toggle button (hamburger)
// // - Uses Tailwind and the existing animate-gradient-x utility
// // - Parent can control with props, or it manages its own collapsed state

// const Sidebar = ({ initialCollapsed = false, onToggle }) => {
//   const [collapsed, setCollapsed] = useState(initialCollapsed);

//   const handleToggle = () => {
//     const next = !collapsed;
//     setCollapsed(next);
//     if (typeof onToggle === 'function') onToggle(next);
//   };

//   return (
//     <div className={`h-full flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-14' : 'w-60'}`}>
//       {/* Outer sidebar container: black background */}
//       <div className="h-full w-full bg-black/90 border-r border-white/10 relative">
//         {/* Toggle button */}
//         <button
//           aria-label="Toggle sidebar"
//           onClick={handleToggle}
//           className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 text-white/80"
//         >
//           {collapsed ? (
//             // Hamburger icon
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
//             </svg>
//           ) : (
//             // Chevron-left icon
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
//             </svg>
//           )}
//         </button>

//         {/* Inner animated gradient panel */}
//         <div className={`mt-12 mx-3 rounded-2xl border border-white/10 overflow-hidden transition-[padding] duration-300 ${collapsed ? 'p-2' : 'p-3'}`}>
//           <div className={`rounded-xl bg-gradient-to-r from-[#434343] via-[#2a2a2a] to-[#000000] ${collapsed ? 'h-[calc(100vh-5rem)]' : 'h-[calc(100vh-6rem)]'} w-full`}>
//             {/* Sidebar content area */}
//             <div className={`text-white/80 ${collapsed ? 'px-1 py-2' : 'px-3 py-4'}`}>
//               {/* Example nav items; replace with your links */}
//               <div className="flex flex-col gap-1">
//                 <SidebarItem icon={HomeIcon} label="Home" collapsed={collapsed} />
//                 <SidebarItem icon={ListIcon} label="Curriculum" collapsed={collapsed} />
//                 <SidebarItem icon={QuizIcon} label="Quiz" collapsed={collapsed} />
//                 <SidebarItem icon={CogIcon} label="Settings" collapsed={collapsed} />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const SidebarItem = ({ icon: Icon, label, collapsed }) => {
//   return (
//     <button className="group flex items-center w-full gap-3 rounded-lg px-2 py-2 hover:bg-white/10 text-left">
//       <Icon className="w-4 h-4 text-white/70 group-hover:text-white" />
//       {!collapsed && <span className="text-sm text-white/80 group-hover:text-white">{label}</span>}
//     </button>
//   );
// };

// // Simple inline icons to avoid extra deps
// const HomeIcon = (props) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={props.className}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5l9-7 9 7V20a2 2 0 0 1-2 2h-4.5a.5.5 0 0 1-.5-.5v-5a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v5a.5.5 0 0 1-.5.5H5a2 2 0 0 1-2-2v-9.5Z" />
//   </svg>
// );

// const ListIcon = (props) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={props.className}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
//   </svg>
// );

// const QuizIcon = (props) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={props.className}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01M8.5 9a3.5 3.5 0 1 1 6.7 1.5c-.5.94-1.5 1.4-2.2 2-.52.43-1 1-1 1.75V15" />
//     <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
//   </svg>
// );

// const CogIcon = (props) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={props.className}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317a1 1 0 0 1 1.35-.436l.3.15a1 1 0 0 0 .9 0l.3-.15a1 1 0 0 1 1.35.436l.2.346a1 1 0 0 0 .75.5l.385.064a1 1 0 0 1 .86.99v.3a1 1 0 0 0 .29.705l.214.214a1 1 0 0 1 0 1.414l-.214.214a1 1 0 0 0-.29.705v.3a1 1 0 0 1-.86.99l-.385.064a1 1 0 0 0-.75.5l-.2.346a1 1 0 0 1-1.35.436l-.3-.15a1 1 0 0 0-.9 0l-.3.15a1 1 0 0 1-1.35-.436l-.2-.346a1 1 0 0 0-.75-.5L7.8 12.7a1 1 0 0 1-.86-.99v-.3a1 1 0 0 0-.29-.705L6.44 10.49a1 1 0 0 1 0-1.414l.214-.214a1 1 0 0 0 .29-.705v-.3a1 1 0 0 1 .86-.99l.385-.064a1 1 0 0 0 .75-.5l.2-.346Z" />
//     <circle cx="12" cy="12" r="3" />
//   </svg>
// );

// export default Sidebar;


import React, { useState, useEffect } from 'react';
import ecampuss from '../assets/ecampuss.png';
import ecampus_logo from '../assets/ecampus_logo.png';

// Sidebar with pure black background - no inner gradient panel
// - Collapsible via toggle button (hamburger)
// - Clean black design matching the Bloom interface
// - Parent can control with props, or it manages its own collapsed state

const Sidebar = ({ initialCollapsed = false, onToggle }) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  // Initialize theme from localStorage immediately to prevent flash
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true; // Default to dark if no preference
  });

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof onToggle === 'function') onToggle(next);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Apply theme to document
    if (newTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    
    // Store preference in localStorage
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { isDarkMode: newTheme }
    }));
  };

  useEffect(() => {
    // Apply theme to document immediately since state is already initialized
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`h-full flex-shrink-0 transition-[width] duration-300 shadow-2xl shadow-gray-900 ${collapsed ? 'w-14 md:w-18' : 'w-48 sm:w-56 md:w-64'}`}>
      {/* Sidebar container */}
      <div className={`h-full w-full relative transition-colors duration-300 ${
        isDarkMode ? 'bg-black' : 'bg-gray-200'
      }`}>
        {/* Top branding + independent toggle */}
        <div className="absolute top-0.5 left-2 right-2 md:left-3 md:right-3 flex items-center justify-between pt-0.5">
          {collapsed ? (
            // collapsed: one button with just the logo (acts as open)
            <button aria-label="Open sidebar" onClick={handleToggle} className="inline-flex items-center mt-1 md:mt-2 justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg hover:bg-white/20">
              <img src={ecampuss} alt="ecampus" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            </button>
              ) : (
            // expanded: static logo + text on the left, separate close button on right
            <>
              <div className="inline-flex items-center gap-1 md:gap-2 px-1 h-16 md:h-20">
                <img src={ecampus_logo} alt="ecampus" className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain" />
                {/* <span className={`font-semibold tracking-tight text-xl md:text-2xl lg:text-3xl transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>CAMPUS</span> */}
              </div>
              <button aria-label="Close sidebar" onClick={handleToggle} className={`inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'text-white/70 hover:bg-white/20' 
                  : 'text-gray-600 hover:bg-gray-300'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3 md:w-4 md:h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Sidebar content area - direct in black background */}
        <div className={`pt-16 md:pt-20 px-2 md:px-3 flex flex-col h-full`}>
          {/* Navigation items */}
          <div className="flex flex-col gap-1 flex-1">
            <SidebarItem icon={NewChatButton} label="New Chat" collapsed={collapsed} isDarkMode={isDarkMode}/>
            <SidebarItem icon={HomeIcon} label="Home" collapsed={collapsed} isDarkMode={isDarkMode} />
            {/* <SidebarItem icon={ListIcon} label="Curriculum" collapsed={collapsed} isDarkMode={isDarkMode} />
            <SidebarItem icon={QuizIcon} label="Quiz" collapsed={collapsed} isDarkMode={isDarkMode} />
            <SidebarItem icon={CogIcon} label="Settings" collapsed={collapsed} isDarkMode={isDarkMode} /> */}
          </div>
          
          {/* Theme toggle at bottom - HIDDEN FOR NOW */}
          {/* <div className="pb-6">
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center rounded-lg px-3 py-2.5 transition-colors ${
                collapsed ? 'justify-center' : 'justify-center'
              } ${isDarkMode ? 'bg-neutral-900 hover:bg-neutral-700' : 'bg-neutral-400 hover:bg-neutral-500'}`}
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <MoonIcon className={`w-5 h-5 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`} />
                ) : (
                  <SunIcon className={`w-5 h-5 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`} />
                )}
                {!collapsed && (
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {isDarkMode ? 'Dark' : 'Light'}
                  </span>
                )}
              </div>
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

import { useNavigate, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, collapsed, isDarkMode = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleClick = () => {
    const key = label.toLowerCase();
    if (key === 'home' || key === 'new chat') navigate('/');
  };
  const isHome = label.toLowerCase() === 'home';
  const isActive = isHome && location.pathname === '/';
  
  const iconColor = isDarkMode 
    ? (isActive ? 'text-white' : 'text-white/80 group-hover:text-white')
    : (isActive ? 'text-gray-800' : 'text-gray-600 group-hover:text-gray-800');
    
  const textColor = isDarkMode
    ? (isActive ? 'text-white font-semibold' : 'text-white/80 group-hover:text-white')
    : (isActive ? 'text-gray-800 font-semibold' : 'text-gray-600 group-hover:text-gray-800');
  
  return (
    <button onClick={handleClick} className={`group flex items-center w-full gap-2 md:gap-3 rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-left transition-all duration-200 ${
      isDarkMode ? 'hover:bg-white/15 hover:scale-[1.02]' : 'hover:bg-gray-300/70 hover:scale-[1.02]'
    }`}>
      <Icon className={`w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-colors duration-200 ${iconColor}`} />
      <span
        className={`text-xs md:text-sm overflow-hidden whitespace-nowrap transition-all duration-200 ${collapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[140px] md:max-w-[160px]'} ${textColor}`}
      >
        {label}
      </span>
    </button>
  );
};

const NewChatButton = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={props.className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
);

// Simple inline icons to avoid extra deps
const HomeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={props.className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5l9-7 9 7V20a2 2 0 0 1-2 2h-4.5a.5.5 0 0 1-.5-.5v-5a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v5a.5.5 0 0 1-.5.5H5a2 2 0 0 1-2-2v-9.5Z" />
  </svg>
);

const ListIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={props.className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
  </svg>
);

const QuizIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={props.className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01M8.5 9a3.5 3.5 0 1 1 6.7 1.5c-.5.94-1.5 1.4-2.2 2-.52.43-1 1-1 1.75V15" />
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </svg>
);

const CogIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={props.className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317a1 1 0 0 1 1.35-.436l.3.15a1 1 0 0 0 .9 0l.3-.15a1 1 0 0 1 1.35.436l.2.346a1 1 0 0 0 .75.5l.385.064a1 1 0 0 1 .86.99v.3a1 1 0 0 0 .29.705l.214.214a1 1 0 0 1 0 1.414l-.214.214a1 1 0 0 0-.29.705v.3a1 1 0 0 1-.86.99l-.385.064a1 1 0 0 0-.75.5l-.2.346a1 1 0 0 1-1.35.436l-.3-.15a1 1 0 0 0-.9 0l-.3.15a1 1 0 0 1-1.35-.436l-.2-.346a1 1 0 0 0-.75-.5L7.8 12.7a1 1 0 0 1-.86-.99v-.3a1 1 0 0 0-.29-.705L6.44 10.49a1 1 0 0 1 0-1.414l.214-.214a1 1 0 0 0 .29-.705v-.3a1 1 0 0 1 .86-.99l.385-.064a1 1 0 0 0 .75-.5l.2-.346Z" />
    
    </svg>
);

const MoonIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={props.className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

const SunIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={props.className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

export default Sidebar;