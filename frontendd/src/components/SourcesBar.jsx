import React, { useState } from 'react';

// Card-style source display with logos and headlines
// props.sources: Array<{ url: string, title?: string, logo?: string, headline?: string }>
export default function SourcesBar({ sources = [] }) {
  if (!Array.isArray(sources) || sources.length === 0) return null;

  const uniqueByUrl = Array.from(new Map(sources
    .filter(s => typeof s?.url === 'string')
    .map(s => [s.url, s])
  ).values());

  return (
    <div className="mt-4 mb-2">
      <div className="flex items-center gap-2 mb-3 text-white/85">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6 text-white/80">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 18a6 6 0 100-12 6 6 0 000 12z" />
        </svg>
        <div className="text-base md:text-lg font-semibold uppercase tracking-wide">Sources</div>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-dark pb-2">
        {uniqueByUrl.map((s, i) => {
          return <SourceCard key={i} source={s} />;
        })}
      </div>
    </div>
  );
}

function SourceCard({ source }) {
  const [logoError, setLogoError] = useState(false);
  
  let hostname = '';
  try { hostname = new URL(source.url).hostname.replace(/^www\./i, ''); } catch (_) {}
  
  // Use provided logo or fallback to favicon
  const logoUrl = source.logo || (hostname ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128` : '');
  const sourceName = source.title?.trim() || hostname || source.url;
  const headline = source.headline || sourceName;
  const initials = sourceName.substring(0, 2).toUpperCase();
  
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex-shrink-0 w-[200px] md:w-[240px] rounded-lg bg-neutral-700/80 hover:bg-neutral-700 border border-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden"
    >
      <div className="p-3 flex flex-col gap-2">
        {/* Logo and Source Name Row */}
        <div className="flex items-center gap-2">
          {logoUrl && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {!logoError ? (
                <img 
                  src={logoUrl} 
                  alt={sourceName}
                  className="w-6 h-6 object-contain"
                  loading="lazy"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-white/90 text-[10px] font-semibold">{initials}</span>
                </div>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs md:text-sm font-semibold text-white/95 truncate">
              {sourceName}
            </div>
          </div>
        </div>
        
        {/* Headline */}
        <div className="text-[11px] md:text-xs text-white/75 line-clamp-2 leading-snug">
          {headline}
        </div>
      </div>
    </a>
  );
}


