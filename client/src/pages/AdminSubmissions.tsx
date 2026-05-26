import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";

const NAVY = "#091a4f";
const AMBER = "#f59e0b";

type Submission = {
  id: string;
  raName: string;
  raBranch: string;
  parentName: string;
  studentName: string;
  grade: string;
  submittedAt: string;
};

function getToken() {
  try { return sessionStorage.getItem("ris_admin_auth") || ""; } catch { return ""; }
}

export default function AdminSubmissions() {
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRa, setFilterRa] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    const res = await fetch("/api/admin/ras/submissions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setRows(await res.json());
    } else {
      setError(res.status === 401 ? "Unauthorized — please log in via /admin/ras" : "Failed to load submissions");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const raNames = Array.from(new Set(rows.map(r => r.raName))).sort();
  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.parentName.toLowerCase().includes(q) || r.studentName.toLowerCase().includes(q) || r.grade.toLowerCase().includes(q);
    const matchRa = filterRa === "All" || r.raName === filterRa;
    return matchSearch && matchRa;
  });

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  // Today's count
  const todayStr = new Date().toDateString();
  const todayCount = rows.filter(r => new Date(r.submittedAt).toDateString() === todayStr).length;

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <div className="text-white py-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b-4 border-amber-400" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md flex items-center justify-center font-black text-sm" style={{ background: AMBER, color: NAVY }}>RIS</div>
          <div>
            <div className="font-black text-lg leading-tight">Walk-in Submissions</div>
            <div className="text-xs text-blue-200">QR Check-in Log · Admin</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/ras"><a className="px-3 py-1.5 rounded border border-white/30 text-white text-xs font-semibold hover:bg-white/10">← RA Management</a></Link>
          <Link href="/sales"><a className="px-3 py-1.5 rounded border border-white/30 text-white text-xs font-semibold hover:bg-white/10">Sales Dashboard</a></Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Total Check-ins</div>
            <div className="text-3xl font-black mt-1" style={{ color: NAVY }}>{rows.length.toLocaleString("en-IN")}</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Today</div>
            <div className="text-3xl font-black mt-1" style={{ color: "#059669" }}>{todayCount}</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wide">RAs Active</div>
            <div className="text-3xl font-black mt-1" style={{ color: AMBER }}>{raNames.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search parent / student name…"
            className="px-3 py-2 rounded-lg border-2 border-slate-200 text-sm focus:outline-none focus:border-amber-400 w-64"
            data-testid="input-search"
          />
          <select value={filterRa} onChange={e => setFilterRa(e.target.value)}
            className="px-3 py-2 rounded-lg border-2 border-slate-200 text-sm bg-white focus:outline-none focus:border-amber-400"
            data-testid="select-filter-ra">
            <option value="All">All Counsellors</option>
            {raNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <div className="text-xs text-slate-400 self-center">{filtered.length} of {rows.length} records</div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-slate-400 text-sm text-center py-12">Loading…</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-submissions">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4">Date & Time</th>
                  <th className="text-left py-3 px-4">Counsellor</th>
                  <th className="text-left py-3 px-4">Branch</th>
                  <th className="text-left py-3 px-4">Parent Name</th>
                  <th className="text-left py-3 px-4">Student Name</th>
                  <th className="text-left py-3 px-4">Grade</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">No submissions found</td></tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.id} className={`border-t border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`} data-testid={`row-submission-${r.id}`}>
                    <td className="py-2.5 px-4 text-slate-500 tabular-nums text-xs whitespace-nowrap">{fmtDate(r.submittedAt)}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{r.raName}</td>
                    <td className="py-2.5 px-4 text-slate-500">{r.raBranch}</td>
                    <td className="py-2.5 px-4">{r.parentName}</td>
                    <td className="py-2.5 px-4">{r.studentName}</td>
                    <td className="py-2.5 px-4 text-slate-600">{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
