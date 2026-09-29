import { useState, useEffect, useCallback, useRef } from "react";
import { forgetPageSession, restorePageSession, signInPage } from "@/lib/walkinPageAuth";

const NAVY = "#091a4f";
const AMBER = "#f59e0b";
const GREEN = "#059669";
const RED = "#dc2626";

// ── Types ────────────────────────────────────────────────────────
type Lead = {
  id: string; brand: string; branchId: number | null; branchName?: string; academicYear: string;
  enquiryDate: string; monthLabel: string; parentName: string; motherName?: string; childName: string;
  phone: string; altPhone: string | null; email: string | null; program: string;
  source: string; status: string; closeReason: string | null; remark: string | null;
  leadOwner: string | null; walkInDate: string | null; admissionDate?: string | null; revisitDate: string | null; revisitDate2?: string | null;
  misCallingRemarks: string | null;
  isArchived: boolean; createdBy: string; updatedBy: string | null;
  createdAt: string; updatedAt: string;
  readOnly?: boolean;
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
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await signInPage("leads", passcode);
      if (token) { onSuccess(token); return; }
      setError("Invalid passcode");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Please try again.");
    }
    setPasscode("");
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
        <label htmlFor="leads-passcode" className="block text-sm font-semibold text-slate-700 mb-2">Leads passcode</label>
        <input
          id="leads-passcode"
          ref={inputRef}
          type="password"
          autoComplete="off"
          value={passcode}
          onChange={e => { setPasscode(e.target.value); setError(""); }}
          placeholder="Enter leads passcode"
          className={`w-full px-4 py-3 rounded-lg border-2 text-sm focus:outline-none ${error ? "border-red-500 bg-red-50" : "border-slate-300 focus:border-amber-400"}`}
        />
        {error && <div className="mt-2 text-sm text-red-600" role="alert">{error}</div>}
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
  return <span className={`inline-block max-w-full break-words px-2 py-0.5 rounded text-[10px] font-bold leading-tight ${cls}`}>{status}</span>;
}

