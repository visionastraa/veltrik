# Indian 2-Wheeler EV Brand & Model Data

## Focus
Veltrik targets the Indian 2-wheeler EV market — Ola, Ather, TVS, Hero, Bajaj, etc.

## Brands & Models

### Ola Electric
| Model | Variants | Battery | Range (IDC) |
|-------|----------|---------|-------------|
| S1 Air | Standard | 2.5 kWh | 125 km |
| S1 Pro | Standard, Gen 2 | 4.0 kWh | 181 km |
| S1 X | Standard, Pro | 3.0 / 4.0 kWh | 151 / 191 km |

### Ather Energy
| Model | Variants | Battery | Range (IDC) |
|-------|----------|---------|-------------|
| 450X | Standard, Pro | 3.7 kWh | 150 km |
| 450S | Standard | 2.9 kWh | 115 km |
| Rizta | Standard, Pro | 2.9 / 3.7 kWh | 123 / 160 km |

### TVS Motor
| Model | Variants | Battery | Range (IDC) |
|-------|----------|---------|-------------|
| iQube | Standard, S, ST | 3.4 / 5.1 kWh | 100 / 150 km |
| iQube S | Standard | 3.4 kWh | 100 km |
| iQube ST | Standard | 5.1 kWh | 150 km |

### Hero MotoCorp
| Model | Variants | Battery | Range (IDC) |
|-------|----------|---------|-------------|
| Vida V1 | Standard, Pro | 3.4 / 4.4 kWh | 143 / 165 km |
| Vida V2 | Standard | 3.4 kWh | 153 km |

### Bajaj Auto
| Model | Variants | Battery | Range (IDC) |
|-------|----------|---------|-------------|
| Chetak | Premium, Urbane | 2.9 / 3.0 kWh | 113 / 123 km |

### Simple Energy
| Model | Variants | Battery | Range (IDC) |
|-------|----------|---------|-------------|
| Dot One | Standard | 4.8 kWh | 151 km |

### Okinawa Autotech
| Model | Variants | Battery | Range (IDC) |
|-------|----------|---------|-------------|
| PraisePro | Standard | 2.5 kWh | 124 km |
| i-Praise+ | Standard | 3.0 kWh | 170 km |
| Ridge+ | Standard | 2.5 kWh | 121 km |

### Ampere
| Model | Variants | Battery | Range (IDC) |
|-------|----------|---------|-------------|
| NXG | Standard | 2.0 kWh | 100 km |
| Magnus EX | Standard | 2.5 kWh | 116 km |

## Usage in Code
```typescript
// lib/brandModels.ts
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

export const BODY_TYPES = ["Scooter", "Motorcycle", "Moped"]
```

## Note on Current Codebase
The inventory page currently shows 4-wheeler brands (Tesla, BYD, Hyundai, BMW, etc.) and the existing `VehicleListing` type includes `price: number` (typically 12L-45L+ range). If Veltrik pivots to 2-wheelers specifically, prices would be 0.5L-2.5L range. Confirm which market segment is the target before replacing brand data.
