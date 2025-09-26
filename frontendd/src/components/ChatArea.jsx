import React from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import UniversitySlider from './universitySlider';

export default function ChatArea({ onSubmit, placeholder }) {
  const navigate = useNavigate();
  const handleSubmit = async (text) => {
    if (typeof onSubmit === 'function') {
      try { await onSubmit(text); } catch (_) {}
    }
    navigate('/chat', { state: { initialQuery: text } });
  };
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-2 md:p-4 lg:p-6">
      <div className="w-full h-[95vh] bg-neutral-800 rounded-[20px] flex flex-col items-center px-3 md:px-4 pb-10 md:pb-14">
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <h1 className="text-white/75 text-2xl md:text-4xl font-semibold tracking-tight text-center mb-6">
            Explore your best career path!!
          </h1>
          <div className='mt-4'>
            <Chat onSubmit={handleSubmit} placeholder={placeholder} />
          </div>
        </div>
        <div className="mt-auto w-full pb-4 md:pb-6">
          <UniversitySlider/>
        </div>
      </div>
    </div>
  );
}


