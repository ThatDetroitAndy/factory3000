/**
 * Factory 3000 sound effects — synthesized via Web Audio API, no dependencies.
 * All sounds are generated procedurally so there's nothing to download.
 */

let ctx: AudioContext | null = null
let audioUnlocked = false

// iOS Safari requires a user gesture before AudioContext can play.
// We install a one-time capture-phase listener so the very first tap
// anywhere on the page resumes the context.
function installUnlockListener() {
  if (typeof document === 'undefined') return
  const handler = () => {
    audioUnlocked = true
    if (ctx && ctx.state === 'suspended') ctx.resume()
    document.removeEventListener('pointerdown', handler, true)
  }
  document.addEventListener('pointerdown', handler, true)
}
installUnlockListener()

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
  }
  // Resume if the user has already unlocked audio (non-iOS) or if unlocked via gesture
  if (ctx.state === 'suspended' && audioUnlocked) {
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
// Two-tone "beep-beep!" — two detuned sawtooth oscillators through a bandpass
// filter for that classic reedy car-horn timbre. Each honk has a slight upward
// pitch slide for a cartoony "squeezy" feel. Second honk is a step higher.
export function playHorn(): void {
  try {
    const c = getCtx()

    function honk(startTime: number, baseFreq: number) {
      // Bandpass filter shapes the raw sawtooth into a nasal horn tone
      const filter = c.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = baseFreq * 1.8
      filter.Q.value = 2.5

      const masterGain = c.createGain()
      // Punchy attack → short sustain → snappy decay
      masterGain.gain.setValueAtTime(0, startTime)
      masterGain.gain.linearRampToValueAtTime(0.32, startTime + 0.012)
      masterGain.gain.setValueAtTime(0.30, startTime + 0.18)
      masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.30)

      filter.connect(masterGain)
      masterGain.connect(c.destination)

      // Osc 1: slides up from slightly flat → adds cartoon "squeak" feel
      const o1 = c.createOscillator()
      o1.type = 'sawtooth'
      o1.frequency.setValueAtTime(baseFreq * 0.94, startTime)
      o1.frequency.linearRampToValueAtTime(baseFreq, startTime + 0.025)
      const g1 = c.createGain()
      g1.gain.value = 0.58
      o1.connect(g1)
      g1.connect(filter)
      o1.start(startTime)
      o1.stop(startTime + 0.38)

      // Osc 2: slightly sharp detune — creates beating/chorus richness
      const o2 = c.createOscillator()
      o2.type = 'sawtooth'
      o2.frequency.setValueAtTime(baseFreq * 0.97, startTime)
      o2.frequency.linearRampToValueAtTime(baseFreq * 1.014, startTime + 0.025)
      const g2 = c.createGain()
      g2.gain.value = 0.42
      o2.connect(g2)
      g2.connect(filter)
      o2.start(startTime)
      o2.stop(startTime + 0.38)

      // Sub-octave body — adds weight so it sounds like a real horn, not a toy beep
      const sub = c.createOscillator()
      sub.type = 'sine'
      sub.frequency.value = baseFreq * 0.5
      const subGain = c.createGain()
      subGain.gain.setValueAtTime(0, startTime)
      subGain.gain.linearRampToValueAtTime(0.12, startTime + 0.015)
      subGain.gain.setValueAtTime(0.10, startTime + 0.18)
      subGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.30)
      sub.connect(subGain)
      subGain.connect(c.destination)
      sub.start(startTime)
      sub.stop(startTime + 0.38)
    }

    // "Beep — BEEP!" — first honk at A4 area, second a minor third higher
    honk(c.currentTime, 415)
    honk(c.currentTime + 0.33, 494)
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

// ── Welding / chassis station sound ──────────────────────────────────────────
// Buzzy arc oscillator with rapid AM modulation — sounds like electric welding.
let weldNodes: { gain: GainNode; oscs: OscillatorNode[] } | null = null

export function startWeldingSound(): () => void {
  try {
    const c = getCtx()
    stopWeldingSound()

    const master = c.createGain()
    master.gain.setValueAtTime(0, c.currentTime)
    master.gain.linearRampToValueAtTime(0.07, c.currentTime + 0.15)
    master.connect(c.destination)

    // Main arc oscillator
    const arc = c.createOscillator()
    arc.type = 'sawtooth'
    arc.frequency.value = 140

    // Bandpass to shape into metallic buzz
    const filter = c.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 900
    filter.Q.value = 2.5

    const arcGain = c.createGain()
    arcGain.gain.value = 0.6

    // LFO for rapid amplitude modulation (arc flicker at ~40 Hz)
    const lfo = c.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 42
    const lfoGain = c.createGain()
    lfoGain.gain.value = 0.4
    lfo.connect(lfoGain)
    lfoGain.connect(arcGain.gain) // AM: gain oscillates around 0.6 ± 0.4

    arc.connect(filter)
    filter.connect(arcGain)
    arcGain.connect(master)

    // High harmonic shimmer (sparky)
    const shimmer = c.createOscillator()
    shimmer.type = 'square'
    shimmer.frequency.value = 560
    const shimGain = c.createGain()
    shimGain.gain.value = 0.025
    shimmer.connect(shimGain)
    shimGain.connect(master)

    arc.start()
    lfo.start()
    shimmer.start()

    weldNodes = { gain: master, oscs: [arc, lfo, shimmer] }
    return stopWeldingSound
  } catch {
    return () => {}
  }
}

export function stopWeldingSound(): void {
  if (!weldNodes) return
  try {
    const c = getCtx()
    weldNodes.gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.2)
    const oscs = weldNodes.oscs
    setTimeout(() => { oscs.forEach(o => { try { o.stop() } catch { /* stopped */ } }) }, 300)
  } catch { /* ignore */ }
  weldNodes = null
}

