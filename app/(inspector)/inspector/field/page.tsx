"use client"

import { Navigation, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function FieldOpsPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
          <Navigation className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Field Operations</h1>
        <p className="text-gray-500 mb-8">Route optimization, live location, and offline mode. Coming soon.</p>
        <Link href="/inspector" className="inline-flex items-center gap-2 text-emerald-600 hover:underline font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  )
}
