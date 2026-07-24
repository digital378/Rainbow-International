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
type ParsedRow = { studentName: string; grade: string; parentName: string; phone: string; email: string; rowIndex: number; error?: string };

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
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState(0);
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

  const parseFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setBulkError("Only .xlsx files are accepted.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setBulkError("File must be under 2 MB.");
      return;
    }
    setFileName(file.name); setBulkError(""); setParsedRows([]); setParseErrors([]);
    const buffer = await file.arrayBuffer();
    const { read, utils } = await import("xlsx");
    const wb = read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: string[][] = utils.sheet_to_json(ws, { header: 1, defval: "" });
    if (rows.length < 2) { setBulkError("Sheet appears empty (no data rows)."); return; }

    const header = rows[0].map((h: unknown) => String(h).trim().toLowerCase());
    const idx = {
      studentName: header.findIndex(h => h.includes("student")),
      grade: header.findIndex(h => h.includes("grade")),
      parentName: header.findIndex(h => h.includes("parent")),
      phone: header.findIndex(h => h.includes("phone") || h.includes("mobile")),
      email: header.findIndex(h => h.includes("email")),
    };
    if (idx.studentName < 0 || idx.grade < 0 || idx.parentName < 0 || idx.phone < 0) {
      setBulkError("Missing required columns. Please use the provided template (Student Name, Grade, Parent Name, Phone).");
      return;
    }

    const valid: ParsedRow[] = [];
    const errors: string[] = [];
    rows.slice(1).forEach((row, i) => {
      const sn = String(row[idx.studentName] ?? "").trim();
      const gr = String(row[idx.grade] ?? "").trim();
      const pn = String(row[idx.parentName] ?? "").trim();
      const ph = String(row[idx.phone] ?? "").trim();
      const em = idx.email >= 0 ? String(row[idx.email] ?? "").trim() : "";
      if (!sn && !pn && !ph) return;
      if (!sn || !gr || !pn || !ph) {
        errors.push(`Row ${i + 2}: missing ${[!sn && "Student Name", !gr && "Grade", !pn && "Parent Name", !ph && "Phone"].filter(Boolean).join(", ")}`);
        return;
      }
      if (ph.replace(/\D/g, "").length < 7) {
        errors.push(`Row ${i + 2}: invalid phone "${ph}"`);
        return;
      }
      valid.push({ studentName: sn, grade: gr, parentName: pn, phone: ph, email: em, rowIndex: i + 2 });
    });

    if (valid.length === 0 && errors.length === 0) { setBulkError("No data rows found in file."); return; }
    setParsedRows(valid); setParseErrors(errors);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleBulkSubmit = async () => {
    if (parsedRows.length === 0) return;
    setUploading(true); setBulkError("");
    try {
      const res = await fetch(`/api/alliances/friendship/bulk-upload/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: parsedRows.map(r => ({ studentName: r.studentName, grade: r.grade, parentName: r.parentName, phone: r.phone, email: r.email })) }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || "Upload failed");
      setBulkSuccess(d.inserted ?? parsedRows.length);
      setParsedRows([]); setParseErrors([]); setFileName("");
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
                  <span>{bulkSuccess} leads uploaded successfully!</span>
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
                <input id="bulk-file-input" type="file" accept=".xlsx,.xls" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) parseFile(f); e.target.value = ""; }}
                  data-testid="input-file-bulk" />
              </div>

              {parseErrors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="text-xs font-bold text-amber-700 mb-1">⚠ {parseErrors.length} row{parseErrors.length > 1 ? "s" : ""} skipped:</div>
                  <ul className="text-xs text-amber-600 space-y-0.5">
                    {parseErrors.map((e, i) => <li key={i}>• {e}</li>)}
                  </ul>
                </div>
              )}

              {parsedRows.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Preview — {parsedRows.length} valid row{parsedRows.length > 1 ? "s" : ""}
                  </div>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-48">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50">
                            {["Student", "Grade", "Parent", "Phone", "Email"].map(h => (
                              <th key={h} className="px-3 py-2 text-left font-bold text-slate-500">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsedRows.slice(0, 10).map((r, i) => (
                            <tr key={i} className="border-t border-slate-100">
                              <td className="px-3 py-2 font-medium text-slate-700">{r.studentName}</td>
                              <td className="px-3 py-2 text-slate-500">{r.grade}</td>
                              <td className="px-3 py-2 text-slate-700">{r.parentName}</td>
                              <td className="px-3 py-2 text-slate-500">{r.phone}</td>
                              <td className="px-3 py-2 text-slate-400">{r.email || "—"}</td>
                            </tr>
                          ))}
                          {parsedRows.length > 10 && (
                            <tr><td colSpan={5} className="px-3 py-2 text-center text-slate-400">…and {parsedRows.length - 10} more rows</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {bulkError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" data-testid="text-bulk-error">{bulkError}</div>
              )}

              {parsedRows.length > 0 && (
                <button onClick={handleBulkSubmit} disabled={uploading}
                  className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all disabled:opacity-60"
                  style={{ background: uploading ? "#94a3b8" : GREEN, color: "#fff" }}
                  data-testid="button-upload-confirm">
                  {uploading ? "Uploading…" : `Confirm & Upload ${parsedRows.length} Lead${parsedRows.length > 1 ? "s" : ""} →`}
                </button>
              )}

              {!parsedRows.length && !fileName && (
                <div className="text-xs text-slate-400 text-center leading-relaxed">
                  Use the template above to fill student data, then upload the completed file here.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
