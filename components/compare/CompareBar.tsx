"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Car, GitCompare, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCompareStore } from "@/hooks/use-compare"
import { useVehicles } from "@/hooks/use-api"

function parsePhotos(photos?: string | string[] | unknown): string[] {
  if (!photos) return []
  if (Array.isArray(photos)) return photos
  if (typeof photos === "string") {
    try {
      let parsed = JSON.parse(photos)
      while (typeof parsed === "string") parsed = JSON.parse(parsed)
      if (Array.isArray(parsed)) return parsed
      return []
    } catch {
      return []
    }
  }
  return []
}

export function CompareBar() {
  const { ids, remove, clear } = useCompareStore()
  const { data } = useVehicles({ limit: 50 })
  const allListings = data?.data ?? []
  const selected = ids
    .map((id) => allListings.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => !!v)
  const max = 4

  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div
          initial={{ y: 90, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 90, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed bottom-4 left-0 right-0 z-[999] px-4 pointer-events-none"
        >
          <div className="mx-auto max-w-3xl glass rounded-2xl border shadow-2xl pointer-events-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                  <GitCompare className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm font-semibold text-gray-900">Compare</span>
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {ids.length}/{max}
                </span>
              </div>
              <button
                onClick={clear}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            </div>

            {/* Vehicle slots */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {selected.map((v) => {
                  const parsed = parsePhotos(v.photos)
                  return (
                    <div
                      key={v.id}
                      className="group/item flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 pl-1.5 pr-1.5 py-1.5 shrink-0 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                        {parsed?.[0] ? (
                          <img src={parsed[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Car className="w-5 h-5 mx-auto mt-2.5 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate max-w-[110px] leading-tight">
                          {v.title}
                        </p>
                        <p className="text-[11px] font-medium text-primary">
                          ₹{(v.price / 100000).toFixed(2)}L
                        </p>
                      </div>
                      <button
                        onClick={() => remove(v.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                        aria-label={`Remove ${v.title} from compare`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
                {Array.from({ length: max - selected.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex items-center justify-center w-[70px] h-14 rounded-xl border border-dashed border-gray-300/70 text-gray-300 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </div>
                ))}
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-200/70">
                <p className="text-[11px] text-gray-400 hidden sm:block">
                  Select up to {max} vehicles to compare side by side
                </p>
                <Link href="/compare" className="ml-auto">
                  <Button size="sm" className="gap-1.5">
                    <GitCompare className="w-4 h-4" />
                    Compare Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
