import { useState, useEffect } from "react";
import { useParams } from "wouter";
import QRCode from "qrcode";

const NAVY = "#091a4f";

type School = { id: number; name: string; contactPerson: string; isActive: boolean };

function getToken() {
  try { return sessionStorage.getItem("ris_admin_auth") || ""; } catch { return ""; }
}

export default function FriendshipQRCard() {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [portalUrl, setPortalUrl] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(portalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    document.title = "QR Card | Rainbow International School";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");

    const params = new URLSearchParams(window.location.search);
    const nameParam  = params.get("name");
    const tokenParam = params.get("token");

    if (nameParam && tokenParam) {
      setSchool({ id: Number(id), name: nameParam, contactPerson: "", isActive: true });
      setPortalUrl(`${window.location.origin}/alliances/friendship/${tokenParam}`);
      return;
    }

    const adminToken = getToken();
    fetch(`/api/admin/alliances/friendship/schools/${id}`, {
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
      credentials: "same-origin",
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((d: School & { token: string }) => {
        setSchool(d);
        setPortalUrl(`${window.location.origin}/alliances/friendship/${d.token}`);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    if (!portalUrl) return;
    QRCode.toDataURL(portalUrl, {
      width: 500, margin: 2,
      color: { dark: NAVY, light: "#ffffff" },
      errorCorrectionLevel: "H",
    }).then(url => setQrDataUrl(url));
  }, [portalUrl]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f1f5f9" }}>
        <div className="text-slate-500">School not found. Make sure you are logged in as admin.</div>
      </div>
    );
  }

  if (!school || !qrDataUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f1f5f9" }}>
        <div className="text-slate-400 text-sm">Generating QR card…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4 print:py-0 print:px-0 print:bg-white" style={{ background: "#f1f5f9" }}>
      {/* Controls — hidden on print */}
      <div className="mb-6 flex gap-3 print:hidden">
        <button onClick={() => window.print()}
          className="px-6 py-2.5 rounded-lg text-white font-bold shadow-md hover:opacity-90 transition"
          style={{ background: NAVY }} data-testid="button-print">
          🖨️ Print Card
        </button>
        <a href="/admin/alliances/friendship" className="px-6 py-2.5 rounded-lg border-2 border-slate-300 text-slate-600 font-semibold hover:bg-white transition">
          ← Back
        </a>
      </div>

      {/* A5 card — 148 mm wide, designed to fill A5 page on print */}
      <div
        id="qr-card"
        className="overflow-hidden shadow-2xl print:shadow-none"
        style={{
          width: "148mm",
          minHeight: "210mm",
          fontFamily: "Inter, sans-serif",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
        data-testid="qr-card"
      >
        {/* Top navy stripe */}
        <div style={{ height: 8, background: NAVY, flexShrink: 0 }} />

        {/* Header — white / powder-blue gradient */}
        <div
          className="text-center px-8 pt-7 pb-6"
          style={{ background: "linear-gradient(160deg, #ffffff 0%, #f0f4fb 60%, #e4ecf8 100%)", flexShrink: 0 }}
        >
          <img
            src="/images/ris-logo.png"
            alt="Rainbow International School"
            style={{ height: 80, width: "auto", display: "inline-block", borderRadius: 10, marginBottom: 12 }}
          />
          <div className="font-black text-lg leading-snug" style={{ color: NAVY }}>
            Rainbow International School
          </div>
          <div className="text-sm mt-1" style={{ color: "#5a7aa0" }}>Alliances Portal</div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#dce6f0", flexShrink: 0 }} />

        {/* Body */}
        <div className="px-8 py-7 text-center flex-1 flex flex-col items-center justify-center" style={{ background: "#ffffff" }}>
          <div
            className="text-xs font-black uppercase tracking-widest mb-5"
            style={{ color: NAVY, letterSpacing: "0.13em" }}
          >
            Scan to Submit Student Details
          </div>

          {/* QR code */}
          <div style={{ padding: 10, background: "#f0f4fb", borderRadius: 16, display: "inline-block" }}>
            <img
              src={qrDataUrl}
              alt={`QR code for ${school.name}`}
              style={{ width: 220, height: 220, display: "block", borderRadius: 8 }}
            />
          </div>

          {/* School box */}
          <div
            className="mt-7 w-full rounded-2xl px-5 py-4 text-center"
            style={{ background: "#f0f4fb", border: "1px solid #dce6f0" }}
          >
            <div
              className="text-xs font-black uppercase tracking-widest mb-1"
              style={{ color: "#5a7aa0", letterSpacing: "0.12em" }}
            >
              Friendship School
            </div>
            <div className="font-black text-xl leading-tight" style={{ color: NAVY }}>{school.name}</div>
            {school.contactPerson && (
              <div className="text-sm mt-1" style={{ color: "#5a7aa0" }}>Contact: {school.contactPerson}</div>
            )}
          </div>

          {/* How to submit */}
          <div className="mt-6 w-full text-left">
            <div className="text-xs font-bold mb-2" style={{ color: "#5a7aa0" }}>How to submit:</div>
            <ol className="text-xs space-y-1.5" style={{ color: "#64748b", paddingLeft: 16 }}>
              <li>1. Scan the QR code with your phone camera</li>
              <li>2. Fill in student details or upload an Excel sheet</li>
              <li>3. Tap submit — data is recorded securely ✓</li>
            </ol>
          </div>

          {/* Portal URL */}
          <div
            className="mt-5 w-full text-center"
            style={{ fontSize: 9, color: "#94a3b8", wordBreak: "break-all", lineHeight: 1.4 }}
          >
            {portalUrl}
          </div>
        </div>

        {/* Bottom navy stripe */}
        <div style={{ height: 8, background: NAVY, flexShrink: 0 }} />
      </div>

      {/* Copy link — hidden on print */}
      <div className="mt-5 w-full print:hidden" style={{ maxWidth: "148mm" }}>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 text-center">Share Portal Link (for Desktop)</div>
        <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 flex items-center gap-2 shadow-sm">
          <code className="text-xs text-slate-600 flex-1 truncate select-all" data-testid="text-portal-url">{portalUrl}</code>
          <button onClick={copyLink}
            className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition"
            style={{ background: copied ? "#dcfce7" : "#f0f4ff", color: copied ? "#059669" : NAVY }}
            data-testid="button-copy-link">
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
        <div className="text-[11px] text-slate-400 text-center mt-1.5">
          Share this link so schools can submit leads from their desktop too
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A5 portrait; margin: 0; }
          body { margin: 0; background: white; }
          #qr-card {
            width: 148mm !important;
            min-height: 210mm !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            page-break-after: avoid;
          }
          .print\\:hidden { display: none !important; }
          .print\\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .print\\:px-0 { padding-left: 0 !important; padding-right: 0 !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
