export interface Vehicle {
  id: string
  title: string
  price: number
  status: string
  photos: string[]
  publishedAt: string | null
  createdAt: string
  inspection: InspectionData
}

export interface InspectionData {
  id: string
  ageYears: number | null
  ageMonths: number | null
  kmDriven: number | null
  batteryHealth: number | null
  batteryCharge: number | null
  batteryVoltage: number | null
  bodyDamage: string | null
  accidentHistory: string | null
  warrantyStatus: string | null
  testDriveRating: number | null
  testDriveNotes: string | null
  finalOffer: number | null
  sellerLead: SellerLeadData
}

export interface SellerLeadData {
  id: string
  make: string
  model: string
  variant: string
  vehicleNumber: string
  year: number
  kmDriven: number
  expectedPrice: number
  description: string | null
  photos: string[]
  status: string
  createdAt: string
}

export interface BuyerLeadData {
  id: string
  userId: string
  user?: UserData
  listingId: string | null
  brandsInterested: string[]
  modelsInterested: string[]
  status: string
  createdAt: string
}

export interface BookingData {
  id: string
  type: string
  scheduledAt: string
  status: string
  listing?: Vehicle
  amount?: number
}

export interface OrderData {
  id: string
  listing?: Vehicle
  amount: number
  status: string
}

export interface UserData {
  id: string
  name: string
  email: string
  role: string
  image?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  total?: number
  page?: number
  limit?: number
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string | null
      email: string | null
      image: string | null
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    id?: string
  }
}
