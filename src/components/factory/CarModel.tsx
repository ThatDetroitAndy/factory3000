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

function Wheel({ position, size = 0.4 }: { position: [number, number, number]; size?: number }) {
  return (
    <group position={position}>
      {/* Tire */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size, size, size * 0.7, 16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
      {/* Hub cap */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[size * 0.36, 0, 0]}>
        <cylinderGeometry args={[size * 0.5, size * 0.5, 0.05, 8]} />
        <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

function Bumper({ position, width, color }: { position: [number, number, number]; width: number; color: string }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[width, 0.35, 0.25]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
    </mesh>
  )
}

function Headlight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.18, 8, 8, 0, Math.PI]} />
        <meshStandardMaterial color="#FFFFEE" emissive="#FFFFAA" emissiveIntensity={0.5} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[0.18, 8]} />
        <meshStandardMaterial color="#FFEECC" emissive="#FFFFAA" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

function Taillight({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.25, 0.15, 0.08]} />
      <meshStandardMaterial color="#FF2222" emissive="#FF0000" emissiveIntensity={0.3} roughness={0.3} />
    </mesh>
  )
}

function Exhaust({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.08, 0.1, 0.3, 8]} />
      <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.3} />
    </mesh>
  )
}

/** Car 1 — Go-kart: low, sporty, fun to look at */
function Car1({ color }: { color: string }) {
  return (
    <group>
      {/* Main body — rounded feel via multiple shapes */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.6, 0.25, 2.8]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Body side curves (fenders) */}
      <mesh position={[-0.7, 0.4, 0.8]} castShadow>
        <sphereGeometry args={[0.45, 8, 8, 0, Math.PI, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0.7, 0.4, 0.8]} castShadow>
        <sphereGeometry args={[0.45, 8, 8, 0, Math.PI, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Nose — angled front */}
      <mesh position={[0, 0.35, 1.5]} castShadow>
        <boxGeometry args={[1.4, 0.2, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Seat bucket */}
      <mesh position={[0, 0.55, -0.3]} castShadow>
        <boxGeometry args={[0.7, 0.3, 0.7]} />
        <meshStandardMaterial color="#222222" roughness={0.9} />
      </mesh>
      {/* Seat back */}
      <mesh position={[0, 0.75, -0.6]} castShadow>
        <boxGeometry args={[0.65, 0.35, 0.15]} />
        <meshStandardMaterial color="#222222" roughness={0.9} />
      </mesh>
      {/* Steering wheel */}
      <mesh position={[0, 0.7, 0.4]} rotation={[Math.PI / 3.5, 0, 0]}>
        <torusGeometry args={[0.18, 0.025, 8, 16]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </mesh>
      {/* Steering column */}
      <mesh position={[0, 0.55, 0.3]} rotation={[Math.PI / 3.5, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
        <meshStandardMaterial color="#444444" metalness={0.6} />
      </mesh>
      {/* Roll bar */}
      <mesh position={[0, 0.85, -0.3]} castShadow>
        <torusGeometry args={[0.45, 0.04, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Rear spoiler */}
      <mesh position={[0, 0.65, -1.35]} castShadow>
        <boxGeometry args={[1.5, 0.06, 0.35]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Spoiler supports */}
      <mesh position={[-0.5, 0.55, -1.3]} castShadow>
        <boxGeometry args={[0.06, 0.2, 0.06]} />
        <meshStandardMaterial color="#444444" metalness={0.5} />
      </mesh>
      <mesh position={[0.5, 0.55, -1.3]} castShadow>
        <boxGeometry args={[0.06, 0.2, 0.06]} />
        <meshStandardMaterial color="#444444" metalness={0.5} />
      </mesh>
      {/* Headlights */}
      <Headlight position={[-0.5, 0.4, 1.65]} />
      <Headlight position={[0.5, 0.4, 1.65]} />
      {/* Taillights */}
      <Taillight position={[-0.55, 0.4, -1.42]} />
      <Taillight position={[0.55, 0.4, -1.42]} />
      {/* Front bumper */}
      <Bumper position={[0, 0.25, 1.55]} width={1.5} color="#333333" />
      {/* Exhaust */}
      <Exhaust position={[0.4, 0.2, -1.45]} />
      {/* Wheels — big for a go-kart */}
      <Wheel position={[-0.85, 0.25, 0.9]} size={0.3} />
      <Wheel position={[0.85, 0.25, 0.9]} size={0.3} />
      <Wheel position={[-0.85, 0.25, -0.9]} size={0.35} />
      <Wheel position={[0.85, 0.25, -0.9]} size={0.35} />
    </group>
  )
}

/** Car 2 — Pickup truck: tough, boxy, useful */
function Car2({ color }: { color: string }) {
  return (
    <group>
      {/* Chassis/undercarriage */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[2, 0.3, 4]} />
        <meshStandardMaterial color="#333333" roughness={0.8} />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 0.65, 1.2]} castShadow>
        <boxGeometry args={[1.9, 0.25, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Hood scoop */}
      <mesh position={[0, 0.82, 1.1]} castShadow>
        <boxGeometry args={[0.5, 0.1, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.35} />
      </mesh>
      {/* Cab */}
      <mesh position={[0, 1.15, 0.15]} castShadow>
        <boxGeometry args={[1.85, 0.8, 1.5]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Cab roof */}
      <mesh position={[0, 1.6, 0.15]} castShadow>
        <boxGeometry args={[1.8, 0.1, 1.45]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 1.25, 0.88]} rotation={[0.15, 0, 0]}>
        <planeGeometry args={[1.5, 0.65]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.05} metalness={0.1} opacity={0.7} transparent />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 1.25, -0.58]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.5, 0.55]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.05} metalness={0.1} opacity={0.6} transparent />
      </mesh>
      {/* Side windows */}
      <mesh position={[-0.93, 1.2, 0.15]}>
        <planeGeometry args={[1.2, 0.5]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.05} opacity={0.6} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.93, 1.2, 0.15]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.2, 0.5]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.05} opacity={0.6} transparent side={THREE.DoubleSide} />
      </mesh>
      {/* Truck bed */}
      <mesh position={[0, 0.65, -1.3]} castShadow>
        <boxGeometry args={[1.9, 0.08, 1.3]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Bed walls */}
      <mesh position={[-0.93, 0.85, -1.3]} castShadow>
        <boxGeometry args={[0.08, 0.45, 1.3]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0.93, 0.85, -1.3]} castShadow>
        <boxGeometry args={[0.08, 0.45, 1.3]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Tailgate */}
      <mesh position={[0, 0.85, -1.95]} castShadow>
        <boxGeometry args={[1.9, 0.45, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Headlights */}
      <Headlight position={[-0.65, 0.65, 1.82]} />
      <Headlight position={[0.65, 0.65, 1.82]} />
      {/* Taillights */}
      <Taillight position={[-0.7, 0.75, -1.98]} />
      <Taillight position={[0.7, 0.75, -1.98]} />
      {/* Front bumper — chunky chrome */}
      <Bumper position={[0, 0.35, 1.85]} width={2} color="#888888" />
      {/* Rear bumper */}
      <Bumper position={[0, 0.35, -2]} width={2} color="#888888" />
      {/* Grille */}
      <mesh position={[0, 0.55, 1.82]}>
        <boxGeometry args={[1.2, 0.3, 0.05]} />
        <meshStandardMaterial color="#222222" roughness={0.8} />
      </mesh>
      {/* Side steps */}
      <mesh position={[-0.95, 0.3, 0.15]} castShadow>
        <boxGeometry args={[0.15, 0.08, 2.5]} />
        <meshStandardMaterial color="#444444" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.95, 0.3, 0.15]} castShadow>
        <boxGeometry args={[0.15, 0.08, 2.5]} />
        <meshStandardMaterial color="#444444" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Exhaust */}
      <Exhaust position={[0.6, 0.2, -2.05]} />
      {/* Wheels */}
      <Wheel position={[-1.05, 0.4, 1.2]} size={0.45} />
      <Wheel position={[1.05, 0.4, 1.2]} size={0.45} />
      <Wheel position={[-1.05, 0.4, -1.3]} size={0.45} />
      <Wheel position={[1.05, 0.4, -1.3]} size={0.45} />
    </group>
  )
}

