import { ref, computed } from 'vue'

const LINGUA_KEY = 'ep_lingua'

function ottieniLinguaIniziale() {
  if (typeof window === 'undefined') return 'it'
  try {
    const salvata = localStorage.getItem(LINGUA_KEY)
    if (salvata === 'it' || salvata === 'en') return salvata
    const browserLang = navigator.language || navigator.userLanguage || ''
    if (browserLang.startsWith('it')) return 'it'
    return 'it'
  } catch (e) {
    console.debug('Impossibile accedere a localStorage per la lingua:', e)
    return 'it'
  }
}

const lingua = ref(ottieniLinguaIniziale())

export function useLingua() {
  const isItalian = computed(() => lingua.value === 'it')
  const isEnglish = computed(() => lingua.value === 'en')

  function applicaLingua(nuovaLingua) {
    lingua.value = nuovaLingua
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', nuovaLingua)
      try {
        localStorage.setItem(LINGUA_KEY, nuovaLingua)
      } catch (e) {
        console.warn('Impossibile salvare la lingua in localStorage:', e)
      }
    }
  }

  function toggleLingua() {
    applicaLingua(lingua.value === 'it' ? 'en' : 'it')
  }

  function t(valore) {
    if (!valore) return ''
    if (typeof valore === 'object') {
      return valore[lingua.value] || valore.it || ''
    }
    return dizionario[valore]?.[lingua.value] || valore
  }

  return {
    lingua,
    isItalian,
    isEnglish,
    setLingua: applicaLingua,
    toggleLingua,
    t
  }
}

