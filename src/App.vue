<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { formatCoupleNames, formatGreeting, guestDisplayName, weddingConfig } from './config/wedding.js'
import { weddingStartEnd } from './utils/calendar.js'
import { decryptGuestToken, readGuestParam } from './crypto/guestPayload.js'
import EnvelopeGate from './components/EnvelopeGate.vue'
import InvitationCard from './components/InvitationCard.vue'
import StageCanvas from './components/StageCanvas.vue'

const guest = ref(null)
const language = ref('ar')
const designNumber = ref(weddingConfig.defaultDesignNumber || 1)
const revealed = ref(false)
const stage = ref(null)
// 'loading' until the WebGL stage has drawn its envelope, then 'ready' or 'unavailable'.
const stageState = ref('loading')
const sceneColors = {
  gold: '#e0c07a',
  light: '#fff6e8',
  blush: '#d4a0a6',
  petal: '#f3e3d3',
  leaf: '#8fa382',
}
const preferReducedMotion = ref(
  typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)

const wording = computed(() => weddingConfig.wording[language.value] || weddingConfig.wording.en)
const dir = computed(() => (language.value === 'ar' ? 'rtl' : 'ltr'))

/** Everything the 3D envelope and its folded letter write on their paper. */
const envelopeText = computed(() => {
  const ar = language.value === 'ar'
  const couple = formatCoupleNames(language.value)
  const first = (name) => name.split(' ')[0]
  return {
    rtl: ar,
    initials: 'W&A',
    // The envelope's front
    guest: guestDisplayName(guest.value, language.value),
    to: ar ? 'إلى' : 'To',
    cta: wording.value.openLetter,
    // The folded letter's inside, a likeness of the page's card
    verse: weddingConfig.verse.text,
    groom: couple.groom,
    bride: couple.bride,
    and: ar ? couple.and : '&',
    greeting: formatGreeting(guest.value, language.value),
    date: letterDate(language.value),
    venue: weddingConfig.venueName[language.value],
    signature: `${first(couple.groom)}${ar ? ' و' : ' & '}${first(couple.bride)}`,
  }
})

onMounted(async () => {
  const token = readGuestParam()
  if (token) {
    const payload = await decryptGuestToken(token)
    if (payload) {
      guest.value = payload
      language.value = payload.preferredLanguage
      designNumber.value = payload.designNumber
    }
  }
  document.documentElement.lang = language.value
  document.documentElement.dir = dir.value
})

watch(language, (lang) => {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
})

function letterDate(lang) {
  const { start } = weddingStartEnd()
  const opts = { timeZone: weddingConfig.timezone, day: 'numeric', month: 'long', year: 'numeric' }
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', opts).format(start)
}

function toggleLanguage() {
  language.value = language.value === 'ar' ? 'en' : 'ar'
}

function onOpening() {
  if (stageState.value !== 'ready') return
  // The scene reports when its letter has reached the page's letter.
  const ms = stage.value?.openEnvelope() ?? 0
  window.setTimeout(onOpened, ms)
}

function onOpened() {
  revealed.value = true
}
</script>

<template>
  <div class="page" :dir="dir">
    <div class="ambiance" aria-hidden="true">
      <span class="glow g1" />
      <span class="glow g2" />
      <span class="glow g3" />
    </div>
    <StageCanvas
      ref="stage"
      :colors="sceneColors"
      :envelope-text="envelopeText"
      :prefer-reduced-motion="preferReducedMotion"
      @ready="stageState = 'ready'"
      @unavailable="stageState = 'unavailable'"
    />

    <div class="shell">
      <div class="toolbar">
        <button type="button" class="btn ghost" @click="toggleLanguage">
          {{ wording.languageToggle }}
        </button>
      </div>

      <EnvelopeGate
        v-if="!revealed"
        :open-label="wording.openEnvelope"
        :language="language"
        :prefer-reduced-motion="preferReducedMotion"
        :stage="stageState"
        @opening="onOpening"
        @opened="onOpened"
      />

      <InvitationCard
        v-else
        :language="language"
        :design-number="designNumber"
        :guest="guest"
        :handoff="stageState === 'ready' && !preferReducedMotion"
      />
    </div>
  </div>
</template>
