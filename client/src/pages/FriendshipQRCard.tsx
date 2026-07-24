import { useState, useEffect } from "react";
import { useParams } from "wouter";
import QRCode from "qrcode";

const NAVY = "#091a4f";
const AMBER = "#f59e0b";

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

  useEffect(() => {
    document.title = "QR Card | Rainbow International School";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");

    const token = getToken();
    fetch(`/api/admin/alliances/friendship/schools/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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
      width: 400, margin: 2,
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
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4" style={{ background: "#f1f5f9" }}>
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

      <div id="qr-card" className="bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ width: 360, fontFamily: "Inter, sans-serif" }} data-testid="qr-card">
        <div className="h-2" style={{ background: AMBER }} />

        <div className="px-6 pt-5 pb-4 text-center" style={{ background: NAVY }}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl font-black text-base mb-3" style={{ background: AMBER, color: NAVY }}>RIS</div>
          <div className="text-white font-black text-base leading-tight">Rainbow International School</div>
          <div className="text-blue-200 text-xs mt-1">Alliances Portal</div>
        </div>

        <div className="px-6 py-6 text-center">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: NAVY }}>Scan to Submit Student Details</div>
          <div className="flex justify-center">
            <img src={qrDataUrl} alt={`QR code for ${school.name}`} style={{ width: 200, height: 200 }} className="rounded-xl" />
          </div>

          <div className="mt-5 px-4 py-3 rounded-2xl" style={{ background: "#f0f4ff" }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#64748b" }}>Friendship School</div>
            <div className="text-xl font-black leading-tight" style={{ color: NAVY }}>{school.name}</div>
            <div className="text-xs text-slate-500 mt-1">Contact: {school.contactPerson}</div>
          </div>

          <div className="mt-4 text-xs text-slate-500 leading-relaxed">
            <div className="font-semibold text-slate-600 mb-1">How to submit:</div>
            <ol className="text-left space-y-1 pl-4">
              <li>1. Scan the QR code with your phone camera</li>
              <li>2. Fill in student details or upload an Excel sheet</li>
              <li>3. Tap submit — data is recorded securely ✓</li>
            </ol>
          </div>
        </div>
        <div className="h-2" style={{ background: AMBER }} />
      </div>

      <div className="mt-4 text-xs text-slate-400 text-center print:hidden">
        Portal URL: <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">{portalUrl}</code>
      </div>

      <style>{`
        @media print {
          body { margin: 0; background: white; }
          #qr-card { box-shadow: none; border-radius: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
