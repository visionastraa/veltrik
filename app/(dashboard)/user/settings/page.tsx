"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { User, Mail, Phone, Lock, Shield, ArrowLeft, Home, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState(session?.user?.name || "")
  const [email, setEmail] = useState(session?.user?.email || "")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
    priceAlerts: true,
    newListings: true,
  })
  const [preferences, setPreferences] = useState({
    darkMode: false,
    aiRecommendations: true,
  })

  const handleSaveProfile = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    toast({ title: "Profile updated", description: "Your changes have been saved." })
    setSaving(false)
  }

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" })
      return
    }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    toast({ title: "Password updated", description: "Your password has been changed." })
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    toast({ title: "Coming soon", description: "Account deletion is not yet available." })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/user">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link href="/user" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="w-3 h-3" />
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Settings</span>
            </div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-500">Manage your account preferences</p>
          </div>
        </div>

        <div className="max-w-4xl">
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card className="p-6 border-0 shadow-sm bg-white rounded-xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" />Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
                  <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" type="email" /></div>
                  <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" placeholder="+91 98765 43210" /></div>
                  <div><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1" placeholder="Delhi, India" /></div>
                </div>
                <Button className="mt-6 bg-primary hover:bg-primary-dark text-white" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card className="p-6 border-0 shadow-sm bg-white rounded-xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-primary" />Security Settings</h3>
                <div className="space-y-4 max-w-md">
                  <div><Label>Current Password</Label><Input type={showPassword ? "text" : "password"} className="mt-1" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
                  <div><Label>New Password</Label><Input type={showPassword ? "text" : "password"} className="mt-1" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
                  <div><Label>Confirm New Password</Label><Input type={showPassword ? "text" : "password"} className="mt-1" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"} Passwords</Button>
                    <Button className="bg-primary hover:bg-primary-dark text-white" onClick={handleUpdatePassword} disabled={saving || !currentPassword || !newPassword || !confirmPassword}>
                      {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : "Update Password"}
                    </Button>
                  </div>
                </div>
              </Card>
              <Card className="p-6 border-0 shadow-sm bg-white rounded-xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div><p className="font-medium">Enable 2FA</p><p className="text-sm text-gray-500">Add an extra layer of security to your account</p></div>
                  <Switch onCheckedChange={(v) => toast({ title: v ? "2FA Enabled" : "2FA Disabled", description: v ? "Two-factor authentication is now active." : "Two-factor authentication is now disabled." })} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card className="p-6 border-0 shadow-sm bg-white rounded-xl">
                <h3 className="font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
                    { key: "sms", label: "SMS Notifications", desc: "Receive updates via SMS" },
                    { key: "push", label: "Push Notifications", desc: "Receive browser notifications" },
                    { key: "marketing", label: "Marketing Emails", desc: "Receive promotions and offers" },
                    { key: "priceAlerts", label: "Price Alerts", desc: "Get notified of price drops on saved vehicles" },
                    { key: "newListings", label: "New Listings", desc: "Get notified when new EVs match your search" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-gray-500">{item.desc}</p></div>
                      <Switch checked={notifications[item.key as keyof typeof notifications]} onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, [item.key]: v }))} />
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card className="p-6 border-0 shadow-sm bg-white rounded-xl">
                <h3 className="font-semibold mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div><p className="font-medium text-sm">Dark Mode</p><p className="text-xs text-gray-500">Switch to dark theme</p></div>
                    <Switch checked={preferences.darkMode} onCheckedChange={(v) => setPreferences((prev) => ({ ...prev, darkMode: v }))} />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div><p className="font-medium text-sm">AI Recommendations</p><p className="text-xs text-gray-500">Personalized vehicle suggestions</p></div>
                    <Switch checked={preferences.aiRecommendations} onCheckedChange={(v) => setPreferences((prev) => ({ ...prev, aiRecommendations: v }))} />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div><p className="font-medium text-sm">Language</p><p className="text-xs text-gray-500">Choose your preferred language</p></div>
                    <span className="text-sm text-gray-700">English</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div><p className="font-medium text-sm">Currency</p><p className="text-xs text-gray-500">Choose your preferred currency</p></div>
                    <span className="text-sm text-gray-700">INR (₹)</span>
                  </div>
                </div>
              </Card>
              <Card className="p-6 border-0 shadow-sm bg-white rounded-xl">
                <h3 className="font-semibold mb-4 text-red-600">Danger Zone</h3>
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-sm">Delete Account</p><p className="text-xs text-gray-500">Permanently delete your account and all data</p></div>
                  <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>Delete Account</Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
