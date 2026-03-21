import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * POST /api/cars/claim
 * Sends a magic link to the user's email. When they click it and come back,
 * we'll associate their auth user_id with their car(s).
 * Body: { email: string, car_numbers: number[] }
 *   OR: { email: string, car_number: number }  (legacy single-car form)
 */
export async function POST(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
  const body = await request.json()
  const { email } = body

  // Accept both car_numbers (array) and car_number (single, legacy)
  const carNumbers: number[] = Array.isArray(body.car_numbers)
    ? body.car_numbers
    : body.car_number
    ? [Number(body.car_number)]
    : []

  if (!email || carNumbers.length === 0) {
    return NextResponse.json({ error: 'Email and at least one car number are required' }, { status: 400 })
  }

  // Verify all requested cars exist; skip already-claimed ones (don't error on them)
  const { data: cars, error: carsError } = await supabase
    .from('cars')
    .select('id, car_number, user_id')
    .in('car_number', carNumbers)

  if (carsError) {
    return NextResponse.json({ error: 'Failed to look up cars' }, { status: 500 })
  }

  const unclaimedNumbers = (cars ?? [])
    .filter((c) => !c.user_id)
    .map((c) => c.car_number as number)

  if (unclaimedNumbers.length === 0) {
    return NextResponse.json({ error: 'All specified cars are already claimed' }, { status: 409 })
  }

  // Send one magic link encoding all unclaimed car numbers
  const claimParam = unclaimedNumbers.join(',')
  const anonClient = createClient(supabaseUrl, supabaseAnonKey)
  const { error: authError } = await anonClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${request.nextUrl.origin}/auth/callback?claim_cars=${claimParam}`,
    },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, car_numbers: unclaimedNumbers })
}
