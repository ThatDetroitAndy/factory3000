'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ConveyorBelt({ isProducing = false }: { isProducing?: boolean }) {
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

      {/* Assembly stations with premium industrial robot arms */}
      <AssemblyStation
        position={[6, 0, -30]}
        label="TYPE"
        color="#FF6B6B"
        stationType="weld"
        armPhase={0}
        isProducing={isProducing}
      />
      <AssemblyStation
        position={[6, 0, -10]}
        label="PAINT"
        color="#4ECDC4"
        stationType="paint"
        armPhase={2.8}
        isProducing={isProducing}
      />
      <AssemblyStation
        position={[6, 0, 10]}
        label="NAME"
        color="#C47AFF"
        stationType="laser"
        armPhase={5.1}
        isProducing={isProducing}
      />
    </group>
  )
}

// ─── Assembly Station ─────────────────────────────────────────────────────────

function AssemblyStation({
  position,
  label,
  color,
  stationType,
  armPhase,
  isProducing,
}: {
  position: [number, number, number]
  label: string
  color: string
  stationType: 'weld' | 'paint' | 'laser'
  armPhase: number
  isProducing: boolean
}) {
  return (
    <group position={position}>
      {/* Platform base */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 1.5, 7]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Platform edge trim — dark metal strip */}
      <mesh position={[0, 1.52, 0]}>
        <boxGeometry args={[5.1, 0.08, 7.1]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Station sign backing */}
      <mesh position={[0, 4.2, -3.9]} castShadow>
        <boxGeometry args={[3.4, 1.4, 0.15]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Sign face */}
      <mesh position={[0, 4.2, -3.82]}>
        <boxGeometry args={[3.0, 1.0, 0.05]} />
        <meshStandardMaterial color="white" roughness={0.8} metalness={0} />
      </mesh>
      {/* Sign posts */}
      <mesh position={[-1.3, 2.7, -3.9]} castShadow>
        <boxGeometry args={[0.12, 3.0, 0.12]} />
        <meshStandardMaterial color="#555555" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[1.3, 2.7, -3.9]} castShadow>
        <boxGeometry args={[0.12, 3.0, 0.12]} />
        <meshStandardMaterial color="#555555" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Industrial robot arm — sits on top of platform */}
      <group position={[0, 1.5, 0]}>
        <IndustrialRobotArm
          stationType={stationType}
          armPhase={armPhase}
          isProducing={isProducing}
          accentColor={color}
        />
      </group>
    </group>
  )
}

// ─── Industrial Robot Arm — 4-axis KUKA/ABB style ────────────────────────────
// J1: base yaw (Y rotation) — sweeps arm toward/away from belt
// J2: shoulder pitch (X rotation) — raises/lowers upper arm
// J3: elbow pitch (X rotation) — bends forearm
// J4: wrist (X + Z) — tool orientation + vibration during work

