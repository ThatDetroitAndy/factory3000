import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  // Support comma-separated list of car numbers (e.g. claim_cars=42,87)
  const claimCarsParam = requestUrl.searchParams.get('claim_cars') || requestUrl.searchParams.get('claim_car')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  const supabase = createClient(supabaseUrl, anonKey)

  let session = null

  if (token_hash && type) {
    const { data } = await supabase.auth.verifyOtp({ token_hash, type: type as 'email' })
    session = data.session
  } else if (code) {
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    session = data.session
  }

  // If this is a car claim callback, associate the user with their car(s)
  if (claimCarsParam && session?.user) {
    const carNumbers = claimCarsParam
      .split(',')
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n))

    if (carNumbers.length > 0) {
      // Prefer service key (bypasses RLS). If not set, use user's own JWT so RLS
      // policy "allow claim where user_id IS NULL" can permit the update.
      const updateClient = serviceKey
        ? createClient(supabaseUrl, serviceKey)
        : createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: `Bearer ${session.access_token}` } },
          })

      const { error } = await updateClient
        .from('cars')
        .update({ user_id: session.user.id })
        .in('car_number', carNumbers)
        .is('user_id', null)

      if (error) {
        console.error('[auth/callback] Failed to claim car(s):', error.message)
        // Redirect home with an error flag so the UI can show a message
        return NextResponse.redirect(new URL('/?claim_error=1', request.url))
      }

      // Redirect to the first car's page
      return NextResponse.redirect(new URL(`/car/${carNumbers[0]}`, request.url))
    }
  }

  return NextResponse.redirect(new URL('/', request.url))
}
