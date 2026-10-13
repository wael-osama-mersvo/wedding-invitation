<script setup>
/** Decorative cartoon couple for the invitation card background. */
</script>

<template>
  <div class="couple-figures" aria-hidden="true">
    <!-- Groom -->
    <svg class="figure figure-groom" viewBox="0 0 120 200" fill="none">
      <!-- body / jacket -->
      <path d="M38 86 C30 92 24 118 22 168 L42 176 L60 150 L78 176 L98 168 C96 118 90 92 82 86 Z" fill="#2c3544" />
      <path d="M48 86 L60 118 L72 86 Z" fill="#1a222e" />
      <path d="M58 88 L60 128 L62 88 Z" fill="#e8d5a3" opacity="0.85" />
      <!-- shirt collar -->
      <path d="M50 84 L60 98 L70 84 L60 90 Z" fill="#f5f0e8" />
      <!-- head -->
      <ellipse cx="60" cy="52" rx="22" ry="26" fill="#d4a574" />
      <!-- hair -->
      <path d="M38 48 C40 28 52 22 60 22 C68 22 80 28 82 48 C76 40 68 38 60 38 C52 38 44 40 38 48 Z" fill="#2a2118" />
      <!-- eyes -->
      <ellipse cx="52" cy="52" rx="2.2" ry="2.6" fill="#2a2118" />
      <ellipse cx="68" cy="52" rx="2.2" ry="2.6" fill="#2a2118" />
      <!-- smile -->
      <path d="M54 62 Q60 68 66 62" stroke="#8a5a3c" stroke-width="1.6" stroke-linecap="round" />
      <!-- boutonniere -->
      <circle cx="44" cy="100" r="4" fill="#c3a35a" />
      <circle cx="44" cy="100" r="2" fill="#7f9273" />
    </svg>

    <!-- Bride with niqab -->
    <svg class="figure figure-bride" viewBox="0 0 120 200" fill="none">
      <!-- dress -->
      <path d="M42 92 C34 108 20 150 16 188 L104 188 C100 150 86 108 78 92 Z" fill="#f7f1e8" />
      <path d="M42 92 C48 100 72 100 78 92 L70 84 L50 84 Z" fill="#efe6d8" />
      <!-- dress sash -->
      <path d="M34 118 C48 124 72 124 86 118" stroke="#c3a35a" stroke-width="3" stroke-linecap="round" />
      <!-- shoulders / abaya layer -->
      <path d="M40 84 C28 90 24 110 26 130 L40 120 L80 120 L94 130 C96 110 92 90 80 84 Z" fill="#1c1c1c" opacity="0.92" />
      <!-- head / niqab -->
      <ellipse cx="60" cy="50" rx="26" ry="30" fill="#141414" />
      <!-- eye window -->
      <rect x="42" y="44" width="36" height="14" rx="6" fill="#d4a574" />
      <!-- eyes -->
      <ellipse cx="52" cy="51" rx="2.4" ry="2.8" fill="#2a2118" />
      <ellipse cx="68" cy="51" rx="2.4" ry="2.8" fill="#2a2118" />
      <!-- lashes hint -->
      <path d="M48 47 Q52 44 56 47" stroke="#2a2118" stroke-width="1" fill="none" />
      <path d="M64 47 Q68 44 72 47" stroke="#2a2118" stroke-width="1" fill="none" />
      <!-- niqab lower veil -->
      <path d="M34 56 C40 72 50 78 60 78 C70 78 80 72 86 56 L86 70 C78 88 68 96 60 96 C52 96 42 88 34 70 Z" fill="#0f0f0f" />
      <!-- hijab drape -->
      <path d="M34 40 C28 58 30 86 36 100 L44 92 C40 70 42 52 48 42 Z" fill="#1a1a1a" />
      <path d="M86 40 C92 58 90 86 84 100 L76 92 C80 70 78 52 72 42 Z" fill="#1a1a1a" />
      <!-- bouquet -->
      <circle cx="88" cy="128" r="8" fill="#d4a0a6" />
      <circle cx="94" cy="122" r="5" fill="#c3a35a" />
      <circle cx="82" cy="122" r="5" fill="#7f9273" />
      <path d="M88 134 L86 148" stroke="#556746" stroke-width="2" stroke-linecap="round" />
    </svg>
  </div>
</template>
