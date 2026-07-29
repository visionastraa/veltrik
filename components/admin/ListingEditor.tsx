"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Edit2, Save, X } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

interface Listing {
  id: string;
  price: number;
  status: string;
}

export function ListingEditor({ listing }: { listing: Listing }) {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(listing.price.toString());
  const [status, setStatus] = useState(listing.status);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: parseFloat(price), status }),
      });
      if (!res.ok) throw new Error("Failed to update listing");
      toast.success("Listing updated successfully");
      setIsEditing(false);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4 flex-1">
          <span className="font-semibold min-w-[80px]">₹{listing.price.toLocaleString()}</span>
          <StatusBadge status={listing.status} />
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          <Edit2 className="w-4 h-4 mr-1" /> Edit
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <Input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-24 h-8 text-sm"
        disabled={loading}
      />
      <Select value={status} onValueChange={setStatus} disabled={loading}>
        <SelectTrigger className="w-32 h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
          <SelectItem value="RESERVED">RESERVED</SelectItem>
          <SelectItem value="SOLD">SOLD</SelectItem>
          <SelectItem value="UNPUBLISHED">UNPUBLISHED</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center ml-auto gap-1">
        <Button size="sm" variant="ghost" onClick={handleSave} disabled={loading} className="h-8 w-8 p-0 text-green-600">
          <Save className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} disabled={loading} className="h-8 w-8 p-0 text-red-600">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
