'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Link from 'next/link'
import type { Car } from '@/lib/types'
import { CAR_TYPE_LABELS } from '@/lib/types'
import CarModel from '@/components/factory/CarModel'

interface CarPageClientProps {
  car: Car
}

function RotatingCar({ car }: { car: Car }) {
  return (
    <group>
      <CarModel carType={car.car_type} color={car.color} scale={1.5} />
      {/* Pedestal */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3.2, 0.2, 32]} />
        <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  )
}

export default function CarPageClient({ car }: CarPageClientProps) {
  const createdDate = new Date(car.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* 3D Preview */}
      <div className="h-[50vh] w-full">
        <Canvas camera={{ position: [5, 4, 8], fov: 40 }}>
          <color attach="background" args={['#111111']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <directionalLight position={[-3, 5, -3]} intensity={0.3} color="#ffd4a0" />
          <Suspense fallback={null}>
            <RotatingCar car={car} />
          </Suspense>
          <OrbitControls
            autoRotate
            autoRotateSpeed={2}
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Car info */}
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="w-5 h-5 rounded-full border-2 border-white/20"
            style={{ backgroundColor: car.color }}
          />
          <span className="text-white/40 text-sm">{CAR_TYPE_LABELS[car.car_type]}</span>
        </div>

        <h1 className="text-4xl font-black mb-1">{car.name}</h1>
        <p className="text-white/40 text-lg mb-6">Car #{car.car_number}</p>

        <p className="text-white/50 text-sm mb-8">Built on {createdDate}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/?flyTo=${car.car_number}`}
            className="flex-1 text-center py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-lg transition-colors"
          >
            Visit in Factory
          </Link>
          <Link
            href="/"
            className="flex-1 text-center py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors"
          >
            Explore Factory
          </Link>
        </div>
      </div>
    </div>
  )
}
