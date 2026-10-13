<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { getCountdownState } from '../utils/countdown.js'

const props = defineProps({
  labels: { type: Object, required: true },
  title: { type: String, default: '' },
  weddingDayMessage: { type: String, required: true },
  afterMessage: { type: String, required: true },
})

const state = ref(getCountdownState())
let timer

onMounted(() => {
  timer = window.setInterval(() => {
    state.value = getCountdownState()
  }, 1000)
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})

const showGrid = computed(() => state.value.phase === 'countdown')
const units = computed(() => [
  { key: 'days', value: state.value.days, label: props.labels.days },
  { key: 'hours', value: state.value.hours, label: props.labels.hours },
  { key: 'minutes', value: state.value.minutes, label: props.labels.minutes },
  { key: 'seconds', value: state.value.seconds, label: props.labels.seconds },
])
</script>

<template>
  <section class="countdown-wrap" aria-live="polite">
    <p v-if="title && showGrid" class="countdown-title">{{ title }}</p>
    <div v-if="showGrid" class="countdown">
      <div v-for="unit in units" :key="unit.key" class="countdown-unit">
        <strong :key="`${unit.key}-${unit.value}`">{{ String(unit.value).padStart(2, '0') }}</strong>
        <small>{{ unit.label }}</small>
      </div>
    </div>
    <p v-else-if="state.phase === 'weddingDay'" class="countdown-message">{{ weddingDayMessage }}</p>
    <p v-else class="countdown-message">{{ afterMessage }}</p>
  </section>
</template>