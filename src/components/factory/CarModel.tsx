'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import type { CarType } from '@/lib/types'

interface CarModelProps {
  carType: CarType
  color: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

// ─── Shared sub-components ───────────────────────────────────────────────────

/** Premium alloy wheel: rubber tire + spoked rim */
function Wheel({
  pos,
  r = 0.38,
  w = 0.32,
  spokes = 5,
  rimColor = '#cccccc',
  knobby = false,
}: {
  pos: [number, number, number]
  r?: number
  w?: number
  spokes?: number
  rimColor?: string
  knobby?: boolean
}) {
  return (
    <group position={pos}>
      {/* Rubber tire */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[r, r, w, 20]} />
        <meshStandardMaterial color="#181818" roughness={0.92} />
      </mesh>
      {/* Rim barrel */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.67, r * 0.67, w * 0.78, 20]} />
        <meshStandardMaterial color={rimColor} metalness={0.88} roughness={0.1} />
      </mesh>
      {/* Spokes — rotate each around wheel axis (X), thin in axial direction */}
      {Array.from({ length: spokes }, (_, i) => (
        <mesh key={i} rotation={[(i * Math.PI * 2) / spokes, 0, 0]}>
          <boxGeometry args={[0.05, r * 1.25, 0.07]} />
          <meshStandardMaterial color={rimColor} metalness={0.88} roughness={0.1} />
        </mesh>
      ))}
      {/* Center hub */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.21, r * 0.21, w * 0.82, 10]} />
        <meshStandardMaterial color={rimColor} metalness={0.92} roughness={0.05} />
      </mesh>
      {/* Knobby tread bumps for off-road look */}
      {knobby &&
        [-0.3, -0.1, 0.1, 0.3].map((dz, iz) =>
          [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map(
            (angle, ia) => (
              <mesh
                key={`${iz}-${ia}`}
                position={[dz * (w / 0.6), Math.sin(angle) * r * 0.97, Math.cos(angle) * r * 0.97]}
                rotation={[angle, 0, 0]}
              >
                <boxGeometry args={[0.04, 0.06, 0.09]} />
                <meshStandardMaterial color="#111111" roughness={0.95} />
              </mesh>
            )
          )
        )}
    </group>
  )
}

/** Modern LED headlight housing */
function Headlight({
  pos,
  w = 0.32,
  h = 0.13,
}: {
  pos: [number, number, number]
  w?: number
  h?: number
}) {
  return (
    <group position={pos}>
      {/* Housing */}
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.07]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
      </mesh>
      {/* Main lens */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[w * 0.88, h * 0.78, 0.02]} />
        <meshPhysicalMaterial
          color="#eeeeff"
          emissive="#ffffdd"
          emissiveIntensity={1.8}
          roughness={0.02}
          transmission={0.5}
          opacity={0.95}
          transparent
        />
      </mesh>
      {/* DRL strip */}
      <mesh position={[0, -h * 0.36, 0.05]}>
        <boxGeometry args={[w * 0.82, h * 0.1, 0.01]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffcc" emissiveIntensity={3} />
      </mesh>
    </group>
  )
}

/** Glowing taillight with housing */
function Taillight({
  pos,
  w = 0.4,
  h = 0.14,
}: {
  pos: [number, number, number]
  w?: number
  h?: number
}) {
  return (
    <group position={pos}>
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.07]} />
        <meshStandardMaterial color="#1a0000" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[w * 0.85, h * 0.72, 0.02]} />
        <meshStandardMaterial color="#ff1111" emissive="#ff0000" emissiveIntensity={2.2} roughness={0.15} />
      </mesh>
    </group>
  )
}

/** Chrome exhaust pipe tip */
function ExhaustTip({
  pos,
  rot = [Math.PI / 2, 0, 0] as [number, number, number],
}: {
  pos: [number, number, number]
  rot?: [number, number, number]
}) {
  return (
    <group position={pos} rotation={rot}>
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.3, 10]} />
        <meshStandardMaterial color="#888888" metalness={0.88} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <torusGeometry args={[0.065, 0.012, 6, 10]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.92} roughness={0.08} />
      </mesh>
    </group>
  )
}

// ─── Car 1: Go-Kart ─────────────────────────────────────────────────────────
// Ultra-low, wide, aggressive open-wheel racing machine with personality

