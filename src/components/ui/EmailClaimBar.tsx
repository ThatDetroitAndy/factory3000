'use client'

import { useState, useEffect } from 'react'

/**
 * Persistent floating bar prompting users to claim their car(s) with an email.
 * Shows whenever there are unclaimed car numbers in localStorage.
 * Stays visible until they either claim or explicitly dismiss.
 */
export default function EmailClaimBar() {
  const [carNumber, setCarNumber] = useState<number | null>(null)
  const [totalCars, setTotalCars] = useState(0)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [dismissed, setDismissed] = useState(false)

  const syncFromStorage = () => {
    const stored = localStorage.getItem('unclaimed_car')
    if (stored) {
      setCarNumber(parseInt(stored, 10))
    }
    try {
      const myCars = JSON.parse(localStorage.getItem('my_cars') || '[]')
      setTotalCars(myCars.length)
    } catch {
      setTotalCars(stored ? 1 : 0)
    }
  }

  useEffect(() => {
    syncFromStorage()
  }, [])

  // Listen for new unclaimed cars (set by CarBuilder)
  useEffect(() => {
    const handler = () => {
      syncFromStorage()
      setDismissed(false)
      setStatus('idle')
      setEmail('')
    }
    window.addEventListener('car-built', handler)
    return () => window.removeEventListener('car-built', handler)
  }, [])

  const handleClaim = async () => {
    if (!email || !carNumber) return
    setStatus('sending')
    try {
      const res = await fetch('/api/cars/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, car_number: carNumber }),
      })
      if (res.ok) {
        setStatus('sent')
        localStorage.removeItem('unclaimed_car')
        window.dispatchEvent(new Event('claim-bar-dismissed'))
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (!carNumber || dismissed) return null

  if (status === 'sent') {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto" style={{ bottom: 'max(5rem, calc(5rem + env(safe-area-inset-bottom)))' }}>
        <div className="bg-green-900/90 backdrop-blur-sm border border-green-500/30 rounded-xl px-5 py-3 shadow-2xl">
          <p className="text-green-300 text-sm font-medium">
            Check your email to claim Car #{carNumber}!
          </p>
        </div>
      </div>
    )
  }

  const headline = totalCars > 1
    ? `You built ${totalCars} cars! Save them with your email`
    : `Save Car #${carNumber} to your account`

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-sm w-full px-4" style={{ bottom: 'max(6rem, calc(6rem + env(safe-area-inset-bottom)))' }}>
      <div className="bg-white/95 backdrop-blur-sm border border-orange-200 rounded-xl px-4 py-3 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-zinc-900 text-sm font-bold">
            {headline}
          </p>
          <button
            onClick={() => { setDismissed(true); window.dispatchEvent(new Event('claim-bar-dismissed')) }}
            className="text-zinc-300 hover:text-zinc-500 text-lg leading-none ml-2"
          >
            &times;
          </button>
        </div>
        <p className="text-zinc-500 text-xs mb-2">
          Enter your email to claim your car — come back anytime to update it or order physical copies.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-base placeholder-zinc-400 focus:outline-none focus:border-orange-500"
            onKeyDown={(e) => e.key === 'Enter' && handleClaim()}
          />
          <button
            onClick={handleClaim}
            disabled={!email || status === 'sending'}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
          >
            {status === 'sending' ? 'Sending...' : 'Claim'}
          </button>
        </div>
        {status === 'error' && (
          <p className="text-red-400 text-xs mt-1">Something went wrong — try again</p>
        )}
      </div>
    </div>
  )
}
