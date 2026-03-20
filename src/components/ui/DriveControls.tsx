'use client'

import { useEffect, useState } from 'react'
import { driveInput } from '@/lib/driveInput'
import { playHorn } from '@/lib/sounds'

interface DriveControlsProps {
  onExit: () => void
}

type InputKey = 'forward' | 'backward' | 'left' | 'right'

/**
 * On-screen drive controls for mobile / touch devices.
 * Uses pointer events so multi-touch works (hold forward + turn simultaneously).
 */
export default function DriveControls({ onExit }: DriveControlsProps) {
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // Pointer tracking so multiple touches work
  useEffect(() => {
    return () => {
      // Make sure all inputs are cleared when this unmounts
      driveInput.forward  = false
      driveInput.backward = false
      driveInput.left     = false
      driveInput.right    = false
    }
  }, [])

  function makeHandlers(key: InputKey) {
    return {
      onPointerDown: (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        driveInput[key] = true
      },
      onPointerUp: () => { driveInput[key] = false },
      onPointerCancel: () => { driveInput[key] = false },
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-20 select-none">
      {/* Exit button — top right */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <button
          onClick={onExit}
          className="bg-black/70 text-white font-bold px-4 py-2 rounded-xl text-sm backdrop-blur-sm border border-white/20"
        >
          Exit Drive
        </button>
      </div>

      {/* Drive hint — top center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-white/80 text-sm font-bold drop-shadow bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
          {isTouch ? 'Tap arrows to drive • Horn button • X to exit' : 'WASD / arrows to drive • Space = horn • ESC = exit'}
        </p>
      </div>

      {/* Left D-pad — movement */}
      <div className="absolute left-8 pointer-events-auto" style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
        <div className="grid grid-cols-3 gap-1 w-36">
          {/* Up */}
          <div />
          <button
            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl h-12 flex items-center justify-center text-white text-xl font-bold active:bg-white/40"
            {...makeHandlers('forward')}
          >
            ▲
          </button>
          <div />

          {/* Left / Down / Right */}
          <button
            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl h-12 flex items-center justify-center text-white text-xl font-bold active:bg-white/40"
            {...makeHandlers('left')}
          >
            ◀
          </button>
          <button
            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl h-12 flex items-center justify-center text-white text-xl font-bold active:bg-white/40"
            {...makeHandlers('backward')}
          >
            ▼
          </button>
          <button
            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl h-12 flex items-center justify-center text-white text-xl font-bold active:bg-white/40"
            {...makeHandlers('right')}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Horn button — bottom right */}
      <div className="absolute right-8 pointer-events-auto" style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
        <button
          className="bg-orange-500/80 backdrop-blur-sm border border-orange-300/50 rounded-full w-16 h-16 flex items-center justify-center text-white text-2xl font-black shadow-lg active:bg-orange-400"
          onPointerDown={() => { playHorn() }}
        >
          📯
        </button>
      </div>
    </div>
  )
}
