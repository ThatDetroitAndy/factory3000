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

  // Camera follow offsets
  const smoothCamPos = useRef(new THREE.Vector3())
  const smoothLookAt = useRef(new THREE.Vector3())

  // Conveyor path
  // Belt top in world space = belt group Y(0) + BELT_HEIGHT(1.2) + half box height(0.1) = 1.3
  // Wheel bottom local offsets: car1/car2 = -0.05 (center 0.25/0.4 minus radius 0.3/0.45)
  //                              car3      =  0.0  (center 0.5 minus radius 0.5)
  const BELT_TOP = 1.3
  const wheelBottomLocal = carType === 'car3' ? 0.0 : -0.05
  const BELT_Y = BELT_TOP - wheelBottomLocal  // place car so wheels sit flush on belt
  const BELT_X = 0
  const START_Z = -70
  const END_Z = 50
  const TOTAL_DISTANCE = END_Z - START_Z
  const SPEED = 12

  // Cinematic side-dolly: camera stays on the left side of the belt (-X),
  // perpendicular to belt travel direction, slightly above the car.
  const SIDE_OFFSET_X = -13  // left side, opposite the assembly stations (which are at +X)
  const SIDE_OFFSET_Y = 5    // comfortable overhead angle

  // Initialize camera to starting position and start conveyor sound
  useEffect(() => {
    const startPos = new THREE.Vector3(BELT_X, BELT_Y, START_Z)
    smoothCamPos.current.set(BELT_X + SIDE_OFFSET_X, BELT_Y + SIDE_OFFSET_Y, START_Z)
    smoothLookAt.current.copy(startPos).add(new THREE.Vector3(0, 1.5, 0))
    camera.position.copy(smoothCamPos.current)
    camera.lookAt(smoothLookAt.current)
    startConveyorHum()
    return () => stopConveyorHum()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera])

  useFrame((_, delta) => {
    if (completed || !groupRef.current) return

    progress.current += (delta * SPEED) / TOTAL_DISTANCE

    if (progress.current >= 1) {
      progress.current = 1
      setCompleted(true)

      // Hold on the parked car for a beat, then complete
      setTimeout(() => onComplete(), 1500)
      return
    }

    const z = START_Z + progress.current * TOTAL_DISTANCE
    const carPos = new THREE.Vector3(BELT_X, BELT_Y, z)

    // Slight wobble for mechanical feel
    carPos.x += Math.sin(progress.current * 40) * 0.03
    groupRef.current.position.copy(carPos)

    // Cinematic side-dolly: camera tracks perfectly alongside the car from the left.
    // Gradually tightens (zooms in) over the first half, then swings to a 3/4 front
    // reveal shot as the car finishes the line.
    const zoomIn = Math.min(progress.current * 2, 1) // 0→1 over first half
    let offX = SIDE_OFFSET_X + zoomIn * 3  // tighten from -13 → -10
    let offY = SIDE_OFFSET_Y - zoomIn * 1  // drop from 5 → 4
    let offZ = 0                            // pure side view — camera stays alongside

    // Final 20%: swing around to a 3/4 front-left reveal (camera moves ahead of car
    // to face the car's front — headlights are at +Z on all models)
    if (progress.current > 0.8) {
      const swing = (progress.current - 0.8) / 0.2  // 0→1
      const eased = swing * swing                    // ease-in for drama
      offX = THREE.MathUtils.lerp(offX, -5, eased)
      offY = THREE.MathUtils.lerp(offY, 6, eased)
      offZ = THREE.MathUtils.lerp(offZ, 14, eased)  // swing ahead to face car front
    }

    const targetCamPos = carPos.clone().add(new THREE.Vector3(offX, offY, offZ))
    const targetLookAt = carPos.clone().add(new THREE.Vector3(0, 1.5, 0))

    // Smooth follow
    smoothCamPos.current.lerp(targetCamPos, 3 * delta)
    smoothLookAt.current.lerp(targetLookAt, 3 * delta)

    camera.position.copy(smoothCamPos.current)
    camera.lookAt(smoothLookAt.current)
  })

  return (
    <group ref={groupRef} position={[BELT_X, BELT_Y, START_Z]}>
      <CarModel carType={carType} color={color} />
    </group>
  )
}
