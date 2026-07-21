"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function InspectionActions({ inspectionId, disabled }: { inspectionId: string, disabled: boolean }) {
  const [offer, setOffer] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    if (!offer || isNaN(Number(offer))) {
      toast.error("Please enter a valid numeric final offer.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inspectionId, finalOffer: offer }),
      });
      if (!res.ok) throw new Error("Approval failed");
      toast.success("Inspection approved. Listing created!");
      router.push("/admin/listings");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this vehicle?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inspectionId }),
      });
      if (!res.ok) throw new Error("Rejection failed");
      toast.success("Inspection rejected.");
      router.push("/admin/leads/seller");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return <div className="text-sm text-gray-500 italic">This inspection has already been processed.</div>;
  }

  return (
    <div className="space-y-4 bg-gray-50 p-6 rounded-lg border">
      <h3 className="font-semibold text-lg">Appraisal Decision</h3>
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-xs">
          <label className="text-xs font-medium text-gray-700">Final Offer (₹)</label>
          <Input 
            type="number" 
            placeholder="e.g. 75000" 
            value={offer} 
            onChange={(e) => setOffer(e.target.value)} 
            disabled={loading}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleApprove} disabled={loading} className="bg-green-600 hover:bg-green-700">
          <Check className="w-4 h-4 mr-1" /> Approve & List
        </Button>
        <Button onClick={handleReject} disabled={loading} variant="destructive">
          <X className="w-4 h-4 mr-1" /> Reject Vehicle
        </Button>
      </div>
    </div>
  );
}
