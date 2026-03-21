'use client'

import { useState } from 'react'
import TypePicker from './TypePicker'
import ColorPicker from './ColorPicker'
import NameInput from './NameInput'
import type { CarType, Car } from '@/lib/types'
import type { ProductionJob, CelebrationState } from '@/components/factory/FactoryScene'

interface CarBuilderProps {
  onClose: () => void
  onStartProduction: (job: ProductionJob) => void
  onCarsChanged: () => void
  onFlyTo?: (position: [number, number, number]) => void
  onCelebrate: (state: CelebrationState) => void
}

type Step = 'type' | 'color' | 'name' | 'building'

export default function CarBuilder({ onClose, onStartProduction, onCarsChanged, onCelebrate }: CarBuilderProps) {
  const [step, setStep] = useState<Step>('type')
  const [carType, setCarType] = useState<CarType | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [nameValid, setNameValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!carType || !color || !name.trim()) return

    setStep('building')
    setError(null)

    // Start the 3D conveyor animation
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
        setStep('name')
        return
      }

      const newCar: Car = data.car
      const newCarNumber = newCar.car_number

      // Store in my_cars array (newest first) for the My Cars panel
      const storedCars: Car[] = JSON.parse(localStorage.getItem('my_cars') || '[]')
      storedCars.unshift(newCar)
      localStorage.setItem('my_cars', JSON.stringify(storedCars))

      // Also keep the legacy unclaimed_car key for EmailClaimBar
      localStorage.setItem('unclaimed_car', String(newCarNumber))
      window.dispatchEvent(new Event('car-built'))

      // Wait for the 3D production animation to finish
      await new Promise((r) => setTimeout(r, 11000))

      // Trigger 3D celebration — no dialog, just the name floating above the car
      onCelebrate({
        name: name.trim(),
        carNumber: newCarNumber,
        carType,
        color,
        position: [0, 0, 30], // end of conveyor / parking area
      })

      onCarsChanged()

      // Close the builder — celebration is handled in the 3D scene
      onClose()
    } catch (err) {
      console.error('[CarBuilder] fetch error:', err)
      setError('Network error — please try again')
      setStep('name')
    }
  }

  // During building, hide the dialog — 3D scene takes over
  if (step === 'building') {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="bg-zinc-900/95 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 mb-4 sm:mb-0 shadow-2xl pointer-events-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-white font-black text-xl">BUILD YOUR CAR</h2>
            <div className="flex gap-1.5 mt-2">
              {(['type', 'color', 'name'] as const).map((s, i) => (
                <div
                  key={s}
                  className={`h-1 rounded-full flex-1 transition-colors ${
                    ['type', 'color', 'name'].indexOf(step) >= i
                      ? 'bg-orange-500'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none">
            &times;
          </button>
        </div>

        {/* Type step */}
        {step === 'type' && (
          <div className="space-y-4">
            <TypePicker selected={carType} onSelect={setCarType} />
            <button
              onClick={() => setStep('color')}
              disabled={!carType}
              className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-white/10 disabled:text-white/30 text-white font-bold rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Color step */}
        {step === 'color' && (
          <div className="space-y-4">
            <ColorPicker selected={color} onSelect={setColor} />
            <div className="flex gap-2">
              <button onClick={() => setStep('type')} className="px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                Back
              </button>
              <button
                onClick={() => setStep('name')}
                disabled={!color}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-white/10 disabled:text-white/30 text-white font-bold rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Name step */}
        {step === 'name' && (
          <div className="space-y-4">
            <NameInput value={name} onChange={setName} onValidation={setNameValid} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setStep('color')} className="px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!nameValid || !name.trim()}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-white/10 disabled:text-white/30 text-white font-bold rounded-lg transition-colors"
              >
                Build It!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
