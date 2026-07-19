"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Upload, Scan, X, FileDown, Share2, Calendar,
  CheckCircle2, ArrowRight, Zap, Shield, Clock, IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STEPS = ["Scan Vehicle", "Vehicle Details", "Photos", "Estimate"];
const MAKES = ["Tesla", "Tata", "MG", "Hyundai", "Kia", "BYD", "Mercedes"];
const MODELS = ["Model 3", "Model Y", "Nexon EV", "ZS EV", "Ioniq 5", "EV6", "EQS"];
const YEARS = ["2024", "2023", "2022", "2021", "2020"];
const CONDITIONS = ["Excellent", "Good", "Fair", "Needs Repair"];

const MARKET = [
  { label: "Veltrik Offer", value: "₹28,99,000", highlight: true },
  { label: "Cars24", value: "₹26,50,000" },
  { label: "OLX", value: "₹25,80,000" },
  { label: "Dealer", value: "₹24,20,000" },
];

const TIPS = [
  { icon: Shield, title: "Fair Assessment", desc: "AI-powered transparent pricing" },
  { icon: Clock, title: "Quick Process", desc: "Estimate in under 5 minutes" },
  { icon: IndianRupee, title: "Best Price", desc: "Up to 15% more than market average" },
  { icon: Zap, title: "Instant Payment", desc: "Receive payment within 24 hours" },
];

type VehicleData = { make: string; model: string; year: string; kmDriven: string; registration: string; condition: string; details: string };

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-2">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors", step > i ? "border-primary bg-primary text-primary-foreground" : step === i ? "border-primary bg-primary/10 text-primary" : "border-muted-foreground/30 bg-background")}>
              {step > i ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-medium">{i + 1}</span>}
            </div>
            <span className={cn("text-xs font-medium hidden sm:block", step >= i ? "text-primary" : "text-muted-foreground")}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={cn("mx-2 h-0.5 w-12 sm:w-20", step > i ? "bg-primary" : "bg-muted-foreground/20")} />}
        </div>
      ))}
    </div>
  );
}

function SelectField({ label, value, onValueChange, items }: { label: string; value: string; onValueChange: (v: string) => void; items: string[] }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger>
        <SelectContent>{items.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

export default function TradeInPage() {
  const [step, setStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [images, setImages] = useState(["/car-1.jpg", "/car-2.jpg"]);
  const [vehicle, setVehicle] = useState<VehicleData>({ make: "", model: "", year: "", kmDriven: "", registration: "", condition: "", details: "" });

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const iv = setInterval(() => {
      setScanProgress((p) => { if (p >= 100) { clearInterval(iv); setIsScanning(false); setStep(2); return 100; } return p + 5; });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Trade-In Your EV</h1>
          <p className="text-muted-foreground">Get an instant estimate for your electric vehicle</p>
        </div>

        <StepIndicator step={step} />

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {step === 1 && (
              <Card>
                <CardContent className="p-8">
                  {isScanning ? (
                    <div className="flex flex-col items-center gap-6 py-12">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="relative">
                        <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary" />
                        <Scan className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-primary" />
                      </motion.div>
                      <div className="w-full max-w-xs space-y-2">
                        <p className="text-center text-sm text-muted-foreground">Scanning vehicle...</p>
                        <Progress value={scanProgress} className="h-2" />
                        <p className="text-center text-xs text-muted-foreground">{scanProgress}% Complete</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-12 text-center">
                        <Scan className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4 text-lg font-medium">Scan or upload your vehicle</p>
                        <p className="mt-1 text-sm text-muted-foreground">Use AI to auto-detect your EV details</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Button onClick={startScan} size="lg"><Camera className="mr-2 h-5 w-5" />Scan Vehicle</Button>
                        <Button onClick={() => setStep(2)} variant="outline" size="lg"><Upload className="mr-2 h-5 w-5" />Upload Photo</Button>
                        <Button onClick={startScan} variant="outline" size="lg"><Zap className="mr-2 h-5 w-5" />AI Auto-Detect</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader><CardTitle>Vehicle Details</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <SelectField label="Make" value={vehicle.make} onValueChange={(v) => setVehicle((p) => ({ ...p, make: v }))} items={MAKES} />
                    <SelectField label="Model" value={vehicle.model} onValueChange={(v) => setVehicle((p) => ({ ...p, model: v }))} items={MODELS} />
                    <SelectField label="Year" value={vehicle.year} onValueChange={(v) => setVehicle((p) => ({ ...p, year: v }))} items={YEARS} />
                    <SelectField label="Condition" value={vehicle.condition} onValueChange={(v) => setVehicle((p) => ({ ...p, condition: v }))} items={CONDITIONS} />
                    <div className="space-y-2">
                      <Label>KM Driven</Label>
                      <Input type="number" placeholder="e.g. 25000" value={vehicle.kmDriven} onChange={(e) => setVehicle((p) => ({ ...p, kmDriven: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Registration</Label>
                      <Input placeholder="e.g. MH12AB1234" value={vehicle.registration} onChange={(e) => setVehicle((p) => ({ ...p, registration: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Additional Details</Label>
                    <Textarea placeholder="Modifications, damage, or special features..." rows={3} value={vehicle.details} onChange={(e) => setVehicle((p) => ({ ...p, details: e.target.value }))} />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={() => setStep(3)}>Continue<ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader><CardTitle>Upload Photos</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {images.map((_, i) => (
                      <div key={i} className="group relative aspect-square">
                        <div className="h-full w-full rounded-lg bg-muted" />
                        <Button size="icon" variant="destructive" className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setImages((p) => p.filter((_, j) => j !== i))}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Badge className="absolute bottom-2 left-2" variant="secondary">{i + 1}</Badge>
                      </div>
                    ))}
                    <button className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground/50" />
                      <span className="mt-2 text-xs text-muted-foreground">Add Photo</span>
                    </button>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button onClick={() => setStep(4)}>Get Estimate<ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-8 text-center">
                    <p className="text-sm font-medium text-muted-foreground">Estimated Trade-In Value</p>
                    <p className="mt-2 text-5xl font-bold text-primary">₹28,99,000</p>
                    <p className="mt-2 text-sm text-muted-foreground">Range: ₹27,50,000 - ₹30,50,000</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <Button size="lg"><IndianRupee className="mr-2 h-5 w-5" />Sell Now</Button>
                      <Button size="lg" variant="outline"><Calendar className="mr-2 h-5 w-5" />Schedule Inspection</Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Market Comparison</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {MARKET.map((item) => (
                        <div key={item.label} className={cn("flex items-center justify-between rounded-lg p-4", item.highlight ? "bg-primary/10 ring-1 ring-primary/20" : "bg-muted/50")}>
                          <span className="font-medium">{item.label}</span>
                          <span className={cn("text-lg font-bold", item.highlight && "text-primary")}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                      <Button variant="outline" size="sm"><FileDown className="mr-2 h-4 w-4" />Download Report</Button>
                      <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" />Share</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Why Trade-In with Veltrik?</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TIPS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
