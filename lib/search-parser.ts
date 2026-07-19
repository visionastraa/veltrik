const KNOWN_BRANDS = [
  "Tesla", "BYD", "Hyundai", "BMW", "Mercedes", "Kia", "MG", "Tata", "Mahindra",
  "Volvo", "Audi", "Porsche", "Ford", "Chevrolet", "Nissan", "Toyota", "Honda",
]

const BODY_TYPES = ["SUV", "Sedan", "Hatchback", "Coupe", "MPV"]

export interface ParsedSearch {
  text: string
  brand: string
  bodyType: string
  maxPrice: number | null
  minPrice: number | null
  minBattery: number | null
  year: number | null
  sortBy: string
}

export function parseSearchQuery(query: string): ParsedSearch {
  const lower = query.toLowerCase()
  let brand = ""
  let bodyType = ""
  let maxPrice: number | null = null
  let minPrice: number | null = null
  let minBattery: number | null = null
  let year: number | null = null
  let sortBy = "newest"

  // Extract brand
  for (const b of KNOWN_BRANDS) {
    if (lower.includes(b.toLowerCase())) {
      brand = b
      break
    }
  }

  // Extract body type
  for (const bt of BODY_TYPES) {
    if (lower.includes(bt.toLowerCase())) {
      bodyType = bt
      break
    }
  }

  // Extract price: "under 25L", "below 20 lakhs", "under 2000000", "under 2500000", "< 20L"
  const priceUnderMatch = lower.match(/(?:under|below|less than|<|max|upto|up to)\s*(\d+(?:\.\d+)?)\s*(?:l|lakhs?|lac|lakh)?/)
  if (priceUnderMatch) {
    const val = parseFloat(priceUnderMatch[1])
    maxPrice = val < 100 ? val * 100000 : val // auto-detect L vs raw
  }

  // Extract min price: "above 10L", "over 15 lakhs", ">= 10L"
  const priceOverMatch = lower.match(/(?:above|over|more than|>|min|at least|from)\s*(\d+(?:\.\d+)?)\s*(?:l|lakhs?|lac|lakh)?/)
  if (priceOverMatch) {
    const val = parseFloat(priceOverMatch[1])
    minPrice = val < 100 ? val * 100000 : val
  }

  // Extract battery/range: "long range", "80% battery", "high battery", "above 80% battery"
  if (lower.includes("long range")) {
    minBattery = 80
  } else if (lower.includes("short range") || lower.includes("low range")) {
    minBattery = 0 // no constraint
  } else {
    const batteryMatch = lower.match(/(?:battery|range)\s*(?:above|over|>|at least|min)?\s*(\d+)\s*%?/)
    if (batteryMatch) minBattery = parseInt(batteryMatch[1])
    if (!batteryMatch) {
      const batteryMatch2 = lower.match(/(\d+)\s*%?\s*(?:battery|range)/)
      if (batteryMatch2) minBattery = parseInt(batteryMatch2[1])
    }
  }

  // Extract year: "2023", "2024 model", "year 2023"
  const yearMatch = lower.match(/(?:year\s*)?(20[2-3]\d)\b/)
  if (yearMatch) year = parseInt(yearMatch[1])

  // Extract sort
  if (lower.includes("cheapest") || lower.includes("low price") || lower.includes("price low")) sortBy = "price_low"
  else if (lower.includes("expensive") || lower.includes("high price") || lower.includes("price high")) sortBy = "price_high"
  else if (lower.includes("best battery") || lower.includes("highest battery") || lower.includes("best condition")) sortBy = "battery"
  else if (lower.includes("newest") || lower.includes("newest first")) sortBy = "newest"
  else if (lower.includes("lowest km") || lower.includes("least driven") || lower.includes("fewer km")) sortBy = "km"

  // Clean search text: remove parsed tokens to get remaining text for keyword search
  let text = query
  const tokensToRemove = [
    ...(brand ? [brand] : []),
    ...(bodyType ? [bodyType] : []),
    /(?:under|below|less than|<|max|upto|up to|above|over|more than|>|min|at least|from)\s*\d+(?:\.\d+)?\s*(?:l|lakhs?|lac|lakh)?/gi,
    /\d+\s*%?\s*(?:battery|range)/gi,
    /(?:long|short|high|low)\s*range/gi,
    /(?:battery|range)\s*(?:above|over|>|at least|min)?\s*\d+\s*%?/gi,
    /(?:year\s*)?20[2-3]\d/gi,
    /(?:cheapest|expensive|newest|best battery|highest battery|lowest km|least driven|fewer km|low price|high price|price low|price high)/gi,
  ]
  for (const token of tokensToRemove) {
    if (typeof token === "string") {
      text = text.replace(new RegExp(token, "gi"), " ")
    } else {
      text = text.replace(token, " ")
    }
  }
  text = text.replace(/\s+/g, " ").trim()

  return { text, brand, bodyType, maxPrice, minPrice, minBattery, year, sortBy }
}

export const SEARCH_SUGGESTIONS = [
  { label: "Tesla under 25L", query: "Tesla under 25L" },
  { label: "Long range SUV", query: "long range SUV" },
  { label: "BYD under 20L", query: "BYD under 20L" },
  { label: "Best battery above 90%", query: "best battery above 90% battery" },
  { label: "Cheap sedans", query: "cheapest sedan" },
  { label: "BMW 2024", query: "BMW 2024" },
  { label: "Tata EV", query: "Tata" },
  { label: "Kia SUV under 30L", query: "Kia SUV under 30L" },
]
