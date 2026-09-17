<script setup>
import { computed } from 'vue'
import { useLingua } from '../composables/useLingua'

const props = defineProps({
  level: { type: Object, required: true },
  stats: { type: Object, required: true }
})

const emit = defineEmits(['replay', 'open-levels'])

const { t } = useLingua()

const failureReason = computed(() => {
  if (props.stats.ddosHits > 0) {
    return t('gameover.ddosRagione')
  }
  if (props.stats.droppedPackets > 3) {
    return t('gameover.bufferRagione')
  }
  return t('gameover.defaultRagione')
})

const hint = computed(() => {
  if (props.level.id === 2) {
    return t('gameover.hintLvl2')
  }
  if (props.level.id === 3 || props.level.id === 5) {
    return t('gameover.hintLvl3')
  }
  return t('gameover.hintDefault')
})
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-card game-over">
      <div class="testata-fallimento">
        <div class="icona-allarme">⚠️</div>
        <h2 class="titolo-fallimento">{{ t('gameover.titolo') }}</h2>
        <p class="sottotitolo-fallimento">{{ t('gameover.sottotitolo') }}</p>
      </div>

      <div class="scatola-diagnostica">
        <div class="diagnostica-riga">
          <span class="label">{{ t('gameover.slaFinale') }}</span>
          <span class="valore font-mono rosso">{{ stats.sla }}%</span>
        </div>
        <div class="diagnostica-riga">
          <span class="label">{{ t('gameover.pacchettiPersi') }}</span>
          <span class="valore font-mono">{{ stats.droppedPackets }}</span>
        </div>
        <div v-if="stats.ddosHits > 0" class="diagnostica-riga">
          <span class="label">{{ t('gameover.impattoDdos') }}</span>
          <span class="valore font-mono rosso">{{ stats.ddosHits }}</span>
        </div>
        <div class="diagnostica-messaggio">
          {{ failureReason }}
        </div>
      </div>

      <div class="box-suggerimento">
        {{ hint }}
      </div>

      <div class="azioni-modal">
        <button type="button" class="btn-secondario" @click="emit('open-levels')">
          <span>{{ t('complete.livelli') }}</span>
        </button>

        <button type="button" class="btn-primario" @click="emit('replay')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          <span>{{ t('gameover.riprova') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 11, 14, 0.85);
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
  border: 1px solid var(--rosso-bordo);
  border-radius: 18px;
  padding: 2rem;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.85), 0 0 25px rgba(239, 68, 68, 0.25);
  animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.testata-fallimento {
  text-align: center;
  margin-bottom: 1.25rem;
}

.icona-allarme {
  font-size: 2.5rem;
  margin-bottom: 0.25rem;
  filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.6));
}

.titolo-fallimento {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--rosso-ddos);
  letter-spacing: -0.02em;
}

.sottotitolo-fallimento {
  font-size: 0.92rem;
  color: var(--testo-secondario);
  margin-top: 0.2rem;
}

.scatola-diagnostica {
  background: var(--bg-superficie-elevata);
  border: 1px solid var(--bordo-sottile);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
}

.diagnostica-riga {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.diagnostica-riga .label {
  color: var(--testo-terziario);
}

.valore.rosso {
  color: var(--rosso-ddos);
  font-weight: 700;
}

.diagnostica-messaggio {
  margin-top: 0.6rem;
  font-size: 0.8rem;
  color: #fca5a5;
  line-height: 1.4;
}

.box-suggerimento {
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid var(--accento-bordo);
  border-radius: 8px;
  padding: 0.75rem 0.9rem;
  font-size: 0.82rem;
  color: var(--accento-testo);
  line-height: 1.45;
  margin-bottom: 1.5rem;
}

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
  background: var(--rosso-ddos);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}

.btn-primario:hover {
  background: #dc2626;
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
</style>
