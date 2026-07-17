"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  folder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  disabled = false,
  folder = "inspections",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (5MB limit)
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      console.error(err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        // Preview Screen
        <div className="relative border border-border rounded-xl overflow-hidden aspect-video bg-muted flex items-center justify-center group max-w-sm">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          
          {!disabled && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors opacity-90 group-hover:opacity-100 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      ) : (
        // Upload Action Area
        <div
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all max-w-sm ${
            disabled ? "opacity-50 pointer-events-none" : "hover:border-primary hover:bg-primary/5"
          } ${error ? "border-destructive/50 bg-destructive/5" : "border-border"}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={disabled || uploading}
            className="hidden"
            accept="image/*"
          />

          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 className="size-8 text-primary animate-spin" />
            ) : (
              <UploadCloud className="size-8 text-muted-foreground group-hover:text-primary transition-colors" />
            )}

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {uploading ? "Uploading image..." : "Upload Inspection Photo"}
              </p>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to select (Max 5MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  );
}
