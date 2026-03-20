'use client'

import { CAR_COLORS } from '@/lib/colors'

interface ColorPickerProps {
  selected: string | null
  onSelect: (color: string) => void
}

export default function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <div>
      <h3 className="text-white font-bold text-lg mb-3">Pick a color</h3>
      <div className="flex flex-wrap gap-3">
        {CAR_COLORS.map(({ name, hex }) => (
          <button
            key={hex}
            onClick={() => onSelect(hex)}
            className={`w-12 h-12 rounded-full transition-all ${
              selected === hex
                ? 'ring-4 ring-orange-500 ring-offset-2 ring-offset-black scale-110'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: hex }}
            title={name}
          />
        ))}
      </div>
    </div>
  )
}
