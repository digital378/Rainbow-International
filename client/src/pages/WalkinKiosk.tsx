/**
 * AY 2027-28 Walk-in Admissions Kiosk
 * Shared component for RIS (navy) and RPS (red) — zero shared branding.
 * Three screens: Welcome → Capture Form → Confirmation (auto-resets in 6s)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "wouter";
import { normalizePhone } from "@shared/phoneNormalizer";
import { CheckCircle2, ChevronDown, Loader2, AlertTriangle, User, Phone, Mail, CalendarDays, MessageSquare } from "lucide-react";

// ── Brand Config ──────────────────────────────────────────────

const BRAND = {
  RIS: {
    primary: "#10174F",
    light: "#e8ecf8",
    logoSrc: "/images/ris-logo-2.png",
    logoAlt: "Rainbow International School",
    name: "Rainbow International School",
    greeting: "Welcome to Rainbow International School",
    subGreeting: "Let's begin your admissions enquiry.",
    confirmNote: "Our admissions team will be in touch with you shortly.",
    noindexTitle: "RIS Walk-in Enquiry | AY 2027-28",
  },
  RPS: {
    primary: "#CC1A0A",
    light: "#fce8e6",
    logoSrc: "/images/rps-logo-2.png",
    logoAlt: "Rainbow International Pre-School",
    name: "Rainbow International Pre-School",
    greeting: "Welcome to Rainbow International Pre-School",
    subGreeting: "Happy beginnings start here — let's capture your enquiry.",
    confirmNote: "Our admissions team will be in touch with you shortly.",
    noindexTitle: "RPS Walk-in Enquiry | AY 2027-28",
  },
} as const;

type Brand = keyof typeof BRAND;

// ── Types ─────────────────────────────────────────────────────

type Lookups = {
  programs: Array<{ id: number; label: string }>;
  sources: Array<{ id: number; label: string }>;
  staff: Array<{ id: number; name: string }>;
  branches: Array<{ id: number; name: string; code: string }>;
};

type ConfirmedLead = {
  id: string;
  parentName: string;
  childName: string;
  program: string;
  phone: string;
  enquiryDate: string;
  monthLabel: string;
  siblingName?: string;
  siblingProgram?: string;
};

type DuplicateInfo = {
  id: string;
  enquiryDate: string;
  program: string;
  status: string;
};

// ── Shared Helpers ────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateDisplay(d: string): string {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Sub-components ────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const { error, className, ...rest } = props;
  return (
    <div>
      <input
        {...rest}
        className={`w-full px-4 py-4 rounded-xl border-2 text-base font-medium focus:outline-none transition
          ${error ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-slate-500"}
          ${className ?? ""}`}
      />
      {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement> & { placeholder?: string }) {
  const { placeholder, className, children, ...rest } = props;
  return (
    <div className="relative">
      <select
        {...rest}
        className={`w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-slate-500 text-base font-medium focus:outline-none transition appearance-none bg-white ${className ?? ""}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function WalkinKiosk({ brand }: { brand: Brand }) {
  const params = useParams<{ branchCode?: string }>();
  const branchCode = params.branchCode;
  const cfg = BRAND[brand];

  // ── Screen state
  type Screen = "welcome" | "form" | "confirm";
  const [screen, setScreen] = useState<Screen>("welcome");

  // ── Lookups
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [lookupsError, setLookupsError] = useState("");

  // ── Branch / PIN state
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedBranchName, setSelectedBranchName] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  // ── Form state
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");
  const [program, setProgram] = useState("");
  const [source, setSource] = useState("");
  const [leadOwner, setLeadOwner] = useState("");
  const [enquiryDate, setEnquiryDate] = useState(today());
  const [remark, setRemark] = useState("");

  // ── Duplicate detection
  const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null);
  const [duplicateResolution, setDuplicateResolution] = useState<"none" | "continue" | "viewed">("none");
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // ── Sibling state
  const [hasSibling, setHasSibling] = useState(false);
  const [siblingName, setSiblingName] = useState("");
  const [siblingProgram, setSiblingProgram] = useState("");

  // ── Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmedLead, setConfirmedLead] = useState<ConfirmedLead | null>(null);
  const [resetCountdown, setResetCountdown] = useState(6);

  // ── SEO / meta
  useEffect(() => {
    document.title = cfg.noindexTitle;
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
  }, [cfg]);

  // ── Load lookups on mount
  useEffect(() => {
    const qs = branchCode ? `&branchCode=${encodeURIComponent(branchCode)}` : "";
    fetch(`/api/walkin/lookups?brand=${brand}${qs}`)
      .then(r => r.ok ? r.json() : Promise.reject("Failed to load"))
      .then((data: Lookups) => {
        setLookups(data);
        // Auto-select branch if branchCode is in URL
        if (branchCode && data.branches.length > 0) {
          const found = data.branches.find(b => b.code === branchCode);
          if (found) {
            setSelectedBranchId(found.id);
            setSelectedBranchName(found.name);
          }
        }
      })
      .catch(() => setLookupsError("Could not load form data. Please refresh."));
  }, [brand, branchCode]);

  // ── Auto-focus PIN input on welcome screen
  useEffect(() => {
    if (screen === "welcome" && !pinVerified) {
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [screen, pinVerified]);

  // ── Countdown timer for confirmation screen
  useEffect(() => {
    if (screen !== "confirm") return;
    setResetCountdown(6);
    const interval = setInterval(() => {
      setResetCountdown(n => {
        if (n <= 1) { clearInterval(interval); resetToWelcome(); return 0; }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetToWelcome = useCallback(() => {
    setScreen("welcome");
    setPin("");
    setPinError("");
    setPinVerified(false);
    // Reset form too — never show previous parent's data
    setParentName(""); setChildName(""); setPhone(""); setPhoneError("");
    setAltPhone(""); setEmail(""); setProgram(""); setSource("");
    setLeadOwner(""); setEnquiryDate(today()); setRemark("");
    setDuplicate(null); setDuplicateResolution("none");
    setHasSibling(false); setSiblingName(""); setSiblingProgram("");
    setSubmitError(""); setConfirmedLead(null);
    // Keep branch selection if URL-based, clear if manually chosen
    if (!branchCode) { setSelectedBranchId(null); setSelectedBranchName(""); }
  }, [branchCode]);

  // ── PIN verification
  const verifyPin = async () => {
    if (!selectedBranchId || !pin) {
      setPinError("Please enter the staff PIN to continue.");
      return;
    }
    const branch = lookups?.branches.find(b => b.id === selectedBranchId);
    if (!branch) return;

    setPinLoading(true); setPinError("");
    try {
      const res = await fetch(`/api/walkin/branches/${branch.code}/verify-pin?pin=${encodeURIComponent(pin)}`);
      if (res.status === 401) { setPinError("Incorrect PIN. Please try again."); setPin(""); pinInputRef.current?.focus(); return; }
      if (!res.ok) { setPinError("Verification failed. Please try again."); return; }
      setPinVerified(true);
      setScreen("form");
    } catch {
      setPinError("Network error. Please try again.");
    } finally {
      setPinLoading(false);
    }
  };

  // ── Phone blur: normalize + duplicate check
  const handlePhoneBlur = async () => {
    if (!phone) return;
    const result = normalizePhone(phone);
    if ("error" in result) {
      setPhoneError(result.error);
      setDuplicate(null);
      return;
    }
    setPhoneError("");
    // Duplicate check
    setCheckingDuplicate(true);
    try {
      const res = await fetch(`/api/walkin/leads/check-duplicate?phone=${result.normalized}&brand=${brand}&ay=2027-28`);
      const data = await res.json();
      setDuplicate(data.duplicate ?? null);
      setDuplicateResolution("none");
    } catch {
      // non-fatal
    } finally {
      setCheckingDuplicate(false);
    }
  };

  // ── Form validation
  const isFormValid = () => {
    if (!parentName.trim() || parentName.trim().length < 2) return false;
    if (!childName.trim() || childName.trim().length < 2) return false;
    if (!phone || !("normalized" in normalizePhone(phone))) return false;
    if (phoneError) return false;
    if (!program) return false;
    if (!source) return false;
    if (!leadOwner) return false;
    if (!enquiryDate) return false;
    if (enquiryDate > today()) return false;
    if (duplicate && duplicateResolution === "none") return false;
    if (hasSibling && (!siblingName.trim() || siblingName.trim().length < 2)) return false;
    if (hasSibling && !siblingProgram) return false;
    return true;
  };

  // ── Submit
  const handleSubmit = async () => {
    const phoneResult = normalizePhone(phone);
    if ("error" in phoneResult) { setPhoneError(phoneResult.error); return; }
    setSubmitting(true); setSubmitError("");
    try {
      const res = await fetch("/api/walkin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          branchId: selectedBranchId,
          academicYear: "2027-28",
          enquiryDate,
          parentName: parentName.trim(),
          childName: childName.trim(),
          phone,
          altPhone: altPhone.trim() || undefined,
          email: email.trim().toLowerCase() || undefined,
          program,
          source,
          leadOwner: leadOwner || undefined,
          remark: remark.trim() || undefined,
          status: "OPEN",
          createdBy: leadOwner || "kiosk",
          _duplicateResolution: duplicateResolution !== "none" ? duplicateResolution : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.message || "Submission failed. Please try again."); return; }

      // Submit sibling lead if requested
      if (hasSibling && siblingName.trim() && siblingProgram) {
        await fetch("/api/walkin/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand,
            branchId: selectedBranchId,
            academicYear: "2027-28",
            enquiryDate,
            parentName: parentName.trim(),
            childName: siblingName.trim(),
            phone,
            altPhone: altPhone.trim() || undefined,
            email: email.trim().toLowerCase() || undefined,
            program: siblingProgram,
            source,
            leadOwner: leadOwner || undefined,
            remark: remark.trim() || undefined,
            status: "OPEN",
            createdBy: leadOwner || "kiosk",
            _duplicateResolution: "continue",
          }),
        });
      }

      setConfirmedLead({
        ...data.lead,
        ...(hasSibling && siblingName.trim() ? { siblingName: siblingName.trim(), siblingProgram } : {}),
      });
      setScreen("confirm");
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Common layout wrapper
  const bgStyle = { background: cfg.primary, minHeight: "100vh" };
  const accentStyle = { background: cfg.primary };

  // ──────────────────────────────────────────────────────────
  // SCREEN 1: WELCOME
  // ──────────────────────────────────────────────────────────
  if (screen === "welcome" || screen === "form" && !pinVerified) {
    const noBranches = lookups && lookups.branches.length === 0;
    const branchSelected = selectedBranchId !== null;

    return (
      <div style={bgStyle} className="flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-5 inline-block">
              <img src={cfg.logoSrc} alt={cfg.logoAlt} style={{ height: 80, width: "auto" }} />
            </div>
            <h1 className="text-white font-black text-2xl text-center leading-snug">{cfg.greeting}</h1>
            <p className="text-white/70 text-sm mt-2 text-center">{cfg.subGreeting}</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5">
              {lookupsError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {lookupsError}
                </div>
              )}

              {/* Branch selector — only if no branchCode in URL */}
              {!branchCode && lookups && (
                <div className="mb-5">
                  <FieldLabel required>Select Branch</FieldLabel>
                  <SelectInput
                    value={selectedBranchId?.toString() ?? ""}
                    onChange={e => {
                      const id = parseInt(e.target.value, 10);
                      const b = lookups.branches.find(x => x.id === id);
                      setSelectedBranchId(id || null);
                      setSelectedBranchName(b?.name ?? "");
                    }}
                    placeholder="— Select your branch —"
                  >
                    {lookups.branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </SelectInput>
                  {noBranches && (
                    <p className="mt-2 text-sm text-amber-600">No active branches configured yet. Please contact the administrator.</p>
                  )}
                </div>
              )}

              {branchCode && selectedBranchName && (
                <div className="mb-5 px-3 py-2 rounded-lg text-sm font-semibold" style={{ background: cfg.light, color: cfg.primary }}>
                  📍 {selectedBranchName}
                </div>
              )}

              {/* PIN entry */}
              <div className="mb-5">
                <FieldLabel required>Staff PIN</FieldLabel>
                <div className="flex gap-3">
                  <input
                    ref={pinInputRef}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    value={pin}
                    onChange={e => { setPin(e.target.value); setPinError(""); }}
                    onKeyDown={e => e.key === "Enter" && branchSelected && verifyPin()}
                    placeholder="Enter PIN"
                    disabled={!branchSelected || !lookups}
                    className={`flex-1 px-4 py-4 rounded-xl border-2 text-base font-mono tracking-[0.4em] focus:outline-none transition text-center
                      ${pinError ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-slate-500"}
                      ${(!branchSelected || !lookups) ? "opacity-50 cursor-not-allowed bg-slate-50" : "bg-white"}`}
                  />
                  <button
                    onClick={verifyPin}
                    disabled={!pin || !branchSelected || pinLoading || !lookups}
                    className="px-6 py-4 rounded-xl font-black text-white text-sm transition disabled:opacity-50"
                    style={accentStyle}
                  >
                    {pinLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Unlock"}
                  </button>
                </div>
                {pinError && <p className="mt-2 text-sm text-red-600 font-medium">{pinError}</p>}
              </div>

              <p className="text-xs text-slate-400 text-center">
                Ask a staff member to enter the branch PIN to begin the enquiry process.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // SCREEN 3: CONFIRMATION
  // ──────────────────────────────────────────────────────────
  if (screen === "confirm" && confirmedLead) {
    return (
      <div style={bgStyle} className="flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Top stripe */}
            <div style={{ height: 6, background: cfg.primary }} />

            <div className="px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ background: cfg.light }}>
                <CheckCircle2 className="w-9 h-9" style={{ color: cfg.primary }} strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-black mb-1" style={{ color: cfg.primary }}>
                {confirmedLead.siblingName ? "2 Enquiries Saved ✓" : "Enquiry Saved ✓"}
              </h2>
              <p className="text-slate-500 text-sm mb-6">{cfg.confirmNote}</p>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl px-5 py-4 text-left space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Parent</span>
                  <span className="font-bold text-slate-800">{confirmedLead.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Child 1</span>
                  <span className="font-bold text-slate-800">{confirmedLead.childName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Program</span>
                  <span className="font-bold text-slate-800">{confirmedLead.program}</span>
                </div>
                {confirmedLead.siblingName && (
                  <>
                    <div className="border-t border-slate-200 pt-2 flex justify-between">
                      <span className="text-slate-500 font-medium">Child 2 (Sibling)</span>
                      <span className="font-bold text-slate-800">{confirmedLead.siblingName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Program</span>
                      <span className="font-bold text-slate-800">{confirmedLead.siblingProgram}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">Phone</span>
                  <span className="font-bold text-slate-800">{confirmedLead.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Date</span>
                  <span className="font-bold text-slate-800">{formatDateDisplay(confirmedLead.enquiryDate)} ({confirmedLead.monthLabel})</span>
                </div>
              </div>

              <div className="text-sm text-slate-400 mb-5">
                Resetting in <span className="font-bold" style={{ color: cfg.primary }}>{resetCountdown}s</span>…
              </div>

              <button
                onClick={resetToWelcome}
                className="w-full py-4 rounded-xl font-black text-white text-base transition"
                style={accentStyle}
              >
                New Enquiry →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // SCREEN 2: CAPTURE FORM
  // ──────────────────────────────────────────────────────────
  return (
    <div style={bgStyle} className="min-h-screen px-4 py-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-white rounded-xl p-2 shadow-md flex-shrink-0">
            <img src={cfg.logoSrc} alt={cfg.logoAlt} style={{ height: 40, width: "auto" }} />
          </div>
          <div>
            <div className="text-white font-black text-lg leading-tight">{cfg.name}</div>
            <div className="text-white/70 text-xs">{selectedBranchName || "Walk-in Enquiry"} · AY 2027-28</div>
          </div>
        </div>

        {/* Main form card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div style={{ height: 5, background: cfg.primary }} />

          <div className="px-6 py-6 space-y-5">

            {/* Parent Name */}
            <div>
              <FieldLabel required>Parent / Guardian Name</FieldLabel>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoComplete="off"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  placeholder="e.g. Priya Mehta"
                  className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-slate-500 text-base font-medium focus:outline-none transition"
                />
              </div>
            </div>

            {/* Child Name */}
            <div>
              <FieldLabel required>Child's Name</FieldLabel>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoComplete="off"
                  value={childName}
                  onChange={e => setChildName(e.target.value)}
                  placeholder="e.g. Aarav Mehta"
                  className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-slate-500 text-base font-medium focus:outline-none transition"
                />
              </div>
            </div>

            {/* Sibling toggle */}
            <div>
              <button
                type="button"
                onClick={() => { setHasSibling(s => !s); setSiblingName(""); setSiblingProgram(""); }}
                className="flex items-center gap-2.5 text-sm font-semibold transition"
                style={{ color: hasSibling ? cfg.primary : "#64748b" }}
              >
                <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${hasSibling ? "" : "border-slate-300"}`}
                  style={hasSibling ? { borderColor: cfg.primary } : {}}>
                  {hasSibling && <span className="w-2.5 h-2.5 rounded-sm" style={{ background: cfg.primary }} />}
                </span>
                Enquiry for sibling too?
              </button>
            </div>

            {hasSibling && (
              <div className="rounded-xl border-2 border-dashed p-4 space-y-4" style={{ borderColor: cfg.primary + "55" }}>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: cfg.primary }}>Sibling Details</div>
                <div>
                  <FieldLabel required>Sibling's Name</FieldLabel>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      autoComplete="off"
                      value={siblingName}
                      onChange={e => setSiblingName(e.target.value)}
                      placeholder="e.g. Ananya Mehta"
                      className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-slate-500 text-base font-medium focus:outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel required>Sibling's Program / Grade</FieldLabel>
                  <SelectInput value={siblingProgram} onChange={e => setSiblingProgram(e.target.value)} placeholder="— Select program —">
                    {lookups?.programs.map(p => <option key={p.id} value={p.label}>{p.label}</option>)}
                  </SelectInput>
                </div>
              </div>
            )}

            {/* Phone + Alt Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Phone Number</FieldLabel>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    autoComplete="off"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setPhoneError(""); setDuplicate(null); setDuplicateResolution("none"); }}
                    onBlur={handlePhoneBlur}
                    placeholder="e.g. 9876543210"
                    className={`w-full pl-11 pr-4 py-4 rounded-xl border-2 text-base font-medium focus:outline-none transition
                      ${phoneError ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-slate-500"}`}
                  />
                </div>
                {checkingDuplicate && <p className="mt-1 text-xs text-slate-400">Checking…</p>}
                {phoneError && <p className="mt-1.5 text-sm text-red-600 font-medium">{phoneError}</p>}
              </div>
              <div>
                <FieldLabel>Alternate Phone <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span></FieldLabel>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    autoComplete="off"
                    value={altPhone}
                    onChange={e => setAltPhone(e.target.value)}
                    placeholder="e.g. 9876543211"
                    className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-slate-500 text-base font-medium focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Duplicate warning */}
            {duplicate && duplicateResolution === "none" && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-4">
                <div className="flex gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <strong>Duplicate detected</strong> — this phone already has an enquiry<br />
                    on <strong>{formatDateDisplay(duplicate.enquiryDate)}</strong> for <strong>{duplicate.program}</strong> (Status: {duplicate.status}).
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDuplicateResolution("continue")}
                    className="flex-1 py-2 rounded-lg text-sm font-bold border-2 border-amber-400 text-amber-800 hover:bg-amber-100 transition"
                  >
                    Continue Anyway
                  </button>
                  <button
                    onClick={() => setDuplicateResolution("viewed")}
                    className="flex-1 py-2 rounded-lg text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition"
                  >
                    I've Reviewed — Proceed
                  </button>
                </div>
              </div>
            )}
            {duplicate && duplicateResolution !== "none" && (
              <div className="rounded-lg px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200">
                ⚠ Duplicate acknowledged — continuing as new enquiry.
              </div>
            )}

            {/* Email */}
            <div>
              <FieldLabel>Email Address <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span></FieldLabel>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. priya@email.com"
                  className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-slate-500 text-base font-medium focus:outline-none transition"
                />
              </div>
            </div>

            {/* Program + Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Program / Grade</FieldLabel>
                <SelectInput value={program} onChange={e => setProgram(e.target.value)} placeholder="— Select program —">
                  {lookups?.programs.map(p => <option key={p.id} value={p.label}>{p.label}</option>)}
                </SelectInput>
              </div>
              <div>
                <FieldLabel required>How Did They Hear of Us?</FieldLabel>
                <SelectInput value={source} onChange={e => setSource(e.target.value)} placeholder="— Select source —">
                  {lookups?.sources.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
                </SelectInput>
              </div>
            </div>

            {/* Lead Owner + Enquiry Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Counsellor Name</FieldLabel>
                <SelectInput value={leadOwner} onChange={e => setLeadOwner(e.target.value)} placeholder="— Select counsellor —">
                  {lookups?.staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </SelectInput>
              </div>
              <div>
                <FieldLabel required>Enquiry Date</FieldLabel>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={enquiryDate}
                    max={today()}
                    onChange={e => setEnquiryDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-slate-500 text-base font-medium focus:outline-none transition"
                  />
                </div>
                {enquiryDate > today() && (
                  <p className="mt-1.5 text-sm text-red-600 font-medium">Date cannot be in the future</p>
                )}
              </div>
            </div>

            {/* Remark */}
            <div>
              <FieldLabel>Remarks <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span></FieldLabel>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                <textarea
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  rows={2}
                  placeholder="Any additional notes…"
                  className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-slate-500 text-base font-medium focus:outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {submitError}
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !isFormValid()}
              className="w-full py-5 rounded-xl font-black text-white text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: isFormValid() ? cfg.primary : "#94a3b8" }}
            >
              {submitting
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving Enquiry…</>
                : "Save Enquiry →"
              }
            </button>

            <p className="text-center text-xs text-slate-400 pb-2">
              Data is recorded securely for admission purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
