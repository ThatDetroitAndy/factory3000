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

const TURN_SPEED = 2.2       // rad/s
const DRIVE_SPEED = 18       // units/s forward
const REVERSE_SPEED = 8      // units/s backward
const DRAG = 4               // velocity damping

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

    // Turning — only when moving
    const isMoving = Math.abs(velocity.current) > 0.1
    if (isMoving) {
      const turnDir = velocity.current > 0 ? 1 : -1
      if (driveInput.left)  yaw.current += TURN_SPEED * delta * turnDir
      if (driveInput.right) yaw.current -= TURN_SPEED * delta * turnDir
    }

    // Acceleration
    if (driveInput.forward)  velocity.current += DRIVE_SPEED * delta
    if (driveInput.backward) velocity.current -= REVERSE_SPEED * delta
    // Clamp
    velocity.current = THREE.MathUtils.clamp(velocity.current, -REVERSE_SPEED, DRIVE_SPEED)
    // Drag
    velocity.current *= Math.pow(1 - DRAG * delta, 1)
    if (Math.abs(velocity.current) < 0.01) velocity.current = 0

    // Move
    const forward = new THREE.Vector3(Math.sin(yaw.current), 0, Math.cos(yaw.current))
    pos.current.addScaledVector(forward, velocity.current * delta)

    // Apply to mesh
    groupRef.current.position.copy(pos.current)
    groupRef.current.rotation.y = yaw.current

    // Engine sound
    const speedNorm = Math.abs(velocity.current) / DRIVE_SPEED
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
