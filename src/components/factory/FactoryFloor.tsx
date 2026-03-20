'use client'

/**
 * Just the ground planes — the factory building structure
 * is now handled by FactoryBuilding.tsx
 */
export default function FactoryFloor() {
  return (
    <group>
      {/* Main ground — warm terracotta/sand, huge so edges never visible */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.1, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#D4A574" roughness={1} metalness={0} />
      </mesh>

      {/* Grass patches — scattered around the factory */}
      {[
        [-80, 0, -40, 40, 30],
        [80, 0, 20, 35, 40],
        [-60, 0, 70, 50, 35],
        [60, 0, 80, 45, 30],
        [-90, 0, -90, 60, 50],
        [90, 0, -80, 40, 45],
        [0, 0, 110, 70, 30],
      ].map(([x, , z, w, d], i) => (
        <mesh key={`grass-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.05, z]} receiveShadow>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color="#7CB342" roughness={1} />
        </mesh>
      ))}

      {/* Dirt road leading to factory entrance */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 60]} receiveShadow>
        <planeGeometry args={[12, 80]} />
        <meshStandardMaterial color="#B8976A" roughness={0.95} />
      </mesh>
      {/* Road edge lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6.2, -0.03, 60]}>
        <planeGeometry args={[0.3, 80]} />
        <meshStandardMaterial color="white" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.2, -0.03, 60]}>
        <planeGeometry args={[0.3, 80]} />
        <meshStandardMaterial color="white" roughness={0.8} />
      </mesh>
    </group>
  )
}
