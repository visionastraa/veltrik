"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export default function StarRating({ value, onChange, disabled = false }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => !disabled && setHoverValue(star)}
          onMouseLeave={() => !disabled && setHoverValue(null)}
          className={cn(
            "p-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors outline-none",
            disabled ? "cursor-default" : "cursor-pointer"
          )}
        >
          <Star
            className={cn(
              "size-7 transition-all duration-150",
              star <= displayValue
                ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-sm"
                : "text-muted-foreground/40 hover:text-muted-foreground/60"
            )}
          />
        </button>
      ))}
      <span className="text-xs font-bold text-muted-foreground ml-2">
        {value > 0 ? `${value} of 5 Stars` : "Not Rated"}
      </span>
    </div>
  );
}
