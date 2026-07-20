"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Car, Loader2, CheckCircle, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSubmitSeller } from "@/hooks/use-api"
import { PhotoUploadDropzone } from "@/components/ui/PhotoUploadDropzone"
import { generateTimeSlots, getMinDate, getMaxDate } from "@/lib/slots"
import { BRANDS, getModelsByBrand } from "@/lib/brandModels"
import { cn } from "@/lib/utils"

export default function SellPage() {
  const router = useRouter()
  const submitMutation = useSubmitSeller()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    make: '', model: '', variant: '', vehicleNumber: '',
    year: new Date().getFullYear(), kmDriven: 0, expectedPrice: 0,
    description: '', warrantyStatus: '', photos: [] as string[]
  })
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState("")
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {}
    if (s === 1) {
      if (!form.make) newErrors.make = "Required"
      if (!form.model) newErrors.model = "Required"
      if (!form.variant) newErrors.variant = "Required"
      if (!form.vehicleNumber) newErrors.vehicleNumber = "Required"
      if (!form.year || form.year < 2010) newErrors.year = "Invalid year"
      if (!form.kmDriven) newErrors.kmDriven = "Required"
    }
    if (s === 2) {
      if (!form.expectedPrice || form.expectedPrice <= 0) newErrors.expectedPrice = "Required"
      if (form.photos.length === 0) newErrors.photos = "At least one photo required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) setStep(s => s + 1)
  }

  const handleUpload = async (files: File[]) => {
    setUploading(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        const data = await res.json()
        if (data.success) {
          setForm(prev => ({ ...prev, photos: [...prev.photos, data.url] }))
        }
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveExisting = (index: number) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = () => {
    if (!validateStep(2)) return
    submitMutation.mutate(form, {
      onSuccess: (data) => {
        if (data.success) setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md border-0 shadow-sm bg-white rounded-xl">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Vehicle Submitted!</h2>
          <p className="text-gray-500 mb-6">Your vehicle has been submitted for inspection. We&apos;ll review it and get back to you soon.</p>
          <Link href="/user"><Button className="bg-primary hover:bg-primary-dark text-white">Back to Dashboard</Button></Link>
        </Card>
      </div>
    )
  }

  const availableSlots = selectedDate ? generateTimeSlots(new Date(selectedDate + "T00:00:00")) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/user">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Link href="/user" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  Dashboard
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
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step >= s ? "bg-primary text-white" : "bg-gray-200 text-gray-500")}>{s}</div>
                <span className={cn("text-sm hidden sm:inline", step >= s ? "text-primary font-medium" : "text-gray-400")}>
                  {s === 1 ? "Vehicle Info" : s === 2 ? "Details & Photos" : "Review"}
                </span>
                {s < 3 && <div className={cn("flex-1 h-0.5", step > s ? "bg-primary" : "bg-gray-200")} />}
              </div>
            ))}
          </div>

          <Card className="p-6 border-0 shadow-sm bg-white rounded-xl">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Car className="w-5 h-5 text-primary" />Vehicle Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Make *</Label>
                    <Select value={form.make} onValueChange={(v) => { update("make", v); update("model", ""); setErrors(prev => ({ ...prev, make: "" })) }}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select brand" /></SelectTrigger>
                      <SelectContent>
                        {BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.make && <p className="text-xs text-red-500 mt-1">{errors.make}</p>}
                  </div>
                  <div>
                    <Label>Model *</Label>
                    <Select value={form.model} onValueChange={(v) => { update("model", v); setErrors(prev => ({ ...prev, model: "" })) }} disabled={!form.make}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder={form.make ? "Select model" : "Select brand first"} /></SelectTrigger>
                      <SelectContent>
                        {getModelsByBrand(form.make).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
                  </div>
                  <div>
                    <Label>Variant *</Label>
                    <Input className="mt-1" placeholder="e.g. Long Range" value={form.variant} onChange={(e) => { update("variant", e.target.value); setErrors(prev => ({ ...prev, variant: "" })) }} />
                    {errors.variant && <p className="text-xs text-red-500 mt-1">{errors.variant}</p>}
                  </div>
                  <div>
                    <Label>Vehicle Number *</Label>
                    <Input className="mt-1" placeholder="e.g. DL 01 AB 1234" value={form.vehicleNumber} onChange={(e) => { update("vehicleNumber", e.target.value); setErrors(prev => ({ ...prev, vehicleNumber: "" })) }} />
                    {errors.vehicleNumber && <p className="text-xs text-red-500 mt-1">{errors.vehicleNumber}</p>}
                  </div>
                  <div>
                    <Label>Year *</Label>
                    <Input className="mt-1" type="number" min={2010} max={new Date().getFullYear()} value={form.year} onChange={(e) => { update("year", parseInt(e.target.value)); setErrors(prev => ({ ...prev, year: "" })) }} />
                    {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
                  </div>
                  <div>
                    <Label>Kilometers Driven *</Label>
                    <Input className="mt-1" type="number" min={0} placeholder="e.g. 25000" value={form.kmDriven || ""} onChange={(e) => { update("kmDriven", parseInt(e.target.value) || 0); setErrors(prev => ({ ...prev, kmDriven: "" })) }} />
                    {errors.kmDriven && <p className="text-xs text-red-500 mt-1">{errors.kmDriven}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Details & Photos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Expected Price (INR) *</Label>
                    <Input className="mt-1" type="number" min={0} placeholder="e.g. 3500000" value={form.expectedPrice || ""} onChange={(e) => { update("expectedPrice", parseInt(e.target.value) || 0); setErrors(prev => ({ ...prev, expectedPrice: "" })) }} />
                    {errors.expectedPrice && <p className="text-xs text-red-500 mt-1">{errors.expectedPrice}</p>}
                  </div>
                  <div><Label>Warranty Status</Label><Input className="mt-1" placeholder="e.g. Active until 2027" value={form.warrantyStatus} onChange={(e) => update("warrantyStatus", e.target.value)} /></div>
                </div>
                <div><Label>Description</Label><textarea className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]" placeholder="Tell us about your vehicle&apos;s condition, features, etc." value={form.description} onChange={(e) => update("description", e.target.value)} /></div>

                {/* Photo Upload */}
                <div>
                  <Label>Photos *</Label>
                  <p className="text-sm text-gray-500 mt-1">Upload photos of your vehicle (front, back, sides, interior)</p>
                  <PhotoUploadDropzone
                    onUpload={handleUpload}
                    existingUrls={form.photos}
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
                        value={selectedDate}
                        onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot("") }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Time Slot</Label>
                      <Select value={selectedSlot} onValueChange={setSelectedSlot} disabled={!selectedDate}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder={selectedDate ? "Select time" : "Pick a date first"} /></SelectTrigger>
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
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Review Your Submission</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Make</span><span className="font-medium">{form.make || "-"}</span></div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Model</span><span className="font-medium">{form.model || "-"}</span></div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Variant</span><span className="font-medium">{form.variant || "-"}</span></div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Year</span><span className="font-medium">{form.year}</span></div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Km Driven</span><span className="font-medium">{form.kmDriven.toLocaleString()} km</span></div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Expected Price</span><span className="font-medium">{(form.expectedPrice / 100000).toFixed(2)}L</span></div>
                  <div className="col-span-2 flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Vehicle Number</span><span className="font-medium">{form.vehicleNumber || "-"}</span></div>
                  {form.description && <div className="col-span-2 p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Description</span><p className="mt-1">{form.description}</p></div>}
                  {form.photos.length > 0 && (
                    <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Photos</span>
                      <p className="mt-1 text-sm">{form.photos.length} photo(s) uploaded</p>
                    </div>
                  )}
                  {selectedDate && selectedSlot && (
                    <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Preferred Inspection</span>
                      <p className="mt-1 text-sm">{new Date(selectedDate).toLocaleDateString()} at {selectedSlot}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button variant="outline" disabled={step === 1} onClick={() => setStep(s => s - 1)}>Previous</Button>
              {step < 3 ? (
                <Button className="bg-primary hover:bg-primary-dark text-white" onClick={handleNext}>Next Step</Button>
              ) : (
                <Button className="bg-primary hover:bg-primary-dark text-white" onClick={handleSubmit} disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Vehicle"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
