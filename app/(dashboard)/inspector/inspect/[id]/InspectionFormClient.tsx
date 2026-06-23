"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import FormProgress from "@/components/inspector/InspectionForm/FormProgress";
import FormNavigation from "@/components/inspector/InspectionForm/FormNavigation";
import Part1 from "@/components/inspector/InspectionForm/Part1";
import Part2 from "@/components/inspector/InspectionForm/Part2";

interface InspectionFormClientProps {
  sellerLeadId: string;
  vehicleName: string;
  sellerName: string;
  sellerPhone: string;
  initialInspection?: any;
}

export default function InspectionFormClient({
  sellerLeadId,
  initialInspection,
}: InspectionFormClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    // Simple Part 1 client-side validation
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
    setIsSubmitting(true);
    setError(null);

    // Simple Part 2 client-side validation
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

  return (
    <div className="space-y-6">
      {/* Progress visual tracker */}
      <FormProgress currentStep={step} />

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

      {/* Form sections */}
      <div className="max-w-4xl mx-auto">
        {step === 1 ? (
          <Part1 data={part1} onChange={handlePart1Change} />
        ) : (
          <Part2 data={part2} onChange={handlePart2Change} />
        )}

        {/* Action Controls */}
        <FormNavigation
          currentStep={step}
          onBack={handleBack}
          onNext={step === 1 ? handleNext : handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