/** Car 3 — SUV: big, chunky, family-friendly */
function Car3({ color }: { color: string }) {
  return (
    <group>
      {/* Chassis */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[2.2, 0.35, 4.2]} />
        <meshStandardMaterial color="#333333" roughness={0.8} />
      </mesh>
      {/* Lower body */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[2.15, 0.4, 4.1]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Upper body / cabin */}
      <mesh position={[0, 1.35, -0.15]} castShadow>
        <boxGeometry args={[2, 0.7, 3]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.75, -0.15]} castShadow>
        <boxGeometry args={[1.95, 0.1, 2.9]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Roof rack */}
      <mesh position={[0, 1.85, -0.15]} castShadow>
        <boxGeometry args={[1.6, 0.08, 2.2]} />
        <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Roof rack rails */}
      <mesh position={[-0.85, 1.82, -0.15]}>
        <boxGeometry args={[0.06, 0.06, 2.5]} />
        <meshStandardMaterial color="#666666" metalness={0.6} />
      </mesh>
      <mesh position={[0.85, 1.82, -0.15]}>
        <boxGeometry args={[0.06, 0.06, 2.5]} />
        <meshStandardMaterial color="#666666" metalness={0.6} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 1.4, 1.33]} rotation={[0.2, 0, 0]}>
        <planeGeometry args={[1.7, 0.6]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.05} metalness={0.1} opacity={0.7} transparent />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 1.4, -1.63]} rotation={[-0.15, Math.PI, 0]}>
        <planeGeometry args={[1.6, 0.55]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.05} opacity={0.6} transparent />
      </mesh>
      {/* Side windows — front */}
      <mesh position={[-1.01, 1.35, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1, 0.5]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.05} opacity={0.6} transparent />
      </mesh>
      <mesh position={[1.01, 1.35, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1, 0.5]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.05} opacity={0.6} transparent />
      </mesh>
      {/* Side windows — rear */}
      <mesh position={[-1.01, 1.35, -0.6]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 0.5]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.05} opacity={0.6} transparent />
      </mesh>
      <mesh position={[1.01, 1.35, -0.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 0.5]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.05} opacity={0.6} transparent />
      </mesh>
      {/* Hood slope */}
      <mesh position={[0, 1, 1.7]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[2, 0.12, 1]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Grille — bold front face */}
      <mesh position={[0, 0.75, 2.08]}>
        <boxGeometry args={[1.5, 0.4, 0.08]} />
        <meshStandardMaterial color="#222222" roughness={0.8} />
      </mesh>
      {/* Grille chrome trim */}
      <mesh position={[0, 0.75, 2.12]}>
        <boxGeometry args={[1.6, 0.45, 0.02]} />
        <meshStandardMaterial color="#999999" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Headlights */}
      <Headlight position={[-0.8, 0.8, 2.12]} />
      <Headlight position={[0.8, 0.8, 2.12]} />
      {/* Taillights */}
      <Taillight position={[-0.8, 0.85, -2.08]} />
      <Taillight position={[0.8, 0.85, -2.08]} />
      {/* Front bumper — big and chunky */}
      <mesh position={[0, 0.4, 2.1]} castShadow>
        <boxGeometry args={[2.2, 0.3, 0.2]} />
        <meshStandardMaterial color="#555555" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Rear bumper */}
      <mesh position={[0, 0.4, -2.1]} castShadow>
        <boxGeometry args={[2.2, 0.3, 0.2]} />
        <meshStandardMaterial color="#555555" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Side body trim */}
      <mesh position={[-1.08, 0.7, 0]} castShadow>
        <boxGeometry args={[0.05, 0.12, 3.8]} />
        <meshStandardMaterial color="#555555" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[1.08, 0.7, 0]} castShadow>
        <boxGeometry args={[0.05, 0.12, 3.8]} />
        <meshStandardMaterial color="#555555" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Exhaust — dual */}
      <Exhaust position={[-0.5, 0.3, -2.15]} />
      <Exhaust position={[0.5, 0.3, -2.15]} />
      {/* Wheels — biggest */}
      <Wheel position={[-1.15, 0.5, 1.3]} size={0.5} />
      <Wheel position={[1.15, 0.5, 1.3]} size={0.5} />
      <Wheel position={[-1.15, 0.5, -1.3]} size={0.5} />
      <Wheel position={[1.15, 0.5, -1.3]} size={0.5} />
    </group>
  )
}

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
