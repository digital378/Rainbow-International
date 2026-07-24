import { useState, useEffect, useCallback } from "react";
import { useParams } from "wouter";

const NAVY = "#091a4f";
const AMBER = "#f59e0b";
const GREEN = "#059669";

const GRADES = [
  "Playgroup", "Nursery", "Jr. KG", "Sr. KG",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8",
  "Grade 9", "Grade 10", "Grade 11", "Grade 12",
];

type School = { id: number; name: string };

export default function FriendshipPortal() {
  const { token } = useParams<{ token: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [inactive, setInactive] = useState(false);
  const [tab, setTab] = useState<"manual" | "bulk">("manual");

  // Manual form state
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(0);
  const [manualError, setManualError] = useState("");

  // Bulk upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState(0);
  const [bulkSkipped, setBulkSkipped] = useState(0);
  const [bulkError, setBulkError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    document.title = "Alliances Portal | Rainbow International School";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    fetch(`/api/alliances/friendship/school/${token}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((d: School & { isActive: boolean }) => {
        if (!d.isActive) { setInactive(true); return; }
        setSchool(d);
      })
      .catch(() => setInactive(true));
  }, [token]);

  const resetManual = () => { setStudentName(""); setGrade(""); setParentName(""); setPhone(""); setEmail(""); setManualError(""); };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !grade || !parentName.trim() || !phone.trim()) {
      setManualError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true); setManualError("");
    try {
      const res = await fetch(`/api/alliances/friendship/submit/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: studentName.trim(), grade, parentName: parentName.trim(), phone: phone.trim(), email: email.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Submission failed");
      }
      setManualSuccess(s => s + 1);
      resetManual();
    } catch (err: any) {
      setManualError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const pickFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setBulkError("Only .xlsx files are accepted.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setBulkError("File must be under 2 MB.");
      return;
    }
    setBulkError(""); setFileName(file.name); setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) pickFile(file);
  }, [pickFile]);

  const handleBulkSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true); setBulkError("");
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const res = await fetch(`/api/alliances/friendship/bulk-upload/${token}`, {
        method: "POST",
        body: fd,
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || "Upload failed");
      setBulkSuccess(d.inserted ?? 0);
      setBulkSkipped(d.skipped ?? 0);
      setSelectedFile(null); setFileName("");
    } catch (err: any) {
      setBulkError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (inactive) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: NAVY }}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border-t-4 border-amber-400">
          <div className="text-4xl mb-4">🔒</div>
          <div className="font-black text-lg mb-2" style={{ color: NAVY }}>Link No Longer Active</div>
          <div className="text-sm text-slate-500">This QR code has been deactivated or is invalid. Please contact the RIS Alliances team for an updated QR code.</div>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
        <div className="text-white text-sm opacity-70">Loading portal…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4" style={{ background: NAVY }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-4">
          <div className="h-1.5" style={{ background: AMBER }} />
          <div className="px-6 py-5" style={{ background: NAVY }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0" style={{ background: AMBER, color: NAVY }}>RIS</div>
              <div>
                <div className="font-black text-white text-base leading-tight">Rainbow International School</div>
                <div className="text-xs text-blue-200">Alliances Portal</div>
              </div>
            </div>
            <div className="mt-4 bg-white/10 rounded-xl px-4 py-3">
              <div className="text-xs text-blue-200 uppercase tracking-wide font-semibold">Submitting for</div>
              <div className="text-white font-black text-xl mt-0.5">{school.name}</div>
            </div>
          </div>
        </div>

        {/* Tab selector */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setTab("manual")}
              className={`flex-1 py-3.5 text-sm font-bold transition-colors ${tab === "manual" ? "text-white" : "text-slate-500 hover:text-slate-700"}`}
              style={tab === "manual" ? { background: NAVY } : {}}
              data-testid="tab-manual"
            >
              ➕ Add Individual Lead
            </button>
            <button
              onClick={() => setTab("bulk")}
              className={`flex-1 py-3.5 text-sm font-bold transition-colors ${tab === "bulk" ? "text-white" : "text-slate-500 hover:text-slate-700"}`}
              style={tab === "bulk" ? { background: NAVY } : {}}
              data-testid="tab-bulk"
            >
              📋 Bulk Upload
            </button>
          </div>

          {/* Manual tab */}
          {tab === "manual" && (
            <div className="px-6 py-5">
              {manualSuccess > 0 && (
                <div className="mb-4 p-3 rounded-xl border flex items-center gap-2 text-sm font-semibold" style={{ background: "#dcfce7", borderColor: GREEN, color: GREEN }}>
                  <span>✓</span>
                  <span>{manualSuccess} lead{manualSuccess > 1 ? "s" : ""} submitted successfully. You can add another.</span>
                </div>
              )}
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Student Name *</label>
                  <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)}
                    placeholder="e.g. Aarav Mehta"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                    data-testid="input-student-name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Grade *</label>
                  <select value={grade} onChange={e => setGrade(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition bg-white"
                    data-testid="select-grade">
                    <option value="">Select Grade</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Parent / Guardian Name *</label>
                  <input type="text" value={parentName} onChange={e => setParentName(e.target.value)}
                    placeholder="e.g. Priya Mehta"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                    data-testid="input-parent-name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Phone Number *</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                    data-testid="input-phone" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email <span className="font-normal text-slate-400">(optional)</span></label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. priya@email.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
                    data-testid="input-email" />
                </div>
                {manualError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" data-testid="text-error">{manualError}</div>
                )}
                <button type="submit" disabled={submitting}
                  className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all disabled:opacity-60"
                  style={{ background: submitting ? "#94a3b8" : NAVY, color: "#fff" }}
                  data-testid="button-submit">
                  {submitting ? "Submitting…" : "Submit Lead →"}
                </button>
                <div className="text-center text-xs text-slate-400">
                  Data is recorded securely for admission purposes only.
                </div>
              </form>
            </div>
          )}

          {/* Bulk tab */}
          {tab === "bulk" && (
            <div className="px-6 py-5 space-y-4">
              {bulkSuccess > 0 && (
                <div className="p-3 rounded-xl border flex items-center gap-2 text-sm font-semibold" style={{ background: "#dcfce7", borderColor: GREEN, color: GREEN }}>
                  <span>✓</span>
                  <span>{bulkSuccess} lead{bulkSuccess !== 1 ? "s" : ""} uploaded{bulkSkipped > 0 ? ` · ${bulkSkipped} row${bulkSkipped !== 1 ? "s" : ""} skipped` : ""}!</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-600">Upload Excel File</div>
                <a href="/api/alliances/friendship/template" download="friendship_school_template.xlsx"
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition hover:opacity-80"
                  style={{ borderColor: AMBER, color: AMBER }}
                  data-testid="link-download-template">
                  ⬇ Download Template
                </a>
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
                style={{ borderColor: dragOver ? AMBER : "#cbd5e1", background: dragOver ? "#fffbeb" : "#f8fafc" }}
                onClick={() => document.getElementById("bulk-file-input")?.click()}
                data-testid="dropzone-bulk">
                <div className="text-2xl mb-2">{fileName ? "📄" : "📁"}</div>
                {fileName ? (
                  <div>
                    <div className="text-sm font-bold text-slate-700">{fileName}</div>
                    <div className="text-xs text-slate-400 mt-1">Click or drop to replace</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-semibold text-slate-600">Drag & drop your .xlsx file here</div>
                    <div className="text-xs text-slate-400 mt-1">or click to browse · max 2 MB · max 500 rows</div>
                  </div>
                )}
                <input id="bulk-file-input" type="file" accept=".xlsx" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); e.target.value = ""; }}
                  data-testid="input-file-bulk" />
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span className="text-xs text-slate-700 font-medium truncate">{fileName}</span>
                  <button onClick={() => { setSelectedFile(null); setFileName(""); }} className="ml-auto text-slate-400 hover:text-red-500 text-xs">✕</button>
                </div>
              )}

              {bulkError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" data-testid="text-bulk-error">{bulkError}</div>
              )}

              {selectedFile && (
                <button onClick={handleBulkSubmit} disabled={uploading}
                  className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all disabled:opacity-60"
                  style={{ background: uploading ? "#94a3b8" : GREEN, color: "#fff" }}
                  data-testid="button-upload-confirm">
                  {uploading ? "Uploading…" : "Upload File →"}
                </button>
              )}

              {!selectedFile && !fileName && (
                <div className="text-xs text-slate-400 text-center leading-relaxed">
                  Use the template above to fill student data, then upload the completed .xlsx file here.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
