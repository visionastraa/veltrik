"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Zap,
  MapPin,
  Clock,
  Battery,
  Navigation,
  Share2,
  Plug,
  Car,
  TrendingUp,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

type StationType = "all" | "ultra-fast" | "fast" | "standard";
type StationStatus = "available" | "busy" | "in-use";

const stations = [
  {
    id: 1,
    name: "GreenPulse Hub",
    type: "ultra-fast" as const,
    location: "Downtown Manhattan",
    distance: "0.8 mi",
    power: 350,
    hours: "24/7",
    slots: { available: 4, total: 8 },
    pricePerKwh: 0.35,
    status: "available" as const,
    amenities: ["Wi-Fi", "Lounge", "Coffee"],
  },
  {
    id: 2,
    name: "Volt Station Central",
    type: "fast" as const,
    location: "Brooklyn Bridge",
    distance: "2.1 mi",
    power: 150,
    hours: "6 AM – 12 AM",
    slots: { available: 1, total: 6 },
    pricePerKwh: 0.28,
    status: "busy" as const,
    amenities: ["Restroom", "Snacks"],
  },
  {
    id: 3,
    name: "ElectraPoint West",
    type: "ultra-fast" as const,
    location: "Hudson Yards",
    distance: "3.5 mi",
    power: 300,
    hours: "24/7",
    slots: { available: 6, total: 10 },
    pricePerKwh: 0.32,
    status: "available" as const,
    amenities: ["Wi-Fi", "Parking", "Food Court"],
  },
  {
    id: 4,
    name: "ChargeUp Express",
    type: "standard" as const,
    location: "Williamsburg",
    distance: "4.2 mi",
    power: 50,
    hours: "7 AM – 11 PM",
    slots: { available: 0, total: 4 },
    pricePerKwh: 0.20,
    status: "in-use" as const,
    amenities: ["Parking"],
  },
  {
    id: 5,
    name: "PowerGrid Elite",
    type: "fast" as const,
    location: "Midtown East",
    distance: "1.6 mi",
    power: 150,
    hours: "24/7",
    slots: { available: 3, total: 6 },
    pricePerKwh: 0.30,
    status: "available" as const,
    amenities: ["Wi-Fi", "Restroom", "Vending"],
  },
  {
    id: 6,
    name: "SparkCharge City",
    type: "ultra-fast" as const,
    location: "SoHo",
    distance: "2.9 mi",
    power: 350,
    hours: "5 AM – 1 AM",
    slots: { available: 0, total: 12 },
    pricePerKwh: 0.38,
    status: "in-use" as const,
    amenities: ["Lounge", "Wi-Fi", "Charging Lounge"],
  },
];

const stats = [
  { label: "Total Stations", value: "2,450+", icon: Zap },
  { label: "Available Now", value: "1,200+", icon: Plug },
  { label: "Fast Chargers", value: "800+", icon: TrendingUp },
  { label: "Cities Covered", value: "150+", icon: MapPin },
];

const statusColors: Record<StationStatus, string> = {
  available: "bg-emerald-500",
  busy: "bg-amber-500",
  "in-use": "bg-red-500",
};

const statusLabels: Record<StationStatus, string> = {
  available: "Available",
  busy: "Busy",
  "in-use": "In Use",
};

const filterButtons: { label: string; value: StationType }[] = [
  { label: "All", value: "all" },
  { label: "Ultra Fast", value: "ultra-fast" },
  { label: "Fast", value: "fast" },
  { label: "Standard", value: "standard" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4 },
  }),
};