function Car1({ color }: { color: string }) {
  return (
    <group>
      {/* ── CHASSIS ── */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[1.9, 0.15, 3.0]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.25} />
      </mesh>
      {/* Diffuser channels under rear */}
      {[-0.4, 0, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.15, -1.1]}>
          <boxGeometry args={[0.22, 0.05, 0.65]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.7} />
        </mesh>
      ))}

      {/* ── SIDE PODS ── */}
      <mesh position={[-0.68, 0.32, 0.08]} castShadow>
        <boxGeometry args={[0.5, 0.24, 1.38]} />
        <meshPhysicalMaterial color={color} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={0.07} />
      </mesh>
      <mesh position={[0.68, 0.32, 0.08]} castShadow>
        <boxGeometry args={[0.5, 0.24, 1.38]} />
        <meshPhysicalMaterial color={color} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={0.07} />
      </mesh>
      {/* Pod air inlets */}
      <mesh position={[-0.94, 0.33, 0.52]}>
        <boxGeometry args={[0.02, 0.14, 0.28]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>
      <mesh position={[0.94, 0.33, 0.52]}>
        <boxGeometry args={[0.02, 0.14, 0.28]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>

      {/* ── NOSE CONE ── */}
      <mesh position={[0, 0.3, 1.55]} castShadow>
        <boxGeometry args={[1.32, 0.26, 0.58]} />
        <meshPhysicalMaterial color={color} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={0.07} />
      </mesh>
      <mesh position={[0, 0.27, 1.86]} castShadow>
        <boxGeometry args={[0.88, 0.18, 0.14]} />
        <meshPhysicalMaterial color={color} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={0.07} />
      </mesh>
      {/* Front splitter */}
      <mesh position={[0, 0.16, 1.8]}>
        <boxGeometry args={[1.6, 0.07, 0.24]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.7} />
      </mesh>
      {/* Splitter mini fins */}
      {[-0.45, 0, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.13, 1.72]}>
          <boxGeometry args={[0.04, 0.09, 0.32]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.7} />
        </mesh>
      ))}

      {/* ── COCKPIT ── */}
      {/* Monocoque sides */}
      <mesh position={[0, 0.42, -0.08]} castShadow>
        <boxGeometry args={[0.9, 0.2, 1.25]} />
        <meshPhysicalMaterial color={color} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={0.07} />
      </mesh>
      {/* Racing seat */}
      <mesh position={[0, 0.44, -0.35]}>
        <boxGeometry args={[0.56, 0.25, 0.8]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.7, -0.72]}>
        <boxGeometry args={[0.54, 0.4, 0.1]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      {/* Head rest */}
      <mesh position={[0, 1.0, -0.72]}>
        <boxGeometry args={[0.28, 0.22, 0.16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Steering wheel — centered in cockpit, in front of driver */}
      <mesh position={[0, 0.57, 0.12]} rotation={[Math.PI / 3.2, 0, 0]}>
        <torusGeometry args={[0.19, 0.028, 8, 18]} />
        <meshStandardMaterial color="#111111" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.57, 0.12]} rotation={[Math.PI / 3.2, 0, 0]}>
        <cylinderGeometry args={[0.042, 0.042, 0.04, 8]} />
        <meshStandardMaterial color="#222222" roughness={0.5} />
      </mesh>
      {/* Steering column */}
      <mesh position={[0, 0.44, 0.02]} rotation={[Math.PI / 3.2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 6]} />
        <meshStandardMaterial color="#444" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* ── ROLL HOOP ── */}
      <mesh position={[0, 0.84, -0.46]} castShadow>
        <torusGeometry args={[0.44, 0.05, 8, 18, Math.PI]} />
        <meshStandardMaterial color="#333333" metalness={0.78} roughness={0.18} />
      </mesh>
      {/* Roll hoop support legs — connect hoop feet to body */}
      <mesh position={[-0.44, 0.64, -0.46]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.42, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.78} roughness={0.18} />
      </mesh>
      <mesh position={[0.44, 0.64, -0.46]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.42, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.78} roughness={0.18} />
      </mesh>
      {/* Hoop cross brace */}
      <mesh position={[0, 1.24, -0.46]}>
        <boxGeometry args={[0.86, 0.05, 0.05]} />
        <meshStandardMaterial color="#333333" metalness={0.78} roughness={0.18} />
      </mesh>
      {/* Forward halo strut */}
      <mesh position={[0, 0.78, 0.18]} rotation={[-0.4, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.56, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Wing mirrors on hoop arms */}
      <mesh position={[-0.5, 0.72, -0.1]}>
        <boxGeometry args={[0.12, 0.065, 0.09]} />
        <meshStandardMaterial color="#222" roughness={0.5} />
      </mesh>
      <mesh position={[0.5, 0.72, -0.1]}>
        <boxGeometry args={[0.12, 0.065, 0.09]} />
        <meshStandardMaterial color="#222" roughness={0.5} />
      </mesh>

      {/* ── ENGINE BLOCK (behind seat) ── */}
      <mesh position={[0, 0.44, -1.1]} castShadow>
        <boxGeometry args={[0.56, 0.44, 0.54]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.55} roughness={0.45} />
      </mesh>
      {/* Cooling fins */}
      {[0.16, 0.04, -0.08, -0.2].map((dz, i) => (
        <mesh key={i} position={[0, 0.6, -1.0 + dz]}>
          <boxGeometry args={[0.52, 0.04, 0.07]} />
          <meshStandardMaterial color="#444" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      {/* Airbox intake */}
      <mesh position={[0, 0.8, -1.1]}>
        <cylinderGeometry args={[0.14, 0.12, 0.34, 10]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.99, -1.1]}>
        <cylinderGeometry args={[0.155, 0.155, 0.06, 10]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      {/* ── EXHAUST ── */}
      {/* Header pipe (angled up) */}
      <mesh position={[0.18, 0.36, -1.3]} rotation={[0.22, 0, 0.28]}>
        <cylinderGeometry args={[0.055, 0.062, 0.75, 10]} />
        <meshStandardMaterial color="#8b6914" metalness={0.72} roughness={0.28} />
      </mesh>
      {/* Chrome exit tip */}
      <mesh position={[0.28, 0.74, -1.5]}>
        <cylinderGeometry args={[0.072, 0.055, 0.1, 10]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.88} roughness={0.12} />
      </mesh>
      {/* Heat wrap near header */}
      <mesh position={[0.18, 0.24, -1.12]} rotation={[0.22, 0, 0.28]}>
        <cylinderGeometry args={[0.065, 0.065, 0.22, 10]} />
        <meshStandardMaterial color="#666" roughness={0.85} />
      </mesh>

      {/* ── REAR BODYWORK ── */}
      <mesh position={[0, 0.3, -1.44]} castShadow>
        <boxGeometry args={[1.52, 0.22, 0.4]} />
        <meshPhysicalMaterial color={color} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={0.07} />
      </mesh>

      {/* ── REAR WING ── */}
      <mesh position={[0, 0.65, -1.5]} castShadow>
        <boxGeometry args={[1.74, 0.07, 0.44]} />
        <meshPhysicalMaterial color={color} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={0.07} />
      </mesh>
      {/* Second element (Gurney flap) */}
      <mesh position={[0, 0.57, -1.72]}>
        <boxGeometry args={[1.68, 0.055, 0.06]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      {/* End plates */}
      <mesh position={[-0.89, 0.58, -1.5]}>
        <boxGeometry args={[0.05, 0.24, 0.46]} />
        <meshPhysicalMaterial color={color} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={0.07} />
      </mesh>
      <mesh position={[0.89, 0.58, -1.5]}>
        <boxGeometry args={[0.05, 0.24, 0.46]} />
        <meshPhysicalMaterial color={color} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={0.07} />
      </mesh>
      {/* Wing pillars */}
      <mesh position={[-0.4, 0.47, -1.44]}>
        <boxGeometry args={[0.04, 0.32, 0.04]} />
        <meshStandardMaterial color="#444" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[0.4, 0.47, -1.44]}>
        <boxGeometry args={[0.04, 0.32, 0.04]} />
        <meshStandardMaterial color="#444" metalness={0.65} roughness={0.3} />
      </mesh>

      {/* ── WHEEL ARCHES ── */}
      <mesh position={[-0.93, 0.36, 0.93]} castShadow>
        <boxGeometry args={[0.28, 0.26, 0.84]} />
        <meshPhysicalMaterial color={color} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={0.07} />
      </mesh>
      <mesh position={[0.93, 0.36, 0.93]} castShadow>
        <boxGeometry args={[0.28, 0.26, 0.84]} />
        <meshPhysicalMaterial color={color} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={0.07} />
      </mesh>
      <mesh position={[-0.96, 0.4, -0.9]} castShadow>
        <boxGeometry args={[0.28, 0.32, 0.92]} />
        <meshPhysicalMaterial color={color} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={0.07} />
      </mesh>
      <mesh position={[0.96, 0.4, -0.9]} castShadow>
        <boxGeometry args={[0.28, 0.32, 0.92]} />
        <meshPhysicalMaterial color={color} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={0.07} />
      </mesh>

      {/* ── RACING STRIPE ── */}
      <mesh position={[0, 0.31, 0.28]}>
        <boxGeometry args={[0.17, 0.005, 2.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} opacity={0.8} transparent />
      </mesh>

      {/* ── NUMBER PLATE ── */}
      <mesh position={[0, 0.32, 1.92]}>
        <boxGeometry args={[0.5, 0.26, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.32, 1.93]}>
        <boxGeometry args={[0.46, 0.22, 0.01]} />
        <meshStandardMaterial color="#cc0000" roughness={0.6} />
      </mesh>

      {/* ── LIGHTS ── */}
      <Headlight pos={[-0.42, 0.3, 1.89]} w={0.22} h={0.11} />
      <Headlight pos={[0.42, 0.3, 1.89]} w={0.22} h={0.11} />
      <Taillight pos={[-0.52, 0.3, -1.54]} w={0.28} h={0.1} />
      <Taillight pos={[0.52, 0.3, -1.54]} w={0.28} h={0.1} />

      {/* ── WHEELS ── */}
      {/* Front - slightly smaller */}
      <Wheel pos={[-1.06, 0.3, 0.95]} r={0.3} w={0.3} spokes={4} rimColor="#dddddd" />
      <Wheel pos={[1.06, 0.3, 0.95]} r={0.3} w={0.3} spokes={4} rimColor="#dddddd" />
      {/* Rear - wider and bigger */}
      <Wheel pos={[-1.1, 0.36, -0.9]} r={0.36} w={0.38} spokes={5} rimColor="#dddddd" />
      <Wheel pos={[1.1, 0.36, -0.9]} r={0.36} w={0.38} spokes={5} rimColor="#dddddd" />
    </group>
  )
}

// ─── Car 2: Lifted Pickup Truck ─────────────────────────────────────────────
// Beefy, tall, off-road ready with bull bar and roof gear

function Car2({ color }: { color: string }) {
  return (
    <group>
      {/* ── FRAME / CHASSIS ── */}
      {/* Left rail */}
      <mesh position={[-0.7, 0.72, 0]} castShadow>
        <boxGeometry args={[0.18, 0.18, 4.4]} />
        <meshStandardMaterial color="#222222" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Right rail */}
      <mesh position={[0.7, 0.72, 0]} castShadow>
        <boxGeometry args={[0.18, 0.18, 4.4]} />
        <meshStandardMaterial color="#222222" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Cross members */}
      {[-1.5, -0.5, 0.5, 1.5].map((z, i) => (
        <mesh key={i} position={[0, 0.72, z]}>
          <boxGeometry args={[1.6, 0.14, 0.14]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.3} />
        </mesh>
      ))}

      {/* ── LOWER BODY PANELS ── */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[2.1, 0.44, 4.2]} />
        <meshPhysicalMaterial color={color} roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>

      {/* ── FENDER FLARES (wide arches) ── */}
      <mesh position={[-1.12, 0.88, 1.25]} castShadow>
        <boxGeometry args={[0.22, 0.32, 0.95]} />
        <meshPhysicalMaterial color={color} roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[1.12, 0.88, 1.25]} castShadow>
        <boxGeometry args={[0.22, 0.32, 0.95]} />
        <meshPhysicalMaterial color={color} roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[-1.12, 0.88, -1.3]} castShadow>
        <boxGeometry args={[0.22, 0.32, 1.0]} />
        <meshPhysicalMaterial color={color} roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[1.12, 0.88, -1.3]} castShadow>
        <boxGeometry args={[0.22, 0.32, 1.0]} />
        <meshPhysicalMaterial color={color} roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>

      {/* ── HOOD ── */}
      <mesh position={[0, 1.22, 1.2]} castShadow>
        <boxGeometry args={[2.0, 0.2, 1.45]} />
        <meshPhysicalMaterial color={color} roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      {/* Hood power dome */}
      <mesh position={[0, 1.35, 1.1]} castShadow>
        <boxGeometry args={[0.55, 0.1, 0.85]} />
        <meshPhysicalMaterial color={color} roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      {/* Hood scoop intake */}
      <mesh position={[0, 1.42, 0.88]}>
        <boxGeometry args={[0.32, 0.06, 0.35]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
      </mesh>

      {/* ── CAB ── */}
      <mesh position={[0, 1.58, 0.18]} castShadow>
        <boxGeometry args={[1.95, 0.82, 1.6]} />
        <meshPhysicalMaterial color={color} roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.02, 0.18]} castShadow>
        <boxGeometry args={[1.9, 0.1, 1.55]} />
        <meshPhysicalMaterial color={color} roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>

      {/* ── WINDOWS ── */}
      {/* Windshield */}
      <mesh position={[0, 1.62, 1.0]} rotation={[0.12, 0, 0]}>
        <planeGeometry args={[1.58, 0.68]} />
        <meshPhysicalMaterial
          color="#88aabb"
          roughness={0.04}
          metalness={0.08}
          transmission={0.6}
          opacity={0.55}
          transparent
        />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 1.6, -0.6]} rotation={[-0.08, Math.PI, 0]}>
        <planeGeometry args={[1.55, 0.58]} />
        <meshPhysicalMaterial
          color="#88aabb"
          roughness={0.04}
          metalness={0.08}
          transmission={0.5}
          opacity={0.5}
          transparent
        />
      </mesh>
      {/* Side windows */}
      <mesh position={[-0.98, 1.62, 0.18]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.3, 0.58]} />
        <meshPhysicalMaterial color="#88aabb" roughness={0.04} transmission={0.5} opacity={0.5} transparent />
      </mesh>
      <mesh position={[0.98, 1.62, 0.18]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.3, 0.58]} />
        <meshPhysicalMaterial color="#88aabb" roughness={0.04} transmission={0.5} opacity={0.5} transparent />
      </mesh>

      {/* A-pillar trim */}
      <mesh position={[-0.94, 1.72, 0.96]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.08, 0.7, 0.06]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      <mesh position={[0.94, 1.72, 0.96]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.08, 0.7, 0.06]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>

      {/* ── TRUCK BED ── */}
      {/* Bed floor */}
      <mesh position={[0, 1.02, -1.35]} castShadow>
        <boxGeometry args={[1.94, 0.08, 1.55]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} metalness={0.15} />
      </mesh>
      {/* Bed liner texture strips */}
      {[-0.55, -0.15, 0.25].map((z, i) => (
        <mesh key={i} position={[0, 1.07, -1.35 + z]}>
          <boxGeometry args={[1.88, 0.04, 0.08]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      ))}
      {/* Bed walls */}
      <mesh position={[-0.98, 1.28, -1.35]} castShadow>
        <boxGeometry args={[0.08, 0.55, 1.55]} />
        <meshPhysicalMaterial color={color} roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[0.98, 1.28, -1.35]} castShadow>
        <boxGeometry args={[0.08, 0.55, 1.55]} />
        <meshPhysicalMaterial color={color} roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      {/* Cab wall (front of bed) */}
      <mesh position={[0, 1.28, -0.58]} castShadow>
        <boxGeometry args={[1.94, 0.55, 0.08]} />
        <meshPhysicalMaterial color={color} roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      {/* Tailgate */}
      <mesh position={[0, 1.28, -2.1]} castShadow>
        <boxGeometry args={[1.94, 0.55, 0.08]} />
        <meshPhysicalMaterial color={color} roughness={0.16} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      {/* Tailgate handle */}
      <mesh position={[0, 1.12, -2.15]}>
        <boxGeometry args={[0.28, 0.07, 0.04]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Bed tie-down anchors */}
      {[-0.6, 0.6].map((x) =>
        [-0.7, -1.2].map((z, j) => (
          <mesh key={`${x}-${j}`} position={[x, 1.07, z]}>
            <cylinderGeometry args={[0.055, 0.055, 0.06, 8]} />
            <meshStandardMaterial color="#666" metalness={0.7} roughness={0.3} />
          </mesh>
        ))
      )}

      {/* ── ROOF RACK ── */}
      {/* Main frame */}
      <mesh position={[0, 2.16, 0.18]}>
        <boxGeometry args={[1.6, 0.06, 1.35]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Rails */}
      <mesh position={[-0.82, 2.13, 0.18]}>
        <boxGeometry args={[0.05, 0.05, 1.55]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.82, 2.13, 0.18]}>
        <boxGeometry args={[0.05, 0.05, 1.55]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Cross bars */}
      {[-0.3, 0.3].map((z, i) => (
        <mesh key={i} position={[0, 2.14, z]}>
          <boxGeometry args={[1.7, 0.05, 0.06]} />
          <meshStandardMaterial color="#555" metalness={0.65} roughness={0.3} />
        </mesh>
      ))}
      {/* LIGHT BAR on roof rack */}
      <mesh position={[0, 2.22, 0.72]}>
        <boxGeometry args={[1.45, 0.1, 0.1]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      {/* Light bar LEDs */}
      {[-0.55, -0.3, -0.05, 0.2, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 2.22, 0.77]}>
          <boxGeometry args={[0.14, 0.08, 0.04]} />
          <meshStandardMaterial color="#eeeeff" emissive="#ffffcc" emissiveIntensity={2} roughness={0.05} />
        </mesh>
      ))}

      {/* ── RUNNING BOARDS ── */}
      <mesh position={[-1.05, 0.66, -0.05]} castShadow>
        <boxGeometry args={[0.18, 0.08, 2.6]} />
        <meshStandardMaterial color="#333" metalness={0.55} roughness={0.5} />
      </mesh>
      <mesh position={[1.05, 0.66, -0.05]} castShadow>
        <boxGeometry args={[0.18, 0.08, 2.6]} />
        <meshStandardMaterial color="#333" metalness={0.55} roughness={0.5} />
      </mesh>
      {/* Step grip texture */}
      {[-0.6, -0.1, 0.4].map((z, i) => (
        <mesh key={i} position={[-1.05, 0.71, z]}>
          <boxGeometry args={[0.16, 0.02, 0.12]} />
          <meshStandardMaterial color="#222" roughness={0.9} />
        </mesh>
      ))}

      {/* ── BULL BAR ── */}
      {/* Main horizontal bar */}
      <mesh position={[0, 0.88, 2.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 1.9, 10]} />
        <meshStandardMaterial color="#888" metalness={0.88} roughness={0.12} />
      </mesh>
      {/* Vertical legs */}
      <mesh position={[-0.78, 0.72, 2.14]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.42, 10]} />
        <meshStandardMaterial color="#888" metalness={0.88} roughness={0.12} />
      </mesh>
      <mesh position={[0.78, 0.72, 2.14]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.42, 10]} />
        <meshStandardMaterial color="#888" metalness={0.88} roughness={0.12} />
      </mesh>
      {/* Angled outer bars */}
      <mesh position={[-0.98, 0.72, 2.05]} rotation={[0.3, 0, 0.35]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color="#888" metalness={0.88} roughness={0.12} />
      </mesh>
      <mesh position={[0.98, 0.72, 2.05]} rotation={[0.3, 0, -0.35]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color="#888" metalness={0.88} roughness={0.12} />
      </mesh>
      {/* Bull bar driving lights */}
      {[-0.55, 0, 0.55].map((x, i) => (
        <group key={i} position={[x, 0.88, 2.18]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.06, 12]} />
            <meshStandardMaterial color="#111" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <circleGeometry args={[0.055, 12]} />
            <meshStandardMaterial color="#eeeeff" emissive="#ffffcc" emissiveIntensity={2.5} roughness={0.05} />
          </mesh>
        </group>
      ))}

      {/* ── GRILLE ── */}
      <mesh position={[0, 0.96, 2.1]}>
        <boxGeometry args={[1.35, 0.4, 0.06]} />
        <meshStandardMaterial color="#111" roughness={0.75} />
      </mesh>
      {/* Grille chrome trim */}
      <mesh position={[0, 0.96, 2.13]}>
        <boxGeometry args={[1.45, 0.46, 0.03]} />
        <meshStandardMaterial color="#888" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Brand emblem */}
      <mesh position={[0, 0.98, 2.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 12]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── FRONT BUMPER ── */}
      <mesh position={[0, 0.62, 2.1]} castShadow>
        <boxGeometry args={[2.15, 0.28, 0.22]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Bumper skid plate */}
      <mesh position={[0, 0.5, 2.15]}>
        <boxGeometry args={[1.8, 0.12, 0.18]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Tow hooks */}
      <mesh position={[-0.65, 0.48, 2.22]}>
        <torusGeometry args={[0.07, 0.025, 6, 10, Math.PI * 1.5]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.65, 0.48, 2.22]}>
        <torusGeometry args={[0.07, 0.025, 6, 10, Math.PI * 1.5]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ── REAR BUMPER ── */}
      <mesh position={[0, 0.62, -2.12]} castShadow>
        <boxGeometry args={[2.15, 0.28, 0.22]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Rear tow hitch */}
      <mesh position={[0, 0.55, -2.2]}>
        <boxGeometry args={[0.14, 0.12, 0.2]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* ── LIGHTS ── */}
      <Headlight pos={[-0.72, 1.05, 2.13]} w={0.34} h={0.15} />
      <Headlight pos={[0.72, 1.05, 2.13]} w={0.34} h={0.15} />
      <Taillight pos={[-0.78, 1.1, -2.13]} w={0.38} h={0.18} />
      <Taillight pos={[0.78, 1.1, -2.13]} w={0.38} h={0.18} />

      {/* ── DUAL EXHAUST ── */}
      <ExhaustTip pos={[-0.5, 0.62, -2.2]} />
      <ExhaustTip pos={[0.5, 0.62, -2.2]} />

      {/* ── WHEELS (big knobby off-road) ── */}
      <Wheel pos={[-1.18, 0.52, 1.25]} r={0.52} w={0.44} spokes={6} rimColor="#dddddd" knobby />
      <Wheel pos={[1.18, 0.52, 1.25]} r={0.52} w={0.44} spokes={6} rimColor="#dddddd" knobby />
      <Wheel pos={[-1.18, 0.52, -1.3]} r={0.52} w={0.44} spokes={6} rimColor="#dddddd" knobby />
      <Wheel pos={[1.18, 0.52, -1.3]} r={0.52} w={0.44} spokes={6} rimColor="#dddddd" knobby />
    </group>
  )
}

