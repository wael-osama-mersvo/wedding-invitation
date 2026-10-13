<script setup>
import { ref, computed } from 'vue'
import { formatCoupleNames, weddingConfig } from '../config/wedding.js'

const props = defineProps({
  openLabel: { type: String, required: true },
  tapHint: { type: String, default: '' },
  language: { type: String, default: 'ar' },
  preferReducedMotion: { type: Boolean, default: false },
})

const emit = defineEmits(['opened'])
const opened = ref(false)
const couple = computed(() => formatCoupleNames(props.language))
const initials = computed(() => {
  const groom = (weddingConfig.groomName?.en || 'W').trim().charAt(0).toUpperCase()
  const bride = (weddingConfig.brideName?.en || 'A').trim().charAt(0).toUpperCase()
  return { groom, bride }
})

const rootClass = computed(() => [
  'envelope-stage',
  opened.value ? 'is-open' : '',
  props.preferReducedMotion ? 'reduce-motion' : '',
].filter(Boolean).join(' '))

function open() {
  if (opened.value) return
  opened.value = true
  const delay = props.preferReducedMotion ? 0 : 2200
  window.setTimeout(() => emit('opened'), delay)
}
</script>

<template>
  <div :class="rootClass">
    <div class="float-petals" aria-hidden="true">
      <span v-for="n in 12" :key="n" :style="{ '--i': n }" />
    </div>

    <!-- Burst confetti fires as the envelope opens and the card rises -->
    <div v-if="opened && !preferReducedMotion" class="open-confetti" aria-hidden="true">
      <i
        v-for="n in 40"
        :key="n"
        :style="{
          '--tx': `${Math.cos((n / 40) * Math.PI * 2) * (110 + (n % 7) * 18)}px`,
          '--ty': `${Math.sin((n / 40) * Math.PI * 2) * (85 + (n % 5) * 16) - 30}px`,
          '--rot': `${n * 42}deg`,
          '--delay': `${0.35 + (n % 10) * 0.05}s`,
        }"
      />
    </div>

    <button type="button" class="envelope-hit" :aria-label="openLabel" @click="open">
      <div class="envelope">
        <div class="env-layer env-back" />

        <div class="env-layer env-card">
          <p class="card-line">{{ couple.groom }}</p>
          <p class="card-amp">&amp;</p>
          <p class="card-line">{{ couple.bride }}</p>
        </div>

        <div class="env-layer env-front" />
        <div class="env-layer env-pocket" />

        <div class="env-layer env-flap">
          <div class="flap-face" />
        </div>

        <div class="mono-badge" aria-hidden="true">
          <span>{{ initials.groom }}</span>
          <small>&amp;</small>
          <span>{{ initials.bride }}</span>
        </div>
      </div>
    </button>

    <p class="env-hint">{{ tapHint || openLabel }}</p>
    <button type="button" class="btn btn-primary env-cta" @click="open">
      {{ openLabel }}
    </button>
  </div>
</template>
