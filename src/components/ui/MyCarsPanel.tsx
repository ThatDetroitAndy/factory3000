'use client'

import { useState, useEffect } from 'react'
import type { Car, CarType } from '@/lib/types'
import { CAR_TYPE_LABELS } from '@/lib/types'
import { PARKING_SPACING, PARKING_COLS } from '@/lib/constants'

function getParkingPosition(index: number): [number, number, number] {
  const row = Math.floor(index / PARKING_COLS)
  const col = index % PARKING_COLS
  const x = col * PARKING_SPACING - (PARKING_COLS * PARKING_SPACING) / 2
  const z = row * PARKING_SPACING + 30
  return [x, 0, z]
}

interface MyCarsPanelProps {
  allCars: Car[]
  onFlyTo: (position: [number, number, number]) => void
  onDrive: (carType: CarType, color: string, position: [number, number, number]) => void
  onClose: () => void
}

export default function MyCarsPanel({ allCars, onFlyTo, onDrive, onClose }: MyCarsPanelProps) {
  const [myCars, setMyCars] = useState<Car[]>([])

  useEffect(() => {
    const load = () => {
      try {
        const stored = localStorage.getItem('my_cars')
        if (stored) setMyCars(JSON.parse(stored))
      } catch {
        // ignore parse errors
      }
    }
    load()
    window.addEventListener('car-built', load)
    return () => window.removeEventListener('car-built', load)
  }, [])

  const getCarPosition = (carNumber: number): [number, number, number] => {
    const fullCar = allCars.find(c => c.car_number === carNumber)
    if (fullCar) {
      if (fullCar.parked_x !== 0 || fullCar.parked_z !== 0) {
        return [fullCar.parked_x, 0, fullCar.parked_z]
      }
      return getParkingPosition(allCars.indexOf(fullCar))
    }
    // fallback to stored position
    const stored = myCars.find(c => c.car_number === carNumber)
    if (stored && (stored.parked_x !== 0 || stored.parked_z !== 0)) {
      return [stored.parked_x, 0, stored.parked_z]
    }
    return [0, 0, 30]
  }

  if (myCars.length === 0) return null

  return (
    <div
      className="fixed z-30 pointer-events-auto w-72"
      style={{ bottom: 'max(5rem, calc(5rem + env(safe-area-inset-bottom)))', right: '1rem' }}
    >
      <div className="bg-zinc-900/95 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-black text-sm uppercase tracking-wide">My Cars</h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {myCars.map((car) => {
            const pos = getCarPosition(car.car_number)
            return (
              <div
                key={car.car_number}
                className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-white/20"
                  style={{ background: car.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{car.name}</p>
                  <p className="text-white/40 text-xs">
                    #{car.car_number} &middot; {CAR_TYPE_LABELS[car.car_type]}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => { onFlyTo(pos); onClose() }}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white text-xs font-bold"
                    title="Fly to car"
                  >
                    View
                  </button>
                  <button
                    onClick={() => { onDrive(car.car_type, car.color, pos); onClose() }}
                    className="px-2 py-1 rounded-lg bg-orange-500 hover:bg-orange-400 transition-colors text-white text-xs font-bold"
                    title="Drive this car"
                  >
                    Drive
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
