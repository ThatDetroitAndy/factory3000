'use client'

import * as THREE from 'three'
import { isMobileDevice } from '@/lib/isMobile'
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier'

/** Low-poly tree — chunky trunk + round canopy */
function Tree({ position, scale = 1, color = '#4CAF50' }: { position: [number, number, number]; scale?: number; color?: string }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 3, 6]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.9} />
      </mesh>
      {/* Canopy — stacked spheres for fullness */}
      <mesh position={[0, 4, 0]} castShadow>
        <sphereGeometry args={[2, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0.5, 4.8, 0.3]} castShadow>
        <sphereGeometry args={[1.3, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[-0.4, 4.5, -0.3]} castShadow>
        <sphereGeometry args={[1.1, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  )
}

/** Small bush */
function Bush({ position, color = '#66BB6A' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.8, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0.4, 0.3, 0.2]} castShadow>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    </group>
  )
}

/** Stack of tires */
function TireStack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0, 0.35, 0.7, 1.05].map((y, i) => (
        <mesh key={i} position={[0, y + 0.15, 0]} rotation={[Math.PI / 2, 0, i * 0.3]} castShadow>
          <torusGeometry args={[0.35, 0.15, 8, 12]} />
          <meshStandardMaterial color="#222222" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

/** Oil barrel */
function Barrel({ position, color = '#4A90D9' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 1.2, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Top rim */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.05, 12]} />
        <meshStandardMaterial color="#666666" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Band */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.37, 0.37, 0.08, 12]} />
        <meshStandardMaterial color="#555555" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

/** Toolbox */
function Toolbox({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.4]} />
        <meshStandardMaterial color="#CC3333" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.4, 0.06, 0.06]} />
        <meshStandardMaterial color="#666666" metalness={0.7} />
      </mesh>
    </group>
  )
}

/** Flag / banner on a pole */
function Flag({ position, color = '#FF6B4A' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 10, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Pole cap */}
      <mesh position={[0, 10.1, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Flag */}
      <mesh position={[0.7, 9.2, 0]} castShadow>
        <planeGeometry args={[1.4, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/** Traffic cone */
function Cone({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <coneGeometry args={[0.2, 0.7, 8]} />
        <meshStandardMaterial color="#FF6600" roughness={0.6} />
      </mesh>
      {/* White stripe */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.17, 0.12, 8]} />
        <meshStandardMaterial color="white" roughness={0.5} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.4, 0.06, 0.4]} />
        <meshStandardMaterial color="#FF6600" roughness={0.7} />
      </mesh>
    </group>
  )
}

/** Warning light / beacon */
function WarningLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.3, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#FFAA00" emissive="#FF8800" emissiveIntensity={0.5} roughness={0.3} />
      </mesh>
    </group>
  )
}

