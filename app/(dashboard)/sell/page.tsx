"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Car, Upload, Loader2, CheckCircle, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useSubmitSeller } from "@/hooks/use-api"
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
  const [success, setSuccess] = useState(false)

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = () => {
    submitMutation.mutate({
      ...form,
      photos: form.photos.length > 0 ? form.photos : ['/api/placeholder/400/300?text=EV'],
    }, {
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
                  {s === 1 ? 'Vehicle Info' : s === 2 ? 'Details' : 'Review'}
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
                  <div><Label>Make *</Label><Input className="mt-1" placeholder="e.g. Tesla" value={form.make} onChange={(e) => update('make', e.target.value)} /></div>
                  <div><Label>Model *</Label><Input className="mt-1" placeholder="e.g. Model 3" value={form.model} onChange={(e) => update('model', e.target.value)} /></div>
                  <div><Label>Variant *</Label><Input className="mt-1" placeholder="e.g. Long Range" value={form.variant} onChange={(e) => update('variant', e.target.value)} /></div>
                  <div><Label>Vehicle Number *</Label><Input className="mt-1" placeholder="e.g. DL 01 AB 1234" value={form.vehicleNumber} onChange={(e) => update('vehicleNumber', e.target.value)} /></div>
                  <div><Label>Year *</Label><Input className="mt-1" type="number" min={2010} max={new Date().getFullYear()} value={form.year} onChange={(e) => update('year', parseInt(e.target.value))} /></div>
                  <div><Label>Kilometers Driven *</Label><Input className="mt-1" type="number" min={0} placeholder="e.g. 25000" value={form.kmDriven || ''} onChange={(e) => update('kmDriven', parseInt(e.target.value) || 0)} /></div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Additional Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Expected Price (INR) *</Label><Input className="mt-1" type="number" min={0} placeholder="e.g. 3500000" value={form.expectedPrice || ''} onChange={(e) => update('expectedPrice', parseInt(e.target.value) || 0)} /></div>
                  <div><Label>Warranty Status</Label><Input className="mt-1" placeholder="e.g. Active until 2027" value={form.warrantyStatus} onChange={(e) => update('warrantyStatus', e.target.value)} /></div>
                </div>
                <div><Label>Description</Label><textarea className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]" placeholder="Tell us about your vehicle's condition, features, etc." value={form.description} onChange={(e) => update('description', e.target.value)} /></div>
                <div><Label>Photos</Label><p className="text-sm text-gray-500 mt-1">Upload photos of your vehicle (front, back, sides, interior)</p>
                  <div className="mt-2 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Review Your Submission</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Make</span><span className="font-medium">{form.make || '-'}</span></div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Model</span><span className="font-medium">{form.model || '-'}</span></div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Variant</span><span className="font-medium">{form.variant || '-'}</span></div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Year</span><span className="font-medium">{form.year}</span></div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Km Driven</span><span className="font-medium">{form.kmDriven.toLocaleString()} km</span></div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Expected Price</span><span className="font-medium">{(form.expectedPrice / 100000).toFixed(2)}L</span></div>
                  <div className="col-span-2 flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Vehicle Number</span><span className="font-medium">{form.vehicleNumber || '-'}</span></div>
                  {form.description && <div className="col-span-2 p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Description</span><p className="mt-1">{form.description}</p></div>}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button variant="outline" disabled={step === 1} onClick={() => setStep(s => s - 1)}>Previous</Button>
              {step < 3 ? (
                <Button className="bg-primary hover:bg-primary-dark text-white" onClick={() => setStep(s => s + 1)}>Next Step</Button>
              ) : (
                <Button className="bg-primary hover:bg-primary-dark text-white" onClick={handleSubmit} disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Vehicle'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
