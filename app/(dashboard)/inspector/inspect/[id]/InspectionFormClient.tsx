"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Phone, MapPin, Play, Calendar, DollarSign, Image as ImageIcon } from "lucide-react";
import FormProgress from "@/components/inspector/InspectionForm/FormProgress";
import FormNavigation from "@/components/inspector/InspectionForm/FormNavigation";
import Part1 from "@/components/inspector/InspectionForm/Part1";
import Part2 from "@/components/inspector/InspectionForm/Part2";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InspectionFormClientProps {
  sellerLeadId: string;
  vehicleName: string;
  sellerName: string;
  sellerPhone: string;
  askingPrice: number | null;
  make: string;
  model: string;
  year: number;
  photos: string; // JSON array as string
  initialInspection?: any;
  readOnly?: boolean;
}

export default function InspectionFormClient({
  sellerLeadId,
  vehicleName,
  sellerName,
  sellerPhone,
  askingPrice,
  make,
  model,
  year,
  photos,
  initialInspection,
  readOnly = false,
}: InspectionFormClientProps) {
  const router = useRouter();
  
  // State for toggling between detailed vehicle overview and active inspection form
  const [isInspecting, setIsInspecting] = useState(!!initialInspection);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Parse photos JSON
  let parsedPhotos: string[] = [];
  try {
    parsedPhotos = JSON.parse(photos || "[]");
  } catch (e) {
    parsedPhotos = [];
  }

  // Initialize form state
  const [part1, setPart1] = useState({
    ageYears: initialInspection?.ageYears || 0,
    ageMonths: initialInspection?.ageMonths || 0,
    kmDriven: initialInspection?.kmDriven || 0,
    bodyDamage: (initialInspection?.bodyDamage as any) || "pass",
    bodyDamagePhoto: initialInspection?.bodyDamagePhoto || "",
    forkDamage: initialInspection?.forkDamage || false,
    accidentHistory: (initialInspection?.accidentHistory as any) || "clean",
    warrantyStatus: (initialInspection?.warrantyExpiry ? "under_warranty" : "out_of_warranty") as "under_warranty" | "out_of_warranty",
    warrantyType: initialInspection?.warrantyType || "",
    warrantyExpiry: initialInspection?.warrantyExpiry
      ? new Date(initialInspection.warrantyExpiry).toISOString().split("T")[0]
      : "",
    partsReplaced: initialInspection?.partsReplaced || false,
    replacedParts: initialInspection?.replacedParts || "",
    adminComments: initialInspection?.adminComments || "",
  });

  const [part2, setPart2] = useState({
    batteryCharge: initialInspection?.batteryCharge || 0,
    batteryHealth: initialInspection?.batteryHealth || 0,
    batteryVoltage: initialInspection?.batteryVoltage || 0,
    physicalDamage: initialInspection?.physicalDamage || false,
    brakeSystem: (initialInspection?.brakeSystem as any) || "pass",
    brakePads: (initialInspection?.brakePads as any) || "good",
    wheelAlignment: (initialInspection?.wheelAlignment as any) || "aligned",
    testDriveRating: initialInspection?.testDriveRating || 0,
    testDriveNotes: initialInspection?.testDriveNotes || "",
    techComments: initialInspection?.techComments || "",
  });

  const handlePart1Change = (updates: Partial<typeof part1>) => {
    setPart1((prev) => ({ ...prev, ...updates }));
  };

  const handlePart2Change = (updates: Partial<typeof part2>) => {
    setPart2((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (part1.ageYears < 0 || part1.ageMonths < 0 || part1.kmDriven < 0) {
      setError("Please check age and odometer values for accuracy.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleBack = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmit = async () => {
    if (readOnly) {
      router.push("/inspector");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    if (part2.batteryCharge < 0 || part2.batteryCharge > 100 || part2.batteryHealth < 0 || part2.batteryHealth > 100) {
      setError("Battery charge and health must be between 0% and 100%.");
      setIsSubmitting(false);
      return;
    }

    try {
      const combinedData = {
        sellerLeadId,
        ...part1,
        ...part2,
      };

      const res = await fetch("/api/inspection/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(combinedData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit inspection");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/inspector");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  // Render Vehicle Details Mode (Before entering checklist)
  if (!isInspecting) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Main Details and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left panel: Info summary */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-foreground border-b border-border pb-3">
                Vehicle Overview
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Brand</span>
                  <span className="text-base font-bold text-foreground block">{make}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Model</span>
                  <span className="text-base font-bold text-foreground block">{model}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Year of Registration</span>
                  <span className="text-base font-bold text-foreground block">{year}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Expected Price</span>
                  <span className="text-base font-bold text-foreground flex items-center gap-1">
                    <span className="text-emerald-500 font-extrabold text-base">₹</span>
                    <span>{askingPrice ? `${askingPrice.toLocaleString('en-IN')} (Rs. ${askingPrice.toLocaleString('en-IN')})` : "Not Disclosed"}</span>
                  </span>
                </div>
              </div>

              {/* Photos Gallery */}
              <div className="space-y-2 pt-2">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Intake Photos</span>
                {parsedPhotos.length === 0 ? (
                  <div className="border border-border border-dashed rounded-xl p-6 text-center text-muted-foreground flex flex-col items-center justify-center gap-1">
                    <ImageIcon className="size-8 opacity-40" />
                    <span className="text-xs">No photos provided by seller</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {parsedPhotos.map((photoUrl, idx) => (
                      <div key={idx} className="border border-border rounded-lg overflow-hidden aspect-video bg-muted">
                        <img src={photoUrl} alt={`Intake ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Seller contact & Workshop details */}
          <div className="space-y-6">
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2">
                Contact & Location
              </h3>

              <div className="space-y-3">
                {/* Seller Detail */}
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block">Seller Name</span>
                  <span className="text-sm font-bold text-foreground block">{sellerName}</span>
                </div>

                {/* Call Button */}
                {sellerPhone && (
                  <a
                    href={`tel:${sellerPhone}`}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold hover:bg-primary/15 transition-colors cursor-pointer"
                  >
                    <Phone className="size-4" />
                    <span>Call: {sellerPhone}</span>
                  </a>
                )}

                {/* Workshop Location */}
                <div className="border-t border-border pt-3 space-y-1.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold uppercase tracking-wider">
                    <MapPin className="size-3.5" />
                    <span>Inspection Hub</span>
                  </span>
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    Veltrik Workshop Hub, Plot #42, ORR industrial Area, Sector 5, Bangalore
                  </p>
                </div>
              </div>
            </div>

            {/* Launch Checklist Button */}
            <Button
              onClick={() => setIsInspecting(true)}
              size="lg"
              className="w-full flex items-center justify-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/95 text-base py-6 shadow-md"
            >
              <Play className="size-5 fill-primary-foreground" />
              <span>
                {initialInspection 
                  ? "View Completed Checklist" 
                  : readOnly 
                    ? "View Checklist" 
                    : "Start Entering Inspection"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render Checklist Form Mode
  return (
    <div className="space-y-6">
      <FormProgress currentStep={step} />

      {readOnly && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-muted border border-border text-muted-foreground text-sm max-w-4xl mx-auto">
          <AlertCircle className="size-4 shrink-0" />
          <span>You are viewing this inspection in Read-Only mode.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm leading-relaxed max-w-2xl mx-auto">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm leading-relaxed max-w-2xl mx-auto">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <span>Inspection submitted successfully! Redirecting...</span>
        </div>
      )}

      <div className={cn("max-w-4xl mx-auto", readOnly && "pointer-events-none select-none opacity-95")}>
        {step === 1 ? (
          <Part1 data={part1} onChange={handlePart1Change} />
        ) : (
          <Part2 data={part2} onChange={handlePart2Change} />
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <FormNavigation
          currentStep={step}
          onBack={handleBack}
          onNext={step === 1 ? (readOnly ? () => setStep(2) : handleNext) : handleSubmit}
          isSubmitting={isSubmitting}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
