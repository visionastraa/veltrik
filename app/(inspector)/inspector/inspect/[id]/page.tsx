"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, ArrowRight, Check, Camera, Video, X, Upload,
  Battery, Gauge, Shield, AlertTriangle, Star, Car, User,
  MapPin, Clock, Calendar, Phone, Navigation, FileText, Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useInspectorInspection, useSubmitInspection } from "@/hooks/use-inspector-api"



const steps = [
  { id: "vehicle", label: "Vehicle", icon: Car },
  { id: "visual", label: "Visual", icon: Shield },
  { id: "technical", label: "Technical", icon: Battery },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "summary", label: "Summary", icon: Check },
]

export default function InspectionForm() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: inspectionRes, isLoading, isError } = useInspectorInspection(params.id as string)
  const submitMutation = useSubmitInspection()
  const isSubmitting = submitMutation.isPending

  const inspection = inspectionRes?.data ?? null

  const vehicle = inspection
    ? {
        make: inspection.sellerLead.make,
        model: inspection.sellerLead.model,
        variant: inspection.sellerLead.variant,
        vehicleNumber: inspection.sellerLead.vehicleNumber,
        year: inspection.sellerLead.year,
        owner: inspection.sellerLead.user.name,
        location: "",
        scheduledAt: inspection.createdAt,
        batteryEstimate: inspection.batteryHealth ?? 0,
        expectedPrice: inspection.sellerLead.expectedPrice,
      }
    : null

  // Form state
  const [form, setForm] = useState({
    ageYears: 0,
    ageMonths: 0,
    kmDriven: 0,
    bodyDamage: "pass" as string,
    forkDamage: false,
    accidentHistory: "clean" as string,
    warrantyStatus: "under_warranty" as string,
    warrantyType: "standard" as string,
    warrantyExpiry: "",
    partsReplaced: false,
    replacedParts: "",
    adminComments: "",
    batteryCharge: 75,
    batteryHealth: 85,
    batteryVoltage: 0,
    physicalDamage: false,
    brakeSystem: "pass" as string,
    brakePads: "good" as string,
    wheelAlignment: "aligned" as string,
    testDriveRating: 0,
    testDriveNotes: "",
    techComments: "",
  })

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  useEffect(() => {
    if (!inspection) return
    setForm({
      ageYears: inspection.ageYears ?? 0,
      ageMonths: inspection.ageMonths ?? 0,
      kmDriven: inspection.kmDriven ?? 0,
      bodyDamage: inspection.bodyDamage ?? "pass",
      forkDamage: false,
      accidentHistory: inspection.accidentHistory ?? "clean",
      warrantyStatus: inspection.warrantyStatus ?? "under_warranty",
      warrantyType: "standard",
      warrantyExpiry: "",
      partsReplaced: false,
      replacedParts: "",
      adminComments: "",
      batteryCharge: inspection.batteryCharge ?? 75,
      batteryHealth: inspection.batteryHealth ?? 85,
      batteryVoltage: 0,
      physicalDamage: false,
      brakeSystem: inspection.brakeSystem ?? "pass",
      brakePads: "good",
      wheelAlignment: "aligned",
      testDriveRating: inspection.testDriveRating ?? 0,
      testDriveNotes: inspection.testDriveNotes ?? "",
      techComments: "",
    })
  }, [inspection])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const arr = Array.from(files)
    setUploadedPhotos((p) => [...p, ...arr.filter((f) => f.type.startsWith("image/")).map((f) => URL.createObjectURL(f))])
    setUploadedVideos((p) => [...p, ...arr.filter((f) => f.type.startsWith("video/")).map((f) => URL.createObjectURL(f))])
  }

  const removeFile = (type: "photos" | "videos", idx: number) => {
    if (type === "photos") setUploadedPhotos((p) => p.filter((_, i) => i !== idx))
    else setUploadedVideos((p) => p.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!inspection) return
    submitMutation.mutate(
      { ...form, sellerLeadId: inspection.sellerLead.id },
      {
        onSuccess: () => {
          toast({ title: "Inspection Submitted", description: "The inspection report has been sent to admin for review." })
          router.push("/inspector")
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to submit inspection. Please try again.", variant: "destructive" })
        },
      }
    )
  }

  const calculateScore = () => {
    let score = 0
    if (form.batteryHealth > 0) score += (form.batteryHealth / 100) * 35
    if (form.kmDriven < 10000) score += 20
    else if (form.kmDriven < 30000) score += 15
    else if (form.kmDriven < 50000) score += 10
    else score += 5
    if (form.bodyDamage === "pass") score += 15
    else if (form.bodyDamage === "minor") score += 8
    if (form.brakeSystem === "pass") score += 10
    if (form.accidentHistory === "clean") score += 5
    return Math.round(score)
  }

  const getScoreColor = (v: number) => (v >= 80 ? "text-green-500" : v >= 60 ? "text-amber-500" : "text-red-500")

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-96" />
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-96 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !vehicle) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Inspection</h2>
          <p className="text-gray-500 mb-4">Could not load the inspection data. Please try again.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Inspection Form</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{vehicle.make} {vehicle.model}</span>
              <span>·</span>
              <span>{vehicle.vehicleNumber}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(vehicle.scheduledAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700">In Progress</Badge>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all", idx + 1 === step ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" : idx + 1 < step ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500")}>
                  {idx + 1 < step ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={cn("text-sm font-medium hidden sm:inline", idx + 1 === step ? "text-gray-900" : "text-gray-500")}>{s.label}</span>
              </div>
              {idx < steps.length - 1 && <div className={cn("w-12 h-0.5 mx-2", idx + 1 < step ? "bg-green-500" : "bg-gray-200")} />}
            </div>
          ))}
        </div>
        <Progress value={(step / steps.length) * 100} className="mt-4 h-2" />
      </div>

      {/* Form Card */}
      <Card className="p-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        {/* Vehicle Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
          <div className="flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><Car className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-gray-500">Vehicle</p><p className="font-medium text-sm">{vehicle.make} {vehicle.model}</p></div></div>
          <div className="flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><User className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-gray-500">Owner</p><p className="font-medium text-sm">{vehicle.owner}</p></div></div>
          <div className="flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><MapPin className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-gray-500">Location</p><p className="font-medium text-sm truncate">{vehicle.location}</p></div></div>
          <div className="flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><Battery className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-gray-500">Battery Est.</p><p className="font-medium text-sm">{vehicle.batteryEstimate}%</p></div></div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

            {/* STEP 1: Vehicle Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div><h3 className="text-lg font-semibold">Vehicle Information</h3><p className="text-sm text-gray-500">Confirm vehicle details before inspection</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Age of Vehicle</Label>
                    <div className="grid grid-cols-2 gap-4 mt-1.5">
                      <Input type="number" placeholder="Years" value={form.ageYears} onChange={(e) => update("ageYears", +e.target.value)} />
                      <Input type="number" placeholder="Months" value={form.ageMonths} onChange={(e) => update("ageMonths", +e.target.value)} />
                    </div>
                  </div>
                  <div><Label>Current KM Driven</Label><Input type="number" placeholder="Odometer reading" value={form.kmDriven || ""} onChange={(e) => update("kmDriven", +e.target.value)} className="mt-1.5" /></div>
                </div>
                <div><Label>Additional Notes</Label><Textarea placeholder="Any additional vehicle information..." value={form.adminComments} onChange={(e) => update("adminComments", e.target.value)} className="mt-1.5" /></div>
              </div>
            )}

            {/* STEP 2: Visual Inspection */}
            {step === 2 && (
              <div className="space-y-8">
                <div><h3 className="text-lg font-semibold">Visual & Administrative Inspection</h3><p className="text-sm text-gray-500">Evaluate the vehicle&apos;s physical condition</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Body Damage</Label>
                    <RadioGroup value={form.bodyDamage} onValueChange={(v) => update("bodyDamage", v)} className="flex gap-4 mt-1.5">
                      <div className="flex items-center gap-2"><RadioGroupItem value="pass" id="bd-pass" /><Label htmlFor="bd-pass" className="text-green-600">Pass</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="minor" id="bd-minor" /><Label htmlFor="bd-minor" className="text-amber-600">Minor</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="severe" id="bd-severe" /><Label htmlFor="bd-severe" className="text-red-600">Severe</Label></div>
                    </RadioGroup>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div><Label>Fork Damage</Label><p className="text-sm text-gray-500">Front fork condition</p></div>
                    <Switch checked={form.forkDamage} onCheckedChange={(v) => update("forkDamage", v)} />
                  </div>
                  <div>
                    <Label>Accident History</Label>
                    <RadioGroup value={form.accidentHistory} onValueChange={(v) => update("accidentHistory", v)} className="flex gap-4 mt-1.5">
                      <div className="flex items-center gap-2"><RadioGroupItem value="clean" id="ah-clean" /><Label htmlFor="ah-clean" className="text-green-600">Clean</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="history_found" id="ah-found" /><Label htmlFor="ah-found" className="text-red-600">History Found</Label></div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label>Warranty Status</Label>
                    <RadioGroup value={form.warrantyStatus} onValueChange={(v) => update("warrantyStatus", v)} className="flex gap-4 mt-1.5">
                      <div className="flex items-center gap-2"><RadioGroupItem value="under_warranty" id="ws-under" /><Label htmlFor="ws-under" className="text-green-600">Under Warranty</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="out_of_warranty" id="ws-out" /><Label htmlFor="ws-out" className="text-red-600">Out of Warranty</Label></div>
                    </RadioGroup>
                  </div>
                </div>
                {form.warrantyStatus === "under_warranty" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div>
                      <Label>Warranty Type</Label>
                      <RadioGroup value={form.warrantyType} onValueChange={(v) => update("warrantyType", v)} className="flex gap-4 mt-1.5">
                        <div className="flex items-center gap-2"><RadioGroupItem value="standard" id="wt-std" /><Label htmlFor="wt-std">Standard</Label></div>
                        <div className="flex items-center gap-2"><RadioGroupItem value="extended" id="wt-ext" /><Label htmlFor="wt-ext">Extended</Label></div>
                      </RadioGroup>
                    </div>
                    <div><Label>Warranty Expiry Date</Label><Input type="date" value={form.warrantyExpiry} onChange={(e) => update("warrantyExpiry", e.target.value)} className="mt-1.5" /></div>
                  </motion.div>
                )}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div><Label>Parts Replaced Under Warranty</Label><p className="text-sm text-gray-500">Any warranty parts replaced?</p></div>
                    <Switch checked={form.partsReplaced} onCheckedChange={(v) => update("partsReplaced", v)} />
                  </div>
                  {form.partsReplaced && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <Label>Replaced Parts List</Label>
                      <Textarea placeholder="List all replaced parts..." value={form.replacedParts} onChange={(e) => update("replacedParts", e.target.value)} className="mt-1.5" />
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Technical */}
            {step === 3 && (
              <div className="space-y-8">
                <div><h3 className="text-lg font-semibold">Technical & Performance Inspection</h3><p className="text-sm text-gray-500">Evaluate vehicle performance and systems</p></div>

                <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h4 className="font-medium flex items-center gap-2"><Battery className="w-4 h-4 text-blue-500" /> Battery System</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Battery Charge Level</Label>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Slider value={[form.batteryCharge]} max={100} step={1} onValueChange={(v) => update("batteryCharge", v[0])} className="flex-1" />
                        <span className="text-sm font-medium min-w-[40px]">{form.batteryCharge}%</span>
                      </div>
                    </div>
                    <div>
                      <Label>Battery Health</Label>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Slider value={[form.batteryHealth]} max={100} step={1} onValueChange={(v) => update("batteryHealth", v[0])} className="flex-1" />
                        <span className="text-sm font-medium min-w-[40px]">{form.batteryHealth}%</span>
                      </div>
                    </div>
                    <div><Label>Battery Voltage (V)</Label><Input type="number" placeholder="e.g., 400" value={form.batteryVoltage || ""} onChange={(e) => update("batteryVoltage", +e.target.value)} className="mt-1.5" /></div>
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-red-50 rounded-xl border border-red-100">
                  <h4 className="font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Brake System</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Brake System</Label>
                      <RadioGroup value={form.brakeSystem} onValueChange={(v) => update("brakeSystem", v)} className="flex gap-4 mt-1.5">
                        <div className="flex items-center gap-2"><RadioGroupItem value="pass" id="bs-pass" /><Label htmlFor="bs-pass" className="text-green-600">Pass</Label></div>
                        <div className="flex items-center gap-2"><RadioGroupItem value="needs_repair" id="bs-repair" /><Label htmlFor="bs-repair" className="text-red-600">Needs Repair</Label></div>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label>Brake Pads</Label>
                      <RadioGroup value={form.brakePads} onValueChange={(v) => update("brakePads", v)} className="flex gap-4 mt-1.5">
                        <div className="flex items-center gap-2"><RadioGroupItem value="good" id="bp-good" /><Label htmlFor="bp-good" className="text-green-600">Good</Label></div>
                        <div className="flex items-center gap-2"><RadioGroupItem value="worn" id="bp-worn" /><Label htmlFor="bp-worn" className="text-red-600">Worn</Label></div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Wheel Alignment</Label>
                  <RadioGroup value={form.wheelAlignment} onValueChange={(v) => update("wheelAlignment", v)} className="flex gap-4 mt-1.5">
                    <div className="flex items-center gap-2"><RadioGroupItem value="aligned" id="wa-aligned" /><Label htmlFor="wa-aligned" className="text-green-600">Aligned</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="needs_alignment" id="wa-needs" /><Label htmlFor="wa-needs" className="text-red-600">Needs Alignment</Label></div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div><Label>Physical Damage (External)</Label><p className="text-sm text-gray-500">Any visible external damage?</p></div>
                  <Switch checked={form.physicalDamage} onCheckedChange={(v) => update("physicalDamage", v)} />
                </div>

                <div className="space-y-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <h4 className="font-medium flex items-center gap-2"><Gauge className="w-4 h-4 text-amber-500" /> Test Drive</h4>
                  <div>
                    <Label>Test Drive Rating</Label>
                    <div className="flex gap-2 mt-1.5">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button key={r} type="button" onClick={() => update("testDriveRating", r)} className={cn("p-2 rounded-lg transition-all", form.testDriveRating >= r ? "text-yellow-500 scale-110" : "text-gray-300 hover:text-gray-400")}>
                          <Star className={cn("w-6 h-6", form.testDriveRating >= r ? "fill-yellow-500" : "")} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><Label>Test Drive Notes</Label><Textarea placeholder="Describe test drive experience..." value={form.testDriveNotes} onChange={(e) => update("testDriveNotes", e.target.value)} className="mt-1.5" /></div>
                </div>

                <div><Label>Additional Technical Comments</Label><Textarea placeholder="Any additional technical observations..." value={form.techComments} onChange={(e) => update("techComments", e.target.value)} className="mt-1.5" /></div>
              </div>
            )}

            {/* STEP 4: Photos */}
            {step === 4 && (
              <div className="space-y-6">
                <div><h3 className="text-lg font-semibold">Photo & Video Documentation</h3><p className="text-sm text-gray-500">Upload photos and videos of the vehicle</p></div>
                <div>
                  <Label>Photos</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                    {uploadedPhotos.map((photo, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                        <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeFile("photos", i)} className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100"><X className="w-3 h-3 text-white" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-colors flex flex-col items-center justify-center gap-2">
                      <Camera className="w-8 h-8 text-gray-400" /><span className="text-sm text-gray-500">Upload Photo</span>
                    </button>
                  </div>
                </div>
                <div>
                  <Label>Videos</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                    {uploadedVideos.map((video, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-200"><Video className="w-10 h-10 text-gray-400" /></div>
                        <button type="button" onClick={() => removeFile("videos", i)} className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100"><X className="w-3 h-3 text-white" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-colors flex flex-col items-center justify-center gap-2">
                      <Video className="w-8 h-8 text-gray-400" /><span className="text-sm text-gray-500">Upload Video</span>
                    </button>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileUpload} />
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-medium text-sm text-blue-700">Tips for Better Documentation</h4>
                  <ul className="text-sm text-blue-600 mt-2 space-y-1">
                    <li>· Take photos in good lighting</li><li>· Capture all angles of the vehicle</li><li>· Focus on any damage or wear</li><li>· Include close-ups of important components</li><li>· Videos should be steady and well-lit</li>
                  </ul>
                </div>
              </div>
            )}

            {/* STEP 5: Summary */}
            {step === 5 && (
              <div className="space-y-6">
                <div><h3 className="text-lg font-semibold">Inspection Summary</h3><p className="text-sm text-gray-500">Review all information before submitting</p></div>
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Overall Condition Score</p>
                      <p className={cn("text-4xl font-bold", getScoreColor(calculateScore()))}>{calculateScore()}</p>
                      <p className="text-sm text-gray-500 mt-1">{calculateScore() >= 80 ? "Excellent Condition" : calculateScore() >= 60 ? "Good Condition" : "Fair Condition"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Estimated Offer</p>
                      <p className="text-2xl font-bold text-emerald-600">₹{Math.round(vehicle.expectedPrice * (calculateScore() / 100) * 0.8).toLocaleString()}</p>
                      <Badge variant="outline" className="mt-1">{calculateScore() >= 85 ? "Premium" : calculateScore() >= 70 ? "Good" : calculateScore() >= 50 ? "Fair" : "Reject"}</Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Vehicle Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Make/Model</span><span>{vehicle.make} {vehicle.model}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Variant</span><span>{vehicle.variant}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Registration</span><span>{vehicle.vehicleNumber}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">KM Driven</span><span>{form.kmDriven.toLocaleString()}</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Inspection Results</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Battery Health</span><span className={getScoreColor(form.batteryHealth)}>{form.batteryHealth}%</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Body Damage</span><span className={form.bodyDamage === "pass" ? "text-green-500" : form.bodyDamage === "minor" ? "text-amber-500" : "text-red-500"}>{form.bodyDamage}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Accident History</span><span className={form.accidentHistory === "clean" ? "text-green-500" : "text-red-500"}>{form.accidentHistory}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Test Drive Rating</span><span className="flex items-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} className={cn("w-3 h-3", i < form.testDriveRating ? "fill-yellow-500 text-yellow-500" : "text-gray-300")} />)}</span></div>
                    </div>
                  </div>
                </div>
                {(uploadedPhotos.length > 0 || uploadedVideos.length > 0) && (
                  <div>
                    <h4 className="font-medium mb-3">Media Uploaded</h4>
                    <div className="flex gap-2 flex-wrap">
                      {uploadedPhotos.length > 0 && <Badge variant="outline" className="flex items-center gap-1"><Camera className="w-3 h-3" /> {uploadedPhotos.length} photos</Badge>}
                      {uploadedVideos.length > 0 && <Badge variant="outline" className="flex items-center gap-1"><Video className="w-3 h-3" /> {uploadedVideos.length} videos</Badge>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button type="button" variant="outline" onClick={() => setStep((p) => Math.max(1, p - 1))} disabled={step === 1}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <div className="flex gap-2">
            {step < steps.length ? (
              <Button type="button" onClick={() => setStep((p) => Math.min(steps.length, p + 1))} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-500 hover:bg-green-600 text-white">
                {isSubmitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Submitting...</>) : (<><Check className="w-4 h-4 mr-2" /> Submit Inspection</>)}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
