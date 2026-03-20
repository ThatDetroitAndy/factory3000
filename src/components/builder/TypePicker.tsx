'use client'

import type { CarType } from '@/lib/types'

interface TypePickerProps {
  selected: CarType | null
  onSelect: (type: CarType) => void
}

const CAR_OPTIONS: { type: CarType; label: string; description: string }[] = [
  { type: 'car1', label: 'Car 1', description: 'Go-Kart — low, fast, fun' },
  { type: 'car2', label: 'Car 2', description: 'Pickup — tough and reliable' },
  { type: 'car3', label: 'Car 3', description: 'SUV — big and bold' },
]

export default function TypePicker({ selected, onSelect }: TypePickerProps) {
  return (
    <div>
      <h3 className="text-white font-bold text-lg mb-3">Choose your ride</h3>
      <div className="grid grid-cols-3 gap-3">
        {CAR_OPTIONS.map(({ type, label, description }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selected === type
                ? 'border-orange-500 bg-orange-500/20'
                : 'border-white/10 bg-white/5 hover:border-white/30'
            }`}
          >
            <div className="text-3xl mb-2">
              {type === 'car1' ? '🏎️' : type === 'car2' ? '🛻' : '🚙'}
            </div>
            <p className="text-white font-bold text-sm">{label}</p>
            <p className="text-white/50 text-xs mt-1">{description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
