import { useState, useEffect } from "react";
import { buildWhatsAppUrl, buildEmailUrl } from "@/lib/friendship-url-utils";

const NAVY = "#091a4f";
const AMBER = "#f59e0b";
const GREEN = "#059669";

const ADMIN_AUTH_KEY = "ris_admin_auth";

function AdminGate({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/alliances/friendship/schools", {
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
          <div className="w-12 h-12 rounded-md flex items-center justify-center font-black text-sm" style={{ background: AMBER, color: NAVY }}>RIS</div>
          <div>
            <div className="font-black text-lg" style={{ color: NAVY }}>Admin Panel</div>
            <div className="text-xs text-slate-500">Friendship Schools · Alliances</div>
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Token</label>
        <input type="password" value={token} onChange={e => setToken(e.target.value)}
          placeholder="Enter admin token"
          className={`w-full px-4 py-3 rounded-lg border-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? "border-red-500 bg-red-50" : "border-slate-300"}`}
          data-testid="input-admin-token" />
        {error && <div className="mt-2 text-sm text-red-600">Invalid token</div>}
        <button type="submit" className="mt-4 w-full py-3 rounded-lg font-bold text-white" style={{ background: NAVY }}
          data-testid="button-admin-login">Unlock</button>
      </form>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  "Open": "#3b82f6",
  "Walk-in Booked": "#8b5cf6",
  "Walk-in Completed": "#f59e0b",
  "Closed": "#ef4444",
  "Future Prospect": "#6b7280",
  "Admission Done": "#059669",
};

function CommissionToggle({ lead, onUpdate }: { lead: Lead; onUpdate: (updated: Lead) => void }) {
  const [saving, setSaving] = useState(false);
  if (lead.status !== "Admission Done") return <span className="text-xs text-slate-300">—</span>;
  const toggle = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/alliances/friendship/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ commissionPaid: !lead.commissionPaid }),
      });
      if (res.ok) onUpdate(await res.json());
    } catch { /* silent */ }
    setSaving(false);
  };
  const paid = lead.commissionPaid === true;
  const color = paid ? GREEN : lead.commissionPaid === false ? "#dc2626" : AMBER;
  return (
    <button onClick={toggle} disabled={saving}
      className="text-xs font-semibold hover:opacity-70 transition disabled:opacity-50"
      style={{ color }}
      data-testid={`button-commission-${lead.id}`}>
      {saving ? "…" : paid ? "Paid ✓" : lead.commissionPaid === false ? "Unpaid" : "Pending"}
    </button>
  );
}

type School = {
  id: number; name: string; slug: string; token: string;
  contactPerson: string; contactEmail?: string; contactPhone?: string; sheetsTabName: string;
  isActive: boolean; createdAt: string; leadCount: number;
};

type Lead = {
  id: number; schoolId: number; studentName: string; grade: string;
  parentName: string; phone: string; email?: string; source: string;
  status: string; commissionPaid?: boolean; remarks?: string;
  submittedAt: string; syncedToSheets: boolean; syncFailed: boolean;
};

function getToken() {
  try { return sessionStorage.getItem("ris_admin_auth") || ""; } catch { return ""; }
}

const authHeader = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};


export default function AdminFriendshipSchools() {
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try { return sessionStorage.getItem(ADMIN_AUTH_KEY); } catch { return null; }
  });

  if (!authToken) return <AdminGate onSuccess={setAuthToken} />;

  return <AdminFriendshipSchoolsInner />;
}

type ValidationStatus = { hasDropdown: boolean; reason?: string };

