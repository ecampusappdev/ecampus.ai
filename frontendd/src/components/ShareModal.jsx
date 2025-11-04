import React, { useState } from 'react';

export default function ShareModal({ open, url, onClose }) {
  if (!open) return null;
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url || '');
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="w-[90%] max-w-2xl rounded-2xl overflow-hidden bg-neutral-900 text-white shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-lg md:text-xl font-semibold">Share chat</div>
          <button
            className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-white/10"
            aria-label="Close"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-0 bg-neutral-800">
          <div className="relative h-[360px] overflow-auto overscroll-contain bg-neutral-800">
            <iframe title="shared-preview" src={url} className="w-full h-full border-0" />
          </div>
        </div>
        <div className="px-4 py-3 bg-neutral-900 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={url}
              className="flex-1 bg-neutral-800 text-white/90 px-3 py-2 rounded-md text-sm border border-white/10"
            />
            <button
              onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch (_) {} }}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${copied ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {copied ? (
                <span className="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4 4 10-10" /></svg>
                  Copied
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                    <rect x="9" y="9" width="11" height="11" rx="2"/>
                    <rect x="4" y="4" width="11" height="11" rx="2"/>
                  </svg>
                  Copy
                </span>
              )}
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-14 flex-wrap">
            <a href={`https://twitter.com/intent/tweet?url=${encoded}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M4 4h4.6l3.2 4.2L15.3 4H20l-6.5 8.3L20 20h-4.7l-3.5-4.6L8.6 20H4l6.6-7.8L4 4z"/></svg>
              </div>
              <div className="text-sm">X</div>
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6.94 6.5a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0zM4.5 9h2.5v9H4.5zM9 9h2.4v1.28h.03c.33-.62 1.15-1.28 2.37-1.28 2.54 0 3.01 1.64 3.01 3.76V18H14.3v-4.03c0-.96-.02-2.2-1.34-2.2-1.34 0-1.55 1.05-1.55 2.13V18H9V9z"/></svg>
              </div>
              <div className="text-sm">LinkedIn</div>
            </a>
            <a href={`https://www.reddit.com/submit?url=${encoded}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20 11.5c.6 0 1 .4 1 1s-.4 1-1 1c-.3 0-.6-.1-.8-.3-.2 1.6-2.6 3.3-7.2 3.3s-7-1.7-7.2-3.3c-.2.2-.5.3-.8.3-.6 0-1-.4-1-1s.4-1 1-1c.4 0 .7.2.9.5.8-.7 2.2-1.2 3.8-1.4l.7-3.1 2.6.6c.2-.3.6-.6 1.1-.6.7 0 1.2.5 1.2 1.1s-.5 1.1-1.2 1.1c-.5 0-.9-.3-1.1-.7l-2-.5-.5 2.3c1.4 0 2.7.2 3.7.6.3-.3.8-.5 1.3-.5.9 0 1.6.6 1.6 1.4s-.7 1.4-1.6 1.4c-.6 0-1.1-.3-1.4-.7-.6.2-1.3.3-2 .4-.2.6-1 1.1-2 .1-.3.4-.8.6-1.3.6-.9 0-1.6-.6-1.6-1.4s.7-1.4 1.6-1.4c.5 0 1 .2 1.3.5 1-.3 2.3-.5 3.6-.5 1.3 0 2.6.2 3.6.5.3-.3.7-.5 1.2-.5z"/></svg>
              </div>
              <div className="text-sm">Reddit</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


