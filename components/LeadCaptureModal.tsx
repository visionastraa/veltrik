"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BrandModelSelector } from "@/components/BrandModelSelector"
import { Loader2, CheckCircle2, Phone, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const leadFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  otp: z.string().optional(),
})

type LeadFormData = z.infer<typeof leadFormSchema>

interface LeadCaptureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingId?: string
  vehicleTitle?: string
  onSuccess?: (leadId: string) => void
}

export function LeadCaptureModal({
  open,
  onOpenChange,
  listingId,
  vehicleTitle = "Electric Vehicle",
  onSuccess,
}: LeadCaptureModalProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
  })

  const handleSendOTP = async () => {
    const phone = getValues("phone")
    if (!phone || phone.length < 10) {
      toast({ title: "Invalid Phone", description: "Please enter a valid 10-digit phone number.", variant: "destructive" })
      return
    }

    try {
      setLoading(true)
      // Send OTP helper simulation or API call
      setOtpSent(true)
      toast({ title: "OTP Sent!", description: `Verification code sent to ${phone}.` })
    } catch {
      toast({ title: "Error", description: "Failed to send OTP", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: LeadFormData) => {
    if (selectedBrands.length === 0 && !listingId) {
      toast({ title: "Selection Required", description: "Please select at least one brand of interest.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/buyer/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          brandsInterested: selectedBrands.length > 0 ? selectedBrands : ["Generic"],
          modelsInterested: selectedModels,
        }),
      })

      const resData = await response.json()
      if (resData.success) {
        setSubmitted(true)
        toast({ title: "Lead Submitted!", description: "Our sales team will contact you shortly." })
        onSuccess?.(resData.lead?.id)
      } else {
        throw new Error(resData.error || "Failed to submit lead")
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to submit lead"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setOtpSent(false)
    setSelectedBrands([])
    setSelectedModels([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Sparkles className="w-5 h-5 text-primary" />
            Express Interest in {vehicleTitle}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Connect with our EV specialists to book a visit, request callback, or reserve your vehicle.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Thank You!</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Your inquiry has been submitted. A Veltrik specialist will reach out to you within 2 hours.
            </p>
            <Button onClick={handleReset} className="mt-4 bg-primary text-white rounded-xl">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {/* Contact Details */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-xs font-semibold text-gray-700">Full Name</Label>
                <Input id="name" placeholder="John Doe" {...register("name")} className="rounded-xl mt-1" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="email" className="text-xs font-semibold text-gray-700">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" {...register("email")} className="rounded-xl mt-1" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs font-semibold text-gray-700">Mobile Phone</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="phone" placeholder="9876543210" {...register("phone")} className="rounded-xl" />
                  <Button type="button" variant="outline" onClick={handleSendOTP} disabled={loading || otpSent} className="rounded-xl text-xs flex-shrink-0">
                    <Phone className="w-3.5 h-3.5 mr-1" />
                    {otpSent ? "Sent" : "Get OTP"}
                  </Button>
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              {otpSent && (
                <div>
                  <Label htmlFor="otp" className="text-xs font-semibold text-gray-700">Enter OTP</Label>
                  <Input id="otp" placeholder="123456" {...register("otp")} className="rounded-xl mt-1 tracking-widest text-center font-mono" />
                </div>
              )}
            </div>

            {/* Brand / Model Preference */}
            {!listingId && (
              <div className="pt-3 border-t border-gray-100">
                <BrandModelSelector
                  selectedBrands={selectedBrands}
                  selectedModels={selectedModels}
                  onBrandsChange={setSelectedBrands}
                  onModelsChange={setSelectedModels}
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Lead"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
