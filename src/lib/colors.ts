export const CAR_COLORS = [
  { name: 'Red', hex: '#FF6B6B' },
  { name: 'Blue', hex: '#4ECDC4' },
  { name: 'Yellow', hex: '#FFE66D' },
  { name: 'Green', hex: '#95E86E' },
  { name: 'Purple', hex: '#C47AFF' },
  { name: 'Orange', hex: '#FFA07A' },
  { name: 'Pink', hex: '#FF9FF3' },
  { name: 'White', hex: '#F0F0F0' },
] as const

export type CarColor = (typeof CAR_COLORS)[number]['hex']
