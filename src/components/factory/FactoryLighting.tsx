'use client'

export default function FactoryLighting() {
  return (
    <>
      {/* Bright warm ambient — toylike, no dark areas */}
      <ambientLight intensity={0.8} color="#FFF5E6" />

      {/* Main sun — warm, strong shadows */}
      <directionalLight
        position={[40, 60, 30]}
        intensity={2}
        color="#FFDDAA"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.001}
      />

      {/* Fill light from opposite side — blue-ish sky bounce */}
      <directionalLight
        position={[-20, 30, -20]}
        intensity={0.6}
        color="#AAD4FF"
      />

      {/* Sky hemisphere — blue sky + warm ground bounce */}
      <hemisphereLight
        args={['#87CEEB', '#E8A87C', 0.5]}
      />
    </>
  )
}
