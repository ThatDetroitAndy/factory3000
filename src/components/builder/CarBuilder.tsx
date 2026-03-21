'use client'

import { useState } from 'react'
import TypePicker from './TypePicker'
import ColorPicker from './ColorPicker'
import NameInput from './NameInput'
import type { ProductionJob, CelebrationState, AssemblyModeState } from '@/components/factory/FactoryScene'

interface CarBuilderProps {
  assemblyMode: AssemblyModeState
  onUpdate: (update: Partial<AssemblyModeState>) => void
  onClose: () => void
  onStartProduction: (job: ProductionJob) => void
  onCarsChanged: () => void
  onCelebrate: (state: CelebrationState) => void
}

// Station accent colors matching the 3D assembly stations in ConveyorBelt.tsx
const STATION_COLOR: Record<AssemblyModeState['station'], string> = {
  chassis: '#FF6B6B',
  paint: '#4ECDC4',
  name: '#C47AFF',
}

const STATION_LABELS: Record<AssemblyModeState['station'], string> = {
  chassis: 'CHASSIS',
  paint: 'PAINT',
  name: 'NAME',
}

export default function CarBuilder({
  assemblyMode,
  onUpdate,
  onClose,
  onStartProduction,
  onCarsChanged,
  onCelebrate,
}: CarBuilderProps) {
  const [name, setName] = useState('')
  const [nameValid, setNameValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { station, carType, color } = assemblyMode
  const accentColor = STATION_COLOR[station]
  const stationIndex = ['chassis', 'paint', 'name'].indexOf(station)

  const handleSubmit = async () => {
    if (!carType || !color || !name.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    // Start the 3D conveyor animation immediately — panel stays until API resolves
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
        setIsSubmitting(false)
        return
      }

      const newCarNumber = data.car.car_number

      // Store as unclaimed for the persistent email bar
      localStorage.setItem('unclaimed_car', String(newCarNumber))

      // Store full car data for My Cars panel
      const myCars = JSON.parse(localStorage.getItem('my_cars') || '[]')
      myCars.push({
        car_number: data.car.car_number,
        name: data.car.name,
        car_type: data.car.car_type,
        color: data.car.color,
        parked_x: data.car.parked_x ?? 0,
        parked_z: data.car.parked_z ?? 0,
        parked_rotation: data.car.parked_rotation ?? 0,
      })
      localStorage.setItem('my_cars', JSON.stringify(myCars))

      window.dispatchEvent(new Event('car-built'))

      // Close the assembly panel immediately — ProductionCar takes over visually
      onClose()

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
    } catch (err) {
      console.error('[CarBuilder] fetch error:', err)
      setError('Network error — please try again')
      setIsSubmitting(false)
    }
  }

  // Hidden during submission — ProductionCar is running
  if (isSubmitting && !error) return null

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 pointer-events-auto pb-[max(1.5rem,env(safe-area-inset-bottom))] px-4 w-full max-w-md">
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(12, 12, 18, 0.93)',
          backdropFilter: 'blur(16px)',
          border: `2px solid ${accentColor}50`,
          boxShadow: `0 0 40px ${accentColor}20, 0 20px 60px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Station progress tabs */}
        <div className="flex" style={{ borderBottom: `1px solid ${accentColor}20` }}>
          {(['chassis', 'paint', 'name'] as const).map((s, i) => {
            const isDone = i < stationIndex
            const isActive = s === station
            return (
              <div
                key={s}
                className="flex-1 py-3 text-center text-xs font-black tracking-widest transition-all select-none"
                style={{
                  color: isActive ? accentColor : isDone ? '#ffffff50' : '#ffffff25',
                  borderBottom: isActive ? `3px solid ${accentColor}` : '3px solid transparent',
                  background: isActive ? `${accentColor}10` : 'transparent',
                }}
              >
                {isDone ? '✓ ' : `${i + 1}. `}{STATION_LABELS[s]}
              </div>
            )
          })}
          <button
            onClick={onClose}
            className="px-4 text-white/25 hover:text-white/60 text-xl leading-none transition-colors"
            aria-label="Close builder"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-5">

          {/* STATION 1 — CHASSIS */}
          {station === 'chassis' && (
            <div className="space-y-4">
              <TypePicker selected={carType} onSelect={(t) => onUpdate({ carType: t })} />
              <button
                onClick={() => onUpdate({ station: 'paint' })}
                disabled={!carType}
                className="w-full py-3.5 font-black rounded-xl text-white text-sm tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: carType ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` : '#ffffff15',
                  boxShadow: carType ? `0 4px 20px ${accentColor}40` : 'none',
                }}
              >
                Next: Paint It →
              </button>
            </div>
          )}

          {/* STATION 2 — PAINT */}
          {station === 'paint' && (
            <div className="space-y-4">
              <ColorPicker selected={color} onSelect={(c) => onUpdate({ color: c })} />
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdate({ station: 'chassis' })}
                  className="px-5 py-3 rounded-xl text-white/50 hover:text-white/80 transition-colors text-sm font-bold"
                  style={{ background: '#ffffff10' }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => onUpdate({ station: 'name' })}
                  disabled={!color}
                  className="flex-1 py-3 font-black rounded-xl text-white text-sm tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: color ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` : '#ffffff15',
                    boxShadow: color ? `0 4px 20px ${accentColor}40` : 'none',
                  }}
                >
                  Next: Name It →
                </button>
              </div>
            </div>
          )}

          {/* STATION 3 — NAME */}
          {station === 'name' && (
            <div className="space-y-4">
              <NameInput value={name} onChange={setName} onValidation={setNameValid} />
              {error && <p className="text-red-400 text-sm font-bold">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdate({ station: 'paint' })}
                  className="px-5 py-3 rounded-xl text-white/50 hover:text-white/80 transition-colors text-sm font-bold"
                  style={{ background: '#ffffff10' }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!nameValid || !name.trim() || isSubmitting}
                  className="flex-1 py-3 font-black rounded-xl text-white text-sm tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: nameValid && name.trim() ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` : '#ffffff15',
                    boxShadow: nameValid && name.trim() ? `0 4px 20px ${accentColor}40` : 'none',
                  }}
                >
                  Build It! 🔧
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
