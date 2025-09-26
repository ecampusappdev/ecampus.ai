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


import React, { useState } from 'react';
import ecampus from '../assets/ecampus.png';

// Sidebar with pure black background - no inner gradient panel
// - Collapsible via toggle button (hamburger)
// - Clean black design matching the Bloom interface
// - Parent can control with props, or it manages its own collapsed state

const Sidebar = ({ initialCollapsed = false, onToggle }) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof onToggle === 'function') onToggle(next);
  };

  return (
    <div className={`h-full flex-shrink-0 transition-[width] duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Pure black sidebar container */}
      <div className="h-full w-full bg-black relative">
        {/* Top branding + independent toggle */}
        <div className="absolute top-2 left-3 right-3 flex items-center justify-between pt-2">
          {collapsed ? (
            // collapsed: one button with just the logo (acts as open)
            <button aria-label="Open sidebar" onClick={handleToggle} className="inline-flex items-center justify-center w-12 h-12 rounded-lg hover:bg-white/20">
              <img src={ecampus} alt="ecampus" className="w-8 h-8 object-contain" />
            </button>
          ) : (
            // expanded: static logo + text on the left, separate close button on right
            <>
              <div className="inline-flex items-center gap-2 px-1 h-12">
                <img src={ecampus} alt="ecampus" className="w-8 h-8 object-contain" />
                <span className="text-white font-semibold tracking-tight text-lg">Ecampus</span>
              </div>
              <button aria-label="Close sidebar" onClick={handleToggle} className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 text-white/70">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Sidebar content area - direct in black background */}
        <div className={`pt-16 px-3`}>
          {/* Example nav items; replace with your links */}
          <div className="flex flex-col gap-1">
            <SidebarItem icon={NewChatButton} label="New Chat" collapsed={collapsed}/>
            <SidebarItem icon={HomeIcon} label="Home" collapsed={collapsed} />
            {/* <SidebarItem icon={ListIcon} label="Curriculum" collapsed={collapsed} /> */}
            {/* <SidebarItem icon={QuizIcon} label="Quiz" collapsed={collapsed} /> */}
            {/* <SidebarItem icon={CogIcon} label="Settings" collapsed={collapsed} /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

import { useNavigate, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleClick = () => {
    const key = label.toLowerCase();
    if (key === 'home' || key === 'new chat') navigate('/');
  };
  const isHome = label.toLowerCase() === 'home';
  const isActive = isHome && location.pathname === '/';
  return (
    <button onClick={handleClick} className="group flex items-center w-full gap-3 rounded-lg px-3 py-2.5 hover:bg-white/10 text-left transition-colors">
      <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`} />
      <span
        className={`text-sm overflow-hidden whitespace-nowrap transition-all duration-200 ${collapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[160px]'} ${isActive ? 'text-white font-semibold' : 'text-white/80 group-hover:text-white'}`}
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

export default Sidebar;