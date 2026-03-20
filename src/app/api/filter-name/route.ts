import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isNameSafe } from '@/lib/name-filter'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name } = body

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ safe: false, reason: 'Name is required' })
  }

  const result = await isNameSafe(name.trim())
  return NextResponse.json(result)
}