// ── Shared form-field wrapper (must be module-level — not inside a component) ──
function F({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      <span className="block mt-1">{children}</span>
    </label>
  );
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
    status: lead.status,
    closeReason: lead.closeReason || "",
    walkInDate: lead.walkInDate || "",
    admissionDate: lead.admissionDate || "",
    revisitDate: lead.revisitDate || "",
    revisitDate2: lead.revisitDate2 || "",
    leadOwner: lead.leadOwner || "",
    remark: lead.remark || "",
    misCallingRemarks: lead.misCallingRemarks || "",
    branchId: lead.branchId ? String(lead.branchId) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const needsCloseReason = form.status === CLOSED_STATUS &&
    (form.status !== lead.status || form.closeReason !== (lead.closeReason || ""));
  const needsWalkInDate = WALKIN_STATUSES.includes(form.status) &&
    (form.status !== lead.status || form.walkInDate !== (lead.walkInDate || ""));
  const isTrackerRecord = lead.readOnly || lead.id.startsWith("crm-");
  const parentChanged = form.parentName.trim() !== (lead.parentName || "").trim();
  const parentValid = form.parentName.trim()
    ? form.parentName.trim().length >= 2
    : isTrackerRecord && !parentChanged;
  const hasChanges = parentChanged || form.childName !== lead.childName ||
    form.altPhone !== (lead.altPhone || "") || form.email !== (lead.email || "") ||
    form.program !== lead.program || form.status !== lead.status ||
    form.closeReason !== (lead.closeReason || "") || form.walkInDate !== (lead.walkInDate || "") ||
    form.admissionDate !== (lead.admissionDate || "") || form.revisitDate !== (lead.revisitDate || "") ||
    form.revisitDate2 !== (lead.revisitDate2 || "") || form.leadOwner !== (lead.leadOwner || "") ||
    form.remark !== (lead.remark || "") || form.misCallingRemarks !== (lead.misCallingRemarks || "") ||
    form.branchId !== (lead.branchId ? String(lead.branchId) : "");
  const canSave =
    parentValid &&
    form.childName.trim().length >= 2 &&
    (!needsCloseReason || form.closeReason.trim()) &&
    (!needsWalkInDate || form.walkInDate);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (field === "status") {
      if (e.target.value !== CLOSED_STATUS) setForm(f => ({ ...f, status: e.target.value, closeReason: "" }));
    }
  };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/walkin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          expectedUpdatedAt: lead.updatedAt,
          ...(form.parentName.trim() !== (lead.parentName || "").trim() && { parentName: form.parentName.trim() }),
          ...(form.childName !== lead.childName && { childName: form.childName.trim() }),
          ...(form.altPhone !== (lead.altPhone || "") && { altPhone: form.altPhone || null }),
          ...(form.email !== (lead.email || "") && { email: form.email || null }),
          ...(form.program !== lead.program && { program: form.program }),
          ...(form.status !== lead.status && { status: form.status }),
          ...(form.closeReason !== (lead.closeReason || "") && { closeReason: form.closeReason || null }),
          ...(form.walkInDate !== (lead.walkInDate || "") && { walkInDate: form.walkInDate || null }),
          ...(form.admissionDate !== (lead.admissionDate || "") && { admissionDate: form.admissionDate || null }),
          ...(form.revisitDate !== (lead.revisitDate || "") && { revisitDate: form.revisitDate || null }),
          ...(form.revisitDate2 !== (lead.revisitDate2 || "") && { revisitDate2: form.revisitDate2 || null }),
          ...(form.leadOwner !== (lead.leadOwner || "") && { leadOwner: form.leadOwner }),
          ...(form.remark !== (lead.remark || "") && { remark: form.remark }),
          ...(form.misCallingRemarks !== (lead.misCallingRemarks || "") && { misCallingRemarks: form.misCallingRemarks }),
          ...(form.branchId !== (lead.branchId ? String(lead.branchId) : "") && form.branchId && { branchId: parseInt(form.branchId, 10) }),
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

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400";
  const selectCls = inputCls;

  return (
      <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby="edit-lead-title" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg bg-white shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100" style={{ background: NAVY }}>
          <div>
            <div id="edit-lead-title" className="font-bold text-white text-sm">Edit Lead</div>
            <div className="text-blue-200 text-xs">{lead.childName} · {lead.phone}</div>
          </div>
          <button onClick={onClose} aria-label="Close edit panel" className="text-white/70 hover:text-white text-xl leading-none px-2 py-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Close</button>
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
            <F label="Parent Name" required={!isTrackerRecord || !!form.parentName}>
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
            <div>
              <div className="block text-xs font-semibold text-slate-600 mb-1">Source</div>
              <div className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700">
                {lead.source}
              </div>
              <p className="mt-1 text-xs text-slate-500">Original enquiry source · locked after creation</p>
            </div>
          </div>

          <F label="Status">
            <select className={selectCls} value={form.status} onChange={set("status")}>
              {!form.status && <option value="">Unclassified · needs review</option>}
              {!!form.status && !lookups.statuses.some(s => s.label === form.status) &&
                <option value={form.status}>{form.status} · historical status</option>}
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

          <F label="Walk-in Date" required={needsWalkInDate}>
            <input className={inputCls} type="date" value={form.walkInDate} onChange={set("walkInDate")} />
          </F>
          {!needsWalkInDate && <p className="text-xs text-slate-500 -mt-3">Optional unless a walk-in status is selected.</p>}

          <F label="Admission Date">
            <input className={inputCls} type="date" value={form.admissionDate} onChange={set("admissionDate")} aria-describedby="admission-date-note" />
          </F>
          <p id="admission-date-note" className="text-xs text-slate-500 -mt-3">Optional. Older records may not have an admission date.</p>

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
          <F label="Second Revisit Date">
            <input className={inputCls} type="date" value={form.revisitDate2} onChange={set("revisitDate2")} />
          </F>

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
            disabled={saving || !canSave || !hasChanges}
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

function NewLeadPanel({ lookups, token, initialBrand, onCreated, onClose }: {
  lookups: Lookups; token: string; initialBrand: string; onCreated: (lead: Lead) => void; onClose: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    brand: initialBrand || "RIS", branchId: "", enquiryDate: today, parentName: "", motherName: "",
    childName: "", phone: "", altPhone: "", program: "", source: "", status: "", closeReason: "", walkInDate: "", leadOwner: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(current => ({ ...current, [field]: e.target.value }));
  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300";
  const branches = lookups.branches.filter(item => item.brand === form.brand);
  const programs = lookups.programs.filter(item => !item.brand || item.brand === form.brand);
  const canSubmit = !!form.brand && !!form.branchId && !!form.enquiryDate && form.enquiryDate <= today &&
    form.parentName.trim().length >= 2 && form.motherName.trim().length >= 2 &&
    form.childName.trim().length >= 2 && !!form.phone.trim() && !!form.altPhone.trim() &&
    !!form.program && !!form.source &&
    (form.status !== CLOSED_STATUS || !!form.closeReason) &&
    (!["WALK-IN BOOKED", "WALK-IN COMPLETED"].includes(form.status) || !!form.walkInDate);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/walkin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          brand: form.brand, branchId: Number(form.branchId), enquiryDate: form.enquiryDate,
          parentName: form.parentName.trim(), motherName: form.motherName.trim(),
          childName: form.childName.trim(), phone: form.phone.trim(), altPhone: form.altPhone.trim(),
          program: form.program, source: form.source, ...(form.status && { status: form.status }),
          ...(form.closeReason && { closeReason: form.closeReason }),
          ...(form.walkInDate && { walkInDate: form.walkInDate }), ...(form.leadOwner && { leadOwner: form.leadOwner }),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(response.status === 409 ? (data.message || "A matching lead already exists.") : (data.message || "Could not create lead."));
      onCreated(data.lead);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create lead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby="new-lead-title">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <form onSubmit={submit} className="relative ml-auto w-full max-w-xl bg-white shadow-2xl h-full flex flex-col">
        <div className="px-5 py-4 flex justify-between items-center" style={{ background: NAVY }}>
          <div><h2 id="new-lead-title" className="text-white font-bold">Create new lead</h2><p className="text-blue-200 text-xs mt-1">Add an enquiry to the CRM tracker</p></div>
          <button type="button" onClick={onClose} className="text-white/80 px-2 py-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Close</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Brand" required><select className={inputCls} value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value, branchId: "", program: "" }))}><option value="RIS">RIS</option><option value="RPS">RPS</option></select></F>
            <F label="Branch" required><select className={inputCls} value={form.branchId} onChange={set("branchId")}><option value="">Select branch</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></F>
            <F label="Enquiry date" required><input type="date" max={today} className={inputCls} value={form.enquiryDate} onChange={set("enquiryDate")} /></F>
            <F label="Program" required><select className={inputCls} value={form.program} onChange={set("program")}><option value="">Select program</option>{programs.map(item => <option key={item.id} value={item.label}>{item.label}</option>)}</select></F>
            <F label="Parent name" required><input className={inputCls} value={form.parentName} onChange={set("parentName")} /></F>
            <F label="Mother name" required><input className={inputCls} value={form.motherName} onChange={set("motherName")} /></F>
            <F label="Child name" required><input className={inputCls} value={form.childName} onChange={set("childName")} /></F>
            <F label="Phone" required><input type="tel" className={inputCls} value={form.phone} onChange={set("phone")} /></F>
            <F label="Alternate phone" required><input type="tel" className={inputCls} value={form.altPhone} onChange={set("altPhone")} /></F>
            <F label="Source" required><select className={inputCls} value={form.source} onChange={set("source")}><option value="">Select source</option>{lookups.sources.map(item => <option key={item.id} value={item.label}>{item.label}</option>)}</select></F>
            <F label="Status"><select className={inputCls} value={form.status} onChange={set("status")}><option value="">Default (open)</option>{lookups.statuses.map(item => <option key={item.id} value={item.label}>{item.label}</option>)}</select></F>
            {form.status === CLOSED_STATUS && <F label="Close reason" required><select className={inputCls} value={form.closeReason} onChange={set("closeReason")}><option value="">Select reason</option>{lookups.closeReasons.map(item => <option key={item.id} value={item.label}>{item.label}</option>)}</select></F>}
            <F label="Walk-in date" required={["WALK-IN BOOKED", "WALK-IN COMPLETED"].includes(form.status)}><input type="date" className={inputCls} value={form.walkInDate} onChange={set("walkInDate")} /></F>
            <F label="Lead owner"><select className={inputCls} value={form.leadOwner} onChange={set("leadOwner")}><option value="">Unassigned</option>{lookups.staff.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}</select></F>
          </div>
          {error && <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
        </div>
        <div className="p-5 border-t flex gap-3"><button disabled={!canSubmit || saving} className="flex-1 py-2.5 rounded-lg text-white font-bold disabled:opacity-50" style={{ background: NAVY }}>{saving ? "Creating…" : "Create lead"}</button><button type="button" onClick={onClose} className="px-4 rounded-lg border text-sm">Cancel</button></div>
      </form>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="history-title" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100" style={{ background: NAVY }}>
          <div>
            <div id="history-title" className="font-bold text-white text-sm">Change History</div>
            <div className="text-blue-200 text-xs">{lead.childName} · {lead.phone}</div>
          </div>
          <button onClick={onClose} aria-label="Close change history" className="text-white/70 hover:text-white text-sm px-2 py-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Close</button>
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
                          <span className="text-slate-400 mr-1">to</span>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="archive-lead-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div id="archive-lead-title" className="text-lg font-bold text-slate-800 mb-2">Archive this lead?</div>
        <div className="text-sm text-slate-600 mb-1">
          <b>{lead.childName}</b> · {lead.phone}
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
  const [sessionReady, setSessionReady] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [report, setReport] = useState<{
    total: number; booked: number; walkins: number; admissions: number; closed: number;
    trend: { month: string; count: number }[]; breakdown: { label: string; count: number }[]; generatedAt: string;
  } | null>(null);
  const [reportError, setReportError] = useState("");
  const [groupBy, setGroupBy] = useState("source");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    eligible: number; alreadyPresent: number; review: number; byBrand: { RIS: number; RPS: number };
    issues: { brand: string; reason: string; reference: string }[];
  } | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");
  const [sheetHealth, setSheetHealth] = useState<any>(null);
  const [sheetHealthError, setSheetHealthError] = useState("");
  const [sheetHealthLoading, setSheetHealthLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const [filters, setFilters] = useState({
    brand: "", branchId: "", status: "", source: "", leadOwner: "",
    dateFrom: "", dateTo: "", search: "", showArchived: false,
  });
  const [moreFilters, setMoreFilters] = useState(false);

  // Panel / modal state
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [historyLead, setHistoryLead] = useState<Lead | null>(null);
  const [archiveLead, setArchiveLead] = useState<Lead | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  const filterParams = (f = filters) => new URLSearchParams({
    ...(f.brand && { brand: f.brand }),
    ...(f.branchId && { branchId: f.branchId }),
    ...(f.status && { status: f.status }),
    ...(f.source && { source: f.source }),
    ...(f.leadOwner && { leadOwner: f.leadOwner }),
    ...(f.dateFrom && { dateFrom: f.dateFrom }),
    ...(f.dateTo && { dateTo: f.dateTo }),
    ...(f.search && { search: f.search }),
    ...(f.showArchived && { includeArchived: "true" }),
  });

  const fetchReport = useCallback(async (f = filters, group = groupBy) => {
    setReportError("");
    try {
      const params = filterParams(f);
      params.set("groupBy", group);
      const response = await fetch(`/api/walkin/leads/report?${params}`, { headers });
      if (!response.ok) throw new Error("Could not load lead report.");
      setReport(await response.json());
    } catch (reason) {
      setReportError(reason instanceof Error ? reason.message : "Could not load lead report.");
    }
  }, [filters, groupBy, token]);

  const fetchSheetHealth = useCallback(async () => {
    setSheetHealthLoading(true); setSheetHealthError("");
    try {
      const response = await fetch("/api/walkin/sheets/status", { headers });
      if (!response.ok) throw new Error("Could not load Sheets sync health.");
      setSheetHealth(await response.json());
    } catch (reason) {
      setSheetHealthError(reason instanceof Error ? reason.message : "Could not load Sheets sync health.");
    } finally { setSheetHealthLoading(false); }
  }, [token]);

  const fetchImportPreview = useCallback(async () => {
    setImportError(""); setImportMessage("");
    try {
      const response = await fetch("/api/walkin/leads/import-preview", { headers });
      if (!response.ok) throw new Error("Could not load tracker import review.");
      setImportPreview(await response.json());
    } catch (reason) {
      setImportError(reason instanceof Error ? reason.message : "Could not load tracker import review.");
    }
  }, [token]);

  const fetchLookups = useCallback(async () => {
    const res = await fetch("/api/walkin/lookups", { headers });
    if (res.ok) setLookups(await res.json());
  }, [token]);

  const confirmPageSession = useCallback(async () => {
    const response = await fetch("/api/walkin/page-session?scope=leads", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Could not confirm your Leads session.");
    const data: { ok?: boolean } = await response.json();
    if (!data.ok) throw new Error("Could not confirm your Leads session.");
    setSessionReady(true);
    setError("");
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
        ...(f.source && { source: f.source }),
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
      setAvailableSources(data.availableSources ?? []);
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
    void confirmPageSession().catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Could not confirm your Leads session.");
    });
  }, [fetchLookups, confirmPageSession]);

  useEffect(() => {
    if (sessionReady) fetchLeads(page, filters);
  }, [page, filters, sessionReady, refreshVersion]);

  useEffect(() => {
    if (sessionReady) void fetchReport(filters, groupBy);
  }, [filters, groupBy, sessionReady, refreshVersion]);

  useEffect(() => {
    if (sessionReady) void fetchSheetHealth();
  }, [sessionReady, fetchSheetHealth]);

  const applyFilter = (field: string, value: string | boolean) => {
    setPage(1);
    setFilters(f => ({ ...f, [field]: value }));
  };

  const downloadExport = async () => {
    const params = new URLSearchParams({
      ...(filters.brand && { brand: filters.brand }),
      ...(filters.branchId && { branchId: filters.branchId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.source && { source: filters.source }),
      ...(filters.leadOwner && { leadOwner: filters.leadOwner }),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
      ...(filters.search && { search: filters.search }),
      ...(filters.showArchived && { includeArchived: "true" }),
    });
    try {
      const response = await fetch(`/api/walkin/leads/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Export failed");
      const blobUrl = URL.createObjectURL(await response.blob());
      const filename = response.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1]
        || `walkin-leads-${new Date().toISOString().slice(0, 10)}.xlsx`;
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } catch {
      window.alert("Could not export leads. Please sign in again and retry.");
    }
  };

  const importTrackerLeads = async () => {
    setImportBusy(true); setImportError(""); setImportMessage("");
    try {
      const response = await fetch("/api/walkin/leads/import", {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Tracker import failed.");
      await fetchImportPreview();
      setImportMessage(`Imported ${result.imported} · skipped ${result.skipped} · needs review ${result.review}.`);
      setRefreshVersion(value => value + 1);
    } catch (reason) {
      setImportError(reason instanceof Error ? reason.message : "Tracker import failed.");
    } finally { setImportBusy(false); }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Branch options filtered by brand
  const branchOptions = lookups?.branches.filter(b => !filters.brand || b.brand === filters.brand) ?? [];

  // Distinct lead owners from loaded leads + lookups staff
  const ownerOptions = Array.from(new Set([
    ...(lookups?.staff.map(s => s.name) ?? []),
    ...leads.map(l => l.leadOwner).filter(Boolean) as string[],
  ]));
  const statusOptions = Array.from(new Set([
    ...(lookups?.statuses.map(s => s.label) ?? []),
    "WALK-IN BOOKED", "WALK-IN COMPLETED", "ADMISSION DONE",
  ]));

  const handleSaved = (updated: Lead) => {
    setLeads(ls => ls.map(l => l.id === updated.id ? updated : l));
    setEditLead(null);
    setRefreshVersion(value => value + 1);
  };

  const handleArchived = (id: string) => {
    if (filters.showArchived) {
      setLeads(ls => ls.map(l => l.id === id ? { ...l, isArchived: true } : l));
    } else {
      setLeads(ls => ls.filter(l => l.id !== id));
      setTotal(t => t - 1);
    }
    setArchiveLead(null);
    setRefreshVersion(value => value + 1);
  };

  const fmtDate = (d: string | null | undefined) => d
    ? new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "—";
  const inputCls = "h-9 px-3 rounded-lg border border-[#d9e1eb] text-xs sm:text-sm text-[#243651] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 bg-white";
  const selectCls = `${inputCls} pr-7`;

  return (
    <div className="min-h-[100dvh] text-[#20334f]" style={{ background: "#f3f6fa" }}>
      {/* Top bar */}
      <div className="text-white py-4 px-4 sm:px-7 flex flex-wrap items-center justify-between gap-4 border-b-[3px] border-[#f4b53f]" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <img src="/images/ris-logo-2.png" alt="Rainbow International School" style={{ height: 42, width: "auto", flexShrink: 0 }} />
          <div>
            <div className="font-black text-lg leading-tight tracking-tight">Walk-in Leads</div>
            <div className="text-xs text-blue-200 mt-1">AY 2027–28 <span aria-hidden="true">/</span> Admissions operations</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button onClick={() => setNewLeadOpen(true)} className="px-4 py-2 rounded-lg bg-white text-[#091a4f] font-bold hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">+ New lead</button>
          <button
            onClick={() => { void fetchLeads(page, filters); void fetchReport(filters, groupBy); setRefreshVersion(value => value + 1); }}
            className="px-4 py-2 rounded-lg bg-amber-400 text-[#091a4f] font-bold hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >Refresh</button>
          <button
            onClick={downloadExport}
            className="px-4 py-2 rounded-lg border border-white/30 text-white/90 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >Export</button>
          <a href="/admin/ras" className="px-4 py-2 rounded-lg border border-white/30 text-white/90 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Admin</a>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg border border-white/30 text-white/80 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >Lock</button>
        </div>
      </div>

      <main className="max-w-[1680px] mx-auto px-4 sm:px-7 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172945]">Leads</h1>
            <p className="text-xs text-[#6c7d94] mt-0.5">{total.toLocaleString()} in this view <span className="mx-1 text-[#c0c9d5]">/</span> changes are audit-logged</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-white border border-[#dfe6ee] p-1 self-start" aria-label="Filter by brand">
            {[["", "All brands"], ["RIS", "RIS"], ["RPS", "RPS"]].map(([value, label]) => (
              <button key={value} type="button" onClick={() => { setPage(1); setFilters(f => ({ ...f, brand: value, branchId: "" })); }}
                aria-pressed={filters.brand === value}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 ${filters.brand === value ? "bg-[#091a4f] text-white shadow-sm" : "text-[#596a81] hover:bg-[#f0f4f8]"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <section aria-label="Lead performance overview" className="mb-4 space-y-3">
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
            {[
              ["Total leads", report?.total], ["Walk-ins booked", report?.booked], ["Walk-ins", report?.walkins],
              ["Admissions", report?.admissions], ["Closed", report?.closed],
            ].map(([label, value]) => (
              <article key={label as string} className="rounded-xl bg-white border border-[#dfe6ee] px-4 py-3 shadow-[0_5px_20px_rgba(27,49,79,.035)]">
                <p className="text-[10px] uppercase tracking-[.12em] font-bold text-[#8290a3]">{label}</p>
                <p className="mt-1 text-2xl font-black tracking-tight text-[#172945] tabular-nums">{report ? Number(value).toLocaleString() : "—"}</p>
              </article>
            ))}
          </div>
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-3">
            <article className="rounded-xl bg-white border border-[#dfe6ee] p-4 shadow-[0_5px_20px_rgba(27,49,79,.035)] min-w-0">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <div><h2 className="font-bold text-sm text-[#20334f]">Enquiry trend</h2><p className="text-[11px] text-[#8492a5]">Monthly volume · follows active filters</p></div>
                {report && <span className="text-[10px] text-[#91a0b1]">Updated {new Date(report.generatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>}
              </div>
              <div className="h-32 flex items-end gap-1 sm:gap-2 border-b border-l border-[#e6ebf1] px-2">
                {(report?.trend || []).slice(-12).map((point, index, data) => {
                  const peak = Math.max(1, ...data.map(item => item.count));
                  const height = Math.max(4, point.count / peak * 100);
                  return <div key={`${point.month}-${index}`} className="flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-1" title={`${point.month}: ${point.count}`}>
                    <div className="w-full max-w-8 rounded-t bg-[#315b8e] hover:bg-amber-500 transition-colors" style={{ height: `${height}%` }} />
                    <span className="h-4 text-[8px] sm:text-[9px] text-[#8290a3] whitespace-nowrap overflow-hidden max-w-full">{point.month}</span>
                  </div>;
                })}
                {!report?.trend?.length && <p className="m-auto pb-8 text-xs text-[#8795a7]">{reportError || "No trend data for these filters."}</p>}
              </div>
            </article>
            <article className="rounded-xl bg-white border border-[#dfe6ee] p-4 shadow-[0_5px_20px_rgba(27,49,79,.035)]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div><h2 className="font-bold text-sm text-[#20334f]">Lead breakdown</h2><p className="text-[11px] text-[#8492a5]">Grouped by selected dimension</p></div>
                <select aria-label="Group report by" className={`${inputCls} h-8`} value={groupBy} onChange={e => setGroupBy(e.target.value)}>
                  <option value="source">Source</option><option value="branch">Branch</option><option value="owner">Owner</option><option value="status">Status</option>
                </select>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {(report?.breakdown || []).slice(0, 8).map(item => {
                  const peak = Math.max(1, ...(report?.breakdown || []).map(row => row.count));
                  return <div key={item.label} className="grid grid-cols-[minmax(0,1fr)_2fr_auto] gap-2 items-center text-xs">
                    <span title={item.label} className="truncate text-[#63748b]">{item.label || "Unassigned"}</span>
                    <span className="h-2 rounded-full bg-[#edf1f5] overflow-hidden"><span className="block h-full rounded-full bg-amber-400" style={{ width: `${Math.max(2, item.count / peak * 100)}%` }} /></span>
                    <b className="tabular-nums text-[#20334f]">{item.count}</b>
                  </div>;
                })}
                {!report?.breakdown?.length && <p className="py-5 text-center text-xs text-[#8795a7]">{reportError || "No breakdown data for these filters."}</p>}
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-xl bg-white border border-[#dfe6ee] shadow-[0_5px_20px_rgba(27,49,79,.04)] mb-4 p-4" aria-label="Tracker import review">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="max-w-3xl">
              <h2 className="font-bold text-sm text-[#20334f]">Legacy tracker import</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#718198]">Review the tracker migration before importing. Tracker rows remain read-only until imported into the CRM; no rows are imported automatically.</p>
              {importPreview && <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#52657d]">
                <span><b className="text-[#20334f]">{importPreview.eligible}</b> eligible</span>
                <span><b className="text-[#20334f]">{importPreview.alreadyPresent}</b> already present</span>
                <span><b className="text-amber-700">{importPreview.review}</b> need review</span>
                <span>RIS <b>{importPreview.byBrand?.RIS ?? 0}</b></span><span>RPS <b>{importPreview.byBrand?.RPS ?? 0}</b></span>
              </div>}
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button type="button" disabled={importBusy} onClick={() => void fetchImportPreview()} className="px-3 py-2 rounded-lg border border-[#d9e1eb] text-xs font-semibold text-[#35577e] disabled:opacity-50">{importPreview ? "Refresh review" : "Review import"}</button>
              {importPreview && importPreview.eligible > 0 && <button type="button" disabled={importBusy} onClick={() => void importTrackerLeads()} className="px-3 py-2 rounded-lg bg-[#091a4f] text-white text-xs font-bold disabled:opacity-50">{importBusy ? "Importing…" : `Confirm import (${importPreview.eligible})`}</button>}
            </div>
          </div>
          {importMessage && <p role="status" className="mt-3 text-xs font-semibold text-emerald-700">{importMessage}</p>}
          {importError && <p role="alert" className="mt-3 text-xs text-red-700">{importError}</p>}
          {!!importPreview?.issues?.length && <div className="mt-3 max-h-28 overflow-y-auto rounded-lg bg-amber-50 border border-amber-100 p-2 space-y-1">
            {importPreview.issues.slice(0, 20).map((issue, index) => <p key={`${issue.brand}-${issue.reference}-${index}`} className="text-[11px] text-amber-900"><b>{issue.brand}</b> · {issue.reference} — {issue.reason}</p>)}
            {importPreview.issues.length > 20 && <p className="text-[10px] text-amber-800">And {importPreview.issues.length - 20} more review items.</p>}
          </div>}
        </section>

        <section className="mb-4 rounded-xl bg-white border border-[#dfe6ee] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3" aria-label="Google Sheets sync health">
          <div>
            <h2 className="text-sm font-bold text-[#20334f]">Google Sheets sync health</h2>
            {sheetHealthError ? <p role="alert" className="mt-1 text-xs text-red-700">{sheetHealthError}</p> :
              sheetHealthLoading && !sheetHealth ? <p className="mt-1 text-xs text-[#8290a3]">Checking sync status…</p> :
                sheetHealth && <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#65768c]">
                  {(["RIS", "RPS", "MASTER"] as const).map(key => {
                    const item = sheetHealth[key];
                    return <span key={key}><b className={item?.lastError ? "text-red-700" : item?.pending ? "text-amber-700" : "text-emerald-700"}>{key}</b> {item?.lastError ? `· ${item.lastError}` : item?.pending ? "· sync pending" : item?.lastSyncAt ? `· synced ${new Date(item.lastSyncAt).toLocaleString("en-IN")}` : "· no sync recorded"}</span>;
                  })}
                </div>}
          </div>
          <button type="button" onClick={() => void fetchSheetHealth()} disabled={sheetHealthLoading} className="px-3 py-2 self-start sm:self-auto rounded-lg border border-[#d9e1eb] text-xs font-semibold text-[#35577e] disabled:opacity-50">{sheetHealthLoading ? "Checking…" : "Refresh health"}</button>
        </section>

        <section className="rounded-xl bg-white border border-[#dfe6ee] shadow-[0_5px_20px_rgba(27,49,79,.04)] mb-4" aria-label="Lead filters">
          <div className="p-3 sm:px-4">
            <div className="flex flex-wrap items-center gap-2">
              <label className="w-full sm:w-[190px] xl:w-[230px] sm:flex-none">
                <span className="sr-only">Search enquiries</span>
                <input type="search" aria-label="Search by child or phone" className={`${inputCls} w-full`} placeholder="Search child or phone"
                  value={filters.search} onChange={e => applyFilter("search", e.target.value)} />
              </label>
              <label className="min-w-[135px] flex-1 sm:flex-none sm:w-[160px]">
                <span className="sr-only">Branch</span>
                <select aria-label="Filter by branch" className={`${selectCls} w-full`} value={filters.branchId} onChange={e => applyFilter("branchId", e.target.value)}>
                  <option value="">All branches</option>
                  {branchOptions.map(b => <option key={b.id} value={b.id}>{filters.brand ? b.name : `${b.brand} · ${b.name}`}</option>)}
                </select>
              </label>
              <label className="min-w-[145px] flex-1 sm:flex-none sm:w-[175px]">
                <span className="sr-only">Status</span>
                <select aria-label="Filter by status" className={`${selectCls} w-full`} value={filters.status} onChange={e => applyFilter("status", e.target.value)}>
                  <option value="">All statuses</option>
                  {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className="min-w-[112px] flex-1 sm:flex-none sm:w-[130px]">
                <span className="sr-only">Enquiry source</span>
                <select aria-label="Filter by source" className={`${selectCls} w-full`} value={filters.source} onChange={e => applyFilter("source", e.target.value)}>
                  <option value="">All sources</option>
                  {availableSources.map(source => <option key={source.toLowerCase()} value={source}>{source}</option>)}
                </select>
              </label>
              <label className="min-w-[112px] flex-1 sm:flex-none sm:w-[130px]">
                <span className="sr-only">Lead owner</span>
                <select aria-label="Filter by lead owner" className={`${selectCls} w-full`} value={filters.leadOwner} onChange={e => applyFilter("leadOwner", e.target.value)}>
                  <option value="">All owners</option>
                  {ownerOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => setMoreFilters(open => !open)} aria-expanded={moreFilters}
                className={`h-9 px-3 rounded-lg border text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 ${moreFilters || filters.dateFrom || filters.dateTo || filters.showArchived ? "bg-[#eff4fa] border-[#b5c8df] text-[#1b4679]" : "border-[#d9e1eb] text-[#53657d] hover:bg-[#f4f7fb]"}`}>
                More filters{filters.dateFrom || filters.dateTo || filters.showArchived ? " •" : ""}
              </button>
              {(filters.brand || filters.branchId || filters.status || filters.source || filters.leadOwner || filters.dateFrom || filters.dateTo || filters.search || filters.showArchived) && (
                <button type="button" onClick={() => { setPage(1); setFilters({ brand: "", branchId: "", status: "", source: "", leadOwner: "", dateFrom: "", dateTo: "", search: "", showArchived: false }); }}
                  className="h-9 px-2 text-xs font-semibold text-[#885900] hover:text-[#654100] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500">
                  Clear
                </button>
              )}
            </div>
            {moreFilters && <div className="mt-3 pt-3 border-t border-[#e9eef3] flex flex-wrap items-end gap-3">
              <label className="min-w-[140px] flex-1">
                <span className="block text-[11px] font-medium text-[#75849a] mb-1">Enquired from</span>
                <input aria-label="Enquiry date from" type="date" className={`${inputCls} w-full`} value={filters.dateFrom} onChange={e => applyFilter("dateFrom", e.target.value)} />
              </label>
              <label className="min-w-[140px] flex-1">
                <span className="block text-[11px] font-medium text-[#75849a] mb-1">Enquired to</span>
                <input aria-label="Enquiry date to" type="date" className={`${inputCls} w-full`} value={filters.dateTo} onChange={e => applyFilter("dateTo", e.target.value)} />
              </label>
              <div className="h-9 flex items-center">
                <label className="inline-flex items-center gap-2 text-xs text-[#53657d] cursor-pointer">
                  <input aria-label="Include archived leads" type="checkbox" checked={filters.showArchived}
                    onChange={e => applyFilter("showArchived", e.target.checked)} className="h-4 w-4 rounded border-[#bdc9d8] accent-[#091a4f] focus-visible:ring-2 focus-visible:ring-amber-400" />
                  Include archived
                </label>
              </div>
            </div>}
          </div>
        </section>
      {/* Table */}
      <section className="pb-8" aria-label="Lead records">
        {error && (
          <div className="mb-4 rounded-xl bg-[#fff0ed] border border-[#f1c2b8] px-4 py-3 text-sm text-[#963c2d]" role="alert">
            <div className="flex items-center justify-between gap-3">
              <span>{error}</span>
              <button type="button" onClick={() => sessionReady ? fetchLeads(page, filters) : void confirmPageSession().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not confirm your Leads session."))} className="font-semibold underline underline-offset-4">Retry</button>
            </div>
          </div>
        )}

        <div className="hidden lg:block bg-white rounded-xl shadow-[0_5px_20px_rgba(27,49,79,.04)] border border-[#dfe6ee] overflow-hidden">
            <table className="w-full table-fixed text-xs">
              <colgroup>
                <col className="w-[8%]" /><col className="w-[15%]" /><col className="w-[11%]" />
                <col className="w-[14%]" /><col className="w-[9%]" /><col className="w-[16%]" />
                <col className="w-[10%]" /><col className="w-[8%]" /><col className="w-[9%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[#e5ebf1] bg-[#f7f9fb] text-[#718198] uppercase text-[10px] tracking-[.1em]">
                  <th className="text-left px-2.5 py-3 font-semibold">Enquired</th>
                  <th className="text-left px-2.5 py-3 font-semibold">Child / program</th>
                  <th className="text-left px-2.5 py-3 font-semibold">Phone</th>
                  <th className="text-left px-2.5 py-3 font-semibold">School / branch</th>
                  <th className="text-left px-2.5 py-3 font-semibold">Source</th>
                  <th className="text-left px-2.5 py-3 font-semibold">Status / admitted</th>
                  <th className="text-left px-2.5 py-3 font-semibold">Owner</th>
                  <th className="text-left px-2.5 py-3 font-semibold">Updated</th>
                  <th className="text-left px-2.5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <>
                    {Array.from({ length: 6 }, (_, row) => (
                      <tr key={row} aria-hidden="true" className="border-b border-[#eff2f6] animate-pulse">
                        {Array.from({ length: 9 }, (_, column) => (
                          <td key={column} className="px-2.5 py-4">
                            <div className="h-2.5 w-full max-w-20 rounded bg-[#e8edf3]" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                )}
                {!loading && leads.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-12 text-[#76869a]">No leads found. Try widening your search or clearing a filter.</td></tr>
                )}
                {!loading && leads.map(lead => {
                  const branchName = lead.branchName || lookups?.branches.find(b => b.id === lead.branchId)?.name;
                  return (
                    <tr
                      key={lead.id}
                      className={`border-b border-[#eff2f6] hover:bg-[#f8fafc] transition-colors ${lead.isArchived ? "opacity-50" : ""}`}
                    >
                      <td className="px-2.5 py-2.5 text-slate-600 tabular-nums">{fmtDate(lead.enquiryDate)}</td>
                      <td className="px-2.5 py-2.5 min-w-0">
                        <div className="font-semibold text-slate-800 break-words" title={lead.childName}>{lead.childName || "—"}</div>
                        <div className="text-[11px] text-[#8290a3] break-words">{lead.program}</div>
                      </td>
                      <td className="px-2.5 py-2.5 font-mono text-slate-700 break-all">{lead.phone || "—"}</td>
                      <td className="px-2.5 py-2.5 min-w-0">
                        <span className={`text-[10px] font-bold ${lead.brand === "RIS" ? "text-blue-700" : "text-red-700"}`}>{lead.brand}</span>
                        <div className="text-slate-600 break-words" title={branchName}>{branchName || "Branch not recorded"}</div>
                      </td>
                      <td className="px-2.5 py-2.5 text-slate-500 break-words" title={lead.source}>{lead.source}</td>
                      <td className="px-2.5 py-2.5 min-w-0">
                        <StatusBadge status={lead.status} archived={lead.isArchived} />
                        {lead.admissionDate && <div className="mt-1 text-[11px] text-[#596b83]">Admitted {fmtDate(lead.admissionDate)}</div>}
                      </td>
                      <td className="px-2.5 py-2.5 text-slate-600 break-words">{lead.leadOwner || "—"}</td>
                      <td className="px-2.5 py-2.5 text-slate-500 tabular-nums" title={lead.readOnly || lead.id.startsWith("crm-") ? "Last update date not recorded" : undefined}>
                        {lead.readOnly || lead.id.startsWith("crm-") ? "—" : new Date(lead.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-2.5 py-2.5">
                        {(lead.readOnly || lead.id.startsWith("crm-")) ? <span className="text-[11px] font-medium text-amber-700">Tracker record · import to edit</span> : (
                          <select aria-label={`Actions for ${lead.childName || "lead"}`} value="" onChange={e => {
                            if (e.target.value === "edit") setEditLead(lead);
                            if (e.target.value === "history") setHistoryLead(lead);
                            if (e.target.value === "archive") setArchiveLead(lead);
                          }} className="w-full max-w-[112px] rounded-md border border-[#d9e1eb] bg-white px-1 py-1.5 text-[11px] font-medium text-[#244e83] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500">
                            <option value="">Actions</option>
                            {!lead.isArchived && <option value="edit">Edit lead</option>}
                            <option value="history">View history</option>
                            {!lead.isArchived && <option value="archive">Archive lead</option>}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>

        {/* Mobile list */}
        <div className="lg:hidden space-y-3">
          {loading && Array.from({ length: 3 }, (_, index) => (
            <div key={index} aria-hidden="true" className="h-44 rounded-2xl border border-[#e1e8ef] bg-white animate-pulse" />
          ))}
          {!loading && leads.length === 0 && (
            <div className="rounded-2xl border border-[#dfe6ee] bg-white px-5 py-10 text-center">
              <p className="font-semibold text-[#253a58]">No enquiries match</p>
              <p className="mt-1 text-sm text-[#75849a]">Adjust your filters or show all leads.</p>
              <button type="button" onClick={() => { setPage(1); setFilters({ brand: "", branchId: "", status: "", source: "", leadOwner: "", dateFrom: "", dateTo: "", search: "", showArchived: false }); }}
                className="mt-4 text-sm font-semibold text-[#8a5a00] underline underline-offset-4">Clear filters</button>
            </div>
          )}
          {!loading && leads.map((lead, i) => {
            const branchName = lead.branchName || lookups?.branches.find(b => b.id === lead.branchId)?.name;
            const rowNum = (page - 1) * PAGE_SIZE + i + 1;
            return (
              <article key={lead.id} className={`rounded-2xl bg-white border border-[#dfe6ee] p-4 shadow-[0_3px_12px_rgba(27,49,79,.035)] ${lead.isArchived ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#8090a4]">Enquiry {rowNum} <span className="mx-1">/</span> {lead.enquiryDate}</p>
                    <h2 className="mt-1 font-bold text-[#1b304d]">{lead.childName || "Child not recorded"}</h2>
                    <p className="text-sm text-[#66778d]">{lead.program} <span className="mx-1 text-[#c4ccd6]">/</span> {lead.brand}</p>
                  </div>
                  <StatusBadge status={lead.status} archived={lead.isArchived} />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 pt-3 border-t border-[#edf1f5] text-sm">
                  <div><div className="text-[10px] font-semibold uppercase tracking-wider text-[#8a99ab]">Phone</div><div className="mt-0.5 font-medium text-[#334a68]">{lead.phone || "Not provided"}</div></div>
                  <div><div className="text-[10px] font-semibold uppercase tracking-wider text-[#8a99ab]">Branch / owner</div><div className="mt-0.5 text-[#52657d] truncate">{branchName || "Unassigned"} / {lead.leadOwner || "Unassigned"}</div></div>
                   <div><div className="text-[10px] font-semibold uppercase tracking-wider text-[#8a99ab]">Last updated</div><div className="mt-0.5 text-[#52657d]">{lead.readOnly || lead.id.startsWith("crm-") ? "Not recorded" : new Date(lead.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div></div>
                  {lead.admissionDate && <div><div className="text-[10px] font-semibold uppercase tracking-wider text-[#8a99ab]">Admitted</div><div className="mt-0.5 text-[#52657d]">{fmtDate(lead.admissionDate)}</div></div>}
                </div>
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#edf1f5]">
                  {!lead.isArchived && !lead.readOnly && !lead.id.startsWith("crm-") && <button type="button" aria-label={`Edit ${lead.childName}'s enquiry`} onClick={() => setEditLead(lead)} className="rounded-lg px-3 py-2 text-xs font-semibold bg-[#edf3fb] text-[#244e83] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500">Edit</button>}
                  {!lead.readOnly && !lead.id.startsWith("crm-") && <button type="button" aria-label={`View history for ${lead.childName}'s enquiry`} onClick={() => setHistoryLead(lead)} className="rounded-lg px-3 py-2 text-xs font-semibold bg-[#f0f3f6] text-[#52657d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500">History</button>}
                  {!lead.isArchived && !lead.readOnly && !lead.id.startsWith("crm-") && <button type="button" aria-label={`Archive ${lead.childName}'s enquiry`} onClick={() => setArchiveLead(lead)} className="rounded-lg px-3 py-2 text-xs font-semibold bg-[#fff0ed] text-[#a34032] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500">Archive</button>}
                  {(lead.readOnly || lead.id.startsWith("crm-")) && <span className="rounded-lg px-3 py-2 text-xs font-semibold bg-amber-50 text-amber-800">Tracker record · import to edit</span>}
                </div>
              </article>
            );
          })}
        </div>

        {/* Pagination */}
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 mt-3 rounded-xl border border-[#dfe6ee] bg-white">
              <div className="text-xs text-slate-500">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded text-xs font-medium border border-slate-200 disabled:opacity-40 hover:bg-white transition"
                 >Previous</button>
                 <span className="px-3 text-xs text-slate-600">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded text-xs font-medium border border-slate-200 disabled:opacity-40 hover:bg-white transition"
                 >Next</button>
              </div>
            </div>
          )}
        {/* Footer note */}
        <div className="mt-4 text-xs text-[#8795a7] text-center">
          Showing {leads.length} of {total} leads · AY 2027-28 · Changes are audit-logged
        </div>
      </section>
      </main>

      {/* Overlays */}
      {editLead && lookups && (
        <EditPanel lead={editLead} lookups={lookups} token={token} onSave={handleSaved} onClose={() => setEditLead(null)} />
      )}
      {newLeadOpen && lookups && (
        <NewLeadPanel
          lookups={lookups}
          token={token}
          initialBrand={filters.brand}
          onClose={() => setNewLeadOpen(false)}
          onCreated={() => { setNewLeadOpen(false); setPage(1); setRefreshVersion(value => value + 1); }}
        />
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
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let mounted = true;
    void restorePageSession("leads").then(restored => {
      if (mounted) { setToken(restored); setChecking(false); }
    });
    return () => { mounted = false; };
  }, []);
  if (checking) return <div className="min-h-screen" style={{ background: NAVY }} />;
  if (!token) return <AdminGate onSuccess={t => setToken(t)} />;
  return (
    <LeadsPanel
      token={token}
      onLogout={() => {
        forgetPageSession("leads");
        setToken(null);
      }}
    />
  );
}
