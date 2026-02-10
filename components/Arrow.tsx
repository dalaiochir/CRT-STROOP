"use client";

export default function Arrow({ angleDeg }: { angleDeg: number }) {
  // simple SVG arrow pointing up, rotated
  return (
    <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: `rotate(${angleDeg}deg)` }}>
      <line x1="50" y1="85" x2="50" y2="22" stroke="white" strokeWidth="8" strokeLinecap="round" />
      <polyline points="30,40 50,20 70,40" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
