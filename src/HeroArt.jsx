/** SWAP HERO PHOTO HERE: replace this SVG with a light photo of currency, travel,
 *  a passport, and a soft crypto-network motif. Keep the pale wash so type stays readable.
 *  Do not hotlink a tappable image host. */
export default function HeroArt() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 480 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d7e6f8" />
          <stop offset="0.55" stopColor="#f4f8fc" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="coin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3e2b8" />
          <stop offset="1" stopColor="#d7b15a" />
        </linearGradient>
      </defs>
      <rect width="480" height="560" fill="url(#sky)" />
      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="90" cy="70" rx="46" ry="16" />
        <ellipse cx="120" cy="64" rx="28" ry="14" />
        <ellipse cx="300" cy="88" rx="54" ry="16" />
      </g>
      <g fill="#8eafc9" opacity="0.55">
        <rect x="0" y="250" width="36" height="90" />
        <rect x="36" y="220" width="28" height="120" />
        <rect x="64" y="236" width="34" height="104" />
        <rect x="98" y="198" width="24" height="142" />
        <rect x="122" y="228" width="40" height="112" />
        <rect x="162" y="188" width="22" height="152" />
        <rect x="184" y="210" width="46" height="130" />
        <rect x="230" y="236" width="30" height="104" />
        <rect x="260" y="200" width="26" height="140" />
        <rect x="286" y="230" width="50" height="110" />
        <rect x="336" y="214" width="32" height="126" />
        <rect x="368" y="242" width="40" height="98" />
        <rect x="408" y="226" width="36" height="114" />
        <rect x="444" y="248" width="36" height="92" />
      </g>
      <g fill="#f7fbff">
        <rect x="48" y="248" width="6" height="6" />
        <rect x="58" y="248" width="6" height="6" />
        <rect x="108" y="214" width="5" height="5" />
        <rect x="196" y="228" width="6" height="6" />
        <rect x="208" y="228" width="6" height="6" />
        <rect x="274" y="220" width="5" height="5" />
      </g>
      <g transform="translate(36,150)">
        <rect width="86" height="112" rx="10" fill="#f8f1e4" stroke="#e0cfaa" />
        <circle cx="43" cy="46" r="16" fill="none" stroke="#c4a36a" strokeWidth="2" />
        <rect x="22" y="74" width="42" height="5" rx="2" fill="#ead9b8" />
        <rect x="28" y="86" width="30" height="5" rx="2" fill="#ead9b8" />
      </g>
      <g stroke="#184e9e" strokeWidth="1.4" opacity="0.45" fill="none">
        <path d="M300 150 L360 120 L410 160 L360 190 Z" />
        <path d="M360 120 L390 80" />
        <path d="M410 160 L450 140" />
        <path d="M300 150 L280 190" />
      </g>
      <g fill="#184e9e">
        <circle cx="300" cy="150" r="4" />
        <circle cx="360" cy="120" r="4" />
        <circle cx="410" cy="160" r="4" />
        <circle cx="360" cy="190" r="4" />
        <circle cx="390" cy="80" r="3" />
        <circle cx="450" cy="140" r="3" />
      </g>
      <g transform="translate(250,210)">
        <circle r="34" cx="34" cy="34" fill="url(#coin)" />
        <circle r="26" cx="34" cy="34" fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
        <text x="34" y="40" textAnchor="middle" fontSize="18" fontWeight="700" fill="#6d5320">₿</text>
      </g>
      <text x="400" y="210" fontSize="28" fill="#8fb4cc" opacity="0.7">₮</text>
      <text x="150" y="120" fontSize="26" fill="#8fb4cc" opacity="0.8">€</text>
      <text x="210" y="78" fontSize="26" fill="#8fb4cc" opacity="0.75">$</text>
    </svg>
  );
}
