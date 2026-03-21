'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import CarModel from './CarModel'
import type { CarType } from '@/lib/types'
import { startConveyorHum, stopConveyorHum } from '@/lib/sounds'

interface ProductionCarProps {
  carType: CarType
  color: string
  onComplete: () => void
}

export default function ProductionCar({ carType, color, onComplete }: ProductionCarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const progress = useRef(0)
  const [completed, setCompleted] = useState(false)
  const { camera } = useThree()

  // Smooth camera state
  const smoothCamPos = useRef(new THREE.Vector3())
  const smoothLookAt = useRef(new THREE.Vector3())

  // Conveyor path constants
  // Car rides on top of the belt surface (belt surface top ≈ y 1.3, car wheel bottoms at 0)
  const BELT_Y = 1.35
  const BELT_X = 0
  const START_Z = -70
  const END_Z = 50
  const TOTAL_DISTANCE = END_Z - START_Z
  const SPEED = 12

  // Initialize camera to a side-view starting position
  useEffect(() => {
    const startPos = new THREE.Vector3(BELT_X, BELT_Y, START_Z)
    // Side-view offset: camera is to the +X side, above, no Z offset
    // This avoids clipping through factory back/front walls
    const startOffset = new THREE.Vector3(16, 7, 4)
    smoothCamPos.current.copy(startPos).add(startOffset)
    smoothLookAt.current.copy(startPos).add(new THREE.Vector3(0, 1.2, 0))
    camera.position.copy(smoothCamPos.current)
    camera.lookAt(smoothLookAt.current)

    startConveyorHum()
    return () => stopConveyorHum()
  }, [camera])

  useFrame((_, delta) => {
    if (completed || !groupRef.current) return

    progress.current += (delta * SPEED) / TOTAL_DISTANCE

    if (progress.current >= 1) {
      progress.current = 1
      setCompleted(true)
      setTimeout(() => onComplete(), 1500)
      return
    }

    const t = progress.current
    const z = START_Z + t * TOTAL_DISTANCE
    const carPos = new THREE.Vector3(BELT_X, BELT_Y, z)

    // Slight wobble for mechanical feel
    carPos.x += Math.sin(t * 40) * 0.03
    groupRef.current.position.copy(carPos)

    // ── Camera: pure side-view, no Z offset so we never clip factory walls ──
    // X offset: start wide (16), gently pull in to 12 as car clears the factory
    const pullIn = Math.min(t * 1.5, 1)
    let cx = 16 - pullIn * 4   // 16 → 12
    let cy = 7 - pullIn * 1.5  // 7 → 5.5 — drop slightly as we zoom in
    let cz = 4 - pullIn * 2    // 4 → 2 — small forward lean

    // Final ~20%: sweep camera around to face the car from the front
    if (t > 0.8) {
      const swing = (t - 0.8) / 0.2 // 0→1
      // Ease the swing
      const ease = swing * swing * (3 - 2 * swing) // smoothstep
      cx = (1 - ease) * cx + ease * 0             // side → center
      cy = (1 - ease) * cy + ease * 6             // same height
      cz = (1 - ease) * cz + ease * -14           // in front of car
    }

    const targetCamPos = carPos.clone().add(new THREE.Vector3(cx, cy, cz))
    const targetLookAt = carPos.clone().add(new THREE.Vector3(0, 1.2, 0))

    // Smooth follow — tighter tracking (lerp factor 4)
    smoothCamPos.current.lerp(targetCamPos, 4 * delta)
    smoothLookAt.current.lerp(targetLookAt, 4 * delta)

    camera.position.copy(smoothCamPos.current)
    camera.lookAt(smoothLookAt.current)
  })

  return (
    <group ref={groupRef} position={[BELT_X, BELT_Y, START_Z]}>
      <CarModel carType={carType} color={color} />
    </group>
  )
}
