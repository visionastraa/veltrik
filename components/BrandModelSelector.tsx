"use client"

import { useState } from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { BRANDS, MODELS_BY_BRAND, getModelsByBrand } from "@/lib/brandModels"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface BrandModelSelectorProps {
  selectedBrands: string[]
  selectedModels: string[]
  onBrandsChange: (brands: string[]) => void
  onModelsChange: (models: string[]) => void
  className?: string
}

export function BrandModelSelector({
  selectedBrands,
  selectedModels,
  onBrandsChange,
  onModelsChange,
  className,
}: BrandModelSelectorProps) {
  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      const nextBrands = selectedBrands.filter((b) => b !== brand)
      onBrandsChange(nextBrands)
      // Filter out models belonging to removed brand
      const removedBrandModels = getModelsByBrand(brand)
      onModelsChange(selectedModels.filter((m) => !removedBrandModels.includes(m)))
    } else {
      onBrandsChange([...selectedBrands, brand])
    }
  }

  const toggleModel = (model: string) => {
    if (selectedModels.includes(model)) {
      onModelsChange(selectedModels.filter((m) => m !== model))
    } else {
      onModelsChange([...selectedModels, model])
    }
  }

  // Available models derived from selected brands
  const availableModels = selectedBrands.length > 0
    ? selectedBrands.flatMap((b) => getModelsByBrand(b))
    : Object.values(MODELS_BY_BRAND).flat()

  return (
    <div className={cn("space-y-4", className)}>
      {/* Brands Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700">Select Brands</Label>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((brand) => {
            const isSelected = selectedBrands.includes(brand)
            return (
              <button
                key={brand}
                type="button"
                onClick={() => toggleBrand(brand)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5",
                  isSelected
                    ? "bg-primary/10 border-primary text-primary shadow-sm"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                {brand}
              </button>
            )
          })}
        </div>
      </div>

      {/* Models Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700">
          Select Models {selectedBrands.length > 0 && <span className="text-xs font-normal text-gray-500">(Filtered by brand)</span>}
        </Label>
        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50/50">
          {availableModels.map((model) => {
            const isSelected = selectedModels.includes(model)
            return (
              <button
                key={model}
                type="button"
                onClick={() => toggleModel(model)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1",
                  isSelected
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-700"
                    : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-emerald-600" />}
                {model}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Summary Tags */}
      {(selectedBrands.length > 0 || selectedModels.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-medium mr-1">Selected:</span>
          {selectedBrands.map((b) => (
            <Badge key={b} variant="secondary" className="text-xs bg-primary/10 text-primary border-none flex items-center gap-1">
              {b}
              <X className="w-3 h-3 cursor-pointer hover:text-primary-dark" onClick={() => toggleBrand(b)} />
            </Badge>
          ))}
          {selectedModels.map((m) => (
            <Badge key={m} variant="outline" className="text-xs border-emerald-200 bg-emerald-50 text-emerald-700 flex items-center gap-1">
              {m}
              <X className="w-3 h-3 cursor-pointer hover:text-emerald-900" onClick={() => toggleModel(m)} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
