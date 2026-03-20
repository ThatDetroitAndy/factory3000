'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ConveyorBelt() {
  const BELT_LENGTH = 120
  const BELT_WIDTH = 4
  const BELT_HEIGHT = 1.2

  return (
    <group position={[0, 0, -10]}>
      {/* Belt surface — dark rubber with yellow safety stripes */}
      <mesh position={[0, BELT_HEIGHT, 0]} receiveShadow castShadow>
        <boxGeometry args={[BELT_WIDTH, 0.2, BELT_LENGTH]} />
        <meshStandardMaterial color="#444444" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Belt rollers — visible cylinders underneath */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={`roller-${i}`}
          position={[0, BELT_HEIGHT - 0.15, -BELT_LENGTH / 2 + (i + 0.5) * (BELT_LENGTH / 20)]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.15, 0.15, BELT_WIDTH + 0.5, 8]} />
          <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {/* Belt legs/supports — bright orange safety color */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={`support-${i}`}>
          <mesh
            position={[
              -BELT_WIDTH / 2 - 0.4,
              BELT_HEIGHT / 2,
              -BELT_LENGTH / 2 + (i + 0.5) * (BELT_LENGTH / 8),
            ]}
            castShadow
          >
            <boxGeometry args={[0.4, BELT_HEIGHT, 0.4]} />
            <meshStandardMaterial color="#FF8C00" roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh
            position={[
              BELT_WIDTH / 2 + 0.4,
              BELT_HEIGHT / 2,
              -BELT_LENGTH / 2 + (i + 0.5) * (BELT_LENGTH / 8),
            ]}
            castShadow
          >
            <boxGeometry args={[0.4, BELT_HEIGHT, 0.4]} />
            <meshStandardMaterial color="#FF8C00" roughness={0.4} metalness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Side rails — yellow safety */}
      <mesh position={[-BELT_WIDTH / 2 - 0.4, BELT_HEIGHT + 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, BELT_LENGTH]} />
        <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[BELT_WIDTH / 2 + 0.4, BELT_HEIGHT + 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, BELT_LENGTH]} />
        <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Assembly stations — chunky, colorful */}
      <AssemblyStation position={[6, 0, -30]} label="TYPE" color="#FF6B6B" />
      <AssemblyStation position={[6, 0, -10]} label="PAINT" color="#4ECDC4" />
      <AssemblyStation position={[6, 0, 10]} label="NAME" color="#C47AFF" />
    </group>
  )
}

function AssemblyStation({
  position,
  label,
  color,
}: {
  position: [number, number, number]
  label: string
  color: string
}) {
  return (
    <group position={position}>
      {/* Station platform — colored */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[5, 1.5, 7]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Robot arm base — chunky cylinder */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.8, 2, 8]} />
        <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Robot arm — angled */}
      <mesh position={[-1.5, 4, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.4, 3.5, 0.4]} />
        <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Robot claw / tool tip */}
      <mesh position={[-3, 5.2, 0]} castShadow>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#FF8C00" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Station sign */}
      <mesh position={[0, 4, -3.8]}>
        <boxGeometry args={[3, 1.2, 0.2]} />
        <meshStandardMaterial color="white" roughness={0.8} />
      </mesh>
    </group>
  )
}
