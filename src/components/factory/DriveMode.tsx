'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
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

// Per-vehicle profiles — drive feel (velocity) + physics body (mass, damping)
// go-kart: light, snappy, high turnrate; pickup: medium; SUV: heavy/planted
const VEHICLE_PROFILES = {
  car1: { topSpeed: 22, acceleration: 18, brakeForce: 35, friction: 9,  reverseMax: 10, maxTurnRate: 2.8, mass: 60,  linearDamping: 1.2, angularDamping: 12 },
  car2: { topSpeed: 16, acceleration: 11, brakeForce: 24, friction: 6,  reverseMax: 7,  maxTurnRate: 2.2, mass: 140, linearDamping: 1.5, angularDamping: 15 },
  car3: { topSpeed: 12, acceleration: 7,  brakeForce: 16, friction: 4,  reverseMax: 5,  maxTurnRate: 2.0, mass: 220, linearDamping: 1.8, angularDamping: 18 },
} as const

export default function DriveMode({ carType, color, startPosition, onExit }: DriveModeProps) {
  const bodyRef = useRef<RapierRigidBody>(null)
  const { camera } = useThree()
  const p = VEHICLE_PROFILES[carType]

  // Velocity is still tracked as a scalar — same tuned feel as before
  const velocity = useRef(0)

  // Camera smoothing
  const camPos = useRef(new THREE.Vector3())
  const camLookAt = useRef(new THREE.Vector3())
  const pos = useRef(new THREE.Vector3(...startPosition))

  // Horn debounce
  const hornWasPressed = useRef(false)

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
    startEngine()

    // Init camera behind car
    const startFwd = new THREE.Vector3(0, 0, 1)
    camPos.current.copy(pos.current).addScaledVector(startFwd, -10).add(new THREE.Vector3(0, 5, 0))
    camLookAt.current.copy(pos.current).add(new THREE.Vector3(0, 1.5, 0))
    camera.position.copy(camPos.current)
    camera.lookAt(camLookAt.current)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      driveInput.forward = driveInput.backward = driveInput.left = driveInput.right = driveInput.horn = false
      stopEngine()
    }
  }, [camera, onExit])

  useFrame((_, delta) => {
    if (!bodyRef.current) return

    // ── Velocity logic (same tuning as before) ──────────────────────────────
    if (driveInput.forward) {
      if (velocity.current < 0) {
        velocity.current += p.brakeForce * delta
        if (velocity.current > 0) velocity.current = 0
      } else {
        velocity.current += p.acceleration * delta
      }
    } else if (driveInput.backward) {
      if (velocity.current > 0.1) {
        velocity.current -= p.brakeForce * delta
        if (velocity.current < 0) velocity.current = 0
      } else {
        velocity.current -= p.acceleration * 0.55 * delta
      }
    } else {
      if (velocity.current > 0) {
        velocity.current -= p.friction * delta
        if (velocity.current < 0) velocity.current = 0
      } else if (velocity.current < 0) {
        velocity.current += p.friction * delta
        if (velocity.current > 0) velocity.current = 0
      }
    }
    velocity.current = THREE.MathUtils.clamp(velocity.current, -p.reverseMax, p.topSpeed)

    // ── Get forward direction from Rapier body rotation ──────────────────────
    const rot = bodyRef.current.rotation()
    const quat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat)
    forward.y = 0
    if (forward.lengthSq() > 0.001) forward.normalize()

    // ── Apply velocity to physics body, preserve y for gravity ──────────────
    const linvel = bodyRef.current.linvel()
    bodyRef.current.setLinvel(
      { x: forward.x * velocity.current, y: linvel.y, z: forward.z * velocity.current },
      true
    )

    // ── Speed-proportional steering — set angular velocity on Y ─────────────
    let angY = 0
    if (Math.abs(velocity.current) > 0.3) {
      const speedFactor = Math.min(1, Math.abs(velocity.current) / p.topSpeed)
      const turnRate = p.maxTurnRate * (1 - 0.55 * speedFactor)
      const turnDir = velocity.current > 0 ? 1 : -1
      if (driveInput.left)  angY =  turnRate * turnDir
      if (driveInput.right) angY = -turnRate * turnDir
    }
    bodyRef.current.setAngvel({ x: 0, y: angY, z: 0 }, true)

    // ── Engine sound ─────────────────────────────────────────────────────────
    updateEngineSpeed(Math.abs(velocity.current) / p.topSpeed)

    // ── Horn ─────────────────────────────────────────────────────────────────
    if (driveInput.horn && !hornWasPressed.current) { playHorn(); hornWasPressed.current = true }
    if (!driveInput.horn) hornWasPressed.current = false

    // ── Third-person camera ──────────────────────────────────────────────────
    const translation = bodyRef.current.translation()
    pos.current.set(translation.x, translation.y, translation.z)

    const camOffset = forward.clone().multiplyScalar(-10).add(new THREE.Vector3(0, 5, 0))
    const targetCamPos = pos.current.clone().add(camOffset)
    const targetLookAt = pos.current.clone().add(new THREE.Vector3(0, 1.5, 0))

    camPos.current.lerp(targetCamPos, 6 * delta)
    camLookAt.current.lerp(targetLookAt, 6 * delta)
    camera.position.copy(camPos.current)
    camera.lookAt(camLookAt.current)
  })

  // Spawn 1.5 units above ground so the car drops with a satisfying plop on entry
  const spawnY = startPosition[1] + 1.5

  return (
    <RigidBody
      ref={bodyRef}
      position={[startPosition[0], spawnY, startPosition[2]]}
      enabledRotations={[false, true, false]}
      mass={p.mass}
      linearDamping={p.linearDamping}
      angularDamping={p.angularDamping}
      restitution={0.05}
      friction={1.2}
      colliders={false}
    >
      {/* Collider at car body center — snug fit so wheels visually touch ground */}
      <CuboidCollider args={[1.2, 0.65, 2.1]} position={[0, 0.5, 0]} />
      <CarModel carType={carType} color={color} scale={1.3} />
    </RigidBody>
  )
}
