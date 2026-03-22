'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
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
import BuilderCar from './BuilderCar'

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
  carNumber?: number | null
}

/** Live state of the assembly line builder — drives the 3D car preview */
export interface BuilderPreview {
  step: 'chassis' | 'paint' | 'name'
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
  /** When set, shows a car on the belt at the current builder station */
  builderPreview?: BuilderPreview | null
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
  builderPreview,
}: FactorySceneProps) {
  const isDriving = !!driveModeState
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
          {/* gravity=-20 feels weighty but toylike — faster than real world, satisfying landings */}
          <Physics gravity={[0, -20, 0]} timeStep="vary">
            <Environment preset="sunset" environmentIntensity={0.4} />

            <FactoryLighting />
            <FactoryFloor />
            <FactoryBuilding />
            <ConveyorBelt
              isProducing={!!productionJob}
              activeStation={productionJob ? null : (builderPreview?.step ?? null)}
            />
            <CrateWarehouse builtCount={totalCarCount} />
            <ParkingLot cars={cars} drivenCarNumber={driveModeState?.carNumber ?? null} />
            <FactoryProps />

            {/* Builder mode: live car preview on the conveyor belt */}
            {builderPreview && !productionJob && (
              <BuilderCar
                step={builderPreview.step}
                carType={builderPreview.carType}
                color={builderPreview.color}
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
                carType={celebration.carType}
                color={celebration.color}
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
          </Physics>
        </Suspense>

        <CameraControls
          flyToTarget={flyToTarget}
          isProducing={!!productionJob}
          driveMode={isDriving}
          builderStep={builderPreview?.step ?? null}
          isCelebrating={!!celebration && !isDriving}
        />
      </Canvas>
    </div>
  )
}
