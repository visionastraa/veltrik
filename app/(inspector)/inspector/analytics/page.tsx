"use client"

import Link from "next/link"
import { BarChart3, ArrowLeft, Loader2, ClipboardCheck, Clock, TrendingUp, Star } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useInspectorStats } from "@/hooks/use-inspector-api"

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useInspectorStats()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/inspector">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Performance Analytics</h1>
            <p className="text-gray-500">Inspection metrics, quality scores, and time efficiency</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Today", value: stats?.todayCount ?? 0, icon: ClipboardCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Completed", value: stats?.completedCount ?? 0, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "In Progress", value: stats?.inProgressCount ?? 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Quality Score", value: stats?.qualityScore ? `${stats.qualityScore}%` : "0%", icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 border-0 shadow-sm bg-white rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Card className="p-8 text-center border-0 shadow-sm bg-white rounded-xl">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h2 className="text-lg font-semibold mb-1">Detailed Analytics</h2>
          <p className="text-gray-500 text-sm">Charts and graphs for time trends, completion rates, and peer comparison will appear here.</p>
        </Card>
      </div>
    </div>
  )
}
