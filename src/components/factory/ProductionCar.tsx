'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import CarModel from './CarModel'
import type { CarType } from '@/lib/types'

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
  const cameraOffset = useRef(new THREE.Vector3(8, 6, 12))
  const cameraLookAt = useRef(new THREE.Vector3())
  const smoothCamPos = useRef(new THREE.Vector3())
  const smoothLookAt = useRef(new THREE.Vector3())

  // Conveyor path
  const BELT_Y = 1.4
  const BELT_X = 0
  const START_Z = -70
  const END_Z = 50
  const TOTAL_DISTANCE = END_Z - START_Z
  const SPEED = 12

  // Initialize camera to starting position
  useEffect(() => {
    if (groupRef.current) {
      const startPos = new THREE.Vector3(BELT_X, BELT_Y, START_Z)
      smoothCamPos.current.copy(startPos).add(cameraOffset.current)
      smoothLookAt.current.copy(startPos)
      camera.position.copy(smoothCamPos.current)
      camera.lookAt(smoothLookAt.current)
    }
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

    // Dynamic camera: starts high/far, swoops in closer as car progresses
    const zoomIn = Math.min(progress.current * 2, 1) // ramp up over first half
    const dynamicOffset = cameraOffset.current.clone()
    dynamicOffset.x = 8 - zoomIn * 3       // get closer on X
    dynamicOffset.y = 6 - zoomIn * 1.5      // drop lower
    dynamicOffset.z = 12 - zoomIn * 4       // get closer on Z

    // At the end, swing around to face the car from the front
    if (progress.current > 0.8) {
      const swing = (progress.current - 0.8) / 0.2 // 0→1 over last 20%
      dynamicOffset.x = (1 - swing) * dynamicOffset.x + swing * -6
      dynamicOffset.z = (1 - swing) * dynamicOffset.z + swing * -8
    }

    const targetCamPos = carPos.clone().add(dynamicOffset)
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
