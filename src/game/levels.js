import { NODE_TYPES, PACKET_TYPES } from './types.js'

export const LEVELS = [
  {
    id: 1,
    title: 'Livello 1: First Hop',
    subtitle: 'I primi collegamenti in fibra ottica',
    briefing: 'Traccia cavi in fibra trascinando il mouse o toccando due nodi in sequenza. Connetti i client PoP al Web Origin per consegnare i pacchetti HTTP prima del timeout.',
    targetDeliveries: 15,
    minSla: 85,
    maxCables: 6,
    packetTypes: [PACKET_TYPES.HTTP],
    spawnInterval: 2.2, // secondi tra ogni pacchetto
    nodes: [
      { id: 'c1', type: NODE_TYPES.CLIENT, label: 'Milano PoP', x: 0.14, y: 0.32 },
      { id: 'c2', type: NODE_TYPES.CLIENT, label: 'Londra PoP', x: 0.14, y: 0.68 },
      { id: 'r1', type: NODE_TYPES.ROUTER, label: 'Edge Paris', x: 0.50, y: 0.50 },
      { id: 'dst_origin', type: NODE_TYPES.ORIGIN, label: 'Web Origin', x: 0.86, y: 0.50 }
    ],
    initialCables: []
  },
  {
    id: 2,
    title: 'Livello 2: Cache is King',
    subtitle: 'Assorbi il traffico all’Edge',
    briefing: 'Il volume di richieste HTTP è raddoppiato! Collega il nodo Edge Cache per soddisfare le richieste statiche istantaneamente senza sovraccaricare l’Origin Server.',
    targetDeliveries: 25,
    targetCacheHits: 8,
    minSla: 85,
    maxCables: 8,
    packetTypes: [PACKET_TYPES.HTTP],
    spawnInterval: 1.5,
    nodes: [
      { id: 'c1', type: NODE_TYPES.CLIENT, label: 'Madrid PoP', x: 0.14, y: 0.25 },
      { id: 'c2', type: NODE_TYPES.CLIENT, label: 'Francoforte', x: 0.14, y: 0.50 },
      { id: 'c3', type: NODE_TYPES.CLIENT, label: 'Roma PoP', x: 0.14, y: 0.75 },
      { id: 'r1', type: NODE_TYPES.ROUTER, label: 'Central Hub', x: 0.44, y: 0.50 },
      { id: 'cache1', type: NODE_TYPES.CACHE, label: 'Edge Cache', x: 0.68, y: 0.28 },
      { id: 'dst_origin', type: NODE_TYPES.ORIGIN, label: 'Web Origin', x: 0.86, y: 0.65 }
    ],
    initialCables: []
  },
  {
    id: 3,
    title: 'Livello 3: Under Attack (DDoS)',
    subtitle: 'Mitigazione minacce all’Edge',
    briefing: 'Una botnet sta bombardando la rete con pacchetti rossi SYN Flood! Instrada il traffico malevolo attraverso il Cloudflare WAF per neutralizzarlo prima che colpisca il server.',
    targetDeliveries: 20,
    targetDdosBlocked: 5,
    minSla: 80,
    maxCables: 9,
    packetTypes: [PACKET_TYPES.HTTP, PACKET_TYPES.DDOS],
    spawnInterval: 1.4,
    nodes: [
      { id: 'c1', type: NODE_TYPES.CLIENT, label: 'Utenti Reali', x: 0.14, y: 0.30 },
      { id: 'c2', type: NODE_TYPES.CLIENT, label: 'Botnet Ingress', x: 0.14, y: 0.70 },
      { id: 'r1', type: NODE_TYPES.ROUTER, label: 'Ingress Gate', x: 0.42, y: 0.50 },
      { id: 'waf1', type: NODE_TYPES.WAF, label: 'Cloudflare WAF', x: 0.65, y: 0.28 },
      { id: 'dst_origin', type: NODE_TYPES.ORIGIN, label: 'Web Origin', x: 0.86, y: 0.65 }
    ],
    initialCables: []
  },
  {
    id: 4,
    title: 'Livello 4: Multi-Cloud Sharding',
    subtitle: 'Smistamento protocolli specializzati',
    briefing: 'Arrivano richieste composite: HTTP (Verde -> Origin), Query SQL (Viola -> D1 Database) e Media pesanti (Ambra -> R2 Storage). Instrada ogni pacchetto verso la destinazione corretta!',
    targetDeliveries: 30,
    minSla: 80,
    maxCables: 11,
    packetTypes: [PACKET_TYPES.HTTP, PACKET_TYPES.SQL, PACKET_TYPES.MEDIA],
    spawnInterval: 1.3,
    nodes: [
      { id: 'c1', type: NODE_TYPES.CLIENT, label: 'Tokyo PoP', x: 0.14, y: 0.22 },
      { id: 'c2', type: NODE_TYPES.CLIENT, label: 'Virginia PoP', x: 0.14, y: 0.50 },
      { id: 'c3', type: NODE_TYPES.CLIENT, label: 'San Paolo', x: 0.14, y: 0.78 },
      { id: 'r1', type: NODE_TYPES.ROUTER, label: 'Router Alpha', x: 0.45, y: 0.35 },
      { id: 'r2', type: NODE_TYPES.ROUTER, label: 'Router Beta', x: 0.45, y: 0.65 },
      { id: 'dst_origin', type: NODE_TYPES.ORIGIN, label: 'Web Origin', x: 0.86, y: 0.22 },
      { id: 'dst_db', type: NODE_TYPES.DATABASE, label: 'D1 Cluster', x: 0.86, y: 0.50 },
      { id: 'dst_r2', type: NODE_TYPES.STORAGE, label: 'R2 Storage', x: 0.86, y: 0.78 }
    ],
    initialCables: []
  },
  {
    id: 5,
    title: 'Livello 5: Black Friday Storm',
    subtitle: 'La sfida finale ad altissima pressione',
    briefing: 'Picco di traffico planetario contemporaneo con ondate di DDoS! Utilizza Load Balancer, Edge Cache e WAF per mantenere l’uptime SLA al di sopra dell’80%.',
    targetDeliveries: 45,
    minSla: 80,
    maxCables: 13,
    packetTypes: [PACKET_TYPES.HTTP, PACKET_TYPES.SQL, PACKET_TYPES.MEDIA, PACKET_TYPES.DDOS],
    spawnInterval: 1.0,
    nodes: [
      { id: 'c1', type: NODE_TYPES.CLIENT, label: 'Global Traffic A', x: 0.13, y: 0.20 },
      { id: 'c2', type: NODE_TYPES.CLIENT, label: 'Global Traffic B', x: 0.13, y: 0.50 },
      { id: 'c3', type: NODE_TYPES.CLIENT, label: 'Botnet Swarm', x: 0.13, y: 0.80 },
      { id: 'lb1', type: NODE_TYPES.BALANCER, label: 'Load Balancer', x: 0.38, y: 0.35 },
      { id: 'waf1', type: NODE_TYPES.WAF, label: 'WAF Filter', x: 0.38, y: 0.70 },
      { id: 'cache1', type: NODE_TYPES.CACHE, label: 'Edge Cache', x: 0.62, y: 0.22 },
      { id: 'r1', type: NODE_TYPES.ROUTER, label: 'Backbone Hub', x: 0.62, y: 0.58 },
      { id: 'dst_origin', type: NODE_TYPES.ORIGIN, label: 'Web Origin', x: 0.87, y: 0.25 },
      { id: 'dst_db', type: NODE_TYPES.DATABASE, label: 'D1 Cluster', x: 0.87, y: 0.55 },
      { id: 'dst_r2', type: NODE_TYPES.STORAGE, label: 'R2 Storage', x: 0.87, y: 0.85 }
    ],
    initialCables: []
  },
  {
    id: 99,
    isEndless: true,
    title: 'Modalità Infinita (Survival)',
    subtitle: 'Resisti al traffico globale illimitato',
    briefing: 'Nessun limite di pacchetti. Il ritmo cresce continuamente! Guadagna crediti instradando pacchetti ed espandi la tua topologia per raggiungere il record di richieste servite.',
    targetDeliveries: Infinity,
    minSla: 75,
    maxCables: 16,
    packetTypes: [PACKET_TYPES.HTTP, PACKET_TYPES.SQL, PACKET_TYPES.MEDIA, PACKET_TYPES.DDOS],
    spawnInterval: 1.6,
    nodes: [
      { id: 'c1', type: NODE_TYPES.CLIENT, label: 'Europe Ingress', x: 0.13, y: 0.22 },
      { id: 'c2', type: NODE_TYPES.CLIENT, label: 'Americas PoP', x: 0.13, y: 0.50 },
      { id: 'c3', type: NODE_TYPES.CLIENT, label: 'Asia-Pacific', x: 0.13, y: 0.78 },
      { id: 'r1', type: NODE_TYPES.ROUTER, label: 'Hub Ovest', x: 0.38, y: 0.32 },
      { id: 'r2', type: NODE_TYPES.ROUTER, label: 'Hub Est', x: 0.38, y: 0.68 },
      { id: 'cache1', type: NODE_TYPES.CACHE, label: 'CDN Cache', x: 0.62, y: 0.25 },
      { id: 'waf1', type: NODE_TYPES.WAF, label: 'Cloudflare WAF', x: 0.62, y: 0.75 },
      { id: 'dst_origin', type: NODE_TYPES.ORIGIN, label: 'Origin Server', x: 0.87, y: 0.30 },
      { id: 'dst_db', type: NODE_TYPES.DATABASE, label: 'D1 Database', x: 0.87, y: 0.55 },
      { id: 'dst_r2', type: NODE_TYPES.STORAGE, label: 'R2 Storage', x: 0.87, y: 0.80 }
    ],
    initialCables: []
  }
]
