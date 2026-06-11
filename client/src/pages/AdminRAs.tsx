import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";

const NAVY = "#091a4f";
const AMBER = "#f59e0b";
const GREEN = "#059669";
const RED = "#dc2626";

const ADMIN_AUTH_KEY = "ris_admin_auth";
const BLUE = "#2563eb";
const SCHOOL_BRANCHES: Record<string, string[]> = {
  RIS: ["Main", "Agarwal", "Dhokali", "Kasarwadavali", "Anand Nagar", "Hariniwas"],
  RPS: ["Aggarwal", "Hariniwas", "Kalwa", "Kasarwadavli", "Anand Nagar", "Dhokali"],
};

type School = "RIS" | "RPS";
type Ra = { id: string; name: string; slug: string; branch: string; school: School; active: boolean; createdAt: string };

function getToken() {
  try { return sessionStorage.getItem(ADMIN_AUTH_KEY) || ""; } catch { return ""; }
}

function AdminGate({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/ras", {
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
            <div className="text-xs text-slate-500">RA Management · Internal</div>
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Token</label>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Enter admin token"
          className={`w-full px-4 py-3 rounded-lg border-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? "border-red-500 bg-red-50" : "border-slate-300"}`}
          data-testid="input-admin-token"
        />
        {error && <div className="mt-2 text-sm text-red-600" data-testid="text-auth-error">Invalid token</div>}
        <button type="submit" className="mt-4 w-full py-3 rounded-lg font-bold text-white" style={{ background: NAVY }} data-testid="button-admin-login">
          Unlock
        </button>
      </form>
    </div>
  );
}

export default function AdminRAs() {
  const [token, setToken] = useState<string | null>(() => {
    const t = getToken(); return t || null;
  });
  if (!token) return <AdminGate onSuccess={t => setToken(t)} />;
  return <RaManagement token={token} onLogout={() => { try { sessionStorage.removeItem(ADMIN_AUTH_KEY); } catch {} setToken(null); }} />;
}

