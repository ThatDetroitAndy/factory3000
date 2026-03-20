'use client'

import { useState, useCallback, useEffect } from 'react'
import FactoryScene from '@/components/factory/FactoryScene'
import type { ProductionJob, CelebrationState, DriveModeState } from '@/components/factory/FactoryScene'
import HUD from '@/components/ui/HUD'
import EmailClaimBar from '@/components/ui/EmailClaimBar'
import DriveControls from '@/components/ui/DriveControls'
import type { Car } from '@/lib/types'

interface FactoryAppProps {
  initialCars: Car[]
}

export default function FactoryApp({ initialCars }: FactoryAppProps) {
  const [cars, setCars] = useState<Car[]>(initialCars)
  const [flyToTarget, setFlyToTarget] = useState<[number, number, number] | null>(null)
  const [productionJob, setProductionJob] = useState<ProductionJob | null>(null)
  const [celebration, setCelebration] = useState<CelebrationState | null>(null)
  const [driveModeState, setDriveModeState] = useState<DriveModeState | null>(null)
  const [claimBarVisible, setClaimBarVisible] = useState(false)

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
    try {
      const res = await fetch('/api/cars')
      const data = await res.json()
      if (data.cars) setCars(data.cars)
    } catch {
      // Will refresh on next load
    }
  }, [])

  const handleStartProduction = useCallback((job: ProductionJob) => {
    setProductionJob(job)
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
    })
    setCelebration(null)
  }, [celebration])

  const handleExitDrive = useCallback(() => {
    setDriveModeState(null)
  }, [])

  const isDriving = !!driveModeState

  return (
    <>
      <FactoryScene
        cars={cars}
        flyToTarget={flyToTarget}
        productionJob={productionJob}
        onProductionComplete={handleProductionComplete}
        celebration={celebration}
        onStartDrive={celebration ? handleStartDrive : undefined}
        driveModeState={driveModeState}
        onExitDrive={handleExitDrive}
      />
      {!isDriving && (
        <HUD
          carCount={cars.length}
          onFlyTo={handleFlyTo}
          onCarsChanged={handleCarsChanged}
          onStartProduction={handleStartProduction}
          onCelebrate={handleCelebrate}
          hideCounter={claimBarVisible}
        />
      )}
      {isDriving && <DriveControls onExit={handleExitDrive} />}
      {!isDriving && <EmailClaimBar />}
    </>
  )
}
