'use client'

import { useState, useCallback, useEffect } from 'react'
import FactoryScene from '@/components/factory/FactoryScene'
import type { ProductionJob, CelebrationState, DriveModeState, BuilderPreview } from '@/components/factory/FactoryScene'
import CarBuilder from '@/components/builder/CarBuilder'
import HUD from '@/components/ui/HUD'
import EmailClaimBar from '@/components/ui/EmailClaimBar'
import DriveControls from '@/components/ui/DriveControls'
import MyCarsPanel from '@/components/ui/MyCarsPanel'
import type { Car } from '@/lib/types'

interface FactoryAppProps {
  initialCarCount: number
}

function loadMyCarsFromStorage(): Car[] {
  try {
    const stored = localStorage.getItem('my_cars')
    if (!stored) return []
    // my_cars entries may lack id/created_at — fill with defaults so Car type is satisfied
    const entries = JSON.parse(stored) as Array<Record<string, unknown>>
    return entries.map((e) => ({
      id: String(e.car_number ?? ''),
      car_number: Number(e.car_number ?? 0),
      name: String(e.name ?? ''),
      car_type: (e.car_type ?? 'car1') as Car['car_type'],
      color: String(e.color ?? '#FF6B6B'),
      parked_x: Number(e.parked_x ?? 0),
      parked_z: Number(e.parked_z ?? 0),
      parked_rotation: Number(e.parked_rotation ?? 0),
      created_at: String(e.created_at ?? ''),
    }))
  } catch {
    return []
  }
}

export default function FactoryApp({ initialCarCount }: FactoryAppProps) {
  const [carCount, setCarCount] = useState(initialCarCount)
  const [myCars, setMyCars] = useState<Car[]>([])
  const [flyToTarget, setFlyToTarget] = useState<[number, number, number] | null>(null)
  const [productionJob, setProductionJob] = useState<ProductionJob | null>(null)
  const [celebration, setCelebration] = useState<CelebrationState | null>(null)
  const [driveModeState, setDriveModeState] = useState<DriveModeState | null>(null)
  const [claimBarVisible, setClaimBarVisible] = useState(false)

  // Assembly line builder state — lives here so FactoryScene can see it
  const [showBuilder, setShowBuilder] = useState(false)
  const [builderPreview, setBuilderPreview] = useState<BuilderPreview | null>(null)

  // Load my cars from localStorage on mount
  useEffect(() => {
    setMyCars(loadMyCarsFromStorage())
  }, [])

  // Track whether the EmailClaimBar is showing so we can hide the HUD counter to avoid overlap
  useEffect(() => {
    setClaimBarVisible(!!localStorage.getItem('unclaimed_car'))
    const handler = () => setClaimBarVisible(!!localStorage.getItem('unclaimed_car'))
    window.addEventListener('car-built', handler)
    window.addEventListener('claim-bar-dismissed', handler)
    return () => {
      window.removeEventListener('car-built', handler)
      window.removeEventListener('claim-bar-dismissed', handler)
    }
  }, [])

  const handleFlyTo = useCallback((position: [number, number, number]) => {
    setFlyToTarget(null)
    setTimeout(() => setFlyToTarget(position), 50)
  }, [])

  const handleCarsChanged = useCallback(async () => {
    // Reload my cars from localStorage (new car was just added)
    setMyCars(loadMyCarsFromStorage())

    // Fetch updated total count for HUD (cheap count-only query)
    try {
      const res = await fetch('/api/cars?count=true')
      const data = await res.json()
      if (typeof data.count === 'number') setCarCount(data.count)
    } catch {
      // Will refresh on next load
    }
  }, [])

  const handleStartProduction = useCallback((job: ProductionJob) => {
    setProductionJob(job)
    // Remove the builder car from the 3D scene — ProductionCar takes over
    setBuilderPreview(null)
    setCelebration(null)
    setDriveModeState(null)
  }, [])

  const handleProductionComplete = useCallback(() => {
    setProductionJob(null)
    handleCarsChanged()
  }, [handleCarsChanged])

  const handleCelebrate = useCallback((state: CelebrationState) => {
    setCelebration(state)
    // Auto-dismiss celebration after 15 seconds
    setTimeout(() => setCelebration(prev => prev?.carNumber === state.carNumber ? null : prev), 15000)
  }, [])

  const handleStartDrive = useCallback(() => {
    if (!celebration) return
    setDriveModeState({
      carType: celebration.carType,
      color: celebration.color,
      startPosition: celebration.position,
      carNumber: celebration.carNumber,
    })
    setCelebration(null)
  }, [celebration])

  const handleExitDrive = useCallback(() => {
    setDriveModeState(null)
  }, [])

  const handleSwitchDrive = useCallback((state: DriveModeState) => {
    setDriveModeState(null)
    // Small timeout so DriveMode unmounts + remounts fresh with new car
    setTimeout(() => setDriveModeState(state), 50)
  }, [])

  // Open the assembly line builder — camera flies to CHASSIS station
  const handleBuildCar = useCallback(() => {
    setShowBuilder(true)
    setBuilderPreview({ step: 'chassis', carType: null, color: null })
  }, [])

  // Called by CarBuilder on every step/selection change — drives 3D preview
  const handleBuilderStateChange = useCallback((preview: BuilderPreview) => {
    setBuilderPreview(preview)
  }, [])

  // Called by CarBuilder when closed (user exits or build completes after 11s)
  const handleCloseBuilder = useCallback(() => {
    setShowBuilder(false)
    setBuilderPreview(null)
  }, [])

  const isDriving = !!driveModeState

  return (
    <>
      <FactoryScene
        cars={myCars}
        totalCarCount={carCount}
        flyToTarget={flyToTarget}
        productionJob={productionJob}
        onProductionComplete={handleProductionComplete}
        celebration={celebration}
        onStartDrive={celebration ? handleStartDrive : undefined}
        driveModeState={driveModeState}
        onExitDrive={handleExitDrive}
        builderPreview={builderPreview}
      />

      {/* Assembly line builder panel — shown above the 3D canvas */}
      {showBuilder && !isDriving && !productionJob && (
        <CarBuilder
          onClose={handleCloseBuilder}
          onStartProduction={handleStartProduction}
          onCarsChanged={handleCarsChanged}
          onCelebrate={handleCelebrate}
          onStateChange={handleBuilderStateChange}
        />
      )}

      {!isDriving && (
        <HUD
          carCount={carCount}
          onFlyTo={handleFlyTo}
          onBuildCar={handleBuildCar}
          hideCounter={claimBarVisible}
        />
      )}
      {isDriving && <DriveControls onExit={handleExitDrive} />}
      {!isDriving && <EmailClaimBar />}
      {!productionJob && (
        <MyCarsPanel
          onFlyTo={handleFlyTo}
          isDriving={isDriving}
          onSwitchDrive={handleSwitchDrive}
        />
      )}
    </>
  )
}
