<script setup>
import { computed } from 'vue'
import { weddingConfig } from '../config/wedding.js'
import { getBrideStyle, getGroomStyle } from '../characters/catalog.js'

const props = defineProps({
  groomStyleId: { type: Number, default: null },
  brideStyleId: { type: Number, default: null },
})

const groom = computed(() =>
  getGroomStyle(props.groomStyleId ?? weddingConfig.groomStyleId ?? 1),
)
const bride = computed(() =>
  getBrideStyle(props.brideStyleId ?? weddingConfig.brideStyleId ?? 1),
)

const suit = computed(() => groom.value.suit)
const suitDark = computed(() => groom.value.ink || '#15171d')
const hair = computed(() => groom.value.hair)
const bouton = computed(() => groom.value.boutonniere)
const dress = computed(() => bride.value.dress)
const bouquet = computed(() => bride.value.bouquet)
const gold = computed(() => bride.value.gold)

const dressPath = computed(() => {
  const s = bride.value.silhouette
  if (s === 'fitted') return 'M48 100 C46 132 36 172 28 209 Q60 217 92 209 C84 172 74 132 72 100 Z'
  if (s === 'flared') return 'M44 100 C38 132 18 172 8 209 Q60 222 112 209 C102 172 82 132 76 100 Z'
  return 'M44 100 C40 132 27 172 17 209 Q60 219 103 209 C93 172 80 132 76 100 Z'
})

const veilOpacity = computed(() => {
  if (bride.value.veil === 'sheer') return 0.55
  if (bride.value.veil === 'soft') return 0.7
  return 0.8
})
</script>

