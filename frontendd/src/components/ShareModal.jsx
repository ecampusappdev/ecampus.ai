import React from 'react';

export default function ShareModal({ open, url, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="w-[90%] max-w-2xl rounded-2xl overflow-hidden bg-neutral-900 text-white shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-sm font-semibold">Share chat</div>
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
          <iframe title="shared-preview" src={url} className="w-full h-[360px] border-0" />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-900 border-t border-white/10">
          <input
            readOnly
            value={url}
            className="flex-1 bg-neutral-800 text-white/90 px-3 py-2 rounded-md text-sm border border-white/10"
          />
          <button
            onClick={async () => { try { await navigator.clipboard.writeText(url); } catch (_) {} }}
            className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm"
          >
            Copy link
          </button>
        </div>
      </div>
    </div>
  );
}


