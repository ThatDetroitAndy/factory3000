'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

interface CameraControlsProps {
  /** Target position to fly to (set externally via search) */
  flyToTarget?: [number, number, number] | null
  /** Whether drive mode is active (disables orbit controls) */
  driveMode?: boolean
  /** Whether production animation is running (disables orbit, camera controlled by ProductionCar) */
  isProducing?: boolean
}

export default function CameraControls({ flyToTarget, driveMode = false, isProducing = false }: CameraControlsProps) {
  const controlsRef = useRef<any>(null)
  const isFlying = useRef(false)
  const flyProgress = useRef(0)
  const flyStart = useRef(new THREE.Vector3())
  const flyEnd = useRef(new THREE.Vector3())
  const flyTargetLookAt = useRef(new THREE.Vector3())

  useEffect(() => {
    if (flyToTarget && controlsRef.current) {
      isFlying.current = true
      flyProgress.current = 0
      flyStart.current.copy(controlsRef.current.object.position)
      // Position camera above and behind the target
      flyEnd.current.set(flyToTarget[0] + 5, flyToTarget[1] + 8, flyToTarget[2] + 12)
      flyTargetLookAt.current.set(flyToTarget[0], flyToTarget[1] + 1, flyToTarget[2])
    }
  }, [flyToTarget])

  useFrame((_, delta) => {
    if (isFlying.current && controlsRef.current) {
      flyProgress.current = Math.min(flyProgress.current + delta * 0.7, 1)
      const t = easeInOutCubic(flyProgress.current)

      const camera = controlsRef.current.object
      camera.position.lerpVectors(flyStart.current, flyEnd.current, t)
      controlsRef.current.target.lerp(flyTargetLookAt.current, t * 0.8)
      controlsRef.current.update()

      if (flyProgress.current >= 1) {
        isFlying.current = false
      }
    }
  })

  if (driveMode || isProducing) return null

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 2, -10]}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={5}
      maxDistance={400}
      enableDamping
      dampingFactor={0.05}
    />
  )
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
