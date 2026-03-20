/**
 * Factory 3000 sound effects — synthesized via Web Audio API, no dependencies.
 * All sounds are generated procedurally so there's nothing to download.
 */

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
  }
  // Resume if suspended (browsers require a user gesture before audio plays)
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  return ctx
}

// ── Conveyor belt hum ─────────────────────────────────────────────────────────
// Returns a stop function so the caller can stop the hum.
let conveyorNodes: { gain: GainNode; osc: OscillatorNode } | null = null

export function startConveyorHum(): () => void {
  try {
    const c = getCtx()
    // Stop any previous hum
    stopConveyorHum()

    const gain = c.createGain()
    gain.gain.setValueAtTime(0, c.currentTime)
    gain.gain.linearRampToValueAtTime(0.08, c.currentTime + 0.3)
    gain.connect(c.destination)

    // Low mechanical rumble via sawtooth + filter
    const osc = c.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = 48
    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 220
    osc.connect(filter)
    filter.connect(gain)
    osc.start()

    conveyorNodes = { gain, osc }
    return stopConveyorHum
  } catch {
    return () => {}
  }
}

export function stopConveyorHum(): void {
  if (!conveyorNodes) return
  try {
    const c = getCtx()
    conveyorNodes.gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.4)
    const { osc } = conveyorNodes
    setTimeout(() => {
      try { osc.stop() } catch { /* already stopped */ }
    }, 500)
  } catch { /* ignore */ }
  conveyorNodes = null
}

// ── Celebration fanfare ───────────────────────────────────────────────────────
// A quick ascending arpeggio — fun and kid-friendly.
export function playFanfare(): void {
  try {
    const c = getCtx()
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const t = c.currentTime + i * 0.12
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.15, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      osc.connect(gain)
      gain.connect(c.destination)
      osc.start(t)
      osc.stop(t + 0.35)
    })
    // Extra sparkle — high shimmer
    const shimmerT = c.currentTime + 0.5
    const shimmer = c.createOscillator()
    const shimGain = c.createGain()
    shimmer.type = 'sine'
    shimmer.frequency.setValueAtTime(2093, shimmerT)
    shimmer.frequency.exponentialRampToValueAtTime(1047, shimmerT + 0.4)
    shimGain.gain.setValueAtTime(0.12, shimmerT)
    shimGain.gain.exponentialRampToValueAtTime(0.001, shimmerT + 0.5)
    shimmer.connect(shimGain)
    shimGain.connect(c.destination)
    shimmer.start(shimmerT)
    shimmer.stop(shimmerT + 0.55)
  } catch { /* ignore */ }
}

// ── Engine revv ───────────────────────────────────────────────────────────────
// Active while driving — call repeatedly or keep a reference.
let engineNodes: { gain: GainNode; osc: OscillatorNode; osc2: OscillatorNode } | null = null

export function startEngine(): () => void {
  try {
    const c = getCtx()
    stopEngine()

    const gain = c.createGain()
    gain.gain.setValueAtTime(0, c.currentTime)
    gain.gain.linearRampToValueAtTime(0.06, c.currentTime + 0.2)
    gain.connect(c.destination)

    const osc = c.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = 80
    const filter = c.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 300
    filter.Q.value = 2

    const osc2 = c.createOscillator()
    osc2.type = 'sawtooth'
    osc2.frequency.value = 83 // slight detune for richness

    osc.connect(filter)
    osc2.connect(filter)
    filter.connect(gain)
    osc.start()
    osc2.start()

    engineNodes = { gain, osc, osc2 }
    return stopEngine
  } catch {
    return () => {}
  }
}

export function updateEngineSpeed(speed: number): void {
  // speed: 0–1 (0 = idle, 1 = full throttle)
  if (!engineNodes) return
  try {
    const c = getCtx()
    const baseFreq = 80 + speed * 120
    engineNodes.osc.frequency.setTargetAtTime(baseFreq, c.currentTime, 0.05)
    engineNodes.osc2.frequency.setTargetAtTime(baseFreq * 1.04, c.currentTime, 0.05)
    engineNodes.gain.gain.setTargetAtTime(0.04 + speed * 0.08, c.currentTime, 0.05)
  } catch { /* ignore */ }
}

export function stopEngine(): void {
  if (!engineNodes) return
  try {
    const c = getCtx()
    engineNodes.gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.3)
    const { osc, osc2 } = engineNodes
    setTimeout(() => {
      try { osc.stop() } catch { /* already stopped */ }
      try { osc2.stop() } catch { /* already stopped */ }
    }, 400)
  } catch { /* ignore */ }
  engineNodes = null
}

// ── Horn ─────────────────────────────────────────────────────────────────────
export function playHorn(): void {
  try {
    const c = getCtx()
    const t = c.currentTime
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'square'
    osc.frequency.value = 440
    gain.gain.setValueAtTime(0.18, t)
    gain.gain.setValueAtTime(0.18, t + 0.25)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.4)
  } catch { /* ignore */ }
}

// ── Assembly station ding ─────────────────────────────────────────────────────
export function playStationDing(): void {
  try {
    const c = getCtx()
    const t = c.currentTime
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.1, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.45)
  } catch { /* ignore */ }
}
