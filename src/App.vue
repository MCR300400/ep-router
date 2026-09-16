<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { LEVELS } from './game/levels.js'
import { RouterGameEngine } from './game/engine.js'
import { toggleAudio, isAudioMuted, playUiClick } from './audio/sfx.js'
import { tracciaVista, avviaTracciamentoDurata } from './analytics.js'

import TopHud from './components/TopHud.vue'
import GameCanvas from './components/GameCanvas.vue'
import ToolBar from './components/ToolBar.vue'
import LevelCompleteModal from './components/LevelCompleteModal.vue'
import GameOverModal from './components/GameOverModal.vue'
import LevelSelectModal from './components/LevelSelectModal.vue'
import TutorialModal from './components/TutorialModal.vue'

const canvasComponentRef = ref(null)
const engine = ref(null)

const currentLevelIndex = ref(0)
const currentLevel = computed(() => LEVELS[currentLevelIndex.value])
const hasNextLevel = computed(() => currentLevelIndex.value < LEVELS.length - 1)

const isMuted = ref(isAudioMuted())
const showLevelSelect = ref(false)
const showTutorial = ref(false)

const stats = reactive({
  gameState: 'playing',
  gameSpeed: 1,
  score: 0,
  sla: 100,
  deliveredCount: 0,
  cacheHits: 0,
  ddosBlocked: 0,
  droppedPackets: 0,
  ddosHits: 0,
  cablesCount: 0,
  maxCables: 6,
  selectedNode: null,
  averageLatency: 38
})

function onEngineStateChange(newStats) {
  Object.assign(stats, newStats)
}

function handleToggleSound() {
  isMuted.value = toggleAudio()
}

function handleTogglePause() {
  if (engine.value) {
    engine.value.togglePause()
    playUiClick()
  }
}

function handleSetSpeed(speed) {
  if (engine.value) {
    engine.value.setSpeed(speed)
    playUiClick()
  }
}

function handleRestartLevel() {
  if (engine.value) {
    engine.value.loadLevel(currentLevel.value)
    playUiClick()
  }
}

function handleClearCables() {
  if (engine.value) {
    engine.value.clearAllCables()
  }
}

function handleNextLevel() {
  if (hasNextLevel.value) {
    currentLevelIndex.value++
    if (engine.value) {
      engine.value.loadLevel(currentLevel.value)
    }
  }
}

function handleSelectLevel(lvl) {
  const idx = LEVELS.findIndex(l => l.id === lvl.id)
  if (idx !== -1) {
    currentLevelIndex.value = idx
    showLevelSelect.value = false
    if (engine.value) {
      engine.value.loadLevel(currentLevel.value)
    }
    playUiClick()
  }
}

function handleKeyDown(e) {
  if (e.code === 'Space') {
    e.preventDefault()
    handleTogglePause()
  } else if (e.key === 'r' || e.key === 'R') {
    handleRestartLevel()
  } else if (e.key === 'Escape') {
    showLevelSelect.value = false
    showTutorial.value = false
  } else if (e.key === '1') {
    handleSetSpeed(1)
  } else if (e.key === '2') {
    handleSetSpeed(2)
  }
}

onMounted(() => {
  // Telemetria GDPR nativa su Cloudflare
  tracciaVista('/')
  avviaTracciamentoDurata()

  const canvasEl = canvasComponentRef.value.getCanvas()
  if (canvasEl) {
    const eng = new RouterGameEngine(canvasEl, onEngineStateChange)
    engine.value = eng
    eng.loadLevel(currentLevel.value)
    eng.start()
  }

  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  if (engine.value) {
    engine.value.stop()
  }
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="router-app-container">
    <!-- Top HUD -->
    <TopHud
      :level="currentLevel"
      :stats="stats"
      :is-muted="isMuted"
      @toggle-sound="handleToggleSound"
      @open-levels="showLevelSelect = true"
      @open-tutorial="showTutorial = true"
    />

    <!-- Area di Gioco Interattiva Canvas -->
    <main class="main-canvas-area">
      <GameCanvas ref="canvasComponentRef" :engine="engine" />

      <!-- Floating Bottom Dock & Controls -->
      <ToolBar
        :stats="stats"
        :game-state="stats.gameState"
        :game-speed="stats.gameSpeed"
        @toggle-pause="handleTogglePause"
        @set-speed="handleSetSpeed"
        @restart-level="handleRestartLevel"
        @clear-cables="handleClearCables"
      />
    </main>

    <!-- Modal Vittoria Livello -->
    <LevelCompleteModal
      v-if="stats.gameState === 'level_complete'"
      :level="currentLevel"
      :stats="stats"
      :has-next-level="hasNextLevel"
      @next-level="handleNextLevel"
      @replay="handleRestartLevel"
      @open-levels="showLevelSelect = true"
    />

    <!-- Modal Game Over / SLA Breached -->
    <GameOverModal
      v-if="stats.gameState === 'game_over'"
      :level="currentLevel"
      :stats="stats"
      @replay="handleRestartLevel"
      @open-levels="showLevelSelect = true"
    />

    <!-- Modal Selezione Livelli -->
    <LevelSelectModal
      v-if="showLevelSelect"
      :current-level-id="currentLevel.id"
      @select-level="handleSelectLevel"
      @close="showLevelSelect = false"
    />

    <!-- Modal Guida / Tutorial -->
    <TutorialModal
      v-if="showTutorial"
      @close="showTutorial = false"
    />
  </div>
</template>

<style scoped>
.router-app-container {
  width: 100vw;
  height: 100vh;
  height: 100dvh; /* supporto dinamico altezza viewport mobile */
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primario);
  position: relative;
  overflow: hidden;
}

.main-canvas-area {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
