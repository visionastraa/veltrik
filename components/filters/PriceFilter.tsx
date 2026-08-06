"use client"

import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

export const MAX_PRICE = 10000000

export const PRICE_BANDS = [
  { label: "All", min: 0, max: MAX_PRICE },
  { label: "Up to ₹10L", min: 0, max: 1000000 },
  { label: "Up to ₹20L", min: 0, max: 2000000 },
  { label: "Up to ₹30L", min: 0, max: 3000000 },
  { label: "Up to ₹50L", min: 0, max: 5000000 },
]

const formatL = (v: number) => `₹${(v / 100000).toFixed(0)}L`

export function formatPriceRange(min: number, max: number) {
  if (min === 0 && max >= MAX_PRICE) return "Any price"
  if (min === 0) return `Up to ${formatL(max)}`
  if (max >= MAX_PRICE) return `${formatL(min)}+`
  return `${formatL(min)} - ${formatL(max)}`
}

interface PriceFilterProps {
  range: [number, number]
  onChange: (range: [number, number]) => void
  className?: string
}

export function PriceFilter({ range, onChange, className }: PriceFilterProps) {
  const [min, max] = range
  const isFull = min === 0 && max >= MAX_PRICE

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {PRICE_BANDS.map((b) => {
          const active = min === b.min && max === b.max
          return (
            <button
              key={b.label}
              type="button"
              onClick={() => onChange([b.min, b.max])}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                active
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-primary hover:bg-primary/5"
              )}
            >
              {b.label}
            </button>
          )
        })}
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-sm font-semibold text-gray-900">{formatPriceRange(min, max)}</span>
        {!isFull && (
          <button
            type="button"
            onClick={() => onChange([0, MAX_PRICE])}
            className="text-xs text-primary hover:underline"
          >
            Reset
          </button>
        )}
      </div>
      <Slider
        value={[max]}
        min={0}
        max={MAX_PRICE}
        step={100000}
        onValueChange={(v) => onChange([min, v[0]])}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>₹0</span>
        <span>₹50L</span>
        <span>₹1Cr+</span>
      </div>
    </div>
  )
}
