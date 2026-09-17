<script setup>
import { useLingua } from '../composables/useLingua'

defineEmits(['close'])

const { t, isItalian } = useLingua()
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card guida-gioco">
      <div class="testata-modal">
        <div class="brand-guida">
          <span class="icona-lampo">⚡</span>
          <div>
            <h2 class="titolo-modal">{{ t('tut.titolo') }}</h2>
            <p class="sottotitolo-modal">{{ t('tut.sottotitolo') }}</p>
          </div>
        </div>
        <button type="button" class="btn-chiudi" @click="$emit('close')">✕</button>
      </div>

      <div class="corpo-guida">
        <!-- Sezione Controlli -->
        <section class="sezione-guida">
          <h3 class="titolo-sezione">{{ t('tut.sezControlli') }}</h3>
          <ul class="lista-punti">
            <li>{{ t('tut.c1') }}</li>
            <li>{{ t('tut.c2') }}</li>
            <li>{{ t('tut.c3') }}</li>
          </ul>
        </section>

        <!-- Sezione Pacchetti -->
        <section class="sezione-guida">
          <h3 class="titolo-sezione">{{ t('tut.sezProtocolli') }}</h3>
          <div class="griglia-tipi">
            <div class="scheda-tipo http">
              <span class="dot-tipo"></span>
              <div>
                <strong>HTTP GET ({{ isItalian ? 'Verde' : 'Green' }})</strong>
                <p>{{ t('tut.pHttp') }}</p>
              </div>
            </div>

            <div class="scheda-tipo sql">
              <span class="dot-tipo"></span>
              <div>
                <strong>SQL Query ({{ isItalian ? 'Viola' : 'Purple' }})</strong>
                <p>{{ t('tut.pSql') }}</p>
              </div>
            </div>

            <div class="scheda-tipo media">
              <span class="dot-tipo"></span>
              <div>
                <strong>Media Asset ({{ isItalian ? 'Ambra' : 'Amber' }})</strong>
                <p>{{ t('tut.pMedia') }}</p>
              </div>
            </div>

            <div class="scheda-tipo ddos">
              <span class="dot-tipo"></span>
              <div>
                <strong>SYN Flood DDoS ({{ isItalian ? 'Rosso' : 'Red' }})</strong>
                <p>{{ t('tut.pDdos') }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Sezione Nodi Speciali -->
        <section class="sezione-guida">
          <h3 class="titolo-sezione">{{ t('tut.sezNodi') }}</h3>
          <div class="griglia-nodi">
            <div class="nodo-info">
              <span class="icona-nodo ciano">⚡</span>
              <div>
                <strong>Edge Cache (KV)</strong>
                <p>{{ t('tut.nCache') }}</p>
              </div>
            </div>

            <div class="nodo-info">
              <span class="icona-nodo blu">🛡️</span>
              <div>
                <strong>Cloudflare WAF</strong>
                <p>{{ t('tut.nWaf') }}</p>
              </div>
            </div>

            <div class="nodo-info">
              <span class="icona-nodo rosa">⚖️</span>
              <div>
                <strong>Load Balancer</strong>
                <p>{{ isItalian ? 'Alterna i pacchetti su cavi d\'uscita multipli per evitare congestioni di coda.' : 'Alternates packets across multiple egress links to balance load and prevent congestion.' }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="footer-guida">
        <button type="button" class="btn-primario" @click="$emit('close')">
          {{ t('tut.chiudiBtn') }}
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
  max-width: 580px;
  max-height: 88vh;
  background: var(--bg-superficie);
  border: 1px solid var(--bordo-medio);
  border-radius: 18px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.85);
  animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.testata-modal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--bordo-sottile);
  padding-bottom: 1rem;
}

.brand-guida {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icona-lampo {
  font-size: 1.8rem;
  color: var(--accento);
}

.titolo-modal {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--testo-primario);
}

.sottotitolo-modal {
  font-size: 0.82rem;
  color: var(--testo-secondario);
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

.corpo-guida {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-right: 0.4rem;
}

.sezione-guida {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.titolo-sezione {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accento-testo);
}

.lista-punti {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: 0.85rem;
  color: var(--testo-secondario);
  line-height: 1.45;
}

.lista-punti strong {
  color: var(--testo-primario);
}

kbd {
  display: inline-block;
  padding: 0.1rem 0.35rem;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  background: var(--bg-superficie-elevata);
  border: 1px solid var(--bordo-medio);
  border-radius: 4px;
  color: var(--testo-primario);
}

.griglia-tipi {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

.scheda-tipo {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: var(--bg-superficie-elevata);
  border: 1px solid var(--bordo-sottile);
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  font-size: 0.78rem;
  line-height: 1.35;
}

.scheda-tipo strong {
  display: block;
  margin-bottom: 0.15rem;
}

.scheda-tipo p {
  color: var(--testo-terziario);
}

.scheda-tipo.http strong { color: var(--verde-http); }
.scheda-tipo.sql strong { color: var(--viola-sql); }
.scheda-tipo.media strong { color: var(--ambra-media); }
.scheda-tipo.ddos strong { color: var(--rosso-ddos); }

.dot-tipo {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.scheda-tipo.http .dot-tipo { background: var(--verde-http); box-shadow: 0 0 6px var(--verde-http); }
.scheda-tipo.sql .dot-tipo { background: var(--viola-sql); box-shadow: 0 0 6px var(--viola-sql); }
.scheda-tipo.media .dot-tipo { background: var(--ambra-media); box-shadow: 0 0 6px var(--ambra-media); }
.scheda-tipo.ddos .dot-tipo { background: var(--rosso-ddos); box-shadow: 0 0 6px var(--rosso-ddos); }

.griglia-nodi {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nodo-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-superficie-elevata);
  border: 1px solid var(--bordo-sottile);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  font-size: 0.8rem;
}

.icona-nodo {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.nodo-info strong {
  display: block;
  color: var(--testo-primario);
  font-size: 0.85rem;
}

.nodo-info p {
  color: var(--testo-terziario);
  font-size: 0.76rem;
  margin-top: 0.1rem;
}

.footer-guida {
  margin-top: 1.25rem;
  border-top: 1px solid var(--bordo-sottile);
  padding-top: 1rem;
}

.btn-primario {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.92rem;
  background: var(--accento);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35);
}

.btn-primario:hover {
  background: var(--accento-hover);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 540px) {
  .griglia-tipi {
    grid-template-columns: 1fr;
  }
}
</style>
