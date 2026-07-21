"use client"

import { useRef, useState } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhotoUploadDropzoneProps {
  onUpload: (files: File[]) => void
  existingUrls?: string[]
  onRemoveExisting?: (index: number) => void
  maxFiles?: number
  maxSizeMB?: number
  accept?: string
  className?: string
}

export function PhotoUploadDropzone({
  onUpload,
  existingUrls = [],
  onRemoveExisting,
  maxFiles = 10,
  maxSizeMB = 10,
  accept = "image/jpeg,image/png,image/webp",
  className,
}: PhotoUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previews, setPreviews] = useState<string[]>(existingUrls)
  const totalCount = previews.length

  const handleFiles = (files: FileList) => {
    const remaining = maxFiles - totalCount
    if (remaining <= 0) return

    const validFiles: File[] = []
    const newPreviews: string[] = []

    Array.from(files).slice(0, remaining).forEach((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) return
      validFiles.push(file)
      newPreviews.push(URL.createObjectURL(file))
    })

    if (validFiles.length > 0) {
      onUpload(validFiles)
      setPreviews((p) => [...p, ...newPreviews])
    }
  }

  const removePreview = (idx: number) => {
    setPreviews((p) => p.filter((_, i) => i !== idx))
    onRemoveExisting?.(idx)
  }

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); e.dataTransfer.files && handleFiles(e.dataTransfer.files) }}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
        )}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to {maxSizeMB}MB</p>
      </div>
      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {previews.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
              <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removePreview(idx)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {totalCount < maxFiles && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-primary/50 transition-colors"
            >
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </button>
          )}
        </div>
      )}
      <p className="text-xs text-gray-400">
        {totalCount} / {maxFiles} photos uploaded
      </p>
    </div>
  )
}
