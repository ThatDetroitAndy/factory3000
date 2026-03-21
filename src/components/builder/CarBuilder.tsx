'use client'

import { useState, useEffect, useCallback } from 'react'
import TypePicker from './TypePicker'
import ColorPicker from './ColorPicker'
import NameInput from './NameInput'
import type { CarType } from '@/lib/types'
import type { ProductionJob, CelebrationState, BuilderPreview } from '@/components/factory/FactoryScene'

interface CarBuilderProps {
  onClose: () => void
  onStartProduction: (job: ProductionJob) => void
  onCarsChanged: () => void
  onCelebrate: (state: CelebrationState) => void
  /** Called whenever step/type/color changes so FactoryScene can update the 3D preview */
  onStateChange: (preview: BuilderPreview) => void
}

type Step = 'chassis' | 'paint' | 'name'

const STATIONS: Record<Step, { label: string; accent: string; num: number }> = {
  chassis: { label: 'CHASSIS STATION', accent: '#FF6B6B', num: 1 },
  paint:   { label: 'PAINT STATION',   accent: '#4ECDC4', num: 2 },
  name:    { label: 'NAME STATION',    accent: '#C47AFF', num: 3 },
}

export default function CarBuilder({
  onClose,
  onStartProduction,
  onCarsChanged,
  onCelebrate,
  onStateChange,
}: CarBuilderProps) {
  const [step, setStep] = useState<Step>('chassis')
  const [carType, setCarType] = useState<CarType | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [nameValid, setNameValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [building, setBuilding] = useState(false)

  // Keep FactoryScene's 3D preview in sync with every selection
  useEffect(() => {
    onStateChange({ step, carType, color })
  }, [step, carType, color, onStateChange])

  const handleSubmit = useCallback(async () => {
    if (!carType || !color || !name.trim()) return

    setBuilding(true)
    setError(null)

    // Hand off to ProductionCar animation immediately
    onStartProduction({ carType, color })

    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), car_type: carType, color }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setBuilding(false)
        return
      }

      const newCarNumber = data.car.car_number

      // Store as unclaimed for the persistent email bar
      localStorage.setItem('unclaimed_car', String(newCarNumber))

      // Store full car data for My Cars panel
      // Compute actual grid position so View/Fly-to works correctly.
      // ParkingLot renders user's cars at index 0,1,2... so we use myCars.length as the index.
      const myCars = JSON.parse(localStorage.getItem('my_cars') || '[]')
      const PARKING_COLS = 10
      const PARKING_SPACING = 6
      const carIndex = myCars.length
      const computedRow = Math.floor(carIndex / PARKING_COLS)
      const computedCol = carIndex % PARKING_COLS
      const computedX = computedCol * PARKING_SPACING - (PARKING_COLS * PARKING_SPACING) / 2
      const computedZ = computedRow * PARKING_SPACING + 30
      myCars.push({
        car_number: data.car.car_number,
        name: data.car.name,
        car_type: data.car.car_type,
        color: data.car.color,
        parked_x: computedX,
        parked_z: computedZ,
        parked_rotation: data.car.parked_rotation ?? 0,
      })
      localStorage.setItem('my_cars', JSON.stringify(myCars))

      window.dispatchEvent(new Event('car-built'))

      // Wait for the 3D production animation to finish
      await new Promise((r) => setTimeout(r, 11000))

      onCelebrate({
        name: name.trim(),
        carNumber: newCarNumber,
        carType,
        color,
        position: [0, 0, 30],
      })

      onCarsChanged()
      onClose()
    } catch (err) {
      console.error('[CarBuilder] fetch error:', err)
      setError('Network error — please try again')
      setBuilding(false)
    }
  }, [carType, color, name, onStartProduction, onCelebrate, onCarsChanged, onClose])

  // During the production animation, hide the panel — 3D scene takes over
  if (building) return null

  const { label, accent, num } = STATIONS[step]

  return (
    // Fixed panel — bottom-center on mobile, bottom-right on desktop
    // Doesn't block the 3D scene above it
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:inset-x-auto sm:right-5 sm:bottom-20 sm:px-0 sm:pb-0 pointer-events-none">
      <div
        className="pointer-events-auto w-full sm:w-80 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(12, 12, 18, 0.93)',
          border: `1px solid ${accent}50`,
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Station header */}
        <div
          className="px-5 pt-4 pb-3 flex items-start justify-between"
          style={{ borderBottom: `1px solid ${accent}25` }}
        >
          <div>
            <span
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: accent }}
            >
              {label}
            </span>
            {/* Step progress dots */}
            <div className="flex gap-1.5 mt-2">
              {(['chassis', 'paint', 'name'] as Step[]).map((s, i) => (
                <div
                  key={s}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i + 1 <= num ? '24px' : '16px',
                    background: i + 1 <= num ? accent : 'rgba(255,255,255,0.12)',
                  }}
                />
              ))}
              <span className="text-white/30 text-xs ml-1 self-center">
                {num} / 3
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/25 hover:text-white/60 text-2xl leading-none transition-colors ml-2 mt-0.5"
            aria-label="Close builder"
          >
            ×
          </button>
        </div>

        {/* Station content */}
        <div className="px-5 py-4">
          {step === 'chassis' && (
            <div className="space-y-4">
              <TypePicker selected={carType} onSelect={setCarType} />
              <button
                onClick={() => setStep('paint')}
                disabled={!carType}
                className="w-full py-3 font-black text-sm rounded-xl uppercase tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
                style={{ background: carType ? accent : 'rgba(255,255,255,0.08)' }}
              >
                Next: Paint Station →
              </button>
            </div>
          )}

          {step === 'paint' && (
            <div className="space-y-4">
              <ColorPicker selected={color} onSelect={setColor} />
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('chassis')}
                  className="px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep('name')}
                  disabled={!color}
                  className="flex-1 py-2.5 font-black text-sm rounded-xl uppercase tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
                  style={{ background: color ? accent : 'rgba(255,255,255,0.08)' }}
                >
                  Next: Name Station →
                </button>
              </div>
            </div>
          )}

          {step === 'name' && (
            <div className="space-y-4">
              <NameInput value={name} onChange={setName} onValidation={setNameValid} />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('paint')}
                  className="px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!nameValid || !name.trim()}
                  className="flex-1 py-2.5 font-black text-sm rounded-xl uppercase tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
                  style={{ background: nameValid && name.trim() ? accent : 'rgba(255,255,255,0.08)' }}
                >
                  Build It!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
