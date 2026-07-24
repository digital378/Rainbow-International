import { useState, useEffect, useRef } from "react";

const NAVY = "#091a4f";
const AMBER = "#f59e0b";
const GREEN = "#059669";
const ADMIN_AUTH_KEY = "ris_admin_auth";

const STATUS_OPTIONS = ["Open", "Walk-in Booked", "Walk-in Completed", "Closed", "Future Prospect", "Admission Done"] as const;

const STATUS_COLORS: Record<string, string> = {
  "Open": "#3b82f6",
  "Walk-in Booked": "#8b5cf6",
  "Walk-in Completed": "#f59e0b",
  "Closed": "#ef4444",
  "Future Prospect": "#6b7280",
  "Admission Done": "#059669",
};

type School = {
  id: number; name: string; slug: string; token: string;
  contactPerson: string; contactEmail?: string; sheetsTabName: string;
  isActive: boolean; createdAt: string; leadCount: number;
};

type Lead = {
  id: number; schoolId: number; studentName: string; grade: string;
  parentName: string; phone: string; email?: string; source: string;
  status: string; commissionPaid?: boolean; remarks?: string;
  submittedAt: string; syncedToSheets: boolean; syncFailed: boolean;
};

type Stats = {
  totalSchools: number; activeSchools: number; totalLeads: number;
  walkIns: number; admissions: number;
};

function getToken() {
  try { return sessionStorage.getItem(ADMIN_AUTH_KEY) || ""; } catch { return ""; }
}
const authHeader = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

function TokenGate({ onSuccess }: { onSuccess: () => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/alliances/friendship/schools", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      try { sessionStorage.setItem(ADMIN_AUTH_KEY, token); } catch {}
      onSuccess();
    } else {
      setError(true); setToken("");
      setTimeout(() => setError(false), 600);
    }
  };
  return (
    <div className="flex items-center justify-center py-20">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border-t-4 border-amber-400">
        <div className="font-black text-lg mb-1" style={{ color: NAVY }}>QR Leads Admin</div>
        <div className="text-xs text-slate-500 mb-5">Enter your admin token to access Friendship School data.</div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Admin Token</label>
        <input type="password" value={token} onChange={e => setToken(e.target.value)}
          placeholder="Enter token"
          className={`w-full px-4 py-3 rounded-lg border-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? "border-red-400 bg-red-50" : "border-slate-200"}`}
          data-testid="input-qr-token" />
        {error && <div className="mt-2 text-sm text-red-600">Invalid token</div>}
        <button type="submit" className="mt-4 w-full py-3 rounded-lg font-bold text-white text-sm" style={{ background: NAVY }}
          data-testid="button-qr-unlock">Unlock</button>
      </form>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-1 min-w-0">
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-xs font-semibold text-slate-500 leading-tight">{label}</div>
    </div>
  );
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

function StatusDropdown({ lead, onUpdate }: { lead: Lead; onUpdate: (updated: Lead) => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const select = async (status: string) => {
    if (status === lead.status) { setOpen(false); return; }
    setSaving(true); setOpen(false);
    try {
      const res = await fetch(`/api/admin/alliances/friendship/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
      }
    } catch { /* silent */ }
    setSaving(false);
  };

  const color = STATUS_COLORS[lead.status] ?? "#64748b";

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className="text-xs px-2 py-0.5 rounded-full font-semibold cursor-pointer hover:opacity-80 transition disabled:opacity-50 flex items-center gap-1"
        style={{ background: color + "20", color }}
        data-testid={`badge-status-${lead.id}`}
        title="Click to change status"
      >
        {saving ? "…" : lead.status}
        {!saving && <span className="opacity-60 text-[10px]">▾</span>}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-0 bg-white rounded-xl shadow-xl border border-slate-100 py-1 min-w-[160px]"
          data-testid={`dropdown-status-${lead.id}`}>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => select(s)}
              className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-2 ${s === lead.status ? "opacity-50 cursor-default" : ""}`}
              data-testid={`option-status-${lead.id}-${s.replace(/\s+/g, "-").toLowerCase()}`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[s] }} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CommissionToggle({ lead, onUpdate }: { lead: Lead; onUpdate: (updated: Lead) => void }) {
  const [saving, setSaving] = useState(false);

  if (lead.status !== "Admission Done") {
    return <span className="text-xs text-slate-300">—</span>;
  }

  const toggle = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/alliances/friendship/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ commissionPaid: !lead.commissionPaid }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
      }
    } catch { /* silent */ }
    setSaving(false);
  };

  const paid = lead.commissionPaid === true;
  const color = paid ? GREEN : lead.commissionPaid === false ? "#dc2626" : AMBER;
  const label = paid ? "Paid" : lead.commissionPaid === false ? "Unpaid" : "Pending";

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className="text-xs font-semibold hover:underline disabled:opacity-50 transition"
      style={{ color }}
      data-testid={`toggle-commission-${lead.id}`}
      title="Click to toggle commission paid"
    >
      {saving ? "…" : label}
    </button>
  );
}

