<script setup>
import { computed } from 'vue'
import Contatore from './Contatore.vue'
import { useLingua } from '../composables/useLingua'

const props = defineProps({
  level: { type: Object, required: true },
  stats: { type: Object, required: true },
  isMuted: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle-sound', 'open-levels', 'open-tutorial'])

const { t, lingua, isItalian, isEnglish, setLingua } = useLingua()

const slaColor = computed(() => {
  if (props.stats.sla >= 90) return 'var(--verde-http)'
  if (props.stats.sla >= 75) return 'var(--ambra-media)'
  return 'var(--rosso-ddos)'
})

const progressPercent = computed(() => {
  if (props.level.isEndless) return 100
  return Math.min(100, Math.round((props.stats.deliveredCount / props.level.targetDeliveries) * 100))
})
</script>

<template>
  <header class="top-hud">
    <!-- Sezione Brand & Info Livello -->
    <div class="hud-sinistra">
      <div class="brand">
        <span class="logo-icon">⚡</span>
        <span class="logo-testo">ep-router</span>
      </div>

      <button
        type="button"
        class="badge-livello"
        :title="t('hud.selezionaLivello')"
        @click="emit('open-levels')"
      >
        <span class="dot-livello"></span>
        <span class="titolo-livello">{{ level.title }}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div class="contatore-desktop">
        <Contatore />
      </div>
    </div>

    <!-- Metriche Prestazionali di Rete -->
    <div class="hud-metriche">
      <!-- SLA Uptime Gauge -->
      <div class="scheda-metrica sla" :style="{ '--colore-sla': slaColor }">
        <div class="metrica-valore font-mono">
          <span class="sla-indicatore"></span>
          {{ stats.sla }}%
        </div>
        <div class="metrica-label">{{ t('hud.sla') }}</div>
      </div>

      <!-- Richieste Consegnate -->
      <div class="scheda-metrica">
        <div class="metrica-valore font-mono">
          {{ stats.deliveredCount }}
          <span v-if="!level.isEndless" class="target-sub">/ {{ level.targetDeliveries }}</span>
        </div>
        <div class="metrica-label">{{ t('hud.pacchetti') }}</div>
      </div>

      <!-- Latenza Media Edge -->
      <div class="scheda-metrica nascondi-mobile">
        <div class="metrica-valore font-mono">
          {{ stats.averageLatency }}<span class="unit">ms</span>
        </div>
        <div class="metrica-label">{{ t('hud.latenzaMedia') }}</div>
      </div>

      <!-- Punteggio Network -->
      <div class="scheda-metrica">
        <div class="metrica-valore font-mono accento">
          {{ stats.score.toLocaleString(lingua === 'en' ? 'en-US' : 'it-IT') }}
        </div>
        <div class="metrica-label">{{ t('hud.punteggio') }}</div>
      </div>
    </div>

    <!-- Azioni Rapide / Utilità -->
    <div class="hud-destra">
      <!-- Switcher Lingua IT/EN -->
      <div class="selettore-lingua" role="group" aria-label="Selezione lingua">
        <button
          type="button"
          class="btn-lingua"
          :class="{ attivo: isItalian }"
          title="Passa a Italiano"
          @click="setLingua('it')"
        >
          IT
        </button>
        <button
          type="button"
          class="btn-lingua"
          :class="{ attivo: isEnglish }"
          title="Switch to English"
          @click="setLingua('en')"
        >
          EN
        </button>
      </div>

      <!-- Guida rapida / Tutorial -->
      <button
        type="button"
        class="btn-icona"
        :title="t('hud.guidaRegole')"
        @click="emit('open-tutorial')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </button>

      <!-- Audio Mute Toggle -->
      <button
        type="button"
        class="btn-icona"
        :class="{ disattivato: isMuted }"
        :title="isMuted ? t('hud.audioAttiva') : t('hud.audioDisattiva')"
        @click="emit('toggle-sound')"
      >
        <!-- Icona Audio On -->
        <svg v-if="!isMuted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
        <!-- Icona Audio Muted -->
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      </button>
    </div>

    <!-- Barra di avanzamento obiettivo livello (subtle) -->
    <div v-if="!level.isEndless" class="barra-progresso-container">
      <div class="barra-progresso" :style="{ width: `${progressPercent}%` }"></div>
    </div>
  </header>
</template>

<style scoped>
.top-hud {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.25rem;
  background: var(--header-bg);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--bordo-sottile);
  z-index: 20;
  gap: 1rem;
}

.hud-sinistra {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
}

.logo-icon {
  color: var(--accento);
  font-size: 1.15rem;
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.5));
}

.logo-testo {
  color: var(--testo-primario);
}

.badge-livello {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.65rem;
  background: var(--bg-superficie);
  border: 1px solid var(--bordo-medio);
  border-radius: 8px;
  color: var(--testo-primario);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.badge-livello:hover {
  background: var(--bg-superficie-hover);
  border-color: var(--accento-bordo);
}

.dot-livello {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accento);
}

.titolo-livello {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hud-metriche {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.scheda-metrica {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metrica-valore {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--testo-primario);
  line-height: 1.1;
}

.metrica-valore.accento {
  color: var(--accento-testo);
}

.metrica-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--testo-terziario);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 0.15rem;
}

.target-sub {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--testo-terziario);
}

.unit {
  font-size: 0.72rem;
  color: var(--testo-secondario);
}

.scheda-metrica.sla .metrica-valore {
  color: var(--colore-sla);
}

.sla-indicatore {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--colore-sla);
  box-shadow: 0 0 8px var(--colore-sla);
  margin-right: 0.25rem;
}

.hud-destra {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Switcher Lingua HUD */
.selettore-lingua {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  padding: 0.18rem 0.28rem;
  border-radius: 8px;
  border: 1px solid var(--bordo-sottile);
  background: var(--bg-superficie);
  user-select: none;
}

.btn-lingua {
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 650;
  color: var(--testo-terziario);
  padding: 0.2rem 0.4rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.18s ease;
  line-height: 1;
}

.btn-lingua:hover {
  color: var(--testo-primario);
}

.btn-lingua.attivo {
  background: var(--accento);
  color: #ffffff;
  font-weight: 700;
}

.btn-icona {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bg-superficie);
  border: 1px solid var(--bordo-sottile);
  color: var(--testo-secondario);
  transition: all 0.2s ease;
}

.btn-icona:hover {
  background: var(--bg-superficie-hover);
  border-color: var(--bordo-forte);
  color: var(--testo-primario);
}

.btn-icona.disattivato {
  color: var(--testo-terziario);
  opacity: 0.75;
}

.barra-progresso-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2.5px;
  background: rgba(255, 255, 255, 0.05);
}

.barra-progresso {
  height: 100%;
  background: linear-gradient(90deg, var(--accento), var(--accento-hover));
  transition: width 0.3s ease;
}

.font-mono {
  font-family: var(--font-mono);
}

/* Responsiveness */
@media (max-width: 768px) {
  .top-hud {
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
  }
  .contatore-desktop,
  .nascondi-mobile {
    display: none;
  }
  .titolo-livello {
    max-width: 90px;
  }
  .hud-metriche {
    gap: 0.75rem;
  }
  .metrica-valore {
    font-size: 0.95rem;
  }
  .metrica-label {
    font-size: 0.62rem;
  }
  .btn-icona {
    width: 32px;
    height: 32px;
  }
}
</style>
