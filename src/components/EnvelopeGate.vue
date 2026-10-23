<script setup>
import { computed, ref } from 'vue'
import { weddingConfig } from '../config/wedding.js'

const props = defineProps({
  openLabel: { type: String, required: true },
  language: { type: String, default: 'ar' },
  preferReducedMotion: { type: Boolean, default: false },
  // 'loading' | 'ready' | 'unavailable': the WebGL stage draws the envelope over the
  // .envelope box once ready; the box stays the click target either way.
  stage: { type: String, default: 'loading' },
})

const emit = defineEmits(['opening', 'opened'])
const opened = ref(false)
const verse = weddingConfig.verse
const verseWords = verse.text.split(' ')
const rootClass = computed(() => ['envelope-stage', opened.value ? 'is-open' : ''])

function open() {
  if (opened.value) return
  opened.value = true
  emit('opening')
  // With the 3D envelope, App opens the page when the scene says the letter is in place.
  if (props.stage === 'ready') return
  window.setTimeout(() => emit('opened'), props.preferReducedMotion ? 0 : 600)
}
</script>

<template>
  <div :class="rootClass">
    <figure class="gate-verse">
      <blockquote lang="ar" dir="rtl">
        <span class="verse-mark">﴿</span>
        <template v-for="(word, n) in verseWords" :key="n">
          <span class="w" :style="{ '--i': n }">{{ word }}</span>{{ ' ' }}
        </template>
        <span class="verse-mark">﴾</span>
      </blockquote>
      <figcaption>{{ verse.source[language] || verse.source.ar }}</figcaption>
      <p v-if="language !== 'ar'" class="verse-translation">{{ verse.translation }}</p>
    </figure>

    <button type="button" class="envelope-hit" :aria-label="openLabel" @click="open">
      <div class="envelope">
        <span v-if="stage === 'unavailable'" class="envelope-fallback">{{ openLabel }}</span>
      </div>
      <!-- Tapping hand over the wax seal -->
      <div v-if="stage === 'ready'" class="tap-hint" aria-hidden="true">
        <span class="tap-ripple" />
        <span class="tap-ripple r2" />
        <!-- Pointing hand; the fingertip is at (17.5, 1) -->
        <svg class="tap-hand" viewBox="0 0 44 56">
          <path
            class="hand-fill"
            d="M14 25 V4.5 A3.5 3.5 0 0 1 21 4.5 V19.5 A3.25 3.25 0 0 1 27.5 19.5 V21.5 A3.25 3.25 0 0 1 34 21.5 V24 A2.75 2.75 0 0 1 39.5 24 V36 C39.5 46 34 53 25 53 H21.5 C16 53 12.5 50 9.5 45 L4.2 35.5 A3 3 0 0 1 9.4 32.4 L14 38 Z"
          />
          <path class="hand-lines" d="M21 19.5 V27 M27.5 21.5 V28 M34 24 V29" />
        </svg>
      </div>
    </button>
  </div>
</template>
