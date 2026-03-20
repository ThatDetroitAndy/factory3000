import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isNameSafe } from '@/lib/name-filter'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const VALID_CAR_TYPES = ['car1', 'car2', 'car3']
const VALID_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E86E', '#C47AFF', '#FFA07A', '#FF9FF3', '#F0F0F0']

// GET — list all cars (public)
export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await supabase
    .from('cars')
    .select('id, car_number, name, car_type, color, parked_x, parked_z, parked_rotation, created_at')
    .order('car_number', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ cars: data })
}

// POST — register a new car (no auth required)
export async function POST(request: NextRequest) {
  // Use service key for inserts (bypasses RLS)
  if (!supabaseServiceKey) {
    console.warn('[POST /api/cars] SUPABASE_SERVICE_KEY not set — falling back to anon key. Insert may fail if RLS blocks anonymous writes.')
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)

  const body = await request.json()
  const { name, car_type, color, email } = body

  // Validate car_type
  if (!VALID_CAR_TYPES.includes(car_type)) {
    return NextResponse.json({ error: 'Invalid car type' }, { status: 400 })
  }

  // Validate color
  if (!VALID_COLORS.includes(color)) {
    return NextResponse.json({ error: 'Invalid color' }, { status: 400 })
  }

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  // Check name safety
  const nameCheck = await isNameSafe(name.trim())
  if (!nameCheck.safe) {
    return NextResponse.json({ error: nameCheck.reason }, { status: 400 })
  }

  // If email provided, check if user already has a car via auth
  let userId: string | null = null
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (user) {
      userId = user.id
      // Check if this user already has a car
      const { data: existing } = await supabase
        .from('cars')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (existing) {
        return NextResponse.json({ error: 'You already have a car' }, { status: 409 })
      }
    }
  }

  // Insert the car (user_id is null for anonymous builds)
  const { data: car, error: insertError } = await supabase
    .from('cars')
    .insert({
      user_id: userId,
      name: name.trim(),
      car_type,
      color,
      parked_x: 0,
      parked_z: 0,
      parked_rotation: 0,
    })
    .select('id, car_number, name, car_type, color, parked_x, parked_z, parked_rotation, created_at')
    .single()

  if (insertError) {
    console.error('[POST /api/cars] Insert error:', insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ car }, { status: 201 })
}
