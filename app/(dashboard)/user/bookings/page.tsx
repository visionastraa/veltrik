"use client"

import Link from "next/link"
import { Calendar, Clock, MapPin, Car, Loader2, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBookings } from "@/hooks/use-api"

export default function BookingsPage() {
  const { data, isLoading } = useBookings()
  const bookings = data?.data ?? []

  const confirmed = bookings.filter(b => b.status === 'confirmed')
  const pending = bookings.filter(b => b.status === 'pending')
  const completed = bookings.filter(b => b.status === 'completed')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
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
                <span className="text-gray-900 font-medium">Bookings</span>
              </div>
              <h1 className="text-2xl font-bold">Your Bookings</h1>
              <p className="text-gray-500">Manage your scheduled test drives and inspections</p>
            </div>
          </div>
          <Link href="/user"><Button className="bg-primary hover:bg-primary-dark text-white">Browse Vehicles</Button></Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-24" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No bookings yet</h3>
            <p className="text-gray-500">Schedule a test drive or inspection for any vehicle</p>
            <Link href="/user"><Button className="mt-4 bg-primary hover:bg-primary-dark text-white">Browse Vehicles</Button></Link>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed ({confirmed.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4 space-y-4">
              {bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
            </TabsContent>
            <TabsContent value="confirmed" className="mt-4 space-y-4">
              {confirmed.length === 0 ? <EmptyTab label="confirmed" /> : confirmed.map(b => <BookingCard key={b.id} booking={b} />)}
            </TabsContent>
            <TabsContent value="pending" className="mt-4 space-y-4">
              {pending.length === 0 ? <EmptyTab label="pending" /> : pending.map(b => <BookingCard key={b.id} booking={b} />)}
            </TabsContent>
            <TabsContent value="completed" className="mt-4 space-y-4">
              {completed.length === 0 ? <EmptyTab label="completed" /> : completed.map(b => <BookingCard key={b.id} booking={b} />)}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

function BookingCard({ booking }: { booking: any }) {
  const date = new Date(booking.scheduledAt)
  const listing = booking.listing
  const sellerLead = listing?.inspection?.sellerLead

  return (
    <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-0 shadow-sm bg-white rounded-xl">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Car className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{listing?.title || 'Vehicle Booking'}</h3>
          {sellerLead && <p className="text-xs text-gray-400">{sellerLead.year} {sellerLead.make} {sellerLead.model} {sellerLead.variant}</p>}
          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{date.toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block capitalize">{booking.type.replace('_', ' ').toLowerCase()}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={
          booking.status === 'confirmed' ? 'default' :
          booking.status === 'pending' ? 'outline' :
          booking.status === 'completed' ? 'secondary' : 'destructive'
        }>
          {booking.status.toUpperCase()}
        </Badge>
        {listing && <Link href={`/inventory/${listing.id}`}><Button variant="outline" size="sm">View Vehicle</Button></Link>}
      </div>
    </Card>
  )
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="text-center py-8 text-gray-400">
      <p>No {label} bookings</p>
    </div>
  )
}
