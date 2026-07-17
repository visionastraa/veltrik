import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormNavigationProps {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

export default function FormNavigation({
  currentStep,
  onBack,
  onNext,
  isSubmitting = false,
  readOnly = false,
}: FormNavigationProps) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-6">
      {/* Back Button */}
      {currentStep > 1 ? (
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          size="lg"
          disabled={isSubmitting}
          className="cursor-pointer gap-2"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Part 1</span>
        </Button>
      ) : (
        <div /> // Spacer
      )}

      {/* Action Button */}
      {currentStep === 1 ? (
        <Button
          type="button"
          onClick={onNext}
          size="lg"
          className="cursor-pointer gap-2 ml-auto"
        >
          <span>Continue to Part 2</span>
          <ArrowRight className="size-4" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          size="lg"
          disabled={isSubmitting}
          className="cursor-pointer gap-2 ml-auto bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Saving Inspection...</span>
            </>
          ) : (
            <>
              <Save className="size-4" />
              <span>{readOnly ? "Finish Review" : "Submit Inspection"}</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
