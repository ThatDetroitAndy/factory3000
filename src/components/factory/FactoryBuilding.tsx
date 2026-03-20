'use client'

/**
 * Factory building modeled after Andy's real factory at
 * 5938 Linsdale, Detroit MI 48204.
 *
 * Key features from photos:
 * - Red/dark brick, two-story front with decorative brickwork
 * - Long single-story warehouse wing behind
 * - Flat grey roof
 * - Big red rolling doors on front
 * - Metal/corrugated section on back
 * - Corner lot with grass
 */
export default function FactoryBuilding() {
  return (
    <group position={[0, 0, -25]}>
      {/* ============================================ */}
      {/*  FOUNDATION                                  */}
      {/* ============================================ */}
      <mesh position={[0, 0.15, -5]} receiveShadow castShadow>
        <boxGeometry args={[65, 0.3, 90]} />
        <meshStandardMaterial color="#999999" roughness={0.95} />
      </mesh>

      {/* Factory floor — concrete */}
      <mesh position={[0, 0.31, -5]} receiveShadow>
        <boxGeometry args={[63, 0.02, 88]} />
        <meshStandardMaterial color="#C0B8A0" roughness={0.85} />
      </mesh>

      {/* ============================================ */}
      {/*  FRONT FACE — two story, red brick           */}
      {/* ============================================ */}
      {/* Main front wall — dark red brick */}
      <mesh position={[0, 10, 38]} castShadow>
        <boxGeometry args={[63, 20, 1.5]} />
        <meshStandardMaterial color="#7A2E2E" roughness={0.9} />
      </mesh>
      {/* Lighter brick upper band */}
      <mesh position={[0, 17, 38.8]}>
        <boxGeometry args={[63, 3, 0.2]} />
        <meshStandardMaterial color="#9B5B5B" roughness={0.85} />
      </mesh>
      {/* Decorative cornice at very top */}
      <mesh position={[0, 19.5, 38.5]} castShadow>
        <boxGeometry args={[65, 1.5, 2.5]} />
        <meshStandardMaterial color="#6B2424" roughness={0.85} />
      </mesh>
      {/* Ornamental top edge — stepped brick pattern */}
      <mesh position={[0, 20.5, 38.5]} castShadow>
        <boxGeometry args={[63, 0.5, 2]} />
        <meshStandardMaterial color="#5A1E1E" roughness={0.9} />
      </mesh>

      {/* Front windows — upper floor */}
      {[-18, -6, 6, 18].map((x, i) => (
        <group key={`fw-${i}`}>
          {/* Window frame */}
          <mesh position={[x, 14, 38.85]}>
            <boxGeometry args={[5, 4, 0.3]} />
            <meshStandardMaterial color="#4A1818" roughness={0.9} />
          </mesh>
          {/* Glass */}
          <mesh position={[x, 14, 39.05]}>
            <planeGeometry args={[4.2, 3.2]} />
            <meshStandardMaterial color="#6B8FA8" roughness={0.1} metalness={0.1} opacity={0.7} transparent />
          </mesh>
        </group>
      ))}

      {/* Big red rolling doors — main entrance */}
      {[-14, 0, 14].map((x, i) => (
        <group key={`door-${i}`}>
          <mesh position={[x, 4.5, 38.9]} castShadow>
            <boxGeometry args={[8, 9, 0.3]} />
            <meshStandardMaterial color="#AA2222" roughness={0.7} metalness={0.2} />
          </mesh>
          {/* Door horizontal lines (rolling door ribs) */}
          {Array.from({ length: 6 }).map((_, j) => (
            <mesh key={j} position={[x, 1.5 + j * 1.5, 39.1]}>
              <boxGeometry args={[7.5, 0.08, 0.05]} />
              <meshStandardMaterial color="#881818" roughness={0.7} />
            </mesh>
          ))}
          {/* Door handle */}
          <mesh position={[x + 3, 4, 39.15]}>
            <boxGeometry args={[0.15, 0.8, 0.15]} />
            <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Sign area above doors */}
      <mesh position={[0, 9.5, 39]}>
        <boxGeometry args={[30, 2, 0.1]} />
        <meshStandardMaterial color="#F0E8D8" roughness={0.7} />
      </mesh>

      {/* ============================================ */}
      {/*  WAREHOUSE WING — single story, long         */}
      {/* ============================================ */}
      {/* Left wall */}
      <mesh position={[-31.5, 6, -5]} castShadow>
        <boxGeometry args={[1.5, 12, 85]} />
        <meshStandardMaterial color="#8B3A3A" roughness={0.9} />
      </mesh>
      {/* Right wall */}
      <mesh position={[31.5, 6, -5]} castShadow>
        <boxGeometry args={[1.5, 12, 85]} />
        <meshStandardMaterial color="#8B3A3A" roughness={0.9} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 6, -48]} castShadow>
        <boxGeometry args={[63, 12, 1.5]} />
        <meshStandardMaterial color="#8B3A3A" roughness={0.9} />
      </mesh>

      {/* Metal/corrugated section on back — from photos */}
      <mesh position={[0, 5, -48.8]}>
        <boxGeometry args={[40, 10, 0.3]} />
        <meshStandardMaterial color="#AABBCC" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Corrugation lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`corr-${i}`} position={[-19 + i * 2, 5, -49]}>
          <boxGeometry args={[0.08, 10, 0.1]} />
          <meshStandardMaterial color="#99AABB" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* Side wall windows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`sw-${i}`}>
          {/* Left side windows */}
          <mesh position={[-31.9, 8, -35 + i * 12]}>
            <planeGeometry args={[0.1, 3]} />
            <meshStandardMaterial color="#6B8FA8" opacity={0.5} transparent />
          </mesh>
          {/* Right side windows */}
          <mesh position={[31.9, 8, -35 + i * 12]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.1, 3]} />
            <meshStandardMaterial color="#6B8FA8" opacity={0.5} transparent />
          </mesh>
        </group>
      ))}

      {/* ============================================ */}
      {/*  ROOF — flat, grey, industrial               */}
      {/* ============================================ */}
      <mesh position={[0, 12, -5]} castShadow>
        <boxGeometry args={[65, 0.5, 88]} />
        <meshStandardMaterial color="#8899AA" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Roof edge trim */}
      <mesh position={[0, 12.3, -5]}>
        <boxGeometry args={[66, 0.3, 89]} />
        <meshStandardMaterial color="#6B2424" roughness={0.8} />
      </mesh>

      {/* Roof vents / skylights */}
      {[-15, 0, 15].map((x) =>
        [-20, -5, 10].map((z, j) => (
          <mesh key={`vent-${x}-${j}`} position={[x, 13, z]} castShadow>
            <boxGeometry args={[3, 1.5, 3]} />
            <meshStandardMaterial color="#778899" metalness={0.5} roughness={0.4} />
          </mesh>
        ))
      )}

      {/* ============================================ */}
      {/*  INTERIOR — trusses, lights, pipes           */}
      {/* ============================================ */}
      {/* Steel trusses */}
      {Array.from({ length: 8 }).map((_, i) => {
        const z = -42 + i * 11
        return (
          <group key={`truss-${i}`}>
            <mesh position={[0, 11, z]} castShadow>
              <boxGeometry args={[60, 0.8, 0.8]} />
              <meshStandardMaterial color="#4A90D9" roughness={0.3} metalness={0.5} />
            </mesh>
            {/* Cross braces */}
            <mesh position={[-15, 10, z]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[12, 0.4, 0.4]} />
              <meshStandardMaterial color="#4A90D9" roughness={0.3} metalness={0.5} />
            </mesh>
            <mesh position={[15, 10, z]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[12, 0.4, 0.4]} />
              <meshStandardMaterial color="#4A90D9" roughness={0.3} metalness={0.5} />
            </mesh>
          </group>
        )
      })}

      {/* Hanging industrial lights */}
      {Array.from({ length: 8 }).map((_, i) => {
        const z = -42 + i * 11
        return [-15, 0, 15].map((x) => (
          <group key={`light-${i}-${x}`} position={[x, 11, z]}>
            <mesh position={[0, -0.8, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 1.5, 4]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
            <mesh position={[0, -1.8, 0]}>
              <coneGeometry args={[0.7, 0.4, 8, 1, true]} />
              <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.3} side={2} />
            </mesh>
            <mesh position={[0, -1.6, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color="#FFFFEE" emissive="#FFEEAA" emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))
      })}

      {/* Pipes along left wall */}
      <mesh position={[-29, 9, -5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 80, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-29, 7, -5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 80, 8]} />
        <meshStandardMaterial color="#CC3333" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Pipes along right wall */}
      <mesh position={[29, 10, -5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 80, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* ============================================ */}
      {/*  FLOOR MARKINGS                              */}
      {/* ============================================ */}
      {/* Yellow safety lines along conveyor */}
      <mesh position={[-5, 0.32, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, 75]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <mesh position={[5, 0.32, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, 75]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Hazard stripes at entrance */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`hazard-${i}`} position={[-28 + i * 3, 0.32, 37]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
          <planeGeometry args={[0.6, 2.5]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#FFD700' : '#222222'} />
        </mesh>
      ))}

      {/* ============================================ */}
      {/*  EXTERIOR DETAILS                            */}
      {/* ============================================ */}
      {/* Blue dumpsters (from photos!) */}
      <mesh position={[-20, 1, 42]} castShadow>
        <boxGeometry args={[3, 2, 2]} />
        <meshStandardMaterial color="#2255AA" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[-16, 1, 42]} castShadow>
        <boxGeometry args={[3, 2, 2]} />
        <meshStandardMaterial color="#2255AA" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Fire hydrant on the corner */}
      <group position={[35, 0, 42]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 1, 8]} />
          <meshStandardMaterial color="#CC2222" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.2, 0.3, 8]} />
          <meshStandardMaterial color="#CC2222" roughness={0.6} />
        </mesh>
        {/* Nozzles */}
        <mesh position={[-0.25, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 6]} />
          <meshStandardMaterial color="#CC2222" roughness={0.6} />
        </mesh>
        <mesh position={[0.25, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 6]} />
          <meshStandardMaterial color="#CC2222" roughness={0.6} />
        </mesh>
      </group>

      {/* Boulders near entrance (from photos) */}
      <mesh position={[-25, 0.4, 40]} castShadow>
        <sphereGeometry args={[0.6, 6, 5]} />
        <meshStandardMaterial color="#AAAAAA" roughness={0.95} />
      </mesh>
      <mesh position={[-22, 0.3, 41]} castShadow>
        <sphereGeometry args={[0.45, 6, 5]} />
        <meshStandardMaterial color="#999999" roughness={0.95} />
      </mesh>

      {/* Utility poles */}
      {[[-35, 0, 42], [35, 0, -50]].map(([x, , z], i) => (
        <group key={`pole-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 6, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 12, 6]} />
            <meshStandardMaterial color="#8B6914" roughness={0.9} />
          </mesh>
          {/* Crossbar */}
          <mesh position={[0, 11.5, 0]} castShadow>
            <boxGeometry args={[3, 0.15, 0.15]} />
            <meshStandardMaterial color="#8B6914" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
