"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Car,
  Landmark,
  Shield,
  Lightbulb,
  TrendingDown,
  Percent,
  FileText,
  Zap,
  ArrowRight,
  Check,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const BANKS = [
  {
    name: "HDFC Bank",
    rate: 7.5,
    maxAmount: "₹80 Lakh",
    tenure: "Up to 84 months",
    processingFee: "₹4,999",
    features: ["Lowest interest rate", "Quick approval in 24h", "Flexible EMI options", "No foreclosure charges"],
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    name: "ICICI Bank",
    rate: 7.9,
    maxAmount: "₹75 Lakh",
    tenure: "Up to 72 months",
    processingFee: "₹5,499",
    features: ["100% online process", "Zero documentation", "Pre-approved offers", "Balance transfer option"],
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    name: "SBI",
    rate: 8.2,
    maxAmount: "₹70 Lakh",
    tenure: "Up to 84 months",
    processingFee: "₹3,999",
    features: ["Government bank trust", "Lowest processing fee", "EV-specific schemes", "Longer tenure available"],
    color: "text-blue-800",
    bg: "bg-blue-50",
  },
  {
    name: "Axis Bank",
    rate: 8.5,
    maxAmount: "₹65 Lakh",
    tenure: "Up to 60 months",
    processingFee: "₹5,999",
    features: ["Instant e-approval", "Step-up EMI option", "Insurance bundled deals", "Dedicated relationship manager"],
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

const TIPS = [
  { icon: TrendingDown, title: "Higher Down Payment", desc: "Pay 30-40% upfront to significantly reduce your interest burden and monthly EMIs." },
  { icon: Landmark, title: "Compare Banks", desc: "Even a 0.5% rate difference can save lakhs over the loan tenure. Always compare." },
  { icon: Zap, title: "EV Tax Benefits", desc: "Claim tax deductions on EV loan interest under Section 80EEB up to ₹1.5L per year." },
  { icon: Shield, title: "Insurance Bundling", desc: "Bundling loan and insurance often gets you discounted premiums and hassle-free claims." },
];

function calcEMI(principal: number, annualRate: number, months: number) {
  if (principal <= 0 || months <= 0) return { emi: 0, interest: 0, total: 0 };
  const r = annualRate / 12 / 100;
  if (r === 0) return { emi: principal / months, interest: 0, total: principal };
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = emi * months;
  return { emi, interest: total - principal, total };
}

function calcInsurancePremium(value: number, age: string, claims: string): number {
  if (value <= 0) return 0;
  let base = value * 0.035;
  if (age === "3-5") base *= 1.2;
  else if (age === "5+") base *= 1.5;
  if (claims === "1") base *= 1.15;
  else if (claims === "2+") base *= 1.4;
  return Math.round(base);
}

function formatINR(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default function FinancingPage() {
  // Loan calculator state
  const [vehiclePrice, setVehiclePrice] = useState(1500000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [loanMonths, setLoanMonths] = useState("48");
  const [interestRate, setInterestRate] = useState("8.5");

  const loanAmount = vehiclePrice * (1 - downPaymentPct / 100);
  const loan = useMemo(
    () => calcEMI(loanAmount, Number(interestRate), Number(loanMonths)),
    [loanAmount, interestRate, loanMonths]
  );

  // Insurance state
  const [insValue, setInsValue] = useState("");
  const [insAge, setInsAge] = useState("0-1");
  const [insClaims, setInsClaims] = useState("0");
  const insPremium = useMemo(
    () => calcInsurancePremium(Number(insValue) || 0, insAge, insClaims),
    [insValue, insAge, insClaims]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-100">
              <Car className="h-6 w-6 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">EV Financing</h1>
          </div>
          <p className="text-muted-foreground ml-11 text-base">
            Smart financing solutions for your electric vehicle. Calculate, compare, and apply.
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="calculator" className="gap-1.5">
              <FileText className="h-4 w-4" /> Loan Calculator
            </TabsTrigger>
            <TabsTrigger value="offers" className="gap-1.5">
              <Landmark className="h-4 w-4" /> Loan Offers
            </TabsTrigger>
            <TabsTrigger value="insurance" className="gap-1.5">
              <Shield className="h-4 w-4" /> Insurance
            </TabsTrigger>
          </TabsList>

          {/* ── Loan Calculator ── */}
          <TabsContent value="calculator">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="grid lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Loan Parameters</CardTitle>
                  <CardDescription>Adjust sliders to calculate your EMI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-7">
                  {/* Vehicle Price */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Vehicle Price</Label>
                      <span className="font-semibold text-emerald-600">{formatINR(vehiclePrice)}</span>
                    </div>
                    <Slider
                      value={[vehiclePrice]}
                      onValueChange={([v]) => setVehiclePrice(v)}
                      min={100000}
                      max={10000000}
                      step={50000}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₹1 Lakh</span>
                      <span>₹1 Crore</span>
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Down Payment</Label>
                      <span className="font-semibold text-emerald-600">
                        {downPaymentPct}% ({formatINR(vehiclePrice * downPaymentPct / 100)})
                      </span>
                    </div>
                    <Slider
                      value={[downPaymentPct]}
                      onValueChange={([v]) => setDownPaymentPct(v)}
                      min={0}
                      max={50}
                      step={5}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  {/* Loan Duration & Interest Rate */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Loan Duration</Label>
                      <Select value={loanMonths} onValueChange={setLoanMonths}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[12, 24, 36, 48, 60, 72, 84].map((m) => (
                            <SelectItem key={m} value={String(m)}>
                              {m} months ({Math.round(m / 12)} yr{m > 12 ? "s" : ""})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Interest Rate</Label>
                      <Select value={interestRate} onValueChange={setInterestRate}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((r) => (
                            <SelectItem key={r} value={String(r)}>
                              {r}% p.a.
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <Card className="lg:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-0">
                <CardContent className="p-8 flex flex-col h-full justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm mb-1">Monthly EMI</p>
                    <p className="text-5xl font-bold tracking-tight mb-8">
                      {formatINR(loan.emi)}
                    </p>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-100">Loan Amount</span>
                        <span className="font-semibold">{formatINR(loanAmount)}</span>
                      </div>
                      <div className="h-px bg-emerald-500/40" />
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-100">Total Interest</span>
                        <span className="font-semibold">{formatINR(loan.interest)}</span>
                      </div>
                      <div className="h-px bg-emerald-500/40" />
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-100">Total Payable</span>
                        <span className="font-semibold">{formatINR(loan.total)}</span>
                      </div>
                    </div>
                  </div>
                  <Button className="mt-8 w-full bg-white text-emerald-700 hover:bg-emerald-50 font-semibold">
                    Apply for Loan <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Loan Offers ── */}
          <TabsContent value="offers">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="grid sm:grid-cols-2 gap-5">
              {BANKS.map((bank) => (
                <Card key={bank.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", bank.bg)}>
                          <Landmark className={cn("h-5 w-5", bank.color)} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{bank.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">{bank.tenure}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Percent className="h-3 w-3" /> {bank.rate}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Max Amount</p>
                        <p className="font-medium">{bank.maxAmount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Processing Fee</p>
                        <p className="font-medium">{bank.processingFee}</p>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {bank.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-2" variant="outline">
                      Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </TabsContent>

          {/* ── Insurance ── */}
          <TabsContent value="insurance">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="grid lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Insurance Quote</CardTitle>
                  <CardDescription>Get an estimated premium for your EV</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label>Vehicle Value (On-road)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="e.g. 1500000"
                        className="pl-9"
                        value={insValue}
                        onChange={(e) => setInsValue(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vehicle Age</Label>
                      <Select value={insAge} onValueChange={setInsAge}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">New (0-1 year)</SelectItem>
                          <SelectItem value="1-3">1-3 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5+">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Claim History</Label>
                      <Select value={insClaims} onValueChange={setInsClaims}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No claims</SelectItem>
                          <SelectItem value="1">1 previous claim</SelectItem>
                          <SelectItem value="2+">2+ claims</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center">
                  <p className="text-muted-foreground text-sm mb-2">Estimated Annual Premium</p>
                  <p className="text-4xl font-bold text-emerald-600 mb-1">
                    {insValue ? formatINR(insPremium) : "—"}
                  </p>
                  {insValue && (
                    <p className="text-xs text-muted-foreground mb-6">
                      ≈ {formatINR(insPremium / 12)}/month
                    </p>
                  )}
                  <Button className="w-full max-w-xs" disabled={!insValue}>
                    Get Insurance Quote <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* ── Smart Tips ── */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mt-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <CardTitle>Smart Financing Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TIPS.map((tip) => (
                <div key={tip.title} className="space-y-2">
                  <tip.icon className="h-5 w-5 text-emerald-600" />
                  <p className="font-semibold text-sm">{tip.title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
