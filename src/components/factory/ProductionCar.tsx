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
  // Belt top in world space: belt group Y(0) + BELT_HEIGHT(1.2) + half box(0.1) = 1.3
  // Wheel bottom local offsets: car1/car2 = -0.05 (center 0.25-0.4 minus radius 0.3-0.45)
  //                              car3      =  0.0  (center 0.5 minus radius 0.5)
  const BELT_TOP = 1.3
  const wheelBottomLocal = carType === 'car3' ? 0.0 : -0.05
  const BELT_Y = BELT_TOP - wheelBottomLocal  // wheels sit flush on belt surface
  const BELT_X = 0
  // Start from the NAME station (world Z=0) — car was already there in builder.
  // Just roll off the end of the belt into the parking lot.
  const START_Z = 0
  const END_Z = 52
  const TOTAL_DISTANCE = END_Z - START_Z
  const SPEED = 10

  // Initialize smooth camera from current position — no jarring jump
  useEffect(() => {
    smoothCamPos.current.copy(camera.position)
    smoothLookAt.current.copy(new THREE.Vector3(BELT_X, BELT_Y + 1.2, START_Z))

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

    // ── Camera: side-view follow for the roll-off, then sweep to front ──
    // Car starts at name station (Z=0) and rolls to parking lot (Z=52)
    const pullIn = Math.min(t * 2, 1)
    let cx = 14 - pullIn * 3   // 14 → 11 — side view, gentle pull-in
    let cy = 6 - pullIn * 1.0  // 6 → 5
    let cz = 2 - pullIn * 1    // 2 → 1

    // Final 30%: sweep camera around to face the car from the front
    if (t > 0.7) {
      const swing = (t - 0.7) / 0.3 // 0→1
      const ease = swing * swing * (3 - 2 * swing) // smoothstep
      cx = (1 - ease) * cx + ease * 0             // side → center
      cy = (1 - ease) * cy + ease * 6
      cz = (1 - ease) * cz + ease * -12           // in front of car
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
