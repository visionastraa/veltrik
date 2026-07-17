"use client";

import StarRating from "@/components/StarRating";

interface Part2Data {
  batteryCharge: number;
  batteryHealth: number;
  batteryVoltage: number;
  physicalDamage: boolean;
  brakeSystem: "pass" | "needs_repair";
  brakePads: "good" | "worn" | "replace";
  wheelAlignment: "aligned" | "needs_alignment";
  testDriveRating: number;
  testDriveNotes: string;
  techComments: string;
}

interface Part2Props {
  data: Part2Data;
  onChange: (updates: Partial<Part2Data>) => void;
}

export default function Part2({ data, onChange }: Part2Props) {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">

      {/* ─── Battery Testing ─── */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2">
          1. Battery & Electrical Diagnostics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground">Battery Charge Level (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={data.batteryCharge || ""}
              onChange={(e) => onChange({ batteryCharge: parseFloat(e.target.value) || 0 })}
              placeholder="e.g. 85"
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-ring focus:ring-2"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground">Battery State of Health (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={data.batteryHealth || ""}
              onChange={(e) => onChange({ batteryHealth: parseFloat(e.target.value) || 0 })}
              placeholder="e.g. 92"
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-ring focus:ring-2"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground">Battery Voltage (V)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              required
              value={data.batteryVoltage || ""}
              onChange={(e) => onChange({ batteryVoltage: parseFloat(e.target.value) || 0 })}
              placeholder="e.g. 72.4"
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-ring focus:ring-2"
            />
          </div>
        </div>
      </div>

      {/* ─── Chassis & Control Diagnostics ─── */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2">
          2. Mechanical & Chassis Checks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground block">Chassis / External Damage</label>
            <div className="flex gap-3">
              {[
                { label: "Pass (No Damage)", value: false },
                { label: "Fail (Chassis Damaged)", value: true },
              ].map((option) => (
                <label
                  key={String(option.value)}
                  className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer text-sm font-bold select-none transition-all ${
                    data.physicalDamage === option.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="physicalDamage"
                    checked={data.physicalDamage === option.value}
                    onChange={() => onChange({ physicalDamage: option.value })}
                    className="hidden"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground block">Brake System Integrity</label>
            <div className="flex gap-3">
              {[
                { label: "Pass (Functional)", value: "pass" },
                { label: "Needs Repair", value: "needs_repair" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer text-sm font-bold select-none transition-all ${
                    data.brakeSystem === option.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="brakeSystem"
                    checked={data.brakeSystem === option.value}
                    onChange={() => onChange({ brakeSystem: option.value as any })}
                    className="hidden"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground block">Brake Pads Wear</label>
            <div className="flex gap-3">
              {["good", "worn", "replace"].map((option) => (
                <label
                  key={option}
                  className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer text-sm font-bold capitalize select-none transition-all ${
                    data.brakePads === option
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="brakePads"
                    value={option}
                    checked={data.brakePads === option}
                    onChange={() => onChange({ brakePads: option as any })}
                    className="hidden"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground block">Wheel Alignment</label>
            <div className="flex gap-3">
              {[
                { label: "Aligned", value: "aligned" },
                { label: "Needs Alignment", value: "needs_alignment" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer text-sm font-bold select-none transition-all ${
                    data.wheelAlignment === option.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="wheelAlignment"
                    checked={data.wheelAlignment === option.value}
                    onChange={() => onChange({ wheelAlignment: option.value as any })}
                    className="hidden"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Test Drive Results ─── */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2">
          3. Test Drive & Diagnostics
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground block">Test Drive Rating</label>
            <StarRating
              value={data.testDriveRating}
              onChange={(rating) => onChange({ testDriveRating: rating })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground">Test Drive Field Notes</label>
            <textarea
              value={data.testDriveNotes}
              onChange={(e) => onChange({ testDriveNotes: e.target.value })}
              placeholder="Enter details on throttle response, suspension feel, regenerative braking logs..."
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-ring focus:ring-2 min-h-20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground">Technical Review & Summary</label>
            <textarea
              value={data.techComments}
              onChange={(e) => onChange({ techComments: e.target.value })}
              placeholder="Enter technical comments, overall diagnostic summaries..."
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-ring focus:ring-2 min-h-24"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
