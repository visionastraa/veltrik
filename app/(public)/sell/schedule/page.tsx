"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhotoUploadDropzone } from "@/components/ui/PhotoUploadDropzone"
import { generateTimeSlots, getMinDate, getMaxDate } from "@/lib/slots"
import { useSellStore } from "@/store/use-sell-store"
import { cn } from "@/lib/utils"

export default function SellStep2Page() {
  const router = useRouter()
  const { formData, setFormData } = useSellStore()
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (field: string, value: any) => setFormData({ [field]: value })

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.expectedPrice || formData.expectedPrice <= 0) newErrors.expectedPrice = "Required"
    if (formData.photos.length === 0) newErrors.photos = "At least one photo required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      router.push('/sell/confirm')
    }
  }

  const handleUpload = async (files: File[]) => {
    setUploading(true)
    try {
      for (const file of files) {
        const payload = new FormData()
        payload.append("file", file)
        payload.append("folder", "seller-leads")
        if (formData.id) {
          payload.append("entityId", formData.id)
        }
        const res = await fetch("/api/upload", { method: "POST", body: payload })
        const data = await res.json()
        if (data.success) {
          setFormData({ photos: [...formData.photos, data.url] })
        }
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveExisting = (index: number) => {
    setFormData({
      photos: formData.photos.filter((_, i) => i !== index)
    })
  }

  const availableSlots = formData.selectedDate ? generateTimeSlots(new Date(formData.selectedDate + "T00:00:00")) : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/sell">
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
            <h1 className="text-2xl font-bold">Details & Photos</h1>
            <p className="text-gray-500">Provide more details and schedule an inspection</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", 2 >= s ? "bg-primary text-white" : "bg-gray-200 text-gray-500")}>{s}</div>
              <span className={cn("text-sm hidden sm:inline", 2 >= s ? "text-primary font-medium" : "text-gray-400")}>
                {s === 1 ? "Vehicle Info" : s === 2 ? "Details & Photos" : "Review"}
              </span>
              {s < 3 && <div className={cn("flex-1 h-0.5", 2 > s ? "bg-primary" : "bg-gray-200")} />}
            </div>
          ))}
        </div>

        <Card className="p-6 border-0 shadow-sm bg-white rounded-xl">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Expected Price (INR) *</Label>
                <Input className="mt-1" type="number" min={0} placeholder="e.g. 3500000" value={formData.expectedPrice || ""} onChange={(e) => { update("expectedPrice", parseInt(e.target.value) || 0); setErrors(prev => ({ ...prev, expectedPrice: "" })) }} />
                {errors.expectedPrice && <p className="text-xs text-red-500 mt-1">{errors.expectedPrice}</p>}
              </div>
              <div><Label>Warranty Status</Label><Input className="mt-1" placeholder="e.g. Active until 2027" value={formData.warrantyStatus} onChange={(e) => update("warrantyStatus", e.target.value)} /></div>
            </div>
            <div><Label>Description</Label><textarea className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]" placeholder="Tell us about your vehicle&apos;s condition, features, etc." value={formData.description} onChange={(e) => update("description", e.target.value)} /></div>

            {/* Photo Upload */}
            <div>
              <Label>Photos *</Label>
              <p className="text-sm text-gray-500 mt-1">Upload photos of your vehicle (front, back, sides, interior)</p>
              <PhotoUploadDropzone
                onUpload={handleUpload}
                existingUrls={formData.photos}
                onRemoveExisting={handleRemoveExisting}
                className="mt-2"
              />
              {uploading && <p className="text-xs text-primary mt-1">Uploading...</p>}
              {errors.photos && <p className="text-xs text-red-500 mt-1">{errors.photos}</p>}
            </div>

            {/* Schedule Inspection */}
            <div>
              <Label className="text-base font-medium">Schedule Inspection</Label>
              <p className="text-sm text-gray-500 mt-1">Pick a preferred date and time for the inspection</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    min={getMinDate()}
                    max={getMaxDate()}
                    value={formData.selectedDate}
                    onChange={(e) => { update("selectedDate", e.target.value); update("selectedSlot", "") }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Time Slot</Label>
                  <Select value={formData.selectedSlot} onValueChange={(v) => update("selectedSlot", v)} disabled={!formData.selectedDate}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={formData.selectedDate ? "Select time" : "Pick a date first"} /></SelectTrigger>
                    <SelectContent>
                      {availableSlots.map(slot => (
                        <SelectItem key={slot.value} value={slot.value} disabled={!slot.available}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Link href="/sell">
              <Button variant="outline">Previous</Button>
            </Link>
            <Button className="bg-primary hover:bg-primary-dark text-white" onClick={handleNext}>Next Step</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
