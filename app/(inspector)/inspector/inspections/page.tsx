"use client"

import { useState } from "react"
import Link from "next/link"
import { ClipboardCheck, ArrowLeft, Search, Loader2, Eye, Car, Gauge, Battery } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useInspectorInspections } from "@/hooks/use-inspector-api"

export default function InspectionsPage() {
  const [search, setSearch] = useState("")
  const { data, isLoading } = useInspectorInspections()
  const inspections = (data?.data ?? []).filter((i: any) =>
    i.sellerLead?.make?.toLowerCase().includes(search.toLowerCase()) ||
    i.sellerLead?.model?.toLowerCase().includes(search.toLowerCase()) ||
    i.sellerLead?.vehicleNumber?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/inspector">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">All Inspections</h1>
            <p className="text-gray-500">View and manage your inspections</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : inspections.length === 0 ? (
          <Card className="p-12 text-center border-0 shadow-sm bg-white rounded-xl">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h2 className="text-lg font-semibold mb-1">No inspections found</h2>
            <p className="text-gray-500 text-sm">{search ? "Try a different search term." : "You haven't been assigned any inspections yet."}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {inspections.map((item: any, i: number) => {
              const sl = item.sellerLead || {}
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4 border-0 shadow-sm bg-white rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                          <Car className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{sl.make} {sl.model} {sl.variant}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            <span>{sl.vehicleNumber}</span>
                            <span>{sl.year}</span>
                            <span>{sl.kmDriven?.toLocaleString()} km</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.finalOffer ? (
                          <Badge className="bg-green-100 text-green-700 border-0">Completed</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 border-0">Pending</Badge>
                        )}
                        <Link href={`/inspector/inspect/${item.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