export const dizionario = {
  // Contatore
  'contatore.tooltip': {
    it: 'Visitatori unici totali tracciati nel rispetto della privacy',
    en: 'Total unique visitors tracked with privacy-first analytics'
  },
  'contatore.singolare': { it: 'visitatore unico', en: 'unique visitor' },
  'contatore.plurale': { it: 'visitatori unici', en: 'unique visitors' },

  // TopHud
  'hud.selezionaLivello': { it: 'Clicca per selezionare un livello', en: 'Click to select a level' },
  'hud.guidaRegole': { it: 'Guida di gioco e regole', en: 'Game guide and rules' },
  'hud.audioAttiva': { it: 'Attiva effetti sonori', en: 'Unmute sound effects' },
  'hud.audioDisattiva': { it: 'Disattiva effetti sonori', en: 'Mute sound effects' },
  'hud.sla': { it: 'SLA Uptime', en: 'SLA Uptime' },
  'hud.pacchetti': { it: 'Pacchetti', en: 'Packets' },
  'hud.latenzaMedia': { it: 'Latenza Media', en: 'Avg Latency' },
  'hud.punteggio': { it: 'Score', en: 'Score' },

  // ToolBar
  'toolbar.fibra': { it: 'Fibra', en: 'Fiber' },
  'toolbar.riprendi': { it: 'Riprendi', en: 'Resume' },
  'toolbar.pausa': { it: 'Pausa', en: 'Pause' },
  'toolbar.riprendiSpazio': { it: 'Riprendi simulazione (Spazio)', en: 'Resume simulation (Space)' },
  'toolbar.pausaSpazio': { it: 'Metti in pausa (Spazio)', en: 'Pause simulation (Space)' },
  'toolbar.velocita': { it: 'Cambia velocità di simulazione', en: 'Change simulation speed' },
  'toolbar.riavvia': { it: 'Riavvia livello corrente', en: 'Restart current level' },
  'toolbar.rimuoviTutti': { it: 'Rimuovi tutti i cavi', en: 'Clear all cables' },
  'toolbar.nodoSelezionato': {
    it: 'Nodo selezionato:',
    en: 'Selected node:'
  },
  'toolbar.toccaAltroNodo': {
    it: 'Tocca un altro nodo per collegare la fibra.',
    en: 'Tap another node to connect fiber.'
  },
  'toolbar.istruzioneStandard': {
    it: 'Trascina tra due nodi o toccali in sequenza per collegarli. Clicca ✕ sul cavo per rimuoverlo.',
    en: 'Drag between nodes or tap sequentially to connect. Click ✕ on a cable to remove it.'
  },

  // GameOverModal
  'gameover.titolo': { it: 'SLA Breached!', en: 'SLA Breached!' },
  'gameover.sottotitolo': {
    it: 'La rete è collassata per congestione o attacco.',
    en: 'The network collapsed due to congestion or attack.'
  },
  'gameover.slaFinale': { it: 'SLA Finale:', en: 'Final SLA:' },
  'gameover.pacchettiPersi': { it: 'Pacchetti Persi / Timeout:', en: 'Dropped Packets / Timeout:' },
  'gameover.impattoDdos': { it: 'Impatto DDoS Server:', en: 'DDoS Server Impact:' },
  'gameover.ddosRagione': {
    it: 'Attacco DDoS non mitigato: pacchetti maligni hanno saturato i server centrali!',
    en: 'Unmitigated DDoS attack: malicious packets saturated central origin servers!'
  },
  'gameover.bufferRagione': {
    it: 'Buffer Overflow: i pacchetti si sono accumulati nelle code dei nodi senza via d\'uscita!',
    en: 'Buffer Overflow: packets congested node buffers with no egress path!'
  },
  'gameover.defaultRagione': {
    it: 'L\'uptime SLA è sceso al di sotto della soglia minima richiesta.',
    en: 'SLA uptime dropped below the required service threshold.'
  },
  'gameover.hintLvl2': {
    it: '💡 Consiglio: Connetti l\'Edge Cache ai PoP di ingresso per soddisfare il traffico HTTP prima che raggiunga l\'Origin!',
    en: '💡 Hint: Connect the Edge Cache to ingress PoPs to absorb HTTP traffic before it reaches Origin!'
  },
  'gameover.hintLvl3': {
    it: '💡 Consiglio: Instrada i pacchetti rossi SYN Flood verso il Cloudflare WAF per neutralizzarli!',
    en: '💡 Hint: Route red SYN Flood packets to the Cloudflare WAF to neutralize them!'
  },
  'gameover.hintDefault': {
    it: '💡 Consiglio: Connetti rotte multiple e rimuovi i cavi obsoleti con ✕ per ottimizzare i percorsi.',
    en: '💡 Hint: Build alternate routes and clear congested links with ✕ to optimize traffic flow.'
  },
  'gameover.riprova': { it: 'Riprova Livello', en: 'Retry Level' },
  'gameover.seleziona': { it: 'Seleziona Topologia', en: 'Select Topology' },

  // LevelCompleteModal
  'complete.titolo': { it: 'Livello Completato!', en: 'Level Completed!' },
  'complete.sla': { it: 'SLA Mantenuto', en: 'SLA Maintained' },
  'complete.latenza': { it: 'Latenza Media', en: 'Avg Latency' },
  'complete.pacchetti': { it: 'Pacchetti Consegnati', en: 'Delivered Packets' },
  'complete.cache': { it: 'Cache Hits (0ms)', en: 'Cache Hits (0ms)' },
  'complete.ddos': { it: 'DDoS Neutralizzati', en: 'DDoS Neutralized' },
  'complete.punteggio': { it: 'Punteggio Finale', en: 'Final Score' },
  'complete.prossimo': { it: 'Prossimo Livello', en: 'Next Level' },
  'complete.rigioca': { it: 'Rigioca', en: 'Replay' },
  'complete.livelli': { it: 'Livelli', en: 'Levels' },

  // LevelSelectModal
  'select.titolo': { it: 'Seleziona Topologia', en: 'Select Topology' },
  'select.sottotitolo': {
    it: 'Scegli una missione o affronta la modalità infinita',
    en: 'Choose a mission or tackle survival endless mode'
  },
  'select.livello': { it: 'LIVELLO', en: 'LEVEL' },
  'select.inCorso': { it: 'In corso', en: 'Active' },
  'select.obiettivo': { it: 'Obiettivo:', en: 'Goal:' },
  'select.maxFibra': { it: 'Max fibra:', en: 'Max fiber:' },

  // TutorialModal
  'tut.titolo': { it: 'Manuale di Rete — ep-router', en: 'Network Manual — ep-router' },
  'tut.sottotitolo': {
    it: 'Come gestire l\'Edge di Cloudflare a 60 FPS',
    en: 'Architecting & routing the Cloudflare Edge at 60 FPS'
  },
  'tut.sezControlli': { it: '🕹️ Controlli & Interazione', en: '🕹️ Controls & Interaction' },
  'tut.c1': {
    it: 'Collega fibra ottica: Trascina con il mouse o tocca due nodi in sequenza (touchscreen friendly).',
    en: 'Connect optical fiber: Drag with mouse or tap two nodes sequentially (touchscreen friendly).'
  },
  'tut.c2': {
    it: 'Rimuovi collegamento: Clicca o tocca il badge ✕ al centro di qualsiasi cavo.',
    en: 'Remove link: Click or tap the ✕ badge at the center of any fiber cable.'
  },
  'tut.c3': {
    it: 'Pausa & Velocità: Premi Spazio o usa la barra comandi in basso per attivare la pausa o la velocità 2x.',
    en: 'Pause & Speed: Press Space or use the bottom bar to pause or switch to 2x speed.'
  },
  'tut.sezProtocolli': { it: '📦 Protocolli & Tipi di Pacchetti', en: '📦 Protocols & Packet Types' },
  'tut.pHttp': {
    it: 'Traffico web standard. Soddisfatto da Web Origin oppure assorbito istantaneamente dall\'Edge Cache.',
    en: 'Standard web requests. Handled by Web Origin or absorbed instantly by Edge Cache.'
  },
  'tut.pSql': {
    it: 'Query al database. Devono raggiungere il cluster D1 per non causare Protocol Mismatch.',
    en: 'Database queries. Must reach D1 Database to prevent Protocol Mismatch.'
  },
  'tut.pMedia': {
    it: 'File pesanti e streaming. Instradali direttamente su R2 Object Storage.',
    en: 'Heavy assets and streaming media. Route directly to R2 Object Storage.'
  },
  'tut.pDdos': {
    it: 'Traffico malevolo botnet. Instradalo nel Cloudflare WAF per neutralizzarlo; se tocca l\'Origin, abbatte l\'uptime!',
    en: 'Malicious botnet traffic. Route through Cloudflare WAF to neutralize; hitting Origin breaches SLA!'
  },
  'tut.sezNodi': { it: '🌐 Infrastruttura & Nodi Specializzati', en: '🌐 Infrastructure & Specialized Nodes' },
  'tut.nClient': {
    it: 'PoP d\'ingresso che generano pacchetti diretti ai nodi di destinazione.',
    en: 'Ingress PoPs that generate inbound user requests for network destinations.'
  },
  'tut.nRouter': {
    it: 'Router di transito edge. Possono instradare il traffico verso più nodi adiacenti.',
    en: 'Edge transit routers. Forward traffic dynamically across adjacent nodes.'
  },
  'tut.nCache': {
    it: 'Soddisfa le richieste HTTP a 0ms di latenza senza gravare sull\'Origin.',
    en: 'Fulfills HTTP requests at 0ms latency without overloading Origin.'
  },
  'tut.nWaf': {
    it: 'Assorbe e neutralizza gli attacchi DDoS (SYN Flood) prima dell\'Origin.',
    en: 'Absorbs and neutralizes DDoS attacks (SYN Flood) before reaching Origin.'
  },
  'tut.nOrigin': {
    it: 'Web Origin server centrale. Soddisfa richieste HTTP standard.',
    en: 'Central origin server. Fulfills standard HTTP web requests.'
  },
  'tut.nD1': {
    it: 'Cluster database SQLite distribuito per query SQL.',
    en: 'Distributed SQLite database cluster for SQL queries.'
  },
  'tut.nR2': {
    it: 'Object Storage ad alte prestazioni per file multimediali pesanti.',
    en: 'High-performance Object Storage bucket for media payloads.'
  },
  'tut.sezRegole': { it: '⚡ Regole SLA & Game Over', en: '⚡ SLA Rules & Game Over' },
  'tut.rSla': {
    it: 'L\'uptime SLA parte dal 100%. Ogni pacchetto perso, scaduto o errato riduce la percentuale.',
    en: 'SLA uptime starts at 100%. Every dropped, expired, or mismatched packet degrades uptime.'
  },
  'tut.rBuffer': {
    it: 'Se un nodo accumula troppi pacchetti in coda, si verifica un Buffer Overflow.',
    en: 'If any node exceeds maximum queue capacity, Buffer Overflow packet loss occurs.'
  },
  'tut.chiudiBtn': {
    it: 'Ho capito, andiamo in produzione! 🚀',
    en: 'Got it, let\'s ship to production! 🚀'
  }
}
