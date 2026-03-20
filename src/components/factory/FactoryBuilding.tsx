'use client'

/**
 * The main factory building — open-air warehouse structure
 * with walls, a visible roof, overhead lights, pipes, and industrial character.
 */
export default function FactoryBuilding() {
  const W = 60 // width
  const D = 80 // depth
  const H = 18 // wall height
  const WALL_THICK = 1

  return (
    <group position={[0, 0, -25]}>
      {/* Foundation / raised platform */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[W + 4, 0.3, D + 4]} />
        <meshStandardMaterial color="#B8A88A" roughness={0.95} />
      </mesh>

      {/* Factory floor — polished concrete */}
      <mesh position={[0, 0.31, 0]} receiveShadow>
        <boxGeometry args={[W, 0.02, D]} />
        <meshStandardMaterial color="#C8BAA0" roughness={0.85} />
      </mesh>

      {/* Back wall — solid with large sign area */}
      <mesh position={[0, H / 2, -D / 2]} castShadow>
        <boxGeometry args={[W, H, WALL_THICK]} />
        <meshStandardMaterial color="#8B3A3A" roughness={0.85} />
      </mesh>
      {/* Back wall accent stripe */}
      <mesh position={[0, H - 1, -D / 2 + 0.55]}>
        <boxGeometry args={[W, 2, 0.1]} />
        <meshStandardMaterial color="#FF6B4A" roughness={0.5} />
      </mesh>

      {/* Left wall — with window cutouts (just upper half) */}
      <mesh position={[-W / 2, H / 4, 0]} castShadow>
        <boxGeometry args={[WALL_THICK, H / 2, D]} />
        <meshStandardMaterial color="#8B3A3A" roughness={0.85} />
      </mesh>
      {/* Left wall upper — with gaps for "windows" */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`lw-${i}`}>
          <mesh position={[-W / 2, H * 0.65, -D / 2 + (i + 0.5) * (D / 6)]} castShadow>
            <boxGeometry args={[WALL_THICK, H * 0.2, D / 6 - 3]} />
            <meshStandardMaterial color="#8B3A3A" roughness={0.85} />
          </mesh>
          {/* Window pane */}
          <mesh position={[-W / 2 + 0.1, H * 0.65, -D / 2 + (i + 0.5) * (D / 6)]}>
            <planeGeometry args={[0.1, H * 0.2 - 0.5]} />
            <meshStandardMaterial color="#87CEEB" opacity={0.4} transparent />
          </mesh>
        </group>
      ))}

      {/* Right wall — matching left */}
      <mesh position={[W / 2, H / 4, 0]} castShadow>
        <boxGeometry args={[WALL_THICK, H / 2, D]} />
        <meshStandardMaterial color="#8B3A3A" roughness={0.85} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`rw-${i}`} position={[W / 2, H * 0.65, -D / 2 + (i + 0.5) * (D / 6)]} castShadow>
          <boxGeometry args={[WALL_THICK, H * 0.2, D / 6 - 3]} />
          <meshStandardMaterial color="#8B3A3A" roughness={0.85} />
        </mesh>
      ))}

      {/* Front — open (no wall, just entrance pillars) */}
      <mesh position={[-W / 2 + 2, H / 2, D / 2]} castShadow>
        <boxGeometry args={[3, H, WALL_THICK]} />
        <meshStandardMaterial color="#8B3A3A" roughness={0.85} />
      </mesh>
      <mesh position={[W / 2 - 2, H / 2, D / 2]} castShadow>
        <boxGeometry args={[3, H, WALL_THICK]} />
        <meshStandardMaterial color="#8B3A3A" roughness={0.85} />
      </mesh>
      {/* Entrance beam */}
      <mesh position={[0, H - 0.5, D / 2]} castShadow>
        <boxGeometry args={[W - 2, 1.5, WALL_THICK + 0.5]} />
        <meshStandardMaterial color="#FF8C00" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Roof trusses — A-frame style */}
      {Array.from({ length: 7 }).map((_, i) => {
        const z = -D / 2 + 5 + i * (D / 7)
        return (
          <group key={`truss-${i}`}>
            {/* Main beam */}
            <mesh position={[0, H + 1, z]} castShadow>
              <boxGeometry args={[W + 2, 1.2, 1.2]} />
              <meshStandardMaterial color="#4A90D9" roughness={0.3} metalness={0.4} />
            </mesh>
            {/* Peak */}
            <mesh position={[0, H + 3, z]} castShadow>
              <boxGeometry args={[W * 0.6, 0.8, 0.8]} />
              <meshStandardMaterial color="#4A90D9" roughness={0.3} metalness={0.4} />
            </mesh>
            {/* Left diagonal */}
            <mesh position={[-W * 0.2, H + 2, z]} rotation={[0, 0, 0.3]} castShadow>
              <boxGeometry args={[W * 0.35, 0.6, 0.6]} />
              <meshStandardMaterial color="#4A90D9" roughness={0.3} metalness={0.4} />
            </mesh>
            {/* Right diagonal */}
            <mesh position={[W * 0.2, H + 2, z]} rotation={[0, 0, -0.3]} castShadow>
              <boxGeometry args={[W * 0.35, 0.6, 0.6]} />
              <meshStandardMaterial color="#4A90D9" roughness={0.3} metalness={0.4} />
            </mesh>
          </group>
        )
      })}

      {/* Roof panels — corrugated look */}
      <mesh position={[-W * 0.15, H + 2.5, 0]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[W * 0.55, 0.15, D + 1]} />
        <meshStandardMaterial color="#8899AA" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[W * 0.15, H + 2.5, 0]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[W * 0.55, 0.15, D + 1]} />
        <meshStandardMaterial color="#8899AA" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Columns — structural, colorful */}
      {[-1, 1].map((side) =>
        Array.from({ length: 7 }).map((_, i) => (
          <mesh
            key={`col-${side}-${i}`}
            position={[side * (W / 2 - 1.5), H / 2, -D / 2 + 5 + i * (D / 7)]}
            castShadow
          >
            <boxGeometry args={[1.5, H, 1.5]} />
            <meshStandardMaterial color="#FF8C00" roughness={0.4} metalness={0.3} />
          </mesh>
        ))
      )}

      {/* Overhead lights — hanging from trusses */}
      {Array.from({ length: 7 }).map((_, i) => {
        const z = -D / 2 + 5 + i * (D / 7)
        return (
          <group key={`light-${i}`}>
            {[-12, 0, 12].map((x) => (
              <group key={`l-${x}`} position={[x, H, z]}>
                {/* Wire */}
                <mesh position={[0, -0.5, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, 1, 4]} />
                  <meshStandardMaterial color="#444444" />
                </mesh>
                {/* Lamp shade */}
                <mesh position={[0, -1.2, 0]}>
                  <coneGeometry args={[0.8, 0.5, 8, 1, true]} />
                  <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.3} side={2} />
                </mesh>
                {/* Bulb glow */}
                <mesh position={[0, -1.1, 0]}>
                  <sphereGeometry args={[0.2, 8, 8]} />
                  <meshStandardMaterial
                    color="#FFFFEE"
                    emissive="#FFEEAA"
                    emissiveIntensity={1}
                  />
                </mesh>
              </group>
            ))}
          </group>
        )
      })}

      {/* Pipes along walls */}
      <mesh position={[-W / 2 + 1.5, H * 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, D - 2, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Pipe on right wall */}
      <mesh position={[W / 2 - 1.5, H * 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, D - 2, 8]} />
        <meshStandardMaterial color="#CC3333" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Floor markings — safety zones */}
      {/* Yellow safety line around conveyor */}
      <mesh position={[-4, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, D - 10]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <mesh position={[4, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, D - 10]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Hazard stripes at entrance */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`hazard-${i}`} position={[-W / 2 + 5 + i * (W - 10) / 10, 0.32, D / 2 - 1]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
          <planeGeometry args={[0.5, 2]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#FFD700' : '#222222'} />
        </mesh>
      ))}
    </group>
  )
}
