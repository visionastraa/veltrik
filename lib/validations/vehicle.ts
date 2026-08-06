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
  make: z.string().trim().min(1),
  model: z.string().trim().min(1),
  variant: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[\p{L}\p{N} .,'#&()\-/\\+]+$/u, "Variant contains invalid characters"),
  vehicleNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, "").toUpperCase())
    .pipe(z.string().regex(/^[A-Z]{2}[0-9]{1,3}[A-Z]{1,3}[0-9]{4}$/, "Enter a valid registration number (e.g. KA 01 AB 1234)")),
  year: z.number().int("Enter a valid year (e.g. 2023)").min(2010, "Year must be 2010 or later").max(new Date().getFullYear(), "Year cannot be in the future"),
  kmDriven: z.number().int("Enter the kilometers driven (e.g. 25000)").min(0, "Kilometers driven cannot be negative").max(999999, "Kilometers driven seems too high"),
  expectedPrice: z.number("Enter a valid price in INR (e.g. 3500000)").min(0, "Expected price cannot be negative").max(10000000, "Expected price seems too high"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  warrantyStatus: z.string().trim().max(100).optional().or(z.literal("")),
  photos: z.array(z.string()).min(1, "At least one photo is required"),
  selectedDate: z.string().optional(),
  selectedSlot: z.string().optional(),
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
