import Link from "next/link";
import { Clock, CheckCircle, PlayCircle, AlertCircle, Phone, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleItem {
  id: string;
  time: string;
  sellerName: string;
  sellerPhone: string;
  vehicleName: string;
  sellerLeadId: string;
  status: "completed" | "in-progress" | "not-started";
}

interface TodayScheduleProps {
  schedule: ScheduleItem[];
}

export default function TodaySchedule({ schedule }: TodayScheduleProps) {
  const getStatusConfig = (status: ScheduleItem["status"]) => {
    switch (status) {
      case "completed":
        return {
          label: "Completed",
          badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          icon: CheckCircle,
        };
      case "in-progress":
        return {
          label: "In Progress",
          badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          icon: PlayCircle,
        };
      case "not-started":
      default:
        return {
          label: "Not Started",
          badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
          icon: AlertCircle,
        };
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Clock className="size-5 text-muted-foreground" />
          <span>Today's Inspection Schedule</span>
        </h2>
        <span className="text-xs text-muted-foreground font-medium">
          {schedule.length} scheduled
        </span>
      </div>

      {schedule.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground space-y-2">
          <CheckCircle className="size-10 mx-auto opacity-40 text-emerald-500" />
          <p className="text-sm font-semibold">All clear for today!</p>
          <p className="text-xs">No inspections scheduled for this date.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {schedule.map((item) => {
            const statusConfig = getStatusConfig(item.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Link
                key={item.id}
                href={`/inspector/inspect/${item.sellerLeadId}`}
                className="group flex flex-col md:flex-row md:items-center justify-between py-4.5 gap-4 hover:bg-muted/30 px-3 -mx-3 rounded-xl transition-all duration-200"
              >
                {/* Left Side: Time and Vehicle */}
                <div className="flex items-start gap-4">
                  {/* Time Badge */}
                  <div className="bg-secondary/80 border border-border px-3.5 py-2 rounded-xl text-center shrink-0 min-w-20">
                    <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Time</span>
                    <span className="text-sm font-extrabold text-foreground">{item.time}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base">
                      {item.vehicleName}
                    </h3>
                    
                    {/* Seller details */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{item.sellerName}</span>
                      {item.sellerPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="size-3" />
                          {item.sellerPhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Status Badge and Action Trigger */}
                <div className="flex items-center justify-between md:justify-end gap-4">
                  {/* Status Indicator */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusConfig.badgeClass}`}>
                    <StatusIcon className="size-3.5" />
                    {statusConfig.label}
                  </span>

                  {/* Proceed arrow icon */}
                  <div className="p-2 rounded-full bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 shrink-0">
                    <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
