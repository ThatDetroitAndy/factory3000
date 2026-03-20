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
import CelebrationOverlay from './CelebrationOverlay'

export interface ProductionJob {
  carType: CarType
  color: string
}

export interface CelebrationState {
  name: string
  carNumber: number
  carType: CarType
  color: string
  position: [number, number, number]
}

interface FactorySceneProps {
  cars: Car[]
  flyToTarget?: [number, number, number] | null
  productionJob?: ProductionJob | null
  onProductionComplete?: () => void
  celebration?: CelebrationState | null
}

export default function FactoryScene({
  cars,
  flyToTarget,
  productionJob,
  onProductionComplete,
  celebration,
}: FactorySceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [80, 80, 80], fov: 50, near: 0.1, far: 2000 }}
        gl={{ antialias: true, toneMapping: 3 }}
      >
        <color attach="background" args={['#87CEEB']} />

        <Suspense fallback={null}>
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

          {celebration && (
            <CelebrationOverlay
              name={celebration.name}
              carNumber={celebration.carNumber}
              position={celebration.position}
            />
          )}
        </Suspense>

        <CameraControls flyToTarget={flyToTarget} isProducing={!!productionJob} />
      </Canvas>
    </div>
  )
}
