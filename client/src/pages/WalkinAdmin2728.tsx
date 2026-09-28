/**
 * Admin Panel — Walk-in 27-28
 * Route: /admin/walkin-2728
 * Protected by a dedicated panel passcode and scoped session.
 *
 * Tabs:
 *  1. Branches     — CRUD for walkin_branches
 *  2. Staff        — CRUD for walkin_staff (Lead Owner dropdown)
 *  3. Lookups      — Programs / Sources / Statuses / Close Reasons
 *  4. QR Codes     — Per-branch kiosk QR codes with download
 *  5. Sheets Sync  — Google Sheets sync status & resync
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { forgetPageSession, restorePageSession, signInPage } from "@/lib/walkinPageAuth";
import QRCode from "qrcode";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── Constants ──────────────────────────────────────────────────
const NAV = "#091a4f";

// ── Types ──────────────────────────────────────────────────────
interface Branch {
  id: number; name: string; brand: string; code: string;
  pin: string; isActive: boolean; createdAt: string;
}
interface StaffMember {
  id: number; name: string; brand: string | null;
  branchId: number | null; isActive: boolean; sortOrder: number;
  leadCount?: number;
}
interface LookupItem {
  id: number; label: string; brand: string | null;
  sortOrder: number; isActive: boolean;
}
interface Lookups {
  programs: LookupItem[]; sources: LookupItem[];
  statuses: LookupItem[]; closeReasons: LookupItem[];
}
interface SheetBrandStatus {
  sheetConfigured: boolean; sheetId: string | null; lastSyncAt: string | null;
  dbCount: number; sheetCount: number; lastError: string | null;
}
interface SyncStatus {
  googleConfigured: boolean;
  credentialSource: "encrypted" | "legacy" | "unavailable";
  RIS: SheetBrandStatus; RPS: SheetBrandStatus; MASTER: SheetBrandStatus;
}

function hdrs(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// ── AdminGate ──────────────────────────────────────────────────
function AdminGate({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setLoading(true);
    try {
      const token = await signInPage("panel", passcode);
      if (token) onSuccess(token);
      else { setError("Invalid passcode"); setPasscode(""); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: NAV }}>
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <img src="/images/rainbow-logo.png" alt="" className="h-10 w-auto object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div>
            <div className="font-black text-lg" style={{ color: NAV }}>Walk-in Admin</div>
            <div className="text-xs text-slate-500">AY 2027-28 · Internal</div>
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Admin panel passcode</label>
        <input ref={ref} type="password" autoComplete="off" value={passcode} onChange={e => { setPasscode(e.target.value); setError(""); }}
          className={`w-full px-4 py-3 rounded-lg border-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? "border-red-400 bg-red-50" : "border-slate-200"}`}
          placeholder="Enter panel passcode" />
        {error && <div className="mt-2 text-sm text-red-600" role="alert">{error}</div>}
        <button type="submit" disabled={loading}
          className="mt-5 w-full py-3 rounded-lg text-white font-bold transition disabled:opacity-60"
          style={{ background: NAV }}>
          {loading ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}

// ── Shared small components ─────────────────────────────────────
function Badge({ active }: { active: boolean }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function Btn({ onClick, children, variant = "primary", disabled, small, className = "", type = "button" }: {
  onClick?: () => void; children: React.ReactNode; variant?: "primary" | "ghost" | "danger";
  disabled?: boolean; small?: boolean; className?: string; type?: "button" | "submit" | "reset";
}) {
  const base = `font-semibold rounded-lg transition disabled:opacity-50 ${small ? "text-xs px-2.5 py-1" : "text-sm px-4 py-2"}`;
  const styles: Record<string, string> = {
    primary: `text-white ${base}`,
    ghost: `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 ${base}`,
    danger: `bg-red-100 text-red-700 hover:bg-red-200 ${base}`,
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${styles[variant]} ${className}`}
      style={variant === "primary" ? { background: NAV } : {}}>
      {children}
    </button>
  );
}

function InputRow({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1${className ? ` ${className}` : ""}`}>
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function inp(extra = "") {
  return `w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white ${extra}`;
}

// ── BranchesTab ────────────────────────────────────────────────
function BranchesTab({ token }: { token: string }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", brand: "RIS", code: "" });
  const [editForm, setEditForm] = useState({ name: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/walkin/branches?active=false", { headers: { Authorization: `Bearer ${token}` } });
      setBranches(await r.json());
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const addBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      const r = await fetch("/api/walkin/branches", {
        method: "POST", headers: hdrs(token),
        body: JSON.stringify(form),
      });
      if (r.ok) { setAdding(false); setForm({ name: "", brand: "RIS", code: "" }); load(); }
      else { const d = await r.json(); setMsg(d.message || "Failed"); }
    } catch { setMsg("Network error"); }
    setSaving(false);
  };

  const saveBranch = async () => {
    if (!editing) return;
    setSaving(true); setMsg("");
    try {
      const r = await fetch(`/api/walkin/branches/${editing.id}`, {
        method: "PATCH", headers: hdrs(token), body: JSON.stringify(editForm),
      });
      if (r.ok) { setEditing(null); load(); }
      else { const d = await r.json(); setMsg(d.message || "Failed"); }
    } catch { setMsg("Network error"); }
    setSaving(false);
  };

  const startEdit = (b: Branch) => {
    setEditing(b);
    setEditForm({ name: b.name, isActive: b.isActive });
    setMsg("");
  };

  const deleteBranch = async () => {
    if (!deleteConfirm) return;
    setDeleting(true); setDeleteMsg("");
    try {
      const r = await fetch(`/api/walkin/branches/${deleteConfirm.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (r.ok) { setDeleteConfirm(null); load(); }
      else setDeleteMsg(d.message || "Delete failed");
    } catch { setDeleteMsg("Network error"); }
    setDeleting(false);
  };

  if (loading) return <div className="text-sm text-slate-400 p-4">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-700">Branches ({branches.length})</h3>
        <Btn onClick={() => setAdding(a => !a)}>{adding ? "Cancel" : "+ Add Branch"}</Btn>
      </div>

      {adding && (
        <form onSubmit={addBranch} className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-3">
          <InputRow label="Branch Name">
            <input className={inp()} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Brahmand" />
          </InputRow>
          <InputRow label="Brand">
            <select className={inp()} value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}>
              <option value="RIS">RIS</option>
              <option value="RPS">RPS</option>
            </select>
          </InputRow>
          <InputRow label="Code (URL slug, lowercase)" className="col-span-2">
            <input className={inp()} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} required placeholder="brahmand" />
          </InputRow>
          {msg && <div className="col-span-2 text-sm text-red-600">{msg}</div>}
          <div className="col-span-2 flex gap-2">
            <Btn type="submit" disabled={saving}>{saving ? "Saving…" : "Create Branch"}</Btn>
            <Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
          </div>
        </form>
      )}

      <div className="overflow-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Name", "Brand", "Code", "Status", "Form URL", ""].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branches.map(b => (
              <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2.5 font-medium">{b.name}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.brand === "RIS" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>{b.brand}</span>
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{b.code}</td>
                <td className="px-3 py-2.5"><Badge active={b.isActive} /></td>
                <td className="px-3 py-2.5 text-xs text-slate-400 max-w-[160px] truncate">
                  /walkin-{b.brand.toLowerCase()}-27-28/{b.code}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    <Btn small variant="ghost" onClick={() => startEdit(b)}>Edit</Btn>
                    <Btn small variant="danger" onClick={() => { setDeleteConfirm(b); setDeleteMsg(""); }}>Delete</Btn>
                  </div>
                </td>
              </tr>
            ))}
            {branches.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-400">No branches yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h4 className="font-bold text-slate-800">Edit: {editing.name}</h4>
            <InputRow label="Name">
              <input className={inp()} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </InputRow>
            <InputRow label="Status">
              <select className={inp()} value={String(editForm.isActive)} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.value === "true" }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </InputRow>
            {msg && <div className="text-sm text-red-600">{msg}</div>}
            <div className="flex gap-2">
              <Btn onClick={saveBranch} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
              <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h4 className="font-bold text-red-700">Delete branch?</h4>
            <p className="text-sm text-slate-600">
              <b>{deleteConfirm.name}</b> ({deleteConfirm.brand}) will be permanently deleted.
            </p>
            <p className="text-xs text-slate-400">Any leads or staff assigned to this branch must be reassigned first.</p>
            {deleteMsg && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{deleteMsg}</div>}
            <div className="flex gap-2">
              <Btn variant="danger" onClick={deleteBranch} disabled={deleting}>{deleting ? "Deleting…" : "Yes, Delete"}</Btn>
              <Btn variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DragHandle ─────────────────────────────────────────────────
function DragHandle(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      title="Drag to reorder"
      className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 select-none px-1 flex items-center"
      style={{ touchAction: "none" }}
    >
      <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
        <circle cx="3" cy="3"  r="1.5"/><circle cx="9" cy="3"  r="1.5"/>
        <circle cx="3" cy="10" r="1.5"/><circle cx="9" cy="10" r="1.5"/>
        <circle cx="3" cy="17" r="1.5"/><circle cx="9" cy="17" r="1.5"/>
      </svg>
    </div>
  );
}

// ── SortableStaffRow ───────────────────────────────────────────
function SortableStaffRow({ s, branchLabel, onEdit }: {
  s: StaffMember; branchLabel: string;
  onEdit: (s: StaffMember) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "#f8fafc" : undefined,
  };
  const leadCount = s.leadCount ?? 0;
  return (
    <tr ref={setNodeRef} style={style} className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-1 py-2.5 w-8">
        <DragHandle {...attributes} {...listeners} />
      </td>
      <td className="px-3 py-2.5 font-medium">{s.name}</td>
      <td className="px-3 py-2.5 text-xs text-slate-500">{s.brand ?? "Both"}</td>
      <td className="px-3 py-2.5 text-xs text-slate-500">{branchLabel}</td>
      <td className="px-3 py-2.5"><Badge active={s.isActive} /></td>
      <td className="px-3 py-2.5 text-center">
        {leadCount > 0
          ? <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{leadCount}</span>
          : <span className="text-xs text-slate-300">—</span>
        }
      </td>
      <td className="px-3 py-2.5">
        <Btn small variant="ghost" onClick={() => onEdit(s)}>Edit</Btn>
      </td>
    </tr>
  );
}

// ── StaffTab ───────────────────────────────────────────────────
function StaffTab({ token }: { token: string }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", brand: "" as "" | "RIS" | "RPS", branchId: "" as "" | number });
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState({ name: "", branchId: null as number | null, isActive: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sr, br] = await Promise.all([
        fetch("/api/walkin/staff", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/walkin/branches?active=false", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStaff(await sr.json());
      setBranches(await br.json());
    } finally { setLoading(false); }
  }, [token]);

  const branchLabel = (branchId: number | null) =>
    branchId ? (branches.find(b => b.id === branchId)?.name ?? `Branch #${branchId}`) : "All branches";

  useEffect(() => { load(); }, [load]);

  const addStaff = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg("");
    try {
      const body = {
        name: form.name,
        brand: form.brand || null,
        branchId: form.branchId ? Number(form.branchId) : null,
        sortOrder: staff.length * 10,
      };
      const r = await fetch("/api/walkin/staff", { method: "POST", headers: hdrs(token), body: JSON.stringify(body) });
      if (r.ok) { setAdding(false); setForm({ name: "", brand: "", branchId: "" }); load(); }
      else { const d = await r.json(); setMsg(d.message || "Failed"); }
    } catch { setMsg("Network error"); }
    setSaving(false);
  };

  const saveStaff = async () => {
    if (!editing) return; setSaving(true); setMsg("");
    try {
      const r = await fetch(`/api/walkin/staff/${editing.id}`, { method: "PATCH", headers: hdrs(token), body: JSON.stringify(editForm) });
      if (r.ok) { setEditing(null); load(); }
      else { const d = await r.json(); setMsg(d.message || "Failed"); }
    } catch { setMsg("Network error"); }
    setSaving(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = staff.findIndex(s => s.id === active.id);
    const newIndex = staff.findIndex(s => s.id === over.id);
    const reordered = arrayMove(staff, oldIndex, newIndex);
    setStaff(reordered);
    // Persist new sortOrder for all items
    await Promise.all(
      reordered.map((s, i) =>
        fetch(`/api/walkin/staff/${s.id}`, {
          method: "PATCH", headers: hdrs(token),
          body: JSON.stringify({ sortOrder: i * 10 }),
        }),
      ),
    );
  };

  if (loading) return <div className="text-sm text-slate-400 p-4">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-700">Lead Owners / Staff ({staff.length})</h3>
        <Btn onClick={() => setAdding(a => !a)}>{adding ? "Cancel" : "+ Add Staff"}</Btn>
      </div>

      {adding && (
        <form onSubmit={addStaff} className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-3">
          <InputRow label="Name">
            <input className={inp()} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Counsellor name" />
          </InputRow>
          <InputRow label="Brand (leave blank for both)">
            <select className={inp()} value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value as any, branchId: "" }))}>
              <option value="">Both (RIS + RPS)</option>
              <option value="RIS">RIS only</option>
              <option value="RPS">RPS only</option>
            </select>
          </InputRow>
          <InputRow label="Assigned Branch" className="col-span-2">
            <select className={inp()} value={String(form.branchId)} onChange={e => setForm(f => ({ ...f, branchId: e.target.value ? Number(e.target.value) : "" }))}>
              <option value="">— All branches (no restriction) —</option>
              {(["RIS", "RPS"] as const).map(brand => {
                const brandBranches = branches.filter(b => b.brand === brand);
                if (brandBranches.length === 0) return null;
                return (
                  <optgroup key={brand} label={brand}>
                    {brandBranches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </InputRow>
          {msg && <div className="col-span-2 text-sm text-red-600">{msg}</div>}
          <div className="col-span-2 flex gap-2">
            <Btn type="submit" disabled={saving}>{saving ? "Saving…" : "Add"}</Btn>
            <Btn variant="ghost" type="button" onClick={() => setAdding(false)}>Cancel</Btn>
          </div>
        </form>
      )}

      <div className="overflow-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="w-8" />
              {["Name", "Brand", "Branch", "Status", "Leads", ""].map(h => (
                <th key={h} className={`px-3 py-2.5 text-left text-xs font-semibold text-slate-500${h === "Leads" ? " text-center" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={staff.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {staff.map(s => (
                  <SortableStaffRow
                    key={s.id} s={s}
                    branchLabel={branchLabel(s.branchId)}
                    onEdit={s => { setEditing(s); setEditForm({ name: s.name, branchId: s.branchId, isActive: s.isActive }); setMsg(""); }}
                  />
                ))}
                {staff.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-400">No staff members yet</td></tr>
                )}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
      <p className="text-xs text-slate-400">Drag rows to reorder — order is saved automatically.</p>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h4 className="font-bold text-slate-800">Edit: {editing.name}</h4>
            <InputRow label="Name"><input className={inp()} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></InputRow>
            <InputRow label="Assigned Branch">
              <select className={inp()} value={editForm.branchId ?? ""} onChange={e => setEditForm(f => ({ ...f, branchId: e.target.value ? Number(e.target.value) : null }))}>
                <option value="">All branches (no restriction)</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.brand})</option>
                ))}
              </select>
            </InputRow>
            <InputRow label="Status">
              <select className={inp()} value={String(editForm.isActive)} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.value === "true" }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </InputRow>
            {!editForm.isActive && (editing?.leadCount ?? 0) > 0 && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800">
                <span className="mt-0.5 shrink-0 text-amber-500">⚠️</span>
                <span>This counsellor owns <strong>{editing!.leadCount}</strong> open lead{editing!.leadCount === 1 ? "" : "s"}. Consider reassigning them before deactivating.</span>
              </div>
            )}
            {msg && <div className="text-sm text-red-600">{msg}</div>}
            <div className="flex gap-2">
              <Btn onClick={saveStaff} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
              <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LookupsTab ─────────────────────────────────────────────────
const LOOKUP_SECTIONS: Array<{ key: keyof Lookups; label: string; table: string }> = [
  { key: "programs",     label: "Programs",      table: "programs" },
  { key: "sources",      label: "Sources",       table: "sources" },
  { key: "statuses",     label: "Statuses",      table: "statuses" },
  { key: "closeReasons", label: "Close Reasons", table: "close-reasons" },
];

// ── SortableLookupRow ──────────────────────────────────────────
function SortableLookupRow({ item, onToggle, onRename }: {
  item: LookupItem;
  onToggle: (item: LookupItem) => void;
  onRename: (item: LookupItem, newLabel: string) => Promise<string | null>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.label);
  const [saving, setSaving] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "#f8fafc" : undefined,
  };

  const startEdit = () => {
    setDraft(item.label);
    setEditing(true);
    // focus after render
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(item.label);
    setRenameError(null);
  };

  const save = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === item.label) { cancel(); return; }
    setSaving(true);
    setRenameError(null);
    const err = await onRename(item, trimmed);
    setSaving(false);
    if (err) {
      setRenameError(err);
      // stay in editing mode so the user can correct the label
    } else {
      setEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); save(); }
    if (e.key === "Escape") cancel();
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <DragHandle {...attributes} {...listeners} />
        {editing ? (
          <div className="flex-1 min-w-0">
            <input
              ref={inputRef}
              value={draft}
              onChange={e => { setDraft(e.target.value); setRenameError(null); }}
              onKeyDown={handleKeyDown}
              className={`w-full px-2 py-0.5 text-sm border rounded-md focus:outline-none focus:ring-2 ${renameError ? "border-red-400 focus:ring-red-300" : "border-amber-400 focus:ring-amber-300"}`}
            />
            {renameError && <p className="mt-0.5 text-xs text-red-600">{renameError}</p>}
          </div>
        ) : (
          <span className={`text-sm ${item.isActive ? "text-slate-800" : "text-slate-400 line-through"}`}>{item.label}</span>
        )}
      </div>
      <div className="flex items-center gap-2 ml-2 shrink-0">
        {item.brand && !editing && <span className="text-xs text-slate-400">{item.brand}</span>}
        {editing ? (
          <>
            <button onClick={save} disabled={saving}
              className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition disabled:opacity-50">
              {saving ? "…" : "Save"}
            </button>
            <button onClick={cancel} disabled={saving}
              className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
              Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={startEdit}
              title="Rename"
              className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition">
              ✏ Edit
            </button>
            <button onClick={() => onToggle(item)}
              className={`text-xs font-semibold px-2 py-0.5 rounded-full transition ${item.isActive ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600" : "bg-red-100 text-red-500 hover:bg-green-100 hover:text-green-700"}`}>
              {item.isActive ? "Deactivate" : "Activate"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function LookupSection({ label, items: initialItems, table, token, onRefresh }: {
  label: string; items: LookupItem[]; table: string; token: string; onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<LookupItem[]>(initialItems);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Sync when parent refreshes
  useEffect(() => { setItems(initialItems); }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const toggle = async (item: LookupItem) => {
    await fetch(`/api/walkin/lookups/${table}/${item.id}`, {
      method: "PATCH", headers: hdrs(token), body: JSON.stringify({ isActive: !item.isActive }),
    });
    onRefresh();
  };

  const rename = async (item: LookupItem, newLabel: string): Promise<string | null> => {
    try {
      const r = await fetch(`/api/walkin/lookups/${table}/${item.id}`, {
        method: "PATCH", headers: hdrs(token), body: JSON.stringify({ label: newLabel }),
      });
      if (r.ok) { onRefresh(); return null; }
      const d = await r.json();
      return d.message || "Failed to rename";
    } catch {
      return "Network error";
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newLabel.trim()) return;
    setSaving(true); setMsg("");
    try {
      const r = await fetch(`/api/walkin/lookups/${table}`, {
        method: "POST", headers: hdrs(token), body: JSON.stringify({ label: newLabel.trim(), sortOrder: items.length * 10 }),
      });
      if (r.ok) { setNewLabel(""); setAdding(false); onRefresh(); }
      else { const d = await r.json(); setMsg(d.message || "Failed"); }
    } catch { setMsg("Network error"); }
    setSaving(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    await Promise.all(
      reordered.map((item, idx) =>
        fetch(`/api/walkin/lookups/${table}/${item.id}`, {
          method: "PATCH", headers: hdrs(token),
          body: JSON.stringify({ sortOrder: idx * 10 }),
        }),
      ),
    );
  };

  const active = items.filter(i => i.isActive).length;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-left" onClick={() => setOpen(o => !o)}>
        <span className="font-semibold text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{active}/{items.length} active</span>
          <span className="text-slate-400">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="divide-y divide-slate-100">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map(item => (
                <SortableLookupRow key={item.id} item={item} onToggle={toggle} onRename={rename} />
              ))}
            </SortableContext>
          </DndContext>

          <div className="px-4 py-3 bg-slate-50">
            {adding ? (
              <form onSubmit={add} className="flex items-center gap-2">
                <input className={inp("flex-1")} value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder={`New ${label.slice(0,-1).toLowerCase()} label`} autoFocus />
                <Btn type="submit" small disabled={saving}>{saving ? "…" : "Add"}</Btn>
                <Btn small variant="ghost" onClick={() => { setAdding(false); setMsg(""); }}>Cancel</Btn>
              </form>
            ) : (
              <button onClick={() => setAdding(true)} className="text-xs font-semibold text-blue-600 hover:text-blue-800">+ Add {label.slice(0, -1)}</button>
            )}
            {msg && <div className="mt-1 text-xs text-red-600">{msg}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function LookupsTab({ token }: { token: string }) {
  const [lookups, setLookups] = useState<Lookups>({ programs: [], sources: [], statuses: [], closeReasons: [] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/walkin/lookups?includeInactive=true", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setLookups({ programs: d.programs, sources: d.sources, statuses: d.statuses, closeReasons: d.closeReasons });
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="text-sm text-slate-400 p-4">Loading…</div>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">Toggle items on/off or add new values. Changes take effect immediately on the kiosk forms.</p>
      {LOOKUP_SECTIONS.map(s => (
        <LookupSection key={s.key} label={s.label} items={lookups[s.key]} table={s.table} token={token} onRefresh={load} />
      ))}
    </div>
  );
}

// ── PDF export helper ──────────────────────────────────────────
async function downloadQRPdf(branches: Branch[], layout: "1up" | "2up" = "1up") {
  const { jsPDF } = await import("jspdf");

  const PAGE_W = 210; // A4 mm
  const PAGE_H = 297;
  const NAV_COLOR: [number, number, number] = [9, 26, 79]; // #091a4f

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Pre-generate all QR data URLs
  const qrDataUrls: string[] = await Promise.all(
    branches.map(branch => {
      const brandSlug = branch.brand.toLowerCase();
      const kioskUrl = `${window.location.origin}/walkin-${brandSlug}-27-28/${branch.code}`;
      return QRCode.toDataURL(kioskUrl, {
        width: 600,
        margin: 2,
        color: { dark: "#091a4f", light: "#ffffff" },
      });
    })
  );

  if (layout === "1up") {
    // ── 1-up: one QR per page ──────────────────────────────────
    const QR_SIZE = 120;

    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i];
      if (i > 0) doc.addPage();

      const brandSlug = branch.brand.toLowerCase();
      const kioskUrl = `${window.location.origin}/walkin-${brandSlug}-27-28/${branch.code}`;
      const qrDataUrl = qrDataUrls[i];

      const isRIS = branch.brand === "RIS";
      const brandColor: [number, number, number] = isRIS ? NAV_COLOR : [160, 32, 32];

      // Brand header bar
      doc.setFillColor(...brandColor);
      doc.rect(0, 0, PAGE_W, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(branch.brand, 12, 14);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Rainbow International School  ·  Walk-in Kiosk  ·  AY 2027-28", PAGE_W - 10, 14, { align: "right" });

      // Branch name
      doc.setTextColor(...NAV_COLOR);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(30);
      doc.text(branch.name, PAGE_W / 2, 52, { align: "center" });

      // Subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 120);
      doc.text("Scan to register your visit", PAGE_W / 2, 63, { align: "center" });

      // QR code
      const qrX = (PAGE_W - QR_SIZE) / 2;
      const qrY = 72;
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, QR_SIZE, QR_SIZE);

      // URL label
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 150);
      doc.text(kioskUrl, PAGE_W / 2, qrY + QR_SIZE + 8, { align: "center" });

      // Footer separator
      doc.setDrawColor(220, 220, 230);
      doc.setLineWidth(0.3);
      doc.line(12, PAGE_H - 18, PAGE_W - 12, PAGE_H - 18);
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 175);
      doc.text("Rainbow International School  ·  Walk-in Kiosk", PAGE_W / 2, PAGE_H - 10, { align: "center" });
    }
  } else {
    // ── 2-up: two QRs side-by-side per page ───────────────────
    // Each cell is half the page width
    const CELL_W = PAGE_W / 2; // 105 mm
    const QR_SIZE = 75;
    const HEADER_H = 18;

    for (let pageIdx = 0; pageIdx * 2 < branches.length; pageIdx++) {
      if (pageIdx > 0) doc.addPage();

      for (let slot = 0; slot < 2; slot++) {
        const branchIdx = pageIdx * 2 + slot;
        if (branchIdx >= branches.length) break;

        const branch = branches[branchIdx];
        const brandSlug = branch.brand.toLowerCase();
        const kioskUrl = `${window.location.origin}/walkin-${brandSlug}-27-28/${branch.code}`;
        const qrDataUrl = qrDataUrls[branchIdx];

        const isRIS = branch.brand === "RIS";
        const brandColor: [number, number, number] = isRIS ? NAV_COLOR : [160, 32, 32];
        const cellX = slot * CELL_W;
        const cellCx = cellX + CELL_W / 2;

        // Vertical divider between cells
        if (slot === 1) {
          doc.setDrawColor(220, 220, 230);
          doc.setLineWidth(0.3);
          doc.line(CELL_W, 0, CELL_W, PAGE_H);
        }

        // Brand header bar
        doc.setFillColor(...brandColor);
        doc.rect(cellX, 0, CELL_W, HEADER_H, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(branch.brand, cellX + 8, 12);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text("Walk-in Kiosk · AY 2027-28", cellX + CELL_W - 6, 12, { align: "right" });

        // Branch name
        doc.setTextColor(...NAV_COLOR);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text(branch.name, cellCx, HEADER_H + 22, { align: "center" });

        // Subtitle
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 120);
        doc.text("Scan to register your visit", cellCx, HEADER_H + 32, { align: "center" });

        // QR code — centred horizontally, placed below the subtitle
        const qrX = cellX + (CELL_W - QR_SIZE) / 2;
        const qrY = HEADER_H + 38;
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, QR_SIZE, QR_SIZE);

        // URL label
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        doc.setTextColor(130, 130, 150);
        // Truncate long URLs gracefully inside 95mm
        doc.text(kioskUrl, cellCx, qrY + QR_SIZE + 7, { align: "center", maxWidth: CELL_W - 10 });

        // Footer note at bottom of cell
        doc.setFontSize(7);
        doc.setTextColor(170, 170, 185);
        doc.text("Rainbow International School", cellCx, PAGE_H - 8, { align: "center" });
      }

      // Horizontal footer line
      doc.setDrawColor(220, 220, 230);
      doc.setLineWidth(0.3);
      doc.line(6, PAGE_H - 14, PAGE_W - 6, PAGE_H - 14);
    }
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`ris-qr-codes-${layout}-${timestamp}.pdf`);
}

// ── QRCodesTab ─────────────────────────────────────────────────
function QRCard({ branch, token }: { branch: Branch; token: string }) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const brandSlug = branch.brand.toLowerCase();
  const kioskUrl = `${window.location.origin}/walkin-${brandSlug}-27-28/${branch.code}`;

  useEffect(() => {
    QRCode.toDataURL(kioskUrl, { width: 280, margin: 2, color: { dark: "#091a4f", light: "#ffffff" } })
      .then(setDataUrl).catch(() => {});
  }, [kioskUrl]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${branch.brand.toLowerCase()}-${branch.code}.png`;
    a.click();
  };

  return (
    <div className={`bg-white border rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm ${!branch.isActive ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-2 self-start">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${branch.brand === "RIS" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>{branch.brand}</span>
        {!branch.isActive && <span className="text-xs text-slate-400">Inactive</span>}
      </div>
      <div className="font-bold text-slate-800 self-start">{branch.name}</div>
      {dataUrl ? (
        <img src={dataUrl} alt={`QR for ${branch.name}`} className="w-40 h-40 rounded-lg border border-slate-100" />
      ) : (
        <div className="w-40 h-40 bg-slate-100 rounded-lg animate-pulse" />
      )}
      <div className="text-xs text-slate-400 text-center font-mono break-all">{kioskUrl}</div>
      <button onClick={download} disabled={!dataUrl}
        className="w-full py-2 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition disabled:opacity-40 text-slate-700">
        ↓ Download PNG
      </button>
    </div>
  );
}

function QRCodesTab({ token }: { token: string }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "RIS" | "RPS">("all");
  const [pdfLayout, setPdfLayout] = useState<"1up" | "2up">("1up");
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/walkin/branches?active=false", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setBranches).finally(() => setLoading(false));
  }, [token]);

  const printAll = () => window.print();

  const shown = filter === "all" ? branches : branches.filter(b => b.brand === filter);

  const handleDownloadPdf = async () => {
    if (shown.length === 0 || pdfGenerating) return;
    setPdfGenerating(true);
    try {
      await downloadQRPdf(shown, pdfLayout);
    } finally {
      setPdfGenerating(false);
    }
  };

  if (loading) return <div className="text-sm text-slate-400 p-4">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2">
          {(["all", "RIS", "RPS"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filter === f ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              style={filter === f ? { background: NAV } : {}}>
              {f === "all" ? "All Branches" : f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {/* Layout toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden text-xs font-bold">
            {(["1up", "2up"] as const).map(layout => (
              <button
                key={layout}
                onClick={() => setPdfLayout(layout)}
                className={`px-3 py-2 transition ${pdfLayout === layout ? "text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                style={pdfLayout === layout ? { background: NAV } : {}}
                title={layout === "1up" ? "One QR per page (large)" : "Two QRs per page (saves paper)"}
              >
                {layout === "1up" ? "1-up" : "2-up"}
              </button>
            ))}
          </div>
          <Btn variant="ghost" onClick={handleDownloadPdf} disabled={pdfGenerating || shown.length === 0}>
            {pdfGenerating ? "Generating…" : "⬇ Download PDF"}
          </Btn>
          <Btn variant="ghost" onClick={printAll}>🖨 Print All</Btn>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="text-sm text-slate-400 text-center py-8">No branches to display. Add branches in the Branches tab first.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3">
          {shown.map(b => <QRCard key={b.id} branch={b} token={token} />)}
        </div>
      )}
    </div>
  );
}

// ── InstantSyncSetup (Apps Script section) ─────────────────────
function InstantSyncSetup() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"RIS" | "RPS" | "MASTER" | null>(null);

  const webhookUrl = `${window.location.origin}/api/walkin/sheets/pull-hook`;

  const makeScript = (brand: "RIS" | "RPS" | "MASTER") => {
    const colGuard = brand === "MASTER"
      ? "if (col < 13 || col > 18) return; // Green cols M–R only"
      : "if (col < 12 || col > 17) return; // Green cols L–Q only";
    return `// Paste this in Google Apps Script for the ${brand === "MASTER" ? "Master MIS" : brand} sheet
// Extensions → Apps Script → paste → save → set up trigger (see steps below)

var WEBHOOK_URL = "${webhookUrl}";
var ADMIN_TOKEN = "PASTE_YOUR_ADMIN_TOKEN_HERE";
var BRAND       = "${brand}";

function onEditInstallable(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (sheet.getName() !== "WALKINs") return;
  var col = e.range.getColumn();
  ${colGuard}

  try {
    UrlFetchApp.fetch(WEBHOOK_URL, {
      method          : "post",
      contentType     : "application/json",
      headers         : { "x-admin-token": ADMIN_TOKEN },
      payload         : JSON.stringify({ brand: BRAND }),
      muteHttpExceptions: true
    });
  } catch (err) {
    // Silent — 1-min background poll is the fallback
  }
}`;
  };

  const copy = (brand: "RIS" | "RPS" | "MASTER") => {
    navigator.clipboard.writeText(makeScript(brand));
    setCopied(brand);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="border border-emerald-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-emerald-50 hover:bg-emerald-100 transition text-left"
      >
        <div>
          <span className="font-semibold text-emerald-800 text-sm">⚡ Instant Sync Setup</span>
          <span className="ml-2 text-xs text-emerald-600 hidden sm:inline">One-time Apps Script setup for zero lag</span>
        </div>
        <span className="text-emerald-600 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="p-5 space-y-5 bg-white border-t border-emerald-100">
          <p className="text-sm text-slate-600">
            Install this script once in each sheet. Every time a counsellor edits a green column
            (Status, Dates, Remarks) the server is called <strong>immediately</strong> — no polling delay.
            The 1-minute background pull stays active as a fallback.
          </p>

          {/* Webhook URL */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Webhook URL</div>
            <div className="bg-slate-100 rounded-lg px-3 py-2 font-mono text-xs text-slate-700 break-all select-all">
              {webhookUrl}
            </div>
          </div>

          {/* Token note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            <strong>Before you paste:</strong> open the <strong>Replit Secrets panel</strong>, copy the value of{" "}
            <code className="bg-amber-100 px-1 rounded">ADMIN_TOKEN</code>, and replace{" "}
            <code className="bg-amber-100 px-1 rounded">PASTE_YOUR_ADMIN_TOKEN_HERE</code> in the script with it.
          </div>

          {/* One script block per sheet */}
          {(["RIS", "RPS", "MASTER"] as const).map(brand => {
            const label = brand === "MASTER" ? "Master MIS sheet" : `${brand} sheet`;
            const badgeClass = brand === "RIS"
              ? "bg-blue-100 text-blue-700"
              : brand === "RPS"
              ? "bg-red-100 text-red-700"
              : "bg-purple-100 text-purple-700";
            return (
              <div key={brand}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                    {label}
                  </span>
                  <button
                    onClick={() => copy(brand)}
                    className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    {copied === brand ? "✓ Copied!" : "Copy script"}
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed">
                  {makeScript(brand)}
                </pre>
              </div>
            );
          })}

          {/* Install steps */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">How to install (once per sheet)</div>
            <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
              <li>Open the <strong>RIS</strong> Google Sheet → <strong>Extensions → Apps Script</strong></li>
              <li>Delete any existing code, paste the <strong>RIS script</strong> above (token filled in), press <strong>Ctrl + S</strong></li>
              <li>Click <strong>Run → onEditInstallable</strong> once and approve the Google permission prompt</li>
              <li>Click the <strong>⏱ Triggers</strong> icon → <strong>+ Add Trigger</strong> · function = <code className="bg-slate-100 px-1 rounded">onEditInstallable</code> · event = <strong>On edit</strong> → <strong>Save</strong></li>
              <li>Repeat steps 1–4 for the <strong>RPS</strong> sheet using the RPS script</li>
              <li>Repeat steps 1–4 for the <strong>Master MIS</strong> sheet using the Master MIS script</li>
            </ol>
          </div>

          {/* Master sheet permissions note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-900">
            <strong>Master MIS sheet permissions</strong>
            <p className="mt-1 text-blue-800">
              Columns A–L are auto-populated by the sync system and are protected with a warning prompt on every resync.
              Green columns M–R (Status, Dates, Remarks) remain editable for MIS staff.
            </p>
            <p className="mt-2 text-blue-800">
              To restrict who can edit the Master sheet at all, open the sheet → <strong>Share</strong> and set
              branch counsellors to <strong>Viewer</strong> so they cannot accidentally change the Master.
              Only the MIS team (who updates Status/Remarks) should have <strong>Editor</strong> access.
              RIS and RPS branch sheets should be shared as <strong>Editor</strong> with their respective branch staff.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SheetsSyncTab ──────────────────────────────────────────────
interface LeadChange {
  leadId: string;
  parentName: string;
  field: string;
  oldVal: string | null;
  newVal: string | null;
}
interface PullLogEntry {
  timestamp: string; brand: string;
  rowsScanned: number; changesApplied: number; errors: string[];
  changes: LeadChange[];
}

function MasterDeletionSync({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ message: string; archived: number; details: Array<{ leadId: string; brand: string; parentName: string }>; errors: string[] } | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const run = async () => {
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/walkin/sheets/sync-master-deletions", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      setResult(d);
    } catch {
      setResult({ message: "✗ Network error", archived: 0, details: [], errors: ["Network error"] });
    }
    setBusy(false);
    setConfirmed(false);
  };

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-2xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5">🗑️</span>
        <div>
          <h4 className="font-bold text-amber-900">Sync deletions from Master MIS</h4>
          <p className="text-xs text-amber-800 mt-1">
            If you manually deleted rows from the Master MIS WALKINs tab, use this to archive those leads in the DB and brand sheets.
            The system doesn't detect row deletions automatically — this must be triggered manually.
          </p>
          <p className="text-xs text-amber-700 mt-1 font-semibold">
            ⚠ This permanently archives any DB lead not currently listed in the Master sheet. Only run after intentionally deleting rows there.
          </p>
        </div>
      </div>

      {!result && (
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-amber-800 cursor-pointer select-none">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="accent-amber-600" />
            I intentionally deleted rows from Master MIS and want to archive those leads
          </label>
        </div>
      )}

      {!result ? (
        <button
          onClick={run}
          disabled={busy || !confirmed}
          className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition disabled:opacity-40"
          style={{ background: "#b45309" }}>
          {busy ? "Checking Master sheet…" : "Archive missing leads"}
        </button>
      ) : (
        <div className={`rounded-xl p-4 space-y-2 ${result.archived > 0 ? "bg-white border border-amber-300" : "bg-green-50 border border-green-200"}`}>
          <p className={`text-sm font-semibold ${result.archived > 0 ? "text-amber-800" : "text-green-700"}`}>{result.message}</p>
          {result.details.length > 0 && (
            <ul className="text-xs text-slate-600 space-y-0.5">
              {result.details.map(d => (
                <li key={d.leadId} className="font-mono">
                  {d.leadId} · {d.brand} · {d.parentName || "—"}
                </li>
              ))}
            </ul>
          )}
          {result.errors.length > 0 && (
            <div className="text-xs text-red-600 space-y-0.5">
              {result.errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
          <button onClick={() => { setResult(null); setConfirmed(false); }}
            className="text-xs underline text-amber-700 hover:text-amber-900">Reset</button>
        </div>
      )}
    </div>
  );
}

function SheetsSyncTab({ token }: { token: string }) {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [resyncing, setResyncing] = useState<Record<string, boolean>>({});
  const [resyncMsg, setResyncMsg] = useState<Record<string, string>>({});
  const [pullLog, setPullLog] = useState<PullLogEntry[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pullResult, setPullResult] = useState<string>("");
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const [sr, lr] = await Promise.all([
        fetch("/api/walkin/sheets/status",   { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/walkin/sheets/pull-log", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (sr.ok) setStatus(await sr.json());
      if (lr.ok) setPullLog(await lr.json());
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const resync = async (key: "RIS" | "RPS") => {
    setResyncing(r => ({ ...r, [key]: true }));
    setResyncMsg(m => ({ ...m, [key]: "" }));
    try {
      const r = await fetch(`/api/walkin/sheets/resync?brand=${key}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setResyncMsg(m => ({ ...m, [key]: r.ok ? `✓ ${d.message}` : `✗ ${d.message}` }));
      if (r.ok) loadStatus();
    } catch { setResyncMsg(m => ({ ...m, [key]: "✗ Network error" })); }
    setResyncing(r => ({ ...r, [key]: false }));
  };

  const resyncMaster = async () => {
    setResyncing(r => ({ ...r, MASTER: true }));
    setResyncMsg(m => ({ ...m, MASTER: "" }));
    try {
      const r = await fetch("/api/walkin/sheets/resync-master", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setResyncMsg(m => ({ ...m, MASTER: r.ok ? `✓ ${d.message}` : `✗ ${d.message}` }));
      if (r.ok) loadStatus();
    } catch { setResyncMsg(m => ({ ...m, MASTER: "✗ Network error" })); }
    setResyncing(r => ({ ...r, MASTER: false }));
  };

  const triggerPull = async () => {
    setPulling(true);
    setPullResult("");
    try {
      const r = await fetch("/api/walkin/sheets/pull", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (r.ok) {
        const summary = (d.summary as Array<{ brand: string; rowsScanned: number; changesApplied: number; errors: string[] }>)
          .map(s => `${s.brand}: scanned ${s.rowsScanned}, ${s.changesApplied} change(s)${s.errors.length ? `, ${s.errors.length} error(s)` : ""}`)
          .join(" · ");
        setPullResult(`✓ ${summary}`);
        // Reload pull log to show the new entry
        const lr = await fetch("/api/walkin/sheets/pull-log", { headers: { Authorization: `Bearer ${token}` } });
        if (lr.ok) setPullLog(await lr.json());
        setShowLog(true);
      } else {
        setPullResult(`✗ ${d.message ?? "Pull failed"}`);
      }
    } catch { setPullResult("✗ Network error"); }
    setPulling(false);
  };

  const SheetCard = ({
    label, envKey, s, color, onResync, resyncKey,
  }: {
    label: string; envKey: string; s: SheetBrandStatus; color: string;
    onResync: () => void; resyncKey: string;
  }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-lg">{label}</span>
          {s.sheetConfigured ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Sheet ID set</span>
          ) : (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">No sheet ID</span>
          )}
        </div>
        <button onClick={onResync} disabled={resyncing[resyncKey] || !s.sheetConfigured}
          className="text-sm font-semibold px-4 py-1.5 rounded-lg text-white transition disabled:opacity-50"
          style={{ background: color }}>
          {resyncing[resyncKey] ? "Syncing…" : "Re-sync now"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-black" style={{ color }}>{s.dbCount}</div>
          <div className="text-xs text-slate-500 mt-0.5">Leads in DB</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-slate-400">{s.sheetCount}</div>
          <div className="text-xs text-slate-500 mt-0.5">Rows in Sheet</div>
        </div>
      </div>

      {s.dbCount !== s.sheetCount && s.sheetConfigured && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          ⚠ Count mismatch — run Re-sync now to fix
        </div>
      )}

      <div className="text-xs space-y-1 text-slate-500">
        <div>Last sync: {s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleString() : "Never"}</div>
        {s.sheetId && <div>Sheet ID: <span className="font-mono">{s.sheetId}</span></div>}
        {s.lastError && <div className="text-red-600">Last error: {s.lastError}</div>}
      </div>

      {resyncMsg[resyncKey] && (
        <div className={`text-sm rounded-lg px-3 py-2 ${resyncMsg[resyncKey].startsWith("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {resyncMsg[resyncKey]}
        </div>
      )}

      {!s.sheetConfigured && (
        <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
          Set <span className="font-mono">{envKey}</span> in environment to enable sync.
        </div>
      )}
    </div>
  );

  if (loading) return <div className="text-sm text-slate-400 p-4">Loading…</div>;
  if (!status) return <div className="text-sm text-red-600 p-4">Failed to load sync status</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Mirror all leads to Google Sheets for read-only access by the team.</p>
        <button onClick={loadStatus} className="text-xs text-slate-400 hover:text-slate-600 underline">Refresh</button>
      </div>

      {!status.googleConfigured && (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Google OAuth not configured. <span className="font-mono">GOOGLE_REFRESH_TOKEN</span> is missing.
        </div>
      )}
      <div className={`text-xs rounded-xl border px-4 py-3 ${
        status.credentialSource === "encrypted"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : status.credentialSource === "legacy"
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-slate-200 bg-slate-50 text-slate-600"
      }`}>
        <span className="font-semibold">Google credential:</span>{" "}
        {status.credentialSource === "encrypted"
          ? "Encrypted server credential active"
          : status.credentialSource === "legacy"
            ? "Legacy secret active — keep it until encrypted storage has been verified"
            : "Not configured"}
      </div>

      {/* Per-brand sheets */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Brand Sheets</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SheetCard label="RIS" envKey="RIS_WALKIN_SHEET_ID_2728" s={status.RIS} color="#091a4f"
            onResync={() => resync("RIS")} resyncKey="RIS" />
          <SheetCard label="RPS" envKey="RPS_WALKIN_SHEET_ID_2728" s={status.RPS} color="#c0392b"
            onResync={() => resync("RPS")} resyncKey="RPS" />
        </div>
      </div>

      {/* Master combined sheet */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Master Sheet (RIS + RPS combined)</h4>
        <p className="text-xs text-slate-500 mb-3">All leads from both schools in one sheet. Includes a "Brand" column so you can filter by school.</p>
        <SheetCard label="Master" envKey="MASTER_WALKIN_SHEET_ID_2728" s={status.MASTER} color="#475569"
          onResync={resyncMaster} resyncKey="MASTER" />
      </div>

      {/* ── Sync deletions from Master ────────────────────────── */}
      <MasterDeletionSync token={token} />

      {/* ── Instant Sync (Apps Script) ─────────────────────────── */}
      <InstantSyncSetup />

      {/* Sheet → DB pull log */}
      <div>
        <div className="flex items-start justify-between mb-2 gap-3">
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sheet → DB Auto-Pull Log</h4>
            <p className="text-xs text-slate-500 mt-0.5">Every 1 min the system reads green columns from RIS, RPS, <strong>and Master MIS</strong> sheets — writing changes to the DB and back-propagating Master edits to the matching brand sheet. With the Apps Script above, changes sync instantly.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={triggerPull}
              disabled={pulling}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {pulling ? "Pulling…" : "Pull now"}
            </button>
            <button onClick={() => setShowLog(l => !l)} className="text-xs text-slate-500 underline hover:text-slate-700">
              {showLog ? "Hide" : "Show"} log ({pullLog.length})
            </button>
          </div>
        </div>

        {pullResult && (
          <div className={`text-xs rounded-lg px-3 py-2 mb-2 ${pullResult.startsWith("✓") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {pullResult}
          </div>
        )}

        {showLog && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {pullLog.length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-6">No pull runs yet — first run in ~30 s after server start.</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["Time", "Brand", "Scanned", "Changes", "Errors", ""].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pullLog.map((entry, i) => {
                    const isExpanded = expandedLog === i;
                    const hasDetail = entry.changes?.length > 0 || entry.errors.length > 0;
                    return (
                      <>
                        <tr
                          key={`row-${i}`}
                          className={`border-b border-slate-100 ${entry.errors.length > 0 ? "bg-red-50" : ""} ${hasDetail ? "cursor-pointer hover:bg-slate-50" : ""}`}
                          onClick={() => hasDetail && setExpandedLog(isExpanded ? null : i)}
                        >
                          <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                            {new Date(entry.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${entry.brand === "RIS" ? "bg-blue-100 text-blue-700" : entry.brand === "MASTER" ? "bg-purple-100 text-purple-700" : "bg-red-100 text-red-700"}`}>
                              {entry.brand}
                            </span>
                          </td>
                          <td className="px-3 py-2 tabular-nums">{entry.rowsScanned}</td>
                          <td className="px-3 py-2 tabular-nums font-semibold" style={{ color: entry.changesApplied > 0 ? "#059669" : undefined }}>
                            {entry.changesApplied}
                          </td>
                          <td className="px-3 py-2 text-red-600 max-w-[180px] truncate" title={entry.errors.join("; ")}>
                            {entry.errors.length > 0 ? entry.errors[0] : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-3 py-2 text-slate-400 text-right whitespace-nowrap">
                            {hasDetail ? (isExpanded ? "▲" : "▼") : null}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`detail-${i}`} className="border-b border-slate-100 bg-slate-50">
                            <td colSpan={6} className="px-4 py-3">
                              {entry.changes?.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Updated leads</div>
                                  <div className="space-y-1">
                                    {entry.changes.map((c, ci) => (
                                      <div key={ci} className="flex items-center gap-2 text-[11px]">
                                        <span className="font-mono text-slate-400 shrink-0">#{c.leadId}</span>
                                        <span className="font-semibold text-slate-700 shrink-0">{c.parentName || "—"}</span>
                                        <span className="text-slate-500 shrink-0">{c.field}:</span>
                                        <span className="text-red-500 line-through shrink-0">{c.oldVal ?? "—"}</span>
                                        <span className="text-slate-400 shrink-0">→</span>
                                        <span className="text-emerald-700 font-semibold shrink-0">{c.newVal ?? "—"}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {entry.errors.length > 0 && (
                                <div>
                                  <div className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-1.5">Errors</div>
                                  <div className="space-y-0.5">
                                    {entry.errors.map((e, ei) => (
                                      <div key={ei} className="text-[11px] text-red-600">{e}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Admin Panel ───────────────────────────────────────────
type Tab = "branches" | "staff" | "lookups" | "qr" | "sheets";
const TABS: Array<{ key: Tab; label: string }> = [
  { key: "branches", label: "Branches" },
  { key: "staff",    label: "Staff" },
  { key: "lookups",  label: "Lookups" },
  { key: "qr",       label: "QR Codes" },
  { key: "sheets",   label: "Sheets Sync" },
];

function AdminPanel({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("branches");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="text-white px-6 py-4 flex items-center justify-between" style={{ background: NAV }}>
        <div>
          <div className="font-black text-lg">Walk-in Admin · AY 2027-28</div>
          <div className="text-xs opacity-70">Branches · Staff · Lookups · QR Codes · Sheets Sync</div>
        </div>
        <button onClick={onLogout} className="text-xs text-white/70 hover:text-white underline">Logout</button>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-slate-200 px-6 flex gap-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${tab === t.key ? "border-amber-400 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {tab === "branches" && <BranchesTab token={token} />}
        {tab === "staff"    && <StaffTab token={token} />}
        {tab === "lookups"  && <LookupsTab token={token} />}
        {tab === "qr"       && <QRCodesTab token={token} />}
        {tab === "sheets"   && <SheetsSyncTab token={token} />}
      </div>
    </div>
  );
}

// ── Page export ────────────────────────────────────────────────
export default function WalkinAdmin2728() {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let mounted = true;
    void restorePageSession("panel").then(restored => {
      if (mounted) { setToken(restored); setChecking(false); }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
  }, []);

  if (checking) return <div className="min-h-screen" style={{ background: NAV }} />;
  if (!token) {
    return <AdminGate onSuccess={t => setToken(t)} />;
  }

  return (
    <AdminPanel
      token={token}
      onLogout={() => {
        forgetPageSession("panel");
        setToken(null);
      }}
    />
  );
}
