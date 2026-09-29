/**
 * Map CRM-owned fields onto an existing WALKINs tab without shifting or
 * overwriting its historical, staff-owned, or duplicate header columns.
 */
export function canonicalHeader(value: string): string {
  const name = value.trim().toLowerCase();
  return name === "remark" ? "follow up remarks" : name;
}

export type ManagedSheetLayout = {
  header: string[];
  leadIdIndex: number;
  protectedIndices: number[];
  project: (values: string[]) => string[];
};

export function resolveManagedSheetLayout(
  rows: string[][],
  expectedHeaders: readonly string[],
): ManagedSheetLayout {
  const header = rows[0] ?? [];
  const expected = new Map(expectedHeaders.map((name, index) => [canonicalHeader(name), index]));
  const found = new Map<string, number>();
  const idColumns: number[] = [];

  for (const [index, name] of header.entries()) {
    const key = canonicalHeader(name);
    if (key === "lead id") {
      idColumns.push(index);
    } else if (expected.has(key)) {
      if (found.has(key)) throw new Error(`Duplicate managed header "${name}"; refusing to mirror`);
      found.set(key, index);
    }
  }
  if (!idColumns.length) throw new Error("WALKINs is missing Lead ID; refusing to mirror");
  for (const name of expected.keys()) {
    if (name !== "actual admission date" && name !== "lead id" && !found.has(name)) {
      throw new Error(`WALKINs is missing "${name}"; refusing to mirror`);
    }
  }
  if (rows.slice(1).some(row => row.slice(header.length).some(value => String(value ?? "").trim()))) {
    throw new Error("WALKINs has data beyond its headers; refusing to append a header");
  }
  if (rows.slice(1).some(row => idColumns.slice(1).some(index => String(row[index] ?? "").trim()))) {
    throw new Error("WALKINs has values in repeated Lead ID columns; identity needs review");
  }

  const leadIdIndex = idColumns[0];
  const seenIds = new Set<string>();
  for (const row of rows.slice(1)) {
    const id = String(row[leadIdIndex] ?? "").trim();
    if (!id) continue;
    if (seenIds.has(id)) throw new Error("WALKINs has duplicate Lead IDs; refusing to mirror");
    seenIds.add(id);
  }
  const protectedIndices = header.flatMap((name, index) => {
    const key = canonicalHeader(name);
    return expected.has(key) && (key !== "lead id" || index === leadIdIndex) ? [] : [index];
  });
  return {
    header,
    leadIdIndex,
    protectedIndices,
    project: (values: string[]) => header.map((name, index) => {
      const key = canonicalHeader(name);
      if (key === "lead id" && index !== leadIdIndex) return "";
      const sourceIndex = expected.get(key);
      return sourceIndex === undefined ? "" : values[sourceIndex] ?? "";
    }),
  };
}

export function findManagedRow(rows: string[][], leadIdIndex: number, leadId: string): number {
  const matching = rows.flatMap((row, index) =>
    index > 0 && row[leadIdIndex]?.trim() === leadId ? [index] : []);
  if (matching.length > 1) throw new Error(`Duplicate Lead ID "${leadId}"; refusing to update`);
  return matching[0] ?? -1;
}