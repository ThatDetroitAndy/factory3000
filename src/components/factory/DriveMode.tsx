'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import CarModel from './CarModel'
import type { CarType } from '@/lib/types'
import { driveInput } from '@/lib/driveInput'
import { startEngine, stopEngine, updateEngineSpeed, playHorn } from '@/lib/sounds'

interface DriveModeProps {
  carType: CarType
  color: string
  startPosition: [number, number, number]
  onExit: () => void
}

// Per-vehicle physics profiles — each car feels distinct
const VEHICLE_PROFILES = {
  car1: { topSpeed: 22, acceleration: 18, brakeForce: 35, friction: 9,  reverseMax: 10, maxTurnRate: 2.8 }, // go-kart: zippy, responsive
  car2: { topSpeed: 16, acceleration: 11, brakeForce: 24, friction: 6,  reverseMax: 7,  maxTurnRate: 2.2 }, // pickup: solid, steady
  car3: { topSpeed: 12, acceleration: 7,  brakeForce: 16, friction: 4,  reverseMax: 5,  maxTurnRate: 2.0 }, // SUV: heavy, powerful
} as const

export default function DriveMode({ carType, color, startPosition, onExit }: DriveModeProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  // Physics state
  const velocity = useRef(0)
  const yaw = useRef(0)
  const pos = useRef(new THREE.Vector3(...startPosition))

  // Camera smoothing
  const camPos = useRef(new THREE.Vector3())
  const camLookAt = useRef(new THREE.Vector3())

  // Horn debounce
  const hornWasPressed = useRef(false)

  // Keyboard listeners
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    driveInput.forward  = true; break
        case 'KeyS': case 'ArrowDown':  driveInput.backward = true; break
        case 'KeyA': case 'ArrowLeft':  driveInput.left     = true; break
        case 'KeyD': case 'ArrowRight': driveInput.right    = true; break
        case 'KeyH': case 'Space':      driveInput.horn     = true; break
        case 'Escape':                  onExit(); break
      }
    }
    const up = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    driveInput.forward  = false; break
        case 'KeyS': case 'ArrowDown':  driveInput.backward = false; break
        case 'KeyA': case 'ArrowLeft':  driveInput.left     = false; break
        case 'KeyD': case 'ArrowRight': driveInput.right    = false; break
        case 'KeyH': case 'Space':      driveInput.horn     = false; break
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    // Start engine sound
    startEngine()

    // Init camera behind car
    const dir = new THREE.Vector3(Math.sin(yaw.current), 0, Math.cos(yaw.current))
    camPos.current.copy(pos.current).addScaledVector(dir, -10).add(new THREE.Vector3(0, 5, 0))
    camLookAt.current.copy(pos.current).add(new THREE.Vector3(0, 1.5, 0))
    camera.position.copy(camPos.current)
    camera.lookAt(camLookAt.current)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      // Reset inputs on unmount so nothing sticks
      driveInput.forward  = false
      driveInput.backward = false
      driveInput.left     = false
      driveInput.right    = false
      driveInput.horn     = false
      stopEngine()
    }
  }, [camera, onExit])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const p = VEHICLE_PROFILES[carType]

    // --- Acceleration / braking physics ---
    if (driveInput.forward) {
      if (velocity.current < 0) {
        // Braking hard from reverse
        velocity.current += p.brakeForce * delta
        if (velocity.current > 0) velocity.current = 0
      } else {
        // Accelerating forward
        velocity.current += p.acceleration * delta
      }
    } else if (driveInput.backward) {
      if (velocity.current > 0.1) {
        // Braking hard from forward
        velocity.current -= p.brakeForce * delta
        if (velocity.current < 0) velocity.current = 0
      } else {
        // Reversing
        velocity.current -= p.acceleration * 0.55 * delta
      }
    } else {
      // Coasting — friction brings velocity to zero
      if (velocity.current > 0) {
        velocity.current -= p.friction * delta
        if (velocity.current < 0) velocity.current = 0
      } else if (velocity.current < 0) {
        velocity.current += p.friction * delta
        if (velocity.current > 0) velocity.current = 0
      }
    }

    // Clamp to speed limits
    velocity.current = THREE.MathUtils.clamp(velocity.current, -p.reverseMax, p.topSpeed)

    // --- Speed-proportional turning: tight at low speed, wide at high speed ---
    if (Math.abs(velocity.current) > 0.3) {
      const speedFactor = Math.min(1, Math.abs(velocity.current) / p.topSpeed)
      // Turn rate is tighter at low speed (1.0x) and wider at high speed (0.45x)
      const turnRate = p.maxTurnRate * (1 - 0.55 * speedFactor)
      const turnDir = velocity.current > 0 ? 1 : -1
      if (driveInput.left)  yaw.current += turnRate * delta * turnDir
      if (driveInput.right) yaw.current -= turnRate * delta * turnDir
    }

    // Move
    const forward = new THREE.Vector3(Math.sin(yaw.current), 0, Math.cos(yaw.current))
    pos.current.addScaledVector(forward, velocity.current * delta)

    // Apply to mesh
    groupRef.current.position.copy(pos.current)
    groupRef.current.rotation.y = yaw.current

    // Engine sound — normalize to this vehicle's top speed
    const speedNorm = Math.abs(velocity.current) / p.topSpeed
    updateEngineSpeed(speedNorm)

    // Horn
    if (driveInput.horn && !hornWasPressed.current) {
      playHorn()
      hornWasPressed.current = true
    }
    if (!driveInput.horn) hornWasPressed.current = false

    // Third-person camera: sit 10 units behind and 5 above
    const camOffset = forward.clone().multiplyScalar(-10).add(new THREE.Vector3(0, 5, 0))
    const targetCamPos = pos.current.clone().add(camOffset)
    const targetLookAt = pos.current.clone().add(new THREE.Vector3(0, 1.5, 0))

    camPos.current.lerp(targetCamPos, 6 * delta)
    camLookAt.current.lerp(targetLookAt, 6 * delta)

    camera.position.copy(camPos.current)
    camera.lookAt(camLookAt.current)
  })

  return (
    <group ref={groupRef} position={startPosition}>
      <CarModel carType={carType} color={color} scale={1.3} />
    </group>
  )
}
