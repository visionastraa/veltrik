"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Car, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BRANDS, getModelsByBrand } from "@/lib/brandModels"
import { useSellStore } from "@/store/use-sell-store"
import { cn } from "@/lib/utils"

export default function SellStep1Page() {
  const router = useRouter()
  const { formData, setFormData } = useSellStore()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (field: string, value: any) => setFormData({ [field]: value })

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.make) newErrors.make = "Required"
    if (!formData.model) newErrors.model = "Required"
    if (!formData.variant) newErrors.variant = "Required"
    if (!formData.vehicleNumber) newErrors.vehicleNumber = "Required"
    if (!formData.year || formData.year < 2010) newErrors.year = "Invalid year"
    if (!formData.kmDriven) newErrors.kmDriven = "Required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      router.push('/sell/schedule')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="w-3 h-3" />
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Sell Your EV</span>
            </div>
            <h1 className="text-2xl font-bold">Sell Your EV</h1>
            <p className="text-gray-500">Get the best price for your electric vehicle</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", 1 >= s ? "bg-primary text-white" : "bg-gray-200 text-gray-500")}>{s}</div>
              <span className={cn("text-sm hidden sm:inline", 1 >= s ? "text-primary font-medium" : "text-gray-400")}>
                {s === 1 ? "Vehicle Info" : s === 2 ? "Details & Photos" : "Review"}
              </span>
              {s < 3 && <div className={cn("flex-1 h-0.5", 1 > s ? "bg-primary" : "bg-gray-200")} />}
            </div>
          ))}
        </div>

        <Card className="p-6 border-0 shadow-sm bg-white rounded-xl">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Car className="w-5 h-5 text-primary" />Vehicle Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Make *</Label>
                <Select value={formData.make} onValueChange={(v: string) => { update("make", v); update("model", ""); setErrors(prev => ({ ...prev, make: "" })) }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select brand" /></SelectTrigger>
                  <SelectContent>
                    {BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.make && <p className="text-xs text-red-500 mt-1">{errors.make}</p>}
              </div>
              <div>
                <Label>Model *</Label>
                <Select value={formData.model} onValueChange={(v: string) => { update("model", v); setErrors(prev => ({ ...prev, model: "" })) }} disabled={!formData.make}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder={formData.make ? "Select model" : "Select brand first"} /></SelectTrigger>
                  <SelectContent>
                    {getModelsByBrand(formData.make).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
              </div>
              <div>
                <Label>Variant *</Label>
                <Input className="mt-1" placeholder="e.g. Long Range" value={formData.variant} onChange={(e) => { update("variant", e.target.value); setErrors(prev => ({ ...prev, variant: "" })) }} />
                {errors.variant && <p className="text-xs text-red-500 mt-1">{errors.variant}</p>}
              </div>
              <div>
                <Label>Vehicle Number *</Label>
                <Input className="mt-1" placeholder="e.g. DL 01 AB 1234" value={formData.vehicleNumber} onChange={(e) => { update("vehicleNumber", e.target.value); setErrors(prev => ({ ...prev, vehicleNumber: "" })) }} />
                {errors.vehicleNumber && <p className="text-xs text-red-500 mt-1">{errors.vehicleNumber}</p>}
              </div>
              <div>
                <Label>Year *</Label>
                <Input className="mt-1" type="number" min={2010} max={new Date().getFullYear()} value={formData.year} onChange={(e) => { update("year", parseInt(e.target.value)); setErrors(prev => ({ ...prev, year: "" })) }} />
                {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
              </div>
              <div>
                <Label>Kilometers Driven *</Label>
                <Input className="mt-1" type="number" min={0} placeholder="e.g. 25000" value={formData.kmDriven || ""} onChange={(e) => { update("kmDriven", parseInt(e.target.value) || 0); setErrors(prev => ({ ...prev, kmDriven: "" })) }} />
                {errors.kmDriven && <p className="text-xs text-red-500 mt-1">{errors.kmDriven}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end mt-6 pt-4 border-t">
            <Button className="bg-primary hover:bg-primary-dark text-white" onClick={handleNext}>Next Step</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