function IndustrialRobotArm({
  stationType,
  armPhase,
  isProducing,
  accentColor,
}: {
  stationType: 'weld' | 'paint' | 'laser'
  armPhase: number
  isProducing: boolean
  accentColor: string
}) {
  const j1Ref = useRef<THREE.Group>(null) // base yaw
  const j2Ref = useRef<THREE.Group>(null) // shoulder pitch
  const j3Ref = useRef<THREE.Group>(null) // elbow pitch
  const j4Ref = useRef<THREE.Group>(null) // wrist

  // Rest pose (arm pulled up and back)
  const REST = { j1y: 1.0, j2x: 0.15, j3x: 0.85, j4x: -0.55 }
  // Working pose (arm extends toward belt in -X direction)
  const WORK = { j1y: 1.57, j2x: -0.45, j3x: -0.30, j4x: -0.25 }

  useFrame(({ clock }) => {
    const speed = isProducing ? 0.65 : 0.35
    const t = clock.getElapsedTime() * speed + armPhase
    const work = (Math.sin(t) + 1) / 2 // 0 = rest, 1 = working

    if (j1Ref.current) j1Ref.current.rotation.y = REST.j1y + (WORK.j1y - REST.j1y) * work
    if (j2Ref.current) j2Ref.current.rotation.x = REST.j2x + (WORK.j2x - REST.j2x) * work
    if (j3Ref.current) j3Ref.current.rotation.x = REST.j3x + (WORK.j3x - REST.j3x) * work
    if (j4Ref.current) {
      j4Ref.current.rotation.x = REST.j4x + (WORK.j4x - REST.j4x) * work
      if (work > 0.7) {
        // Tool vibration when fully engaged
        j4Ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 12) * 0.04 * work
        j4Ref.current.rotation.x += Math.sin(clock.getElapsedTime() * 9.3) * 0.02 * work
      }
    }
  })

  return (
    <group>
      {/* ── BASE PEDESTAL (3-tier) ── */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.82, 0.92, 0.56, 14]} />
        <meshPhysicalMaterial color="#1e242b" metalness={0.92} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.68, 0.78, 0.44, 14]} />
        <meshPhysicalMaterial color="#252c34" metalness={0.9} roughness={0.12} />
      </mesh>
      <mesh position={[0, 1.06, 0]} castShadow>
        <cylinderGeometry args={[0.58, 0.66, 0.36, 14]} />
        <meshPhysicalMaterial color="#2c343e" metalness={0.88} roughness={0.13} />
      </mesh>

      {/* Safety yellow warning ring */}
      <mesh position={[0, 0.97, 0]}>
        <torusGeometry args={[0.70, 0.07, 8, 28]} />
        <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.4} emissive="#FFD700" emissiveIntensity={0.25} />
      </mesh>

      {/* Bolt ring */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <mesh key={`bolt-${i}`} position={[Math.cos(angle) * 0.78, 0.08, Math.sin(angle) * 0.78]}>
            <cylinderGeometry args={[0.045, 0.045, 0.16, 6]} />
            <meshPhysicalMaterial color="#444" metalness={0.9} roughness={0.2} />
          </mesh>
        )
      })}

      {/* ── J1: ROTATING BASE TURRET ── */}
      <group ref={j1Ref} position={[0, 1.26, 0]}>
        {/* Main turret cylinder */}
        <mesh castShadow>
          <cylinderGeometry args={[0.54, 0.62, 0.72, 12]} />
          <meshPhysicalMaterial color="#6b7c8e" metalness={0.88} roughness={0.13} />
        </mesh>
        {/* Accent color ring on turret top */}
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.08, 12]} />
          <meshPhysicalMaterial color={accentColor} metalness={0.82} roughness={0.1} clearcoat={0.5} />
        </mesh>
        {/* Cable conduit */}
        <mesh position={[0.3, 0.1, 0.3]} rotation={[0.3, 0.8, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.9, 8]} />
          <meshPhysicalMaterial color="#111111" metalness={0.3} roughness={0.85} />
        </mesh>

        {/* ── J2: SHOULDER PIVOT ── */}
        <group ref={j2Ref} position={[0, 0.52, 0]}>
          {/* Shoulder housing */}
          <mesh castShadow>
            <boxGeometry args={[0.85, 0.72, 0.92]} />
            <meshPhysicalMaterial color="#6b7c8e" metalness={0.88} roughness={0.13} />
          </mesh>
          {/* Chrome axle studs */}
          {([-0.58, 0.58] as const).map((x, i) => (
            <group key={`axle-${i}`}>
              <mesh position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.22, 0.22, 0.32, 12]} />
                <meshPhysicalMaterial color="#dce9ef" metalness={1.0} roughness={0.02} clearcoat={1} clearcoatRoughness={0.04} />
              </mesh>
              <mesh position={[x * 1.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.14, 0.14, 0.14, 10]} />
                <meshPhysicalMaterial color="#dce9ef" metalness={1.0} roughness={0.02} clearcoat={1} clearcoatRoughness={0.04} />
              </mesh>
            </group>
          ))}

          {/* ── LOWER ARM ── */}
          <group position={[0, 0.08, 0]}>
            {/* Main arm body — safety yellow */}
            <mesh position={[0, 1.7, 0]} castShadow>
              <boxGeometry args={[0.52, 3.4, 0.52]} />
              <meshStandardMaterial color="#FFD700" roughness={0.38} metalness={0.28} />
            </mesh>

            {/* Structural ribs */}
            {[0.3, 0.75, 1.2, 1.65, 2.1, 2.55].map((y, i) => (
              <mesh key={`rib-${i}`} position={[0, y + 0.08, 0]}>
                <boxGeometry args={[0.60, 0.10, 0.60]} />
                <meshPhysicalMaterial color="#1e242b" metalness={0.92} roughness={0.1} />
              </mesh>
            ))}

            {/* Hydraulic outer sleeve */}
            <mesh position={[0.33, 1.3, 0.2]} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 2.4, 8]} />
              <meshPhysicalMaterial color="#8fa3b0" metalness={0.78} roughness={0.18} />
            </mesh>
            {/* Chrome piston */}
            <mesh position={[0.33, 2.38, 0.2]} castShadow>
              <cylinderGeometry args={[0.068, 0.068, 1.2, 8]} />
              <meshPhysicalMaterial color="#dce9ef" metalness={1.0} roughness={0.02} clearcoat={1} clearcoatRoughness={0.04} />
            </mesh>
            {/* Piston end caps */}
            <mesh position={[0.33, 0.0, 0.2]}>
              <sphereGeometry args={[0.11, 8, 8]} />
              <meshPhysicalMaterial color="#1e242b" metalness={0.92} roughness={0.1} />
            </mesh>
            <mesh position={[0.33, 2.65, 0.2]}>
              <sphereGeometry args={[0.11, 8, 8]} />
              <meshPhysicalMaterial color="#1e242b" metalness={0.92} roughness={0.1} />
            </mesh>

            {/* Cable bundle */}
            <mesh position={[-0.3, 1.7, 0.22]} rotation={[0.05, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 3.2, 8]} />
              <meshPhysicalMaterial color="#111111" metalness={0.2} roughness={0.9} />
            </mesh>

            {/* ── J3: ELBOW ── */}
            <group ref={j3Ref} position={[0, 3.5, 0]}>
              {/* Elbow joint sphere */}
              <mesh castShadow>
                <sphereGeometry args={[0.32, 12, 12]} />
                <meshPhysicalMaterial color={accentColor} metalness={0.88} roughness={0.09} clearcoat={0.4} />
              </mesh>
              {/* Elbow axle */}
              <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.18, 0.18, 0.76, 10]} />
                <meshPhysicalMaterial color="#1e242b" metalness={0.92} roughness={0.1} />
              </mesh>
              {/* Elbow housing */}
              <mesh position={[0, 0.12, 0.08]} castShadow>
                <boxGeometry args={[0.70, 0.62, 0.75]} />
                <meshPhysicalMaterial color="#6b7c8e" metalness={0.88} roughness={0.13} />
              </mesh>

              {/* ── UPPER ARM (FOREARM) ── */}
              <group position={[0, 0.14, 0.12]}>
                {/* Forearm body */}
                <mesh position={[0, 1.25, 0]} castShadow>
                  <boxGeometry args={[0.43, 2.50, 0.43]} />
                  <meshStandardMaterial color="#FFD700" roughness={0.38} metalness={0.28} />
                </mesh>

                {/* Forearm ribs */}
                {[0.3, 0.75, 1.2, 1.65].map((y, i) => (
                  <mesh key={`frib-${i}`} position={[0, y + 0.14, 0]}>
                    <boxGeometry args={[0.51, 0.09, 0.51]} />
                    <meshPhysicalMaterial color="#1e242b" metalness={0.92} roughness={0.1} />
                  </mesh>
                ))}

                {/* Wrist cable conduit */}
                <mesh position={[-0.26, 1.25, 0.2]} rotation={[0.04, 0, 0]}>
                  <cylinderGeometry args={[0.06, 0.06, 2.4, 8]} />
                  <meshPhysicalMaterial color="#111111" metalness={0.2} roughness={0.9} />
                </mesh>

                {/* ── J4: WRIST ── */}
                <group ref={j4Ref} position={[0, 2.62, 0.08]}>
                  {/* Wrist barrel */}
                  <mesh castShadow>
                    <cylinderGeometry args={[0.24, 0.24, 0.48, 12]} />
                    <meshPhysicalMaterial color="#556677" metalness={0.85} roughness={0.15} />
                  </mesh>
                  {/* Wrist flange */}
                  <mesh position={[0, 0.30, 0]}>
                    <cylinderGeometry args={[0.29, 0.22, 0.18, 12]} />
                    <meshPhysicalMaterial color="#1e242b" metalness={0.92} roughness={0.1} />
                  </mesh>
                  {/* Wrist bolt ring */}
                  {Array.from({ length: 6 }).map((_, i) => {
                    const a = (i / 6) * Math.PI * 2
                    return (
                      <mesh key={`wbolt-${i}`} position={[Math.cos(a) * 0.22, 0.30, Math.sin(a) * 0.22]}>
                        <cylinderGeometry args={[0.03, 0.03, 0.18, 6]} />
                        <meshPhysicalMaterial color="#dce9ef" metalness={1.0} roughness={0.02} clearcoat={1} clearcoatRoughness={0.04} />
                      </mesh>
                    )
                  })}

                  {/* ── END EFFECTOR ── */}
                  <group position={[0, 0.52, 0]}>
                    {stationType === 'weld' && <WeldingEffector isActive={isProducing} />}
                    {stationType === 'paint' && <PaintEffector isActive={isProducing} accentColor={accentColor} />}
                    {stationType === 'laser' && <LaserEffector isActive={isProducing} accentColor={accentColor} />}
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