function RaManagement({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [ras, setRas] = useState<Ra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRa, setEditRa] = useState<Ra | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [fName, setFName] = useState("");
  const [fSlug, setFSlug] = useState("");
  const [fSchool, setFSchool] = useState<School>("RIS");
  const [fBranch, setFBranch] = useState("Main");
  const [fActive, setFActive] = useState(true);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    document.title = "RA Management | Rainbow International School";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/ras", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setRas(await res.json());
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditRa(null); setFName(""); setFSlug(""); setFSchool("RIS"); setFBranch("Main"); setFActive(true);
    setFormError(""); setShowForm(true);
  };

  const openEdit = (ra: Ra) => {
    setEditRa(ra); setFName(ra.name); setFSlug(ra.slug); setFSchool(ra.school || "RIS"); setFBranch(ra.branch); setFActive(ra.active);
    setFormError(""); setShowForm(true);
  };

  const autoSlug = (name: string) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName.trim() || !fSlug.trim()) { setFormError("Name and slug are required"); return; }
    if (!/^[a-z0-9-]+$/.test(fSlug)) { setFormError("Slug must be lowercase letters, numbers and hyphens only"); return; }
    setSaving(true); setFormError("");
    try {
      const body = { name: fName.trim(), slug: fSlug.trim(), school: fSchool, branch: fBranch, active: fActive };
      const url = editRa ? `/api/admin/ras/${editRa.id}` : "/api/admin/ras";
      const method = editRa ? "PUT" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to save");
      }
      setShowForm(false); load();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const baseUrl = window.location.origin;

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <div className="text-white py-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b-4 border-amber-400" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md flex items-center justify-center font-black text-sm" style={{ background: AMBER, color: NAVY }}>RIS</div>
          <div>
            <div className="font-black text-lg leading-tight">RA Management</div>
            <div className="text-xs text-blue-200">Walk-in QR Check-in System · Admin</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/ras/submissions">
            <a className="px-3 py-1.5 rounded border border-white/30 text-white text-xs font-semibold hover:bg-white/10" data-testid="link-submissions">View Submissions</a>
          </Link>
          <Link href="/sales">
            <a className="px-3 py-1.5 rounded border border-white/30 text-white text-xs font-semibold hover:bg-white/10">Sales Dashboard</a>
          </Link>
          <button onClick={onLogout} className="px-3 py-1.5 rounded border border-white/30 text-white/70 text-xs hover:bg-white/10" data-testid="button-logout">Lock</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black" style={{ color: NAVY }}>Relationship Associates</h1>
            <div className="text-xs text-slate-500 mt-0.5">Each RA gets a unique QR code for walk-in attribution</div>
          </div>
          <button onClick={openAdd} className="px-4 py-2 rounded-lg text-white font-bold text-sm" style={{ background: NAVY }} data-testid="button-add-ra">
            + Add RA
          </button>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border-t-4 border-amber-400">
              <div className="font-black text-lg mb-4" style={{ color: NAVY }}>{editRa ? "Edit RA" : "Add New RA"}</div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name *</label>
                  <input
                    type="text" value={fName}
                    onChange={e => { setFName(e.target.value); if (!editRa) setFSlug(autoSlug(e.target.value)); }}
                    placeholder="e.g. Srishti Sharma"
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 text-sm focus:outline-none focus:border-amber-400"
                    data-testid="input-ra-name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slug (URL) *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 whitespace-nowrap">/walkin/</span>
                    <input
                      type="text" value={fSlug}
                      onChange={e => setFSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="e.g. srishti"
                      className="flex-1 px-3 py-2.5 rounded-lg border-2 border-slate-200 text-sm focus:outline-none focus:border-amber-400"
                      data-testid="input-ra-slug"
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Lowercase letters, numbers and hyphens only</div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">School</label>
                  <div className="flex gap-2">
                    {(["RIS", "RPS"] as School[]).map(s => (
                      <button
                        key={s} type="button"
                        onClick={() => { setFSchool(s); setFBranch(SCHOOL_BRANCHES[s][0]); }}
                        className="flex-1 px-3 py-2.5 rounded-lg border-2 text-sm font-bold transition"
                        style={fSchool === s
                          ? { background: s === "RPS" ? RED : BLUE, color: "#fff", borderColor: s === "RPS" ? RED : BLUE }
                          : { background: "#fff", color: "#64748b", borderColor: "#e2e8f0" }}
                        data-testid={`button-school-${s}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Branch</label>
                  <select value={fBranch} onChange={e => setFBranch(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 text-sm focus:outline-none focus:border-amber-400 bg-white"
                    data-testid="select-ra-branch">
                    {SCHOOL_BRANCHES[fSchool].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={fActive} onChange={e => setFActive(e.target.checked)} className="rounded" data-testid="checkbox-ra-active" />
                  <span className="text-sm font-medium text-slate-700">Active (can receive check-ins)</span>
                </label>
              </div>
              {formError && <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</div>}
              <div className="flex gap-3 mt-5">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg text-white font-bold text-sm" style={{ background: NAVY }} data-testid="button-save-ra">
                  {saving ? "Saving…" : editRa ? "Save Changes" : "Create RA"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RA Table */}
        {loading ? (
          <div className="text-slate-400 text-sm text-center py-12">Loading…</div>
        ) : ras.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <div className="text-4xl mb-3">👥</div>
            <div className="font-bold text-slate-600">No RAs yet</div>
            <div className="text-sm text-slate-400 mt-1">Click "Add RA" to create the first counsellor profile.</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm" data-testid="table-ras">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4">RA Name</th>
                  <th className="text-left py-3 px-4">School</th>
                  <th className="text-left py-3 px-4">Branch</th>
                  <th className="text-left py-3 px-4">Walk-in URL</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ras.map(ra => (
                  <tr key={ra.id} className="border-t border-slate-100 hover:bg-slate-50" data-testid={`row-ra-${ra.slug}`}>
                    <td className="py-3 px-4 font-semibold text-slate-800">{ra.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: (ra.school || "RIS") === "RPS" ? RED : BLUE }} data-testid={`badge-school-${ra.slug}`}>
                        {ra.school || "RIS"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{ra.branch}</td>
                    <td className="py-3 px-4">
                      <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">/walkin/{ra.slug}</code>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: ra.active ? "#dcfce7" : "#fef2f2", color: ra.active ? GREEN : RED }}>
                        {ra.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2 flex-nowrap">
                        <button onClick={() => openEdit(ra)} className="px-2.5 py-1 rounded text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100 whitespace-nowrap" data-testid={`button-edit-${ra.slug}`}>Edit</button>
                        <Link href={`/admin/ras/${ra.slug}/qr`}>
                          <a className="px-2.5 py-1 rounded text-xs font-semibold text-white whitespace-nowrap" style={{ background: NAVY }} target="_blank" data-testid={`button-qr-${ra.slug}`}>QR Card</a>
                        </Link>
                        <a href={`/walkin/${ra.slug}`} target="_blank" className="px-2.5 py-1 rounded text-xs font-semibold border border-amber-300 text-amber-700 hover:bg-amber-50 whitespace-nowrap" data-testid={`button-preview-${ra.slug}`} rel="noreferrer">Preview</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
          <strong>How to use:</strong> Create an RA profile → click "QR Card" → print the card → laminate it and place it on the RA's desk. Parents scan the QR code and fill their details. Check-ins appear in the Sales Dashboard and Submissions log automatically.
        </div>
      </div>
    </div>
  );
}
