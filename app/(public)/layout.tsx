"use client"

import { UnifiedNavbar } from "@/components/layout/UnifiedNavbar"
import { useState } from "react"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'buy' | 'sell' | 'hybrid'>('hybrid')

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar mode={mode} onModeChange={setMode} />
      <main className="pt-16 md:pt-20">
        {children}
      </main>
    </div>
  )
}
