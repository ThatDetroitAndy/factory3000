import { createClient } from '@supabase/supabase-js'
import FactoryApp from '@/components/FactoryApp'

async function getCarCount(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return 0

  try {
    const supabase = createClient(url, key)
    const { count, error } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })

    if (error || count === null) return 0
    return count
  } catch {
    return 0
  }
}

export const revalidate = 30

export default async function Home() {
  const carCount = await getCarCount()

  return (
    <main className="relative w-screen h-[100dvh] overflow-hidden bg-black">
      <FactoryApp initialCarCount={carCount} />
    </main>
  )
}