export default function ChargingPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<StationType>("all");
  const [batteryCapacity, setBatteryCapacity] = useState([60]);
  const [currentCharge, setCurrentCharge] = useState([20]);
  const [targetCharge, setTargetCharge] = useState([80]);
  const [chargingSpeed, setChargingSpeed] = useState([150]);

  const filtered = stations.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeFilter === "all" || s.type === activeFilter;
    return matchesSearch && matchesType;
  });

  const availableCount = stations.reduce(
    (acc, s) => acc + s.slots.available,
    0
  );
  const busyCount = stations.reduce(
    (acc, s) => acc + (s.status === "busy" ? 1 : 0),
    0
  );
  const inUseCount = stations.reduce(
    (acc, s) => acc + (s.status === "in-use" ? 1 : 0),
    0
  );

  const energyNeeded =
    batteryCapacity[0] * ((targetCharge[0] - currentCharge[0]) / 100);
  const timeMinutes =
    chargingSpeed[0] > 0 ? (energyNeeded / chargingSpeed[0]) * 60 : 0;
  const cost = energyNeeded * 0.32;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Charging Stations</h1>
            <p className="mt-1 text-gray-500">
              Find and book EV charging stations near you
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search stations or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filterButtons.map((f) => (
            <Button
              key={f.value}
              variant={activeFilter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                activeFilter === f.value
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "border-gray-200 text-gray-600 hover:bg-gray-100"
              )}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Activity className="h-5 w-5 text-primary" />
                Live Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Available", count: availableCount, color: "text-emerald-600" },
                  { label: "Busy", count: busyCount, color: "text-amber-600" },
                  { label: "In Use", count: inUseCount, color: "text-red-500" },
                  { label: "Total", count: stations.length, color: "text-gray-900" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className={cn("text-3xl font-bold", item.color)}>
                      {item.count}
                    </p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Car className="mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">
                      No stations found
                    </p>
                    <p className="text-sm text-gray-400">
                      Try adjusting your search or filter
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filtered.map((station, i) => (
                  <motion.div
                    key={station.id}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    layout
                  >
                    <Card className="border-gray-200 bg-white shadow-sm transition-colors hover:shadow-md">
                      <CardContent className="p-5">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {station.name}
                            </h3>
                            <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="h-3.5 w-3.5" />
                              {station.location} · {station.distance}
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              station.type === "ultra-fast"
                                ? "bg-violet-100 text-violet-700"
                                : station.type === "fast"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {station.type === "ultra-fast"
                              ? "Ultra Fast"
                              : station.type === "fast"
                              ? "Fast"
                              : "Standard"}
                          </Badge>
                        </div>

                        <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-lg bg-gray-50 p-2">
                            <Zap className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                            <p className="text-xs font-medium text-gray-900">
                              {station.power} kW
                            </p>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-2">
                            <Clock className="mx-auto mb-1 h-4 w-4 text-blue-500" />
                            <p className="text-xs font-medium text-gray-900">
                              {station.hours}
                            </p>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-2">
                            <Battery className="mx-auto mb-1 h-4 w-4 text-emerald-500" />
                            <p className="text-xs font-medium text-gray-900">
                              {station.slots.available}/{station.slots.total}
                            </p>
                          </div>
                        </div>

                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            ${station.pricePerKwh.toFixed(2)}/kWh
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                statusColors[station.status]
                              )}
                            />
                            <span className="text-sm text-gray-700">
                              {statusLabels[station.status]}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-1.5">
                          {station.amenities.map((a) => (
                            <Badge
                              key={a}
                              variant="outline"
                              className="border-gray-200 text-xs text-gray-500"
                            >
                              {a}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-primary hover:bg-primary/90"
                            disabled={station.status === "in-use"}
                          >
                            <Navigation className="mr-1.5 h-3.5 w-3.5" />
                            Navigate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-200 text-gray-600"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Battery className="h-5 w-5 text-primary" />
                Charging Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">
                  Battery Capacity · {batteryCapacity[0]} kWh
                </Label>
                <Slider
                  value={batteryCapacity}
                  onValueChange={setBatteryCapacity}
                  min={20}
                  max={120}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">
                  Current Charge · {currentCharge[0]}%
                </Label>
                <Slider
                  value={currentCharge}
                  onValueChange={setCurrentCharge}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">
                  Target Charge · {targetCharge[0]}%
                </Label>
                <Slider
                  value={targetCharge}
                  onValueChange={setTargetCharge}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">
                  Charging Speed · {chargingSpeed[0]} kW
                </Label>
                <Slider
                  value={chargingSpeed}
                  onValueChange={setChargingSpeed}
                  min={50}
                  max={350}
                  step={10}
                />
              </div>

              <div className="border-t border-gray-200" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Energy Needed</span>
                  <span className="font-semibold text-gray-900">
                    {energyNeeded.toFixed(1)} kWh
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Est. Time</span>
                  <span className="font-semibold text-gray-900">
                    {timeMinutes < 60
                      ? `${Math.round(timeMinutes)} min`
                      : `${Math.floor(timeMinutes / 60)}h ${Math.round(
                          timeMinutes % 60
                        )}m`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Est. Cost</span>
                  <span className="font-semibold text-emerald-600">
                    ${cost.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <MapPin className="h-5 w-5 text-primary" />
                Station Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                <div className="text-center">
                  <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    Interactive map coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
