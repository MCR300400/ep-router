<script setup>
import { ref, onMounted } from 'vue'

const API = import.meta.env.VITE_API_URL
const unici = ref(null)
const caricamento = ref(true)

async function caricaContatore() {
  if (!API) {
    caricamento.value = false
    return
  }
  try {
    const res = await fetch(`${API}/pubblico/contatore?sito=router`)
    if (res.ok) {
      const data = await res.json()
      unici.value = data.unici ?? data.visite
    }
  } catch (err) {
    // Silenzioso
  } finally {
    caricamento.value = false
  }
}

onMounted(() => {
  caricaContatore()
})
</script>

<template>
  <div v-if="unici !== null" class="badge-contatore" title="Visitatori unici totali tracciati nel rispetto della privacy">
    <span class="pulsante-dot"></span>
    <span class="testo">{{ unici.toLocaleString('it-IT') }} {{ unici === 1 ? 'visitatore unico' : 'visitatori unici' }}</span>
  </div>
</template>

<style scoped>
.badge-contatore {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--accento-sfondo);
  border: 1px solid var(--accento-bordo);
  color: var(--accento-testo);
  padding: 0.22rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 550;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.pulsante-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}
</style>