// ─── Welding Torch Effector ───────────────────────────────────────────────────

function WeldingEffector({ isActive }: { isActive: boolean }) {
  const sparkGroupRef = useRef<THREE.Group>(null)
  const arcRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const intensity = isActive ? 1.0 : 0.55

    if (arcRef.current) {
      const mat = arcRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = (2.0 + Math.sin(t * 18) * 0.8) * intensity
    }

    if (!sparkGroupRef.current) return
    sparkGroupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const speed = 1.0 + (i * 0.19) % 0.8
      const lifetime = 0.55 + (i * 0.13) % 0.35
      const localT = ((t * speed + i * 0.61) % lifetime) / lifetime

      const angle = (i / 12) * Math.PI * 2 + i * 1.37 + t * 0.4
      const spread = localT * 0.55
      mesh.position.x = Math.cos(angle) * spread
      mesh.position.y = -0.88 - localT * 0.7
      mesh.position.z = Math.sin(angle) * spread
      mesh.scale.setScalar((1.0 - localT) * 0.9 * intensity)
    })
  })

  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.11, 0.14, 0.72, 10]} />
        <meshPhysicalMaterial color="#8fa3b0" metalness={0.78} roughness={0.18} />
      </mesh>
      <mesh position={[0.08, -0.4, 0]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.055, 0.08, 0.38, 8]} />
        <meshPhysicalMaterial color="#556677" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0.12, -0.62, 0]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.035, 0.055, 0.22, 8]} />
        <meshPhysicalMaterial color="#1e242b" metalness={0.92} roughness={0.1} />
      </mesh>
      <mesh position={[0.06, 0.2, -0.12]} rotation={[0.6, 0.2, 0.1]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshPhysicalMaterial color="#333333" metalness={0.3} roughness={0.9} />
      </mesh>

      {/* Welding arc */}
      <mesh ref={arcRef} position={[0.18, -0.76, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#FF7700" emissive="#FF4400" emissiveIntensity={2.5} roughness={1} transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0.18, -0.76, 0]} color="#FF6600" intensity={isActive ? 4 : 1.5} distance={3.0} decay={2} />

      {/* Sparks */}
      <group ref={sparkGroupRef}>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={`spark-${i}`}>
            <sphereGeometry args={[0.038, 4, 4]} />
            <meshStandardMaterial color="#FFCC00" emissive="#FF8800" emissiveIntensity={4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ─── Paint Spray Gun Effector ─────────────────────────────────────────────────

function PaintEffector({ isActive, accentColor }: { isActive: boolean; accentColor: string }) {
  const mistGroupRef = useRef<THREE.Group>(null)
  const nozzleGlowRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const intensity = isActive ? 1.0 : 0.5

    if (nozzleGlowRef.current) {
      const mat = nozzleGlowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = (1.5 + Math.sin(t * 6) * 0.5) * intensity
      mat.opacity = (0.55 + Math.sin(t * 5.3) * 0.15) * intensity
    }

    if (!mistGroupRef.current) return
    mistGroupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const speed = 0.8 + (i * 0.17) % 0.6
      const lifetime = 0.7 + (i * 0.11) % 0.5
      const localT = ((t * speed + i * 0.73) % lifetime) / lifetime

      const angle = (i / 8) * Math.PI * 2 + i * 0.93
      const coneRadius = localT * 0.45
      mesh.position.x = Math.cos(angle) * coneRadius
      mesh.position.y = -0.9 - localT * 0.6
      mesh.position.z = Math.sin(angle) * coneRadius
      mesh.scale.setScalar((1.0 - localT * 0.7) * 1.2 * intensity)
    })
  })

  return (
    <group>
      <mesh position={[0, -0.28, 0]} castShadow>
        <boxGeometry args={[0.26, 0.52, 0.17]} />
        <meshPhysicalMaterial color="#556677" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0.1, -0.38, 0]}>
        <torusGeometry args={[0.1, 0.025, 6, 12, Math.PI]} />
        <meshPhysicalMaterial color="#1e242b" metalness={0.92} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.62, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.10, 0.38, 10]} />
        <meshPhysicalMaterial color="#444455" metalness={0.88} roughness={0.13} />
      </mesh>
      <mesh position={[0, -0.84, 0]}>
        <cylinderGeometry args={[0.085, 0.065, 0.10, 10]} />
        <meshPhysicalMaterial color="#1e242b" metalness={0.92} roughness={0.1} />
      </mesh>
      {/* Paint cup */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.10, 0.13, 0.30, 10]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Spray nozzle glow */}
      <mesh ref={nozzleGlowRef} position={[0, -0.95, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.5} transparent opacity={0.45} roughness={1} />
      </mesh>
      <pointLight position={[0, -0.95, 0]} color={accentColor} intensity={isActive ? 2.5 : 0.8} distance={2.5} decay={2} />

      {/* Paint mist particles */}
      <group ref={mistGroupRef}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`mist-${i}`}>
            <sphereGeometry args={[0.07, 5, 5]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.8} transparent opacity={0.6} roughness={1} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ─── Laser Engraver Effector ──────────────────────────────────────────────────

