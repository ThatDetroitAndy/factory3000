'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

type BuilderStep = 'chassis' | 'paint' | 'name'

// Camera position + lookAt for each builder station (world space)
// Follows the same side-view offset as ProductionCar: +16X, +7Y, +4Z ahead
//   chassis → car at [0, 1.35, -40]  → cam [16, 8.35, -36], look [0, 2.55, -40]
//   paint   → car at [0, 1.35, -20]  → cam [16, 8.35, -16], look [0, 2.55, -20]
//   name    → car at [0, 1.35,   0]  → cam [16, 8.35,   4], look [0, 2.55,   0]
const BUILDER_CAM: Record<BuilderStep, readonly [number, number, number, number, number, number]> = {
  chassis: [16, 8.35, -36, 0, 2.55, -40],
  paint:   [16, 8.35, -16, 0, 2.55, -20],
  name:    [16, 8.35,   4, 0, 2.55,   0],
}

interface CameraControlsProps {
  /** Target position to fly to (set externally via search) */
  flyToTarget?: [number, number, number] | null
  /** Whether drive mode is active (disables orbit controls) */
  driveMode?: boolean
  /** Whether production animation is running (disables orbit, camera controlled by ProductionCar) */
  isProducing?: boolean
  /** Current builder station — when set, camera tracks the station */
  builderStep?: BuilderStep | null
  /** Whether celebration overlay is active (disables orbit so CelebrationOverlay controls camera) */
  isCelebrating?: boolean
}

export default function CameraControls({
  flyToTarget,
  driveMode = false,
  isProducing = false,
  builderStep,
  isCelebrating = false,
}: CameraControlsProps) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const isFlying = useRef(false)
  const flyProgress = useRef(0)
  const flyStart = useRef(new THREE.Vector3())
  const flyEnd = useRef(new THREE.Vector3())
  const flyTargetLookAt = useRef(new THREE.Vector3())

  // Smooth lookAt vector for builder mode (avoids per-frame allocations)
  const builderLookAt = useRef(new THREE.Vector3(0, 2.55, -40))

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
    // ── Builder camera mode ──────────────────────────────────────────────────
    if (builderStep) {
      const cfg = BUILDER_CAM[builderStep]
      const [px, py, pz, lx, ly, lz] = cfg
      const k = Math.min(1, 2.8 * delta)

      // Component-wise lerp — no per-frame Vector3 allocations
      camera.position.x += (px - camera.position.x) * k
      camera.position.y += (py - camera.position.y) * k
      camera.position.z += (pz - camera.position.z) * k

      builderLookAt.current.x += (lx - builderLookAt.current.x) * k
      builderLookAt.current.y += (ly - builderLookAt.current.y) * k
      builderLookAt.current.z += (lz - builderLookAt.current.z) * k

      camera.lookAt(builderLookAt.current)
      return
    }

    // ── FlyTo animation (search result) ─────────────────────────────────────
    if (isFlying.current && controlsRef.current) {
      flyProgress.current = Math.min(flyProgress.current + delta * 0.7, 1)
      const t = easeInOutCubic(flyProgress.current)

      const cam = controlsRef.current.object
      cam.position.lerpVectors(flyStart.current, flyEnd.current, t)
      controlsRef.current.target.lerp(flyTargetLookAt.current, t * 0.8)
      controlsRef.current.update()

      if (flyProgress.current >= 1) {
        isFlying.current = false
      }
    }
  })

  if (driveMode || isProducing || !!builderStep || isCelebrating) return null

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
