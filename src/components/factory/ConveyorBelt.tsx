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
      <AssemblyStation position={[6, 0, -30]} label="TYPE" color="#FF6B6B" phase={0} />
      <AssemblyStation position={[6, 0, -10]} label="PAINT" color="#4ECDC4" phase={2.1} />
      <AssemblyStation position={[6, 0, 10]} label="NAME" color="#C47AFF" phase={4.3} />
    </group>
  )
}

// ── Premium industrial robot arm ─────────────────────────────────────────────
// Three-segment FK chain: column → lower arm → upper arm → end effector
// All materials: MeshPhysicalMaterial for chrome/metal sheen
function RobotArm({ phase = 0, accentColor }: { phase?: number; accentColor: string }) {
  const turretRef = useRef<THREE.Group>(null)
  const shoulderRef = useRef<THREE.Group>(null)
  const clawLRef = useRef<THREE.Mesh>(null)
  const clawRRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase
    // Turret rotates Y — arm sweeps back and forth along the belt
    if (turretRef.current) {
      turretRef.current.rotation.y = Math.sin(t * 0.38) * 0.28
    }
    // Shoulder nods — arm dips toward the car then retracts
    if (shoulderRef.current) {
      shoulderRef.current.rotation.z = -0.72 + Math.sin(t * 0.55) * 0.12
    }
    // Claw opens and closes rhythmically
    const open = (1 + Math.sin(t * 0.95)) * 0.22
    if (clawLRef.current) clawLRef.current.rotation.z = open
    if (clawRRef.current) clawRRef.current.rotation.z = -open
  })

  // Reusable material props — saves JSX verbosity
  const bodyMat = { color: '#6b7c8e', metalness: 0.88, roughness: 0.13 }
  const darkMat = { color: '#1e242b', metalness: 0.92, roughness: 0.1 }
  const chromeMat = { color: '#dce9ef', metalness: 1.0, roughness: 0.02, clearcoat: 1 as const, clearcoatRoughness: 0.04 as const }
  const sleeveColor = '#8fa3b0'

  return (
    <group>
      {/* ── Base drum ── */}
      <mesh castShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.76, 0.92, 0.32, 14]} />
        <meshPhysicalMaterial {...darkMat} />
      </mesh>
      {/* Mounting bolt ring */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`bolt-${i}`} position={[
          Math.cos((i / 6) * Math.PI * 2) * 0.65,
          0.32,
          Math.sin((i / 6) * Math.PI * 2) * 0.65,
        ]}>
          <cylinderGeometry args={[0.055, 0.055, 0.1, 6]} />
          <meshPhysicalMaterial color="#444" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* ── Turret (rotates Y around column axis) ── */}
      <group ref={turretRef}>
        {/* Column */}
        <mesh castShadow position={[0, 1.98, 0]}>
          <cylinderGeometry args={[0.42, 0.52, 3.64, 12]} />
          <meshPhysicalMaterial {...bodyMat} />
        </mesh>
        {/* Column ring accents */}
        {[0.72, 1.88, 3.04].map((y, i) => (
          <mesh key={`ring-${i}`} position={[0, y, 0]}>
            <torusGeometry args={[0.5, 0.058, 6, 16]} />
            <meshPhysicalMaterial color={accentColor} metalness={0.82} roughness={0.1} clearcoat={0.5} />
          </mesh>
        ))}

        {/* ── Shoulder pivot ── */}
        <mesh castShadow position={[0, 3.82, 0]}>
          <sphereGeometry args={[0.4, 14, 14]} />
          <meshPhysicalMaterial color={accentColor} metalness={0.88} roughness={0.09} clearcoat={0.4} />
        </mesh>
        {/* Shoulder housing flanges */}
        <mesh castShadow position={[0, 3.82, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.28, 0.28, 0.92, 10]} />
          <meshPhysicalMaterial {...darkMat} />
        </mesh>

        {/* ── Lower arm (pivots at shoulder, angled toward belt = -X) ── */}
        <group ref={shoulderRef} position={[0, 3.82, 0]}>
          {/* Main lower arm tube */}
          <mesh castShadow position={[0, 1.6, 0]}>
            <boxGeometry args={[0.34, 3.2, 0.34]} />
            <meshPhysicalMaterial {...bodyMat} />
          </mesh>
          {/* Arm stiffener ridge */}
          <mesh castShadow position={[0.18, 1.6, 0]}>
            <boxGeometry args={[0.06, 3.0, 0.2]} />
            <meshPhysicalMaterial color="#556677" metalness={0.85} roughness={0.15} />
          </mesh>

          {/* Hydraulic outer sleeve */}
          <mesh castShadow position={[-0.22, 1.3, 0.22]}>
            <cylinderGeometry args={[0.1, 0.1, 2.4, 8]} />
            <meshPhysicalMaterial color={sleeveColor} metalness={0.78} roughness={0.18} />
          </mesh>
          {/* Hydraulic chrome piston */}
          <mesh castShadow position={[-0.22, 2.38, 0.22]}>
            <cylinderGeometry args={[0.068, 0.068, 1.2, 8]} />
            <meshPhysicalMaterial {...chromeMat} />
          </mesh>
          {/* Hydraulic end cap */}
          <mesh castShadow position={[-0.22, 0.08, 0.22]}>
            <cylinderGeometry args={[0.13, 0.13, 0.1, 8]} />
            <meshPhysicalMaterial {...darkMat} />
          </mesh>

          {/* ── Elbow joint ── */}
          <mesh castShadow position={[0, 3.25, 0]}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshPhysicalMaterial color={accentColor} metalness={0.88} roughness={0.09} clearcoat={0.3} />
          </mesh>
          <mesh castShadow position={[0, 3.25, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.76, 10]} />
            <meshPhysicalMaterial {...darkMat} />
          </mesh>

          {/* ── Upper arm (horizontal, continues toward belt) ── */}
          <mesh castShadow position={[0, 4.25, 0]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[0.26, 2.4, 0.26]} />
            <meshPhysicalMaterial {...bodyMat} />
          </mesh>
          {/* Upper arm small hydraulic */}
          <mesh castShadow position={[0.2, 4.25, 0.2]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.068, 0.068, 1.8, 8]} />
            <meshPhysicalMaterial color={sleeveColor} metalness={0.78} roughness={0.18} />
          </mesh>

          {/* ── Wrist ── */}
          <mesh castShadow position={[-0.9, 5.28, 0]}>
            <sphereGeometry args={[0.22, 10, 10]} />
            <meshPhysicalMaterial {...darkMat} />
          </mesh>

          {/* ── End effector tool mount ── */}
          <mesh castShadow position={[-1.28, 5.28, 0]}>
            <boxGeometry args={[0.52, 0.3, 0.58]} />
            <meshPhysicalMaterial {...darkMat} />
          </mesh>
          {/* Tool light */}
          <mesh position={[-1.28, 5.46, 0]}>
            <boxGeometry args={[0.18, 0.05, 0.18]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2.5} />
          </mesh>

          {/* ── Claw fingers (animated open/close) ── */}
          <mesh ref={clawLRef} castShadow position={[-1.62, 5.28, 0.22]}>
            <boxGeometry args={[0.48, 0.1, 0.14]} />
            <meshPhysicalMaterial color={accentColor} metalness={0.88} roughness={0.1} clearcoat={0.3} />
          </mesh>
          <mesh ref={clawRRef} castShadow position={[-1.62, 5.28, -0.22]}>
            <boxGeometry args={[0.48, 0.1, 0.14]} />
            <meshPhysicalMaterial color={accentColor} metalness={0.88} roughness={0.1} clearcoat={0.3} />
          </mesh>
          {/* Finger tips (chrome) */}
          <mesh castShadow position={[-1.88, 5.28, 0.22]}>
            <boxGeometry args={[0.08, 0.08, 0.1]} />
            <meshPhysicalMaterial {...chromeMat} />
          </mesh>
          <mesh castShadow position={[-1.88, 5.28, -0.22]}>
            <boxGeometry args={[0.08, 0.08, 0.1]} />
            <meshPhysicalMaterial {...chromeMat} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function AssemblyStation({
  position,
  label,
  color,
  phase,
}: {
  position: [number, number, number]
  label: string
  color: string
  phase: number
}) {
  return (
    <group position={position}>
      {/* Station platform — colored */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[5, 1.5, 7]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Robot arm — sits on top of platform */}
      <group position={[0, 1.5, 0]}>
        <RobotArm phase={phase} accentColor={color} />
      </group>

      {/* Station sign */}
      <mesh position={[0, 4, -3.8]}>
        <boxGeometry args={[3, 1.2, 0.2]} />
        <meshStandardMaterial color="white" roughness={0.8} />
      </mesh>
    </group>
  )
}
