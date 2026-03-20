import { createClient } from '@supabase/supabase-js'
import FactoryApp from '@/components/FactoryApp'
import type { Car } from '@/lib/types'

// Mock data fallback for local dev
const MOCK_CARS: Car[] = [
  { id: '1', car_number: 1, name: 'Lightning', car_type: 'car1', color: '#FF6B6B', parked_x: 0, parked_z: 0, parked_rotation: 0, created_at: '2026-03-20' },
  { id: '2', car_number: 2, name: 'Thunder', car_type: 'car2', color: '#4ECDC4', parked_x: 0, parked_z: 0, parked_rotation: 0, created_at: '2026-03-20' },
  { id: '3', car_number: 3, name: 'Shadow', car_type: 'car3', color: '#C47AFF', parked_x: 0, parked_z: 0, parked_rotation: 0, created_at: '2026-03-20' },
  { id: '4', car_number: 4, name: 'Blaze', car_type: 'car1', color: '#FFA07A', parked_x: 0, parked_z: 0, parked_rotation: 0, created_at: '2026-03-20' },
  { id: '5', car_number: 5, name: 'Rocket', car_type: 'car2', color: '#FFE66D', parked_x: 0, parked_z: 0, parked_rotation: 0, created_at: '2026-03-20' },
  { id: '6', car_number: 6, name: 'Storm', car_type: 'car3', color: '#95E86E', parked_x: 0, parked_z: 0, parked_rotation: 0, created_at: '2026-03-20' },
  { id: '7', car_number: 7, name: 'Nitro', car_type: 'car1', color: '#FF9FF3', parked_x: 0, parked_z: 0, parked_rotation: 0, created_at: '2026-03-20' },
  { id: '8', car_number: 8, name: 'Turbo', car_type: 'car2', color: '#F0F0F0', parked_x: 0, parked_z: 0, parked_rotation: 0, created_at: '2026-03-20' },
]

async function getCars(): Promise<Car[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return MOCK_CARS

  try {
    const supabase = createClient(url, key)
    const { data, error } = await supabase
      .from('cars')
      .select('id, car_number, name, car_type, color, parked_x, parked_z, parked_rotation, created_at')
      .order('car_number', { ascending: true })

    if (error || !data) return MOCK_CARS
    return data.length > 0 ? data : MOCK_CARS
  } catch {
    return MOCK_CARS
  }
}

export const revalidate = 30

export default async function Home() {
  const cars = await getCars()

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      <FactoryApp initialCars={cars} />
    </main>
  )
}
