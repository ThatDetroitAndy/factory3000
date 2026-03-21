'use client'

import { PARKING_SPACING, PARKING_COLS } from '@/lib/constants'
import type { Car } from '@/lib/types'
import CarModel from './CarModel'
import CarNameTag from './CarNameTag'
import { isMobileDevice } from '@/lib/isMobile'

interface ParkingLotProps {
  cars: Car[]
  drivenCarNumber?: number | null
}

function getGridPosition(index: number): [number, number, number] {
  const row = Math.floor(index / PARKING_COLS)
  const col = index % PARKING_COLS
  const x = col * PARKING_SPACING - (PARKING_COLS * PARKING_SPACING) / 2
  const z = row * PARKING_SPACING + 50 // buffer zone: belt exit is ~Z=25, first row at Z=50
  return [x, 0, z]
}

const MOBILE_NAME_TAG_LIMIT = 20

export default function ParkingLot({ cars, drivenCarNumber }: ParkingLotProps) {
  const mobile = isMobileDevice()

  return (
    <group>
      {/* Parking lot surface — smooth lighter concrete */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 50 + (Math.ceil(Math.max(cars.length, 1) / PARKING_COLS) * PARKING_SPACING) / 2]}
        receiveShadow
      >
        <planeGeometry
          args={[
            PARKING_COLS * PARKING_SPACING + 20,
            Math.max(Math.ceil(cars.length / PARKING_COLS) * PARKING_SPACING + 20, 50),
          ]}
        />
        <meshStandardMaterial color="#C8B89A" roughness={0.95} metalness={0} />
      </mesh>

      {/* Parking lot border stripes */}
      <mesh position={[0, 0.05, 47]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PARKING_COLS * PARKING_SPACING + 20, 0.5]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Cars — slightly scaled up for visibility */}
      {cars.filter(car => car.car_number !== drivenCarNumber).map((car, i) => {
        const hasCustomPosition = car.parked_x !== 0 || car.parked_z !== 0
        const position: [number, number, number] = hasCustomPosition
          ? [car.parked_x, 0, car.parked_z]
          : getGridPosition(i)

        return (
          <group key={car.id}>
            <CarModel
              carType={car.car_type}
              color={car.color}
              position={position}
              rotation={[0, car.parked_rotation, 0]}
              scale={1.3}
            />
            {(!mobile || i < MOBILE_NAME_TAG_LIMIT) && (
              <CarNameTag
                name={car.name}
                carNumber={car.car_number}
                position={position}
              />
            )}
          </group>
        )
      })}
    </group>
  )
}
