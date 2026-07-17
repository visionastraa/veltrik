"use client";

import ImageUpload from "@/components/ImageUpload";

interface Part1Data {
  ageYears: number;
  ageMonths: number;
  kmDriven: number;
  bodyDamage: "pass" | "minor" | "severe";
  bodyDamagePhoto: string;
  forkDamage: boolean;
  accidentHistory: "clean" | "history_found";
  warrantyStatus: "under_warranty" | "out_of_warranty";
  warrantyType: string;
  warrantyExpiry: string;
  partsReplaced: boolean;
  replacedParts: string;
  adminComments: string;
}

interface Part1Props {
  data: Part1Data;
  onChange: (updates: Partial<Part1Data>) => void;
}

export default function Part1({ data, onChange }: Part1Props) {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* ─── Physical Age & Mileage ─── */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2">
          1. Physical Details & Mileage
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground">Vehicle Age (Years)</label>
            <input
              type="number"
              min="0"
              required
              value={data.ageYears || ""}
              onChange={(e) => onChange({ ageYears: parseInt(e.target.value) || 0 })}
              placeholder="e.g. 2"
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground">Vehicle Age (Months)</label>
            <input
              type="number"
              min="0"
              max="11"
              required
              value={data.ageMonths || ""}
              onChange={(e) => onChange({ ageMonths: parseInt(e.target.value) || 0 })}
              placeholder="e.g. 6"
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground">Odometer (KM Driven)</label>
            <input
              type="number"
              min="0"
              required
              value={data.kmDriven || ""}
              onChange={(e) => onChange({ kmDriven: parseFloat(e.target.value) || 0 })}
              placeholder="e.g. 12500"
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
          </div>
        </div>
      </div>

      {/* ─── Body & Structural Damage ─── */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2">
          2. Exterior & Body Condition
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground block">Body Damage Severity</label>
              <div className="flex gap-3">
                {["pass", "minor", "severe"].map((option) => (
                  <label
                    key={option}
                    className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer text-sm font-bold capitalize select-none transition-all ${
                      data.bodyDamage === option
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bodyDamage"
                      value={option}
                      checked={data.bodyDamage === option}
                      onChange={() => onChange({ bodyDamage: option as any })}
                      className="hidden"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground block">Fork Damage Check</label>
              <div className="flex gap-3">
                {[
                  { label: "Pass (No Damage)", value: false },
                  { label: "Fail (Damaged)", value: true },
                ].map((option) => (
                  <label
                    key={String(option.value)}
                    className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer text-sm font-bold select-none transition-all ${
                      data.forkDamage === option.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="forkDamage"
                      checked={data.forkDamage === option.value}
                      onChange={() => onChange({ forkDamage: option.value })}
                      className="hidden"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground block">Body Damage Photograph</label>
            <ImageUpload
              value={data.bodyDamagePhoto}
              onChange={(url) => onChange({ bodyDamagePhoto: url })}
            />
          </div>
        </div>
      </div>

      {/* ─── Accidental & Warranty Checks ─── */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2">
          3. Structural & Warranty Logs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground block">Accidental Damage Check</label>
            <div className="flex gap-3">
              {[
                { label: "Clean", value: "clean" },
                { label: "History Found", value: "history_found" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer text-sm font-bold select-none transition-all ${
                    data.accidentHistory === option.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="accidentHistory"
                    checked={data.accidentHistory === option.value}
                    onChange={() => onChange({ accidentHistory: option.value as any })}
                    className="hidden"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground block">Warranty Status</label>
            <div className="flex gap-3">
              {[
                { label: "Under Warranty", value: "under_warranty" },
                { label: "Out of Warranty", value: "out_of_warranty" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer text-sm font-bold select-none transition-all ${
                    data.warrantyStatus === option.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="warrantyStatus"
                    checked={data.warrantyStatus === option.value}
                    onChange={() => onChange({ warrantyStatus: option.value as any })}
                    className="hidden"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Conditional Warranty Fields */}
        {data.warrantyStatus === "under_warranty" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 border border-border rounded-xl animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground">Warranty Type</label>
              <select
                value={data.warrantyType}
                onChange={(e) => onChange({ warrantyType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-ring focus:ring-2"
              >
                <option value="">Select Warranty Type</option>
                <option value="standard">Standard Warranty</option>
                <option value="extended">Extended Warranty</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground">Warranty Expiry Date</label>
              <input
                type="date"
                value={data.warrantyExpiry}
                onChange={(e) => onChange({ warrantyExpiry: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-ring focus:ring-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── Part Replacements & Comments ─── */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2">
          4. Replacements & Field Notes
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground block">Any Parts Replaced Under Warranty?</label>
            <div className="flex gap-3 max-w-md">
              {[
                { label: "Yes", value: true },
                { label: "No", value: false },
              ].map((option) => (
                <label
                  key={String(option.value)}
                  className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer text-sm font-bold select-none transition-all ${
                    data.partsReplaced === option.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="partsReplaced"
                    checked={data.partsReplaced === option.value}
                    onChange={() => onChange({ partsReplaced: option.value })}
                    className="hidden"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Conditional Replaced Parts List */}
          {data.partsReplaced && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label className="text-sm font-semibold text-muted-foreground">List of Replaced Parts</label>
              <textarea
                value={data.replacedParts}
                onChange={(e) => onChange({ replacedParts: e.target.value })}
                placeholder="e.g. Battery swapped under warranty, new throttle unit..."
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-ring focus:ring-2 min-h-20 resize-y"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground">Additional Administrative Comments</label>
            <textarea
              value={data.adminComments}
              onChange={(e) => onChange({ adminComments: e.target.value })}
              placeholder="Enter details on vehicle logs, verification notes..."
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-ring focus:ring-2 min-h-24 resize-y"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
