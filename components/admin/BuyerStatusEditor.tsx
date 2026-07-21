"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";

interface BuyerLead {
  id: string;
  status: string;
}

export function BuyerStatusEditor({ lead }: { lead: BuyerLead }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/buyer-leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Buyer status updated.");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[180px]">
      <StatusBadge status={lead.status} />
      <Select value={lead.status} onValueChange={handleStatusChange} disabled={loading}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Change Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="LEAD">LEAD</SelectItem>
          <SelectItem value="VISIT_SCHEDULED">VISIT SCHEDULED</SelectItem>
          <SelectItem value="FOLLOW_UP_REQUIRED">FOLLOW UP REQUIRED</SelectItem>
          <SelectItem value="CONVERTED">CONVERTED</SelectItem>
          <SelectItem value="LOST">LOST</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
