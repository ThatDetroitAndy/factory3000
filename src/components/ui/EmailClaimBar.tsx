'use client'

import { useState, useEffect } from 'react'

/**
 * Persistent floating bar prompting users to claim their car(s) with an email.
 * Shows whenever there are unclaimed car numbers in localStorage.
 * Stays visible until they either claim or explicitly dismiss.
 */
export default function EmailClaimBar() {
  const [unclaimedNumbers, setUnclaimedNumbers] = useState<number[]>([])
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [dismissed, setDismissed] = useState(false)

  function loadCars() {
    // Collect all unclaimed car numbers from localStorage
    const stored = localStorage.getItem('unclaimed_car')
    const myCars: { car_number: number }[] = JSON.parse(localStorage.getItem('my_cars') || '[]')
    const myCarsNumbers = myCars.map((c) => c.car_number)
    // Use my_cars as the source of truth if available, else fall back to unclaimed_car
    if (myCarsNumbers.length > 0) {
      setUnclaimedNumbers(myCarsNumbers)
    } else if (stored) {
      setUnclaimedNumbers([parseInt(stored, 10)])
    } else {
      setUnclaimedNumbers([])
    }
  }

  useEffect(() => {
    loadCars()
  }, [])

  // Listen for new unclaimed cars (set by CarBuilder)
  useEffect(() => {
    const handler = () => {
      loadCars()
      setDismissed(false)
      setStatus('idle')
      setEmail('')
    }
    window.addEventListener('car-built', handler)
    return () => window.removeEventListener('car-built', handler)
  }, [])

  const handleClaim = async () => {
    if (!email || unclaimedNumbers.length === 0) return
    setStatus('sending')

    try {
      const res = await fetch('/api/cars/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send ALL unclaimed car numbers so every car gets claimed with one magic link
        body: JSON.stringify({ email, car_numbers: unclaimedNumbers }),
      })
      if (res.ok) {
        setStatus('sent')
        // Clear unclaimed tracking — the magic link will associate them server-side
        localStorage.removeItem('unclaimed_car')
        localStorage.removeItem('my_cars')
        window.dispatchEvent(new Event('claim-bar-dismissed'))
      } else {
        const data = await res.json().catch(() => ({}))
        console.error('[EmailClaimBar] claim error:', data)
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (unclaimedNumbers.length === 0 || dismissed) return null

  const carLabel =
    unclaimedNumbers.length > 1
      ? `Cars ${unclaimedNumbers.map((n) => `#${n}`).join(', ')}`
      : `Car #${unclaimedNumbers[0]}`

  if (status === 'sent') {
    return (
      <div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
        style={{ bottom: 'max(5rem, calc(5rem + env(safe-area-inset-bottom)))' }}
      >
        <div className="bg-green-900/90 backdrop-blur-sm border border-green-500/30 rounded-xl px-5 py-3 shadow-2xl">
          <p className="text-green-300 text-sm font-medium">
            Check your email to claim {carLabel}!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-sm w-full px-4"
      style={{ bottom: 'max(6rem, calc(6rem + env(safe-area-inset-bottom)))' }}
    >
      <div className="bg-white/95 backdrop-blur-sm border border-orange-200 rounded-xl px-4 py-3 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-zinc-900 text-sm font-bold">Save {carLabel} to your account</p>
          <button
            onClick={() => {
              setDismissed(true)
              window.dispatchEvent(new Event('claim-bar-dismissed'))
            }}
            className="text-zinc-300 hover:text-zinc-500 text-lg leading-none ml-2"
          >
            &times;
          </button>
        </div>
        <p className="text-zinc-500 text-xs mb-2">
          Enter your email to claim{' '}
          {unclaimedNumbers.length > 1 ? 'your cars' : 'it'} — come back anytime to update{' '}
          {unclaimedNumbers.length > 1 ? 'them' : 'it'} or order physical copies.
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
