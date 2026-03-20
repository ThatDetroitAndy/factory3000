'use client'

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { SUBSCRIBER_COUNT } from '@/lib/constants'

interface CrateWarehouseProps {
  builtCount: number
}

export default function CrateWarehouse({ builtCount }: CrateWarehouseProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const remainingCrates = SUBSCRIBER_COUNT - builtCount
  const VISIBLE_CRATE_COUNT = Math.min(remainingCrates, 5000)
  const CRATE_SIZE = 1.8
  const COLS = 40
  const ROWS_PER_STACK = 6
  const COL_SPACING = 2.2
  const ROW_SPACING = 2.2

  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Warm wood color for crates
  const crateColor = useMemo(() => new THREE.Color('#C4883C'), [])

  useMemo(() => {
    if (!meshRef.current) return

    let idx = 0
    const floorRows = Math.ceil(VISIBLE_CRATE_COUNT / (COLS * ROWS_PER_STACK))

    for (let stackY = 0; stackY < ROWS_PER_STACK && idx < VISIBLE_CRATE_COUNT; stackY++) {
      for (let row = 0; row < floorRows && idx < VISIBLE_CRATE_COUNT; row++) {
        for (let col = 0; col < COLS && idx < VISIBLE_CRATE_COUNT; col++) {
          dummy.position.set(
            col * COL_SPACING - (COLS * COL_SPACING) / 2,
            stackY * CRATE_SIZE + CRATE_SIZE / 2,
            -(row * ROW_SPACING) - 80
          )
          dummy.rotation.set(0, (Math.random() - 0.5) * 0.08, 0)
          dummy.updateMatrix()
          meshRef.current.setMatrixAt(idx, dummy.matrix)
          idx++
        }
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  }, [VISIBLE_CRATE_COUNT, dummy])

  return (
    <group>
      {/* Crates — warm wood tone */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, VISIBLE_CRATE_COUNT]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[CRATE_SIZE, CRATE_SIZE, CRATE_SIZE]} />
        <meshStandardMaterial color={crateColor} roughness={0.85} metalness={0.05} />
      </instancedMesh>

      {/* Big sign — "WAITING TO BE BUILT" */}
      <group position={[0, 14, -82]}>
        <mesh castShadow>
          <boxGeometry args={[35, 7, 1]} />
          <meshStandardMaterial color="#FF6B4A" roughness={0.5} />
        </mesh>
      </group>

      {/* Sign posts */}
      <mesh position={[-16, 7, -82]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 14, 8]} />
        <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[16, 7, -82]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 14, 8]} />
        <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  )
}
