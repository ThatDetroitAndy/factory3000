'use client'

import { useState, useCallback } from 'react'
import FactoryScene from '@/components/factory/FactoryScene'
import type { ProductionJob, CelebrationState } from '@/components/factory/FactoryScene'
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
  const [celebration, setCelebration] = useState<CelebrationState | null>(null)

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
  }, [])

  const handleProductionComplete = useCallback(() => {
    setProductionJob(null)
    handleCarsChanged()
  }, [handleCarsChanged])

  const handleCelebrate = useCallback((state: CelebrationState) => {
    setCelebration(state)
    // Auto-dismiss celebration after 15 seconds
    setTimeout(() => setCelebration(null), 15000)
  }, [])

  return (
    <>
      <FactoryScene
        cars={cars}
        flyToTarget={flyToTarget}
        productionJob={productionJob}
        onProductionComplete={handleProductionComplete}
        celebration={celebration}
      />
      <HUD
        carCount={cars.length}
        onFlyTo={handleFlyTo}
        onCarsChanged={handleCarsChanged}
        onStartProduction={handleStartProduction}
        onCelebrate={handleCelebrate}
      />
      <EmailClaimBar />
    </>
  )
}
