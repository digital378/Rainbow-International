import { useState, useEffect, useCallback, useRef } from "react";

const NAVY = "#091a4f";
const AMBER = "#f59e0b";
const GREEN = "#059669";
const RED = "#dc2626";
const ADMIN_AUTH_KEY = "ris_admin_auth";

function getToken() {
  try { return sessionStorage.getItem(ADMIN_AUTH_KEY) || ""; } catch { return ""; }
}

// ── Types ────────────────────────────────────────────────────────
type Lead = {
  id: string; brand: string; branchId: number | null; academicYear: string;
  enquiryDate: string; monthLabel: string; parentName: string; childName: string;
  phone: string; altPhone: string | null; email: string | null; program: string;
  source: string; status: string; closeReason: string | null; remark: string | null;
  leadOwner: string | null; walkInDate: string | null; revisitDate: string | null;
  misCallingRemarks: string | null;
  isArchived: boolean; createdBy: string; updatedBy: string | null;
  createdAt: string; updatedAt: string;
};
type Lookups = {
  programs: { id: number; label: string; brand: string | null }[];
  sources:  { id: number; label: string }[];
  statuses: { id: number; label: string }[];
  closeReasons: { id: number; label: string }[];
  staff:    { id: number; name: string }[];
  branches: { id: number; name: string; brand: string; code: string }[];
};
type AuditRow = {
  id: number; leadId: string; field: string; oldValue: string | null;
  newValue: string | null; changedBy: string; changedAt: string;
};

const WALKIN_STATUSES = ["WALK-IN BOOKED", "WALK-IN COMPLETED", "ADMISSION DONE"];
const CLOSED_STATUS = "CLOSED";

