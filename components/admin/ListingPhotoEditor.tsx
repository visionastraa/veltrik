"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Image as ImageIcon, X, Save, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

export function ListingPhotoEditor({ listingId, initialPhotos }: { listingId: string, initialPhotos: string[] }) {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemove = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const files = Array.from(e.target.files);
    let uploadedCount = 0;
    
    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} exceeds 5MB limit`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "listings");
        formData.append("entityId", listingId);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        
        if (data.success && data.url) {
          setPhotos(prev => [...prev, data.url]);
          uploadedCount++;
        } else {
          toast.error(`Failed to upload ${file.name}: ${data.error}`);
        }
      }
      
      if (uploadedCount > 0) {
        toast.success(`Successfully uploaded ${uploadedCount} photo(s)`);
      }
    } catch (err: any) {
      toast.error("An error occurred during upload");
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos }),
      });
      if (!res.ok) throw new Error("Failed to update photos");
      toast.success("Photos updated successfully");
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-2 w-full text-xs">
          <ImageIcon className="w-3 h-3 mr-1" /> Edit Photos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Listing Photos</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-end mb-2">
           <input 
             type="file" 
             multiple 
             accept="image/jpeg,image/png,image/webp" 
             className="hidden" 
             ref={fileInputRef}
             onChange={handleFileChange}
           />
           <Button 
             variant="secondary" 
             size="sm" 
             onClick={() => fileInputRef.current?.click()}
             disabled={uploading || loading}
           >
             {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
             Upload New Photos
           </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto p-1 border rounded-lg bg-gray-50/50 min-h-[150px]">
          {photos.map((photo, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border aspect-video bg-white shadow-sm">
              <Image src={photo} alt={`Photo ${index + 1}`} fill className="object-cover" unoptimized />
              <button 
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {photos.length === 0 && !uploading && (
            <div className="col-span-full flex items-center justify-center text-sm text-gray-500 py-12">
              No photos available. Click upload to add some.
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            {photos.length} photo{photos.length !== 1 && "s"}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading || uploading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || uploading || photos.length === 0}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
