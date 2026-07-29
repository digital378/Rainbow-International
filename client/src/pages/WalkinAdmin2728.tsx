/**
 * Admin Panel — Walk-in 27-28
 * Route: /admin/walkin-2728
 * Protected by ADMIN_TOKEN (same mechanism as WalkinLeads)
 *
 * Tabs:
 *  1. Branches     — CRUD for walkin_branches
 *  2. Staff        — CRUD for walkin_staff (Lead Owner dropdown)
 *  3. Lookups      — Programs / Sources / Statuses / Close Reasons
 *  4. QR Codes     — Per-branch kiosk QR codes with download
 *  5. Sheets Sync  — Google Sheets sync status & resync
 */

import { useState, useEffect, useCallback, useRef } from "react";
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
const ADMIN_AUTH_KEY = "ris_admin_auth";
const NAV = "#091a4f";

// ── Types ──────────────────────────────────────────────────────
interface Branch {
  id: number; name: string; brand: string; code: string;
  pin: string; isActive: boolean; createdAt: string;
}
interface StaffMember {
  id: number; name: string; brand: string | null;
  isActive: boolean; sortOrder: number;
}
interface LookupItem {
  id: number; label: string; brand: string | null;
  sortOrder: number; isActive: boolean;
}
interface Lookups {
  programs: LookupItem[]; sources: LookupItem[];
  statuses: LookupItem[]; closeReasons: LookupItem[];
}
interface SyncStatus {
  googleConfigured: boolean;
  RIS: { sheetConfigured: boolean; sheetId: string | null; lastSyncAt: string | null; dbCount: number; sheetCount: number; lastError: string | null };
  RPS: { sheetConfigured: boolean; sheetId: string | null; lastSyncAt: string | null; dbCount: number; sheetCount: number; lastError: string | null };
}

// ── Helpers ────────────────────────────────────────────────────
function getSavedToken() {
  try { return sessionStorage.getItem(ADMIN_AUTH_KEY) || ""; } catch { return ""; }
}

