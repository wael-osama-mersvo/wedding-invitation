<script setup>
import { computed } from 'vue'
import { formatCoupleNames, formatGreeting, weddingConfig } from '../config/wedding.js'
import CountdownBlock from './CountdownBlock.vue'
import CoupleFigures from './CoupleFigures.vue'
import WaxSeal from './WaxSeal.vue'
import { buildGoogleCalendarUrl, downloadIcs, weddingStartEnd } from '../utils/calendar.js'

const props = defineProps({
  language: { type: String, required: true },
  designNumber: { type: Number, required: true },
  guest: { type: Object, default: null },
  // Shown in place of the 3D letter that just unfolded: fade in where it is, no entrance.
  handoff: { type: Boolean, default: false },
})

const t = computed(() => weddingConfig.wording[props.language] || weddingConfig.wording.en)
const couple = computed(() => formatCoupleNames(props.language))
const venueName = computed(() => weddingConfig.venueName[props.language])
const venueAddress = computed(() => weddingConfig.venueAddress[props.language])
const greeting = computed(() => formatGreeting(props.guest, props.language))
const googleUrl = computed(() => buildGoogleCalendarUrl(props.language))
const designClass = computed(() => [
  `invite-card letter design-${props.designNumber} reveal`,
  props.handoff ? 'handoff' : '',
].join(' '))
const verse = weddingConfig.verse

function onIcs() {
  downloadIcs(props.language)
}

// Date lines in the wedding's own time zone, in the reader's language and digits.
const dates = computed(() => {
  const { start } = weddingStartEnd()
  const locale = props.language === 'ar' ? 'ar-EG' : 'en-GB'
  const fmt = (options, loc = locale) =>
    new Intl.DateTimeFormat(loc, { timeZone: weddingConfig.timezone, ...options }).format(start)
  return {
    day: fmt({ day: 'numeric', month: 'long', year: 'numeric' }),
    weekday: fmt({ weekday: 'long' }),
    time: fmt({ hour: 'numeric', minute: '2-digit' }, props.language === 'ar' ? 'ar-EG' : 'en-US'),
  }
})

const signature = computed(() => {
  const first = (name) => name.split(' ')[0]
  const joiner = props.language === 'ar' ? ' و' : ' & '
  return `${first(couple.value.groom)}${joiner}${first(couple.value.bride)}`
})
</script>

<template>
  <article :class="designClass">
    <!-- Rough ink edge for the handwritten signature -->
    <svg class="ink-defs" aria-hidden="true" focusable="false">
      <filter id="ink-rough" x="-5%" y="-20%" width="110%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="grain" />
        <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.6" />
      </filter>
    </svg>
    <!-- Gold double rule with filigree corners -->
    <div class="letter-frame" aria-hidden="true">
      <svg v-for="corner in ['tl', 'tr', 'bl', 'br']" :key="corner" :class="['filigree', corner]" viewBox="0 0 64 64">
        <path d="M3 61 V22 C3 11 11 3 22 3 H61" />
        <path d="M9 50 C9 27 27 9 50 9" />
        <path d="M17 33 C17 24 24 17 33 17 C38 17 40 21 37.5 23.5 C35 26 31.5 24 33 21.5" />
        <path d="M24 46 C27 41 29 36 28 31 M46 24 C41 27 36 29 31 28" />
        <ellipse cx="22" cy="49" rx="2.4" ry="5" transform="rotate(25 22 49)" />
        <ellipse cx="49" cy="22" rx="2.4" ry="5" transform="rotate(65 49 22)" />
        <circle cx="12" cy="12" r="2.4" />
      </svg>
    </div>

    <div class="invite-content letter-body">
      <figure class="letter-verse anim d1">
        <blockquote lang="ar" dir="rtl">
          <span class="verse-mark">﴿</span>{{ verse.text }}<span class="verse-mark">﴾</span>
        </blockquote>
        <figcaption>{{ verse.source[language] || verse.source.ar }}</figcaption>
      </figure>

      <div class="letter-grid">
        <section class="letter-main">
          <p class="heading anim d2">{{ t.heading }}</p>
          <div class="names anim d3">
            <CoupleFigures />
            <h1 class="groom engraved">{{ couple.groom }}</h1>
            <p class="ampersand engraved">{{ couple.and }}</p>
            <h1 class="bride engraved">{{ couple.bride }}</h1>
          </div>
          <p v-if="greeting" class="greeting anim d4"><span class="engraved">{{ greeting }}</span></p>
          <p class="message anim d5">{{ t.message }}</p>
        </section>

        <span class="letter-rule" aria-hidden="true" />

        <section class="letter-details">
          <div class="detail-pair anim d6">
            <div class="detail">
              <h2 class="heading">{{ t.whenHeading }}</h2>
              <p class="detail-big">{{ dates.day }}</p>
              <p class="meta">{{ dates.weekday }} · {{ dates.time }}</p>
            </div>
            <div class="detail">
              <h2 class="heading">{{ t.venueHeading }}</h2>
              <p class="detail-big">{{ venueName }}</p>
              <p class="meta">{{ venueAddress }}</p>
            </div>
          </div>

          <CountdownBlock
            class="anim d7"
            :labels="t.countdownLabels"
            :title="t.countdownTitle"
            :wedding-day-message="t.weddingDay"
            :after-message="t.afterEvent"
            :language="language"
          />

          <div class="btn-row anim d8">
            <a class="btn btn-primary" :href="weddingConfig.mapsUrl" target="_blank" rel="noopener noreferrer">
              {{ t.directions }}
            </a>
            <a class="btn" :href="googleUrl" target="_blank" rel="noopener noreferrer">
              {{ t.addGoogle }}
            </a>
            <button type="button" class="btn" @click="onIcs">{{ t.downloadIcs }}</button>
          </div>
        </section>
      </div>

      <footer class="letter-sign anim d9">
        <div class="signature">
          <p class="sign-off">{{ t.signOff }}</p>
          <p class="sign-names"><span class="ink">{{ signature }}</span></p>
        </div>
        <WaxSeal class="letter-seal" />
      </footer>
    </div>
  </article>
</template>
