'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import CarModel from './CarModel'
import type { CarType } from '@/lib/types'

// World-space Z positions for each station (belt group is at world [0,0,-10])
// TYPE station: local [6,0,-30] → world z=-40
// PAINT station: local [6,0,-10] → world z=-20
// NAME station: local [6,0, 10] → world z=0
const BELT_Y = 1.35
const STATION_Z: Record<string, number> = {
  chassis: -40,
  paint: -20,
  name: 0,
}

// Camera: positioned to +X side of the belt, looking across at car + robot arm
const CAMERA_CONFIGS: Record<string, { pos: THREE.Vector3; lookAt: THREE.Vector3 }> = {
  chassis: {
    pos: new THREE.Vector3(22, 8, -38),
    lookAt: new THREE.Vector3(2, 2.5, -40),
  },
  paint: {
    pos: new THREE.Vector3(22, 8, -18),
    lookAt: new THREE.Vector3(2, 2.5, -20),
  },
  name: {
    pos: new THREE.Vector3(22, 8, 2),
    lookAt: new THREE.Vector3(2, 2.5, 0),
  },
}

interface AssemblyLineCarProps {
  station: 'chassis' | 'paint' | 'name'
  carType: CarType | null
  color: string | null
}

export default function AssemblyLineCar({ station, carType, color }: AssemblyLineCarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const carPosRef = useRef(new THREE.Vector3(0, BELT_Y, STATION_Z.chassis))
  const camPosRef = useRef(new THREE.Vector3())
  const camLookRef = useRef(new THREE.Vector3())
  const initialized = useRef(false)
  const { camera } = useThree()

  // Snap camera to starting position on mount (no lerp for first frame)
  useEffect(() => {
    if (!initialized.current) {
      const cfg = CAMERA_CONFIGS[station]
      camPosRef.current.copy(cfg.pos)
      camLookRef.current.copy(cfg.lookAt)
      camera.position.copy(cfg.pos)
      camera.lookAt(cfg.lookAt)
      initialized.current = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Smooth car along the belt toward the current station
    const targetZ = STATION_Z[station]
    carPosRef.current.x += (0 - carPosRef.current.x) * Math.min(6 * delta, 1)
    carPosRef.current.y += (BELT_Y - carPosRef.current.y) * Math.min(6 * delta, 1)
    carPosRef.current.z += (targetZ - carPosRef.current.z) * Math.min(6 * delta, 1)
    groupRef.current.position.copy(carPosRef.current)

    // Smooth camera to current station view
    const cfg = CAMERA_CONFIGS[station]
    camPosRef.current.lerp(cfg.pos, Math.min(2.5 * delta, 1))
    camLookRef.current.lerp(cfg.lookAt, Math.min(2.5 * delta, 1))
    camera.position.copy(camPosRef.current)
    camera.lookAt(camLookRef.current)
  })

  return (
    <group ref={groupRef} position={[0, BELT_Y, STATION_Z.chassis]}>
      <CarModel
        carType={carType ?? 'car1'}
        color={color ?? '#999999'}
      />
    </group>
  )
}
