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
  const claimCar = requestUrl.searchParams.get('claim_car')

  const cookieStore = await cookies()

  // Use @supabase/ssr createServerClient so cookies are properly read/written.
  // This is required for PKCE flow (exchangeCodeForSession needs the code verifier
  // which is stored in a cookie by the client that initiated the OTP).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Associate the user with their car
  if (claimCar && session?.user) {
    const carNumber = parseInt(claimCar, 10)
    if (!isNaN(carNumber)) {
      const serviceKey = process.env.SUPABASE_SERVICE_KEY
      if (!serviceKey) {
        // Without service key we can't bypass the RLS "user_id = auth.uid()" policy
        // on unclaimed cars (user_id IS NULL). Log loudly so it shows in Vercel logs.
        console.error(
          '[auth/callback] SUPABASE_SERVICE_KEY is not set — cannot claim car. ' +
          'Add SUPABASE_SERVICE_KEY to Vercel environment variables.'
        )
      } else {
        const serviceClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceKey
        )
        const { error: updateError } = await serviceClient
          .from('cars')
          .update({ user_id: session.user.id })
          .eq('car_number', carNumber)
          .is('user_id', null)

        if (updateError) {
          console.error('[auth/callback] Failed to claim car:', updateError.message)
        }
      }

      return NextResponse.redirect(new URL(`/car/${carNumber}`, request.url))
    }
  }

  return NextResponse.redirect(new URL('/', request.url))
}
