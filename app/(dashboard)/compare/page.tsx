"use client"

import { useCompareStore } from "@/hooks/use-compare"
import { useVehicles, type VehicleListing } from "@/hooks/use-api"
import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, X, Star, Check, Battery, Gauge, Shield,
  Zap, Car, MapPin, Clock, Search, ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

const fmt = (p: number) => "₹" + (p / 100000).toFixed(2) + "L"
const bestOf = (arr: (number | null)[], mode?: "min" | "max") => {
  const valid = arr.filter((v): v is number => v != null)
  if (valid.length === 0) return null
  return mode === "min" ? Math.min(...valid) : Math.max(...valid)
}

export default function ComparePage() {
  const { ids, remove, clear } = useCompareStore()
  const [addSearch, setAddSearch] = useState("")
  const { data: allVehicles } = useVehicles({ limit: 50 })
  const allListings = allVehicles?.data ?? []

  const vehicles = ids
    .map((id) => allListings.find((v) => v.id === id))
    .filter((v): v is VehicleListing => !!v)

  const availableToAdd = allListings.filter(
    (v) => !ids.includes(v.id) &&
    (addSearch === "" || v.title.toLowerCase().includes(addSearch.toLowerCase()) ||
     v.inspection?.sellerLead?.make?.toLowerCase().includes(addSearch.toLowerCase()))
  ).slice(0, 10)

  if (ids.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/user"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <div><h1 className="text-3xl font-bold">Compare EVs</h1><p className="text-gray-500">Select vehicles to compare side by side</p></div>
          </div>
          <Card className="p-12 text-center">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No vehicles selected</h3>
            <p className="text-gray-500 mb-6">Go to the inventory or user dashboard and click the compare button on any vehicle card.</p>
            <Link href="/inventory"><Button>Browse Inventory</Button></Link>
          </Card>
        </div>
      </div>
    )
  }

  const getInfo = (v: VehicleListing) => {
    const insp = v.inspection
    const sl = insp?.sellerLead
    return {
      title: v.title,
      brand: sl?.make ?? "—",
      model: sl?.model ?? "—",
      variant: sl?.variant ?? "—",
      year: sl?.year ?? new Date(v.createdAt).getFullYear(),
      km: insp?.kmDriven ?? sl?.kmDriven ?? 0,
      price: v.price,
      expectedPrice: sl?.expectedPrice ?? 0,
      batteryHealth: insp?.batteryHealth,
      batteryCharge: insp?.batteryCharge,
      batteryVoltage: insp?.batteryVoltage,
      bodyDamage: insp?.bodyDamage,
      accidentHistory: insp?.accidentHistory,
      warrantyStatus: insp?.warrantyStatus,
      testDriveRating: insp?.testDriveRating,
      testDriveNotes: insp?.testDriveNotes,
      finalOffer: insp?.finalOffer,
      ageYears: insp?.ageYears,
      ageMonths: insp?.ageMonths,
      photo: v.photos?.[0] ?? null,
    }
  }

  const info = vehicles.map(getInfo)

  const specs = [
    { label: "Price", values: info.map((i) => fmt(i.price)), raw: info.map((i) => i.price), best: "min" as const },
    { label: "Expected Price", values: info.map((i) => i.expectedPrice ? fmt(i.expectedPrice) : "—"), raw: info.map((i) => i.expectedPrice || null), best: "min" as const },
    { label: "Year", values: info.map((i) => String(i.year)), raw: info.map((i) => i.year), best: "max" as const },
    { label: "Kilometers Driven", values: info.map((i) => i.km.toLocaleString() + " km"), raw: info.map((i) => i.km), best: "min" as const },
    { label: "Battery Health", values: info.map((i) => i.batteryHealth != null ? Math.round(i.batteryHealth) + "%" : "—"), raw: info.map((i) => i.batteryHealth), best: "max" as const },
    { label: "Battery Charge", values: info.map((i) => i.batteryCharge != null ? Math.round(i.batteryCharge) + "%" : "—"), raw: info.map((i) => i.batteryCharge), best: "max" as const },
    { label: "Battery Voltage", values: info.map((i) => i.batteryVoltage != null ? i.batteryVoltage + "V" : "—"), raw: info.map((i) => i.batteryVoltage), best: "max" as const },
    { label: "Test Drive Rating", values: info.map((i) => i.testDriveRating != null ? i.testDriveRating + "/10" : "—"), raw: info.map((i) => i.testDriveRating), best: "max" as const },
    { label: "Warranty Status", values: info.map((i) => i.warrantyStatus ?? "—"), raw: info.map(() => null) },
    { label: "Age", values: info.map((i) => i.ageYears != null ? `${i.ageYears}y ${i.ageMonths ?? 0}m` : "—"), raw: info.map((i) => i.ageYears ?? null), best: "min" as const },
    { label: "Variant", values: info.map((i) => i.variant || "—"), raw: info.map(() => null) },
    { label: "Body Damage", values: info.map((i) => i.bodyDamage ?? "None reported"), raw: info.map(() => null) },
    { label: "Accident History", values: info.map((i) => i.accidentHistory ?? "None reported"), raw: info.map(() => null) },
    { label: "Final Offer", values: info.map((i) => i.finalOffer ? fmt(i.finalOffer) : "—"), raw: info.map((i) => i.finalOffer), best: "max" as const },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/user"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div className="flex-1"><h1 className="text-3xl font-bold">Compare EVs</h1><p className="text-gray-500">Side-by-side comparison of electric vehicles</p></div>
          <Badge variant="secondary">{ids.length}/4 vehicles</Badge>
        </div>

        {/* Vehicle Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatePresence>{info.map((v, idx) => (
            <motion.div key={vehicles[idx].id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} layout>
              <Card className="relative overflow-hidden">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 h-7 w-7 bg-background/80 backdrop-blur" onClick={() => remove(vehicles[idx].id)}><X className="h-4 w-4" /></Button>
                <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                  {v.photo ? <img src={v.photo} alt={v.title} className="w-full h-full object-cover" /> : <Car className="h-12 w-12 text-gray-300" />}
                </div>
                <CardContent className="p-3 space-y-1">
                  {v.testDriveRating != null && <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /><span className="text-xs font-medium">{v.testDriveRating}/10</span></div>}
                  <h3 className="font-semibold text-sm leading-tight">{v.brand} {v.model}</h3>
                  <p className="text-xs text-gray-500">{v.variant}</p>
                  <p className="text-base font-bold text-primary">{fmt(v.price)}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {v.batteryHealth != null && <Badge variant="secondary" className="text-[9px] px-1 py-0">{Math.round(v.batteryHealth)}%</Badge>}
                    <Badge variant="secondary" className="text-[9px] px-1 py-0">{v.year}</Badge>
                    <Badge variant="secondary" className="text-[9px] px-1 py-0">{v.km.toLocaleString()} km</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}</AnimatePresence>
        </div>

        {/* Add More */}
        {ids.length < 4 && (
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Search className="w-4 h-4 text-gray-400" />
              <Input placeholder="Search vehicles to add..." value={addSearch} onChange={(e) => setAddSearch(e.target.value)} className="max-w-sm" />
            </div>
            {availableToAdd.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableToAdd.map((v) => {
                  const sl = v.inspection?.sellerLead
                  return (
                    <button key={v.id} onClick={() => { const store = useCompareStore.getState(); store.add(v.id); setAddSearch("") }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-sm hover:border-primary hover:bg-primary/5 transition-colors">
                      <Car className="w-3.5 h-3.5 text-gray-400" />
                      {sl?.make} {sl?.model} — {fmt(v.price)}
                    </button>
                  )
                })}
              </div>
            )}
            {addSearch && availableToAdd.length === 0 && <p className="text-sm text-gray-400">No vehicles match your search</p>}
          </Card>
        )}

        {/* Comparison Tabs */}
        {vehicles.length >= 2 && (
          <Tabs defaultValue="specs">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="specs"><Gauge className="h-4 w-4 mr-1" /> Specs</TabsTrigger>
              <TabsTrigger value="condition"><Shield className="h-4 w-4 mr-1" /> Condition</TabsTrigger>
              <TabsTrigger value="cost"><Zap className="h-4 w-4 mr-1" /> Value</TabsTrigger>
            </TabsList>

            <TabsContent value="specs">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Specification</TableHead>
                      {info.map((v, idx) => <TableHead key={vehicles[idx].id} className="text-center">{v.brand}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specs.filter((s) => s.raw.some((r) => r != null)).map((s) => {
                      const bestVal = s.best ? bestOf(s.raw, s.best) : null
                      return (
                        <TableRow key={s.label}>
                          <TableCell className="font-medium">{s.label}</TableCell>
                          {s.values.map((val, idx) => (
                            <TableCell key={idx} className="text-center">
                              {val}
                              {bestVal != null && s.raw[idx] === bestVal && vehicles.length > 1 && (
                                <Badge className="ml-2" variant="default">Best</Badge>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="condition">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Battery className="h-4 w-4" /> Battery Health</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {info.map((v, idx) => {
                      const val = v.batteryHealth ?? 0
                      return (
                        <div key={vehicles[idx].id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{v.brand}</span>
                            <span className="flex items-center gap-1">{val > 0 ? Math.round(val) + "%" : "—"}{val === bestOf(info.map((i) => i.batteryHealth), "max") && vehicles.length > 1 && <Badge variant="default" className="text-xs ml-1">Best</Badge>}</span>
                          </div>
                          <Progress value={val} className="h-2" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Gauge className="h-4 w-4" /> Kilometers Driven</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {info.map((v, idx) => {
                      const maxKm = Math.max(...info.map((i) => i.km), 1)
                      return (
                        <div key={vehicles[idx].id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{v.brand}</span>
                            <span>{v.km.toLocaleString()} km{v.km === bestOf(info.map((i) => i.km), "min") && vehicles.length > 1 && <Badge variant="default" className="text-xs ml-1">Best</Badge>}</span>
                          </div>
                          <Progress value={Math.min((v.km / maxKm) * 100, 100)} className="h-2" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Star className="h-4 w-4" /> Test Drive Rating</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {info.map((v, idx) => {
                      const val = v.testDriveRating ?? 0
                      return (
                        <div key={vehicles[idx].id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{v.brand}</span>
                            <span>{val > 0 ? val + "/10" : "—"}{val === bestOf(info.map((i) => i.testDriveRating), "max") && vehicles.length > 1 && <Badge variant="default" className="text-xs ml-1">Best</Badge>}</span>
                          </div>
                          <Progress value={val * 10} className="h-2" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4" /> Warranty</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {info.map((v, idx) => (
                      <div key={vehicles[idx].id} className="flex justify-between text-sm">
                        <span className="font-medium">{v.brand}</span>
                        <span className="text-gray-600">{v.warrantyStatus ?? "—"}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cost">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {info.map((v, idx) => (
                  <Card key={vehicles[idx].id}>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Zap className="h-4 w-4" />{v.brand} {v.model}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Listed Price</span><span className="font-medium">{fmt(v.price)}</span></div>
                      {v.expectedPrice > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Expected Price</span><span className="font-medium">{fmt(v.expectedPrice)}</span></div>}
                      {v.finalOffer && <div className="flex justify-between text-sm"><span className="text-gray-500">Final Offer</span><span className="font-bold text-primary">{fmt(v.finalOffer)}</span></div>}
                      {v.price < v.expectedPrice && <div className="flex justify-between text-sm"><span className="text-gray-500">Savings</span><span className="font-medium text-green-600">{fmt(v.expectedPrice - v.price)}</span></div>}
                    </CardContent>
                  </Card>
                ))}
                {vehicles.length >= 2 && (
                  <Card className="border-primary/50 bg-primary/5">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Gauge className="h-4 w-4 text-primary" />AI Verdict</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        The <span className="font-semibold">{info.sort((a, b) => a.price - b.price)[0]?.brand}</span> is the most affordable at {fmt(info.sort((a, b) => a.price - b.price)[0]?.price ?? 0)}.
                        {info.some((i) => i.batteryHealth != null) && (
                          <> For best battery health, the <span className="font-semibold">{info.sort((a, b) => (b.batteryHealth ?? 0) - (a.batteryHealth ?? 0))[0]?.brand}</span> leads at {Math.round(info.sort((a, b) => (b.batteryHealth ?? 0) - (a.batteryHealth ?? 0))[0]?.batteryHealth ?? 0)}%.</>
                        )}
                        {info.some((i) => i.km > 0) && (
                          <> Lowest mileage: <span className="font-semibold">{info.sort((a, b) => a.km - b.km)[0]?.brand}</span> at {info.sort((a, b) => a.km - b.km)[0]?.km.toLocaleString()} km.</>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={clear}><X className="h-4 w-4 mr-2" /> Clear All</Button>
          <Link href="/inventory"><Button variant="outline"><Car className="h-4 w-4 mr-2" /> Add More Vehicles</Button></Link>
        </div>
      </div>
    </div>
  )
}
