"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Inspector {
  id: string;
  name: string | null;
  email: string | null;
  phone?: string | null;
  _count?: {
    inspections: number;
  };
}

interface AssignInspectorDialogProps {
  leadId: string;
  inspectors: Inspector[];
}

export function AssignInspectorDialog({ leadId, inspectors }: AssignInspectorDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [inspectorId, setInspectorId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!inspectorId) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inspections/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerLeadId: leadId, inspectorId }),
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to assign inspector");
      }

      toast({
        title: "Inspector Assigned",
        description: "The inspection has been scheduled successfully.",
      });
      
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-primary border-primary/50 hover:bg-primary/10">
          <UserPlus className="w-4 h-4 mr-1" />
          Assign Inspector
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Inspector</DialogTitle>
          <DialogDescription>
            Select an inspector to carry out the physical vehicle inspection for this seller lead.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Select Inspector</label>
            <Select value={inspectorId} onValueChange={setInspectorId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select an inspector..." />
              </SelectTrigger>
              <SelectContent>
                {inspectors.map((inspector) => (
                  <SelectItem key={inspector.id} value={inspector.id}>
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{inspector.name || "Unnamed"}</span>
                      <span className="text-xs text-muted-foreground">
                        {inspector.phone ? `${inspector.phone} • ` : ''}{inspector.email}
                      </span>
                      <span className="text-xs text-primary font-medium mt-0.5">
                        {inspector._count?.inspections || 0} active inspections
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!inspectorId || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Confirm Assignment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
