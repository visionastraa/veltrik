"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { InspectorSidebar } from "@/components/layout/InspectorSidebar"

export default function InspectorLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
      return
    }
    if (session.user.role !== "INSPECTOR" && !["ADMIN", "MANAGER"].includes(session.user.role)) {
      router.push("/user")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || (session.user.role !== "INSPECTOR" && !["ADMIN", "MANAGER"].includes(session.user.role))) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <InspectorSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
