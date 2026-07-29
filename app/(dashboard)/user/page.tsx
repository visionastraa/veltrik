"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import {
  Search, Heart, Car, Battery, Zap, Gauge, Star, MapPin, Calendar,
  DollarSign, TrendingUp, Clock, MessageCircle, Eye,
  ChevronDown, ChevronRight, ChevronLeft, Filter, Grid, List,
  Sparkles, Shield, Wallet, Bot, GitBranch, Loader2, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useVehicles, useToggleWishlist, useWishlist, type VehicleListing } from "@/hooks/use-api"
import { useCompareStore } from "@/hooks/use-compare"
import { cn } from "@/lib/utils"
import { SEARCH_SUGGESTIONS } from "@/lib/search-parser"

const quickActions = [
  { label: 'Find EV', icon: Search, href: '/inventory', color: 'bg-primary/10 text-primary' },
  { label: 'Sell EV', icon: TrendingUp, href: '/sell', color: 'bg-green-500/10 text-green-500' },
  { label: 'Book Test Drive', icon: Calendar, href: '/user/bookings', color: 'bg-blue-500/10 text-blue-500' },
  { label: 'Compare EVs', icon: GitBranch, href: '/compare', color: 'bg-indigo-500/10 text-indigo-500' },
  { label: 'Finance', icon: Wallet, href: '/financing', color: 'bg-amber-500/10 text-amber-500' },
  { label: 'Charging', icon: Zap, href: '/charging', color: 'bg-primary/10 text-primary' },
]

const AISearchBar = ({ onSearch }: { onSearch: (q: string) => void }) => {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const suggestions = query.length === 0
    ? SEARCH_SUGGESTIONS
    : SEARCH_SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <form onSubmit={(e) => { e.preventDefault(); if (query.trim()) onSearch(query) }} className="relative">
        <div className={cn("flex items-center bg-white rounded-full shadow-lg border transition-all duration-300", isFocused ? "ring-2 ring-primary/20 border-primary/30 shadow-xl" : "border-gray-200")}>
          <div className="flex items-center gap-2 pl-5 pr-2 text-gray-400"><Search className="w-5 h-5" /><div className="h-6 w-px bg-gray-200" /></div>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setTimeout(() => setIsFocused(false), 200)} placeholder="Search EVs by name, brand, or city..." className="flex-1 py-4 px-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-lg" />
          <div className="pr-2"><button type="submit" className="rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-2 h-10 transition-colors"><Search className="w-4 h-4 mr-1 inline" />Search</button></div>
        </div>
        <AnimatePresence>
          {isFocused && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999]">
              <div className="p-2 max-h-80 overflow-y-auto">
                <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider mb-1 px-2 py-1 sticky top-0 bg-white"><Bot className="w-3 h-3" /><span>AI Suggestions</span></div>
                {suggestions.length > 0 ? suggestions.map((s, i) => (
                  <button key={i} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-primary/5 active:bg-primary/10 transition-colors flex items-center gap-3" onClick={() => { setQuery(s.query); onSearch(s.query); setIsFocused(false) }}>
                    <Sparkles className="w-4 h-4 text-primary shrink-0" /><span className="text-sm text-gray-700">{s.label}</span>
                  </button>
                )) : (
                  <p className="text-sm text-gray-400 px-3 py-2">No suggestions — press Enter to search</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {["Tesla", "BYD", "Hyundai", "BMW", "Under 20L", "Long Range", "SUV"].map((chip) => (
          <button key={chip} onClick={() => onSearch(chip)} className="px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-sm text-gray-700 hover:border-primary hover:bg-primary/5 transition-all duration-200">{chip}</button>
        ))}
      </div>
    </div>
  )
}