// ─── Car 3: Adventure SUV ────────────────────────────────────────────────────
// Big, bold, ready for anything — spare tire on back, gear on roof

function Car3({ color }: { color: string }) {
  return (
    <group>
      {/* ── LOWER CHASSIS ── */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[2.25, 0.32, 4.6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.75} metalness={0.3} />
      </mesh>
      {/* Skid plate front */}
      <mesh position={[0, 0.48, 2.0]}>
        <boxGeometry args={[2.0, 0.14, 0.6]} />
        <meshStandardMaterial color="#444" metalness={0.65} roughness={0.3} />
      </mesh>
      {/* Skid plate rear */}
      <mesh position={[0, 0.48, -1.9]}>
        <boxGeometry args={[2.0, 0.14, 0.5]} />
        <meshStandardMaterial color="#444" metalness={0.65} roughness={0.3} />
      </mesh>

      {/* ── LOWER BODY ── */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[2.2, 0.46, 4.5]} />
        <meshPhysicalMaterial color={color} roughness={0.15} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>

      {/* ── WIDE FENDER FLARES ── */}
      <mesh position={[-1.2, 0.88, 1.35]} castShadow>
        <boxGeometry args={[0.24, 0.34, 1.05]} />
        <meshPhysicalMaterial color={color} roughness={0.15} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[1.2, 0.88, 1.35]} castShadow>
        <boxGeometry args={[0.24, 0.34, 1.05]} />
        <meshPhysicalMaterial color={color} roughness={0.15} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[-1.2, 0.88, -1.4]} castShadow>
        <boxGeometry args={[0.24, 0.34, 1.1]} />
        <meshPhysicalMaterial color={color} roughness={0.15} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[1.2, 0.88, -1.4]} castShadow>
        <boxGeometry args={[0.24, 0.34, 1.1]} />
        <meshPhysicalMaterial color={color} roughness={0.15} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>

      {/* ── HOOD ── */}
      <mesh position={[0, 1.2, 1.55]} castShadow>
        <boxGeometry args={[2.12, 0.16, 1.2]} />
        <meshPhysicalMaterial color={color} roughness={0.15} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      {/* Hood vent scoops */}
      <mesh position={[-0.45, 1.3, 1.5]}>
        <boxGeometry args={[0.3, 0.06, 0.45]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
      </mesh>
      <mesh position={[0.45, 1.3, 1.5]}>
        <boxGeometry args={[0.3, 0.06, 0.45]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
      </mesh>

      {/* ── MAIN CABIN ── */}
      <mesh position={[0, 1.55, -0.2]} castShadow>
        <boxGeometry args={[2.1, 0.76, 2.85]} />
        <meshPhysicalMaterial color={color} roughness={0.15} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.97, -0.2]} castShadow>
        <boxGeometry args={[2.05, 0.12, 2.75]} />
        <meshPhysicalMaterial color={color} roughness={0.15} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>

      {/* ── WINDOWS ── */}
      {/* Windshield */}
      <mesh position={[0, 1.56, 1.2]} rotation={[0.18, 0, 0]}>
        <planeGeometry args={[1.7, 0.68]} />
        <meshPhysicalMaterial
          color="#336688"
          roughness={0.04}
          metalness={0.08}
          transmission={0.5}
          opacity={0.45}
          transparent
        />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 1.54, -1.6]} rotation={[-0.1, Math.PI, 0]}>
        <planeGeometry args={[1.65, 0.6]} />
        <meshPhysicalMaterial
          color="#336688"
          roughness={0.04}
          metalness={0.08}
          transmission={0.4}
          opacity={0.4}
          transparent
        />
      </mesh>
      {/* Front side windows */}
      <mesh position={[-1.06, 1.56, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 0.6]} />
        <meshPhysicalMaterial color="#336688" roughness={0.04} transmission={0.45} opacity={0.42} transparent />
      </mesh>
      <mesh position={[1.06, 1.56, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 0.6]} />
        <meshPhysicalMaterial color="#336688" roughness={0.04} transmission={0.45} opacity={0.42} transparent />
      </mesh>
      {/* Rear side windows */}
      <mesh position={[-1.06, 1.54, -0.7]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.0, 0.56]} />
        <meshPhysicalMaterial color="#336688" roughness={0.04} transmission={0.4} opacity={0.4} transparent />
      </mesh>
      <mesh position={[1.06, 1.54, -0.7]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.0, 0.56]} />
        <meshPhysicalMaterial color="#336688" roughness={0.04} transmission={0.4} opacity={0.4} transparent />
      </mesh>

      {/* Pillar trim */}
      <mesh position={[-1.02, 1.72, 1.14]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[0.08, 0.72, 0.07]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      <mesh position={[1.02, 1.72, 1.14]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[0.08, 0.72, 0.07]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>

      {/* ── ROOF RACK ── */}
      {/* Main platform */}
      <mesh position={[0, 2.13, -0.2]}>
        <boxGeometry args={[1.72, 0.06, 2.2]} />
        <meshStandardMaterial color="#333" metalness={0.68} roughness={0.28} />
      </mesh>
      {/* Rails */}
      <mesh position={[-0.88, 2.1, -0.2]}>
        <boxGeometry args={[0.055, 0.055, 2.45]} />
        <meshStandardMaterial color="#555" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[0.88, 2.1, -0.2]}>
        <boxGeometry args={[0.055, 0.055, 2.45]} />
        <meshStandardMaterial color="#555" metalness={0.65} roughness={0.3} />
      </mesh>
      {/* Crossbars */}
      {[-0.6, 0, 0.6].map((z, i) => (
        <mesh key={i} position={[0, 2.11, z]}>
          <boxGeometry args={[1.85, 0.05, 0.055]} />
          <meshStandardMaterial color="#555" metalness={0.65} roughness={0.3} />
        </mesh>
      ))}
      {/* Gear boxes on rack */}
      <mesh position={[-0.38, 2.22, -0.35]}>
        <boxGeometry args={[0.5, 0.2, 0.7]} />
        <meshStandardMaterial color="#2a3a2a" roughness={0.75} />
      </mesh>
      <mesh position={[0.38, 2.22, -0.35]}>
        <boxGeometry args={[0.5, 0.2, 0.6]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.75} />
      </mesh>
      {/* Jerry can */}
      <mesh position={[0.55, 2.24, 0.42]}>
        <boxGeometry args={[0.18, 0.26, 0.38]} />
        <meshStandardMaterial color="#4a3a1a" roughness={0.7} metalness={0.15} />
      </mesh>

      {/* ── RUNNING BOARDS ── */}
      <mesh position={[-1.12, 0.64, -0.1]} castShadow>
        <boxGeometry args={[0.2, 0.09, 3.0]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.55} />
      </mesh>
      <mesh position={[1.12, 0.64, -0.1]} castShadow>
        <boxGeometry args={[0.2, 0.09, 3.0]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.55} />
      </mesh>
      {/* Step grip tread */}
      {[-0.8, -0.2, 0.4].map((z, i) => (
        <mesh key={i} position={[-1.12, 0.7, z]}>
          <boxGeometry args={[0.18, 0.025, 0.15]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.92} />
        </mesh>
      ))}

      {/* Body side cladding */}
      <mesh position={[-1.12, 0.82, -0.1]}>
        <boxGeometry args={[0.05, 0.14, 4.3]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[1.12, 0.82, -0.1]}>
        <boxGeometry args={[0.05, 0.14, 4.3]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* ── GRILLE ── */}
      <mesh position={[0, 0.96, 2.28]}>
        <boxGeometry args={[1.4, 0.46, 0.07]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.75} />
      </mesh>
      {/* Chrome surround */}
      <mesh position={[0, 0.96, 2.31]}>
        <boxGeometry args={[1.52, 0.52, 0.03]} />
        <meshStandardMaterial color="#999" metalness={0.88} roughness={0.12} />
      </mesh>
      {/* Grille bars */}
      {[-0.14, 0, 0.14].map((y, i) => (
        <mesh key={i} position={[0, 0.96 + y, 2.34]}>
          <boxGeometry args={[1.38, 0.04, 0.02]} />
          <meshStandardMaterial color="#777" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}
      {/* Emblem */}
      <mesh position={[0, 0.98, 2.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 12]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── FRONT BUMPER ── */}
      <mesh position={[0, 0.62, 2.3]} castShadow>
        <boxGeometry args={[2.2, 0.3, 0.22]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.25} />
      </mesh>
      {/* Bumper guard */}
      <mesh position={[0, 0.5, 2.34]}>
        <boxGeometry args={[1.7, 0.14, 0.18]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Fog light pods */}
      {[-0.75, 0.75].map((x, i) => (
        <group key={i} position={[x, 0.62, 2.34]}>
          <mesh>
            <boxGeometry args={[0.28, 0.16, 0.06]} />
            <meshStandardMaterial color="#111" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.24, 0.12, 0.02]} />
            <meshStandardMaterial color="#eeeeff" emissive="#ffffcc" emissiveIntensity={1.5} roughness={0.05} />
          </mesh>
        </group>
      ))}

      {/* ── REAR HATCH & SPARE TIRE ── */}
      <mesh position={[0, 1.22, -2.32]} castShadow>
        <boxGeometry args={[2.1, 1.58, 0.1]} />
        <meshPhysicalMaterial color={color} roughness={0.15} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      {/* Rear bumper */}
      <mesh position={[0, 0.62, -2.33]} castShadow>
        <boxGeometry args={[2.2, 0.3, 0.22]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.25} />
      </mesh>
      {/* SPARE TIRE MOUNTED ON BACK */}
      <mesh position={[0, 1.28, -2.42]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.4, 0.14, 10, 22]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Spare tire rim */}
      <mesh position={[0, 1.28, -2.46]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.06, 16]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Spare tire spokes */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 1.28, -2.46]} rotation={[(i * Math.PI * 2) / 5, Math.PI / 2, 0]}>
          <boxGeometry args={[0.05, 0.52, 0.04]} />
          <meshStandardMaterial color="#999" metalness={0.8} roughness={0.15} />
        </mesh>
      ))}
      {/* Spare tire carrier bracket */}
      <mesh position={[0, 1.28, -2.38]}>
        <boxGeometry args={[0.1, 0.96, 0.08]} />
        <meshStandardMaterial color="#333" metalness={0.65} roughness={0.3} />
      </mesh>

      {/* ── LIGHTS ── */}
      <Headlight pos={[-0.82, 1.08, 2.32]} w={0.38} h={0.16} />
      <Headlight pos={[0.82, 1.08, 2.32]} w={0.38} h={0.16} />
      <Taillight pos={[-0.82, 1.12, -2.34]} w={0.42} h={0.2} />
      <Taillight pos={[0.82, 1.12, -2.34]} w={0.42} h={0.2} />

      {/* ── DUAL EXHAUST ── */}
      <ExhaustTip pos={[-0.55, 0.58, -2.42]} />
      <ExhaustTip pos={[0.55, 0.58, -2.42]} />

      {/* ── WHEELS ── */}
      <Wheel pos={[-1.22, 0.48, 1.35]} r={0.48} w={0.42} spokes={6} rimColor="#dddddd" />
      <Wheel pos={[1.22, 0.48, 1.35]} r={0.48} w={0.42} spokes={6} rimColor="#dddddd" />
      <Wheel pos={[-1.22, 0.48, -1.4]} r={0.48} w={0.42} spokes={6} rimColor="#dddddd" />
      <Wheel pos={[1.22, 0.48, -1.4]} r={0.48} w={0.42} spokes={6} rimColor="#dddddd" />
    </group>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

const CAR_COMPONENTS: Record<CarType, React.FC<{ color: string }>> = {
  car1: Car1,
  car2: Car2,
  car3: Car3,
}

export default function CarModel({
  carType,
  color,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: CarModelProps) {
  const ref = useRef<THREE.Group>(null)
  const CarComponent = CAR_COMPONENTS[carType]

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      <CarComponent color={color} />
    </group>
  )
}
