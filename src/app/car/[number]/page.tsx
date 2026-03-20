import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Car } from '@/lib/types'
import { CAR_TYPE_LABELS } from '@/lib/types'
import CarPageClient from './CarPageClient'

async function getCar(carNumber: number): Promise<Car | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase
    .from('cars')
    .select('id, car_number, name, car_type, color, parked_x, parked_z, parked_rotation, created_at')
    .eq('car_number', carNumber)
    .single()

  if (error || !data) return null
  return data
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>
}): Promise<Metadata> {
  const { number } = await params
  const carNumber = parseInt(number, 10)
  const car = await getCar(carNumber)

  if (!car) {
    return { title: 'Car Not Found — Factory 3000' }
  }

  return {
    title: `${car.name} (#${car.car_number}) — Factory 3000`,
    description: `Check out ${car.name}, a ${CAR_TYPE_LABELS[car.car_type]} in the Factory 3000 virtual factory. 1 Subscriber = 1 Car.`,
    openGraph: {
      title: `${car.name} — Car #${car.car_number}`,
      description: `A ${CAR_TYPE_LABELS[car.car_type]} built in Factory 3000`,
      siteName: 'Factory 3000',
    },
  }
}

export default async function CarPage({
  params,
}: {
  params: Promise<{ number: string }>
}) {
  const { number } = await params
  const carNumber = parseInt(number, 10)

  if (isNaN(carNumber)) notFound()

  const car = await getCar(carNumber)
  if (!car) notFound()

  return <CarPageClient car={car} />
}
