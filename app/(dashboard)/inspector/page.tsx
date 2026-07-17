"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import DashboardStats from "@/components/inspector/DashboardStats";
import TodaySchedule from "@/components/inspector/TodaySchedule";
import { Button } from "@/components/ui/button";

interface DashboardData {
  stats: {
    todaysInspections: number;
    pending: number;
    completedToday: number;
    weeklyTotal: number;
  };
  schedule: Array<{
    id: string;
    time: string;
    sellerName: string;
    sellerPhone: string;
    vehicleName: string;
    sellerLeadId: string;
    status: "completed" | "in-progress" | "not-started";
  }>;
}

export default function InspectorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/inspector/dashboard");
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const jsonData = await res.json();
      setData(jsonData);
    } catch (err) {
      console.error(err);
      setError("Unable to load today's schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="size-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Loading dashboard metrics...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card border border-destructive/20 rounded-2xl p-8 max-w-md mx-auto text-center space-y-4 shadow-sm">
        <div className="mx-auto w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
          <AlertTriangle className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-foreground">Sync Failure</h3>
          <p className="text-sm text-muted-foreground">
            {error || "Something went wrong while synchronizing with the database."}
          </p>
        </div>
        <Button onClick={fetchDashboardData} className="cursor-pointer">
          <RefreshCw className="size-4 mr-2" />
          Retry Sync
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Upper branding / title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Inspector Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here is your queue and performance statistics.
          </p>
        </div>
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          size="sm"
          className="cursor-pointer gap-2"
        >
          <RefreshCw className="size-3.5" />
          <span>Refresh Queue</span>
        </Button>
      </div>

      {/* Stats metrics */}
      <DashboardStats stats={data.stats} />

      {/* Schedule details */}
      <TodaySchedule schedule={data.schedule} />
    </div>
  );
}
