import React from 'react';

// Simple horizontal list of source chips/cards with favicon and hostname
// props.sources: Array<{ url: string, title?: string }>
export default function SourcesBar({ sources = [] }) {
  if (!Array.isArray(sources) || sources.length === 0) return null;

  const uniqueByUrl = Array.from(new Map(sources
    .filter(s => typeof s?.url === 'string')
    .map(s => [s.url, s])
  ).values());

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2 text-white/85">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6 text-white/80">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 18a6 6 0 100-12 6 6 0 000 12z" />
        </svg>
        <div className="text-base md:text-lg font-semibold uppercase tracking-wide">Sources</div>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-dark pb-1">
        {uniqueByUrl.map((s, i) => {
          let hostname = '';
          try { hostname = new URL(s.url).hostname.replace(/^www\./i, ''); } catch (_) {}
          const favicon = hostname ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64` : '';
          return (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/85 whitespace-nowrap"
            >
              {favicon && (
                <img src={favicon} alt="" className="w-4 h-4 rounded-sm" loading="lazy" />
              )}
              <span className="text-sm md:text-[15px] truncate max-w-[200px]">
                {s.title?.trim() || hostname || s.url}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}


