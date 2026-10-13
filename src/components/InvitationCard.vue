<script setup>
import { computed } from 'vue'
import { formatCoupleNames, formatGreeting, weddingConfig } from '../config/wedding.js'
import CountdownBlock from './CountdownBlock.vue'
import CoupleFigures from './CoupleFigures.vue'
import { buildGoogleCalendarUrl, downloadIcs } from '../utils/calendar.js'

const props = defineProps({
  language: { type: String, required: true },
  designNumber: { type: Number, required: true },
  guest: { type: Object, default: null },
})

const t = computed(() => weddingConfig.wording[props.language] || weddingConfig.wording.en)
const couple = computed(() => formatCoupleNames(props.language))
const venueName = computed(() => weddingConfig.venueName[props.language])
const venueAddress = computed(() => weddingConfig.venueAddress[props.language])
const greeting = computed(() => formatGreeting(props.guest, props.language))
const googleUrl = computed(() => buildGoogleCalendarUrl(props.language))
const designClass = computed(() => `invite-card design-${props.designNumber} reveal`)

function onIcs() {
  downloadIcs(props.language)
}

const dateLabel = computed(() => {
  if (props.language === 'ar') return '١١/١١/٢٠٢٦ · ٦:٠٠ م'
  return '11/11/2026 · 6:00 PM'
})
</script>

<template>
  <article :class="designClass">
    <div class="shine" aria-hidden="true" />
    <div class="shine shine-delay" aria-hidden="true" />
    <div class="soft-bloom" aria-hidden="true" />
    <div class="soft-bloom bloom-2" aria-hidden="true" />

    <div class="card-sparkles" aria-hidden="true">
      <span v-for="n in 18" :key="`s-${n}`" :style="{ '--s': n }" />
    </div>
    <div class="confetti" aria-hidden="true">
      <i v-for="n in 16" :key="`c-${n}`" :style="{ '--c': n }" />
    </div>
    <div class="orbit-ring" aria-hidden="true">
      <span /><span /><span />
    </div>

    <div class="card-frame" aria-hidden="true">
      <span class="corner tl" />
      <span class="corner tr" />
      <span class="corner bl" />
      <span class="corner br" />
    </div>

    <div class="invite-content">
      <svg class="motif motif-top anim d1" viewBox="0 0 240 48" aria-hidden="true">
        <path class="motif-path" d="M20 34 C50 8 80 8 120 34 C160 8 190 8 220 34" fill="none" stroke="currentColor" stroke-width="1.5" />
        <path class="motif-leaf" d="M120 18 C112 28 112 34 120 40 C128 34 128 28 120 18" fill="currentColor" opacity="0.85" />
        <circle class="motif-dot" cx="72" cy="24" r="2.2" fill="currentColor" />
        <circle class="motif-dot delay" cx="168" cy="24" r="2.2" fill="currentColor" />
      </svg>

      <p class="heading anim d2">{{ t.heading }}</p>

      <div class="names anim d3">
        <CoupleFigures />
        <div class="name-halo" aria-hidden="true" />
        <h1 class="groom name-rise">{{ couple.groom }}</h1>
        <p class="ampersand amp-pulse">{{ couple.and }}</p>
        <h1 class="bride name-rise delay">{{ couple.bride }}</h1>
      </div>

      <div class="ornament anim d4" aria-hidden="true">
        <span /><i /><span />
      </div>

      <p v-if="greeting" class="greeting anim d5">{{ greeting }}</p>
      <p class="message anim d6">{{ t.message }}</p>
      <p class="meta date-line anim d7">
        <span class="date-chip">{{ dateLabel }}</span>
      </p>

      <CountdownBlock
        class="anim d8"
        :labels="t.countdownLabels"
        :title="t.countdownTitle"
        :wedding-day-message="t.weddingDay"
        :after-message="t.afterEvent"
      />

      <div class="venue-block anim d9">
        <h2 class="heading">{{ t.venueHeading }}</h2>
        <p class="meta venue-name">{{ venueName }}</p>
        <p class="meta">{{ venueAddress }}</p>
      </div>

      <div class="btn-row anim d10">
        <a class="btn btn-primary pulse-btn" :href="weddingConfig.mapsUrl" target="_blank" rel="noopener noreferrer">
          {{ t.directions }}
        </a>
        <a class="btn" :href="googleUrl" target="_blank" rel="noopener noreferrer">
          {{ t.addGoogle }}
        </a>
        <button type="button" class="btn" @click="onIcs">{{ t.downloadIcs }}</button>
      </div>
    </div>
  </article>
</template>
