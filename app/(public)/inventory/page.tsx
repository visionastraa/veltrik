"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Car, Search, Battery, Gauge, Star, MapPin, Filter, ChevronLeft, ChevronRight,
  Heart, Shield, X, SlidersHorizontal, Grid3X3, List, Zap, Eye, ChevronDown, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useVehicles, useWishlist, useToggleWishlist, type VehicleListing } from "@/hooks/use-api"
import { useCompareStore } from "@/hooks/use-compare"
import { cn } from "@/lib/utils"
import { parseSearchQuery, SEARCH_SUGGESTIONS } from "@/lib/search-parser"

const BRANDS = ["Tesla", "BYD", "Hyundai", "BMW", "Mercedes", "Kia", "MG", "Tata", "Mahindra"]
const BODY_TYPES = ["SUV", "Sedan", "Hatchback", "Coupe", "MPV"]
const QUICK_FILTERS = [
  { label: "Tesla", key: "brand" as const, value: "Tesla" },
  { label: "BYD", key: "brand" as const, value: "BYD" },
  { label: "BMW", key: "brand" as const, value: "BMW" },
  { label: "SUV", key: "body" as const, value: "SUV" },
  { label: "Long Range", key: "battery" as const, value: 80 },
  { label: "Under 20L", key: "price" as const, value: 2000000 },
]

