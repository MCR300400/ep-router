import { NODE_TYPES, PACKET_TYPES, NODE_CONFIG } from './types.js'
import {
  playConnect,
  playDisconnect,
  playPacketDeliver,
  playCacheHit,
  playDdosBlocked,
  playPacketLoss,
  playLevelComplete,
  playGameOver
} from '../audio/sfx.js'

export class RouterGameEngine {
  constructor(canvas, onStateChange) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.onStateChange = onStateChange

    this.width = 800
    this.height = 600
    this.dpr = window.devicePixelRatio || 1

    this.level = null
    this.nodes = []
    this.cables = []
    this.packets = []
    this.particles = []
    this.floatingTexts = []

    this.gameState = 'playing' // playing, paused, level_complete, game_over
    this.gameSpeed = 1
    this.score = 0
    this.sla = 100
    this.deliveredCount = 0
    this.cacheHits = 0
    this.ddosBlocked = 0
    this.droppedPackets = 0
    this.ddosHits = 0
    this.totalLatencySum = 0
    this.latencyCount = 0

    this.spawnTimer = 0
    this.animFrameId = null
    this.lastTime = 0

    // Interazioni
    this.selectedNode = null
    this.pointerPos = null
    this.hoveredCable = null
    this.balancerIndexes = new Map()

