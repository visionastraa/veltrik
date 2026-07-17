import { ShieldCheck, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormProgressProps {
  currentStep: number;
}

export default function FormProgress({ currentStep }: FormProgressProps) {
  const steps = [
    { number: 1, label: "Admin & Visual Checks", icon: ShieldCheck },
    { number: 2, label: "Technical & Performance", icon: Cpu },
  ];

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <div key={step.number} className="flex-1 flex items-center w-full">
              <div className="flex items-center gap-3">
                {/* Step Circle */}
                <div
                  className={cn(
                    "size-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300",
                    isCompleted && "bg-emerald-500 border-emerald-500 text-emerald-foreground",
                    isActive && "border-primary text-primary bg-primary/10 shadow-xs",
                    !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? "✓" : step.number}
                </div>

                {/* Step Details */}
                <div className="text-left">
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider block",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Part {step.number}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold block",
                      isActive ? "text-foreground" : "text-muted-foreground/75"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </div>

              {/* Connecting Line (Only for first step on larger screens) */}
              {idx === 0 && (
                <div className="hidden sm:block flex-1 mx-6 h-0.5 bg-border relative">
                  <div
                    className={cn(
                      "absolute inset-0 bg-primary transition-all duration-500",
                      isCompleted ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
