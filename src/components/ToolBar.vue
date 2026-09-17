<script setup>
import { computed } from 'vue'
import { useLingua } from '../composables/useLingua'

const props = defineProps({
  stats: { type: Object, required: true },
  gameState: { type: String, required: true },
  gameSpeed: { type: Number, default: 1 }
})

const emit = defineEmits(['toggle-pause', 'set-speed', 'restart-level', 'clear-cables'])

const { t } = useLingua()

const isPaused = computed(() => props.gameState === 'paused')
</script>

<template>
  <div class="bottom-toolbar-container">
    <!-- Barra Suggerimenti / Stato Nodo Selezionato -->
    <div class="banner-suggerimento" :class="{ attivo: !!stats.selectedNode }">
      <div v-if="stats.selectedNode" class="testo-suggerimento">
        <span class="pulse-icon">⚡</span>
        <span>{{ t('toolbar.nodoSelezionato') }} <strong>{{ stats.selectedNode }}</strong>. {{ t('toolbar.toccaAltroNodo') }}</span>
      </div>
      <div v-else class="testo-suggerimento standard">
        <span>{{ t('toolbar.istruzioneStandard') }}</span>
      </div>
    </div>

    <!-- Barra comandi principale -->
    <div class="dock-comandi">
      <!-- Cavi installati su limite -->
      <div class="badge-cavi" :class="{ limite: stats.cablesCount >= stats.maxCables }">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="12" r="3"></circle>
          <line x1="9" y1="12" x2="15" y2="12"></line>
        </svg>
        <span>{{ t('toolbar.fibra') }}: <strong>{{ stats.cablesCount }}</strong> / {{ stats.maxCables }}</span>
      </div>

      <div class="separatore"></div>

      <!-- Play / Pausa -->
      <button
        type="button"
        class="btn-azione primario"
        :class="{ attivo: isPaused }"
        :title="isPaused ? t('toolbar.riprendiSpazio') : t('toolbar.pausaSpazio')"
        @click="emit('toggle-pause')"
      >
        <svg v-if="isPaused" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <span class="testo-btn">{{ isPaused ? t('toolbar.riprendi') : t('toolbar.pausa') }}</span>
      </button>

      <!-- Controllo Velocità 1x / 2x -->
      <button
        type="button"
        class="btn-azione"
        :class="{ attivo: gameSpeed === 2 }"
        :title="t('toolbar.velocita')"
        @click="emit('set-speed', gameSpeed === 1 ? 2 : 1)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="13 19 22 12 13 5 13 19"></polygon>
          <polygon points="2 19 11 12 2 5 2 19"></polygon>
        </svg>
        <span>{{ gameSpeed }}x</span>
      </button>

      <!-- Riavvia livello -->
      <button
        type="button"
        class="btn-azione"
        :title="t('toolbar.riavvia')"
        @click="emit('restart-level')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"></polyline>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
        </svg>
      </button>

      <!-- Rimuovi tutti i cavi -->
      <button
        type="button"
        class="btn-azione distruttivo"
        :disabled="stats.cablesCount === 0"
        :title="t('toolbar.rimuoviTutti')"
        @click="emit('clear-cables')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.bottom-toolbar-container {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  z-index: 25;
  pointer-events: none;
  max-width: 95vw;
}

.banner-suggerimento {
  background: rgba(25, 26, 32, 0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--bordo-sottile);
  border-radius: 9999px;
  padding: 0.35rem 1rem;
  font-size: 0.78rem;
  color: var(--testo-secondario);
  transition: all 0.25s ease;
  pointer-events: auto;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}

.banner-suggerimento.attivo {
  background: rgba(249, 115, 22, 0.15);
  border-color: var(--accento-bordo);
  color: var(--accento-testo);
}

.testo-suggerimento {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
}

.testo-suggerimento strong {
  color: var(--testo-primario);
}

.pulse-icon {
  animation: pulse-mini 1s infinite alternate;
}

@keyframes pulse-mini {
  from { transform: scale(1); }
  to { transform: scale(1.25); }
}

.dock-comandi {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(25, 26, 32, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--bordo-medio);
  border-radius: 14px;
  padding: 0.45rem 0.65rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  pointer-events: auto;
}

.badge-cavi {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-family: var(--font-mono);
  color: var(--testo-secondario);
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}

.badge-cavi.limite {
  color: var(--rosso-ddos);
  background: var(--rosso-sfondo);
}

.separatore {
  width: 1px;
  height: 22px;
  background: var(--bordo-sottile);
}

.btn-azione {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  background: var(--bg-superficie-elevata);
  border: 1px solid var(--bordo-sottile);
  color: var(--testo-primario);
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.18s ease;
  min-height: 38px;
}

.btn-azione:hover {
  background: var(--bg-superficie-hover);
  border-color: var(--bordo-forte);
}

.btn-azione.attivo {
  background: var(--accento);
  color: #ffffff;
  border-color: var(--accento-hover);
}

.btn-azione.primario {
  background: var(--accento-sfondo);
  border-color: var(--accento-bordo);
  color: var(--accento-testo);
}

.btn-azione.primario:hover {
  background: var(--accento);
  color: #ffffff;
}

.btn-azione.distruttivo:hover:not(:disabled) {
  background: var(--rosso-sfondo);
  border-color: var(--rosso-bordo);
  color: var(--rosso-ddos);
}

.btn-azione:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Responsiveness */
@media (max-width: 640px) {
  .bottom-toolbar-container {
    bottom: 0.85rem;
    width: 95%;
  }
  .banner-suggerimento {
    display: none; /* Risparmia spazio verticale su schermi piccoli */
  }
  .dock-comandi {
    width: 100%;
    justify-content: space-around;
    padding: 0.35rem 0.45rem;
  }
  .badge-cavi {
    padding: 0.25rem 0.45rem;
    font-size: 0.74rem;
  }
  .btn-azione {
    padding: 0.4rem 0.6rem;
  }
  .testo-btn {
    display: none;
  }
}
</style>
