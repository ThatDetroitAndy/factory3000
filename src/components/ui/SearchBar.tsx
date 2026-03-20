'use client'

import { useState, useCallback } from 'react'
import type { Car } from '@/lib/types'

interface SearchBarProps {
  onFlyTo: (position: [number, number, number]) => void
}

export default function SearchBar({ onFlyTo }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Car[]>([])
  const [open, setOpen] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }

    try {
      const res = await fetch(`/api/cars`)
      const data = await res.json()
      const cars: Car[] = data.cars || []

      const filtered = cars.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.car_number.toString() === q
      )
      setResults(filtered.slice(0, 5))
    } catch {
      setResults([])
    }
  }, [])

  const handleChange = (val: string) => {
    setQuery(val)
    setOpen(true)
    search(val)
  }

  const handleSelect = (car: Car) => {
    onFlyTo([car.parked_x, 0, car.parked_z])
    setOpen(false)
    setQuery(car.name)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => query && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Search cars..."
        className="w-48 md:w-64 px-3 py-2 bg-white/90 backdrop-blur-sm border border-zinc-200 rounded-xl text-zinc-900 text-base placeholder-zinc-400 focus:outline-none focus:border-orange-500 shadow-lg transition-colors"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xl">
          {results.map((car) => (
            <button
              key={car.id}
              onMouseDown={() => handleSelect(car)}
              className="w-full px-3 py-2 text-left text-sm text-zinc-900 hover:bg-orange-50 flex items-center gap-2 transition-colors"
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: car.color }}
              />
              <span className="font-medium">{car.name}</span>
              <span className="text-zinc-400 ml-auto">#{car.car_number}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