function parsePhotos(photos?: string | string[] | any): string[] {
  if (!photos) return []
  if (Array.isArray(photos)) return photos
  if (typeof photos === 'string') {
    try {
      let parsed = JSON.parse(photos)
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

const VehicleCard = ({ vehicle, isWishlisted, onToggleWishlist, isCompared, onToggleCompare }: { vehicle: VehicleListing; isWishlisted: boolean; onToggleWishlist: () => void; isCompared: boolean; onToggleCompare: () => void }) => {
  const [isHovered, setIsHovered] = useState(false)
  const insp = vehicle.inspection
  const sl = insp?.sellerLead
  const batteryHealth = insp?.batteryHealth
  const kmDriven = insp?.kmDriven ?? sl?.kmDriven ?? 0
  const year = sl?.year ?? new Date(vehicle.createdAt).getFullYear()
  const parsedPhotos = parsePhotos(vehicle.photos)

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="group relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Link href={`/inventory/${vehicle.id}`}>
        <Card className="overflow-hidden border-0 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white rounded-2xl">
          <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {parsedPhotos?.[0] ? (
              <img src={parsedPhotos[0]} alt={vehicle.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700"><Car className="w-16 h-16 text-gray-300" /></div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {vehicle.status === 'AVAILABLE' && <Badge className="bg-primary text-white border-0 shadow-lg">Available</Badge>}
              {vehicle.status === 'RESERVED' && <Badge className="bg-amber-500 text-white border-0 shadow-lg">Reserved</Badge>}
              {vehicle.status === 'SOLD' && <Badge className="bg-gray-500 text-white border-0 shadow-lg">Sold</Badge>}
            </div>
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist() }} className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm">
                <Heart className={cn("w-4 h-4 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600")} />
              </button>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCompare() }} className={cn("p-2 rounded-full backdrop-blur-sm transition-colors shadow-sm", isCompared ? "bg-primary text-white" : "bg-white/90 hover:bg-white text-gray-600")}>
                <GitBranch className="w-4 h-4" />
              </button>
            </div>
            {batteryHealth != null && (
              <div className="absolute bottom-3 right-3">
                <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-primary/30 text-primary text-xs">
                  <Battery className="w-3 h-3 mr-1" />{Math.round(batteryHealth)}%
                </Badge>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
              <div className="flex items-center gap-3 text-white text-xs">
                <span>{year}</span><span>-</span><span>{kmDriven.toLocaleString()} km</span>
              </div>
            </div>
            <AnimatePresence>
              {isHovered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30">
                  <span className="bg-white text-gray-900 rounded-full px-4 py-2 text-sm font-medium shadow-lg flex items-center gap-1"><Eye className="w-4 h-4" />View Details</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="p-4">
            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{vehicle.title}</h4>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              {sl && <><span>{sl.make}</span><span>-</span><span>{sl.variant}</span></>}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-bold text-primary">{(vehicle.price / 100000).toFixed(2)}L</span>
              {insp?.finalOffer && insp.finalOffer !== vehicle.price && (
                <span className="text-xs text-gray-400 line-through">{(insp.finalOffer / 100000).toFixed(2)}L</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1 mt-3 text-xs text-gray-500">
              {batteryHealth != null && <div className="flex items-center gap-1"><Battery className="w-3 h-3 text-primary" />{Math.round(batteryHealth)}% battery</div>}
              <div className="flex items-center gap-1"><Gauge className="w-3 h-3 text-primary" />{kmDriven.toLocaleString()} km</div>
              {insp?.warrantyStatus && <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-primary" />{insp.warrantyStatus}</div>}
              {insp?.testDriveRating && <div className="flex items-center gap-1"><Star className="w-3 h-3 text-primary" />{insp.testDriveRating}/10</div>}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Button className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs h-8 rounded-full" asChild>
                <span><Eye className="w-3 h-3 mr-1" />View Details</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" asChild>
                <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist() }}><Heart className={cn("w-3 h-3", isWishlisted ? "fill-red-500 text-red-500" : "")} /></span>
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

const QuickActionsGrid = () => (
  <Card className="p-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
    <div className="mb-4"><h2 className="text-lg font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />Quick Actions</h2><p className="text-sm text-gray-500">Get started with these shortcuts</p></div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {quickActions.map((action, i) => (
        <Link key={i} href={action.href}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
            <div className={cn("p-3 rounded-full group-hover:scale-110 transition-transform", action.color)}><action.icon className="w-5 h-5" /></div>
            <span className="text-sm font-medium">{action.label}</span>
          </motion.div>
        </Link>
      ))}
    </div>
  </Card>
)

export default function UnifiedUserDashboard() {
  const [mode, setMode] = useState<'buy' | 'sell' | 'hybrid'>('hybrid')
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [aiQuery, setAiQuery] = useState("")
  const compareStore = useCompareStore()

  const { data: vehiclesData, isLoading } = useVehicles({
    page,
    limit: 12,
    search: search || undefined,
    brand: brand || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
    sortBy,
  })

  const { data: wishlistData } = useWishlist()
  const toggleWishlist = useToggleWishlist()

  const vehicles = vehiclesData?.data ?? []
  const totalPages = vehiclesData?.totalPages ?? 1
  const total = vehiclesData?.total ?? 0

  const wishlistIds = useMemo(() => new Set(wishlistData?.data?.map(v => v.id) ?? []), [wishlistData])

  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95])

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-transparent pt-24 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="container mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge className="bg-primary/20 text-primary border-0">{mode === 'buy' ? 'Looking to Buy?' : mode === 'sell' ? 'Looking to Sell?' : 'Explore EVs'}</Badge>
              <Badge variant="outline" className="border-primary/30 text-primary">{mode === 'hybrid' ? 'Smart Mode' : mode === 'buy' ? 'Buyer Mode' : 'Seller Mode'}</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              {mode === 'buy' ? 'Find Your Perfect Electric Vehicle' : mode === 'sell' ? 'Get the Best Price for Your EV' : 'Your EV Journey Starts Here'}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8">
              {mode === 'buy' ? 'Explore verified EVs with transparent pricing and inspection reports.' : mode === 'sell' ? 'Get instant offers and sell your EV with zero hassle.' : 'Buy, sell, compare, and manage your EV journey all in one place.'}
            </p>
            <AISearchBar onSearch={(q) => { setSearch(q); setPage(1) }} />
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-8">
        <QuickActionsGrid />

        <div className="mt-8">
          {/* Filter bar */}
          <div className="sticky top-16 md:top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 py-3 px-4 shadow-sm rounded-t-xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9 px-3 lg:hidden" onClick={() => setIsFilterSheetOpen(true)}><Filter className="w-4 h-4 mr-2" />Filters</Button>
                <Select value={brand} onValueChange={(v) => { setBrand(v === 'all' ? '' : v); setPage(1) }}>
                  <SelectTrigger className="w-36 h-9"><SelectValue placeholder="All Brands" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {["Tesla", "BYD", "Hyundai", "BMW", "Mercedes", "Audi", "Kia", "MG", "Tata", "Mahindra"].map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }}>
                  <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Sort by" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="battery">Battery Health</SelectItem>
                    <SelectItem value="km">Kilometers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 ml-auto text-sm">
                <span className="text-gray-500 hidden sm:inline">{(priceRange[0] / 100000).toFixed(0)}L - {(priceRange[1] / 100000).toFixed(0)}L</span>
                <div className="w-32 hidden sm:block"><Slider value={priceRange} min={0} max={10000000} step={100000} onValueChange={(v) => setPriceRange(v as [number, number])} /></div>
              </div>
              <p className="text-sm text-gray-500">{isLoading ? 'Loading...' : `${total} vehicles found`}</p>
            </div>
          </div>

          {/* Vehicle grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse"><div className="bg-gray-200 rounded-2xl h-80" /></div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No vehicles found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setBrand(''); setPriceRange([0, 10000000]); setPage(1) }}>Clear all filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} isWishlisted={wishlistIds.has(v.id)} onToggleWishlist={() => toggleWishlist.mutate(v.id)} isCompared={compareStore.has(v.id)} onToggleCompare={() => compareStore.toggle(v.id)} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
              {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => (
                <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} size="sm" className={page === i + 1 ? 'bg-primary text-white' : ''} onClick={() => setPage(i + 1)}>{i + 1}</Button>
              ))}
              {totalPages > 7 && <span className="text-gray-400">...</span>}
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
          <div className="mt-6 space-y-4">
            <div><label className="text-sm font-medium">Brand</label><Select value={brand} onValueChange={(v) => { setBrand(v === 'all' ? '' : v); setPage(1) }}><SelectTrigger className="mt-1"><SelectValue placeholder="All Brands" /></SelectTrigger><SelectContent><SelectItem value="all">All Brands</SelectItem>{["Tesla", "BYD", "Hyundai", "BMW", "Mercedes", "Audi", "Kia"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-sm font-medium">Sort By</label><Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">Newest</SelectItem><SelectItem value="price_low">Price: Low to High</SelectItem><SelectItem value="price_high">Price: High to Low</SelectItem><SelectItem value="battery">Battery</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm font-medium">Price Range</label><div className="mt-2"><Slider value={priceRange} min={0} max={10000000} step={100000} onValueChange={(v) => setPriceRange(v as [number, number])} /><div className="flex justify-between text-xs text-gray-500 mt-1"><span>{(priceRange[0] / 100000).toFixed(0)}L</span><span>{(priceRange[1] / 100000).toFixed(0)}L</span></div></div></div>
            <Button className="w-full" onClick={() => setIsFilterSheetOpen(false)}>Apply Filters</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Floating Compare Bar */}
      <AnimatePresence>
        {compareStore.ids.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-0 right-0 z-[999] bg-white border-t shadow-2xl">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{compareStore.ids.length}/4 selected</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={compareStore.clear}><X className="w-4 h-4 mr-1" />Clear</Button>
                <Link href="/compare"><Button size="sm">Compare Now</Button></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-8 right-8 z-50">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary-dark text-white transition-all duration-300 hover:scale-110 hover:shadow-xl"><Bot className="w-6 h-6" /></Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>AI Assistant</DialogTitle><DialogDescription>Ask me anything about EVs.</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => { setSearch('SUV'); setIsFilterSheetOpen(false) }}><Sparkles className="w-4 h-4 mr-2 text-primary" />Find me an SUV</Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => { setBrand('Tesla'); setIsFilterSheetOpen(false) }}><Car className="w-4 h-4 mr-2 text-primary" />Show Tesla vehicles</Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => { setBrand(''); setPriceRange([0, 2000000]); setSearch(''); setPage(1) }}><DollarSign className="w-4 h-4 mr-2 text-primary" />Budget under 20L</Button>
              </div>
              <div className="relative">
                <Input
                  placeholder="Type your question..."
                  className="pr-24"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearch(aiQuery)
                      setIsFilterSheetOpen(false)
                      setAiQuery("")
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1"
                  onClick={() => {
                    setSearch(aiQuery)
                    setIsFilterSheetOpen(false)
                    setAiQuery("")
                  }}
                >Ask</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
