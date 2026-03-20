export type CarType = 'car1' | 'car2' | 'car3'

export interface Car {
  id: string
  car_number: number
  name: string
  car_type: CarType
  color: string
  parked_x: number
  parked_z: number
  parked_rotation: number
  created_at: string
}

export const CAR_TYPE_LABELS: Record<CarType, string> = {
  car1: 'Car 1',
  car2: 'Car 2',
  car3: 'Car 3',
}
