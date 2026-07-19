"use client"

import { toast } from "sonner"

export function useToast() {
  return {
    toast: ({ title, description }: { title?: string; description?: string; [key: string]: any }) => {
      toast(title || "", { description })
    },
  }
}
