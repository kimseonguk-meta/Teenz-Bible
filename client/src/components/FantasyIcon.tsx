type FantasyIconName =
  | "castle"
  | "book"
  | "trophy"
  | "chest"
  | "shield"
  | "brain"
  | "candle"
  | "friends"
  | "gem"
  | "coin"
  | "flame";

interface FantasyIconProps {
  name: FantasyIconName;
  className?: string;
}

const commonDefs = (
  <>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff5b2" />
      <stop offset="0.36" stopColor="#ffc72d" />
      <stop offset="0.72" stopColor="#a55b08" />
      <stop offset="1" stopColor="#5d3106" />
    </linearGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#4a4d58" />
      <stop offset="1" stopColor="#15171e" />
    </linearGradient>
    <filter id="iconShadow" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.65" />
      <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#ffd057" floodOpacity="0.25" />
    </filter>
  </>
);

export default function FantasyIcon({ name, className = "" }: FantasyIconProps) {
  const stroke = "#2a1502";
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true" role="img">
      <defs>{commonDefs}</defs>
      <g filter="url(#iconShadow)" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        {name === "castle" && (
          <>
            <path d="M9 56h46V26l-7 4v-14h-9v9l-7-6-7 6v-9h-9v14l-7-4z" fill="url(#steel)" />
            <path d="M13 19l5-9 5 9M41 19l5-9 5 9M27 19l5-10 5 10" fill="url(#gold)" />
            <path d="M24 56V42c0-5 4-9 8-9s8 4 8 9v14" fill="#120d19" />
            <path d="M15 36h8M41 36h8M28 28h8" />
          </>
        )}
        {name === "book" && (
          <>
            <path d="M12 13c11-4 21 0 21 0v39s-10-4-21 0z" fill="#8d2e29" />
            <path d="M33 13s10-4 21 0v39c-11-4-21 0-21 0z" fill="#5b241d" />
            <path d="M33 13v39" />
            <path d="M18 20h9M18 27h9M39 20h9M39 27h9" stroke="#ffd36a" />
            <path d="M48 12v18l-5-4-5 4V15" fill="url(#gold)" />
          </>
        )}
        {name === "trophy" && (
          <>
            <path d="M21 12h22v13c0 8-5 14-11 14s-11-6-11-14z" fill="url(#gold)" />
            <path d="M21 18H10c0 10 5 16 12 16M43 18h11c0 10-5 16-12 16" fill="none" />
            <path d="M27 39h10v8h8v9H19v-9h8z" fill="url(#gold)" />
            <path d="M32 17l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#fff2a8" />
          </>
        )}
        {name === "chest" && (
          <>
            <path d="M11 27c0-8 6-14 14-14h14c8 0 14 6 14 14v5H11z" fill="#7a3418" />
            <path d="M10 30h44v24H10z" fill="#4b2315" />
            <path d="M10 30h44v8H10zM27 13v41M37 13v41" fill="url(#gold)" />
            <path d="M26 33h12v12H26z" fill="#7530c4" />
            <path d="M30 37h4v4h-4z" fill="#fff2a8" />
          </>
        )}
        {name === "shield" && (
          <>
            <path d="M32 7l21 8v16c0 14-9 22-21 27C20 53 11 45 11 31V15z" fill="url(#steel)" />
            <path d="M32 13l14 5v12c0 9-5 15-14 20-9-5-14-11-14-20V18z" fill="#1f5d8f" />
            <path d="M32 13v37M20 30h24" stroke="#9ed7ff" />
          </>
        )}
        {name === "brain" && (
          <>
            <path d="M22 19c-6 0-10 5-10 11 0 5 3 8 7 9 0 7 5 12 12 12 8 0 14-6 14-14 5-2 8-6 8-11 0-7-5-12-12-12-3-5-9-7-14-4-2 1-4 4-5 9z" fill="#ff99ab" />
            <path d="M25 21c3 3 2 7-1 9M34 14c-1 5 2 8 7 9M20 39c5-1 8 1 10 5M42 29c-5 1-8 4-8 9" fill="none" stroke="#8d3751" />
          </>
        )}
        {name === "candle" && (
          <>
            <path d="M24 30h16v25H24z" fill="#fff0c8" />
            <path d="M23 30h18v7H23z" fill="url(#gold)" />
            <path d="M32 8c8 8 3 16 0 18-3-2-8-10 0-18z" fill="#ffda3d" />
            <path d="M33 14c3 5 1 8-1 10-2-2-3-5 1-10z" fill="#ff6b1f" />
          </>
        )}
        {name === "friends" && (
          <>
            <circle cx="23" cy="22" r="8" fill="#2388ff" />
            <circle cx="42" cy="22" r="8" fill="#1fd0a8" />
            <path d="M9 53c2-12 10-18 19-18s17 6 19 18z" fill="#2368cc" />
            <path d="M30 53c2-10 8-16 17-16 6 0 11 5 13 16z" fill="#1aa37f" />
          </>
        )}
        {name === "gem" && (
          <>
            <path d="M17 12h30l10 14-25 30L7 26z" fill="#49d9ff" />
            <path d="M17 12l15 44M47 12L32 56M7 26h50M17 12l-10 14M47 12l10 14" fill="none" stroke="#e7fbff" />
          </>
        )}
        {name === "coin" && (
          <>
            <circle cx="32" cy="32" r="23" fill="url(#gold)" />
            <circle cx="32" cy="32" r="15" fill="none" stroke="#fff2a8" />
            <path d="M32 18v28M23 25h14a6 6 0 010 12H27" fill="none" />
          </>
        )}
        {name === "flame" && (
          <>
            <path d="M34 6c6 10-1 15 7 22 3 3 5 7 5 12 0 10-7 18-15 18S17 51 17 40c0-8 5-12 10-18 4-5 4-10 7-16z" fill="#ff7a19" />
            <path d="M32 27c4 6-3 9 1 14 2 2 3 4 3 7 0 5-3 9-7 9s-8-4-8-9c0-6 6-9 11-21z" fill="#ffe65a" />
          </>
        )}
      </g>
    </svg>
  );
}
