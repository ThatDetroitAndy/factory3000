'use client'

import { useState, useCallback } from 'react'
import FactoryScene from '@/components/factory/FactoryScene'
import type { ProductionJob } from '@/components/factory/FactoryScene'
import HUD from '@/components/ui/HUD'
import EmailClaimBar from '@/components/ui/EmailClaimBar'
import type { Car } from '@/lib/types'

interface FactoryAppProps {
  initialCars: Car[]
}

export default function FactoryApp({ initialCars }: FactoryAppProps) {
  const [cars, setCars] = useState<Car[]>(initialCars)
  const [flyToTarget, setFlyToTarget] = useState<[number, number, number] | null>(null)
  const [productionJob, setProductionJob] = useState<ProductionJob | null>(null)

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
    // Fly camera to follow the conveyor belt
    handleFlyTo([0, 10, -40])
  }, [handleFlyTo])

  const handleProductionComplete = useCallback(() => {
    setProductionJob(null)
    handleCarsChanged()
  }, [handleCarsChanged])

  return (
    <>
      <FactoryScene
        cars={cars}
        flyToTarget={flyToTarget}
        productionJob={productionJob}
        onProductionComplete={handleProductionComplete}
      />
      <HUD
        carCount={cars.length}
        onFlyTo={handleFlyTo}
        onCarsChanged={handleCarsChanged}
        onStartProduction={handleStartProduction}
      />
      <EmailClaimBar />
    </>
  )
}
