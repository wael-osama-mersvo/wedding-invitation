<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  colors: { type: Object, required: true },
  envelopeText: { type: Object, required: true },
  preferReducedMotion: { type: Boolean, default: false },
})

const emit = defineEmits(['ready', 'unavailable'])
const canvas = ref(null)
const live = ref(false)
let stage = null
let unmounted = false

function webglAvailable() {
  try {
    const probe = document.createElement('canvas')
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'))
  } catch {
    return false
  }
}

onMounted(async () => {
  // jsdom and old devices have no WebGL: the gate shows a plain button instead.
  if (!webglAvailable()) {
    emit('unavailable')
    return
  }
  try {
    const { createWeddingScene } = await import('../three/weddingScene.js')
    if (unmounted) return
    const created = await createWeddingScene(canvas.value, {
      colors: props.colors,
      text: props.envelopeText,
      anchor: () => document.querySelector('.envelope'),
      reducedMotion: props.preferReducedMotion,
    })
    if (unmounted) {
      created.dispose()
      return
    }
    stage = created
    live.value = true
    emit('ready')
  } catch (err) {
    console.warn('[invitation] WebGL scene unavailable', err)
    emit('unavailable')
  }
})

watch(() => props.envelopeText, (next) => stage?.setText(next), { deep: true })

onBeforeUnmount(() => {
  unmounted = true
  stage?.dispose()
})

defineExpose({
  openEnvelope: () => stage?.openEnvelope() ?? 0,
})
</script>

<template>
  <canvas ref="canvas" class="stage" :class="{ 'is-live': live }" aria-hidden="true" />
</template>