function AdminFriendshipSchoolsInner() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editSchool, setEditSchool] = useState<School | null>(null);
  const [syncMsg, setSyncMsg] = useState("");
  const [validationStatus, setValidationStatus] = useState<Record<number, ValidationStatus>>({});
  const [validationLoading, setValidationLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyLink = (e: React.MouseEvent, s: School) => {
    e.stopPropagation();
    const url = `${window.location.origin}/alliances/friendship/${s.token}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(prev => prev === s.id ? null : prev), 2000);
  };

  const handleSyncStatusFromSheets = async () => {
    if (!selectedSchool) return;
    setSyncMsg("Syncing status from Sheets…");
    try {
      const res = await fetch("/api/admin/alliances/friendship/sync-status-from-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ schoolId: selectedSchool.id }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setSyncMsg(`Done — ${d.updated ?? 0} lead${d.updated !== 1 ? "s" : ""} updated`);
        fetchLeads(selectedSchool);
      } else {
        setSyncMsg(d.message || "Sync failed");
      }
    } catch { setSyncMsg("Sync failed"); }
    setTimeout(() => setSyncMsg(""), 5000);
  };

  // Form state
  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formTabName, setFormTabName] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmRegen, setConfirmRegen] = useState<School | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<School | null>(null);

  useEffect(() => {
    document.title = "Friendship Schools | Admin | RIS";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/alliances/friendship/schools", { headers: authHeader() });
      if (res.status === 401) { try { sessionStorage.removeItem(ADMIN_AUTH_KEY); } catch {} window.location.reload(); return; }
      const data: School[] = await res.json();
      setSchools(data);
      if (data.length > 0) fetchValidationStatus();
    } catch { /* silent */ }
    setLoading(false);
  };

  const fetchValidationStatus = async () => {
    setValidationLoading(true);
    try {
      const res = await fetch("/api/admin/alliances/friendship/validation-status", { headers: authHeader() });
      if (!res.ok) return;
      const data: { schools: { id: number; hasDropdown: boolean; reason?: string }[] } = await res.json();
      const map: Record<number, ValidationStatus> = {};
      for (const s of data.schools) map[s.id] = { hasDropdown: s.hasDropdown, reason: s.reason };
      setValidationStatus(map);
    } catch { /* silent */ }
    setValidationLoading(false);
  };

  const fetchLeads = async (school: School) => {
    setSelectedSchool(school); setLeadsLoading(true); setLeads([]);
    try {
      const res = await fetch(`/api/admin/alliances/friendship/leads?schoolId=${school.id}`, { headers: authHeader() });
      setLeads(await res.json());
    } catch { /* silent */ }
    setLeadsLoading(false);
  };

  const openAddModal = () => {
    setEditSchool(null);
    setFormName(""); setFormContact(""); setFormEmail(""); setFormPhone(""); setFormTabName(""); setFormError("");
    setShowModal(true);
  };

  const openEditModal = (s: School) => {
    setEditSchool(s);
    setFormName(s.name); setFormContact(s.contactPerson); setFormEmail(s.contactEmail || ""); setFormPhone(s.contactPhone || ""); setFormTabName(s.sheetsTabName); setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formContact.trim() || !formTabName.trim()) {
      setFormError("School name, contact person, and Sheets tab name are required."); return;
    }
    setSaving(true); setFormError("");
    try {
      const body: Record<string, unknown> = {
        name: formName.trim(),
        contactPerson: formContact.trim(),
        contactEmail: formEmail.trim() || undefined,
        contactPhone: formPhone.trim() || undefined,
        sheetsTabName: formTabName.trim(),
      };
      if (!editSchool) {
        body.isActive = true;
      }
      const url = editSchool ? `/api/admin/alliances/friendship/schools/${editSchool.id}` : "/api/admin/alliances/friendship/schools";
      const method = editSchool ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(body),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || "Save failed");
      setShowModal(false);
      fetchSchools();
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    }
    setSaving(false);
  };

  const handleToggleActive = async (s: School) => {
    try {
      await fetch(`/api/admin/alliances/friendship/schools/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      fetchSchools();
      if (selectedSchool?.id === s.id) setSelectedSchool({ ...selectedSchool, isActive: !s.isActive });
    } catch { /* silent */ }
  };

  const handleRegenToken = async (s: School) => {
    try {
      const res = await fetch(`/api/admin/alliances/friendship/schools/${s.id}/regenerate-token`, {
        method: "POST", headers: authHeader(),
      });
      if (res.ok) { setConfirmRegen(null); fetchSchools(); }
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
        fetchSchools();
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

  const handleApplyValidation = async () => {
    setSyncMsg("Applying dropdowns…");
    try {
      const res = await fetch("/api/admin/alliances/friendship/apply-validation", { method: "POST", headers: authHeader() });
      const d = await res.json().catch(() => ({}));
      const skippedPart = (d.skipped ?? 0) > 0 ? `, ${d.skipped} already had dropdown` : "";
      setSyncMsg(`Dropdowns applied — ${d.applied ?? 0}/${d.total ?? 0} tabs updated${skippedPart}`);
      fetchValidationStatus();
    } catch { setSyncMsg("Apply validation failed"); }
    setTimeout(() => setSyncMsg(""), 7000);
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
  };

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <div className="px-6 py-4 shadow-sm" style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0" style={{ background: AMBER, color: NAVY }}>RIS</div>
            <div>
              <div className="font-black text-white text-base">Friendship Schools</div>
              <div className="text-blue-200 text-xs">Admin Portal · Alliances</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleApplyValidation}
              className="px-4 py-2 rounded-lg text-xs font-bold border-2 border-white/30 text-white hover:bg-white/10 transition"
              data-testid="button-apply-validation">
              ✅ Apply Dropdowns
            </button>
            <button onClick={openAddModal}
              className="px-4 py-2 rounded-lg text-xs font-black transition"
              style={{ background: AMBER, color: NAVY }}
              data-testid="button-add-school">
              + Add School
            </button>
          </div>
        </div>
      </div>
      {syncMsg && <div className="text-center text-xs py-2 font-semibold" style={{ background: AMBER, color: NAVY }}>{syncMsg}</div>}

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* School list */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="font-bold text-slate-700 text-sm">{schools.length} Friendship School{schools.length !== 1 ? "s" : ""}</div>
              </div>
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
              ) : schools.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No schools yet. Add one to get started.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {schools.map(s => (
                    <div key={s.id}
                      className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${selectedSchool?.id === s.id ? "bg-blue-50 border-l-4" : "border-l-4 border-l-transparent"}`}
                      style={selectedSchool?.id === s.id ? { borderLeftColor: NAVY } : {}}
                      onClick={() => fetchLeads(s)}
                      data-testid={`card-school-${s.id}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 text-sm truncate">{s.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{s.contactPerson}</div>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: s.isActive ? "#dcfce7" : "#fee2e2", color: s.isActive ? GREEN : "#dc2626" }}>
                              {s.isActive ? "Active" : "Inactive"}
                            </span>
                            <span className="text-xs text-slate-400">{s.leadCount} lead{s.leadCount !== 1 ? "s" : ""}</span>
                            {validationLoading && !(s.id in validationStatus) ? (
                              <span className="text-xs text-slate-300 font-medium" data-testid={`badge-validation-${s.id}`}>…</span>
                            ) : s.id in validationStatus ? (
                              validationStatus[s.id].hasDropdown ? (
                                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                                  style={{ background: "#dcfce7", color: "#059669" }}
                                  title="Column H has status dropdown"
                                  data-testid={`badge-validation-${s.id}`}>✓ dropdown</span>
                              ) : (
                                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                                  style={{ background: "#fff7ed", color: "#c2410c" }}
                                  title={validationStatus[s.id].reason === "tab not found" ? "Sheet tab not found" : "Column H is missing the status dropdown"}
                                  data-testid={`badge-validation-${s.id}`}>⚠ missing</span>
                              )
                            ) : null}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button onClick={e => { e.stopPropagation(); window.location.href = `/admin/alliances/friendship/${s.id}/qr`; }}
                            className="text-xs px-2 py-1 rounded font-semibold transition hover:opacity-80"
                            style={{ background: "#f0f4ff", color: NAVY }}
                            data-testid={`button-qr-${s.id}`}>QR</button>
                          <button onClick={e => handleCopyLink(e, s)}
                            className="text-xs px-2 py-1 rounded font-semibold transition"
                            style={{ background: copiedId === s.id ? "#dcfce7" : "#f0fdf4", color: copiedId === s.id ? "#059669" : "#16a34a" }}
                            data-testid={`button-link-${s.id}`}
                            title="Copy portal link">
                            {copiedId === s.id ? "✓" : "Link"}
                          </button>
                          {s.contactPhone && (
                            <a href={buildWhatsAppUrl(s.contactPhone, s.token, s.name, window.location.origin)}
                              target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-xs px-2 py-1 rounded font-semibold text-center transition"
                              style={{ background: "#dcfce7", color: "#16a34a" }}
                              data-testid={`button-whatsapp-${s.id}`}
                              title="Send portal link via WhatsApp">
                              WA
                            </a>
                          )}
                          {s.contactEmail && (
                            <a href={buildEmailUrl(s.contactEmail, s.token, s.name, window.location.origin)}
                              onClick={e => e.stopPropagation()}
                              className="text-xs px-2 py-1 rounded font-semibold text-center transition"
                              style={{ background: "#eff6ff", color: "#2563eb" }}
                              data-testid={`button-email-${s.id}`}
                              title="Send portal link via Email">
                              Mail
                            </a>
                          )}
                          <button onClick={e => { e.stopPropagation(); openEditModal(s); }}
                            className="text-xs px-2 py-1 rounded font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                            data-testid={`button-edit-${s.id}`}>Edit</button>
                          <button onClick={e => { e.stopPropagation(); setConfirmDelete(s); }}
                            className="text-xs px-2 py-1 rounded font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition"
                            data-testid={`button-delete-${s.id}`}>Del</button>
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
                <div className="text-slate-500 text-sm">Select a school on the left to view leads</div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-slate-800">{selectedSchool.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Sheets tab: <code className="bg-slate-100 px-1 py-0.5 rounded">{selectedSchool.sheetsTabName}</code></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleActive(selectedSchool)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold border transition"
                        style={selectedSchool.isActive
                          ? { borderColor: "#fee2e2", color: "#dc2626", background: "#fff" }
                          : { borderColor: "#dcfce7", color: GREEN, background: "#fff" }}
                        data-testid="button-toggle-active">
                        {selectedSchool.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                      <button onClick={handleSyncStatusFromSheets}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                        data-testid="button-sync-status-sheets">
                        ↓ Sync Status
                      </button>
                      <button onClick={() => setConfirmRegen(selectedSchool)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold border border-amber-200 text-amber-600 hover:bg-amber-50 transition"
                        data-testid="button-regen-token">
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
                          {["Date", "Student", "Grade", "Parent", "Phone", "Source", "Status", "Ref. Amt", "Synced"].map(h => (
                            <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map(l => (
                          <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50" data-testid={`row-lead-${l.id}`}>
                            <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap text-xs">{formatDate(l.submittedAt)}</td>
                            <td className="px-4 py-2.5 font-semibold text-slate-800">{l.studentName}</td>
                            <td className="px-4 py-2.5 text-slate-600">{l.grade}</td>
                            <td className="px-4 py-2.5 text-slate-700">{l.parentName}</td>
                            <td className="px-4 py-2.5 text-slate-500">{l.phone}</td>
                            <td className="px-4 py-2.5">
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: l.source === "bulk" ? "#f0f4ff" : "#f8fafc", color: l.source === "bulk" ? NAVY : "#64748b" }}>
                                {l.source}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: (STATUS_COLORS[l.status] ?? "#64748b") + "20", color: STATUS_COLORS[l.status] ?? "#64748b" }}
                                data-testid={`badge-status-${l.id}`}>
                                {l.status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <CommissionToggle lead={l} onUpdate={updated => setLeads(prev => prev.map(x => x.id === updated.id ? updated : x))} />
                            </td>
                            <td className="px-4 py-2.5">
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
                <input value={formName} onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Sunshine Academy"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                  data-testid="input-school-name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Contact Person *</label>
                <input value={formContact} onChange={e => setFormContact(e.target.value)}
                  placeholder="e.g. Ms. Anita Sharma"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                  data-testid="input-contact-person" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Contact Phone <span className="font-normal text-slate-400">(optional — for WhatsApp)</span></label>
                <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                  data-testid="input-contact-phone" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Contact Email <span className="font-normal text-slate-400">(optional)</span></label>
                <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)}
                  placeholder="e.g. anita@school.edu"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                  data-testid="input-contact-email" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Google Sheets Tab Name *</label>
                <input value={formTabName} onChange={e => setFormTabName(e.target.value)}
                  placeholder="e.g. Sunshine Academy"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                  data-testid="input-tab-name" />
                <div className="text-xs text-slate-400 mt-1">Must match the exact tab name in your Google Sheets spreadsheet.</div>
              </div>
              {formError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</div>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                data-testid="button-cancel">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-xl font-black text-white transition disabled:opacity-60"
                style={{ background: saving ? "#94a3b8" : NAVY }}
                data-testid="button-save">
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
                className="flex-1 py-3 rounded-xl font-black text-white transition"
                style={{ background: "#dc2626" }}
                data-testid="button-confirm-delete">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate token confirmation */}
      {confirmRegen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(9,26,79,0.7)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <div className="font-black text-lg mb-2" style={{ color: NAVY }}>Regenerate QR Code?</div>
            <div className="text-sm text-slate-600 mb-6">
              This will <strong>invalidate the existing QR code</strong> for <strong>{confirmRegen.name}</strong>. All printed QR cards will stop working immediately. You'll need to print and distribute a new QR card.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRegen(null)}
                className="flex-1 py-3 rounded-xl font-semibold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={() => handleRegenToken(confirmRegen)}
                className="flex-1 py-3 rounded-xl font-black text-white transition"
                style={{ background: "#dc2626" }}
                data-testid="button-confirm-regen">
                Yes, Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
