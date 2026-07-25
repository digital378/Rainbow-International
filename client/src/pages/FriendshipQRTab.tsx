import { useState, useEffect, useRef } from "react";
import { normalizePhone } from "@/lib/friendship-url-utils";

const NAVY = "#091a4f";
const AMBER = "#f59e0b";
const GREEN = "#059669";
const ADMIN_AUTH_KEY = "ris_admin_auth";

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
  contactPerson: string; contactEmail?: string; contactPhone?: string; sheetsTabName: string;
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
const authHeader = (): Record<string, string> => {
  const t = getToken();
  // Alliances session is handled by HttpOnly cookie set at login — no extra header needed.
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
  return <FriendshipQRTabInner />;
}

function portalUrl(token: string) {
  return `${window.location.origin}/alliances/friendship/${token}`;
}

function copyPortalUrl(token: string) {
  navigator.clipboard.writeText(portalUrl(token)).catch(() => {});
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
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [sortBy, setSortBy] = useState<"alpha-asc" | "alpha-desc" | "newest" | "oldest">("alpha-asc");
  const leadsPanelRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = (e: React.MouseEvent, s: School) => {
    e.stopPropagation();
    copyPortalUrl(s.token);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(prev => prev === s.id ? null : prev), 2000);
  };

  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formTabName, setFormTabName] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

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
        const parts = [];
        if ((d.imported ?? 0) > 0) parts.push(`${d.imported} imported`);
        if ((d.updated ?? 0) > 0) parts.push(`${d.updated} status${d.updated !== 1 ? "es" : ""} updated`);
        setSyncMsg(parts.length ? `Done — ${parts.join(", ")}` : "Done — nothing new");
        fetchLeads(selectedSchool);
      } else {
        setSyncMsg(d.message || "Sync failed");
      }
    } catch { setSyncMsg("Sync failed"); }
    setTimeout(() => setSyncMsg(""), 5000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [schoolsRes, statsRes] = await Promise.all([
        fetch("/api/admin/alliances/friendship/schools", { headers: authHeader() }),
        fetch("/api/admin/alliances/friendship/stats", { headers: authHeader() }),
      ]);
      if (schoolsRes.status === 401) { setLoading(false); return; } // auth handled at dashboard level
      setSchools(await schoolsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchLeads = async (school: School) => {
    setSelectedSchool(school); setLeadsLoading(true); setLeads([]);
    // Only scroll on narrow screens (< 1024px) where the panel is stacked below the list
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        leadsPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
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
        name: formName.trim(), contactPerson: formContact.trim(),
        contactEmail: formEmail.trim() || undefined,
        contactPhone: formPhone.trim() || undefined,
        sheetsTabName: formTabName.trim(),
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


  // Filtered + sorted school list
  const displayedSchools = schools
    .filter(s => !schoolSearch || s.name.toLowerCase().includes(schoolSearch.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "alpha-asc")  return a.name.localeCompare(b.name);
      if (sortBy === "alpha-desc") return b.name.localeCompare(a.name);
      if (sortBy === "newest")     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      /* oldest */                 return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

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
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="font-bold text-slate-700 text-sm">
          {loading ? "Loading…" : `${schools.length} Friendship School${schools.length !== 1 ? "s" : ""}`}
        </div>
        <div className="flex gap-2">
          {syncMsg && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: AMBER + "20", color: "#92400e" }}>
              {syncMsg}
            </span>
          )}
          <button onClick={openAddModal}
            className="px-4 py-1.5 rounded-lg text-xs font-black text-white transition"
            style={{ background: NAVY }}
            data-testid="button-qr-add-school">
            + Add School
          </button>
        </div>
      </div>

      {/* Search + sort bar (above cards) */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          value={schoolSearch}
          onChange={e => setSchoolSearch(e.target.value)}
          placeholder="Search schools…"
          className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-amber-400 transition"
          data-testid="input-school-search"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-amber-400 transition bg-white"
          data-testid="select-school-sort"
        >
          <option value="alpha-asc">A → Z</option>
          <option value="alpha-desc">Z → A</option>
          <option value="newest">Latest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* School list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : displayedSchools.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                {schoolSearch ? `No schools match "${schoolSearch}"` : "No schools yet. Add one to get started."}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {displayedSchools.map(s => (
                  <div key={s.id}
                    className={`px-4 pt-4 pb-3 cursor-pointer transition-colors hover:bg-slate-50 border-l-4 ${selectedSchool?.id === s.id ? "bg-blue-50" : "border-l-transparent"}`}
                    style={selectedSchool?.id === s.id ? { borderLeftColor: NAVY } : {}}
                    onClick={() => fetchLeads(s)}
                    data-testid={`card-qr-school-${s.id}`}>
                    <div className="font-bold text-slate-800 text-sm leading-snug">{s.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.contactPerson || "—"}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: s.leadCount > 0 ? "#dcfce7" : "#f1f5f9", color: s.leadCount > 0 ? GREEN : "#94a3b8" }}>
                        {s.leadCount > 0 ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-slate-400">{s.leadCount} lead{s.leadCount !== 1 ? "s" : ""}</span>
                    </div>
                    {/* Action buttons — bottom row */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap" onClick={e => e.stopPropagation()}>
                      <button onClick={e => { e.stopPropagation(); window.open(`/admin/alliances/friendship/${s.id}/qr?name=${encodeURIComponent(s.name)}&token=${s.token}`, "_blank"); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition hover:opacity-80"
                        style={{ background: "#f0f4ff", color: NAVY }}
                        data-testid={`button-qr-qr-${s.id}`}>QR Code</button>
                      <button onClick={e => handleCopyLink(e, s)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                        style={{ background: copiedId === s.id ? "#dcfce7" : "#f0fdf4", color: copiedId === s.id ? "#059669" : "#16a34a" }}
                        data-testid={`button-qr-link-${s.id}`}>
                        {copiedId === s.id ? "✓ Copied" : "Copy Link"}
                      </button>
                      <button onClick={e => { e.stopPropagation(); openEditModal(s); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                        data-testid={`button-qr-edit-${s.id}`}>Edit</button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDelete(s); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition"
                        data-testid={`button-qr-delete-${s.id}`}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leads panel */}
        <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start" ref={leadsPanelRef}>
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
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 items-center">
                      <span>{selectedSchool.contactPerson}</span>
                      {selectedSchool.contactPhone && (
                        <a href={`https://wa.me/${normalizePhone(selectedSchool.contactPhone)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="font-semibold text-green-600 hover:underline"
                          data-testid="link-header-whatsapp">
                          📞 {selectedSchool.contactPhone}
                        </a>
                      )}
                      {selectedSchool.contactEmail && (
                        <a href={`mailto:${selectedSchool.contactEmail}`}
                          className="font-semibold text-blue-600 hover:underline"
                          data-testid="link-header-email">
                          ✉ {selectedSchool.contactEmail}
                        </a>
                      )}
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
                    <button onClick={handleSyncStatusFromSheets}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                      data-testid="button-qr-sync-status">
                      ↓ Sync Status
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
                        {["Date", "Student", "Grade", "Parent", "Contact", "Source", "Status", "Ref. Amt", "Synced"].map(h => (
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
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              {l.phone ? (
                                <a href={`https://wa.me/${normalizePhone(l.phone)}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-green-600 font-semibold hover:underline">
                                  📞 {l.phone}
                                </a>
                              ) : <span className="text-xs text-slate-300">—</span>}
                              {l.email ? (
                                <a href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(l.email)}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline">
                                  ✉ {l.email}
                                </a>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: l.source === "bulk" ? "#f0f4ff" : "#f8fafc", color: l.source === "bulk" ? NAVY : "#64748b" }}>
                              {l.source}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: (STATUS_COLORS[l.status] ?? "#64748b") + "20", color: STATUS_COLORS[l.status] ?? "#64748b" }}
                              data-testid={`badge-status-${l.id}`}>
                              {l.status}
                            </span>
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Contact Phone <span className="font-normal text-slate-400">(optional — for WhatsApp)</span></label>
                <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                  data-testid="input-qr-contact-phone" />
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
