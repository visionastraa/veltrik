export const BRANDS = [
  "Ola Electric",
  "Ather Energy",
  "TVS Motor",
  "Hero MotoCorp",
  "Bajaj Auto",
  "Simple Energy",
  "Okinawa Autotech",
  "Ampere",
] as const

export type Brand = (typeof BRANDS)[number]

export const MODELS_BY_BRAND: Record<string, string[]> = {
  "Ola Electric": ["S1 Air", "S1 Pro", "S1 X"],
  "Ather Energy": ["450X", "450S", "Rizta"],
  "TVS Motor": ["iQube", "iQube S", "iQube ST"],
  "Hero MotoCorp": ["Vida V1", "Vida V2"],
  "Bajaj Auto": ["Chetak"],
  "Simple Energy": ["Dot One"],
  "Okinawa Autotech": ["PraisePro", "i-Praise+", "Ridge+"],
  "Ampere": ["NXG", "Magnus EX"],
}

export const BODY_TYPES = ["Scooter", "Motorcycle", "Moped"] as const

export function getModelsByBrand(brand: string): string[] {
  return MODELS_BY_BRAND[brand] || []
}
