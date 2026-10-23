<script setup>
/**
 * The couple beside the names: a slim groom in a midnight tuxedo with a round, curly-haired face,
 * and the bride in a white niqab.
 * They walk in from the card's edges, stop beside the names, lean in, and hearts rise.
 */
</script>

<template>
  <div class="couple-figures" aria-hidden="true">
    <!-- Groom: slim midnight tuxedo, the round cute face with curly hair -->
    <svg class="figure figure-groom" viewBox="0 0 120 220" fill="none">
      <ellipse class="ground" cx="60" cy="212" rx="28" ry="4.5" fill="#3a2a18" opacity="0.16" />
      <g class="walker">
        <g class="leg leg-back">
          <path d="M48 168 L47 204 L57.5 204 L58 168 Z" fill="#15171d" />
          <ellipse cx="51.5" cy="206" rx="9" ry="4" fill="#0a0a0d" />
        </g>
        <g class="leg leg-front">
          <path d="M62 168 L62.5 204 L73 204 L72 168 Z" fill="#1b1d25" />
          <path d="M67.5 172 L67.8 202" stroke="#2b2e3a" stroke-width="0.8" />
          <ellipse cx="68.5" cy="206" rx="9" ry="4" fill="#0a0a0d" />
          <ellipse cx="72" cy="204.6" rx="3" ry="1.1" fill="#6a6a78" opacity="0.7" />
        </g>

        <!-- Sleeves and hands -->
        <path d="M31 100 C25.5 116 24.5 136 27 156 L35.5 156 C35.5 138 36.5 120 39 106 Z" fill="#191c28" />
        <path d="M89 100 C94.5 116 95.5 136 93 156 L84.5 156 C84.5 138 83.5 120 81 106 Z" fill="#191c28" />
        <rect x="26.5" y="154.5" width="9.5" height="3" rx="1" fill="#f6f2ea" />
        <rect x="84" y="154.5" width="9.5" height="3" rx="1" fill="#f6f2ea" />
        <ellipse cx="31" cy="161" rx="4.4" ry="5.2" fill="#e3b28a" />
        <ellipse cx="89" cy="161" rx="4.4" ry="5.2" fill="#e3b28a" />

        <!-- Jacket, tapered at the waist -->
        <path d="M31 100 C31 92 40 87 51 87 L60 112 L69 87 C80 87 89 92 89 100 L86.5 140 C85.5 150 85.5 160 87.5 172 L66 174 L60 130 L54 174 L32.5 172 C34.5 160 34.5 150 33.5 140 Z" fill="#1e2131" />
        <path d="M51 88 L60 112 L69 88 Z" fill="#fbf8f2" />
        <path d="M60 100 L60 112" stroke="#e7e1d6" stroke-width="0.8" />
        <!-- Satin peak lapels -->
        <path d="M51 87 L60 112 L56 121 L45 101 L49.5 96.5 L44 93 Z" fill="#30344b" />
        <path d="M69 87 L60 112 L64 121 L75 101 L70.5 96.5 L76 93 Z" fill="#30344b" />
        <path d="M50 92 L57 110 M70 92 L63 110" stroke="#5a6080" stroke-width="0.8" opacity="0.7" />
        <!-- Bow tie -->
        <path d="M52 89.5 L59.4 93 L52 96.5 Z M68 89.5 L60.6 93 L68 96.5 Z" fill="#101116" />
        <rect x="58.4" y="91.6" width="3.2" height="2.8" rx="1" fill="#22242c" />
        <!-- Button, pocket square, boutonniere -->
        <circle cx="60" cy="135" r="1.8" fill="#0c0d12" />
        <circle cx="59.5" cy="134.5" r="0.6" fill="#5a5f78" />
        <path d="M71 109 L80 109 L78.2 104.5 L75.5 106.8 L73.3 104.2 Z" fill="#ffffff" />
        <ellipse cx="44" cy="104" rx="2.4" ry="4.4" fill="#7f9273" transform="rotate(-35 44 104)" />
        <circle cx="47" cy="100" r="3.8" fill="#d4a0a6" />
        <path d="M45.4 100 Q47 98 48.6 100 Q47 102 45.4 100" stroke="#a9636d" stroke-width="0.9" />

        <!-- Neck and the round, cute head -->
        <rect x="54" y="76" width="12" height="13" rx="4" fill="#d6a378" />
        <circle cx="33.5" cy="57" r="5.5" fill="#e3b48a" />
        <circle cx="86.5" cy="57" r="5.5" fill="#e3b48a" />
        <circle cx="60" cy="54" r="27" fill="#ebbf95" />

        <!-- Curly hair -->
        <g fill="#3a281c">
          <circle cx="35" cy="47" r="8.5" />
          <circle cx="40" cy="36" r="10" />
          <circle cx="50" cy="28.5" r="11" />
          <circle cx="62" cy="26" r="11.5" />
          <circle cx="74" cy="30" r="10.5" />
          <circle cx="83" cy="39" r="9.5" />
          <circle cx="86" cy="49" r="7" />
          <circle cx="46" cy="39" r="8" />
          <circle cx="57" cy="37" r="8" />
          <circle cx="68" cy="38" r="8" />
          <circle cx="78" cy="42" r="6.5" />
        </g>
        <g stroke="#5c4230" stroke-width="1.6" stroke-linecap="round">
          <path d="M44 30 q4 -3 7 1" />
          <path d="M58 22 q4 -3 7 1" />
          <path d="M71 26 q4 -2 6 2" />
          <path d="M37 42 q3 -3 6 0" />
          <path d="M52 36 q3 -3 6 0" />
          <path d="M64 35 q3 -3 6 0" />
          <path d="M79 37 q3 -2 5 1" />
        </g>

        <path d="M45 49.5 Q50 46.5 55 49.5" stroke="#3a281c" stroke-width="2" stroke-linecap="round" />
        <path d="M65 49.5 Q70 46.5 75 49.5" stroke="#3a281c" stroke-width="2" stroke-linecap="round" />
        <g class="eyes">
          <ellipse cx="50" cy="57.5" rx="3.2" ry="3.8" fill="#2a1d15" />
          <ellipse cx="70" cy="57.5" rx="3.2" ry="3.8" fill="#2a1d15" />
          <circle cx="51.2" cy="56" r="1.1" fill="#fff" />
          <circle cx="71.2" cy="56" r="1.1" fill="#fff" />
        </g>
        <circle cx="44" cy="66" r="4.2" fill="#ec9a8c" opacity="0.45" />
        <circle cx="76" cy="66" r="4.2" fill="#ec9a8c" opacity="0.45" />
        <path d="M52.5 67.5 Q60 75 67.5 67.5" stroke="#8a4a33" stroke-width="2.2" stroke-linecap="round" />
      </g>
    </svg>

    <!-- Bride, in a white niqab -->
    <svg class="figure figure-bride" viewBox="0 0 120 220" fill="none">
      <ellipse class="ground" cx="60" cy="212" rx="40" ry="5" fill="#3a2a18" opacity="0.14" />
      <g class="walker">
        <path class="veil" d="M37 38 C17 92 13 160 19 211 L101 211 C107 160 103 92 83 38 Z" fill="#fffaf1" opacity="0.8" />
        <g class="dress">
          <path d="M44 100 C40 132 27 172 17 209 Q60 219 103 209 C93 172 80 132 76 100 Z" fill="#ffffff" />
          <path d="M50 134 C47 160 41 186 37 210" stroke="#ece4d6" stroke-width="1.6" />
          <path d="M60 134 L60 214" stroke="#ece4d6" stroke-width="1.6" />
          <path d="M70 134 C73 160 79 186 83 210" stroke="#ece4d6" stroke-width="1.6" />
          <path d="M18 208 q7 5 14 1 q7 5 14 1 q7 5 14 1 q7 5 14 1 q7 5 14 1 q7 5 14 1" stroke="#e3d8c4" stroke-width="1.6" />
        </g>
        <path d="M29 70 C27 97 34 121 44 131 L76 131 C86 121 93 97 91 70 C84 57 36 57 29 70 Z" fill="#fbf8f2" />
        <path d="M42 128 Q60 134 78 128" stroke="#c9a552" stroke-width="3" stroke-linecap="round" />

        <ellipse cx="60" cy="52" rx="28.5" ry="31" fill="#ffffff" />
        <ellipse cx="60" cy="52" rx="28.5" ry="31" stroke="#ece4d6" stroke-width="1.4" />
        <path d="M36 39 Q60 28 84 39" stroke="#d8b867" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="60" cy="31.5" r="2.4" fill="#d8b867" />

        <rect x="40" y="45" width="40" height="16" rx="8" fill="#ebbf95" />
        <path d="M45 48.8 Q50 46.6 55 48.8" stroke="#3a281c" stroke-width="1.6" stroke-linecap="round" />
        <path d="M65 48.8 Q70 46.6 75 48.8" stroke="#3a281c" stroke-width="1.6" stroke-linecap="round" />
        <g class="eyes">
          <ellipse cx="50" cy="53.5" rx="3.1" ry="3.6" fill="#2a1d15" />
          <ellipse cx="70" cy="53.5" rx="3.1" ry="3.6" fill="#2a1d15" />
          <circle cx="51.1" cy="52.1" r="1.05" fill="#fff" />
          <circle cx="71.1" cy="52.1" r="1.05" fill="#fff" />
          <path d="M46.5 51 l-2 -1.6 M73.5 51 l2 -1.6" stroke="#2a1d15" stroke-width="1.2" stroke-linecap="round" />
        </g>
        <path d="M37 60 Q60 64.5 83 60 C83 77 73 89 60 91 C47 89 37 77 37 60 Z" fill="#fdfbf8" stroke="#ece4d6" stroke-width="1.2" />

        <circle cx="52" cy="133" r="4.6" fill="#e3b48a" />
        <circle cx="68" cy="133" r="4.6" fill="#e3b48a" />
        <path d="M60 140 L57 160 M60 140 L63 160" stroke="#c9a552" stroke-width="1.6" stroke-linecap="round" />
        <ellipse cx="48" cy="130" rx="6" ry="3" fill="#7f9273" transform="rotate(-30 48 130)" />
        <ellipse cx="72" cy="130" rx="6" ry="3" fill="#7f9273" transform="rotate(30 72 130)" />
        <circle cx="54" cy="135" r="6.5" fill="#d4a0a6" />
        <circle cx="66" cy="134" r="6" fill="#fff2ee" />
        <circle cx="60" cy="128" r="6" fill="#e6b2b8" />
        <circle cx="54" cy="135" r="2.5" fill="#b4707a" />
        <circle cx="60" cy="128" r="2.3" fill="#c0848c" />
      </g>
    </svg>

    <div class="hearts">
      <span v-for="n in 6" :key="n" :style="{ '--h': n }">
        <svg viewBox="0 0 24 22"><path d="M12 21 C5 15 1 11.5 1 7 A5.5 5.5 0 0 1 12 4.5 A5.5 5.5 0 0 1 23 7 C23 11.5 19 15 12 21 Z" /></svg>
      </span>
    </div>
  </div>
</template>