// ── Spray / paint station sound ───────────────────────────────────────────────
// White noise through bandpass — airy hiss like a spray gun.
let sprayNodes: { gain: GainNode; source: AudioBufferSourceNode } | null = null

export function startSpraySound(): () => void {
  try {
    const c = getCtx()
    stopSpraySound()

    // 2-second looping white noise buffer
    const bufSize = Math.floor(c.sampleRate * 2)
    const buf = c.createBuffer(1, bufSize, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1

    const source = c.createBufferSource()
    source.buffer = buf
    source.loop = true

    // Shape noise into a hiss: remove low rumble + cap high harshness
    const hi = c.createBiquadFilter()
    hi.type = 'highpass'
    hi.frequency.value = 2800

    const lo = c.createBiquadFilter()
    lo.type = 'lowpass'
    lo.frequency.value = 9000

    const gain = c.createGain()
    gain.gain.setValueAtTime(0, c.currentTime)
    gain.gain.linearRampToValueAtTime(0.13, c.currentTime + 0.22)

    source.connect(hi)
    hi.connect(lo)
    lo.connect(gain)
    gain.connect(c.destination)
    source.start()

    sprayNodes = { gain, source }
    return stopSpraySound
  } catch {
    return () => {}
  }
}

export function stopSpraySound(): void {
  if (!sprayNodes) return
  try {
    const c = getCtx()
    sprayNodes.gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.3)
    const src = sprayNodes.source
    setTimeout(() => { try { src.stop() } catch { /* stopped */ } }, 400)
  } catch { /* ignore */ }
  sprayNodes = null
}

// ── Stamp / name station sound ────────────────────────────────────────────────
// Percussive mechanical thud repeating every ~1.8s — like a stamp press.
let stampInterval: ReturnType<typeof setInterval> | null = null

function _playStampThud(): void {
  try {
    const c = getCtx()
    const t = c.currentTime

    // Noise burst (impact body)
    const bufSize = Math.floor(c.sampleRate * 0.22)
    const buf = c.createBuffer(1, bufSize, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1

    const src = c.createBufferSource()
    src.buffer = buf

    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1400, t)
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.18)

    const gain = c.createGain()
    gain.gain.setValueAtTime(0.28, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.20)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(c.destination)
    src.start(t)
    src.stop(t + 0.25)

    // Metallic click on impact
    const click = c.createOscillator()
    click.type = 'square'
    click.frequency.setValueAtTime(280, t)
    click.frequency.exponentialRampToValueAtTime(55, t + 0.06)
    const clickGain = c.createGain()
    clickGain.gain.setValueAtTime(0.14, t)
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
    click.connect(clickGain)
    clickGain.connect(c.destination)
    click.start(t)
    click.stop(t + 0.12)
  } catch { /* ignore */ }
}

export function startStampSound(): () => void {
  try {
    _playStampThud()
    stampInterval = setInterval(_playStampThud, 1800)
    return stopStampSound
  } catch {
    return () => {}
  }
}

export function stopStampSound(): void {
  if (stampInterval !== null) {
    clearInterval(stampInterval)
    stampInterval = null
  }
}
