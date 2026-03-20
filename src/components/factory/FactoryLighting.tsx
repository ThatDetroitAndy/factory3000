'use client'

export default function FactoryLighting() {
  return (
    <>
      {/* Bright warm ambient — toylike, no harsh dark areas */}
      <ambientLight intensity={1.0} color="#FFF5E6" />

      {/* Main sun — warm golden hour, strong shadows */}
      <directionalLight
        position={[60, 80, 40]}
        intensity={2.5}
        color="#FFD080"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={400}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />

      {/* Soft fill from sky — blue bounce light */}
      <directionalLight
        position={[-30, 40, -30]}
        intensity={0.8}
        color="#B0D8FF"
      />

      {/* Low front rim light — adds depth to cars */}
      <directionalLight
        position={[0, 5, 60]}
        intensity={0.4}
        color="#FFEECC"
      />

      {/* Sky hemisphere — warm ground, cool sky */}
      <hemisphereLight args={['#87CEEB', '#F0A060', 0.7]} />
    </>
  )
}
