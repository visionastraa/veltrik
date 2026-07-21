import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();

  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let label = status.replace(/_/g, " ");
  let bgColor = "";
  let textColor = "text-white";

  switch (normalizedStatus) {
    // Seller Statuses
    case "SUBMITTED":
      bgColor = "bg-blue-500 hover:bg-blue-600";
      break;
    case "SCHEDULED":
      bgColor = "bg-purple-500 hover:bg-purple-600";
      break;
    case "INSPECTED":
      bgColor = "bg-orange-500 hover:bg-orange-600";
      break;
    case "OFFER_MADE":
      bgColor = "bg-yellow-500 hover:bg-yellow-600";
      break;
    case "ACQUIRED":
      bgColor = "bg-green-600 hover:bg-green-700";
      break;
    case "REJECTED":
      variant = "destructive";
      break;

    // Buyer Statuses
    case "LEAD":
      bgColor = "bg-gray-500 hover:bg-gray-600";
      break;
    case "VISIT_SCHEDULED":
    case "LEAD_VISIT_SCHEDULED":
      bgColor = "bg-blue-500 hover:bg-blue-600";
      break;
    case "FOLLOW_UP_REQUIRED":
      bgColor = "bg-red-500 hover:bg-red-600";
      break;
    case "CONVERTED":
      bgColor = "bg-green-600 hover:bg-green-700";
      break;
    case "LOST":
      variant = "secondary";
      textColor = "text-gray-500";
      break;

    // Listing Statuses
    case "AVAILABLE":
      bgColor = "bg-green-500 hover:bg-green-600";
      break;
    case "RESERVED":
      bgColor = "bg-yellow-500 hover:bg-yellow-600";
      break;
    case "SOLD":
      variant = "secondary";
      textColor = "text-gray-500";
      break;
    default:
      variant = "outline";
      textColor = "text-gray-700";
  }

  return (
    <Badge
      variant={variant}
      className={variant === "default" ? `${bgColor} ${textColor} text-xs font-semibold` : "text-xs font-semibold"}
    >
      {label}
    </Badge>
  );
}
