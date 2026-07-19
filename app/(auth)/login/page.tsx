"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, LayoutDashboard, Shield, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const dashboards = [
  {
    label: "User",
    email: "buyer@veltrik.com",
    password: "buyer123",
    href: "/user",
    icon: LayoutDashboard,
    color: "from-primary to-primary-dark",
    bg: "hover:bg-primary/5 border-primary/20",
    textColor: "text-primary",
  },
  {
    label: "Admin",
    email: "admin@veltrik.com",
    password: "admin123",
    href: "/admin",
    icon: Shield,
    color: "from-blue-600 to-blue-700",
    bg: "hover:bg-blue-50 border-blue-200",
    textColor: "text-blue-600",
  },
  {
    label: "Inspector",
    email: "inspector@veltrik.com",
    password: "inspector123",
    href: "/inspector",
    icon: ClipboardCheck,
    color: "from-emerald-600 to-emerald-700",
    bg: "hover:bg-emerald-50 border-emerald-200",
    textColor: "text-emerald-600",
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null)

  const handleQuickLogin = async (idx: number) => {
    setLoadingIdx(idx)
    const d = dashboards[idx]
    const result = await signIn("credentials", { email: d.email, password: d.password, redirect: false })
    if (!result?.error) {
      router.push(d.href)
      router.refresh()
    } else {
      setLoadingIdx(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xl">V</div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Veltrik</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-500">Choose your dashboard</p>
        </div>

        <div className="space-y-3">
          {dashboards.map((d, idx) => {
            const Icon = d.icon
            return (
              <button
                key={d.label}
                onClick={() => handleQuickLogin(idx)}
                disabled={loadingIdx !== null}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${d.bg} ${loadingIdx === idx ? "opacity-70" : ""}`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${d.color} flex items-center justify-center text-white flex-shrink-0`}>
                  {loadingIdx === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">{d.label} Dashboard</p>
                  <p className="text-xs text-gray-500">{d.email}</p>
                </div>
                <div className={`text-sm font-medium ${d.textColor}`}>
                  Go &rarr;
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account? <Link href="/register" className="text-primary font-medium hover:underline">Sign up</Link>
        </div>
      </Card>
    </div>
  )
}
