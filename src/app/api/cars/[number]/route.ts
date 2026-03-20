import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params
  const carNumber = parseInt(number, 10)

  if (isNaN(carNumber)) {
    return NextResponse.json({ error: 'Invalid car number' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('cars')
    .select('id, car_number, name, car_type, color, parked_x, parked_z, parked_rotation, created_at')
    .eq('car_number', carNumber)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 })
  }

  return NextResponse.json({ car: data })
}
