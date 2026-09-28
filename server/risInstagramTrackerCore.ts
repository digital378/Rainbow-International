const istFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
});

export function istDay(date: Date): string {
  const parts = Object.fromEntries(istFormatter.formatToParts(date).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function shiftDay(day: string, offset: number): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + offset)).toISOString().slice(0, 10);
}

export function sheetDay(value: unknown): string | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return new Date(Date.UTC(1899, 11, 30 + value)).toISOString().slice(0, 10);
  }
  if (typeof value === "string" && /^\d{5}$/.test(value)) return sheetDay(Number(value));
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return null;
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

export type Snapshot = { day: string; posts: number; views: number };
export type Target = { row: number; kind: "daily" | "weekly" | "monthly"; key: string; posts: number; views: number };

function completeTotals(snapshots: Map<string, Snapshot>, start: string, end: string): Pick<Snapshot, "posts" | "views"> | null {
  let posts = 0, views = 0;
  for (let day = start; day <= end; day = shiftDay(day, 1)) {
    const snapshot = snapshots.get(day);
    if (!snapshot) return null;
    posts += snapshot.posts;
    views += snapshot.views;
  }
  return { posts, views };
}

/** Only existing RIS rows are eligible. An incomplete period is pending, never zero. */
export function findTrackerTargets(rows: unknown[][], snapshots: Snapshot[]): Target[] {
  const byDay = new Map(snapshots.map(s => [s.day, s]));
  const targets: Target[] = [];
  const seen = new Set<string>();
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (String(row?.[1] ?? "").trim().toUpperCase() !== "RIS") continue;
    const label = row[0];
    const day = sheetDay(label);
    let kind: Target["kind"] | null = null;
    let key = "";
    let totals: Pick<Snapshot, "posts" | "views"> | null = null;
    if (day) {
      kind = "daily";
      key = day;
      totals = byDay.get(day) ?? null;
    } else if (typeof label === "string") {
      const week = /\((\d{1,2})\s*([a-z]{3,9})\s*[-–]\s*(\d{1,2})\s*([a-z]{3,9})\)/i.exec(label);
      const month = /^([a-z]{3,9})\s+(\d{4})\s+report\b/i.exec(label.replace(/\s+/g, " ").trim());
      if (week) {
        const previousDaily = [...rows.slice(2, i)].reverse()
          .find(r => String(r?.[1] ?? "").trim().toUpperCase() === "RIS" && sheetDay(r?.[0]));
        const lastDay = previousDaily && sheetDay(previousDaily[0]);
        const endMonth = MONTHS[week[4].slice(0, 3).toLowerCase()];
        const startMonth = MONTHS[week[2].slice(0, 3).toLowerCase()];
        if (!lastDay || !startMonth || !endMonth) continue;
        // The weekly summary follows its Sunday in the sheet; reject mistyped labels.
        const endYear = Number(lastDay.slice(0, 4));
        const startYear = startMonth > endMonth ? endYear - 1 : endYear;
        const start = `${startYear}-${String(startMonth).padStart(2, "0")}-${week[1].padStart(2, "0")}`;
        const end = `${endYear}-${String(endMonth).padStart(2, "0")}-${week[3].padStart(2, "0")}`;
        if (end !== lastDay || shiftDay(start, 6) !== end) continue;
        kind = "weekly";
        key = `${start}/${end}`;
        totals = completeTotals(byDay, start, end);
      } else if (month) {
        const monthNumber = MONTHS[month[1].slice(0, 3).toLowerCase()];
        if (!monthNumber) continue;
        const year = Number(month[2]);
        const start = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
        const end = shiftDay(new Date(Date.UTC(year, monthNumber, 1)).toISOString().slice(0, 10), -1);
        kind = "monthly";
        key = start.slice(0, 7);
        totals = completeTotals(byDay, start, end);
      }
    }
    if (!kind || !totals) continue;
    const identity = `${kind}:${key}`;
    if (seen.has(identity)) throw new Error(`Duplicate RIS tracker period: ${identity}`);
    seen.add(identity);
    targets.push({ row: i + 1, kind, key, ...totals });
  }
  return targets;
}

export function writableFields(row: unknown[], target: Target): { column: "D" | "E"; value: number }[] {
  const fields: { column: "D" | "E"; value: number }[] = [];
  for (const [index, column, value] of [[3, "D", target.posts], [4, "E", target.views]] as const) {
    const existing = row[index];
    if (existing === value || String(existing ?? "").trim() === String(value)) continue;
    // Staff values and formulas win. Zero is the existing tracker template placeholder.
    if (existing === undefined || existing === null || existing === "" || existing === 0 || existing === "0") {
      fields.push({ column, value });
    } else {
      console.warn(`[ris-instagram] Existing ${column}${target.row} differs; leaving staff value intact`);
    }
  }
  return fields;
}