<script setup>
import { useId } from 'vue'

/** A red wax seal pressed with the couple's initials, drawn in SVG to match the envelope's seal. */
defineProps({
  initials: { type: String, default: 'W&A' },
})

const id = useId()
</script>

<template>
  <svg class="wax-seal" viewBox="0 0 120 120" role="img" :aria-label="initials">
    <defs>
      <radialGradient :id="`${id}-wax`" cx="38%" cy="32%" r="75%">
        <stop offset="0" stop-color="#b52a31" />
        <stop offset="0.45" stop-color="#8a1219" />
        <stop offset="1" stop-color="#560810" />
      </radialGradient>
      <radialGradient :id="`${id}-press`" cx="60%" cy="65%" r="70%">
        <stop offset="0" stop-color="#8f151d" />
        <stop offset="1" stop-color="#6a0b12" />
      </radialGradient>
      <filter :id="`${id}-melt`" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="9" />
      </filter>
      <filter :id="`${id}-soft`">
        <feGaussianBlur stdDeviation="2.2" />
      </filter>
    </defs>

    <!-- Melted outer edge -->
    <g :filter="`url(#${id}-melt)`">
      <circle cx="60" cy="60" r="50" :fill="`url(#${id}-wax)`" />
    </g>
    <!-- Pressed centre and its rim -->
    <circle cx="60" cy="60" r="37" fill="none" stroke="#5a0910" stroke-width="3" opacity="0.7" />
    <circle cx="60" cy="60" r="35" :fill="`url(#${id}-press)`" />
    <circle cx="60" cy="60" r="31" fill="none" stroke="#c4464c" stroke-width="1" opacity="0.45" />
    <circle cx="60" cy="60" r="29.5" fill="none" stroke="#4d070d" stroke-width="1" opacity="0.6" />
    <!-- Embossed letters: dark below, light above -->
    <g font-family="'Cormorant Garamond', Georgia, serif" font-weight="700" font-size="24" text-anchor="middle">
      <text x="61.6" y="69.6" fill="#3a0408">{{ initials }}</text>
      <text x="58.8" y="66.8" fill="#f08a8c" opacity="0.8">{{ initials }}</text>
      <text x="60" y="68" fill="#7a0e15">{{ initials }}</text>
    </g>
    <!-- Gloss -->
    <ellipse cx="44" cy="38" rx="16" ry="9" fill="#fff" opacity="0.16" :filter="`url(#${id}-soft)`" transform="rotate(-28 44 38)" />
  </svg>
</template>