function FilterSection({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (<div>
    <button onClick={onToggle} className="flex items-center justify-between w-full text-sm font-semibold py-1">
      <span>{label}</span><ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
    </button>
    {open && <div className="mt-3 space-y-2">{children}</div>}
  </div>)
}

function parsePhotos(photos?: string | string[] | any): string[] {
  if (!photos) return []
  if (Array.isArray(photos)) return photos
  if (typeof photos === 'string') {
    try {
      return JSON.parse(photos)
    } catch {
      return []
    }
  }
  return []
}

function VehicleCardSkeleton() {
  return (<Card className="overflow-hidden"><Skeleton className="aspect-[4/3] rounded-none" />
    <div className="p-4 space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-6 w-1/3" />
      <div className="grid grid-cols-2 gap-2"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-full" /></div>
      <Skeleton className="h-9 w-full rounded-md" /></div></Card>)
}

function VehicleCard({ vehicle, isWishlisted, onToggle, isSelected, onToggleSelect, onQuickView }: {
  vehicle: VehicleListing; isWishlisted: boolean; onToggle: () => void
  isSelected: boolean; onToggleSelect: () => void; onQuickView: () => void
}) {
  const insp = vehicle.inspection; const sl = insp?.sellerLead
  const battery = insp?.batteryHealth; const km = insp?.kmDriven ?? sl?.kmDriven ?? 0
  const year = sl?.year ?? new Date(vehicle.createdAt).getFullYear()
  const isAvail = vehicle.status === "AVAILABLE"
  const parsedPhotos = parsePhotos(vehicle.photos)

  return (
    <motion.div whileHover={{ y: -6 }} className="group relative">
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          {parsedPhotos?.[0] ? (
            <img src={parsedPhotos[0]} alt={vehicle.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <Car className="w-16 h-16 text-primary/30" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isAvail && <Badge className="bg-emerald-500 text-white border-0 text-[10px] px-2 py-0.5">Available</Badge>}
            {vehicle.status === "RESERVED" && <Badge className="bg-amber-500 text-white border-0 text-[10px] px-2 py-0.5">Reserved</Badge>}
            {vehicle.status === "SOLD" && <Badge className="bg-red-500 text-white border-0 text-[10px] px-2 py-0.5">Sold</Badge>}
            {insp?.testDriveRating && insp.testDriveRating >= 8 && <Badge className="bg-blue-500 text-white border-0 text-[10px] px-2 py-0.5">Certified</Badge>}
            {year >= new Date().getFullYear() - 1 && <Badge className="bg-violet-500 text-white border-0 text-[10px] px-2 py-0.5">New</Badge>}
          </div>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle() }} className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md transition-all">
            <Heart className={cn("w-4 h-4 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500")} />
          </button>
          {battery != null && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="outline" className="bg-white/95 backdrop-blur-sm border-emerald-300 text-emerald-700 text-[10px] px-2 py-0.5">
                <Battery className="w-3 h-3 mr-1" />{Math.round(battery)}%
              </Badge>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 pt-8">
            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium">{year}</span>
                <span className="text-white/50">|</span>
                <span>{km.toLocaleString()} km</span>
              </div>
              {sl?.make && <span className="text-white/80 text-[10px]">{sl.make}</span>}
            </div>
          </div>
          <div className="absolute bottom-3 left-3">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSelect() }} className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-all",
              isSelected ? "bg-primary text-white" : "bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white"
            )}>
              <div className={cn("w-3.5 h-3.5 rounded border-2 flex items-center justify-center text-[8px]", isSelected ? "border-white bg-white/20" : "border-gray-400")}>
                {isSelected && "✓"}
              </div>
              Compare
            </button>
          </div>
          {isAvail && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView() }} className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-medium text-gray-800 hover:bg-white transition-colors">
                <Eye className="w-4 h-4" /> Quick View
              </button>
            </div>
          )}
        </div>
        <div className="p-4">
          <Link href={`/inventory/${vehicle.id}`}>
            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{vehicle.title}</h4>
          </Link>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-lg font-bold text-primary">₹{(vehicle.price / 100000).toFixed(2)}L</span>
            <span className="text-xs text-gray-400 line-through">₹{((vehicle.price * 1.15) / 100000).toFixed(2)}L</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500"><MapPin className="w-3 h-3" />Mumbai, MH</div>
          {insp?.testDriveRating && (
            <div className="flex items-center gap-1 mt-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-xs font-medium">{insp.testDriveRating}/10</span></div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {battery != null && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{Math.round(battery)}% Battery</Badge>}
            {insp?.warrantyStatus && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{insp.warrantyStatus}</Badge>}
            {km < 30000 && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Low KM</Badge>}
          </div>
          <Link href={`/inventory/${vehicle.id}`}>
            <Button className="w-full mt-3" size="sm">View Details</Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}

function QuickViewDialog({ vehicle, open, onClose }: { vehicle: VehicleListing | null; open: boolean; onClose: () => void }) {
  if (!vehicle) return null
  const insp = vehicle.inspection; const sl = insp?.sellerLead
  const battery = insp?.batteryHealth; const km = insp?.kmDriven ?? sl?.kmDriven ?? 0
  const year = sl?.year ?? new Date(vehicle.createdAt).getFullYear()
  const parsedPhotos = parsePhotos(vehicle.photos)

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{vehicle.title}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            {parsedPhotos?.[0] ? (
              <img src={parsedPhotos[0]} alt={vehicle.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full"><Car className="w-12 h-12 text-gray-300" /></div>
            )}
          </div>
          <div className="space-y-3">
            <div className="text-2xl font-bold text-primary">₹{(vehicle.price / 100000).toFixed(2)}L</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" />{year}</div>
              <div className="flex items-center gap-2"><Gauge className="w-4 h-4 text-primary" />{km.toLocaleString()} km</div>
              {battery != null && <div className="flex items-center gap-2"><Battery className="w-4 h-4 text-primary" />{Math.round(battery)}%</div>}
              {insp?.warrantyStatus && <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />{insp.warrantyStatus}</div>}
              {insp?.testDriveRating && <div className="flex items-center gap-2"><Star className="w-4 h-4 text-primary" />{insp.testDriveRating}/10</div>}
              {sl?.variant && <div className="flex items-center gap-2 text-gray-600">{sl.variant}</div>}
            </div>
            <div className="flex gap-2 pt-2">
              <Button asChild className="flex-1"><Link href={`/inventory/${vehicle.id}`}>View Details</Link></Button>
              <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function InventoryPage() {
  const [search, setSearch] = useState("")
  const [brand, setBrand] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [page, setPage] = useState(1)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const compareStore = useCompareStore()
  const [quickViewVehicle, setQuickViewVehicle] = useState<VehicleListing | null>(null)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ budget: true, brand: true, range: false, battery: false, body: false })
  const [sidebarBrands, setSidebarBrands] = useState<string[]>([])
  const [sidebarBodyTypes, setSidebarBodyTypes] = useState<string[]>([])
  const [minBattery, setMinBattery] = useState(0)
  const [rangeFilter, setRangeFilter] = useState([0, 600])
  const [searchFocused, setSearchFocused] = useState(false)
  const { data, isLoading } = useVehicles({
    page, limit: 12, search: search || undefined,
    brand: brand || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
    minBatteryHealth: minBattery > 0 ? minBattery : undefined,
    sortBy,
  })
  const { data: wishlistData } = useWishlist()
  const toggleWishlist = useToggleWishlist()
  const vehicles = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const wishlistIds = useMemo(() => new Set(wishlistData?.data?.map((v) => v.id) ?? []), [wishlistData])

  const toggleCompare = (id: string) => compareStore.toggle(id)
  const toggleSection = (key: string) => setOpenSections((p) => ({ ...p, [key]: !p[key] }))
  const resetAll = () => { setSearch(""); setBrand(""); setPriceRange([0, 10000000]); setMinBattery(0); setRangeFilter([0, 600]); setSidebarBrands([]); setSidebarBodyTypes([]); setPage(1) }

  const toggleSidebarBrand = (b: string) => {
    setSidebarBrands((prev) => {
      const next = prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
      setBrand(next[0] ?? ""); setPage(1); return next
    })
  }

  const suggestions = search.length === 0
    ? SEARCH_SUGGESTIONS
    : SEARCH_SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(search.toLowerCase()))

  const applyParsedSearch = (raw: string) => {
    const parsed = parseSearchQuery(raw)
    setSearch(parsed.text)
    if (parsed.brand) { setBrand(parsed.brand); setSidebarBrands([parsed.brand]) }
    if (parsed.maxPrice != null || parsed.minPrice != null) {
      setPriceRange([parsed.minPrice ?? 0, parsed.maxPrice ?? 10000000])
    }
    if (parsed.minBattery != null) setMinBattery(parsed.minBattery)
    if (parsed.sortBy) setSortBy(parsed.sortBy)
    setPage(1)
  }

  const filterContent = (
    <div className="space-y-4">
      <FilterSection label="Budget" open={openSections.budget} onToggle={() => toggleSection("budget")}>
        <Slider value={priceRange} onValueChange={(v) => { setPriceRange([v[0], v[1]]); setPage(1) }} min={0} max={10000000} step={100000} />
        <div className="flex justify-between text-xs text-gray-500"><span>₹{(priceRange[0] / 100000).toFixed(0)}L</span><span>₹{(priceRange[1] / 100000).toFixed(0)}L</span></div>
      </FilterSection>
      <FilterSection label="Brand" open={openSections.brand} onToggle={() => toggleSection("brand")}>
        {BRANDS.map((b) => (<label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={sidebarBrands.includes(b)} onCheckedChange={() => toggleSidebarBrand(b)} />{b}
        </label>))}
      </FilterSection>
      <FilterSection label="Range" open={openSections.range} onToggle={() => toggleSection("range")}>
        <Slider value={rangeFilter} onValueChange={(v) => setRangeFilter(v as [number, number])} min={0} max={600} step={50} />
        <div className="flex justify-between text-xs text-gray-500"><span>{rangeFilter[0]} km</span><span>{rangeFilter[1]} km</span></div>
      </FilterSection>
      <FilterSection label="Battery Health" open={openSections.battery} onToggle={() => toggleSection("battery")}>
        <Slider value={[minBattery]} onValueChange={(v) => { setMinBattery(v[0]); setPage(1) }} min={0} max={100} step={5} />
        <div className="text-xs text-gray-500">Min: {minBattery}%</div>
      </FilterSection>
      <FilterSection label="Body Type" open={openSections.body} onToggle={() => toggleSection("body")}>
        {BODY_TYPES.map((bt) => (<label key={bt} className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={sidebarBodyTypes.includes(bt)} onCheckedChange={() => setSidebarBodyTypes((p) => p.includes(bt) ? p.filter((x) => x !== bt) : [...p, bt])} />{bt}
        </label>))}
      </FilterSection>
      <Button variant="outline" className="w-full" onClick={resetAll}>Reset Filters</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-emerald-600 text-white">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="container mx-auto px-4 py-16 relative">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-center">
            Find Your Perfect Electric Vehicle
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mt-3 text-white/80">
            <Sparkles className="w-4 h-4 inline mr-1" />{isLoading ? "Loading inventory..." : `${total} premium EVs available`}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative max-w-2xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input placeholder="AI-powered search... Try 'long range Tesla under 25L'" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} onFocus={() => setSearchFocused(true)} onBlur={() => setTimeout(() => setSearchFocused(false), 200)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyParsedSearch(search) } }} className="pl-12 pr-10 py-6 text-base rounded-xl bg-white shadow-xl border-0" />
              <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" />
            </div>
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border p-2 z-[9999]">
                <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider px-3 py-1 mb-1 sticky top-0 bg-white"><Sparkles className="w-3 h-3" /><span>AI Suggestions</span></div>
                <div className="max-h-80 overflow-y-auto">
                {suggestions.length > 0 ? suggestions.map((s) => (
                  <button key={s.query} className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5 active:bg-primary/10 rounded-lg flex items-center gap-2 text-gray-700" onMouseDown={(e) => { e.preventDefault(); setSearch(s.query); applyParsedSearch(s.query); setSearchFocused(false) }}>
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />{s.label}
                  </button>
                )) : (
                  <p className="text-sm text-gray-400 px-3 py-2">No suggestions — press Enter to search</p>
                )}
                </div>
              </div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-2 mt-4">
            {QUICK_FILTERS.map((f) => (
              <button key={f.label} onClick={() => {
                if (f.key === "brand") { setBrand(f.value); setSidebarBrands([f.value]) }
                else if (f.key === "price") setPriceRange([0, f.value])
                else if (f.key === "battery") setMinBattery(f.value)
                setPage(1)
              }} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all border", brand === f.value ? "bg-white text-primary border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20")}>
                {f.label}
              </button>
            ))}
          </motion.div>
        </div>
      </div>
      {/* Filter Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Select value={brand} onValueChange={(v) => { setBrand(v === "all" ? "" : v); setSidebarBrands(v === "all" ? [] : [v]); setPage(1) }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Brands" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="battery">Battery Health</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden md:flex items-center gap-2 flex-1 min-w-[200px] max-w-xs">
            <Slider value={priceRange} onValueChange={(v) => { setPriceRange([v[0], v[1]]); setPage(1) }} min={0} max={10000000} step={100000} className="flex-1" />
            <span className="text-xs text-gray-500 whitespace-nowrap">₹{(priceRange[1] / 100000).toFixed(0)}L</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}><Grid3X3 className="w-4 h-4" /></Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}><List className="w-4 h-4" /></Button>
          </div>
          <span className="text-sm text-gray-500">{isLoading ? <Skeleton className="h-4 w-20 inline-block" /> : `${total} vehicles`}</span>
          <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="sm" className="lg:hidden"><Filter className="w-4 h-4 mr-1" />Filters</Button></SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
              <ScrollArea className="mt-4 h-[calc(100vh-8rem)]">{filterContent}</ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 flex gap-6">
        <aside className="hidden lg:block w-64 shrink-0">
          <Card className="sticky top-24 p-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-4"><SlidersHorizontal className="w-4 h-4" />Filters</h3>
            {filterContent}
          </Card>
        </aside>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className={cn("gap-4", viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid grid-cols-1")}>
              {Array.from({ length: 8 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-20">
              <Car className="w-20 h-20 text-gray-200 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No vehicles found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
              <Button variant="outline" onClick={resetAll}>Clear All Filters</Button>
            </div>
          ) : (
            <div className={cn("gap-4", viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid grid-cols-1")}>
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} isWishlisted={wishlistIds.has(v.id)} onToggle={() => toggleWishlist.mutate(v.id)} isSelected={compareStore.has(v.id)} onToggleSelect={() => toggleCompare(v.id)} onQuickView={() => setQuickViewVehicle(v)} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)}>{i + 1}</Button>
              ))}
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Compare Bar */}
      <AnimatePresence>
        {compareStore.ids.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-0 right-0 z-[999] bg-white border-t shadow-2xl">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{compareStore.ids.length} vehicle{compareStore.ids.length > 1 ? "s" : ""} selected</span>
                <div className="flex -space-x-2">
                  {vehicles.filter((v) => compareStore.has(v.id)).slice(0, 4).map((v) => {
                    const parsed = parsePhotos(v.photos)
                    return (
                      <div key={v.id} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shrink-0">
                        {parsed?.[0] ? <img src={parsed[0]} alt="" className="w-full h-full object-cover" /> : <Car className="w-4 h-4 mx-auto mt-2 text-gray-400" />}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={compareStore.clear}><X className="w-4 h-4 mr-1" />Clear</Button>
                <Link href="/compare"><Button size="sm">Compare Now</Button></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuickViewDialog vehicle={quickViewVehicle} open={!!quickViewVehicle} onClose={() => setQuickViewVehicle(null)} />
    </div>
  )
}
