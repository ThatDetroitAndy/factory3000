'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import type { Car, CarType } from '@/lib/types'
import { isMobileDevice } from '@/lib/isMobile'
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
import DriveMode from './DriveMode'
import AssemblyLineCar from './AssemblyLineCar'

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

export interface DriveModeState {
  carType: CarType
  color: string
  startPosition: [number, number, number]
}

export interface AssemblyModeState {
  station: 'chassis' | 'paint' | 'name'
  carType: CarType | null
  color: string | null
}

interface FactorySceneProps {
  cars: Car[]
  totalCarCount: number
  flyToTarget?: [number, number, number] | null
  productionJob?: ProductionJob | null
  onProductionComplete?: () => void
  celebration?: CelebrationState | null
  onStartDrive?: () => void
  driveModeState?: DriveModeState | null
  onExitDrive?: () => void
  assemblyMode?: AssemblyModeState | null
}

export default function FactoryScene({
  cars,
  totalCarCount,
  flyToTarget,
  productionJob,
  onProductionComplete,
  celebration,
  onStartDrive,
  driveModeState,
  onExitDrive,
  assemblyMode,
}: FactorySceneProps) {
  const isDriving = !!driveModeState
  const isAssembly = !!assemblyMode
  const mobile = isMobileDevice()

  return (
    <div className="w-full h-full" style={{ touchAction: 'none' }}>
      <Canvas
        shadows={mobile ? false : true}
        dpr={[1, 1.5]}
        camera={{ position: [80, 80, 80], fov: 50, near: 0.1, far: 2000 }}
        gl={{ antialias: !mobile, toneMapping: 4 /* ACESFilmic */ }}
      >
        <color attach="background" args={['#87CEEB']} />
        <fog attach="fog" args={['#C8E8F8', 200, 800]} />

        <Suspense fallback={null}>
          <Environment preset="sunset" environmentIntensity={0.4} />

          <FactoryLighting />
          <FactoryFloor />
          <FactoryBuilding />
          <ConveyorBelt />
          <CrateWarehouse builtCount={totalCarCount} />
          <ParkingLot cars={cars} />
          <FactoryProps />

          {assemblyMode && !productionJob && (
            <AssemblyLineCar
              station={assemblyMode.station}
              carType={assemblyMode.carType}
              color={assemblyMode.color}
            />
          )}

          {productionJob && (
            <ProductionCar
              carType={productionJob.carType}
              color={productionJob.color}
              onComplete={() => onProductionComplete?.()}
            />
          )}

          {celebration && !isDriving && (
            <CelebrationOverlay
              name={celebration.name}
              carNumber={celebration.carNumber}
              position={celebration.position}
              onStartDrive={onStartDrive}
            />
          )}

          {isDriving && driveModeState && (
            <DriveMode
              carType={driveModeState.carType}
              color={driveModeState.color}
              startPosition={driveModeState.startPosition}
              onExit={() => onExitDrive?.()}
            />
          )}
        </Suspense>

        <CameraControls
          flyToTarget={flyToTarget}
          isProducing={!!productionJob}
          driveMode={isDriving}
          isAssembly={isAssembly}
        />
      </Canvas>
    </div>
  )
}
