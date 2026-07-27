import { useEffect, useState } from "react";
import { useParams } from "wouter";

const NAVY = "#091a4f";
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Open":               { bg: "#dbeafe", text: "#1d4ed8" },
  "Walk-in Booked":     { bg: "#ede9fe", text: "#6d28d9" },
  "Walk-in Completed":  { bg: "#fef3c7", text: "#92400e" },
  "Closed":             { bg: "#fee2e2", text: "#b91c1c" },
  "Future Prospect":    { bg: "#f1f5f9", text: "#475569" },
  "Admission Done":     { bg: "#dcfce7", text: "#15803d" },
};

type Lead = {
  id: number;
  date: string;
  studentName: string;
  grade: string;
  parentName: string;
  phone: string;
  email: string | null;
  status: string;
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata",
  });
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: "#f1f5f9", text: "#475569" };
  return (
    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

export default function SchoolLeadsPortal() {
  const { token } = useParams<{ token: string }>();
  const [schoolName, setSchoolName] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (showSpinner = true) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await fetch(`/api/school-leads/${token}`);
      if (!res.ok) {
        setError("This link is invalid or the school is no longer active. Please contact Rainbow International School.");
        return;
      }
      const data = await res.json();
      setSchoolName(data.school.name);
      setLeads(data.leads);
      setLastRefreshed(new Date());
    } catch {
      setError("Unable to load data. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load(false);
    // Auto-refresh every 5 minutes
    const id = setInterval(() => load(false), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [token]);

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: NAVY }} className="px-4 py-4 sm:py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="text-white font-black text-base sm:text-lg leading-tight">
              {loading ? "Loading…" : schoolName || "School Portal"}
            </div>
            <div className="text-blue-200 text-xs mt-0.5">
              Referred Leads — Rainbow International School
            </div>
          </div>
          <img src="/favicon-192.png" alt="RIS" className="h-9 w-9 rounded-lg" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
            Loading your leads…
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <div className="text-slate-700 font-semibold text-sm max-w-sm mx-auto">{error}</div>
            <a href="mailto:info@rainbowinternationalschool.in"
              className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:underline">
              info@rainbowinternationalschool.in
            </a>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <div className="flex gap-3 flex-wrap">
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm text-center min-w-[80px]">
                  <div className="text-xl font-black" style={{ color: NAVY }}>{leads.length}</div>
                  <div className="text-xs text-slate-500 font-medium">Total Leads</div>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm text-center min-w-[80px]">
                  <div className="text-xl font-black text-green-600">
                    {leads.filter(l => l.status === "Admission Done").length}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Admissions</div>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm text-center min-w-[80px]">
                  <div className="text-xl font-black" style={{ color: "#f59e0b" }}>
                    {leads.filter(l => l.status === "Walk-in Completed" || l.status === "Admission Done").length}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Walk-ins</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={() => load(true)}
                  disabled={refreshing}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  {refreshing ? "Refreshing…" : "↻ Refresh"}
                </button>
                {lastRefreshed && (
                  <div className="text-xs text-slate-400">
                    Updated {lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
              </div>
            </div>

            {/* Leads table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {leads.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No leads submitted yet. Share your QR code to start collecting referrals.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {["#", "Date", "Student", "Grade", "Parent", "Phone", "Email", "Status"].map(h => (
                          <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((l, i) => (
                        <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                          <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap text-xs">{formatDate(l.date)}</td>
                          <td className="px-3 py-2.5 font-semibold text-slate-800 whitespace-nowrap">{l.studentName}</td>
                          <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{l.grade}</td>
                          <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">{l.parentName}</td>
                          <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap text-xs">{l.phone}</td>
                          <td className="px-3 py-2.5 text-slate-500 text-xs">{l.email || "—"}</td>
                          <td className="px-3 py-2.5">
                            <StatusBadge status={l.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-slate-400 mt-5">
              Status is updated by Rainbow International School. For questions, contact{" "}
              <a href="mailto:info@rainbowinternationalschool.in" className="text-blue-500 hover:underline">
                info@rainbowinternationalschool.in
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
