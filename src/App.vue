<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { weddingConfig } from './config/wedding.js'
import { decryptGuestToken, readGuestParam } from './crypto/guestPayload.js'
import EnvelopeGate from './components/EnvelopeGate.vue'
import InvitationCard from './components/InvitationCard.vue'

const guest = ref(null)
const language = ref('en')
const designNumber = ref(weddingConfig.defaultDesignNumber || 1)
const revealed = ref(false)
const preferReducedMotion = ref(
  typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)

const wording = computed(() => weddingConfig.wording[language.value] || weddingConfig.wording.en)
const dir = computed(() => (language.value === 'ar' ? 'rtl' : 'ltr'))

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

function toggleLanguage() {
  language.value = language.value === 'ar' ? 'en' : 'ar'
}

function onOpened() {
  revealed.value = true
}
</script>

<template>
  <div class="page" :class="`theme-${designNumber}`" :dir="dir">
    <div class="ambiance" aria-hidden="true">
      <span class="glow g1" />
      <span class="glow g2" />
      <span class="glow g3" />
    </div>

    <div class="shell">
      <div class="toolbar">
        <button type="button" class="btn ghost" @click="toggleLanguage">
          {{ wording.languageToggle }}
        </button>
      </div>

      <EnvelopeGate
        v-if="!revealed"
        :open-label="wording.openEnvelope"
        :tap-hint="wording.tapToOpen"
        :language="language"
        :prefer-reduced-motion="preferReducedMotion"
        @opened="onOpened"
      />

      <InvitationCard
        v-else
        :language="language"
        :design-number="designNumber"
        :guest="guest"
      />
    </div>
  </div>
</template>