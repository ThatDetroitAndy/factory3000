import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * POST /api/cars/claim
 * Sends a magic link to the user's email. When they click it and come back,
 * we'll associate their auth user_id with their car.
 * Body: { email: string, car_number: number }
 */
export async function POST(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
  const body = await request.json()
  const { email, car_number } = body

  if (!email || !car_number) {
    return NextResponse.json({ error: 'Email and car number are required' }, { status: 400 })
  }

  // Verify the car exists and is unclaimed
  const { data: car, error: carError } = await supabase
    .from('cars')
    .select('id, user_id')
    .eq('car_number', car_number)
    .single()

  if (carError || !car) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 })
  }

  if (car.user_id) {
    return NextResponse.json({ error: 'Car is already claimed' }, { status: 409 })
  }

  // Send magic link — when user clicks it, they'll be authenticated
  // The auth callback will handle associating the user with the car
  const anonClient = createClient(supabaseUrl, supabaseAnonKey)
  const { error: authError } = await anonClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${request.nextUrl.origin}/auth/callback?claim_car=${car_number}`,
    },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