export default function FriendshipQRTab() {
  const [authed, setAuthed] = useState<boolean>(() => Boolean(getToken()));
  if (!authed) return <TokenGate onSuccess={() => setAuthed(true)} />;
  return <FriendshipQRTabInner />;
}

function FriendshipQRTabInner() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editSchool, setEditSchool] = useState<School | null>(null);
  const [syncMsg, setSyncMsg] = useState("");
  const [confirmRegen, setConfirmRegen] = useState<School | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<School | null>(null);

  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTabName, setFormTabName] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [schoolsRes, statsRes] = await Promise.all([
        fetch("/api/admin/alliances/friendship/schools", { headers: authHeader() }),
        fetch("/api/admin/alliances/friendship/stats", { headers: authHeader() }),
      ]);
      if (schoolsRes.status === 401) { try { sessionStorage.removeItem(ADMIN_AUTH_KEY); } catch {} window.location.reload(); return; }
      setSchools(await schoolsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchLeads = async (school: School) => {
    setSelectedSchool(school); setLeadsLoading(true); setLeads([]);
    try {
      const res = await fetch(`/api/admin/alliances/friendship/leads?schoolId=${school.id}`, { headers: authHeader() });
      setLeads(await res.json());
    } catch { /* silent */ }
    setLeadsLoading(false);
  };

  const updateLeadInList = (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const openAddModal = () => {
    setEditSchool(null);
    setFormName(""); setFormContact(""); setFormEmail(""); setFormTabName(""); setFormError("");
    setShowModal(true);
  };

  const openEditModal = (s: School) => {
    setEditSchool(s);
    setFormName(s.name); setFormContact(s.contactPerson); setFormEmail(s.contactEmail || ""); setFormTabName(s.sheetsTabName); setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formContact.trim() || !formTabName.trim()) {
      setFormError("School name, contact person, and Sheets tab name are required."); return;
    }
    setSaving(true); setFormError("");
    try {
      const body: Record<string, unknown> = {
        name: formName.trim(), contactPerson: formContact.trim(),
        contactEmail: formEmail.trim() || undefined, sheetsTabName: formTabName.trim(),
      };
      if (!editSchool) body.isActive = true;
      const url = editSchool ? `/api/admin/alliances/friendship/schools/${editSchool.id}` : "/api/admin/alliances/friendship/schools";
      const res = await fetch(url, {
        method: editSchool ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(body),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || "Save failed");
      setShowModal(false); fetchAll();
    } catch (err: any) { setFormError(err.message || "Something went wrong."); }
    setSaving(false);
  };

  const handleToggleActive = async (s: School) => {
    try {
      await fetch(`/api/admin/alliances/friendship/schools/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      fetchAll();
      if (selectedSchool?.id === s.id) setSelectedSchool({ ...selectedSchool, isActive: !s.isActive });
    } catch { /* silent */ }
  };

  const handleRegenToken = async (s: School) => {
    try {
      const res = await fetch(`/api/admin/alliances/friendship/schools/${s.id}/regenerate-token`, {
        method: "POST", headers: authHeader(),
      });
      if (res.ok) { setConfirmRegen(null); fetchAll(); }
    } catch { /* silent */ }
  };

  const handleDelete = async (s: School) => {
    try {
      const res = await fetch(`/api/admin/alliances/friendship/schools/${s.id}`, {
        method: "DELETE", headers: authHeader(),
      });
      if (res.ok) {
        setConfirmDelete(null);
        if (selectedSchool?.id === s.id) { setSelectedSchool(null); setLeads([]); }
        fetchAll();
      }
    } catch { /* silent */ }
  };

  const handleSyncSheets = async () => {
    setSyncMsg("Syncing…");
    try {
      const res = await fetch("/api/admin/alliances/friendship/sync-sheets", { method: "POST", headers: authHeader() });
      const d = await res.json().catch(() => ({}));
      setSyncMsg(`Done — ${d.synced ?? 0} synced, ${d.failed ?? 0} failed`);
    } catch { setSyncMsg("Sync failed"); }
    setTimeout(() => setSyncMsg(""), 5000);
  };

  return (
    <div>
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <StatCard label="Schools on board" value={stats.totalSchools} color={NAVY} />
          <StatCard label="QR Active (≥1 lead)" value={stats.activeSchools} color="#0ea5e9" />
          <StatCard label="Total Leads" value={stats.totalLeads} color="#7c3aed" />
          <StatCard label="Walk-ins" value={stats.walkIns} color={AMBER} />
          <StatCard label="Admissions" value={stats.admissions} color={GREEN} />
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="font-bold text-slate-700 text-sm">
          {loading ? "Loading…" : `${schools.length} Friendship School${schools.length !== 1 ? "s" : ""}`}
        </div>
        <div className="flex gap-2">
          {syncMsg && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: AMBER + "20", color: "#92400e" }}>
              {syncMsg}
            </span>
          )}
          <button onClick={handleSyncSheets}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-slate-300 text-slate-600 hover:bg-slate-100 transition"
            data-testid="button-qr-sync">
            🔄 Retry Sync
          </button>
          <button onClick={openAddModal}
            className="px-4 py-1.5 rounded-lg text-xs font-black text-white transition"
            style={{ background: NAVY }}
            data-testid="button-qr-add-school">
            + Add School
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* School list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : schools.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No schools yet. Add one to get started.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {schools.map(s => (
                  <div key={s.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 border-l-4 ${selectedSchool?.id === s.id ? "bg-blue-50" : "border-l-transparent"}`}
                    style={selectedSchool?.id === s.id ? { borderLeftColor: NAVY } : {}}
                    onClick={() => fetchLeads(s)}
                    data-testid={`card-qr-school-${s.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-sm truncate">{s.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{s.contactPerson}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: s.isActive ? "#dcfce7" : "#fee2e2", color: s.isActive ? GREEN : "#dc2626" }}>
                            {s.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs text-slate-400">{s.leadCount} lead{s.leadCount !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button onClick={e => { e.stopPropagation(); window.open(`/admin/alliances/friendship/${s.id}/qr`, "_blank"); }}
                          className="text-xs px-2 py-1 rounded font-semibold transition hover:opacity-80"
                          style={{ background: "#f0f4ff", color: NAVY }}
                          data-testid={`button-qr-qr-${s.id}`}>QR</button>
                        <button onClick={e => { e.stopPropagation(); openEditModal(s); }}
                          className="text-xs px-2 py-1 rounded font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                          data-testid={`button-qr-edit-${s.id}`}>Edit</button>
                        <button onClick={e => { e.stopPropagation(); setConfirmDelete(s); }}
                          className="text-xs px-2 py-1 rounded font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition"
                          data-testid={`button-qr-delete-${s.id}`}>Del</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leads panel */}
        <div className="lg:col-span-2">
          {!selectedSchool ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="text-3xl mb-3">🏫</div>
              <div className="text-slate-500 text-sm">Select a school on the left to view its leads</div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-black text-slate-800">{selectedSchool.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Sheets tab: <code className="bg-slate-100 px-1 py-0.5 rounded">{selectedSchool.sheetsTabName}</code>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleActive(selectedSchool)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold border transition"
                      style={selectedSchool.isActive
                        ? { borderColor: "#fee2e2", color: "#dc2626", background: "#fff" }
                        : { borderColor: "#dcfce7", color: GREEN, background: "#fff" }}
                      data-testid="button-qr-toggle-active">
                      {selectedSchool.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                    <button onClick={() => setConfirmRegen(selectedSchool)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold border border-amber-200 text-amber-600 hover:bg-amber-50 transition"
                      data-testid="button-qr-regen">
                      🔄 Regen QR
                    </button>
                  </div>
                </div>
              </div>

              {leadsLoading ? (
                <div className="p-10 text-center text-slate-400 text-sm">Loading leads…</div>
              ) : leads.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm">No leads submitted yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {["Date", "Student", "Grade", "Parent", "Phone", "Source", "Status", "Comm.", "Synced"].map(h => (
                          <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map(l => (
                        <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50" data-testid={`row-qr-lead-${l.id}`}>
                          <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap text-xs">{formatDate(l.submittedAt)}</td>
                          <td className="px-3 py-2.5 font-semibold text-slate-800">{l.studentName}</td>
                          <td className="px-3 py-2.5 text-slate-600">{l.grade}</td>
                          <td className="px-3 py-2.5 text-slate-700">{l.parentName}</td>
                          <td className="px-3 py-2.5 text-slate-500">{l.phone}</td>
                          <td className="px-3 py-2.5">
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: l.source === "bulk" ? "#f0f4ff" : "#f8fafc", color: l.source === "bulk" ? NAVY : "#64748b" }}>
                              {l.source}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <StatusDropdown lead={l} onUpdate={updateLeadInList} />
                          </td>
                          <td className="px-3 py-2.5">
                            <CommissionToggle lead={l} onUpdate={updateLeadInList} />
                          </td>
                          <td className="px-3 py-2.5">
                            {l.syncFailed ? <span className="text-xs text-red-500 font-semibold">Failed</span>
                              : l.syncedToSheets ? <span className="text-xs text-green-600">✓</span>
                              : <span className="text-xs text-amber-500">Pending</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(9,26,79,0.7)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="font-black text-xl mb-5" style={{ color: NAVY }}>
              {editSchool ? "Edit School" : "Add Friendship School"}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">School Name *</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Sunshine Academy"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                  data-testid="input-qr-school-name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Contact Person *</label>
                <input value={formContact} onChange={e => setFormContact(e.target.value)} placeholder="e.g. Ms. Anita Sharma"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                  data-testid="input-qr-contact-person" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Contact Email <span className="font-normal text-slate-400">(optional)</span></label>
                <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="e.g. anita@school.edu"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                  data-testid="input-qr-contact-email" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Google Sheets Tab Name *</label>
                <input value={formTabName} onChange={e => setFormTabName(e.target.value)} placeholder="e.g. Sunshine Academy"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                  data-testid="input-qr-tab-name" />
                <div className="text-xs text-slate-400 mt-1">Must match the exact tab name in your Google Sheets spreadsheet.</div>
              </div>
              {formError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</div>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                data-testid="button-qr-cancel">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-xl font-black text-white transition disabled:opacity-60"
                style={{ background: saving ? "#94a3b8" : NAVY }}
                data-testid="button-qr-save">
                {saving ? "Saving…" : editSchool ? "Save Changes" : "Create School"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(9,26,79,0.7)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="text-3xl mb-3">🗑️</div>
            <div className="font-black text-lg mb-2" style={{ color: NAVY }}>Delete School?</div>
            <div className="text-sm text-slate-600 mb-6">
              This will permanently delete <strong>{confirmDelete.name}</strong> and all{" "}
              <strong>{confirmDelete.leadCount} lead{confirmDelete.leadCount !== 1 ? "s" : ""}</strong> associated with it. This cannot be undone.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl font-semibold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-3 rounded-xl font-black text-white"
                style={{ background: "#dc2626" }}
                data-testid="button-qr-confirm-delete">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regen token confirmation */}
      {confirmRegen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(9,26,79,0.7)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <div className="font-black text-lg mb-2" style={{ color: NAVY }}>Regenerate QR Code?</div>
            <div className="text-sm text-slate-600 mb-6">
              This will <strong>invalidate the existing QR code</strong> for <strong>{confirmRegen.name}</strong>. Printed QR cards will stop working immediately.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRegen(null)}
                className="flex-1 py-3 rounded-xl font-semibold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={() => handleRegenToken(confirmRegen)}
                className="flex-1 py-3 rounded-xl font-black text-white"
                style={{ background: "#dc2626" }}
                data-testid="button-qr-confirm-regen">
                Yes, Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
