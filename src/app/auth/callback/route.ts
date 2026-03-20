import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const claimCar = requestUrl.searchParams.get('claim_car')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let session = null

  if (token_hash && type) {
    const { data } = await supabase.auth.verifyOtp({ token_hash, type: type as 'email' })
    session = data.session
  } else if (code) {
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    session = data.session
  }

  // If this is a car claim callback, associate the user with the car
  if (claimCar && session?.user) {
    const carNumber = parseInt(claimCar, 10)
    if (!isNaN(carNumber)) {
      const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Only claim if the car is still unclaimed
      await serviceClient
        .from('cars')
        .update({ user_id: session.user.id })
        .eq('car_number', carNumber)
        .is('user_id', null)

      return NextResponse.redirect(new URL(`/car/${carNumber}`, request.url))
    }
  }

  return NextResponse.redirect(new URL('/', request.url))
}
