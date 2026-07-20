/**
 * Vatican City / Papal flag — yellow (hoist) and white with crossed keys motif simplified.
 */
export function VaticanFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 200"
      className={className}
      role="img"
      aria-label="Flag of Vatican City"
    >
      <title>Flag of Vatican City</title>
      {/* Yellow hoist */}
      <rect x="0" y="0" width="150" height="200" fill="#FFE000" />
      {/* White fly */}
      <rect x="150" y="0" width="150" height="200" fill="#FFFFFF" />
      {/* Simplified tiara */}
      <g transform="translate(225 55)">
        <ellipse cx="0" cy="8" rx="22" ry="10" fill="#C9A227" stroke="#8B6914" strokeWidth="1.5" />
        <ellipse cx="0" cy="-2" rx="18" ry="8" fill="#D4AF37" stroke="#8B6914" strokeWidth="1.5" />
        <ellipse cx="0" cy="-12" rx="14" ry="7" fill="#E8C547" stroke="#8B6914" strokeWidth="1.5" />
        <circle cx="0" cy="-22" r="5" fill="#C9A227" stroke="#8B6914" strokeWidth="1" />
        {/* Cross on top */}
        <path d="M0 -28 v-10 M-4 -34 h8" stroke="#8B6914" strokeWidth="2" fill="none" />
      </g>
      {/* Crossed keys */}
      <g transform="translate(225 115)" stroke="#8B6914" strokeWidth="2.5" fill="none">
        <g transform="rotate(-35)">
          <circle cx="-28" cy="0" r="8" />
          <line x1="-20" y1="0" x2="32" y2="0" />
          <path d="M28 -6 h10 M28 6 h10" />
        </g>
        <g transform="rotate(35)" stroke="#6B5B3A">
          <circle cx="-28" cy="0" r="8" />
          <line x1="-20" y1="0" x2="32" y2="0" />
          <path d="M28 -6 h10 M28 6 h10" />
        </g>
      </g>
      {/* Thin border */}
      <rect x="1" y="1" width="298" height="198" fill="none" stroke="#8B6914" strokeWidth="2" />
    </svg>
  );
}
