export function MyanmarSkyline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMax meet"
    >
      {/* Background glow */}
      <defs>
        <radialGradient id="glow" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="600" cy="400" rx="700" ry="250" fill="url(#glow)" />

      {/* Far left - small stupa cluster */}
      <g opacity="0.25">
        <path d="M20 400 L25 340 Q30 320 35 340 L40 400 Z" fill="currentColor" />
        <path d="M40 400 L42 360 Q45 345 48 360 L50 400 Z" fill="currentColor" />
        <circle cx="32" cy="335" r="3" fill="currentColor" />
      </g>

      {/* Left temple with tiered roof */}
      <g opacity="0.3">
        <rect x="60" y="360" width="80" height="40" fill="currentColor" />
        <path d="M65 360 L100 320 L135 360 Z" fill="currentColor" />
        <path d="M70 320 L100 285 L130 320 Z" fill="currentColor" />
        <path d="M80 285 L100 260 L120 285 Z" fill="currentColor" />
        <path d="M90 260 L100 240 L110 260 Z" fill="currentColor" />
        <rect x="95" y="235" width="10" height="8" fill="currentColor" />
        <line x1="100" y1="235" x2="100" y2="225" stroke="currentColor" strokeWidth="2" />
        <circle cx="100" cy="223" r="3" fill="currentColor" />
      </g>

      {/* Chinthe (lion) statue left */}
      <g opacity="0.28">
        <path d="M160 400 L155 370 Q150 355 160 350 L170 340 Q175 330 180 340 L185 350 Q195 355 190 370 L185 400 Z" fill="currentColor" />
        <circle cx="170" cy="345" r="3" fill="currentColor" />
      </g>

      {/* Bagan style temple */}
      <g opacity="0.35">
        <rect x="200" y="350" width="100" height="50" fill="currentColor" />
        <path d="M210 350 L250 300 L290 350 Z" fill="currentColor" />
        <path d="M220 300 L250 265 L280 300 Z" fill="currentColor" />
        <path d="M230 265 L250 240 L270 265 Z" fill="currentColor" />
        <rect x="245" y="230" width="10" height="15" fill="currentColor" />
        <line x1="250" y1="230" x2="250" y2="215" stroke="currentColor" strokeWidth="2" />
        <path d="M247 215 L250 205 L253 215 Z" fill="currentColor" />
        {/* Windows */}
        <rect x="225" y="370" width="12" height="20" rx="6" fill="currentColor" opacity="0.5" />
        <rect x="244" y="370" width="12" height="20" rx="6" fill="currentColor" opacity="0.5" />
        <rect x="263" y="370" width="12" height="20" rx="6" fill="currentColor" opacity="0.5" />
      </g>

      {/* Tall thin pagoda */}
      <g opacity="0.32">
        <path d="M330 400 L335 300 Q340 280 345 300 L350 400 Z" fill="currentColor" />
        <ellipse cx="340" cy="300" rx="12" ry="4" fill="currentColor" />
        <ellipse cx="340" cy="270" rx="9" ry="3" fill="currentColor" />
        <ellipse cx="340" cy="245" rx="7" ry="3" fill="currentColor" />
        <line x1="340" y1="245" x2="340" y2="220" stroke="currentColor" strokeWidth="2" />
        <circle cx="340" cy="218" r="3" fill="currentColor" />
      </g>

      {/* Red pagoda */}
      <g opacity="0.3">
        <path d="M380 400 L385 320 Q395 290 405 320 L410 400 Z" fill="currentColor" />
        <ellipse cx="395" cy="320" rx="15" ry="5" fill="currentColor" />
        <ellipse cx="395" cy="290" rx="11" ry="4" fill="currentColor" />
        <ellipse cx="395" cy="265" rx="8" ry="3" fill="currentColor" />
        <path d="M392 265 L395 245 L398 265 Z" fill="currentColor" />
        <circle cx="395" cy="243" r="2.5" fill="currentColor" />
      </g>

      {/* Central Buddha silhouette */}
      <g opacity="0.2">
        <path d="M480 400 L470 350 Q465 320 480 300 L475 260 Q470 230 490 210 L500 180 Q510 160 520 180 L530 210 Q550 230 545 260 L540 300 Q555 320 550 350 L540 400 Z" fill="currentColor" />
        {/* Head */}
        <circle cx="510" cy="175" r="25" fill="currentColor" />
        {/* Ushnisha */}
        <path d="M505 155 L510 135 L515 155 Z" fill="currentColor" />
      </g>

      {/* Main Shwedagon - center golden pagoda */}
      <g opacity="0.4">
        {/* Base platforms */}
        <rect x="520" y="380" width="160" height="20" fill="currentColor" />
        <rect x="530" y="365" width="140" height="18" fill="currentColor" />
        <rect x="540" y="350" width="120" height="18" fill="currentColor" />

        {/* Bell body */}
        <path d="M550 350 Q545 310 550 280 Q555 250 565 230 L560 190 Q560 160 575 145 L595 115 Q600 100 605 115 L625 145 Q640 160 640 190 L635 230 Q645 250 650 280 Q655 310 650 350 Z" fill="currentColor" />

        {/* Band decorations */}
        <rect x="553" y="320" width="94" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
        <rect x="557" y="290" width="86" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
        <rect x="562" y="260" width="76" height="2" rx="1" fill="currentColor" opacity="0.7" />
        <rect x="567" y="230" width="66" height="2" rx="1" fill="currentColor" opacity="0.7" />

        {/* Lotus petals */}
        <path d="M553 345 Q565 338 577 345 Q589 338 601 345 Q613 338 625 345 Q637 338 647 345" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />

        {/* Spire */}
        <path d="M593 145 L600 80 L607 145" fill="currentColor" />

        {/* Hti umbrella */}
        <path d="M596 85 L600 55 L604 85" fill="currentColor" opacity="0.8" />
        <circle cx="600" cy="52" r="5" fill="currentColor" opacity="0.8" />
        <line x1="600" y1="47" x2="600" y2="35" stroke="currentColor" strokeWidth="2" />
        <circle cx="600" cy="33" r="3" fill="currentColor" />
        <line x1="600" y1="30" x2="600" y2="22" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="600" cy="20" r="2" fill="currentColor" />
      </g>

      {/* Chinthe right */}
      <g opacity="0.28">
        <path d="M700 400 L695 370 Q690 355 700 350 L710 340 Q715 330 720 340 L725 350 Q735 355 730 370 L725 400 Z" fill="currentColor" />
        <circle cx="710" cy="345" r="3" fill="currentColor" />
      </g>

      {/* Multi-tiered pyatthat */}
      <g opacity="0.33">
        <rect x="750" y="355" width="90" height="45" fill="currentColor" />
        <path d="M760 355 L795 310 L830 355 Z" fill="currentColor" />
        <path d="M768 310 L795 275 L822 310 Z" fill="currentColor" />
        <path d="M775 275 L795 245 L815 275 Z" fill="currentColor" />
        <path d="M782 245 L795 220 L808 245 Z" fill="currentColor" />
        <path d="M788 220 L795 200 L802 220 Z" fill="currentColor" />
        <rect x="792" y="195" width="6" height="8" fill="currentColor" />
        <line x1="795" y1="195" x2="795" y2="182" stroke="currentColor" strokeWidth="2" />
        <circle cx="795" cy="180" r="3" fill="currentColor" />
      </g>

      {/* Another tall pagoda */}
      <g opacity="0.3">
        <path d="M870 400 L875 310 Q880 290 885 310 L890 400 Z" fill="currentColor" />
        <ellipse cx="880" cy="310" rx="12" ry="4" fill="currentColor" />
        <ellipse cx="880" cy="280" rx="9" ry="3" fill="currentColor" />
        <ellipse cx="880" cy="255" rx="7" ry="3" fill="currentColor" />
        <path d="M877 255 L880 238 L883 255 Z" fill="currentColor" />
        <circle cx="880" cy="236" r="2.5" fill="currentColor" />
      </g>

      {/* Right temple complex */}
      <g opacity="0.35">
        <rect x="910" y="355" width="90" height="45" fill="currentColor" />
        <path d="M920 355 L955 310 L990 355 Z" fill="currentColor" />
        <path d="M928 310 L955 275 L982 310 Z" fill="currentColor" />
        <path d="M935 275 L955 250 L975 275 Z" fill="currentColor" />
        <rect x="950" y="242" width="10" height="10" fill="currentColor" />
        <line x1="955" y1="242" x2="955" y2="228" stroke="currentColor" strokeWidth="2" />
        <path d="M952 228 L955 218 L958 228 Z" fill="currentColor" />
        {/* Windows */}
        <rect x="930" y="370" width="10" height="18" rx="5" fill="currentColor" opacity="0.5" />
        <rect x="948" y="370" width="10" height="18" rx="5" fill="currentColor" opacity="0.5" />
        <rect x="966" y="370" width="10" height="18" rx="5" fill="currentColor" opacity="0.5" />
      </g>

      {/* Far right stupas */}
      <g opacity="0.25">
        <path d="M1020 400 L1025 350 Q1030 335 1035 350 L1040 400 Z" fill="currentColor" />
        <circle cx="1030" cy="345" r="3" fill="currentColor" />
        <path d="M1050 400 L1052 370 Q1055 360 1058 370 L1060 400 Z" fill="currentColor" />
      </g>

      {/* Far right small temple */}
      <g opacity="0.22">
        <rect x="1080" y="370" width="60" height="30" fill="currentColor" />
        <path d="M1085 370 L1110 340 L1135 370 Z" fill="currentColor" />
        <path d="M1093 340 L1110 318 L1127 340 Z" fill="currentColor" />
        <path d="M1100 318 L1110 305 L1120 318 Z" fill="currentColor" />
        <line x1="1110" y1="305" x2="1110" y2="295" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="1110" cy="293" r="2" fill="currentColor" />
      </g>

      {/* Trees/foliage scattered */}
      <g opacity="0.15">
        <circle cx="150" cy="395" r="12" fill="currentColor" />
        <circle cx="460" cy="398" r="10" fill="currentColor" />
        <circle cx="740" cy="396" r="11" fill="currentColor" />
        <circle cx="1070" cy="397" r="9" fill="currentColor" />
      </g>
    </svg>
  );
}
