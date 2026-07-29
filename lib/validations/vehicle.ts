import { z } from "zod"

export const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  variant: z.string().min(1, "Variant is required"),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  year: z.number().min(2010).max(new Date().getFullYear()),
  kmDriven: z.number().min(0),
  expectedPrice: z.number().min(0),
  description: z.string().optional(),
  warrantyStatus: z.string().optional(),
  photos: z.array(z.string()).min(1, "At least one photo is required"),
})

export const inspectionSchema = z.object({
  ageYears: z.number().min(0).optional(),
  ageMonths: z.number().min(0).max(11).optional(),
  kmDriven: z.number().min(0).optional(),
  bodyDamage: z.string().optional(),
  bodyDamagePhoto: z.string().optional(),
  forkDamage: z.boolean().optional(),
  accidentHistory: z.string().optional(),
  warrantyStatus: z.string().optional(),
  warrantyType: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  partsReplaced: z.boolean().optional(),
  replacedParts: z.string().optional(),
  adminComments: z.string().optional(),
  batteryCharge: z.number().min(0).max(100).optional(),
  batteryHealth: z.number().min(0).max(100).optional(),
  batteryVoltage: z.number().min(0).optional(),
  physicalDamage: z.boolean().optional(),
  brakeSystem: z.string().optional(),
  brakePads: z.string().optional(),
  wheelAlignment: z.string().optional(),
  testDriveRating: z.number().min(1).max(10).optional(),
  testDriveNotes: z.string().optional(),
  techComments: z.string().optional(),
  finalOffer: z.number().min(0).optional(),
})

export const sellerLeadSchema = z.object({
  id: z.string().optional(),
  make: z.string().min(1),
  model: z.string().min(1),
  variant: z.string().min(1),
  vehicleNumber: z.string().min(1),
  year: z.number().min(2010),
  kmDriven: z.number().min(0),
  expectedPrice: z.number().min(0),
  description: z.string().optional(),
  warrantyStatus: z.string().optional(),
  photos: z.array(z.string()).min(1),
})

export const buyerLeadSchema = z.object({
  listingId: z.string().optional(),
  brandsInterested: z.array(z.string()).min(1),
  modelsInterested: z.array(z.string()).min(1),
})

export const bookingSchema = z.object({
  listingId: z.string().optional(),
  sellerLeadId: z.string().optional(),
  buyerLeadId: z.string().optional(),
  scheduledAt: z.string().min(1),
  type: z.enum(["SELLER_INSPECTION", "BUYER_VISIT"]),
})
