<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  engine: { type: Object, default: null }
})

const canvasRef = ref(null)
const containerRef = ref(null)
let resizeObserver = null

function getCanvasCoords(event) {
  if (!canvasRef.value) return { x: 0, y: 0 }
  const rect = canvasRef.value.getBoundingClientRect()
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

function onPointerDown(e) {
  if (!props.engine) return
  if (e.type === 'touchstart') {
    e.preventDefault()
  }
  const pos = getCanvasCoords(e)
  props.engine.handlePointerDown(pos.x, pos.y)
}

function onPointerMove(e) {
  if (!props.engine) return
  if (e.type === 'touchmove') {
    e.preventDefault()
  }
  const pos = getCanvasCoords(e)
  props.engine.handlePointerMove(pos.x, pos.y)
}

function onPointerUp(e) {
  if (!props.engine) return
  if (e.type === 'touchend') {
    e.preventDefault()
  }
  const pos = getCanvasCoords(e.changedTouches ? e.changedTouches[0] : e)
  props.engine.handlePointerUp(pos.x, pos.y)
}

function handleResize() {
  if (props.engine) {
    props.engine.updateSize()
  }
}

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(containerRef.value)
  }
  window.addEventListener('resize', handleResize)
  window.addEventListener('orientationchange', handleResize)
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('orientationchange', handleResize)
})

defineExpose({
  getCanvas: () => canvasRef.value
})
</script>

<template>
  <div ref="containerRef" class="canvas-wrapper">
    <canvas
      ref="canvasRef"
      class="game-canvas"
      @mousedown="onPointerDown"
      @mousemove="onPointerMove"
      @mouseup="onPointerUp"
      @touchstart="onPointerDown"
      @touchmove="onPointerMove"
      @touchend="onPointerUp"
      @contextmenu.prevent
    ></canvas>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
}

.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  background-color: var(--bg-primario);
}
</style>
