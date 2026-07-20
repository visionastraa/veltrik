"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WishlistButtonProps {
  isWishlisted: boolean
  onToggle: () => void
  size?: "sm" | "md"
  className?: string
}

export function WishlistButton({ isWishlisted, onToggle, size = "sm", className }: WishlistButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full transition-colors",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        isWishlisted ? "bg-red-50 hover:bg-red-100" : "bg-white/90 hover:bg-white",
        className
      )}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
    >
      <Heart
        className={cn(
          "transition-colors",
          size === "sm" ? "w-4 h-4" : "w-5 h-5",
          isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
        )}
      />
    </Button>
  )
}
