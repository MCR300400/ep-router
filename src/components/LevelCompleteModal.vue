<script setup>
import { computed } from 'vue'
import { useLingua } from '../composables/useLingua'

const props = defineProps({
  level: { type: Object, required: true },
  stats: { type: Object, required: true },
  hasNextLevel: { type: Boolean, default: true }
})

const emit = defineEmits(['next-level', 'replay', 'open-levels'])

const { t, lingua } = useLingua()

// Calcolo stelle (1-3)
const stars = computed(() => {
  let count = 1
  if (props.stats.sla >= 92) count++
  if (props.stats.averageLatency <= 45 && props.stats.droppedPackets <= 2) count++
  return count
})
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <div class="testata-vittoria">
        <div class="stelle">
          <span v-for="s in 3" :key="s" class="stella" :class="{ attiva: s <= stars }">★</span>
        </div>
        <h2 class="titolo-vittoria">{{ t('complete.titolo') }}</h2>
        <p class="sottotitolo-vittoria">{{ level.title }}</p>
      </div>

      <div class="griglia-statistiche">
        <div class="scheda-stat">
          <span class="label">{{ t('complete.sla') }}</span>
          <span class="valore font-mono" :style="{ color: stats.sla >= 90 ? 'var(--verde-http)' : 'var(--ambra-media)' }">
            {{ stats.sla }}%
          </span>
        </div>

        <div class="scheda-stat">
          <span class="label">{{ t('complete.latenza') }}</span>
          <span class="valore font-mono">{{ stats.averageLatency }} ms</span>
        </div>

        <div class="scheda-stat">
          <span class="label">{{ t('complete.pacchetti') }}</span>
          <span class="valore font-mono">{{ stats.deliveredCount }}</span>
        </div>

        <div v-if="stats.cacheHits > 0" class="scheda-stat">
          <span class="label">{{ t('complete.cache') }}</span>
          <span class="valore font-mono ciano">{{ stats.cacheHits }}</span>
        </div>

        <div v-if="stats.ddosBlocked > 0" class="scheda-stat">
          <span class="label">{{ t('complete.ddos') }}</span>
          <span class="valore font-mono blu">{{ stats.ddosBlocked }}</span>
        </div>

        <div class="scheda-stat">
          <span class="label">{{ t('complete.punteggio') }}</span>
          <span class="valore font-mono accento">{{ stats.score.toLocaleString(lingua === 'en' ? 'en-US' : 'it-IT') }} pts</span>
        </div>
      </div>

      <div class="azioni-modal">
        <button type="button" class="btn-secondario" @click="emit('replay')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          <span>{{ t('complete.rigioca') }}</span>
        </button>

        <button
          v-if="hasNextLevel"
          type="button"
          class="btn-primario"
          @click="emit('next-level')"
        >
          <span>{{ t('complete.prossimo') }}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>

        <button
          v-else
          type="button"
          class="btn-primario"
          @click="emit('open-levels')"
        >
          <span>{{ t('complete.livelli') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 11, 14, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  z-index: 100;
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background: var(--bg-superficie);
  border: 1px solid var(--bordo-medio);
  border-radius: 18px;
  padding: 2rem;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.8), 0 0 0 1px var(--accento-bordo);
  animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.testata-vittoria {
  text-align: center;
  margin-bottom: 1.5rem;
}

.stelle {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.stella {
  color: rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stella.attiva {
  color: #f59e0b;
  filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.7));
  transform: scale(1.1);
}

.titolo-vittoria {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--testo-primario);
}

.sottotitolo-vittoria {
  font-size: 0.95rem;
  color: var(--testo-secondario);
  margin-top: 0.25rem;
}

.griglia-statistiche {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.scheda-stat {
  background: var(--bg-superficie-elevata);
  border: 1px solid var(--bordo-sottile);
  border-radius: 10px;
  padding: 0.75rem 0.9rem;
  display: flex;
  flex-direction: column;
}

.scheda-stat .label {
  font-size: 0.72rem;
  color: var(--testo-terziario);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;
}

.scheda-stat .valore {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--testo-primario);
}

.valore.accento { color: var(--accento); }
.valore.ciano { color: var(--ciano-cache); }
.valore.blu { color: var(--blu-waf); }

.azioni-modal {
  display: flex;
  gap: 0.75rem;
}

.btn-primario, .btn-secondario {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 650;
  transition: all 0.2s ease;
  min-height: 44px;
}

.btn-primario {
  background: var(--accento);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.4);
}

.btn-primario:hover {
  background: var(--accento-hover);
  transform: translateY(-1px);
}

.btn-secondario {
  background: var(--bg-superficie-elevata);
  border: 1px solid var(--bordo-medio);
  color: var(--testo-primario);
}

.btn-secondario:hover {
  background: var(--bg-superficie-hover);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .modal-card {
    padding: 1.4rem;
  }
  .titolo-vittoria {
    font-size: 1.35rem;
  }
  .stelle {
    font-size: 1.8rem;
  }
}
</style>
