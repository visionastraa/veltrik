"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Car, Shield, Star, Battery, TrendingUp, ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useVehicles } from "@/hooks/use-api"
import { BRANDS } from "@/lib/brandModels"
import { cn } from "@/lib/utils"

const STATS = [
  { label: "EVs Sold", value: "250+" },
  { label: "Happy Customers", value: "98%" },
  { label: "Cities Covered", value: "25+" },
  { label: "Avg. Savings", value: "₹45K" },
]

const BRAND_LOGOS = [
  { name: "Ola Electric", color: "bg-blue-100 text-blue-600" },
  { name: "Ather", color: "bg-green-100 text-green-600" },
  { name: "TVS", color: "bg-red-100 text-red-600" },
  { name: "Hero", color: "bg-amber-100 text-amber-600" },
  { name: "Bajaj", color: "bg-purple-100 text-purple-600" },
  { name: "Simple", color: "bg-cyan-100 text-cyan-600" },
]

const STEPS = [
  { icon: Search, title: "Browse EVs", desc: "Explore verified electric vehicles with detailed inspection reports" },
  { icon: Car, title: "Test Drive", desc: "Schedule a test drive at your convenience" },
  { icon: Star, title: "Buy with Confidence", desc: "Transparent pricing, battery health reports, and warranty covered" },
]

function parsePhotos(photos?: string | string[] | any): string[] {
  if (!photos) return []
  if (Array.isArray(photos)) return photos
  if (typeof photos === 'string') {
    try {
      let parsed = JSON.parse(photos)
      // Handle double stringification
      while (typeof parsed === 'string') {
        parsed = JSON.parse(parsed)
      }
      if (Array.isArray(parsed)) return parsed
      return []
    } catch {
      return []
    }
  }
  return []
}

export default function Home() {
  const [search, setSearch] = useState("")
  const { data: vehiclesData } = useVehicles({ status: "AVAILABLE", limit: 6, sortBy: "newest" })
  const vehicles = vehiclesData?.data ?? []

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">V</div>
            <span className="text-lg font-bold">Veltrik</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary hover:bg-primary-dark text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <Badge className="bg-primary/10 text-primary border-0 mb-4 px-4 py-1.5">
              <Zap className="w-3.5 h-3.5 mr-1" /> India&apos;s Trusted EV Marketplace
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Buy & Sell Electric Vehicles with{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Confidence</span>
            </h1>
            <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
              Every vehicle comes with a comprehensive inspection report, battery health certificate, and transparent pricing.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-white h-12 px-8 text-base">
                  Start Exploring <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-green-500" /> Verified</span>
              <span className="flex items-center gap-1"><Battery className="w-4 h-4 text-primary" /> Battery Certified</span>
              <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-blue-500" /> Best Price</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Three simple steps to get your perfect EV</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {STEPS.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured EVs</h2>
              <p className="text-gray-500 mt-1">Hand-picked electric vehicles for you</p>
            </div>
            <Link href="/inventory">
              <Button variant="outline" className="hidden sm:flex">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Car className="w-12 h-12 mx-auto mb-3" />
              <p>No vehicles listed yet. Be the first!</p>
              <Link href="/sell">
                <Button variant="outline" className="mt-4">Sell Your EV</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v, i) => {
                const parsedPhotos = parsePhotos(v.photos)
                return (
                <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/inventory/${v.id}`}>
                    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all bg-white rounded-xl group">
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        {parsedPhotos?.[0] ? (
                          <img src={parsedPhotos[0]} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center"><Car className="w-16 h-16 text-gray-300" /></div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-primary text-white border-0">{v.status}</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-sm">{v.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          {v.inspection?.sellerLead?.year && <span>{v.inspection.sellerLead.year}</span>}
                          {v.inspection?.kmDriven != null && <span>{v.inspection.kmDriven.toLocaleString()} km</span>}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-bold text-primary">₹{(v.price / 100000).toFixed(2)}L</span>
                          {v.inspection?.batteryHealth != null && (
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                              <Battery className="w-3 h-3 mr-1" />{Math.round(v.inspection.batteryHealth)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Brands */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Popular Brands</h2>
            <p className="text-gray-500">Find the best deals from India&apos;s top EV manufacturers</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {BRAND_LOGOS.map((brand, i) => (
              <motion.div key={brand.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
                <Link href={`/inventory?brand=${brand.name.split(" ")[0]}`}>
                  <Card className="p-6 text-center border-0 shadow-sm hover:shadow-md transition-all bg-white rounded-xl cursor-pointer group">
                    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110", brand.color)}>
                      <Car className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-medium">{brand.name}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-0 shadow-sm">
            <h2 className="text-3xl font-bold mb-3">Ready to Make the Switch?</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">Join thousands of happy EV owners. Buy, sell, or trade-in your electric vehicle today.</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-white h-12 px-8">Get Started</Button>
              </Link>
              <Link href="/sell">
                <Button variant="outline" size="lg" className="h-12 px-8">Sell Your EV</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Veltrik. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
