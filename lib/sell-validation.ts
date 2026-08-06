import { sellerLeadSchema } from "@/lib/validations/vehicle"

export type FieldErrors = Record<string, string>

const shape = sellerLeadSchema.shape
type Field = keyof typeof shape

export const inputErrorClass = "border-red-500 focus-visible:ring-red-500"
export const selectErrorClass = "border-red-500 focus:ring-red-500"

function zodError(field: Field, value: unknown): string | undefined {
  const schema = shape[field]
  const result = schema.safeParse(value)
  if (result.success) return undefined
  return result.error.issues[0]?.message ?? "Invalid value"
}

function requiredText(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim() === "") return "Required"
  return undefined
}

function numberError(field: Field, value: unknown, emptyMessage: string): string | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return emptyMessage
  return zodError(field, value)
}

export function validateStep1Field(field: string, value: unknown): string | undefined {
  switch (field) {
    case "make":
    case "model":
      return requiredText(value)
    case "variant":
    case "vehicleNumber": {
      const required = requiredText(value)
      if (required) return required
      return zodError(field as Field, value)
    }
    case "year":
      return numberError("year", value, "Enter a valid year (e.g. 2023)")
    case "kmDriven":
      return numberError("kmDriven", value, "Enter the kilometers driven (e.g. 25000)")
    default:
      return undefined
  }
}

export function validateStep1(form: {
  make: string
  model: string
  variant: string
  vehicleNumber: string
  year: number
  kmDriven: number
}): FieldErrors {
  const errors: FieldErrors = {}
  for (const field of ["make", "model", "variant", "vehicleNumber", "year", "kmDriven"] as const) {
    const err = validateStep1Field(field, form[field])
    if (err) errors[field] = err
  }
  return errors
}

export function validateStep2Field(field: string, value: unknown): string | undefined {
  switch (field) {
    case "expectedPrice":
      return numberError("expectedPrice", value, "Enter a valid price in INR (e.g. 3500000)")
    case "photos":
      if (!Array.isArray(value) || value.length === 0) return "At least one photo is required"
      return undefined
    default:
      return undefined
  }
}

export function validateStep2(form: {
  expectedPrice: number
  photos: string[]
  selectedDate: string
  selectedSlot: string
}): FieldErrors {
  const errors: FieldErrors = {}
  for (const field of ["expectedPrice", "photos"] as const) {
    const err = validateStep2Field(field, form[field])
    if (err) errors[field] = err
  }
  if (form.selectedDate && !form.selectedSlot) errors.selectedSlot = "Select a time slot"
  return errors
}