/** Road / path markings */
function RoadStripes({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const length = Math.sqrt(
    (end[0] - start[0]) ** 2 + (end[2] - start[2]) ** 2
  )
  const midX = (start[0] + end[0]) / 2
  const midZ = (start[2] + end[2]) / 2
  const angle = Math.atan2(end[0] - start[0], end[2] - start[2])
  const stripeCount = Math.floor(length / 3)

  return (
    <group>
      {Array.from({ length: stripeCount }).map((_, i) => {
        const t = (i + 0.5) / stripeCount
        const x = start[0] + (end[0] - start[0]) * t
        const z = start[2] + (end[2] - start[2]) * t
        return (
          <mesh key={i} position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, angle]}>
            <planeGeometry args={[0.3, 1.2]} />
            <meshStandardMaterial color="white" roughness={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}

/** All factory decorations and props */
export default function FactoryProps() {
  const mobile = isMobileDevice()

  return (
    <group>
      {/* Trees around the perimeter */}
      <Tree position={[-60, 0, -40]} scale={1.2} color="#4CAF50" />
      <Tree position={[-55, 0, 20]} scale={0.9} color="#66BB6A" />
      <Tree position={[60, 0, -30]} scale={1} color="#81C784" />
      <Tree position={[65, 0, 40]} scale={1.3} color="#4CAF50" />
      {!mobile && <Tree position={[-65, 0, 60]} scale={1.1} color="#4CAF50" />}
      {!mobile && <Tree position={[55, 0, 80]} scale={0.8} color="#66BB6A" />}
      {!mobile && <Tree position={[-50, 0, 90]} scale={1.4} color="#388E3C" />}
      {!mobile && <Tree position={[0, 0, 100]} scale={1} color="#4CAF50" />}
      {!mobile && <Tree position={[40, 0, 95]} scale={1.2} color="#66BB6A" />}
      {!mobile && <Tree position={[-70, 0, -80]} scale={1} color="#81C784" />}
      {!mobile && <Tree position={[70, 0, -70]} scale={0.9} color="#4CAF50" />}

      {/* Bushes */}
      <Bush position={[-45, 0, -20]} />
      <Bush position={[48, 0, 15]} color="#81C784" />
      {!mobile && <Bush position={[-40, 0, 50]} />}
      {!mobile && <Bush position={[45, 0, 65]} color="#66BB6A" />}
      {!mobile && <Bush position={[-55, 0, -60]} color="#81C784" />}
      {!mobile && <Bush position={[55, 0, -55]} />}

      {/* Tire stacks near the factory — dynamic physics, cars can knock them! */}
      <RigidBody type="dynamic" position={[15, 0, -5]} mass={10} colliders={false} angularDamping={0.5} restitution={0.3}>
        <CuboidCollider args={[0.5, 0.7, 0.5]} position={[0, 0.7, 0]} />
        <TireStack position={[0, 0, 0]} />
      </RigidBody>
      {!mobile && (
        <RigidBody type="dynamic" position={[16.5, 0, -5]} mass={10} colliders="hull" angularDamping={0.5}>
          <TireStack position={[0, 0, 0]} />
        </RigidBody>
      )}
      <RigidBody type="dynamic" position={[-15, 0, 5]} mass={10} colliders={false} angularDamping={0.5} restitution={0.3}>
        <CuboidCollider args={[0.5, 0.7, 0.5]} position={[0, 0.7, 0]} />
        <TireStack position={[0, 0, 0]} />
      </RigidBody>

      {/* Oil barrels — dynamic physics with cylinder colliders so they roll! */}
      <RigidBody type="dynamic" position={[18, 0, 10]} mass={20} colliders={false} angularDamping={0.3} restitution={0.4}>
        <CylinderCollider args={[0.6, 0.35]} position={[0, 0.6, 0]} />
        <Barrel position={[0, 0, 0]} color="#4A90D9" />
      </RigidBody>
      <RigidBody type="dynamic" position={[18.5, 0, 11]} mass={20} colliders={false} angularDamping={0.3} restitution={0.4}>
        <CylinderCollider args={[0.6, 0.35]} position={[0, 0.6, 0]} />
        <Barrel position={[0, 0, 0]} color="#FF6B4A" />
      </RigidBody>
      {!mobile && (
        <RigidBody type="dynamic" position={[19, 0, 9.5]} mass={20} colliders={false} angularDamping={0.3} restitution={0.4}>
          <CylinderCollider args={[0.6, 0.35]} position={[0, 0.6, 0]} />
          <Barrel position={[0, 0, 0]} color="#4A90D9" />
        </RigidBody>
      )}
      {!mobile && (
        <RigidBody type="dynamic" position={[-18, 0, -15]} mass={20} colliders={false} angularDamping={0.3} restitution={0.4}>
          <CylinderCollider args={[0.6, 0.35]} position={[0, 0.6, 0]} />
          <Barrel position={[0, 0, 0]} color="#FFD700" />
        </RigidBody>
      )}
      {!mobile && (
        <RigidBody type="dynamic" position={[-17, 0, -15.5]} mass={20} colliders={false} angularDamping={0.3} restitution={0.4}>
          <CylinderCollider args={[0.6, 0.35]} position={[0, 0.6, 0]} />
          <Barrel position={[0, 0, 0]} color="#4A90D9" />
        </RigidBody>
      )}

      {/* Toolboxes */}
      <Toolbox position={[12, 0, -8]} />
      {!mobile && <Toolbox position={[-12, 0, 8]} />}

      {/* Flags — festive! */}
      <Flag position={[-30, 0, 28]} color="#FF6B4A" />
      <Flag position={[30, 0, 28]} color="#4ECDC4" />
      {!mobile && <Flag position={[-30, 0, -50]} color="#FFD700" />}
      {!mobile && <Flag position={[30, 0, -50]} color="#C47AFF" />}
      {!mobile && <Flag position={[0, 0, 80]} color="#FF6B6B" />}

      {/* Traffic cones — light and tumble-friendly, cars send them flying! */}
      <RigidBody type="dynamic" position={[-8, 0, 20]} mass={2} colliders={false} angularDamping={0.1} restitution={0.5}>
        <CuboidCollider args={[0.25, 0.35, 0.25]} position={[0, 0.35, 0]} />
        <Cone position={[0, 0, 0]} />
      </RigidBody>
      <RigidBody type="dynamic" position={[8, 0, 20]} mass={2} colliders={false} angularDamping={0.1} restitution={0.5}>
        <CuboidCollider args={[0.25, 0.35, 0.25]} position={[0, 0.35, 0]} />
        <Cone position={[0, 0, 0]} />
      </RigidBody>
      {!mobile && (
        <RigidBody type="dynamic" position={[-8, 0, -45]} mass={2} colliders="hull" angularDamping={0.1}>
          <Cone position={[0, 0, 0]} />
        </RigidBody>
      )}
      {!mobile && (
        <RigidBody type="dynamic" position={[8, 0, -45]} mass={2} colliders="hull" angularDamping={0.1}>
          <Cone position={[0, 0, 0]} />
        </RigidBody>
      )}
      {!mobile && (
        <RigidBody type="dynamic" position={[-3, 0, 25]} mass={2} colliders="hull" angularDamping={0.1}>
          <Cone position={[0, 0, 0]} />
        </RigidBody>
      )}
      {!mobile && (
        <RigidBody type="dynamic" position={[3, 0, 25]} mass={2} colliders="hull" angularDamping={0.1}>
          <Cone position={[0, 0, 0]} />
        </RigidBody>
      )}

      {/* Warning lights on corners */}
      <WarningLight position={[-30, 0, 28]} />
      <WarningLight position={[30, 0, 28]} />

      {/* Road markings — path from conveyor end to parking */}
      <RoadStripes start={[0, 0, 50]} end={[0, 0, 28]} />

      {/* Welcome sign near entrance */}
      <group position={[0, 0, 85]}>
        {/* Sign posts */}
        <mesh position={[-4, 3, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 6, 8]} />
          <meshStandardMaterial color="#FF8C00" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[4, 3, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 6, 8]} />
          <meshStandardMaterial color="#FF8C00" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Sign board */}
        <mesh position={[0, 5.5, 0]} castShadow>
          <boxGeometry args={[10, 3, 0.3]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </mesh>
        {/* Sign border */}
        <mesh position={[0, 5.5, 0.16]}>
          <boxGeometry args={[10.3, 3.3, 0.02]} />
          <meshStandardMaterial color="#FF6B4A" roughness={0.5} />
        </mesh>
      </group>

      {/* Forklift near crates (static prop) */}
      <group position={[-20, 0, -75]}>
        {/* Body */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[1.5, 1.2, 2.5]} />
          <meshStandardMaterial color="#FFD700" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Mast */}
        <mesh position={[0, 2, 1.2]} castShadow>
          <boxGeometry args={[0.2, 2.5, 0.2]} />
          <meshStandardMaterial color="#666666" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.5, 2, 1.2]} castShadow>
          <boxGeometry args={[0.2, 2.5, 0.2]} />
          <meshStandardMaterial color="#666666" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Forks */}
        <mesh position={[-0.3, 0.3, 1.8]} castShadow>
          <boxGeometry args={[0.15, 0.08, 1.2]} />
          <meshStandardMaterial color="#666666" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.3, 0.3, 1.8]} castShadow>
          <boxGeometry args={[0.15, 0.08, 1.2]} />
          <meshStandardMaterial color="#666666" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Wheels */}
        <mesh position={[-0.7, 0.3, -0.8]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 8]} />
          <meshStandardMaterial color="#333333" roughness={0.9} />
        </mesh>
        <mesh position={[0.7, 0.3, -0.8]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 8]} />
          <meshStandardMaterial color="#333333" roughness={0.9} />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 2.2, -0.3]} castShadow>
          <boxGeometry args={[1.6, 0.1, 1.5]} />
          <meshStandardMaterial color="#FFD700" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>
    </group>
  )
}
