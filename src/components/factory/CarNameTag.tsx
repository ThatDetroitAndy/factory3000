'use client'

import { Html } from '@react-three/drei'

interface CarNameTagProps {
  name: string
  carNumber: number
  position: [number, number, number]
}

export default function CarNameTag({ name, carNumber, position }: CarNameTagProps) {
  return (
    <Html
      position={[position[0], position[1] + 3.5, position[2]]}
      center
      distanceFactor={15}
      occlude={false}
      zIndexRange={[10, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap select-none">
        <span className="font-bold">{name}</span>
        <span className="text-white/50 ml-1">#{carNumber}</span>
      </div>
    </Html>
  )
}
