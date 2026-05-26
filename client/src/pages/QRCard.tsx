import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import QRCode from "qrcode";

const NAVY = "#091a4f";
const AMBER = "#f59e0b";

type Ra = { id: string; name: string; slug: string; branch: string; active: boolean };

function getToken() {
  try { return sessionStorage.getItem("ris_admin_auth") || ""; } catch { return ""; }
}

export default function QRCard() {
  const { slug } = useParams<{ slug: string }>();
  const [ra, setRa] = useState<Ra | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formUrl = `${window.location.origin}/walkin/${slug}`;

  useEffect(() => {
    const token = getToken();
    fetch(`/api/admin/ras/slug/${slug}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => setRa(d))
      .catch(code => { if (code === 404 || code === 401) setNotFound(true); });
  }, [slug]);

  useEffect(() => {
    if (!ra) return;
    QRCode.toDataURL(formUrl, {
      width: 400,
      margin: 2,
      color: { dark: NAVY, light: "#ffffff" },
      errorCorrectionLevel: "H",
    }).then(url => setQrDataUrl(url));
  }, [ra, formUrl]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f1f5f9" }}>
        <div className="text-slate-500">RA not found. Make sure you are logged in as admin.</div>
      </div>
    );
  }

  if (!ra || !qrDataUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f1f5f9" }}>
        <div className="text-slate-400 text-sm">Generating QR card…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4" style={{ background: "#f1f5f9" }}>
      {/* Print button — hidden when printing */}
      <div className="mb-6 flex gap-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-6 py-2.5 rounded-lg text-white font-bold shadow-md hover:opacity-90 transition"
          style={{ background: NAVY }}
          data-testid="button-print"
        >
          🖨️ Print Card
        </button>
        <a href="/admin/ras" className="px-6 py-2.5 rounded-lg border-2 border-slate-300 text-slate-600 font-semibold hover:bg-white transition">
          ← Back
        </a>
      </div>

      {/* The printable card */}
      <div
        id="qr-card"
        className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ width: 360, fontFamily: "Inter, sans-serif" }}
        data-testid="qr-card"
      >
        {/* Top stripe */}
        <div className="h-2" style={{ background: AMBER }} />

        {/* School header */}
        <div className="px-6 pt-5 pb-4 text-center" style={{ background: NAVY }}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl font-black text-base mb-3" style={{ background: AMBER, color: NAVY }}>RIS</div>
          <div className="text-white font-black text-base leading-tight">Rainbow International School</div>
          <div className="text-blue-200 text-xs mt-1">{ra.branch} Branch</div>
        </div>

        {/* QR Code */}
        <div className="px-6 py-6 text-center">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: NAVY }}>Scan to Check In</div>
          <div className="flex justify-center">
            <img
              src={qrDataUrl}
              alt={`QR code for ${ra.name}`}
              style={{ width: 200, height: 200 }}
              className="rounded-xl"
            />
          </div>

          {/* RA name */}
          <div className="mt-5 px-4 py-3 rounded-2xl" style={{ background: "#f0f4ff" }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#64748b" }}>Your Counsellor</div>
            <div className="text-2xl font-black" style={{ color: NAVY }}>{ra.name}</div>
          </div>

          {/* Instructions */}
          <div className="mt-4 text-xs text-slate-500 leading-relaxed">
            <div className="font-semibold text-slate-600 mb-1">How to check in:</div>
            <ol className="text-left space-y-1 pl-4">
              <li>1. Scan the QR code above with your phone camera</li>
              <li>2. Fill your name, child's name & grade</li>
              <li>3. Tap "Check In" — done! ✓</li>
            </ol>
          </div>
        </div>

        {/* Bottom stripe */}
        <div className="h-2" style={{ background: AMBER }} />
      </div>

      {/* URL hint below the card (not shown when printing) */}
      <div className="mt-4 text-xs text-slate-400 text-center print:hidden">
        Form URL: <code className="bg-white px-2 py-0.5 rounded border border-slate-200">{formUrl}</code>
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