// ── Admin Gate ───────────────────────────────────────────────────
function AdminGate({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/walkin/leads?page=1&pageSize=1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      try { sessionStorage.setItem(ADMIN_AUTH_KEY, token); } catch {}
      onSuccess(token);
    } else {
      setError(true); setToken("");
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: NAVY }}>
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm border-t-4 border-amber-400">
        <div className="flex items-center gap-3 mb-6">
          <img src="/images/ris-logo-2.png" alt="" style={{ height: 44, width: "auto", flexShrink: 0 }} />
          <div>
            <div className="font-black text-lg" style={{ color: NAVY }}>Leads Management</div>
            <div className="text-xs text-slate-500">AY 2027-28 · Internal</div>
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Token</label>
        <input
          ref={inputRef}
          type="password"
          autoComplete="off"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Enter admin token"
          className={`w-full px-4 py-3 rounded-lg border-2 text-sm focus:outline-none ${error ? "border-red-500 bg-red-50" : "border-slate-300 focus:border-amber-400"}`}
        />
        {error && <div className="mt-2 text-sm text-red-600">Invalid token</div>}
        <button type="submit" className="mt-4 w-full py-3 rounded-lg font-bold text-white" style={{ background: NAVY }}>
          Unlock
        </button>
      </form>
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────
function StatusBadge({ status, archived }: { status: string; archived: boolean }) {
  if (archived) return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400">ARCHIVED</span>;
  const map: Record<string, string> = {
    "OPEN": "bg-blue-50 text-blue-700",
    "FOLLOW-UP": "bg-amber-50 text-amber-700",
    "WALK-IN BOOKED": "bg-purple-50 text-purple-700",
    "WALK-IN COMPLETED": "bg-teal-50 text-teal-700",
    "ADMISSION DONE": "bg-green-50 text-green-700",
    "CLOSED": "bg-red-50 text-red-600",
    "NOT INTERESTED": "bg-slate-100 text-slate-500",
  };
  const cls = map[status] || "bg-slate-100 text-slate-600";
  return <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${cls}`}>{status}</span>;
}

// ── Edit Panel ───────────────────────────────────────────────────
function EditPanel({
  lead, lookups, token, onSave, onClose,
}: {
  lead: Lead; lookups: Lookups; token: string;
  onSave: (updated: Lead) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    parentName: lead.parentName,
    childName: lead.childName,
    altPhone: lead.altPhone || "",
    email: lead.email || "",
    program: lead.program,
    source: lead.source,
    status: lead.status,
    closeReason: lead.closeReason || "",
    walkInDate: lead.walkInDate || "",
    revisitDate: lead.revisitDate || "",
    leadOwner: lead.leadOwner || "",
    remark: lead.remark || "",
    misCallingRemarks: lead.misCallingRemarks || "",
    branchId: lead.branchId ? String(lead.branchId) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const needsCloseReason = form.status === CLOSED_STATUS;
  const needsWalkInDate = WALKIN_STATUSES.includes(form.status);
  const canSave =
    form.parentName.trim().length >= 2 &&
    form.childName.trim().length >= 2 &&
    (!needsCloseReason || form.closeReason.trim()) &&
    (!needsWalkInDate || form.walkInDate);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (field === "status") {
      if (e.target.value !== CLOSED_STATUS) setForm(f => ({ ...f, status: e.target.value, closeReason: "" }));
      if (!WALKIN_STATUSES.includes(e.target.value)) setForm(f => ({ ...f, status: e.target.value, walkInDate: "" }));
    }
  };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/walkin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          parentName: form.parentName.trim(),
          childName: form.childName.trim(),
          altPhone: form.altPhone || undefined,
          email: form.email || undefined,
          program: form.program,
          source: form.source,
          status: form.status,
          closeReason: form.closeReason || undefined,
          walkInDate: form.walkInDate || undefined,
          revisitDate: form.revisitDate || undefined,
          leadOwner: form.leadOwner || undefined,
          remark: form.remark || undefined,
          misCallingRemarks: form.misCallingRemarks || undefined,
          branchId: form.branchId ? parseInt(form.branchId, 10) : undefined,
          updatedBy: "admin",
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Save failed");
      }
      const updated = await res.json();
      onSave(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const F = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400";
  const selectCls = inputCls;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg bg-white shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100" style={{ background: NAVY }}>
          <div>
            <div className="font-bold text-white text-sm">Edit Lead</div>
            <div className="text-blue-200 text-xs">{lead.parentName} · {lead.phone}</div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none px-1">✕</button>
        </div>

        {/* Read-only locked fields */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-3 text-xs text-slate-500">
          <span><b className="text-slate-700">Brand:</b> {lead.brand}</span>
          <span><b className="text-slate-700">Date:</b> {lead.enquiryDate}</span>
          <span><b className="text-slate-700">Month:</b> {lead.monthLabel}</span>
          <span><b className="text-slate-700">Phone:</b> {lead.phone}</span>
          <span><b className="text-slate-700">Created by:</b> {lead.createdBy}</span>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Parent Name" required>
              <input className={inputCls} value={form.parentName} onChange={set("parentName")} />
            </F>
            <F label="Child Name" required>
              <input className={inputCls} value={form.childName} onChange={set("childName")} />
            </F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Alt Phone">
              <input className={inputCls} type="tel" value={form.altPhone} onChange={set("altPhone")} placeholder="Optional" />
            </F>
            <F label="Email">
              <input className={inputCls} type="email" value={form.email} onChange={set("email")} placeholder="Optional" />
            </F>
          </div>

          <F label="Branch">
            <select className={selectCls} value={form.branchId} onChange={set("branchId")}>
              <option value="">— unassigned —</option>
              {lookups.branches.filter(b => !b.brand || b.brand === lead.brand).map(b =>
                <option key={b.id} value={b.id}>{b.name}</option>
              )}
            </select>
          </F>

          <div className="grid grid-cols-2 gap-3">
            <F label="Program" required>
              <select className={selectCls} value={form.program} onChange={set("program")}>
                {lookups.programs.filter(p => !p.brand || p.brand === lead.brand).map(p =>
                  <option key={p.id} value={p.label}>{p.label}</option>
                )}
              </select>
            </F>
            <F label="Source" required>
              <select className={selectCls} value={form.source} onChange={set("source")}>
                {lookups.sources.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
              </select>
            </F>
          </div>

          <F label="Status" required>
            <select className={selectCls} value={form.status} onChange={set("status")}>
              {lookups.statuses.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
            </select>
          </F>

          {needsCloseReason && (
            <F label="Close Reason" required>
              <select className={selectCls} value={form.closeReason} onChange={set("closeReason")}>
                <option value="">— select reason —</option>
                {lookups.closeReasons.map(r => <option key={r.id} value={r.label}>{r.label}</option>)}
              </select>
            </F>
          )}

          {needsWalkInDate && (
            <F label="Walk-in Date" required>
              <input className={inputCls} type="date" value={form.walkInDate} onChange={set("walkInDate")} />
            </F>
          )}

          <div className="grid grid-cols-2 gap-3">
            <F label="Lead Owner">
              <select className={selectCls} value={form.leadOwner} onChange={set("leadOwner")}>
                <option value="">— unassigned —</option>
                {lookups.staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </F>
            <F label="Revisit Date">
              <input className={inputCls} type="date" value={form.revisitDate} onChange={set("revisitDate")} />
            </F>
          </div>

          <F label="Follow-up Remarks">
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              value={form.remark}
              onChange={set("remark")}
              placeholder="Internal notes…"
            />
          </F>

          <F label="MIS Calling Remarks">
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              value={form.misCallingRemarks}
              onChange={set("misCallingRemarks")}
              placeholder="MIS calling notes (synced with sheet col Q)…"
            />
          </F>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="flex-1 py-2.5 rounded-lg font-bold text-white text-sm transition disabled:opacity-50"
            style={{ background: canSave && !saving ? NAVY : undefined }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── History Modal ─────────────────────────────────────────────────
function HistoryModal({ lead, token, onClose }: { lead: Lead; token: string; onClose: () => void }) {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/walkin/leads/${lead.id}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setRows)
      .finally(() => setLoading(false));
  }, [lead.id, token]);

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) +
      " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100" style={{ background: NAVY }}>
          <div>
            <div className="font-bold text-white text-sm">Change History</div>
            <div className="text-blue-200 text-xs">{lead.parentName} · {lead.phone}</div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl px-1">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && <div className="text-slate-400 text-sm text-center py-8">Loading history…</div>}
          {!loading && rows.length === 0 && <div className="text-slate-400 text-sm text-center py-8">No history recorded yet</div>}
          {!loading && rows.length > 0 && (
            <div className="space-y-3">
              {rows.map(row => {
                const isSheetSync = row.changedBy === "sheet-sync";
                const dotColor = row.field === "created" ? GREEN : row.field === "archived" ? RED : isSheetSync ? "#0ea5e9" : AMBER;
                return (
                  <div key={row.id} className={`flex gap-3 text-xs rounded-lg px-2 py-1 -mx-2 ${isSheetSync ? "bg-sky-50" : ""}`}>
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: dotColor }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">
                          {row.field === "created" ? "Lead created" : row.field === "archived" ? "Lead archived" : `${row.field} changed`}
                        </span>
                        {isSheetSync && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 uppercase tracking-wide">Sheet sync</span>
                        )}
                      </div>
                      {row.field !== "created" && row.field !== "archived" && (
                        <div className="text-slate-500">
                          <span className="line-through mr-1">{row.oldValue || "—"}</span>
                          <span className="text-slate-400 mr-1">→</span>
                          <span className="font-medium text-slate-700">{row.newValue || "—"}</span>
                        </div>
                      )}
                      {row.field === "created" && row.newValue && (
                        <div className="text-slate-400 font-mono text-[10px] truncate">{row.newValue}</div>
                      )}
                      <div className="text-slate-400 mt-0.5">{fmt(row.changedAt)} · by {row.changedBy}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-slate-100">
          <button onClick={onClose} className="w-full py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Archive Modal ─────────────────────────────────────────────────
function ArchiveModal({ lead, token, onArchived, onClose }: {
  lead: Lead; token: string; onArchived: (id: string) => void; onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/walkin/leads/${lead.id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ archivedBy: "admin" }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Archive failed");
      }
      onArchived(lead.id);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-lg font-bold text-slate-800 mb-2">Archive this lead?</div>
        <div className="text-sm text-slate-600 mb-1">
          <b>{lead.parentName}</b> · {lead.childName} · {lead.phone}
        </div>
        <div className="text-xs text-slate-400 mb-5">
          The lead will be hidden from the default view. This can be undone by contacting the system admin.
        </div>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <div className="flex gap-3">
          <button
            onClick={confirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg font-bold text-white text-sm disabled:opacity-50"
            style={{ background: RED }}
          >
            {loading ? "Archiving…" : "Yes, Archive"}
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Leads Panel ──────────────────────────────────────────────
function LeadsPanel({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const [filters, setFilters] = useState({
    brand: "", branchId: "", status: "", leadOwner: "",
    dateFrom: "", dateTo: "", search: "", showArchived: false,
  });

  // Panel / modal state
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [historyLead, setHistoryLead] = useState<Lead | null>(null);
  const [archiveLead, setArchiveLead] = useState<Lead | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchLookups = useCallback(async () => {
    const res = await fetch("/api/walkin/lookups", { headers });
    if (res.ok) setLookups(await res.json());
  }, [token]);

  const fetchLeads = useCallback(async (p = page, f = filters) => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({
        page: String(p),
        pageSize: String(PAGE_SIZE),
        ...(f.brand && { brand: f.brand }),
        ...(f.branchId && { branchId: f.branchId }),
        ...(f.status && { status: f.status }),
        ...(f.leadOwner && { leadOwner: f.leadOwner }),
        ...(f.dateFrom && { dateFrom: f.dateFrom }),
        ...(f.dateTo && { dateTo: f.dateTo }),
        ...(f.search && { search: f.search }),
        ...(f.showArchived && { includeArchived: "true" }),
      });
      const res = await fetch(`/api/walkin/leads?${params}`, { headers });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setLeads(data.leads);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, filters, token]);

  useEffect(() => {
    document.title = "Leads | Admin · AY 2027-28";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    fetchLookups();
  }, []);

  useEffect(() => { fetchLeads(page, filters); }, [page, filters]);

  const applyFilter = (field: string, value: string | boolean) => {
    setPage(1);
    setFilters(f => ({ ...f, [field]: value }));
  };

  const downloadExport = () => {
    const params = new URLSearchParams({
      ...(filters.brand && { brand: filters.brand }),
      ...(filters.branchId && { branchId: filters.branchId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
      token,
    });
    window.open(`/api/walkin/leads/export?${params}`, "_blank");
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const inputCls = "px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white";
  const selectCls = `${inputCls} pr-7`;

  // Branch options filtered by brand
  const branchOptions = lookups?.branches.filter(b => !filters.brand || b.brand === filters.brand) ?? [];

  // Distinct lead owners from loaded leads + lookups staff
  const ownerOptions = Array.from(new Set([
    ...(lookups?.staff.map(s => s.name) ?? []),
    ...leads.map(l => l.leadOwner).filter(Boolean) as string[],
  ]));

  const handleSaved = (updated: Lead) => {
    setLeads(ls => ls.map(l => l.id === updated.id ? updated : l));
    setEditLead(null);
  };

  const handleArchived = (id: string) => {
    if (filters.showArchived) {
      setLeads(ls => ls.map(l => l.id === id ? { ...l, isArchived: true } : l));
    } else {
      setLeads(ls => ls.filter(l => l.id !== id));
      setTotal(t => t - 1);
    }
    setArchiveLead(null);
  };

  const fmtDate = (d: string | null) => d ? d.replace(/^\d{4}-/, "").replace("-", "/") : "—";

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Top bar */}
      <div className="text-white py-3 px-5 flex flex-wrap items-center justify-between gap-3 border-b-4 border-amber-400" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <img src="/images/ris-logo-2.png" alt="" style={{ height: 36, width: "auto", flexShrink: 0 }} />
          <div>
            <div className="font-black text-base leading-tight">Walk-in Leads</div>
            <div className="text-[11px] text-blue-200">AY 2027-28 · Admin · {total} total</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => fetchLeads(page, filters)}
            className="px-3 py-1.5 rounded bg-amber-400 text-[#091a4f] font-bold hover:bg-amber-300"
          >Refresh</button>
          <button
            onClick={downloadExport}
            className="px-3 py-1.5 rounded border border-white/30 text-white/80 hover:bg-white/10"
          >⬇ Export CSV</button>
          <a href="/admin/ras" className="px-3 py-1.5 rounded border border-white/30 text-white/80 hover:bg-white/10">← Admin</a>
          <button
            onClick={() => { try { sessionStorage.removeItem(ADMIN_AUTH_KEY); } catch {} onLogout(); }}
            className="px-3 py-1.5 rounded border border-white/30 text-white/60 hover:bg-white/10"
          >Lock</button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-200 px-5 py-3">
        <div className="flex flex-wrap gap-2 items-end">
          <select className={selectCls} value={filters.brand} onChange={e => applyFilter("brand", e.target.value)}>
            <option value="">All Brands</option>
            <option value="RIS">RIS</option>
            <option value="RPS">RPS</option>
          </select>
          <select className={selectCls} value={filters.branchId} onChange={e => applyFilter("branchId", e.target.value)}>
            <option value="">All Branches</option>
            {branchOptions.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className={selectCls} value={filters.status} onChange={e => applyFilter("status", e.target.value)}>
            <option value="">All Statuses</option>
            {lookups?.statuses.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
          </select>
          <select className={selectCls} value={filters.leadOwner} onChange={e => applyFilter("leadOwner", e.target.value)}>
            <option value="">All Owners</option>
            {ownerOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">From</span>
            <input type="date" className={inputCls} value={filters.dateFrom} onChange={e => applyFilter("dateFrom", e.target.value)} />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">To</span>
            <input type="date" className={inputCls} value={filters.dateTo} onChange={e => applyFilter("dateTo", e.target.value)} />
          </div>
          <input
            type="text"
            className={`${inputCls} w-48`}
            placeholder="Search name or phone…"
            value={filters.search}
            onChange={e => applyFilter("search", e.target.value)}
          />
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showArchived}
              onChange={e => applyFilter("showArchived", e.target.checked)}
              className="rounded"
            />
            Show archived
          </label>
          {(filters.brand || filters.branchId || filters.status || filters.leadOwner || filters.dateFrom || filters.dateTo || filters.search) && (
            <button
              onClick={() => { setPage(1); setFilters(f => ({ ...f, brand: "", branchId: "", status: "", leadOwner: "", dateFrom: "", dateTo: "", search: "" })); }}
              className="text-xs text-amber-600 font-semibold underline"
            >Clear filters</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="px-5 py-4">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wide">
                  <th className="text-left px-3 py-3 font-semibold">#</th>
                  <th className="text-left px-3 py-3 font-semibold">Date</th>
                  <th className="text-left px-3 py-3 font-semibold">Brand</th>
                  <th className="text-left px-3 py-3 font-semibold">Branch</th>
                  <th className="text-left px-3 py-3 font-semibold">Parent</th>
                  <th className="text-left px-3 py-3 font-semibold">Child</th>
                  <th className="text-left px-3 py-3 font-semibold">Phone</th>
                  <th className="text-left px-3 py-3 font-semibold">Program</th>
                  <th className="text-left px-3 py-3 font-semibold">Source</th>
                  <th className="text-left px-3 py-3 font-semibold">Status</th>
                  <th className="text-left px-3 py-3 font-semibold">Owner</th>
                  <th className="text-left px-3 py-3 font-semibold">Walk-in</th>
                  <th className="text-left px-3 py-3 font-semibold">Updated</th>
                  <th className="text-right px-3 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={14} className="text-center py-12 text-slate-400">Loading…</td></tr>
                )}
                {!loading && leads.length === 0 && (
                  <tr><td colSpan={14} className="text-center py-12 text-slate-400">No leads found</td></tr>
                )}
                {!loading && leads.map((lead, i) => {
                  const branchName = lookups?.branches.find(b => b.id === lead.branchId)?.name;
                  const rowNum = (page - 1) * PAGE_SIZE + i + 1;
                  return (
                    <tr
                      key={lead.id}
                      className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors ${lead.isArchived ? "opacity-50" : ""}`}
                    >
                      <td className="px-3 py-2.5 text-slate-400 tabular-nums">{rowNum}</td>
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{lead.enquiryDate}</td>
                      <td className="px-3 py-2.5">
                        <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${lead.brand === "RIS" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>
                          {lead.brand}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{branchName || <span className="text-slate-300">—</span>}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-800 max-w-[120px] truncate" title={lead.parentName}>{lead.parentName}</td>
                      <td className="px-3 py-2.5 text-slate-600 max-w-[100px] truncate" title={lead.childName}>{lead.childName}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-700 whitespace-nowrap">{lead.phone}</td>
                      <td className="px-3 py-2.5 text-slate-600 max-w-[100px] truncate" title={lead.program}>{lead.program}</td>
                      <td className="px-3 py-2.5 text-slate-500 max-w-[80px] truncate" title={lead.source}>{lead.source}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <StatusBadge status={lead.status} archived={lead.isArchived} />
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 max-w-[80px] truncate">{lead.leadOwner || <span className="text-slate-300">—</span>}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{fmtDate(lead.walkInDate)}</td>
                      <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">
                        {new Date(lead.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {!lead.isArchived && (
                            <button
                              onClick={() => setEditLead(lead)}
                              className="px-2.5 py-1 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                            >Edit</button>
                          )}
                          <button
                            onClick={() => setHistoryLead(lead)}
                            className="px-2.5 py-1 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                          >History</button>
                          {!lead.isArchived && (
                            <button
                              onClick={() => setArchiveLead(lead)}
                              className="px-2.5 py-1 rounded text-[10px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
                            >Archive</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
              <div className="text-xs text-slate-500">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded text-xs font-medium border border-slate-200 disabled:opacity-40 hover:bg-white transition"
                >← Prev</button>
                <span className="px-3 text-xs text-slate-600">Page {page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded text-xs font-medium border border-slate-200 disabled:opacity-40 hover:bg-white transition"
                >Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-3 text-[11px] text-slate-400 text-center">
          Showing {leads.length} of {total} leads · AY 2027-28 · Changes are audit-logged
        </div>
      </div>

      {/* Overlays */}
      {editLead && lookups && (
        <EditPanel lead={editLead} lookups={lookups} token={token} onSave={handleSaved} onClose={() => setEditLead(null)} />
      )}
      {historyLead && (
        <HistoryModal lead={historyLead} token={token} onClose={() => setHistoryLead(null)} />
      )}
      {archiveLead && (
        <ArchiveModal lead={archiveLead} token={token} onArchived={handleArchived} onClose={() => setArchiveLead(null)} />
      )}
    </div>
  );
}

// ── Page Entry Point ──────────────────────────────────────────────
export default function WalkinLeads() {
  const [token, setToken] = useState<string | null>(() => {
    const t = getToken(); return t || null;
  });
  if (!token) return <AdminGate onSuccess={t => setToken(t)} />;
  return (
    <LeadsPanel
      token={token}
      onLogout={() => {
        try { sessionStorage.removeItem(ADMIN_AUTH_KEY); } catch {}
        setToken(null);
      }}
    />
  );
}