<template>
  <div class="couple-figures" aria-hidden="true">
    <svg class="figure figure-groom" viewBox="0 0 120 220" fill="none">
      <ellipse class="ground" cx="60" cy="212" rx="28" ry="4.5" fill="#3a2a18" opacity="0.16" />
      <g class="walker">
        <g class="leg leg-back">
          <path d="M48 168 L47 204 L57.5 204 L58 168 Z" :fill="suitDark" />
          <ellipse cx="51.5" cy="206" rx="9" ry="4" fill="#0a0a0d" />
        </g>
        <g class="leg leg-front">
          <path d="M62 168 L62.5 204 L73 204 L72 168 Z" :fill="suit" />
          <ellipse cx="68.5" cy="206" rx="9" ry="4" fill="#0a0a0d" />
        </g>
        <path d="M31 100 C25.5 116 24.5 136 27 156 L35.5 156 C35.5 138 36.5 120 39 106 Z" :fill="suitDark" />
        <path d="M89 100 C94.5 116 95.5 136 93 156 L84.5 156 C84.5 138 83.5 120 81 106 Z" :fill="suitDark" />
        <ellipse cx="31" cy="161" rx="4.4" ry="5.2" fill="#e3b28a" />
        <ellipse cx="89" cy="161" rx="4.4" ry="5.2" fill="#e3b28a" />
        <path d="M31 100 C31 92 40 87 51 87 L60 112 L69 87 C80 87 89 92 89 100 L86.5 140 C85.5 150 85.5 160 87.5 172 L66 174 L60 130 L54 174 L32.5 172 C34.5 160 34.5 150 33.5 140 Z" :fill="suit" />
        <path d="M51 88 L60 112 L69 88 Z" fill="#fbf8f2" />
        <path v-if="groom.tie === 'bow'" d="M52 89.5 L59.4 93 L52 96.5 Z M68 89.5 L60.6 93 L68 96.5 Z" fill="#101116" />
        <path v-else-if="groom.tie === 'long'" d="M58 90 L60 128 L62 90 Z" fill="#c9a552" />
        <circle cx="47" cy="100" r="3.8" :fill="bouton" />
        <rect x="54" y="76" width="12" height="13" rx="4" fill="#d6a378" />
        <circle cx="60" cy="54" r="27" fill="#ebbf95" />
        <!-- Hair variants -->
        <g v-if="groom.hairStyle === 'short'" :fill="hair">
          <ellipse cx="60" cy="36" rx="26" ry="16" />
        </g>
        <g v-else-if="groom.hairStyle === 'undercut'" :fill="hair">
          <path d="M38 48 L42 28 L60 20 L78 28 L82 48 L60 40 Z" />
        </g>
        <g v-else-if="groom.hairStyle === 'wavy'" :fill="hair">
          <path d="M34 50 C36 28 50 18 60 18 C74 18 86 30 86 50 C78 40 42 40 34 50 Z" />
        </g>
        <g v-else :fill="hair">
          <circle cx="35" cy="47" r="8.5" />
          <circle cx="40" cy="36" r="10" />
          <circle cx="50" cy="28.5" r="11" />
          <circle cx="62" cy="26" r="11.5" />
          <circle cx="74" cy="30" r="10.5" />
          <circle cx="83" cy="39" r="9.5" />
          <circle cx="86" cy="49" r="7" />
        </g>
        <g class="eyes">
          <ellipse cx="50" cy="57.5" rx="3.2" ry="3.8" fill="#2a1d15" />
          <ellipse cx="70" cy="57.5" rx="3.2" ry="3.8" fill="#2a1d15" />
        </g>
        <path v-if="groom.beard === 'short'" d="M48 68 Q60 82 72 68" :stroke="hair" stroke-width="4" fill="none" />
        <path v-else-if="groom.beard === 'full'" d="M46 64 L60 88 L74 64 Q60 72 46 64" :fill="hair" />
        <path v-else-if="groom.beard === 'mustache'" d="M52 66 Q60 62 68 66" :stroke="hair" stroke-width="2.5" fill="none" />
        <path v-else d="M52.5 67.5 Q60 75 67.5 67.5" stroke="#8a4a33" stroke-width="2.2" stroke-linecap="round" fill="none" />
      </g>
    </svg>

    <svg class="figure figure-bride" viewBox="0 0 120 220" fill="none">
      <ellipse class="ground" cx="60" cy="212" rx="40" ry="5" fill="#3a2a18" opacity="0.14" />
      <g class="walker">
        <path
          class="veil"
          d="M37 38 C17 92 13 160 19 211 L101 211 C107 160 103 92 83 38 Z"
          :fill="dress"
          :opacity="veilOpacity"
        />
        <g class="dress">
          <path :d="dressPath" :fill="dress" />
        </g>
        <path v-if="bride.sleeves === 'long'" d="M40 95 L24 150 L36 152 L48 100 Z" :fill="dress" />
        <path v-if="bride.sleeves === 'long'" d="M80 95 L96 150 L84 152 L72 100 Z" :fill="dress" />
        <path d="M29 70 C27 97 34 121 44 131 L76 131 C86 121 93 97 91 70 C84 57 36 57 29 70 Z" fill="#fbf8f2" />
        <path d="M42 128 Q60 134 78 128" :stroke="gold" stroke-width="3" stroke-linecap="round" fill="none" />
        <ellipse cx="60" cy="52" rx="28.5" ry="31" :fill="dress" />
        <rect x="40" y="45" width="40" height="16" rx="8" fill="#ebbf95" />
        <g class="eyes">
          <ellipse cx="50" cy="53.5" rx="3.1" ry="3.6" fill="#2a1d15" />
          <ellipse cx="70" cy="53.5" rx="3.1" ry="3.6" fill="#2a1d15" />
        </g>
        <path
          v-if="bride.veil === 'full'"
          d="M37 60 Q60 64.5 83 60 C83 77 73 89 60 91 C47 89 37 77 37 60 Z"
          :fill="dress"
          stroke="#ece4d6"
          stroke-width="1.2"
        />
        <circle cx="54" cy="135" r="6.5" :fill="bouquet" />
        <circle cx="66" cy="134" r="6" fill="#fff2ee" />
        <circle cx="60" cy="128" r="6" :fill="bouquet" />
        <circle cx="54" cy="135" r="2.5" :fill="gold" />
      </g>
    </svg>

    <div class="hearts">
      <span v-for="n in 6" :key="n" :style="{ '--h': n }">
        <svg viewBox="0 0 24 22"><path d="M12 21 C5 15 1 11.5 1 7 A5.5 5.5 0 0 1 12 4.5 A5.5 5.5 0 0 1 23 7 C23 11.5 19 15 12 21 Z" /></svg>
      </span>
    </div>
  </div>
</template>
