import { ClipboardCopy, Calendar, CheckCircle2, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    todaysInspections: number;
    pending: number;
    completedToday: number;
    weeklyTotal: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: "Today's Inspections",
      value: stats.todaysInspections,
      icon: ClipboardCopy,
      colorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
      title: "Pending Inspections",
      value: stats.pending,
      icon: Calendar,
      colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      icon: CheckCircle2,
      colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    {
      title: "Weekly Total",
      value: stats.weeklyTotal,
      icon: TrendingUp,
      colorClass: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200"
          >
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                {card.title}
              </span>
              <span className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight block">
                {card.value}
              </span>
            </div>
            <div className={`p-3 rounded-xl border ${card.colorClass} shrink-0`}>
              <Icon className="size-5.5 md:size-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
