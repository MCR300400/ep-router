// Costanti e configurazioni per i tipi di nodi e pacchetti di rete

export const NODE_TYPES = {
  CLIENT: 'client',
  ROUTER: 'router',
  CACHE: 'cache',
  WAF: 'waf',
  BALANCER: 'balancer',
  ORIGIN: 'origin',
  DATABASE: 'database',
  STORAGE: 'storage'
}

export const PACKET_TYPES = {
  HTTP: {
    id: 'HTTP',
    label: 'HTTP GET',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    targetType: NODE_TYPES.ORIGIN,
    allowedAtCache: true,
    score: 100,
    speed: 120,
    ttl: 18 // secondi
  },
  SQL: {
    id: 'SQL',
    label: 'SQL Query',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    targetType: NODE_TYPES.DATABASE,
    allowedAtCache: false,
    score: 150,
    speed: 100,
    ttl: 20
  },
  MEDIA: {
    id: 'MEDIA',
    label: 'Media R2',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    targetType: NODE_TYPES.STORAGE,
    allowedAtCache: false,
    score: 120,
    speed: 85,
    ttl: 22
  },
  DDOS: {
    id: 'DDOS',
    label: 'SYN Flood',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.65)',
    targetType: null, // minaccia generica verso qualunque server
    allowedAtCache: false,
    score: -200,
    slaDamage: 15,
    speed: 135,
    ttl: 16
  }
}

export const NODE_CONFIG = {
  [NODE_TYPES.CLIENT]: {
    name: 'Client PoP',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.35)',
    role: 'Origine del traffico',
    isSource: true,
    isDestination: false
  },
  [NODE_TYPES.ROUTER]: {
    name: 'Edge Router',
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.35)',
    role: 'Smistamento pacchetti',
    isSource: false,
    isDestination: false
  },
  [NODE_TYPES.CACHE]: {
    name: 'Edge Cache (KV)',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
    role: 'Assorbe traffico HTTP istantaneamente',
    isSource: false,
    isDestination: false
  },
  [NODE_TYPES.WAF]: {
    name: 'Cloudflare WAF',
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    role: 'Neutralizza attacchi DDoS',
    isSource: false,
    isDestination: false
  },
  [NODE_TYPES.BALANCER]: {
    name: 'Load Balancer',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.4)',
    role: 'Distribuzione round-robin',
    isSource: false,
    isDestination: false
  },
  [NODE_TYPES.ORIGIN]: {
    name: 'Web Origin',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    role: 'Server HTTP principale',
    isSource: false,
    isDestination: true
  },
  [NODE_TYPES.DATABASE]: {
    name: 'D1 Cluster',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
    role: 'Database Relazionale',
    isSource: false,
    isDestination: true
  },
  [NODE_TYPES.STORAGE]: {
    name: 'R2 Storage',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    role: 'Object Storage ad alta capacità',
    isSource: false,
    isDestination: true
  }
}
