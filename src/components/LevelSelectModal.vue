<script setup>
import { LEVELS } from '../game/levels.js'
import { useLingua } from '../composables/useLingua'

defineProps({
  currentLevelId: { type: Number, required: true }
})

const emit = defineEmits(['select-level', 'close'])

const { t } = useLingua()
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card selezione-livelli">
      <div class="testata-modal">
        <div>
          <h2 class="titolo-modal">{{ t('select.titolo') }}</h2>
          <p class="sottotitolo-modal">{{ t('select.sottotitolo') }}</p>
        </div>
        <button type="button" class="btn-chiudi" @click="emit('close')">✕</button>
      </div>

      <div class="lista-livelli">
        <div
          v-for="lvl in LEVELS"
          :key="lvl.id"
          class="scheda-livello"
          :class="{ attivo: lvl.id === currentLevelId, 'endless-card': lvl.isEndless }"
          @click="emit('select-level', lvl)"
        >
          <div class="info-livello">
            <div class="testata-scheda">
              <span class="badge-tag-livello" :class="{ endless: lvl.isEndless }">
                {{ lvl.isEndless ? 'SURVIVAL' : `${t('select.livello')} ${lvl.id}` }}
              </span>
              <span v-if="lvl.id === currentLevelId" class="badge-in-corso">{{ t('select.inCorso') }}</span>
            </div>
            <h3 class="nome-livello">{{ lvl.title }}</h3>
            <p class="desc-livello">{{ lvl.subtitle }}</p>
          </div>

          <div class="footer-scheda">
            <span class="dettaglio">
              {{ t('select.obiettivo') }} <strong>{{ lvl.isEndless ? 'Record' : `${lvl.targetDeliveries} req` }}</strong>
            </span>
            <span class="dettaglio">
              {{ t('select.maxFibra') }} <strong>{{ lvl.maxCables }}</strong>
            </span>
          </div>
        </div>
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
  max-width: 520px;
  max-height: 85vh;
  background: var(--bg-superficie);
  border: 1px solid var(--bordo-medio);
  border-radius: 18px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.8);
  animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.testata-modal {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.titolo-modal {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--testo-primario);
}

.sottotitolo-modal {
  font-size: 0.85rem;
  color: var(--testo-secondario);
  margin-top: 0.2rem;
}

.btn-chiudi {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--bg-superficie-elevata);
  color: var(--testo-secondario);
  font-size: 0.9rem;
  border: 1px solid var(--bordo-sottile);
}

.btn-chiudi:hover {
  background: var(--bg-superficie-hover);
  color: var(--testo-primario);
}

.lista-livelli {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.scheda-livello {
  background: var(--bg-superficie-elevata);
  border: 1px solid var(--bordo-sottile);
  border-radius: 12px;
  padding: 0.9rem 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.scheda-livello:hover {
  background: var(--bg-superficie-hover);
  border-color: var(--accento-bordo);
  transform: translateY(-1px);
}

.scheda-livello.attivo {
  border-color: var(--accento);
  background: rgba(249, 115, 22, 0.08);
}

.scheda-livello.endless-card {
  border-color: rgba(6, 182, 212, 0.35);
}

.testata-scheda {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.badge-tag-livello {
  font-size: 0.7rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--accento-testo);
  background: var(--accento-sfondo);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.badge-tag-livello.endless {
  color: var(--ciano-cache);
  background: var(--ciano-sfondo);
}

.badge-in-corso {
  font-size: 0.7rem;
  color: var(--verde-http);
  font-weight: 600;
}

.nome-livello {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--testo-primario);
}

.desc-livello {
  font-size: 0.82rem;
  color: var(--testo-secondario);
}

.footer-scheda {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--testo-terziario);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding-top: 0.5rem;
}

.dettaglio strong {
  color: var(--testo-primario);
  font-family: var(--font-mono);
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
