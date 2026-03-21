import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
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

  const cookieStore = await cookies()

  // Use @supabase/ssr createServerClient so cookies are properly read/written.
  // This is required for PKCE flow (exchangeCodeForSession needs the code verifier
  // which is stored in a cookie by the client that initiated the OTP).
  const supabase = createServerClient(
    supabaseUrl,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  let session = null

  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: type as 'email' })
    if (error) {
      console.error('[auth/callback] verifyOtp error:', error.message)
    } else {
      session = data.session
    }
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    } else {
      session = data.session
    }
  }

  // Associate the user with their car(s)
  if (claimCarsParam && session?.user) {
    const carNumbers = claimCarsParam
      .split(',')
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n))

    if (carNumbers.length > 0) {
      // Prefer service key (bypasses RLS entirely). If not set, fall back to the
      // user's own JWT — works once the RLS policy in supabase/fix_claim_rls.sql
      // is applied (allows authenticated users to claim cars where user_id IS NULL).
      const updateClient = serviceKey
        ? createClient(supabaseUrl, serviceKey)
        : createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: `Bearer ${session.access_token}` } },
          })

      const { error: updateError } = await updateClient
        .from('cars')
        .update({ user_id: session.user.id })
        .in('car_number', carNumbers)
        .is('user_id', null)

      if (updateError) {
        console.error('[auth/callback] Failed to claim car(s):', updateError.message)
        return NextResponse.redirect(new URL('/?claim_error=1', request.url))
      }

      return NextResponse.redirect(new URL(`/car/${carNumbers[0]}`, request.url))
    }
  }

  return NextResponse.redirect(new URL('/', request.url))
}