function hdrs(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// ── AdminGate ──────────────────────────────────────────────────
function AdminGate({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    try {
      // Probe an admin-only endpoint so any non-empty token is not accepted
      const res = await fetch("/api/walkin/sheets/status", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        try { sessionStorage.setItem(ADMIN_AUTH_KEY, token); } catch {}
        onSuccess(token);
      } else { setError(true); }
    } catch { setError(true); }
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">Admin token</label>
        <input ref={ref} type="password" value={token} onChange={e => { setToken(e.target.value); setError(false); }}
          className={`w-full px-4 py-3 rounded-lg border-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? "border-red-400 bg-red-50" : "border-slate-200"}`}
          placeholder="Enter admin token" />
        {error && <div className="mt-2 text-sm text-red-600">Invalid token</div>}
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

function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
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
  const [form, setForm] = useState({ name: "", brand: "RIS", code: "", pin: "1234" });
  const [editForm, setEditForm] = useState({ name: "", pin: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

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
      if (r.ok) { setAdding(false); setForm({ name: "", brand: "RIS", code: "", pin: "1234" }); load(); }
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
    setEditForm({ name: b.name, pin: b.pin, isActive: b.isActive });
    setMsg("");
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
          <InputRow label="Code (URL slug, lowercase)">
            <input className={inp()} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} required placeholder="brahmand" />
          </InputRow>
          <InputRow label="Kiosk PIN (4-8 digits)">
            <input className={inp()} value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))} required placeholder="1234" maxLength={8} />
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
              {["Name", "Brand", "Code", "PIN", "Status", "Kiosk URL", ""].map(h => (
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
                <td className="px-3 py-2.5 font-mono text-xs">{b.pin}</td>
                <td className="px-3 py-2.5"><Badge active={b.isActive} /></td>
                <td className="px-3 py-2.5 text-xs text-slate-400 max-w-[160px] truncate">
                  /walkin-{b.brand.toLowerCase()}-27-28/{b.code}
                </td>
                <td className="px-3 py-2.5">
                  <Btn small variant="ghost" onClick={() => startEdit(b)}>Edit</Btn>
                </td>
              </tr>
            ))}
            {branches.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-400">No branches yet</td></tr>
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
            <InputRow label="PIN">
              <input className={inp()} value={editForm.pin} onChange={e => setEditForm(f => ({ ...f, pin: e.target.value }))} maxLength={8} />
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
function SortableStaffRow({ s, onEdit }: {
  s: StaffMember;
  onEdit: (s: StaffMember) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "#f8fafc" : undefined,
  };
  return (
    <tr ref={setNodeRef} style={style} className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-1 py-2.5 w-8">
        <DragHandle {...attributes} {...listeners} />
      </td>
      <td className="px-3 py-2.5 font-medium">{s.name}</td>
      <td className="px-3 py-2.5 text-xs text-slate-500">{s.brand ?? "Both"}</td>
      <td className="px-3 py-2.5"><Badge active={s.isActive} /></td>
      <td className="px-3 py-2.5">
        <Btn small variant="ghost" onClick={() => onEdit(s)}>Edit</Btn>
      </td>
    </tr>
  );
}

// ── StaffTab ───────────────────────────────────────────────────
function StaffTab({ token }: { token: string }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", brand: "" as "" | "RIS" | "RPS" });
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState({ name: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/walkin/staff", { headers: { Authorization: `Bearer ${token}` } });
      setStaff(await r.json());
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const addStaff = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg("");
    try {
      const body = { name: form.name, brand: form.brand || null, sortOrder: staff.length * 10 };
      const r = await fetch("/api/walkin/staff", { method: "POST", headers: hdrs(token), body: JSON.stringify(body) });
      if (r.ok) { setAdding(false); setForm({ name: "", brand: "" }); load(); }
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
            <input className={inp()} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Staff name" />
          </InputRow>
          <InputRow label="Brand (leave blank for both)">
            <select className={inp()} value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value as any }))}>
              <option value="">Both (RIS + RPS)</option>
              <option value="RIS">RIS only</option>
              <option value="RPS">RPS only</option>
            </select>
          </InputRow>
          {msg && <div className="col-span-2 text-sm text-red-600">{msg}</div>}
          <div className="col-span-2 flex gap-2">
            <Btn type="submit" disabled={saving}>{saving ? "Saving…" : "Add"}</Btn>
            <Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
          </div>
        </form>
      )}

      <div className="overflow-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="w-8" />
              {["Name", "Brand", "Status", ""].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={staff.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {staff.map(s => (
                  <SortableStaffRow
                    key={s.id} s={s}
                    onEdit={s => { setEditing(s); setEditForm({ name: s.name, isActive: s.isActive }); setMsg(""); }}
                  />
                ))}
                {staff.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400">No staff members yet</td></tr>
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
            <InputRow label="Status">
              <select className={inp()} value={String(editForm.isActive)} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.value === "true" }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </InputRow>
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
function SortableLookupRow({ item, onToggle }: { item: LookupItem; onToggle: (item: LookupItem) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "#f8fafc" : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50">
      <div className="flex items-center gap-2">
        <DragHandle {...attributes} {...listeners} />
        <span className={`text-sm ${item.isActive ? "text-slate-800" : "text-slate-400 line-through"}`}>{item.label}</span>
      </div>
      <div className="flex items-center gap-3">
        {item.brand && <span className="text-xs text-slate-400">{item.brand}</span>}
        <button onClick={() => onToggle(item)}
          className={`text-xs font-semibold px-2 py-0.5 rounded-full transition ${item.isActive ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600" : "bg-red-100 text-red-500 hover:bg-green-100 hover:text-green-700"}`}>
          {item.isActive ? "Deactivate" : "Activate"}
        </button>
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
                <SortableLookupRow key={item.id} item={item} onToggle={toggle} />
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

  useEffect(() => {
    fetch("/api/walkin/branches?active=false", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setBranches).finally(() => setLoading(false));
  }, [token]);

  const printAll = () => window.print();

  const shown = filter === "all" ? branches : branches.filter(b => b.brand === filter);

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
        <Btn variant="ghost" onClick={printAll}>🖨 Print All</Btn>
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

// ── SheetsSyncTab ──────────────────────────────────────────────
function SheetsSyncTab({ token }: { token: string }) {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [resyncing, setResyncing] = useState<Record<string, boolean>>({});
  const [resyncMsg, setResyncMsg] = useState<Record<string, string>>({});

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/walkin/sheets/status", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setStatus(await r.json());
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const resync = async (brand: "RIS" | "RPS") => {
    setResyncing(r => ({ ...r, [brand]: true }));
    setResyncMsg(m => ({ ...m, [brand]: "" }));
    try {
      const r = await fetch(`/api/walkin/sheets/resync?brand=${brand}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setResyncMsg(m => ({ ...m, [brand]: r.ok ? `✓ ${d.message}` : `✗ ${d.message}` }));
      if (r.ok) loadStatus();
    } catch { setResyncMsg(m => ({ ...m, [brand]: "✗ Network error" })); }
    setResyncing(r => ({ ...r, [brand]: false }));
  };

  const BrandCard = ({ brand }: { brand: "RIS" | "RPS" }) => {
    if (!status) return null;
    const s = status[brand];
    const accentColor = brand === "RIS" ? "#091a4f" : "#c0392b";
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-lg">{brand}</span>
            {s.sheetConfigured ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Sheet ID set</span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">No sheet ID</span>
            )}
          </div>
          <button onClick={() => resync(brand)} disabled={resyncing[brand] || !s.sheetConfigured}
            className="text-sm font-semibold px-4 py-1.5 rounded-lg text-white transition disabled:opacity-50"
            style={{ background: accentColor }}>
            {resyncing[brand] ? "Syncing…" : "Re-sync now"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-black" style={{ color: accentColor }}>{s.dbCount}</div>
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

        {resyncMsg[brand] && (
          <div className={`text-sm rounded-lg px-3 py-2 ${resyncMsg[brand].startsWith("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {resyncMsg[brand]}
          </div>
        )}

        {!s.sheetConfigured && (
          <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
            Set <span className="font-mono">{brand}_WALKIN_SHEET_ID_2728</span> in Replit Secrets to enable sync.
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="text-sm text-slate-400 p-4">Loading…</div>;
  if (!status) return <div className="text-sm text-red-600 p-4">Failed to load sync status</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Mirror all leads to Google Sheets for read-only access by the team.</p>
        <button onClick={loadStatus} className="text-xs text-slate-400 hover:text-slate-600 underline">Refresh</button>
      </div>

      {!status.googleConfigured && (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Google OAuth not configured. <span className="font-mono">GOOGLE_REFRESH_TOKEN</span> is missing.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BrandCard brand="RIS" />
        <BrandCard brand="RPS" />
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
  const [token, setToken] = useState<string | null>(() => getSavedToken() || null);

  if (!token) {
    return <AdminGate onSuccess={t => setToken(t)} />;
  }

  return (
    <AdminPanel
      token={token}
      onLogout={() => {
        try { sessionStorage.removeItem(ADMIN_AUTH_KEY); } catch {}
        setToken(null);
      }}
    />
  );
}