function LaserEffector({ isActive, accentColor }: { isActive: boolean; accentColor: string }) {
  const beamRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const scanGroupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const intensity = isActive ? 1.0 : 0.45

    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = (2.5 + Math.sin(t * 14) * 1.0) * intensity
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = (1.2 + Math.sin(t * 9) * 0.5) * intensity
      mat.opacity = (0.35 + Math.sin(t * 7) * 0.1) * intensity
    }
    if (scanGroupRef.current) {
      scanGroupRef.current.rotation.z = Math.sin(t * 3.5) * 0.25
    }
  })

  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.22, 0.62, 0.22]} />
        <meshPhysicalMaterial color="#444455" metalness={0.88} roughness={0.13} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.18, 0.15, 0.18, 10]} />
        <meshPhysicalMaterial color="#1e242b" metalness={0.92} roughness={0.1} />
      </mesh>
      {/* Cooling fins */}
      {[-0.08, 0, 0.08].map((y, i) => (
        <mesh key={`fin-${i}`} position={[0.14, y - 0.1, 0]}>
          <boxGeometry args={[0.08, 0.07, 0.24]} />
          <meshPhysicalMaterial color="#2c343e" metalness={0.88} roughness={0.13} />
        </mesh>
      ))}
      <mesh position={[0, -0.36, 0]}>
        <cylinderGeometry args={[0.075, 0.065, 0.18, 10]} />
        <meshPhysicalMaterial color="#1e242b" metalness={0.92} roughness={0.1} />
      </mesh>
      {/* Lens */}
      <mesh position={[0, -0.46, 0]}>
        <cylinderGeometry args={[0.062, 0.062, 0.04, 10]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.0} roughness={0} metalness={0.1} transparent opacity={0.7} />
      </mesh>

      {/* Scanning laser beam */}
      <group ref={scanGroupRef} position={[0, -0.46, 0]}>
        <mesh ref={beamRef} position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.018, 0.008, 1.1, 8]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2.5} roughness={1} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, -1.12, 0]}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={5} roughness={1} />
        </mesh>
      </group>

      {/* Glow halo */}
      <mesh ref={glowRef} position={[0, -0.5, 0]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.2} transparent opacity={0.3} roughness={1} />
      </mesh>
      <pointLight position={[0, -0.5, 0]} color={accentColor} intensity={isActive ? 3.5 : 1.0} distance={3.5} decay={2} />
    </group>
  )
}
