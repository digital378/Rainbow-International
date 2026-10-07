import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Link } from "wouter";
import {
  BookOpen,
  Bus,
  ChevronRight,
  MapPin,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CBSE_GUIDE_BANNER,
  CBSE_GUIDE_BOARDS,
  CBSE_GUIDE_CHECKLIST,
  CBSE_GUIDE_FAQ_HEADING,
  CBSE_GUIDE_FAQS,
  CBSE_GUIDE_INTRO,
  CBSE_GUIDE_JSON_LD,
  CBSE_GUIDE_RIS,
  CBSE_GUIDE_SCHOOLS,
  CBSE_GUIDE_SEO,
} from "@shared/content/cbseGuide";

const checklistIcons = [BookOpen, MapPin, Users, Trophy, Shield, Bus];

export default function CbseSchoolsGuide() {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      <SEO
        title={CBSE_GUIDE_SEO.title}
        description={CBSE_GUIDE_SEO.description}
        keywords={CBSE_GUIDE_SEO.keywords}
        canonical={CBSE_GUIDE_SEO.canonical}
        appendSiteName={false}
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: CBSE_GUIDE_BANNER.breadcrumb, href: CBSE_GUIDE_SEO.canonical },
        ]}
        jsonLd={CBSE_GUIDE_JSON_LD}
      />
      <ScrollProgress />
      <Navbar />
      <nav
        aria-label="Breadcrumb"
        className="container mx-auto px-4 pt-5 flex items-center gap-1.5 text-sm flex-wrap"
        style={{ color: "#6b7280" }}
      >
        <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span className="font-medium" style={{ color: "#091a4f" }} aria-current="page">
          {CBSE_GUIDE_BANNER.breadcrumb}
        </span>
      </nav>
      <PageBanner
        title={CBSE_GUIDE_BANNER.title}
        subtitle={CBSE_GUIDE_BANNER.subtitle}
      />

      <main className="flex-1 min-w-0">
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-base leading-relaxed mb-12 max-w-3xl" style={{ color: "#6b7280" }}>
              {CBSE_GUIDE_INTRO}
            </p>

            <section aria-labelledby="checklist-heading" className="mb-14">
              <h2
                id="checklist-heading"
                className="text-2xl md:text-3xl font-bold text-center mb-8"
                style={{ color: "#091a4f", fontFamily: "'DM Sans', sans-serif" }}
              >
                {CBSE_GUIDE_CHECKLIST.heading}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CBSE_GUIDE_CHECKLIST.cards.map((card, index) => {
                  const Icon = checklistIcons[index];
                  return (
                    <article
                      key={card.title}
                      className="rounded-xl bg-white border p-6 min-w-0"
                      style={{ borderColor: "#e5e7eb" }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                        style={{ background: "#eef5ff" }}
                      >
                        <Icon size={20} style={{ color: "#0d3b86" }} />
                      </div>
                      <h3 className="text-base font-bold mb-2" style={{ color: "#091a4f" }}>
                        {card.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                        {card.desc}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="schools-heading" className="min-w-0">
              <h2
                id="schools-heading"
                className="text-2xl md:text-3xl font-bold mb-6"
                style={{ color: "#091a4f", fontFamily: "'DM Sans', sans-serif" }}
              >
                {CBSE_GUIDE_SCHOOLS.heading}
              </h2>
              <div className="w-full min-w-0">
                <table className="cbse-guide-table w-full border-collapse text-left">
                  <thead>
                    <tr>
                      {CBSE_GUIDE_SCHOOLS.columns.map((column) => (
                        <th
                          key={column}
                          scope="col"
                          className="px-4 py-3 text-sm font-semibold"
                          style={{ background: "#f8faff", color: "#091a4f", borderBottom: "2px solid #e5e7eb" }}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CBSE_GUIDE_SCHOOLS.rows.map((school) => (
                      <tr key={school.affiliation}>
                        <td data-label={CBSE_GUIDE_SCHOOLS.columns[0]} className="px-4 py-3 text-sm font-semibold" style={{ color: "#091a4f" }}>
                          {school.href ? (
                            <Link href={school.href} className="hover:underline">
                              {school.name}
                            </Link>
                          ) : school.name}
                        </td>
                        <td data-label={CBSE_GUIDE_SCHOOLS.columns[1]} className="px-4 py-3 text-sm" style={{ color: "#374151" }}>
                          {school.locality}
                        </td>
                        <td data-label={CBSE_GUIDE_SCHOOLS.columns[2]} className="px-4 py-3 text-sm" style={{ color: "#374151" }}>
                          {school.classes}
                        </td>
                        <td data-label={CBSE_GUIDE_SCHOOLS.columns[3]} className="px-4 py-3 text-sm">
                          <a
                            href={`${CBSE_GUIDE_SCHOOLS.affiliationHref}${school.affiliation}`}
                            target="_blank"
                            rel="nofollow noopener"
                            className="font-semibold hover:underline"
                            style={{ color: "#0d3b86" }}
                          >
                            {school.affiliation}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs leading-relaxed" style={{ color: "#6b7280" }}>
                {CBSE_GUIDE_SCHOOLS.source}
              </p>
            </section>
          </div>
        </section>

        <section className="py-12 md:py-16" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <h2
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ color: "#091a4f", fontFamily: "'DM Sans', sans-serif" }}
            >
              {CBSE_GUIDE_BOARDS.heading}
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#6b7280" }}>
              {CBSE_GUIDE_BOARDS.paragraph}
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="rounded-2xl p-8 md:p-10" style={{ background: "#091a4f" }}>
              <h2
                className="text-2xl font-bold text-white mb-5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {CBSE_GUIDE_RIS.heading}
              </h2>
              <ul className="space-y-2.5 mb-7">
                {CBSE_GUIDE_RIS.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm leading-relaxed text-white">
                    <span aria-hidden="true" className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#fbbf24" }} />
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/schedule-appointment"
                  className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-semibold"
                  style={{ background: "#fbbf24", color: "#091a4f" }}
                  data-testid="link-schedule-cta"
                >
                  {CBSE_GUIDE_RIS.visitLabel} <ChevronRight size={14} />
                </Link>
                <Link
                  href="/application-form"
                  className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-semibold border text-white hover:bg-white/10 transition-all"
                  data-testid="link-apply-cta"
                >
                  {CBSE_GUIDE_RIS.applyLabel} <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <h2
              className="text-2xl md:text-3xl font-bold mb-5"
              style={{ color: "#091a4f", fontFamily: "'DM Sans', sans-serif" }}
            >
              {CBSE_GUIDE_FAQ_HEADING}
            </h2>
            <Accordion type="single" collapsible className="rounded-xl bg-white border px-5 md:px-6" style={{ borderColor: "#e5e7eb" }}>
              {CBSE_GUIDE_FAQS.map((faq, index) => (
                <AccordionItem key={faq.q} value={`faq-${index}`} style={{ borderColor: "#e5e7eb" }}>
                  <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline" style={{ color: "#091a4f" }}>
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
      <style>{`
        .cbse-guide-table {
          table-layout: fixed;
          overflow-wrap: anywhere;
        }
        .cbse-guide-table th,
        .cbse-guide-table td {
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
          overflow-wrap: anywhere;
        }
        @media (max-width: 640px) {
          .cbse-guide-table,
          .cbse-guide-table tbody,
          .cbse-guide-table tr,
          .cbse-guide-table td {
            display: block;
            width: 100%;
          }
          .cbse-guide-table thead {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
          .cbse-guide-table tbody {
            display: grid;
            gap: 0.75rem;
          }
          .cbse-guide-table tbody tr {
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            padding: 0.4rem 0.9rem;
            background: #fff;
          }
          .cbse-guide-table tbody td {
            display: grid;
            grid-template-columns: minmax(7.25rem, 40%) minmax(0, 1fr);
            gap: 0.65rem;
            padding: 0.6rem 0;
            border-bottom: 1px solid #e5e7eb;
            min-width: 0;
          }
          .cbse-guide-table tbody td:last-child {
            border-bottom: 0;
          }
          .cbse-guide-table tbody td::before {
            content: attr(data-label);
            font-size: 0.7rem;
            line-height: 1.25rem;
            font-weight: 700;
            color: #6b7280;
          }
        }
      `}</style>
    </div>
  );
}
