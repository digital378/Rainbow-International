import { useState, useEffect } from "react";
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

type RAInfo = { id: string; name: string; branch: string };

export default function WalkinForm() {
  const { slug } = useParams<{ slug: string }>();
  const [ra, setRa] = useState<RAInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [parentName, setParentName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");

  useEffect(() => {
    document.title = "Walk-in Check-in | Rainbow International School";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    fetch(`/api/walkin/${slug}/info`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => setRa(d))
      .catch(code => {
        if (code === 404) setNotFound(true);
      });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !studentName.trim() || !grade) {
      setError("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/walkin/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentName: parentName.trim(), studentName: studentName.trim(), grade }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Submission failed");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: NAVY }}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border-t-4 border-amber-400">
          <div className="text-4xl mb-4">🔍</div>
          <div className="font-black text-lg mb-2" style={{ color: NAVY }}>QR Code Not Found</div>
          <div className="text-sm text-slate-500">This QR code is not valid. Please scan the correct QR code at your counsellor's desk.</div>
        </div>
      </div>
    );
  }

  if (!ra) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
        <div className="text-white text-sm opacity-70">Loading…</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: NAVY }}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border-t-4" style={{ borderColor: GREEN }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#dcfce7" }}>
            <svg className="w-8 h-8" fill="none" stroke={GREEN} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="font-black text-xl mb-1" style={{ color: GREEN }}>Check-in Complete!</div>
          <div className="text-sm text-slate-600 mb-4">
            Thank you, <strong>{parentName}</strong>! Your walk-in has been recorded with <strong>{ra.name}</strong>.
          </div>
          <div className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3">
            Your counsellor will be with you shortly.<br />Rainbow International School · {ra.branch}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: NAVY }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border-t-4 border-amber-400 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5" style={{ background: NAVY }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0" style={{ background: AMBER, color: NAVY }}>RIS</div>
            <div>
              <div className="font-black text-white text-base leading-tight">Rainbow International School</div>
              <div className="text-xs text-blue-200">{ra.branch} Branch · Walk-in Check-in</div>
            </div>
          </div>
          <div className="mt-4 bg-white/10 rounded-xl px-4 py-3">
            <div className="text-xs text-blue-200 uppercase tracking-wide font-semibold">You are checking in with</div>
            <div className="text-white font-black text-lg mt-0.5">{ra.name}</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="text-sm font-semibold text-slate-600 mb-1">Please fill your details — takes 15 seconds</div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Parent / Guardian Name *</label>
            <input
              type="text"
              value={parentName}
              onChange={e => setParentName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
              data-testid="input-parent-name"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Child's Name *</label>
            <input
              type="text"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="e.g. Aryan Sharma"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition"
              data-testid="input-student-name"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Enquiry for Grade *</label>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition bg-white"
              data-testid="select-grade"
            >
              <option value="">Select Grade</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" data-testid="text-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all disabled:opacity-60"
            style={{ background: submitting ? "#94a3b8" : NAVY, color: "#fff" }}
            data-testid="button-submit"
          >
            {submitting ? "Submitting…" : "Check In →"}
          </button>

          <div className="text-center text-xs text-slate-400">
            Your details are recorded securely for admission purposes only.
          </div>
        </form>
      </div>
    </div>
  );
}
