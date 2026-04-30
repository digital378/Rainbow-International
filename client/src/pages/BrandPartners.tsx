import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Download, X, Sparkles, Tag, Users } from "lucide-react";
import { BRAND_PARTNERS, BRAND_CATEGORIES, type BrandCategory } from "@/data/brandPartners";

const NAVY = "#091a4f";
const AMBER = "#fbbf24";

const BROCHURE_URL = "/brochures/brand-partners-brochure.pdf";

export default function BrandPartners() {
  const [activeCategory, setActiveCategory] = useState<BrandCategory | "All">("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: BRAND_PARTNERS.length };
    for (const cat of BRAND_CATEGORIES) {
      map[cat] = BRAND_PARTNERS.filter((b) => b.category === cat).length;
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return BRAND_PARTNERS;
    return BRAND_PARTNERS.filter((b) => b.category === activeCategory);
  }, [activeCategory]);

  const closeModal = () => {
    setModalOpen(false);
    setError("");
    setConfirmation("");
    setCardNumber("");
    setSubmitting(false);
    if (triggerRef.current) triggerRef.current.focus();
  };

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [modalOpen]);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = cardNumber.trim();
    if (!trimmed) {
      setError("Please enter your privilege card number.");
      return;
    }
    setError("");
    setSubmitting(true);
    // Persist the request as a lead — don't block the user if persistence fails
    try {
      const recordRes = await fetch("/api/brochure-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardNumber: trimmed }),
      });
      if (!recordRes.ok) {
        const body = await recordRes.text().catch(() => "");
        console.error(
          `[brochure] Failed to record request (HTTP ${recordRes.status}):`,
          body
        );
      }
    } catch (err) {
      console.error("[brochure] Failed to record request:", err);
    }
    let exists = false;
    try {
      const res = await fetch(BROCHURE_URL, { method: "HEAD" });
      const contentType = res.headers.get("content-type") || "";
      exists = res.ok && contentType.toLowerCase().includes("pdf");
    } catch {
      exists = false;
    }
    if (exists) {
      const link = document.createElement("a");
      link.href = BROCHURE_URL;
      link.download = "RIS-Brand-Partners-Brochure.pdf";
      link.target = "_blank";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSubmitting(false);
      closeModal();
    } else {
      setSubmitting(false);
      setConfirmation(
        "Thank you! Your brochure is being prepared — our team will email it to you shortly. For immediate assistance, call (022) 69105000."
      );
    }
  };

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Brand Partners",
    url: "https://rainbowinternationalschool.in/brand-partners",
    description:
      "Explore Rainbow International School's brand partners and exclusive privilege card benefits for RIS families in Thane.",
    mainEntity: {
      "@type": "Organization",
      name: "Rainbow International School",
      url: "https://rainbowinternationalschool.in",
      makesOffer: BRAND_CATEGORIES.map((cat) => ({
        "@type": "Offer",
        category: cat,
        eligibleCustomerType: "RIS Privilege Card Holder",
      })),
    },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Brand Partners | Rainbow International School Thane"
        description="Explore Rainbow International School's brand partners and exclusive privilege card benefits for RIS families in Thane."
        keywords="RIS brand partners, Rainbow International School privilege card, school partner discounts Thane, RIS family benefits"
        canonical="https://rainbowinternationalschool.in/brand-partners"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Brand Partners", href: "https://rainbowinternationalschool.in/brand-partners" },
        ]}
        jsonLd={orgLd}
      />
      <Navbar />
      <PageBanner
        title="Brand Partners"
        subtitle="Exclusive privileges for RIS families across 130+ trusted local & national brands."
        breadcrumb={[{ label: "Brand Partners" }]}
      />

      <main className="flex-grow">
        {/* ── Intro + Brochure CTA ───────────────────────────── */}
        <section className="py-14 sm:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4" style={{ background: "#fef3c7", color: "#92400e" }}>
                  <Sparkles className="w-3.5 h-3.5" /> RIS Privilege Card
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight" style={{ color: NAVY, fontFamily: "DM Sans, system-ui" }}>
                  Exclusive Benefits for RIS Families
                </h2>
                <p className="text-base sm:text-[17px] text-gray-600 leading-relaxed mb-4">
                  At Rainbow International School, our community extends far beyond the campus. Through our
                  carefully curated <strong>Brand Partners programme</strong>, every RIS family receives a
                  privilege card unlocking handpicked offers across dining, healthcare, fitness, fashion,
                  family entertainment and more — right here in Thane and beyond.
                </p>
                <p className="text-base text-gray-600 leading-relaxed">
                  From pediatricians and pharmacies to your favourite restaurants and theme parks, the privilege
                  card brings genuine value to everyday parenting.{" "}
                  <Link href="/admissions" className="font-bold underline" style={{ color: NAVY }} data-testid="link-admissions-intro">
                    Join the RIS family
                  </Link>{" "}
                  to unlock these benefits.
                </p>
              </div>
              <div className="lg:col-span-2">
                <div className="rounded-3xl p-6 sm:p-8 shadow-lg border-2" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1e3a8a 100%)`, borderColor: AMBER }}>
                  <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest mb-3">
                    <Tag className="w-3.5 h-3.5" /> Brochure
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "DM Sans, system-ui" }}>
                    Download Brand Partner Brochure
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-5">
                    Get the complete list of partner offers, terms and how to redeem your privileges.
                  </p>
                  <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition hover:scale-[1.02]"
                    style={{ background: AMBER, color: NAVY }}
                    data-testid="button-download-brochure"
                  >
                    <Download className="w-4 h-4" /> Download Brochure
                  </button>
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-white/60">
                    <Users className="w-3 h-3" /> Privilege card number required
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Categories + Logo Grid ─────────────────────────── */}
        <section className="py-12 sm:py-16" style={{ background: "#f8fafc" }}>
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: NAVY, fontFamily: "DM Sans, system-ui" }}>
                Our Brand Partner Categories
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Tap a category to filter partners — {BRAND_PARTNERS.length} trusted brands across {BRAND_CATEGORIES.length} categories.
              </p>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {(["All", ...BRAND_CATEGORIES] as const).map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${
                      active ? "shadow-md" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                    style={active ? { background: NAVY, color: "#fff" } : undefined}
                    data-testid={`button-category-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    {cat} <span className={`ml-1 ${active ? "text-amber-300" : "text-gray-400"}`}>{counts[cat]}</span>
                  </button>
                );
              })}
            </div>

            {/* Logo grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filtered.map((brand) => (
                <div
                  key={brand.file}
                  className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 aspect-square flex flex-col items-center justify-center"
                  data-testid={`card-brand-${brand.file.replace(/\.\w+$/, "")}`}
                >
                  <div className="flex-1 w-full flex items-center justify-center min-h-0">
                    <img
                      src={`/brands/${brand.file}`}
                      alt={`${brand.name} brand partner of Rainbow International School`}
                      width={200}
                      height={200}
                      loading="lazy"
                      decoding="async"
                      className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="mt-2 text-center text-[11px] sm:text-xs font-semibold text-gray-700 line-clamp-2 leading-tight">
                    {brand.name}
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-500">No partners in this category yet.</div>
            )}
          </div>
        </section>

        {/* ── Internal links / Bottom CTA ────────────────────── */}
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <h2 className="text-2xl sm:text-3xl font-black mb-4" style={{ color: NAVY, fontFamily: "DM Sans, system-ui" }}>
              Become Part of the Rainbow Community
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-7">
              Admissions are open for AY 2026–27. Join 3,000+ RIS families and unlock privileges from day one.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/admissions" className="px-6 py-3 rounded-full font-bold text-sm text-white" style={{ background: NAVY }} data-testid="link-cta-admissions">
                Apply for Admission
              </Link>
              <Link href="/about-rainbow-international-school" className="px-6 py-3 rounded-full font-bold text-sm border-2" style={{ borderColor: NAVY, color: NAVY }} data-testid="link-cta-about">
                About Rainbow
              </Link>
              <Link href="/contact-us" className="px-6 py-3 rounded-full font-bold text-sm border-2" style={{ borderColor: NAVY, color: NAVY }} data-testid="link-cta-contact">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Brochure Modal ─────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
          onClick={closeModal}
          data-testid="modal-brochure-overlay"
        >
          <div
            ref={dialogRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="brochure-modal-title"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
              data-testid="button-close-modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ background: "#fef3c7" }}>
              <Tag className="w-5 h-5" style={{ color: "#92400e" }} />
            </div>
            <h3 id="brochure-modal-title" className="text-xl sm:text-2xl font-black mb-2" style={{ color: NAVY, fontFamily: "DM Sans, system-ui" }}>
              Download Brand Partner Brochure
            </h3>
            {confirmation ? (
              <>
                <p className="text-sm text-gray-700 mb-5" data-testid="text-brochure-confirmation">
                  {confirmation}
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition hover:scale-[1.02]"
                  style={{ background: NAVY, color: "#fff" }}
                  data-testid="button-confirmation-close"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-5">
                  Enter your privilege card number to download the brochure.
                </p>
                <form onSubmit={handleDownload}>
                  <label htmlFor="privilege-card" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Privilege Card Number
                  </label>
                  <input
                    id="privilege-card"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      setCardNumber(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g. RIS-PC-12345"
                    className={`w-full px-4 py-2.5 rounded-lg border-2 outline-none transition focus:border-blue-500 ${
                      error ? "border-red-400" : "border-gray-200"
                    }`}
                    data-testid="input-privilege-card"
                    autoFocus
                  />
                  {error && (
                    <div className="mt-2 text-xs text-red-600 font-semibold" data-testid="text-form-error">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{ background: NAVY, color: "#fff" }}
                    data-testid="button-submit-brochure"
                  >
                    <Download className="w-4 h-4" /> {submitting ? "Please wait…" : "Download Brochure"}
                  </button>
                  <p className="mt-3 text-[11px] text-gray-400 text-center">
                    Don't have a card? <Link href="/contact-us" className="underline font-semibold">Contact us</Link> to request one.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
