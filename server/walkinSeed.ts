/**
 * Seed script for AY 2027-28 Walk-in Admissions Capture System.
 * Run once after pushing the schema: `npx tsx server/walkinSeed.ts`
 * Safe to re-run — uses INSERT … ON CONFLICT DO NOTHING for all rows.
 */

import { db } from "./db";
import {
  walkinPrograms, walkinSources, walkinStatuses, walkinCloseReasons,
  walkinBranches, walkinStaff,
} from "@shared/schema";
import { sql } from "drizzle-orm";

// ── Helper: upsert by label within a table ──────────────────────
async function seedRows<T extends { label: string; brand?: string | null; sortOrder?: number; isActive?: boolean }>(
  table: any,
  rows: T[],
) {
  for (const row of rows) {
    await db.insert(table).values(row).onConflictDoNothing();
  }
}

async function main() {
  console.log("[walkin-seed] Starting...");

  // ── Programs ────────────────────────────────────────────────
  // RIS grades (K–12 CBSE)
  const risPrograms = [
    "Nursery", "Junior KG", "Senior KG",
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8",
    "Class 9", "Class 10",
    "Class 11 – Science", "Class 11 – Commerce", "Class 11 – Humanities",
    "Class 12 – Science", "Class 12 – Commerce", "Class 12 – Humanities",
  ].map((label, i) => ({ label, brand: "RIS", sortOrder: i, isActive: true }));

  // RPS programs (Preschool)
  // [CONFIRM] add Daycare or any other programmes if offered
  const rpsPrograms = [
    "Playgroup", "Nursery", "Junior KG", "Senior KG",
  ].map((label, i) => ({ label, brand: "RPS", sortOrder: i, isActive: true }));

  await seedRows(walkinPrograms, [...risPrograms, ...rpsPrograms]);
  console.log("[walkin-seed] Programs seeded");

  // ── Sources (shared across both brands) ─────────────────────
  // [CONFIRM] trim or extend to your real lead-source channels
  const sources = [
    "Google", "Meta", "WhatsApp", "Telephonic",
    "Walk-in", "Referral", "Hoarding/Banner", "Website",
  ].map((label, i) => ({ label, brand: null, sortOrder: i, isActive: true }));

  await seedRows(walkinSources, sources);
  console.log("[walkin-seed] Sources seeded");

  // ── Statuses (shared) ────────────────────────────────────────
  const statuses = [
    "OPEN",
    "WALK-IN BOOKED",
    "WALK-IN COMPLETED",
    "ADMISSION DONE",
    "CLOSED",
    "TRANSFERRED",
    "INTEGRATED",
    "NEXT YEAR",
  ].map((label, i) => ({ label, brand: null, sortOrder: i, isActive: true }));

  await seedRows(walkinStatuses, statuses);
  console.log("[walkin-seed] Statuses seeded");

  // ── Close Reasons (shared) ───────────────────────────────────
  // Sourced exactly from real 26–27 sheet close-reason tags
  const closeReasons = [
    "Location",
    "Distance",
    "No seats",
    "High Fees",
    "Not Interested",
    "Admission Done – Other School",
    "Rainbow Parent",
    "Board Issue",
    "Continuing in Same School",
    "Transfer to RPS",
    "Transfer to RIS",
    "Autism/LD/Not Eligible",
    "Did Not Enquire",
    "Job Enquiry",
    "Invalid Number",
    "Duplicate",
    "Other",
  ].map((label, i) => ({ label, brand: null, sortOrder: i, isActive: true }));

  await seedRows(walkinCloseReasons, closeReasons);
  console.log("[walkin-seed] Close reasons seeded");

  // ── Branches ─────────────────────────────────────────────────
  // [CONFIRM] Replace these placeholders with your real branch details before going live.
  // Each branch needs: name, brand ("RIS" or "RPS"), code (URL-safe slug), pin (kiosk access PIN).
  //
  // Example entries (uncomment and fill in your real data):
  //
  // { name: "Brahmand Campus", brand: "RIS", code: "brahmand", pin: "1234", isActive: true },
  // { name: "Dhokali Campus",  brand: "RIS", code: "dhokali",  pin: "1234", isActive: true },
  // { name: "RPS Brahmand",    brand: "RPS", code: "rps-brahmand", pin: "1234", isActive: true },
  //
  // Insert a placeholder "Demo" branch so the system is functional out of the box:
  const branches = [
    { name: "[CONFIRM] Branch 1 – RIS", brand: "RIS", code: "ris-branch-1", pin: "0000", isActive: false },
    { name: "[CONFIRM] Branch 2 – RPS", brand: "RPS", code: "rps-branch-1", pin: "0000", isActive: false },
  ];

  for (const branch of branches) {
    await db.insert(walkinBranches).values(branch).onConflictDoNothing();
  }
  console.log("[walkin-seed] Branch placeholders inserted (isActive=false — fill in real data before activating)");

  // ── Staff / Lead Owners ───────────────────────────────────────
  // [CONFIRM] Replace with real staff names for the Lead Owner dropdown.
  // Brand null = appears on both RIS and RPS forms.
  //
  // Example:
  // { name: "Priya Sharma", brand: "RIS", isActive: true, sortOrder: 0 },
  // { name: "Anjali Patil", brand: "RPS", isActive: true, sortOrder: 0 },
  //
  const staff = [
    { name: "[CONFIRM] Staff Member 1", brand: null, isActive: false, sortOrder: 0 },
  ];
  for (const s of staff) {
    await db.insert(walkinStaff).values(s).onConflictDoNothing();
  }
  console.log("[walkin-seed] Staff placeholders inserted");

  console.log("[walkin-seed] Done ✓");
  process.exit(0);
}

main().catch((err) => {
  console.error("[walkin-seed] Error:", err);
  process.exit(1);
});
