'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import type { Car, CarType } from '@/lib/types'
import FactoryFloor from './FactoryFloor'
import FactoryLighting from './FactoryLighting'
import ParkingLot from './ParkingLot'
import CrateWarehouse from './CrateWarehouse'
import ConveyorBelt from './ConveyorBelt'
import CameraControls from './CameraControls'
import ProductionCar from './ProductionCar'
import FactoryProps from './FactoryProps'
import FactoryBuilding from './FactoryBuilding'

export interface ProductionJob {
  carType: CarType
  color: string
}

interface FactorySceneProps {
  cars: Car[]
  flyToTarget?: [number, number, number] | null
  productionJob?: ProductionJob | null
  onProductionComplete?: () => void
}

export default function FactoryScene({
  cars,
  flyToTarget,
  productionJob,
  onProductionComplete,
}: FactorySceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [80, 80, 80], fov: 50, near: 0.1, far: 2000 }}
        gl={{ antialias: true, toneMapping: 3 }} // ACESFilmicToneMapping
      >
        {/* Warm sky gradient background */}
        <color attach="background" args={['#87CEEB']} />

        <Suspense fallback={null}>
          {/* Environment map for nice reflections */}
          <Environment preset="sunset" environmentIntensity={0.4} />

          <FactoryLighting />
          <FactoryFloor />
          <FactoryBuilding />
          <ConveyorBelt />
          <CrateWarehouse builtCount={cars.length} />
          <ParkingLot cars={cars} />
          <FactoryProps />

          {productionJob && (
            <ProductionCar
              carType={productionJob.carType}
              color={productionJob.color}
              onComplete={() => onProductionComplete?.()}
            />
          )}
        </Suspense>

        <CameraControls flyToTarget={flyToTarget} isProducing={!!productionJob} />
      </Canvas>
    </div>
  )
}
