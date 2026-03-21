'use client'

import { useState, useEffect } from 'react'
import type { CarType } from '@/lib/types'
import type { DriveModeState } from '@/components/factory/FactoryScene'

interface MyCarEntry {
  car_number: number
  name: string
  car_type: CarType
  color: string
  parked_x: number
  parked_z: number
  parked_rotation: number
}

interface MyCarsProps {
  onFlyTo: (pos: [number, number, number]) => void
  isDriving: boolean
  onSwitchDrive: (state: DriveModeState) => void
}

const CAR_ICONS: Record<string, string> = { car1: '🏎️', car2: '🚚', car3: '🚙' }

export default function MyCarsPanel({ onFlyTo, isDriving, onSwitchDrive }: MyCarsProps) {
  const [cars, setCars] = useState<MyCarEntry[]>([])
  const [open, setOpen] = useState(false)

  function loadCars() {
    const stored = localStorage.getItem('my_cars')
    if (stored) {
      try { setCars(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }

  useEffect(() => {
    loadCars()
    window.addEventListener('car-built', loadCars)
    return () => window.removeEventListener('car-built', loadCars)
  }, [])

  if (cars.length === 0) return null

  return (
    <div className="fixed z-40 pointer-events-auto" style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom))', right: '1rem' }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold px-4 py-2.5 rounded-full shadow-lg transition-all text-sm"
      >
        <span>My Cars</span>
        <span className="bg-white/30 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center leading-none">
          {cars.length}
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-white/95 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-2xl overflow-hidden min-w-[220px] max-w-[280px]">
          <div className="px-4 py-2.5 border-b border-orange-100">
            <p className="text-zinc-800 text-sm font-black">My Cars</p>
            <p className="text-zinc-400 text-xs">Cars you've built this session</p>
          </div>

          <ul className="py-1 max-h-64 overflow-y-auto">
            {cars.map((car) => (
              <li key={car.car_number} className="px-3 py-2 hover:bg-orange-50 transition-colors">
                <div className="flex items-center gap-2">
                  {/* Color swatch + icon */}
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm shadow-sm"
                    style={{ background: car.color }}
                  >
                    <span style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.4))' }}>
                      {CAR_ICONS[car.car_type] ?? '🚗'}
                    </span>
                  </div>

                  {/* Car info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-800 text-sm font-bold truncate">{car.name}</p>
                    <p className="text-zinc-400 text-xs">#{car.car_number}</p>
                  </div>

                  {/* Action button */}
                  {isDriving ? (
                    <button
                      onClick={() => {
                        onSwitchDrive({
                          carType: car.car_type,
                          color: car.color,
                          startPosition: [car.parked_x || 0, 0, car.parked_z || 30],
                        })
                        setOpen(false)
                      }}
                      className="flex-shrink-0 text-xs font-bold text-orange-500 hover:text-orange-400 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Drive
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onFlyTo([car.parked_x || 0, 0, car.parked_z || 30])
                        setOpen(false)
                      }}
                      className="flex-shrink-0 text-xs font-bold text-orange-500 hover:text-orange-400 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Fly to
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {cars.length > 1 && (
            <div className="px-4 py-2 border-t border-orange-100">
              <p className="text-zinc-400 text-xs text-center">
                {cars.length} cars built — nice work!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
