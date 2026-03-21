'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import CarModel from './CarModel'
import type { CarType } from '@/lib/types'

const BELT_Y = 1.35

// World-space Z positions for each builder step
// ConveyorBelt group is at [0,0,-10]; stations are at local [6,0,-30], [6,0,-10], [6,0,10]
// Car rides the belt (X=0), so world Z = group Z + local Z
const STEP_Z: Record<string, number> = {
  chassis: -40,
  paint: -20,
  name: 0,
}

export interface BuilderCarProps {
  step: 'chassis' | 'paint' | 'name'
  carType: CarType | null
  color: string | null
}

export default function BuilderCar({ step, carType, color }: BuilderCarProps) {
  const groupRef = useRef<any>(null)
  const currentZ = useRef(STEP_Z[step] ?? -40)

  // Drop animation when a car type is picked
  const dropOffset = useRef(0)
  const dropVelocity = useRef(0)
  const prevCarType = useRef<CarType | null>(null)

  useEffect(() => {
    if (carType && carType !== prevCarType.current) {
      dropOffset.current = 9
      dropVelocity.current = 0
      prevCarType.current = carType
    }
  }, [carType])

  useFrame((_, delta) => {
    const targetZ = STEP_Z[step] ?? -40
    // Smooth glide along belt toward target station
    currentZ.current += (targetZ - currentZ.current) * Math.min(1, 5 * delta)

    // Physics-based drop when car type is selected
    if (dropOffset.current > 0) {
      dropVelocity.current -= 30 * delta
      dropOffset.current = Math.max(0, dropOffset.current + dropVelocity.current * delta)
      if (dropOffset.current <= 0) {
        dropOffset.current = 0
        dropVelocity.current = 0
      }
    }

    if (groupRef.current) {
      groupRef.current.position.set(0, BELT_Y + dropOffset.current, currentZ.current)
    }
  })

  const displayColor = color || '#888888'

  return (
    <group ref={groupRef} position={[0, BELT_Y, -40]}>
      {!carType ? (
        // Bare chassis placeholder — suggests a car shape without committing to a type
        <group>
          {/* Main chassis plate */}
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[1.5, 0.1, 3.8]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Side rails */}
          <mesh position={[0.65, 0.14, 0]}>
            <boxGeometry args={[0.1, 0.1, 3.8]} />
            <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[-0.65, 0.14, 0]}>
            <boxGeometry args={[0.1, 0.1, 3.8]} />
            <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Axle tubes */}
          <mesh position={[0, 0.1, -1.1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
            <meshStandardMaterial color="#555" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.1, 1.1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
            <meshStandardMaterial color="#555" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Stub wheels */}
          {([[-0.78, -1.1], [0.78, -1.1], [-0.78, 1.1], [0.78, 1.1]] as [number, number][]).map(([x, z], i) => (
            <mesh key={i} position={[x, 0.22, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.22, 0.1, 6, 12]} />
              <meshStandardMaterial color="#1e1e1e" roughness={0.8} />
            </mesh>
          ))}
          {/* Glowing orb — "pick a car type" hint */}
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[0.22, 10, 10]} />
            <meshStandardMaterial color="#FFB800" emissive="#FFB800" emissiveIntensity={5} transparent opacity={0.9} />
          </mesh>
          {/* Subtle pulsing ring around orb */}
          <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.38, 0.025, 6, 24]} />
            <meshStandardMaterial color="#FFB800" emissive="#FFB800" emissiveIntensity={2} transparent opacity={0.5} />
          </mesh>
        </group>
      ) : (
        <CarModel
          carType={carType}
          color={displayColor}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
        />
      )}
    </group>
  )
}
