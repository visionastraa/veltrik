"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserCheck, Plus, Loader2, ShieldCheck, Mail, Phone, Edit, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used, or alert fallback

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d*$/, "Phone must be numbers only").optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  password: z.string().refine((val) => !val || val.length >= 8, {
    message: "Password must be at least 8 characters if provided",
  }).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminInspectorsPage() {
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Action state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInspector, setSelectedInspector] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", city: "", address: "", password: "" }
  });

  const fetchInspectors = async () => {
    try {
      const res = await fetch("/api/admin/inspectors");
      const data = await res.json();
      if (data.success) {
        setInspectors(data.inspectors);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectors();
  }, []);

  const handleCreate = async (data: FormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/inspectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!resData.success) throw new Error(resData.error || "Failed to create inspector");
      
      setIsCreateOpen(false);
      reset();
      fetchInspectors();
      if (typeof toast !== 'undefined' && toast.success) toast.success("Inspector created successfully");
      else alert("Inspector created successfully");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: FormData) => {
    if (!selectedInspector) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    
    // Only send fields that were changed or are meant to be updated
    const payload: any = {
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      city: data.city || "",
      address: data.address || "",
    };
    if (data.password) payload.password = data.password;

    try {
      const res = await fetch(`/api/admin/inspectors/${selectedInspector.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (!resData.success) throw new Error(resData.error || "Failed to update inspector");
      
      setIsEditOpen(false);
      fetchInspectors();
      if (typeof toast !== 'undefined' && toast.success) toast.success("Inspector updated successfully");
      else alert("Inspector updated successfully");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInspector) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    
    try {
      const res = await fetch(`/api/admin/inspectors/${selectedInspector.id}`, {
        method: "DELETE"
      });
      const resData = await res.json();
      
      if (!res.ok) {
        if (res.status === 409) {
           setErrorMsg(resData.error);
           setIsDeleteOpen(false);
           if (typeof toast !== 'undefined' && toast.error) toast.error(resData.error);
           else alert(resData.error);
           return;
        }
        throw new Error(resData.error || "Failed to delete inspector");
      }
      
      setIsDeleteOpen(false);
      fetchInspectors();
      
      if (typeof toast !== 'undefined' && toast.success) toast.success(resData.message);
      else alert(resData.message);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (inspector: any) => {
    setSelectedInspector(inspector);
    setValue("name", inspector.name || "");
    setValue("email", inspector.email || "");
    setValue("phone", inspector.phone || "");
    setValue("city", inspector.city || "");
    setValue("address", inspector.address || "");
    setValue("password", "");
    setErrorMsg(null);
    setIsEditOpen(true);
  };

  const openDeleteModal = (inspector: any) => {
    setSelectedInspector(inspector);
    setErrorMsg(null);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Inspectors</h1>
          <p className="text-muted-foreground text-sm">Add, edit, and remove field inspection personnel.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (open) {
            reset({ name: "", email: "", phone: "", city: "", address: "", password: "" });
            setErrorMsg(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add New Inspector</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Inspector</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreate)} className="space-y-4 pt-4">
              {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded text-xs">{errorMsg}</div>}
              
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Inspector" {...register("name")} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@veltrik.com" {...register("email")} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input id="phone" placeholder="9876543210" {...register("phone")} />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Inspector
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : inspectors.length === 0 ? (
        <Card className="p-12 text-center">
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">No inspectors created yet</h3>
          <p className="text-sm text-gray-500 mb-4">Add your first inspector to start assigning vehicle inspections.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inspectors.map((inspector) => (
            <Card key={inspector.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {inspector.name?.charAt(0) || "I"}
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Active Inspector
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-base">{inspector.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{inspector.email}</span>
                  </div>
                  {inspector.phone && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{inspector.phone}</span>
                    </div>
                  )}
                  {inspector.city && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{inspector.city}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Inspections Assigned</span>
                  <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">
                    {inspector._count?.inspections || 0}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" className="w-full flex-1" onClick={() => openEditModal(inspector)}>
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="w-full flex-1" onClick={() => openDeleteModal(inspector)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Inspector</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEdit)} className="space-y-4 pt-4">
            {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded text-xs">{errorMsg}</div>}
            
            <div className="space-y-1">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input id="edit-email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-phone">Phone Number (Optional)</Label>
              <Input id="edit-phone" placeholder="9876543210" {...register("phone")} />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-city">City</Label>
                <Input id="edit-city" placeholder="Mumbai" {...register("city")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-address">Address</Label>
                <Input id="edit-address" placeholder="Sector 1" {...register("address")} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-password">Password (Optional)</Label>
              <Input id="edit-password" type="password" placeholder="Leave blank to keep current password" {...register("password")} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{selectedInspector?.name}</strong> as an inspector? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded text-xs">{errorMsg}</div>}
          <DialogFooter className="mt-4 sm:justify-end gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
