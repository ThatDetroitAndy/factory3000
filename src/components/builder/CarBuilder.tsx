'use client'

import { useState } from 'react'
import TypePicker from './TypePicker'
import ColorPicker from './ColorPicker'
import NameInput from './NameInput'
import type { CarType } from '@/lib/types'
import type { ProductionJob } from '@/components/factory/FactoryScene'

interface CarBuilderProps {
  onClose: () => void
  onStartProduction: (job: ProductionJob) => void
  onCarsChanged: () => void
  onFlyTo?: (position: [number, number, number]) => void
}

type Step = 'type' | 'color' | 'name' | 'building' | 'done'

export default function CarBuilder({ onClose, onStartProduction, onCarsChanged, onFlyTo }: CarBuilderProps) {
  const [step, setStep] = useState<Step>('type')
  const [carType, setCarType] = useState<CarType | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [nameValid, setNameValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [carNumber, setCarNumber] = useState<number | null>(null)

  const handleSubmit = async () => {
    if (!carType || !color || !name.trim()) return

    setStep('building')
    setError(null)

    // Start the 3D conveyor animation — camera will follow the car
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

      const newCarNumber = data.car.car_number
      setCarNumber(newCarNumber)

      // Store as unclaimed for the persistent email bar
      localStorage.setItem('unclaimed_car', String(newCarNumber))
      window.dispatchEvent(new Event('car-built'))

      // Wait for the 3D production animation to finish
      // ProductionCar takes ~10s at speed 12, plus 1.5s hold at end
      await new Promise((r) => setTimeout(r, 11000))

      setStep('done')
      onCarsChanged()
    } catch {
      setError('Network error — please try again')
      setStep('name')
    }
  }

  // During building, hide the dialog entirely — let the 3D scene take center stage
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
            {!['building', 'done'].includes(step) && (
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
            )}
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
              <button
                onClick={() => setStep('type')}
                className="px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
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
              <button
                onClick={() => setStep('color')}
                className="px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
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

        {/* Done — celebration */}
        {step === 'done' && carNumber && (
          <div className="text-center py-4 space-y-4">
            <div className="text-5xl">🎉</div>
            <p className="text-white font-black text-2xl">{name}</p>
            <p className="text-white/40">Car #{carNumber} is parked in the lot!</p>

            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-white/30 text-xs mb-1">Share your car</p>
              <p className="text-orange-400 font-mono text-sm select-all">
                {typeof window !== 'undefined' ? window.location.origin : ''}/car/{carNumber}
              </p>
            </div>

            <button
              onClick={() => {
                // Fly to the car's position in the parking lot
                // New cars get placed at default grid positions near z=50
                onFlyTo?.([0, 0, 50])
                onClose()
              }}
              className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors text-lg"
            >
              Visit Your Car
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