    this.initCanvas()
  }

  initCanvas() {
    this.updateSize()
  }

  updateSize() {
    const rect = this.canvas.parentElement.getBoundingClientRect()
    const w = Math.max(320, Math.floor(rect.width))
    const h = Math.max(380, Math.floor(rect.height))

    this.width = w
    this.height = h
    this.dpr = Math.min(window.devicePixelRatio || 1, 2) // cap at 2 for performance

    this.canvas.width = Math.floor(w * this.dpr)
    this.canvas.height = Math.floor(h * this.dpr)
    this.canvas.style.width = `${w}px`
    this.canvas.style.height = `${h}px`

    // Ricalcola coordinate pixel nodi
    this.recomputeNodeCoordinates()
  }

  recomputeNodeCoordinates() {
    // Margini di sicurezza per non tagliare etichette o nodi
    const isMobile = this.width < 640
    const padX = isMobile ? 36 : 64
    const padTop = isMobile ? 38 : 50
    const padBottom = isMobile ? 84 : 96
    const availW = this.width - padX * 2
    const availH = this.height - (padTop + padBottom)

    for (const node of this.nodes) {
      node.px = padX + node.x * availW
      node.py = padTop + node.y * availH
      node.radius = isMobile ? 21 : 26
      node.hitRadius = isMobile ? 38 : 34 // touch target generoso
    }
  }

  loadLevel(levelConfig) {
    this.level = levelConfig
    this.gameState = 'playing'
    this.score = 0
    this.sla = 100
    this.deliveredCount = 0
    this.cacheHits = 0
    this.ddosBlocked = 0
    this.droppedPackets = 0
    this.ddosHits = 0
    this.totalLatencySum = 0
    this.latencyCount = 0
    this.spawnTimer = 0.5 // primo pacchetto a 0.5s

    this.selectedNode = null
    this.pointerPos = null
    this.hoveredCable = null
    this.packets = []
    this.particles = []
    this.floatingTexts = []
    this.balancerIndexes.clear()

    // Copia profonda nodi
    this.nodes = levelConfig.nodes.map(n => ({
      ...n,
      px: 0,
      py: 0,
      radius: 26,
      hitRadius: 34,
      queue: [],
      maxQueue: 5,
      processCooldown: 0
    }))

    this.recomputeNodeCoordinates()

    // Cavi iniziali
    this.cables = []
    if (levelConfig.initialCables) {
      for (const c of levelConfig.initialCables) {
        this.addCable(c.from, c.to, true)
      }
    }

    this.notifyState()
  }

  addCable(fromId, toId, silent = false) {
    if (fromId === toId) return false
    // Evita duplicati
    const exists = this.cables.some(c =>
      (c.fromId === fromId && c.toId === toId) ||
      (c.fromId === toId && c.toId === fromId)
    )
    if (exists) return false

    // Controllo limite cavi per livello
    if (this.level.maxCables && this.cables.length >= this.level.maxCables) {
      this.addFloatingText('Limite cavi raggiunto!', this.width / 2, this.height / 2, '#ef4444')
      playPacketLoss()
      return false
    }

    const id = `cable_${fromId}_${toId}_${Date.now()}`
    this.cables.push({
      id,
      fromId,
      toId,
      pulseOffset: 0
    })

    if (!silent) {
      playConnect()
      const n1 = this.getNodeById(fromId)
      const n2 = this.getNodeById(toId)
      if (n1 && n2) {
        this.createBurstParticles((n1.px + n2.px) / 2, (n1.py + n2.py) / 2, '#f97316', 8)
      }
    }
    this.notifyState()
    return true
  }

  removeCable(cableId) {
    const idx = this.cables.findIndex(c => c.id === cableId)
    if (idx !== -1) {
      const c = this.cables[idx]
      const n1 = this.getNodeById(c.fromId)
      const n2 = this.getNodeById(c.toId)
      if (n1 && n2) {
        this.createBurstParticles((n1.px + n2.px) / 2, (n1.py + n2.py) / 2, '#a1a1aa', 6)
      }
      this.cables.splice(idx, 1)
      playDisconnect()
      this.notifyState()
    }
  }

  getNodeById(id) {
    return this.nodes.find(n => n.id === id)
  }

  getCablesForNode(nodeId) {
    return this.cables.filter(c => c.fromId === nodeId || c.toId === nodeId)
  }

  // Trova il nodo collegato sull'altro estremo
  getConnectedNodeId(cable, currentId) {
    return cable.fromId === currentId ? cable.toId : cable.fromId
  }

  // Generazione dinamica di pacchetti
  spawnPacket() {
    if (this.gameState !== 'playing') return

    // Trova i client attivi
    const clientNodes = this.nodes.filter(n => n.type === NODE_TYPES.CLIENT)
    if (clientNodes.length === 0) return

    // Scegli client casuale o basato sul tipo
    const sourceNode = clientNodes[Math.floor(Math.random() * clientNodes.length)]

    // Scegli tipo pacchetto consentito nel livello
    const availableTypes = this.level.packetTypes
    let chosenType = availableTypes[Math.floor(Math.random() * availableTypes.length)]

    // Se il client si chiama "Botnet", forza packet DDOS se abilitato
    if (sourceNode.label.toLowerCase().includes('botnet')) {
      chosenType = PACKET_TYPES.DDOS
    } else if (chosenType.id === 'DDOS' && !sourceNode.label.toLowerCase().includes('botnet')) {
      // client normale: preferisci HTTP/SQL/MEDIA
      const safe = availableTypes.filter(t => t.id !== 'DDOS')
      if (safe.length > 0) {
        chosenType = safe[Math.floor(Math.random() * safe.length)]
      }
    }

    const packet = {
      id: `pkt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: chosenType,
      currentNodeId: sourceNode.id,
      state: 'in_node', // 'in_node' | 'in_transit'
      cableId: null,
      fromId: null,
      targetNodeId: null,
      progress: 0,
      ttl: chosenType.ttl,
      maxTtl: chosenType.ttl,
      speed: chosenType.speed,
      createdAt: Date.now()
    }

    // Inserisci in coda o inoltra
    if (sourceNode.queue.length < sourceNode.maxQueue) {
      sourceNode.queue.push(packet)
      this.packets.push(packet)
    } else {
      // Buffer Overflow sull'ingress
      this.handlePacketDrop(packet, sourceNode, 'Buffer Overflow!')
    }
  }

  // Routing dei pacchetti dai nodi verso i cavi
  routePacketFromNode(node, packet) {
    const cables = this.getCablesForNode(node.id)
    if (cables.length === 0) {
      // Nessun cavo collegato
      return false
    }

    let chosenCable = null
    let targetNodeId = null

    if (node.type === NODE_TYPES.BALANCER) {
      // Round robin bilanciato
      let curIdx = this.balancerIndexes.get(node.id) || 0
      chosenCable = cables[curIdx % cables.length]
      targetNodeId = this.getConnectedNodeId(chosenCable, node.id)
      this.balancerIndexes.set(node.id, curIdx + 1)
    } else {
      // Routing euristico intelligente
      // 1. Se è DDOS e c'è un cavo che porta al WAF, sceglilo!
      if (packet.type.id === 'DDOS') {
        const toWaf = cables.find(c => {
          const n = this.getNodeById(this.getConnectedNodeId(c, node.id))
          return n && n.type === NODE_TYPES.WAF
        })
        if (toWaf) {
          chosenCable = toWaf
          targetNodeId = this.getConnectedNodeId(chosenCable, node.id)
        }
      }

      // 2. Se è HTTP e c'è una Cache collegata, preferisci la Cache
      if (!chosenCable && packet.type.id === 'HTTP') {
        const toCache = cables.find(c => {
          const n = this.getNodeById(this.getConnectedNodeId(c, node.id))
          return n && n.type === NODE_TYPES.CACHE
        })
        if (toCache) {
          chosenCable = toCache
          targetNodeId = this.getConnectedNodeId(chosenCable, node.id)
        }
      }

      // 3. Se c'è un cavo che porta direttamente alla destinazione del pacchetto, usalo
      if (!chosenCable && packet.type.targetType) {
        const direct = cables.find(c => {
          const n = this.getNodeById(this.getConnectedNodeId(c, node.id))
          return n && n.type === packet.type.targetType
        })
        if (direct) {
          chosenCable = direct
          targetNodeId = this.getConnectedNodeId(chosenCable, node.id)
        }
      }

      // 4. Fallback: scegli il primo cavo verso un nodo a destra (x maggiore) o con coda minore
      if (!chosenCable) {
        // Ordina per nodi con queue minore
        const sorted = [...cables].sort((a, b) => {
          const na = this.getNodeById(this.getConnectedNodeId(a, node.id))
          const nb = this.getNodeById(this.getConnectedNodeId(b, node.id))
          return (na ? na.queue.length : 0) - (nb ? nb.queue.length : 0)
        })
        chosenCable = sorted[0]
        targetNodeId = this.getConnectedNodeId(chosenCable, node.id)
      }
    }

    if (chosenCable && targetNodeId) {
      packet.state = 'in_transit'
      packet.cableId = chosenCable.id
      packet.fromId = node.id
      packet.targetNodeId = targetNodeId
      packet.progress = 0
      return true
    }
    return false
  }

  // Risoluzione arrivo pacchetto al nodo target
  handlePacketArrival(packet, targetNode) {
    // 1. Minaccia DDOS
    if (packet.type.id === 'DDOS') {
      if (targetNode.type === NODE_TYPES.WAF) {
        // Neutralizzato dal WAF!
        this.ddosBlocked++
        this.score += 300
        this.sla = Math.min(100, this.sla + 2)
        this.addFloatingText('🛡️ DDOS BLOCCATO +300', targetNode.px, targetNode.py - 20, '#3b82f6')
        this.createBurstParticles(targetNode.px, targetNode.py, '#3b82f6', 16)
        playDdosBlocked()
        this.removePacket(packet)
        this.checkWinCondition()
        return
      } else if (targetNode.type === NODE_TYPES.ORIGIN || targetNode.type === NODE_TYPES.DATABASE || targetNode.type === NODE_TYPES.STORAGE) {
        // Colpito il server!
        this.ddosHits++
        const dmg = packet.type.slaDamage || 15
        this.sla = Math.max(0, this.sla - dmg)
        this.addFloatingText(`💥 DDOS HIT! -${dmg}% SLA`, targetNode.px, targetNode.py - 20, '#ef4444')
        this.createBurstParticles(targetNode.px, targetNode.py, '#ef4444', 20)
        playPacketLoss()
        this.removePacket(packet)
        this.checkLossCondition()
        return
      }
    }

    // 2. Cache Hit per HTTP
    if (packet.type.id === 'HTTP' && targetNode.type === NODE_TYPES.CACHE) {
      this.cacheHits++
      this.deliveredCount++
      this.score += 250
      this.recordLatency(12) // Edge cache è quasi istantanea ~12ms
      this.addFloatingText('⚡ CACHE HIT +250 (12ms)', targetNode.px, targetNode.py - 20, '#06b6d4')
      this.createBurstParticles(targetNode.px, targetNode.py, '#06b6d4', 16)
      playCacheHit()
      this.removePacket(packet)
      this.checkWinCondition()
      return
    }

    // 3. Consegna a destinazione corretta
    if (targetNode.type === packet.type.targetType) {
      this.deliveredCount++
      this.score += packet.type.score
      const simulatedLatency = Math.round(35 + (1 - packet.ttl / packet.maxTtl) * 80)
      this.recordLatency(simulatedLatency)
      this.addFloatingText(`✓ ${packet.type.label} +${packet.type.score}`, targetNode.px, targetNode.py - 20, packet.type.color)
      this.createBurstParticles(targetNode.px, targetNode.py, packet.type.color, 14)
      playPacketDeliver()
      this.removePacket(packet)
      this.checkWinCondition()
      return
    }

    // 4. Protocol Mismatch (es. SQL query su Web Origin)
    if (NODE_CONFIG[targetNode.type].isDestination && targetNode.type !== packet.type.targetType) {
      this.handlePacketDrop(packet, targetNode, 'Protocol Mismatch!')
      return
    }

    // 5. Nodo intermedio (Router, Balancer o WAF per traffico lecito)
    if (targetNode.queue.length < targetNode.maxQueue) {
      packet.state = 'in_node'
      packet.currentNodeId = targetNode.id
      packet.cableId = null
      packet.targetNodeId = null
      packet.progress = 0
      targetNode.queue.push(packet)
    } else {
      // Buffer overflow su nodo intermedio
      this.handlePacketDrop(packet, targetNode, 'Buffer Overflow!')
    }
  }

  handlePacketDrop(packet, node, reason) {
    this.droppedPackets++
    this.sla = Math.max(0, this.sla - (packet.type.id === 'DDOS' ? 6 : 3))
    const x = node ? node.px : this.width / 2
    const y = node ? node.py - 15 : this.height / 2
    this.addFloatingText(`✕ ${reason} (-3% SLA)`, x, y, '#ef4444')
    if (node) {
      this.createBurstParticles(x, y, '#ef4444', 10)
    }
    playPacketLoss()
    this.removePacket(packet)
    this.checkLossCondition()
  }

  recordLatency(ms) {
    this.totalLatencySum += ms
    this.latencyCount++
  }

  get averageLatency() {
    if (this.latencyCount === 0) return 38
    return Math.round(this.totalLatencySum / this.latencyCount)
  }

  removePacket(packet) {
    // Rimuovi da code nodi
    for (const n of this.nodes) {
      const idx = n.queue.indexOf(packet)
      if (idx !== -1) n.queue.splice(idx, 1)
    }
    const pIdx = this.packets.indexOf(packet)
    if (pIdx !== -1) this.packets.splice(pIdx, 1)
  }

  checkWinCondition() {
    if (this.level.isEndless) return // endless non finisce mai
    const meetsDelivery = this.deliveredCount >= this.level.targetDeliveries
    const meetsCache = !this.level.targetCacheHits || this.cacheHits >= this.level.targetCacheHits
    const meetsDdos = !this.level.targetDdosBlocked || this.ddosBlocked >= this.level.targetDdosBlocked
    const meetsSla = this.sla >= this.level.minSla

    if (meetsDelivery && meetsCache && meetsDdos && meetsSla) {
      this.gameState = 'level_complete'
      playLevelComplete()
      this.createCelebrationParticles()
      this.notifyState()
    }
  }

  checkLossCondition() {
    if (this.sla <= (this.level.minSla ? this.level.minSla - 35 : 40) || this.sla <= 15) {
      this.gameState = 'game_over'
      playGameOver()
      this.notifyState()
    }
  }

  addFloatingText(text, x, y, color = '#ffffff') {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      alpha: 1,
      vy: -1.2,
      life: 0
    })
  }

  createBurstParticles(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1.2 + Math.random() * 3.5
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: 1.8 + Math.random() * 2.2,
        alpha: 1,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4
      })
    }
  }

  createCelebrationParticles() {
    const colors = ['#f97316', '#10b981', '#06b6d4', '#3b82f6', '#a855f7']
    for (let i = 0; i < 70; i++) {
      const x = this.width * (0.2 + Math.random() * 0.6)
      const y = this.height * (0.2 + Math.random() * 0.6)
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 6
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: 2.5 + Math.random() * 3,
        alpha: 1,
        life: 0,
        maxLife: 1.2 + Math.random() * 0.8
      })
    }
  }

  // Loop di simulazione principale
  start() {
    this.lastTime = performance.now()
    const loop = (time) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1) // cap delta time
      this.lastTime = time

      this.update(dt)
      this.render()

      this.animFrameId = requestAnimationFrame(loop)
    }
    this.animFrameId = requestAnimationFrame(loop)
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
  }

  update(dt) {
    if (this.gameState === 'paused' || this.gameState === 'level_complete' || this.gameState === 'game_over') {
      // Aggiorna solo particelle e testi fluttuanti per fluidità visiva
      this.updateFx(dt)
      return
    }

    const effectiveDt = dt * this.gameSpeed

    // 1. Spawning pacchetti
    this.spawnTimer -= effectiveDt
    if (this.spawnTimer <= 0) {
      this.spawnPacket()
      let interval = this.level.spawnInterval
      if (this.level.isEndless) {
        // In endless diventa gradualmente più veloce
        interval = Math.max(0.6, 1.8 - (this.deliveredCount * 0.02))
      }
      this.spawnTimer = interval * (0.85 + Math.random() * 0.3)
    }

    // 2. Processa code dei nodi (inoltro verso i cavi)
    for (const node of this.nodes) {
      if (node.queue.length > 0) {
        node.processCooldown -= effectiveDt
        if (node.processCooldown <= 0) {
          const packetToRoute = node.queue[0]
          const routed = this.routePacketFromNode(node, packetToRoute)
          if (routed) {
            node.queue.shift()
            node.processCooldown = 0.28 / this.gameSpeed // cadenza tra pacchetti consecutivi
          }
        }
      }
    }

    // 3. Movimento pacchetti lungo i cavi
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const packet = this.packets[i]

      // TTL Countdown
      packet.ttl -= effectiveDt
      if (packet.ttl <= 0) {
        this.handlePacketDrop(packet, this.getNodeById(packet.currentNodeId), 'TTL Timeout!')
        continue
      }

      if (packet.state === 'in_transit') {
        const fromNode = this.getNodeById(packet.fromId)
        const toNode = this.getNodeById(packet.targetNodeId)

        if (!fromNode || !toNode) {
          this.removePacket(packet)
          continue
        }

        // Calcola distanza pixel
        const dx = toNode.px - fromNode.px
        const dy = toNode.py - fromNode.py
        const dist = Math.hypot(dx, dy)
        const travelSpeed = (packet.speed * this.gameSpeed) / Math.max(1, dist)

        packet.progress += travelSpeed * dt

        if (packet.progress >= 1) {
          packet.progress = 1
          this.handlePacketArrival(packet, toNode)
        }
      }
    }

    // 4. Offset animazione cavi (effetto fibra che pulsa)
    for (const cable of this.cables) {
      cable.pulseOffset = (cable.pulseOffset + effectiveDt * 35) % 100
    }

    // 5. Particelle ed effetti
    this.updateFx(dt)
  }

  updateFx(dt) {
    // Floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i]
      ft.y += ft.vy * (dt * 60)
      ft.life += dt
      ft.alpha = Math.max(0, 1 - ft.life / 1.1)
      if (ft.life >= 1.1) {
        this.floatingTexts.splice(i, 1)
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx * (dt * 60)
      p.y += p.vy * (dt * 60)
      p.life += dt
      p.alpha = Math.max(0, 1 - p.life / p.maxLife)
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1)
      }
    }
  }

  // Rendering grafico Canvas 2D
  render() {
    const ctx = this.ctx
    ctx.save()
    ctx.scale(this.dpr, this.dpr)

    // Sfondo dark grafite pulito
    ctx.fillStyle = '#121316'
    ctx.fillRect(0, 0, this.width, this.height)

    // Griglia a punti sottile stile Blueprint / Circuit
    this.renderGrid(ctx)

    // Cavi in fibra ottica
    this.renderCables(ctx)

    // Cavo in fase di tracciamento (drag o selezione)
    this.renderDragCable(ctx)

    // Pacchetti di dati in transito
    this.renderPackets(ctx)

    // Nodi di rete
    this.renderNodes(ctx)

    // Particelle
    this.renderParticles(ctx)

    // Testi fluttuanti punteggio/eventi
    this.renderFloatingTexts(ctx)

    ctx.restore()
  }

  renderGrid(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
    const step = 32
    for (let x = 16; x < this.width; x += step) {
      for (let y = 16; y < this.height; y += step) {
        ctx.fillRect(x, y, 1.5, 1.5)
      }
    }
  }

  renderCables(ctx) {
    for (const cable of this.cables) {
      const n1 = this.getNodeById(cable.fromId)
      const n2 = this.getNodeById(cable.toId)
      if (!n1 || !n2) continue

      const isHovered = this.hoveredCable && this.hoveredCable.id === cable.id

      // Bagliore esterno cavo
      ctx.save()
      ctx.strokeStyle = isHovered ? 'rgba(239, 68, 68, 0.4)' : 'rgba(249, 115, 22, 0.18)'
      ctx.lineWidth = isHovered ? 6 : 4
      ctx.beginPath()
      ctx.moveTo(n1.px, n1.py)
      ctx.lineTo(n2.px, n2.py)
      ctx.stroke()

      // Linea fibra ottica centrale
      ctx.strokeStyle = isHovered ? '#ef4444' : 'rgba(249, 115, 22, 0.7)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(n1.px, n1.py)
      ctx.lineTo(n2.px, n2.py)
      ctx.stroke()

      // Pulsi di luce sui cavi (animazione dati in movimento)
      ctx.strokeStyle = '#fdba74'
      ctx.lineWidth = 2.5
      ctx.setLineDash([8, 24])
      ctx.lineDashOffset = -cable.pulseOffset
      ctx.beginPath()
      ctx.moveTo(n1.px, n1.py)
      ctx.lineTo(n2.px, n2.py)
      ctx.stroke()
      ctx.setLineDash([])

      // Badge elimina al centro cavo
      const midX = (n1.px + n2.px) / 2
      const midY = (n1.py + n2.py) / 2

      ctx.fillStyle = isHovered ? '#ef4444' : '#1f2128'
      ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(midX, midY, 11, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Icona ✕
      ctx.strokeStyle = isHovered ? '#ffffff' : '#a1a1aa'
      ctx.lineWidth = 1.6
      const sz = 4
      ctx.beginPath()
      ctx.moveTo(midX - sz, midY - sz)
      ctx.lineTo(midX + sz, midY + sz)
      ctx.moveTo(midX + sz, midY - sz)
      ctx.lineTo(midX - sz, midY + sz)
      ctx.stroke()

      ctx.restore()
    }
  }

  renderDragCable(ctx) {
    if (!this.selectedNode || !this.pointerPos) return

    ctx.save()
    ctx.strokeStyle = '#f97316'
    ctx.lineWidth = 2.5
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    ctx.moveTo(this.selectedNode.px, this.selectedNode.py)
    ctx.lineTo(this.pointerPos.x, this.pointerPos.y)
    ctx.stroke()
    ctx.setLineDash([])

    // Piccolo bersaglio alla punta
    ctx.fillStyle = 'rgba(249, 115, 22, 0.35)'
    ctx.beginPath()
    ctx.arc(this.pointerPos.x, this.pointerPos.y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  renderNodes(ctx) {
    for (const node of this.nodes) {
      const cfg = NODE_CONFIG[node.type]
      const isSelected = this.selectedNode && this.selectedNode.id === node.id

      ctx.save()

      // 1. Alone luminoso esterno
      ctx.fillStyle = isSelected ? 'rgba(249, 115, 22, 0.45)' : cfg.glow
      ctx.beginPath()
      ctx.arc(node.px, node.py, node.radius + (isSelected ? 10 : 6), 0, Math.PI * 2)
      ctx.fill()

      // 2. Cerchio corpo principale del nodo
      ctx.fillStyle = '#191a20'
      ctx.strokeStyle = isSelected ? '#f97316' : cfg.color
      ctx.lineWidth = isSelected ? 3.5 : 2.2
      ctx.beginPath()
      ctx.arc(node.px, node.py, node.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // 3. Indicatore di coda / buffer (pallini o corona)
      if (node.queue.length > 0) {
        const dots = Math.min(node.queue.length, node.maxQueue)
        const startAngle = -Math.PI / 2
        for (let i = 0; i < dots; i++) {
          const a = startAngle + (i / node.maxQueue) * Math.PI * 2
          const dotR = node.radius + 5
          const dx = node.px + Math.cos(a) * dotR
          const dy = node.py + Math.sin(a) * dotR
          ctx.fillStyle = dots >= node.maxQueue ? '#ef4444' : '#f97316'
          ctx.beginPath()
          ctx.arc(dx, dy, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // 4. Icona grafica vettoriale centrale del nodo
      this.drawNodeIcon(ctx, node, cfg)

      // 5. Etichetta descrittiva sotto al nodo
      ctx.font = '600 11px var(--font-sans, system-ui)'
      ctx.textAlign = 'center'
      ctx.fillStyle = isSelected ? '#f97316' : '#f4f4f5'
      ctx.fillText(node.label, node.px, node.py + node.radius + 15)

      // Sottoetichetta con tipo
      ctx.font = '500 9px var(--font-mono, monospace)'
      ctx.fillStyle = '#71717a'
      ctx.fillText(cfg.name.toUpperCase(), node.px, node.py + node.radius + 26)

      ctx.restore()
    }
  }

  drawNodeIcon(ctx, node, cfg) {
    const x = node.px
    const y = node.py
    ctx.strokeStyle = cfg.color
    ctx.fillStyle = cfg.color
    ctx.lineWidth = 1.8

    switch (node.type) {
      case NODE_TYPES.CLIENT: {
        // Globo / Utente
        ctx.beginPath()
        ctx.arc(x, y - 3, 5, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x, y + 8, 9, Math.PI * 1.15, Math.PI * 1.85)
        ctx.stroke()
        break
      }
      case NODE_TYPES.ROUTER: {
        // Chip / Hub con frecce
        ctx.beginPath()
        ctx.strokeRect(x - 6, y - 6, 12, 12)
        ctx.fillRect(x - 2, y - 2, 4, 4)
        break
      }
      case NODE_TYPES.CACHE: {
        // Fulmine / CDN
        ctx.beginPath()
        ctx.moveTo(x + 1, y - 9)
        ctx.lineTo(x - 5, y - 1)
        ctx.lineTo(x, y - 1)
        ctx.lineTo(x - 2, y + 9)
        ctx.lineTo(x + 5, y + 1)
        ctx.lineTo(x, y + 1)
        ctx.closePath()
        ctx.fill()
        break
      }
      case NODE_TYPES.WAF: {
        // Scudo
        ctx.beginPath()
        ctx.moveTo(x, y - 8)
        ctx.lineTo(x + 7, y - 4)
        ctx.lineTo(x + 7, y + 2)
        ctx.quadraticCurveTo(x + 7, y + 8, x, y + 10)
        ctx.quadraticCurveTo(x - 7, y + 8, x - 7, y + 2)
        ctx.lineTo(x - 7, y - 4)
        ctx.closePath()
        ctx.stroke()
        break
      }
      case NODE_TYPES.BALANCER: {
        // Bilanciatore a due frecce
        ctx.beginPath()
        ctx.moveTo(x - 7, y - 4)
        ctx.lineTo(x + 7, y - 4)
        ctx.moveTo(x - 7, y + 4)
        ctx.lineTo(x + 7, y + 4)
        ctx.stroke()
        break
      }
      case NODE_TYPES.ORIGIN: {
        // Rack Server Web
        ctx.strokeRect(x - 7, y - 7, 14, 5)
        ctx.strokeRect(x - 7, y + 1, 14, 5)
        ctx.fillRect(x + 3, y - 5, 2, 1)
        ctx.fillRect(x + 3, y + 3, 2, 1)
        break
      }
      case NODE_TYPES.DATABASE: {
        // Cilindro database
        ctx.beginPath()
        ctx.ellipse(x, y - 5, 7, 3, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x - 7, y - 5)
        ctx.lineTo(x - 7, y + 5)
        ctx.ellipse(x, y + 5, 7, 3, 0, 0, Math.PI)
        ctx.lineTo(x + 7, y - 5)
        ctx.stroke()
        break
      }
      case NODE_TYPES.STORAGE: {
        // Cubo R2 Object Storage
        ctx.strokeRect(x - 6, y - 6, 12, 12)
        ctx.beginPath()
        ctx.moveTo(x - 6, y - 6)
        ctx.lineTo(x + 6, y + 6)
        ctx.stroke()
        break
      }
    }
  }

  renderPackets(ctx) {
    for (const packet of this.packets) {
      if (packet.state !== 'in_transit') continue

      const fromNode = this.getNodeById(packet.fromId)
      const toNode = this.getNodeById(packet.targetNodeId)
      if (!fromNode || !toNode) continue

      const curX = fromNode.px + (toNode.px - fromNode.px) * packet.progress
      const curY = fromNode.py + (toNode.py - fromNode.py) * packet.progress

      ctx.save()

      // Glow esterno pacchetto
      ctx.fillStyle = packet.type.glowColor
      ctx.beginPath()
      ctx.arc(curX, curY, 11, 0, Math.PI * 2)
      ctx.fill()

      // Anello TTL (Time To Live) circolare che si consuma
      const ttlRatio = Math.max(0, packet.ttl / packet.maxTtl)
      ctx.strokeStyle = ttlRatio > 0.4 ? packet.type.color : '#ef4444'
      ctx.lineWidth = 1.8
      ctx.beginPath()
      ctx.arc(curX, curY, 7.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ttlRatio)
      ctx.stroke()

      // Nucleo solido pacchetto
      ctx.fillStyle = packet.type.color
      ctx.beginPath()
      ctx.arc(curX, curY, 4.8, 0, Math.PI * 2)
      ctx.fill()

      // Punto centrale bianco puro
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(curX, curY, 1.8, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }
  }

  renderParticles(ctx) {
    for (const p of this.particles) {
      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  renderFloatingTexts(ctx) {
    for (const ft of this.floatingTexts) {
      ctx.save()
      ctx.globalAlpha = ft.alpha
      ctx.font = '700 12px var(--font-mono, monospace)'
      ctx.textAlign = 'center'
      ctx.fillStyle = ft.color
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 4
      ctx.fillText(ft.text, ft.x, ft.y)
      ctx.restore()
    }
  }

  // Gestione Input (Mouse & Touch unificato per mobile)
  findNodeAt(x, y) {
    for (const node of this.nodes) {
      const dist = Math.hypot(node.px - x, node.py - y)
      if (dist <= node.hitRadius) {
        return node
      }
    }
    return null
  }

  findCableAt(x, y) {
    // Rileva click sul badge centrale del cavo
    for (const cable of this.cables) {
      const n1 = this.getNodeById(cable.fromId)
      const n2 = this.getNodeById(cable.toId)
      if (!n1 || !n2) continue
      const midX = (n1.px + n2.px) / 2
      const midY = (n1.py + n2.py) / 2
      const dist = Math.hypot(midX - x, midY - y)
      if (dist <= 18) {
        return cable
      }
    }
    return null
  }

  handlePointerDown(x, y) {
    // 1. Controllo click su pulsante elimina cavo
    const clickedCable = this.findCableAt(x, y)
    if (clickedCable) {
      this.removeCable(clickedCable.id)
      this.selectedNode = null
      this.pointerPos = null
      return
    }

    // 2. Controllo click su nodo
    const clickedNode = this.findNodeAt(x, y)
    if (clickedNode) {
      if (this.selectedNode && this.selectedNode.id !== clickedNode.id) {
        // Secondo nodo toccato: crea collegamento!
        this.addCable(this.selectedNode.id, clickedNode.id)
        this.selectedNode = null
        this.pointerPos = null
      } else {
        // Primo nodo selezionato
        this.selectedNode = clickedNode
        this.pointerPos = { x, y }
      }
    } else {
      // Click a vuoto: deseleziona
      this.selectedNode = null
      this.pointerPos = null
    }
    this.notifyState()
  }

  handlePointerMove(x, y) {
    if (this.selectedNode) {
      this.pointerPos = { x, y }
    }
    // Hover cable check
    const cable = this.findCableAt(x, y)
    this.hoveredCable = cable
    this.canvas.style.cursor = cable || this.findNodeAt(x, y) ? 'pointer' : 'default'
  }

  handlePointerUp(x, y) {
    if (this.selectedNode) {
      const targetNode = this.findNodeAt(x, y)
      if (targetNode && targetNode.id !== this.selectedNode.id) {
        this.addCable(this.selectedNode.id, targetNode.id)
        this.selectedNode = null
        this.pointerPos = null
      }
    }
  }

  togglePause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused'
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing'
    }
    this.notifyState()
  }

  setSpeed(spd) {
    this.gameSpeed = spd
    this.notifyState()
  }

  clearAllCables() {
    this.cables = []
    playDisconnect()
    this.notifyState()
  }

  notifyState() {
    if (this.onStateChange) {
      this.onStateChange({
        gameState: this.gameState,
        gameSpeed: this.gameSpeed,
        score: this.score,
        sla: Math.round(this.sla),
        deliveredCount: this.deliveredCount,
        cacheHits: this.cacheHits,
        ddosBlocked: this.ddosBlocked,
        droppedPackets: this.droppedPackets,
        cablesCount: this.cables.length,
        maxCables: this.level ? this.level.maxCables : 8,
        selectedNode: this.selectedNode ? this.selectedNode.label : null,
        averageLatency: this.averageLatency
      })
    }
  }
}
