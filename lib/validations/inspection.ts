import { z } from "zod"

export const inspectionSubmitSchema = z.object({
  sellerLeadId: z.string().min(1),
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

export type InspectionSubmitInput = z.infer<typeof inspectionSubmitSchema>
