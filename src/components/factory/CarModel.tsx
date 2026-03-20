'use client'

import { useRef, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { CarType } from '@/lib/types'

interface CarModelProps {
  carType: CarType
  color: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

const MODEL_PATHS: Record<CarType, string> = {
  car1: '/models/car1.glb',
  car2: '/models/car2.glb',
  car3: '/models/car3.glb',
}

// Scale and offset tuning per car type so they all sit nicely on the ground
const CAR_CONFIG: Record<CarType, { scale: number; yOffset: number }> = {
  car1: { scale: 1.6, yOffset: 0 },
  car2: { scale: 1.5, yOffset: 0 },
  car3: { scale: 1.5, yOffset: 0 },
}

// Material names in Kenney's toy car kit that represent the body paint
// We apply the user's chosen color to these
const BODY_MATERIAL_KEYWORDS = ['body', 'paint', 'car', 'vehicle', 'main', 'color', 'colour']

// Materials to skip (tires, glass, chrome, etc.)
const SKIP_MATERIAL_KEYWORDS = ['tire', 'tyre', 'wheel', 'rubber', 'glass', 'window', 'chrome', 'metal', 'detail', 'light', 'lamp']

function isBodyMaterial(mat: THREE.Material): boolean {
  const name = mat.name.toLowerCase()
  // Skip explicitly non-body materials
  if (SKIP_MATERIAL_KEYWORDS.some(k => name.includes(k))) return false
  // Include explicitly named body materials
  if (BODY_MATERIAL_KEYWORDS.some(k => name.includes(k))) return true
  // For unnamed materials, check if it's a colored (non-dark, non-white) material
  if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
    const color = (mat as THREE.MeshStandardMaterial).color
    if (!color) return false
    const r = color.r, g = color.g, b = color.b
    const brightness = (r + g + b) / 3
    const isTireDark = brightness < 0.15
    const isVeryLight = brightness > 0.85
    // Colored body panels are usually mid-range brightness
    return !isTireDark && !isVeryLight
  }
  return false
}

function GLBCar({ path, color, config }: { path: string; color: string; config: { scale: number; yOffset: number } }) {
  const { scene } = useGLTF(path)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    const bodyColor = new THREE.Color(color)

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Clone materials so we don't affect other instances
        if (Array.isArray(child.material)) {
          child.material = child.material.map((mat) => {
            const m = mat.clone()
            if (isBodyMaterial(m)) {
              (m as THREE.MeshStandardMaterial).color = bodyColor.clone()
              // Nice paint finish
              ;(m as THREE.MeshStandardMaterial).roughness = 0.3
              ;(m as THREE.MeshStandardMaterial).metalness = 0.15
            }
            return m
          })
        } else if (child.material) {
          child.material = child.material.clone()
          if (isBodyMaterial(child.material)) {
            ;(child.material as THREE.MeshStandardMaterial).color = bodyColor.clone()
            ;(child.material as THREE.MeshStandardMaterial).roughness = 0.3
            ;(child.material as THREE.MeshStandardMaterial).metalness = 0.15
          }
        }
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    return clone
  }, [scene, color])

  return (
    <group scale={config.scale} position={[0, config.yOffset, 0]}>
      <primitive object={clonedScene} />
    </group>
  )
}

// Preload all models
useGLTF.preload('/models/car1.glb')
useGLTF.preload('/models/car2.glb')
useGLTF.preload('/models/car3.glb')

export default function CarModel({
  carType,
  color,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: CarModelProps) {
  const ref = useRef<THREE.Group>(null)
  const path = MODEL_PATHS[carType]
  const config = CAR_CONFIG[carType]

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      <GLBCar path={path} color={color} config={config} />
    </group>
  )
}
