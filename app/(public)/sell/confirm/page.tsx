"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, CheckCircle, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSubmitSeller } from "@/hooks/use-api"
import { useSellStore } from "@/store/use-sell-store"
import { cn } from "@/lib/utils"

export default function SellStep3Page() {
  const router = useRouter()
  const { formData, reset } = useSellStore()
  const submitMutation = useSubmitSeller()
  const [success, setSuccess] = useState(false)

  const handleSubmit = () => {
    submitMutation.mutate(formData as any, {
      onSuccess: (data) => {
        if (data.success) {
          setSuccess(true)
          reset() // clear store
        }
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/sell/schedule">
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
            <h1 className="text-2xl font-bold">Review Your Submission</h1>
            <p className="text-gray-500">Please review all details before submitting</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", 3 >= s ? "bg-primary text-white" : "bg-gray-200 text-gray-500")}>{s}</div>
              <span className={cn("text-sm hidden sm:inline", 3 >= s ? "text-primary font-medium" : "text-gray-400")}>
                {s === 1 ? "Vehicle Info" : s === 2 ? "Details & Photos" : "Review"}
              </span>
              {s < 3 && <div className={cn("flex-1 h-0.5", 3 > s ? "bg-primary" : "bg-gray-200")} />}
            </div>
          ))}
        </div>

        <Card className="p-6 border-0 shadow-sm bg-white rounded-xl">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Review Your Submission</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Make</span><span className="font-medium">{formData.make || "-"}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Model</span><span className="font-medium">{formData.model || "-"}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Variant</span><span className="font-medium">{formData.variant || "-"}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Year</span><span className="font-medium">{formData.year}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Km Driven</span><span className="font-medium">{formData.kmDriven.toLocaleString()} km</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Expected Price</span><span className="font-medium">{(formData.expectedPrice / 100000).toFixed(2)}L</span></div>
              <div className="col-span-2 flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Vehicle Number</span><span className="font-medium">{formData.vehicleNumber || "-"}</span></div>
              {formData.description && <div className="col-span-2 p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Description</span><p className="mt-1">{formData.description}</p></div>}
              {formData.photos.length > 0 && (
                <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Photos</span>
                  <p className="mt-1 text-sm">{formData.photos.length} photo(s) uploaded</p>
                </div>
              )}
              {formData.selectedDate && formData.selectedSlot && (
                <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Preferred Inspection</span>
                  <p className="mt-1 text-sm">{new Date(formData.selectedDate).toLocaleDateString()} at {formData.selectedSlot}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Link href="/sell/schedule">
              <Button variant="outline">Previous</Button>
            </Link>
            <Button className="bg-primary hover:bg-primary-dark text-white" onClick={handleSubmit} disabled={submitMutation.isPending}>
              {submitMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Vehicle"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
