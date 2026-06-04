import type { Inspection } from "@prisma/client";

interface ScoreResult {
  score: number;
  band: "Premium" | "Good" | "Fair" | "Reject";
}

/**
 * Calculate vehicle condition score out of 100.
 *
 * Weights:
 *   Battery Health:    35 points  (health % × 0.35)
 *   KM Driven:         20 points  (tiered)
 *   Vehicle Age:        15 points  (tiered by years)
 *   Body Damage:        15 points  (pass/minor/severe)
 *   Brake System:       10 points  (pass/needs_repair)
 *   Accident History:    5 points  (clean/history_found)
 *
 * Bands:
 *   85–100 → Premium
 *   70–84  → Good
 *   50–69  → Fair
 *   <50    → Reject
 */
export function calculateScore(inspection: Inspection): ScoreResult {
  let score = 0;

  // ── Battery Health (35 pts) ──
  score += inspection.batteryHealth * 0.35;

  // ── KM Driven (20 pts) ──
  const km = inspection.kmDriven;
  if (km <= 0) {
    score += 20;
  } else if (km <= 10000) {
    score += 18;
  } else if (km <= 20000) {
    score += 15;
  } else if (km <= 30000) {
    score += 12;
  } else if (km <= 40000) {
    score += 9;
  } else {
    score += 5;
  }

  // ── Vehicle Age in Years (15 pts) ──
  const age = inspection.ageYears;
  if (age <= 1) {
    score += 15;
  } else if (age === 2) {
    score += 13;
  } else if (age === 3) {
    score += 11;
  } else if (age === 4) {
    score += 8;
  } else {
    score += 5;
  }

  // ── Body Damage (15 pts) ──
  switch (inspection.bodyDamage.toLowerCase()) {
    case "pass":
      score += 15;
      break;
    case "minor":
      score += 8;
      break;
    case "severe":
    default:
      score += 0;
      break;
  }

  // ── Brake System (10 pts) ──
  switch (inspection.brakeSystem.toLowerCase()) {
    case "pass":
      score += 10;
      break;
    case "needs_repair":
    default:
      score += 0;
      break;
  }

  // ── Accident History (5 pts) ──
  switch (inspection.accidentHistory.toLowerCase()) {
    case "clean":
      score += 5;
      break;
    case "history_found":
    default:
      score += 0;
      break;
  }

  // Round to nearest integer
  score = Math.round(score);

  // ── Determine Band ──
  let band: ScoreResult["band"];
  if (score >= 85) {
    band = "Premium";
  } else if (score >= 70) {
    band = "Good";
  } else if (score >= 50) {
    band = "Fair";
  } else {
    band = "Reject";
  }

  return { score, band };
}
