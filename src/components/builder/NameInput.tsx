'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { CAR_NAME_MAX_LENGTH } from '@/lib/constants'

interface NameInputProps {
  value: string
  onChange: (name: string) => void
  onValidation: (valid: boolean) => void
}

export default function NameInput({ value, onChange, onValidation }: NameInputProps) {
  const [checking, setChecking] = useState(false)
  const [feedback, setFeedback] = useState<{ safe: boolean; reason?: string } | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const checkName = useCallback(async (name: string) => {
    if (!name.trim()) {
      setFeedback(null)
      onValidation(false)
      return
    }

    setChecking(true)
    try {
      const res = await fetch('/api/filter-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const result = await res.json()
      setFeedback(result)
      onValidation(result.safe)
    } catch {
      // If filter check fails, allow it (server will recheck on submit)
      setFeedback({ safe: true })
      onValidation(true)
    } finally {
      setChecking(false)
    }
  }, [onValidation])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => checkName(value), 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, checkName])

  return (
    <div>
      <h3 className="text-white font-bold text-lg mb-3">Name your car</h3>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={CAR_NAME_MAX_LENGTH}
          placeholder="e.g. Lightning, Thunder, Rocket..."
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {checking && (
            <span className="text-white/30 text-sm">checking...</span>
          )}
          {!checking && feedback && (
            <span className={feedback.safe ? 'text-green-400' : 'text-red-400'}>
              {feedback.safe ? '✓' : '✗'}
            </span>
          )}
        </div>
      </div>
      <div className="flex justify-between mt-1.5">
        <p className="text-xs text-white/30">
          {!checking && feedback && !feedback.safe && (
            <span className="text-red-400">{feedback.reason}</span>
          )}
        </p>
        <p className="text-xs text-white/30">{value.length}/{CAR_NAME_MAX_LENGTH}</p>
      </div>
    </div>
  )
}
