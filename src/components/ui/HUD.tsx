'use client'

import { useState } from 'react'
import { SUBSCRIBER_COUNT } from '@/lib/constants'
import SearchBar from './SearchBar'
import CarBuilder from '@/components/builder/CarBuilder'
import type { ProductionJob, CelebrationState } from '@/components/factory/FactoryScene'

interface HUDProps {
  carCount: number
  onFlyTo: (position: [number, number, number]) => void
  onCarsChanged: () => void
  onStartProduction: (job: ProductionJob) => void
  onCelebrate: (state: CelebrationState) => void
}

export default function HUD({ carCount, onFlyTo, onCarsChanged, onStartProduction, onCelebrate }: HUDProps) {
  const [showBuilder, setShowBuilder] = useState(false)
  const remaining = SUBSCRIBER_COUNT - carCount

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 gap-4">
          {/* Logo / title — dark text with subtle shadow for readability on bright bg */}
          <div className="pointer-events-auto drop-shadow-lg">
            <h1 className="text-3xl font-black text-white tracking-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              FACTORY 3000
            </h1>
            <p className="text-xs text-white/80 tracking-wide uppercase font-bold" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              1 Subscriber = 1 Car
            </p>
          </div>

          {/* Search + Build */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <SearchBar onFlyTo={onFlyTo} />
            <button
              onClick={() => setShowBuilder(true)}
              className="bg-orange-500 hover:bg-orange-400 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors shadow-xl uppercase tracking-wide"
            >
              Build Your Car
            </button>
          </div>
        </div>

        {/* Bottom bar — car counter */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-5 py-3 pointer-events-auto shadow-xl">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-zinc-900 font-black text-xl tabular-nums">
                    {carCount.toLocaleString()}
                    <span className="text-zinc-400 font-normal text-sm ml-1">cars built</span>
                  </p>
                </div>
                <div className="w-px h-8 bg-zinc-200" />
                <div>
                  <p className="text-orange-500 font-black text-xl tabular-nums">
                    {remaining.toLocaleString()}
                    <span className="text-zinc-400 font-normal text-sm ml-1">waiting</span>
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max((carCount / SUBSCRIBER_COUNT) * 100, 0.5)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Car builder modal */}
      {showBuilder && (
        <CarBuilder
          onClose={() => setShowBuilder(false)}
          onStartProduction={onStartProduction}
          onCarsChanged={onCarsChanged}
          onFlyTo={onFlyTo}
          onCelebrate={onCelebrate}
        />
      )}
    </>
  )
}
