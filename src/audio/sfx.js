// Motore audio procedurale nativo (Web Audio API)
// Zero file audio esterni, zero dipendenze, latenza zero.

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

let isMuted = false
try {
  isMuted = localStorage.getItem('ep_router_muted') === 'true'
} catch (e) {
  isMuted = false
}

export function isAudioMuted() {
  return isMuted
}

export function toggleAudio() {
  isMuted = !isMuted
  try {
    localStorage.setItem('ep_router_muted', String(isMuted))
  } catch (e) {}
  if (!isMuted) {
    playUiClick()
  }
  return isMuted
}

export function playUiClick() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.04)
  gain.gain.setValueAtTime(0.08, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.04)
}

export function playConnect() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(440, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08)
  gain.gain.setValueAtTime(0.12, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.08)
}

export function playDisconnect() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(520, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.07)
  gain.gain.setValueAtTime(0.09, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.07)
}

export function playPacketDeliver() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(523.25, now) // C5
  osc.frequency.setValueAtTime(659.25, now + 0.05) // E5
  gain.gain.setValueAtTime(0.14, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.14)
}

export function playCacheHit() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(880, now) // A5
  osc.frequency.setValueAtTime(1320, now + 0.04) // E6
  gain.gain.setValueAtTime(0.18, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.16)
}

export function playDdosBlocked() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(160, now)
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.07)
  gain.gain.setValueAtTime(0.1, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.09)
}

export function playPacketLoss() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(140, now)
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.12)
  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.12)
}

export function playLevelComplete() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return
  const notes = [440, 554.37, 659.25, 880] // A major chord
  const now = ctx.currentTime
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now + idx * 0.09)
    gain.gain.setValueAtTime(0.15, now + idx * 0.09)
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.28)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + idx * 0.09)
    osc.stop(now + idx * 0.09 + 0.28)
  })
}

export function playGameOver() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return
  const notes = [320, 260, 200, 140]
  const now = ctx.currentTime
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(freq, now + idx * 0.12)
    gain.gain.setValueAtTime(0.14, now + idx * 0.12)
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.25)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + idx * 0.12)
    osc.stop(now + idx * 0.12 + 0.25)
  })
}
