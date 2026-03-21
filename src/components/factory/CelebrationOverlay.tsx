'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { playFanfare } from '@/lib/sounds'

interface CelebrationOverlayProps {
  name: string
  carNumber: number
  position: [number, number, number]
  onStartDrive?: () => void
}

/**
 * 3D celebration that appears above a newly built car.
 * Big floating name, sparkle effects, "YOUR CAR IS READY" text.
 */
export default function CelebrationOverlay({ name, carNumber, position, onStartDrive }: CelebrationOverlayProps) {
  const groupRef = useRef<THREE.Group>(null)
  const time = useRef(0)
  const { camera } = useThree()

  // Smooth camera state for celebration flyback
  const camStart = useRef(new THREE.Vector3())
  const camTarget = useRef(new THREE.Vector3(position[0], position[1] + 10, position[2] - 18))
  const lookTarget = useRef(new THREE.Vector3(position[0], position[1] + 5, position[2]))
  const camProgress = useRef(0)

  // Play fanfare once on mount, capture current camera position for smooth lerp
  useEffect(() => {
    playFanfare()
    camStart.current.copy(camera.position)
    camProgress.current = 0
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    time.current += delta

    // Smoothly fly camera to face the car + celebration
    if (camProgress.current < 1) {
      camProgress.current = Math.min(camProgress.current + delta * 0.8, 1)
      const t = camProgress.current * camProgress.current * (3 - 2 * camProgress.current) // smoothstep
      camera.position.lerpVectors(camStart.current, camTarget.current, t)
      camera.lookAt(lookTarget.current)
    }

    if (groupRef.current) {
      // Gentle float animation
      groupRef.current.position.y = position[1] + 5 + Math.sin(time.current * 2) * 0.3
    }
  })

  return (
    <group ref={groupRef} position={[position[0], position[1] + 5, position[2]]}>
      {/* Big car name */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={1.2}
        color="#FFFFFF"
        font={undefined}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.07}
        outlineColor="#FF6B4A"
        maxWidth={12}
      >
        {name}
      </Text>

      {/* Car number */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.6}
        color="#FFD700"
        font={undefined}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#AA8800"
      >
        {`Car #${carNumber}`}
      </Text>

      {/* "YOUR CAR IS READY!" */}
      <Text
        position={[0, -0.9, 0]}
        fontSize={0.45}
        color="#FFFFFF"
        font={undefined}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#333333"
      >
        YOUR CAR IS READY!
      </Text>

      {/* Sparkle particles — simple spheres orbiting */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 3
        return (
          <SparkleOrb key={i} baseAngle={angle} radius={radius} speed={1.5 + i * 0.2} />
        )
      })}

      {/* Star bursts */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        return (
          <mesh
            key={`star-${i}`}
            position={[
              Math.cos(angle) * 4,
              Math.sin(angle) * 2,
              Math.sin(angle + 1) * 2,
            ]}
          >
            <octahedronGeometry args={[0.15, 0]} />
            <meshStandardMaterial
              color={['#FFD700', '#FF6B4A', '#4ECDC4', '#FF9FF3'][i % 4]}
              emissive={['#FFD700', '#FF6B4A', '#4ECDC4', '#FF9FF3'][i % 4]}
              emissiveIntensity={2}
            />
          </mesh>
        )
      })}

      {/* HTML overlay — drive prompt + button */}
      <Html position={[0, -2.5, 0]} center distanceFactor={12}>
        <div className="text-center select-none">
          {onStartDrive ? (
            <button
              onClick={onStartDrive}
              className="bg-orange-500 hover:bg-orange-400 text-white font-black px-5 py-2.5 rounded-xl text-base shadow-xl transition-colors pointer-events-auto"
            >
              Drive!
            </button>
          ) : (
            <p className="text-white text-lg font-black drop-shadow-lg bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl pointer-events-none">
              Use controls to drive!
            </p>
          )}
        </div>
      </Html>
    </group>
  )
}

function SparkleOrb({ baseAngle, radius, speed }: { baseAngle: number; radius: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.elapsedTime * speed + baseAngle
      ref.current.position.set(
        Math.cos(t) * radius,
        Math.sin(t * 0.7) * 1.5 + 0.5,
        Math.sin(t) * radius
      )
    }
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.12, 6, 6]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFAA00"
        emissiveIntensity={3}
      />
    </mesh>
  )
}
