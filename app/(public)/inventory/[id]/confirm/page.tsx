"use client"

import { use } from "react"
import Link from "next/link"
import { CheckCircle2, Calendar, Clock, MapPin, ArrowRight, ShieldCheck, Home, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const bookingRef = `VTK-BKG-${id.substring(0, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-emerald-50/50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-6 text-center">
        {/* Success Icon */}
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 font-bold px-3 py-1 border-none text-xs">
            Booking Confirmed
          </Badge>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Visit Has Been Scheduled!</h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            We have reserved this vehicle for your test drive. A confirmation email and SMS have been sent to your registered contact.
          </p>
        </div>

        {/* Confirmation Card */}
        <Card className="p-6 rounded-2xl border border-gray-200/80 shadow-sm text-left bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-400">Reference Number</span>
            <span className="text-sm font-mono font-bold text-gray-900">{bookingRef}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <span className="text-gray-400 font-medium block">Visit Type</span>
                <span className="font-bold text-gray-800">EV Inspection & Test Drive</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <span className="text-gray-400 font-medium block">Location</span>
                <span className="font-bold text-gray-800">Veltrik Experience Center</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Listing status updated to <strong className="text-amber-600">RESERVED</strong> for your slot.</span>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/user/bookings" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold px-6">
              View My Bookings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/inventory" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold px-6">
              <Car className="w-4 h-4 mr-2" />
              Browse More EVs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
