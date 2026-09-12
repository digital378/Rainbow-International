export interface ParentAdvocacyRecord {
  sno: string;
  referringParent: string;
  branch: string;
  wardClass: string;
  fatherName: string;
  motherName: string;
  contactNumber: string;
  partnerStatus: string;
  referredFamily: string;
  gradeApplying: string;
  status: string;
  dateReferred: string;
  lastUpdate: string;
  incentiveGiven: string;
  pacAttendance: Record<string, string>;
}

export interface PacMeetingSummary {
  key: string;
  label: string;
  date: string;
  attendedCount: number;
}

const normalizeHeader = (value: string | undefined) =>
  (value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");

const extractPacDate = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const longDate = trimmed.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})\b/i);
  if (longDate) return `${Number(longDate[1])} ${longDate[2]} ${longDate[3]}`;
  const numericDate = trimmed.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/);
  if (numericDate) return numericDate[1];
  return trimmed;
};

export function parseParentAdvocacySheet(rows: string[][]): {
  parentAdvocacy: ParentAdvocacyRecord[];
  pacMeetings: PacMeetingSummary[];
} {
  const headers = rows[0] || [];
  const headerIndex = new Map(
    headers.map((header, index) => [normalizeHeader(header), index]),
  );
  const column = (...aliases: string[]) => {
    for (const alias of aliases) {
      const index = headerIndex.get(normalizeHeader(alias));
      if (index !== undefined) return index;
    }
    return -1;
  };
  const value = (row: string[], ...aliases: string[]) => {
    const index = column(...aliases);
    return index >= 0 ? row[index] ?? "" : "";
  };

  const explicitPacColumns = headers
    .map((header, index) => {
      const match = header.trim().match(/^PAC\s*(\d+)\b/i);
      return match ? { key: `PAC ${Number(match[1])}`, number: Number(match[1]), index } : null;
    })
    .filter((entry): entry is { key: string; number: number; index: number } => entry !== null)
    .sort((a, b) => a.number - b.number);
  const legacyMeetingColumn = column("Ambassador Meeting");
  const pacColumns = [
    ...(legacyMeetingColumn >= 0 && !explicitPacColumns.some(entry => entry.number === 1)
      ? [{ key: "PAC 1", number: 1, index: legacyMeetingColumn }]
      : []),
    ...explicitPacColumns,
  ].sort((a, b) => a.number - b.number);

  const parentAdvocacy = rows.slice(1)
    .filter(row => value(row, "Student Name", "RIS Student Name").trim())
    .map(row => ({
      sno: value(row, "Sr No", "S.No", "S No"),
      referringParent: value(row, "Student Name", "RIS Student Name"),
      branch: value(row, "Branch"),
      wardClass: value(row, "Referring Parent's Ward - Class", "Ward-Class", "Ward Class"),
      fatherName: value(row, "Name of the Parent", "Father Name"),
      motherName: value(row, "Name of the Mother", "Mother Name"),
      contactNumber: value(row, "Contact Number", "Contact"),
      partnerStatus: value(row, "Ambassador Status", "Partner Status"),
      referredFamily: value(row, "Referred Family Name", "Referred Family"),
      gradeApplying: value(row, "Grade Applying For", "Grade Applying"),
      status: value(row, "Status", "Referral Status"),
      dateReferred: value(row, "Date Referred"),
      lastUpdate: value(row, "Last Update Date", "Last Update"),
      incentiveGiven: value(row, "Referral Amount", "Incentive Given?", "Incentive Details"),
      pacAttendance: Object.fromEntries(
        pacColumns.map(({ key, index }) => [key, extractPacDate(row[index] ?? "")]),
      ),
    }));

  const pacMeetings = pacColumns.map(({ key }) => {
    const dates = parentAdvocacy
      .map(parent => parent.pacAttendance[key])
      .filter(Boolean);
    const dateCounts = new Map<string, number>();
    for (const date of dates) dateCounts.set(date, (dateCounts.get(date) || 0) + 1);
    const meetingDate = [...dateCounts.entries()]
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "";
    return { key, label: key, date: meetingDate, attendedCount: dates.length };
  });

  return { parentAdvocacy, pacMeetings };
}

export function matchesParentAdvocacyFilters(
  parent: ParentAdvocacyRecord,
  filters: {
    partnerStatus?: string;
    pacKey?: string;
    pacAttendance?: "Attended" | "Not attended" | "";
    search?: string;
  },
): boolean {
  if (filters.partnerStatus === "Not yet reached") {
    if (parent.partnerStatus.trim()) return false;
  } else if (filters.partnerStatus && parent.partnerStatus !== filters.partnerStatus) {
    return false;
  }

  if (filters.pacKey && filters.pacAttendance) {
    const attended = Boolean(parent.pacAttendance[filters.pacKey]?.trim());
    if (filters.pacAttendance === "Attended" && !attended) return false;
    if (filters.pacAttendance === "Not attended" && attended) return false;
  }

  if (filters.search) {
    const query = filters.search.toLowerCase();
    if (!parent.referringParent.toLowerCase().includes(query)
      && !parent.referredFamily.toLowerCase().includes(query)
      && !parent.fatherName.toLowerCase().includes(query)
      && !parent.motherName.toLowerCase().includes(query)
      && !parent.contactNumber.includes(query)) return false;
  }
  return true;
}