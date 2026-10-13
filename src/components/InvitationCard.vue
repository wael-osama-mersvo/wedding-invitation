<script setup>
import { computed } from 'vue'
import { formatCoupleNames, formatGreeting, weddingConfig } from '../config/wedding.js'
import CountdownBlock from './CountdownBlock.vue'
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
  if (props.language === 'ar') return 'الأربعاء ١١ نوفمبر ٢٠٢٦ · ٦:٠٠ م'
  return 'Wednesday, 11 November 2026 · 6:00 PM'
})
</script>

<template>
  <article :class="designClass">
    <div class="shine" aria-hidden="true" />
    <div class="card-frame" aria-hidden="true">
      <span class="corner tl" />
      <span class="corner tr" />
      <span class="corner bl" />
      <span class="corner br" />
    </div>

    <svg class="motif motif-top" viewBox="0 0 240 48" aria-hidden="true">
      <path d="M20 34 C50 8 80 8 120 34 C160 8 190 8 220 34" fill="none" stroke="currentColor" stroke-width="1.5" />
      <path d="M120 18 C112 28 112 34 120 40 C128 34 128 28 120 18" fill="currentColor" opacity="0.85" />
      <circle cx="72" cy="24" r="2.2" fill="currentColor" />
      <circle cx="168" cy="24" r="2.2" fill="currentColor" />
    </svg>

    <p class="heading anim d1">{{ t.heading }}</p>

    <div class="names anim d2">
      <h1 class="groom">{{ couple.groom }}</h1>
      <p class="ampersand">{{ couple.and }}</p>
      <h1 class="bride">{{ couple.bride }}</h1>
    </div>

    <div class="ornament anim d3" aria-hidden="true">
      <span /><i /><span />
    </div>

    <p v-if="greeting" class="greeting anim d4">{{ greeting }}</p>
    <p class="message anim d5">{{ t.message }}</p>
    <p class="meta date-line anim d6">{{ dateLabel }}</p>

    <CountdownBlock
      class="anim d7"
      :labels="t.countdownLabels"
      :title="t.countdownTitle"
      :wedding-day-message="t.weddingDay"
      :after-message="t.afterEvent"
    />

    <div class="venue-block anim d8">
      <h2 class="heading">{{ t.venueHeading }}</h2>
      <p class="meta venue-name">{{ venueName }}</p>
      <p class="meta">{{ venueAddress }}</p>
    </div>

    <div class="btn-row anim d9">
      <a class="btn btn-primary" :href="weddingConfig.mapsUrl" target="_blank" rel="noopener noreferrer">
        {{ t.directions }}
      </a>
      <a class="btn" :href="googleUrl" target="_blank" rel="noopener noreferrer">
        {{ t.addGoogle }}
      </a>
      <button type="button" class="btn" @click="onIcs">{{ t.downloadIcs }}</button>
    </div>
  </article>
</template>