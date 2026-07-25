"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu, X, Search, Heart, User, LogOut, ChevronDown,
  ShoppingBag, TrendingUp, Sparkles, Bell, MessageCircle,
  Settings, Car, Sun, Moon, Shield, ClipboardCheck, Home,
  Package, Calendar
} from "lucide-react"
import { DashboardSwitcher } from "./DashboardSwitcher"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface UnifiedNavbarProps {
  mode?: 'buy' | 'sell' | 'hybrid'
  onModeChange?: (mode: 'buy' | 'sell' | 'hybrid') => void
}

export function UnifiedNavbar({ mode = 'hybrid', onModeChange }: UnifiedNavbarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [darkMode])

  const isActive = (href: string) => pathname === href

  return (
    <header className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-300",
      scrolled ? "bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm" : "bg-white/80 backdrop-blur-md border-b border-gray-100"
    )}>
      <nav className="h-16 md:h-20 flex items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/user" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg">
              V
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Veltrik
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
              EV
            </Badge>
          </Link>

          <Link
            href="/user"
            className={cn(
              "hidden md:flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
              isActive('/user')
                ? "bg-primary/10 text-primary"
                : "text-gray-500 hover:text-primary hover:bg-primary/5"
            )}
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-gray-100 border border-gray-200">
          {([
            { id: 'buy', label: 'Buy', icon: ShoppingBag, href: '/inventory' },
            { id: 'sell', label: 'Sell', icon: TrendingUp, href: '/sell' },
            { id: 'hybrid', label: 'Explore', icon: Sparkles, href: '/' }
          ] as const).map((item) => {
            // Determine if active by checking pathname instead of just mode prop
            const isItemActive = pathname === item.href || (item.id === 'buy' && pathname.startsWith('/inventory')) || (item.id === 'sell' && pathname.startsWith('/sell'))
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onModeChange?.(item.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                  isItemActive
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="hidden lg:flex items-center gap-1 text-sm">
          {[
            { href: '/inventory', label: 'Inventory' },
            { href: '/compare', label: 'Compare' },
            { href: '/charging', label: 'Charging' },
            { href: '/financing', label: 'Finance' },
            { href: '/trade-in', label: 'Trade-In' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-colors font-medium",
                isActive(link.href)
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 hover:text-primary hover:bg-gray-100"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          <Link href="/user/favorites" className="p-2 rounded-full hover:bg-gray-100 transition-colors relative hidden sm:flex">
            <Heart className={cn("w-5 h-5", isActive('/user/favorites') ? "text-primary fill-primary/20" : "text-gray-600")} />
          </Link>

          <Link href="/user/messages" className="p-2 rounded-full hover:bg-gray-100 transition-colors relative hidden sm:flex">
            <MessageCircle className={cn("w-5 h-5", isActive('/user/messages') ? "text-primary" : "text-gray-600")} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
              3
            </span>
          </Link>

          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative hidden sm:flex">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
              5
            </span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {session.user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-medium">{session.user?.name}</div>
                  <div className="text-xs text-gray-500">{session.user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/user">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {session.user?.role && ["ADMIN", "MANAGER"].includes(session.user.role) && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5">
                      <DashboardSwitcher className="w-full" />
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {session.user?.role && ["INSPECTOR", "ADMIN", "MANAGER"].includes(session.user.role) && (
                  <>
                    {!["ADMIN", "MANAGER"].includes(session.user.role) && (
                      <div className="px-2 py-1.5">
                        <DashboardSwitcher className="w-full" />
                      </div>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/inspector">
                        <ClipboardCheck className="w-4 h-4 mr-2" />
                        Inspector Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/user/favorites">
                    <Heart className="w-4 h-4 mr-2" />
                    Saved Vehicles
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/bookings">
                    <Calendar className="w-4 h-4 mr-2" />
                    Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/orders">
                    <Package className="w-4 h-4 mr-2" />
                    Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/messages">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                    <Badge className="ml-auto">3</Badge>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/user/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary hover:bg-primary-dark text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white border-b shadow-lg p-4"
          >
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for EVs, brands, or ask AI..."
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                  autoFocus
                />
                <Button size="sm" className="bg-primary hover:bg-primary-dark text-white">
                  Search
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {["Tesla Model 3", "SUV under ₹30L", "Long Range EV", "BYD Atto 3", "Hyundai Ioniq 5"].map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary/10">{tag}</Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link
                href="/user"
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium",
                  isActive('/user') ? "bg-primary/10 text-primary" : "hover:bg-gray-50"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>

              <div className="border-t border-gray-100 pt-3">
                <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Browse</p>
                {[
                  { href: '/inventory', label: 'Inventory' },
                  { href: '/compare', label: 'Compare' },
                  { href: '/charging', label: 'Charging' },
                  { href: '/financing', label: 'Finance' },
                  { href: '/trade-in', label: 'Trade-In' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block px-4 py-2 rounded-lg transition-colors",
                      isActive(link.href) ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-50"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {session && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">My Account</p>
                  {[
                    { href: '/user/favorites', label: 'Saved Vehicles', icon: Heart },
                    { href: '/user/bookings', label: 'Bookings', icon: Calendar },
                    { href: '/user/orders', label: 'Orders', icon: Package },
                    { href: '/user/messages', label: 'Messages', icon: MessageCircle },
                    { href: '/user/settings', label: 'Settings', icon: Settings },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                        isActive(link.href) ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-50"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                {session ? (
                  <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full text-left px-4 py-2 text-red-600">
                    Sign Out
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login">
                      <Button variant="outline" className="w-full">Log In</Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full bg-primary hover:bg-primary-dark text-white">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
