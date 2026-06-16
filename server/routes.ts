import type { Express } from "express";
import { createServer, type Server } from "http";
import { timingSafeEqual } from "node:crypto";
import { storage } from "./storage";
import { OPENAPI_YAML } from "./openapiSpec";
import { insertInquirySchema, insertEventSchema, insertCallbackRequestSchema, insertCareerApplicationSchema, insertBrochureRequestSchema, insertRaSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import nodemailer from "nodemailer";
import multer from "multer";
import { registerSSRRoutes } from "./ssrBlog";
import { registerHomeSSR } from "./ssrHome";
import { registerPageSSR } from "./ssrPages";
import { google } from "googleapis";

const RESUME_ALLOWED_MIMES_BY_EXT: Record<string, Set<string>> = {
  pdf: new Set(["application/pdf", "application/octet-stream"]),
  doc: new Set(["application/msword", "application/octet-stream"]),
  docx: new Set([
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
    "application/zip",
  ]),
};
const RESUME_MAX_BYTES = 5 * 1024 * 1024;
const RESUME_MAGIC_BYTES: Record<string, Buffer[]> = {
  pdf: [Buffer.from("%PDF-")],
  doc: [Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])],
  docx: [Buffer.from([0x50, 0x4b, 0x03, 0x04])],
};

const careerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: RESUME_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = (file.originalname.split(".").pop() || "").toLowerCase();
    const allowedMimes = RESUME_ALLOWED_MIMES_BY_EXT[ext];
    if (!allowedMimes || !allowedMimes.has(file.mimetype)) {
      return cb(new Error("Resume must be a PDF, DOC, or DOCX file"));
    }
    cb(null, true);
  },
});

function resumeContentMatchesType(file: Express.Multer.File): boolean {
  const ext = (file.originalname.split(".").pop() || "").toLowerCase();
  const signatures = RESUME_MAGIC_BYTES[ext];
  if (!signatures || file.buffer.length < 4) return false;
  return signatures.some((sig) => file.buffer.subarray(0, sig.length).equals(sig));
}

// ── Email helpers ───────────────────────────────────────────────
function getTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) return null;

  return {
    transport: nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    }),
    from: `"Rainbow International School" <${smtpUser}>`,
    to: process.env.ENQUIRY_MAIL_TO || "digital@rainbowinternationalschool.in",
  };
}

function tableRow(label: string, value: string | undefined | null) {
  if (!value) return "";
  return `<tr><td style="padding:8px 14px;font-weight:bold;border-bottom:1px solid #eee;color:#091a4f;">${label}</td><td style="padding:8px 14px;border-bottom:1px solid #eee;">${value}</td></tr>`;
}

function getLeadSourceLabel(utmSource?: string | null, utmMedium?: string | null): string {
  if (!utmSource && !utmMedium) return "Organic / Direct";
  const src = (utmSource || "").toLowerCase();
  const med = (utmMedium || "").toLowerCase();
  if (src === "google" && (med === "cpc" || med === "paid" || med.includes("paid"))) return "Google Ads";
  if (src === "facebook" || src === "instagram" || src === "meta") return "Meta Ads";
  if (med === "cpc" || med === "ppc" || med.includes("paid")) return `Paid Ads (${utmSource || "Unknown"})`;
  if (med === "email") return "Email Campaign";
  if (med === "social" || med === "organic_social") return `Social Media (${utmSource || "Unknown"})`;
  if (med === "referral") return `Referral (${utmSource || "Unknown"})`;
  return utmSource || "Organic / Direct";
}

function getMediumLabel(utmMedium?: string | null): string {
  if (!utmMedium) return "Direct";
  const med = utmMedium.toLowerCase();
  if (med === "cpc" || med === "ppc") return "Paid Ads";
  if (med === "display") return "Paid Ads";
  if (med === "paid_social") return "Paid Ads";
  if (med === "social" || med === "organic_social") return "Social";
  if (med === "email") return "Email";
  if (med === "referral") return "Referral";
  if (med === "organic") return "Organic Search";
  return utmMedium;
}

async function sendInquiryEmail(data: {
  parentName: string;
  email?: string | null;
  phone: string;
  studentName: string;
  grade: string;
  preferredTime?: string | null;
  message?: string | null;
  pagePath?: string | null;
  pageTitle?: string | null;
  formLocation?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
}) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log("[inquiry] SMTP not configured — skipping email. Inquiry saved to DB.");
    return;
  }

  const leadSource = getLeadSourceLabel(data.utmSource, data.utmMedium);
  const leadMedium = getMediumLabel(data.utmMedium);
  const isPaid = leadSource !== "Organic / Direct";

  const formLocationLabel = data.formLocation || (data.pagePath === "/" ? "Homepage" : data.pagePath || "Unknown");
  const pageLabel = data.pagePath || "/";

  await mailer.transport.sendMail({
    from: mailer.from,
    to: mailer.to,
    replyTo: data.email || undefined,
    subject: `New Admission Enquiry – ${data.studentName} (${data.grade})`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;">
        <div style="background:#091a4f;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;font-size:20px;">🌈 New Admission Enquiry</h2>
          <p style="margin:4px 0 0;opacity:0.85;font-size:13px;">Rainbow International School Website</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none;">
          ${tableRow("Parent Name", data.parentName)}
          ${tableRow("Student Name", data.studentName)}
          ${tableRow("Grade / Class", data.grade)}
          ${tableRow("Phone", data.phone)}
          ${tableRow("Email", data.email)}
          ${tableRow("Preferred Time", data.preferredTime)}
          ${tableRow("Message", data.message)}
        </table>

        <div style="margin-top:16px;background:#f0f4ff;border:1px solid #d1daf0;border-radius:8px;padding:16px;">
          <h3 style="margin:0 0 10px;font-size:14px;color:#091a4f;">📍 Submission Details</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            ${tableRow("Submitted From Page", pageLabel)}
            ${tableRow("Form Location", formLocationLabel)}
            ${tableRow("Lead Source", leadSource)}
            ${tableRow("Lead Medium", leadMedium)}
            ${isPaid ? tableRow("Campaign", data.utmCampaign) : ""}
            ${isPaid ? tableRow("Ad Keyword / Term", data.utmTerm) : ""}
            ${isPaid ? tableRow("Ad Content / Variant", data.utmContent) : ""}
            ${isPaid ? tableRow("Platform", data.utmSource) : ""}
          </table>
        </div>

        <p style="color:#888;font-size:12px;margin-top:16px;padding:0 4px;">Submitted via the school website enquiry form.</p>
      </div>
    `,
  });
  console.log("[inquiry] Email sent to", mailer.to);
}

async function sendCallbackEmail(data: { name: string; phone: string; preferredTime: string }) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log("[callback] SMTP not configured — skipping email. Request saved to DB.");
    return;
  }

  await mailer.transport.sendMail({
    from: mailer.from,
    to: mailer.to,
    subject: `Callback Request – ${data.name}`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;">
        <div style="background:#091a4f;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;font-size:20px;">📞 New Callback Request</h2>
          <p style="margin:4px 0 0;opacity:0.85;font-size:13px;">Rainbow International School Website</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none;">
          ${tableRow("Name", data.name)}
          ${tableRow("Phone", data.phone)}
          ${tableRow("Preferred Time", data.preferredTime)}
        </table>
        <p style="color:#888;font-size:12px;margin-top:16px;padding:0 4px;">Submitted via the website chatbot.</p>
      </div>
    `,
  });
  console.log("[callback] Email sent to", mailer.to);
}

const CAREER_EMAIL_TO = "hr.recruiter3@rainbowinternationalschool.in";

async function sendCareerEmail(
  data: {
    name: string;
    email: string;
    phone: string;
    position: string;
    experience?: string | null;
    qualification?: string | null;
    currentLocation?: string | null;
    message?: string | null;
  },
  resume?: { filename: string; content: Buffer; contentType: string } | null,
) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log("[career] SMTP not configured — skipping email. Application saved to DB.");
    return;
  }

  await mailer.transport.sendMail({
    from: mailer.from,
    to: CAREER_EMAIL_TO,
    replyTo: data.email,
    subject: `New Job Application – ${data.name} (${data.position})`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;">
        <div style="background:#091a4f;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;font-size:20px;">💼 New Career Application</h2>
          <p style="margin:4px 0 0;opacity:0.85;font-size:13px;">Rainbow International School — Careers Page</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none;">
          ${tableRow("Full Name", data.name)}
          ${tableRow("Email", data.email)}
          ${tableRow("Phone", data.phone)}
          ${tableRow("Position Applied For", data.position)}
          ${tableRow("Total Experience", data.experience)}
          ${tableRow("Qualification", data.qualification)}
          ${tableRow("Current Location", data.currentLocation)}
          ${tableRow("Resume", resume ? `Attached: ${resume.filename}` : "Not provided")}
          ${tableRow("Message", data.message)}
        </table>
        <p style="color:#888;font-size:12px;margin-top:16px;padding:0 4px;">Submitted via the school website careers page.</p>
      </div>
    `,
    attachments: resume
      ? [{ filename: resume.filename, content: resume.content, contentType: resume.contentType }]
      : undefined,
  });
  console.log("[career] Email sent to", CAREER_EMAIL_TO, resume ? `(with ${resume.filename})` : "");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // SSR must be registered BEFORE wpRedirects so that search engine bots receive
  // fully-rendered HTML for all registered paths. For bots, the SSR handler returns
  // early with HTML. For regular browsers, SSR calls next() and the redirect fires.
  // Intentional split for /rainbow-preschool-international:
  //   - Bots → SSR content for the preschool page (indexable)
  //   - Browsers → 301 redirect to /pre-primary-school-thane (legacy URL consolidation)
  registerHomeSSR(app);
  registerPageSSR(app);
  registerSSRRoutes(app);

  const wpRedirects: Record<string, string> = {
    // Non-blog page redirects (legacy URL consolidation)
    "/rainbow-preschool-international": "/pre-primary-school-thane",
    "/fee-structure-2": "/fee-structure",

    // Blog-slug redirects — old WordPress served posts at /slug, new site at /blog/slug
    // All 94 slugs mapped so old backlinks and GSC-cached URLs resolve correctly
    "/how-cbse-schools-can-foster-entrepreneurship-and-innovation": "/blog/how-cbse-schools-can-foster-entrepreneurship-and-innovation",
    "/why-rainbow-international-school-is-among-the-top-schools-in-thane": "/blog/why-rainbow-international-school-is-among-the-top-schools-in-thane",
    "/the-growing-popularity-of-cbse-schools-in-thane-west-among-parents": "/blog/the-growing-popularity-of-cbse-schools-in-thane-west-among-parents",
    "/key-facilities-every-good-cbse-school-should-have": "/blog/key-facilities-every-good-cbse-school-should-have",
    "/why-choose-a-cbse-school-for-your-childs-education": "/blog/why-choose-a-cbse-school-for-your-childs-education",
    "/riddles-for-kids": "/blog/riddles-for-kids",
    "/problem-solving-activities-life-skills-students": "/blog/problem-solving-activities-life-skills-students",
    "/role-of-parents-in-education-orientation-importance": "/blog/role-of-parents-in-education-orientation-importance",
    "/importance-of-foundational-literacy-and-numeracy-in-schools": "/blog/importance-of-foundational-literacy-and-numeracy-in-schools",
    "/co-curricular-activities": "/blog/co-curricular-activities",
    "/age-criteria-for-international-schools-admission-2025-in-mumbai": "/blog/age-criteria-for-international-schools-admission-2025-in-mumbai",
    "/international-school-admission-process-guide": "/blog/international-school-admission-process-guide",
    "/advantages-of-starting-early-international-school": "/blog/advantages-of-starting-early-international-school",
    "/the-benefits-of-early-learning-in-shaping-a-childs-personality": "/blog/the-benefits-of-early-learning-in-shaping-a-childs-personality",
    "/what-you-need-to-know-before-applying-to-an-international-school": "/blog/what-you-need-to-know-before-applying-to-an-international-school",
    "/best-age-for-international-school-admission": "/blog/best-age-for-international-school-admission",
    "/why-maths-matters-in-student-life-benefits-uses": "/blog/why-maths-matters-in-student-life-benefits-uses",
    "/importance-of-sports-in-students-life-teamwork-skills": "/blog/importance-of-sports-in-students-life-teamwork-skills",
    "/ideal-teacher-qualities-traits-of-a-great-educator": "/blog/ideal-teacher-qualities-traits-of-a-great-educator",
    "/10-fun-and-educational-republic-day-activities-for-kids": "/blog/10-fun-and-educational-republic-day-activities-for-kids",
    "/understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time": "/blog/understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time",
    "/5-tips-to-choose-best-cbse-schools-in-mumbai": "/blog/5-tips-to-choose-best-cbse-schools-in-mumbai",
    "/benefits-of-rainbow-international-school": "/blog/benefits-of-rainbow-international-school",
    "/christmas-celebration-in-school-10-fun-and-festive-activity-ideas": "/blog/christmas-celebration-in-school-10-fun-and-festive-activity-ideas",
    "/back-to-school-a-step-by-step-guide-to-international-school-admissions": "/blog/back-to-school-a-step-by-step-guide-to-international-school-admissions",
    "/benefits-of-meditation-for-students": "/blog/benefits-of-meditation-for-students",
    "/diwali-activities-for-students": "/blog/diwali-activities-for-students",
    "/cbse-vs-icse-which-board-prepares-students-better-for-the-future": "/blog/cbse-vs-icse-which-board-prepares-students-better-for-the-future",
    "/10-things-in-the-classroom-to-boost-student-engagement": "/blog/10-things-in-the-classroom-to-boost-student-engagement",
    "/holistic-development-rainbow-international-school": "/blog/holistic-development-rainbow-international-school",
    "/top-reasons-choose-rainbow-international-school-thane": "/blog/top-reasons-choose-rainbow-international-school-thane",
    "/group-activities-for-students": "/blog/group-activities-for-students",
    "/imporatnce-of-sports-in-students-life": "/blog/imporatnce-of-sports-in-students-life",
    "/cultural-activities-for-students-key-to-developing-critical-thinking-skills": "/blog/cultural-activities-for-students-key-to-developing-critical-thinking-skills",
    "/parental-guidance-how-to-choose-the-best-cbse-school-in-thane-for-your-child": "/blog/parental-guidance-how-to-choose-the-best-cbse-school-in-thane-for-your-child",
    "/how-to-learn-boring-subjects": "/blog/how-to-learn-boring-subjects",
    "/how-to-increase-attention-span": "/blog/how-to-increase-attention-span",
    "/benefits-of-learning-a-second-language": "/blog/benefits-of-learning-a-second-language",
    "/how-to-avoid-procrastination-while-studying": "/blog/how-to-avoid-procrastination-while-studying",
    "/innovative-teaching-method-for-active-learning": "/blog/innovative-teaching-method-for-active-learning",
    "/smart-revision-techniques-for-students": "/blog/smart-revision-techniques-for-students",
    "/teen-entrepreneurship-fostering-innovation-and-responsibility": "/blog/teen-entrepreneurship-fostering-innovation-and-responsibility",
    "/teaching-teens-resilience-and-thriving-through-failure": "/blog/teaching-teens-resilience-and-thriving-through-failure",
    "/nutritional-requirements-of-the-teenagers-how-to-fulfil-them": "/blog/nutritional-requirements-of-the-teenagers-how-to-fulfil-them",
    "/stress-in-teenagers-symptoms-management": "/blog/stress-in-teenagers-symptoms-management",
    "/top-5-techniques-for-taming-anger-in-children": "/blog/top-5-techniques-for-taming-anger-in-children",
    "/top-6-easy-ways-to-develop-patience-in-your-child": "/blog/top-6-easy-ways-to-develop-patience-in-your-child",
    "/homework-war-endgame": "/blog/homework-war-endgame",
    "/using-gadgets-the-right-way": "/blog/using-gadgets-the-right-way",
    "/regulating-childrens-screen-time": "/blog/regulating-childrens-screen-time",
    "/how-to-deal-with-anxiety-during-exams": "/blog/how-to-deal-with-anxiety-during-exams",
    "/understanding-adolescence-how-to-handle-the-process": "/blog/understanding-adolescence-how-to-handle-the-process",
    "/how-to-develop-fine-motor-skills-at-home": "/blog/how-to-develop-fine-motor-skills-at-home",
    "/the-leading-school-of-the-year-thane": "/blog/the-leading-school-of-the-year-thane",
    "/give-earth-to-life-on-earth": "/blog/give-earth-to-life-on-earth",
    "/coronavirus-the-new-monster-in-town": "/blog/coronavirus-the-new-monster-in-town",
    "/fit-india-certificate-of-recognition": "/blog/fit-india-certificate-of-recognition",
    "/the-15th-world-education-summit": "/blog/the-15th-world-education-summit",
    "/teen-depression-how-to-spot-and-cure-it": "/blog/teen-depression-how-to-spot-and-cure-it",
    "/7-areas-in-education-where-indian-women-are-excellent": "/blog/7-areas-in-education-where-indian-women-are-excellent",
    "/4-reasons-why-school-bags-should-not-be-a-burden": "/blog/4-reasons-why-school-bags-should-not-be-a-burden",
    "/smartphone-addiction-how-to-ensure-healthy-use-by-kids": "/blog/smartphone-addiction-how-to-ensure-healthy-use-by-kids",
    "/school-sanitation-standards-how-to-stay-clean-and-safe": "/blog/school-sanitation-standards-how-to-stay-clean-and-safe",
    "/6-excellent-ideas-to-innovate-cultural-programmes-in-school": "/blog/6-excellent-ideas-to-innovate-cultural-programmes-in-school",
    "/teaching-children-the-value-of-money-5-ways-schools-can-help": "/blog/teaching-children-the-value-of-money-5-ways-schools-can-help",
    "/amazing-coaches-who-improved-players-willpower": "/blog/amazing-coaches-who-improved-players-willpower",
    "/how-organic-farming-in-schools-helps-the-nation": "/blog/how-organic-farming-in-schools-helps-the-nation",
    "/how-school-buses-are-changing-with-technology": "/blog/how-school-buses-are-changing-with-technology",
    "/amazing-youtube-channels-on-general-knowledge-for-kids": "/blog/amazing-youtube-channels-on-general-knowledge-for-kids",
    "/know-how-swimming-helps-your-child-in-7-ways": "/blog/know-how-swimming-helps-your-child-in-7-ways",
    "/6-reasons-why-cbse-is-the-best-board-of-the-country": "/blog/6-reasons-why-cbse-is-the-best-board-of-the-country",
    "/big-school-playgrounds-6-reasons-why-kids-need-them": "/blog/big-school-playgrounds-6-reasons-why-kids-need-them",
    "/6-reasons-why-indoor-sports-is-important-in-schools": "/blog/6-reasons-why-indoor-sports-is-important-in-schools",
    "/an-all-rounder-kid-raghvi-ramanujan-displays-exceptional-talent-in-swimming": "/blog/an-all-rounder-kid-raghvi-ramanujan-displays-exceptional-talent-in-swimming",
    "/rainbow-awarded-as-best-preschool-and-secondary-school-in-thane": "/blog/rainbow-awarded-as-best-preschool-and-secondary-school-in-thane",
    "/rainbow-preschools-featured-in-knowledge-review-magazine": "/blog/rainbow-preschools-featured-in-knowledge-review-magazine",
    "/rainbow-wins-award-for-excellence": "/blog/rainbow-wins-award-for-excellence",
    "/100-result-rainbows-first-batch-2018-19": "/blog/100-result-rainbows-first-batch-2018-19",
    "/field-trips-know-how-they-groom-students-in-5-ways": "/blog/field-trips-know-how-they-groom-students-in-5-ways",
    "/time-management-for-school-children-6-ways-parents-can-help": "/blog/time-management-for-school-children-6-ways-parents-can-help",
    "/how-to-teach-benefits-of-family-meals-to-kids": "/blog/how-to-teach-benefits-of-family-meals-to-kids",
    "/do-your-children-hate-reading-know-why-youre-the-reason": "/blog/do-your-children-hate-reading-know-why-youre-the-reason",
    "/how-regular-sports-help-students-6-reasons": "/blog/how-regular-sports-help-students-6-reasons",
    "/digital-classrooms-how-technology-improves-education-in-school": "/blog/digital-classrooms-how-technology-improves-education-in-school",
    "/9-reasons-why-schools-should-have-an-infirmary-and-paediatrician": "/blog/9-reasons-why-schools-should-have-an-infirmary-and-paediatrician",
    "/7-safety-and-security-measures-your-kids-school-should-have": "/blog/7-safety-and-security-measures-your-kids-school-should-have",
    "/cbse-vs-icse-vs-state-board-which-is-best-for-your-child": "/blog/cbse-vs-icse-vs-state-board-which-is-best-for-your-child",
    "/school-admission-checklist-thane-parents-guide-2026": "/blog/school-admission-checklist-thane-parents-guide-2026",
    "/how-to-help-your-child-focus-better-in-studies": "/blog/how-to-help-your-child-focus-better-in-studies",
    "/importance-of-extracurricular-activities-in-school": "/blog/importance-of-extracurricular-activities-in-school",
    "/new-education-policy-nep-2020-what-parents-should-know": "/blog/new-education-policy-nep-2020-what-parents-should-know",
    "/how-to-prepare-your-child-for-first-day-of-school": "/blog/how-to-prepare-your-child-for-first-day-of-school",
    "/benefits-of-multiple-intelligence-based-learning-in-schools": "/blog/benefits-of-multiple-intelligence-based-learning-in-schools",
    "/best-cbse-schools-in-thane-what-to-look-for": "/blog/best-cbse-schools-in-thane-what-to-look-for",
  };

  for (const [from, to] of Object.entries(wpRedirects)) {
    app.get(from, (_req, res) => res.redirect(301, to));
  }

  app.get("/wp-content/uploads/*", (req, res) => {
    if (req.path.toLowerCase().includes("fee")) {
      return res.redirect(301, "/fee-structure");
    }
    return res.redirect(301, "/");
  });

  // ── Inquiries ───────────────────────────────────────────────
  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      sendInquiryEmail(validatedData).catch((err) =>
        console.error("[inquiry] Email error:", err)
      );
      res.status(201).json(inquiry);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create inquiry" });
    }
  });

  app.get("/api/inquiries", async (req, res) => {
    try {
      const inquiries = await storage.getAllInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  // ── Callback requests ───────────────────────────────────────
  app.post("/api/callback-requests", async (req, res) => {
    try {
      const validatedData = insertCallbackRequestSchema.parse(req.body);
      const saved = await storage.createCallbackRequest(validatedData);
      // Fire-and-forget email
      sendCallbackEmail(validatedData).catch((err) =>
        console.error("[callback] Email error:", err)
      );
      res.status(201).json(saved);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to save callback request" });
    }
  });

  app.get("/api/callback-requests", async (req, res) => {
    try {
      const requests = await storage.getAllCallbackRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch callback requests" });
    }
  });

  // ── Career applications ────────────────────────────────────
  app.post(
    "/api/career-applications",
    (req, res, next) => {
      careerUpload.single("resume")(req, res, (err: any) => {
        if (err) {
          const message =
            err.code === "LIMIT_FILE_SIZE"
              ? "Resume file is too large (max 5 MB)."
              : err.message || "Resume upload failed";
          return res.status(400).json({ message });
        }
        next();
      });
    },
    async (req, res) => {
      try {
        const file = (req as any).file as Express.Multer.File | undefined;
        if (!file) {
          return res.status(400).json({ message: "Resume is required (PDF, DOC, or DOCX)." });
        }
        if (!resumeContentMatchesType(file)) {
          return res
            .status(400)
            .json({ message: "Resume content does not match the expected PDF/DOC/DOCX format." });
        }
        const body = req.body as Record<string, string>;
        const merged = {
          ...body,
          resumeFilename: file.originalname,
          resumeMimeType: file.mimetype,
          resumeSize: String(file.size),
        };
        const validatedData = insertCareerApplicationSchema.parse(merged);
        const application = await storage.createCareerApplication(validatedData);
        const resume = file
          ? { filename: file.originalname, content: file.buffer, contentType: file.mimetype }
          : null;
        sendCareerEmail(validatedData, resume).catch((err) =>
          console.error("[career] Email error:", err),
        );
        res.status(201).json({ id: application.id });
      } catch (error: any) {
        if (error.name === "ZodError") {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        console.error("[career] Submission error:", error);
        res.status(500).json({ message: "Failed to submit career application" });
      }
    },
  );

  // ── Debug endpoint — logs all request headers (no auth required) ─────────
  app.get("/api/debug/headers", (req, res) => {
    const safe = { ...req.headers };
    // Mask any token values partially so they're not fully exposed in logs
    for (const k of Object.keys(safe)) {
      const v = safe[k] as string;
      if (typeof v === "string" && v.length > 8 &&
          (k.includes("key") || k.includes("auth") || k.includes("token"))) {
        safe[k] = v.slice(0, 4) + "****" + v.slice(-4);
      }
    }
    console.log("[debug/headers]", JSON.stringify(safe));
    res.json({ method: req.method, path: req.path, query: req.query, headers: safe });
  });

  // ── Marketing dashboard JSON export (public, no auth required) ─────────
  // GET /api/marketing/export — v2 public
  // Returns aggregated school marketing metrics for ChatGPT / external analysis.
  // Data is read-only and identical to the public dashboard — no PII involved.
  app.get("/api/marketing/export", async (req, res) => {
    try {
      const data = await import("@shared/marketingData");
      res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json({
        generatedAt: new Date().toISOString(),
        lastUpdated: data.LAST_UPDATED,
        todayDate: data.TODAY_DATE,
        daysInMay: data.DAYS_IN_MAY,
        minRevenuePerAdmission: data.MIN_REVENUE_PER_ADM,
        monthly: data.MONTHLY,
        organicPreSpend: data.ORGANIC_PRE_SPEND,
        lastYear: data.LAST_YEAR,
        mayWeekly: data.MAY_WEEKLY,
        social: data.SOCIAL,
        defaultFixedCosts: data.DEFAULT_FIXED,
        crmRps: data.CRM_RPS,
      });
    } catch (error) {
      console.error("[marketing/export] Error:", error);
      res.status(500).json({ message: "Failed to export marketing data" });
    }
  });

  // ── RPS-specific data export (token-protected) ────────────
  // GET /api/rps/export — returns only Rainbow Preschools data.
  // Same token auth as /api/marketing/export (ADMIN_TOKEN).
  app.get("/api/rps/export", async (req, res) => {
    try {
      const data = await import("@shared/marketingData");
      res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
      res.json({
        generatedAt: new Date().toISOString(),
        lastUpdated: data.LAST_UPDATED,
        school: "Rainbow Preschools (RPS)",
        website: "https://www.rainbowpreschools.com",
        centres: ["Aggarwal", "Anand Nagar", "Kasarvadavali", "Hariniwas", "Dhokali", "Kalwa"],
        monthly: data.MONTHLY.map((row) => ({
          month: row.month,
          rps: row.rps,
        })),
        organicPreSpend: data.ORGANIC_PRE_SPEND.rps,
        lastYear: data.LAST_YEAR.map((row) => ({
          month: row.month,
          rps: row.rps,
        })),
        mayWeekly: data.MAY_WEEKLY.map((row) => ({
          week: row.week,
          leads: row.rpsLeads,
          admissions: row.rpsAdm,
          walkins: row.rpsWalk,
          bookings: row.rpsBook,
        })),
        social: data.SOCIAL.rps,
        fixedCosts: data.DEFAULT_FIXED.rps,
        crmCentreWise: data.CRM_RPS,
      });
    } catch (error) {
      console.error("[rps/export] Error:", error);
      res.status(500).json({ message: "Failed to export RPS data" });
    }
  });

  // ── Brochure requests (Brand Partners privilege card) ─────
  app.post("/api/brochure-requests", async (req, res) => {
    try {
      const validatedData = insertBrochureRequestSchema.parse(req.body);
      const saved = await storage.createBrochureRequest(validatedData);
      res.status(201).json(saved);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to save brochure request" });
    }
  });

  // GET strips PII (name/email/phone) so the public Marketing dashboard widget
  // can render card numbers + timestamps without leaking contact details.
  // When ADMIN_TOKEN is set, callers may pass `Authorization: Bearer <token>`
  // (or `?token=<token>`) to receive the full record for internal admin tooling.
  app.get("/api/brochure-requests", async (req, res) => {
    try {
      const requests = await storage.getAllBrochureRequests();
      const adminToken = process.env.ADMIN_TOKEN;
      const headerToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      const queryToken = typeof req.query.token === "string" ? req.query.token : "";
      const isAdmin = !!adminToken && (headerToken === adminToken || queryToken === adminToken);
      if (isAdmin) {
        return res.json(requests);
      }
      const safe = requests.map((r) => ({
        id: r.id,
        cardNumber: r.cardNumber,
        requestedAt: r.requestedAt,
      }));
      res.json(safe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brochure requests" });
    }
  });

  // ── Events ──────────────────────────────────────────────────
  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    try {
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(req.params.id, validatedData);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // ── Google OAuth + Search Console + PageSpeed ────────────────
  const GOOGLE_SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/adwords",
    "https://www.googleapis.com/auth/spreadsheets",
  ];

  function getOAuthClient() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://rainbowinternationalschool.in/auth/google/callback"
    );
  }

  function getAuthenticatedClient() {
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (!refreshToken) return null;
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return oauth2Client;
  }

  app.get("/auth/google", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return res.status(503).json({ message: "Google credentials not configured" });
    }
    const oauth2Client = getOAuthClient();
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: GOOGLE_SCOPES,
      prompt: "consent",
    });
    res.redirect(url);
  });

  app.get("/auth/google/callback", async (req, res) => {
    const code = typeof req.query.code === "string" ? req.query.code : "";
    if (!code) return res.status(400).json({ message: "Missing code" });
    try {
      const oauth2Client = getOAuthClient();
      const { tokens } = await oauth2Client.getToken(code);
      const refreshToken = tokens.refresh_token;
      if (!refreshToken) {
        return res.status(400).send(`
          <html><body style="font-family:monospace;padding:2rem;background:#0f172a;color:#f8fafc">
          <h2 style="color:#f59e0b">No refresh token returned</h2>
          <p>This can happen if this Google account already authorised the app before.<br>
          Go to <a href="https://myaccount.google.com/permissions" style="color:#60a5fa">Google Account Permissions</a>, 
          revoke access for "Rainbow Group Bot", then visit 
          <a href="/auth/google" style="color:#60a5fa">/auth/google</a> again.</p>
          </body></html>`);
      }
      return res.send(`
        <html><body style="font-family:monospace;padding:2rem;background:#0f172a;color:#f8fafc">
        <h2 style="color:#22c55e">Google connected successfully</h2>
        <p>Copy the refresh token below and save it as a Replit secret named <strong style="color:#f59e0b">GOOGLE_REFRESH_TOKEN</strong></p>
        <div style="background:#1e293b;padding:1rem;border-radius:8px;margin:1rem 0;word-break:break-all;color:#86efac;font-size:0.9rem">${refreshToken}</div>
        <p style="color:#94a3b8;font-size:0.85rem">Once saved as a secret, the /api/gsc/* and /api/pagespeed endpoints will be live.</p>
        </body></html>`);
    } catch (err: any) {
      res.status(500).json({ message: "OAuth exchange failed", error: err.message });
    }
  });

  // Site URL resolver for GSC — used by both /api/search-console/* and /api/gsc/*
  function resolveGscSiteUrl(account: string): string {
    if (account === "rps") return "sc-domain:rainbowpreschools.com";
    return "https://rainbowinternationalschool.in/"; // default = ris
  }

  // ── /api/search-console/* — ChatGPT-friendly aliases with ?account=ris|rps ──
  app.get("/api/search-console/queries", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    const auth = getAuthenticatedClient();
    if (!auth) return res.status(503).json({ message: "Google not connected. Visit /auth/google to connect." });
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const siteUrl = resolveGscSiteUrl(account);
    const startDate = (req.query.startDate as string) || new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
    const endDate = (req.query.endDate as string) || new Date().toISOString().slice(0, 10);
    try {
      const sc = google.searchconsole({ version: "v1", auth });
      const result = await sc.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, dimensions: ["query"], rowLimit: 25 },
      });
      const rows = (result.data.rows || []).map((r: any) => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: parseFloat((r.ctr * 100).toFixed(2)),
        position: parseFloat(r.position.toFixed(1)),
      }));
      res.json({ account: account.toUpperCase(), site: siteUrl, startDate, endDate, generatedAt: new Date().toISOString(), rows });
    } catch (err: any) {
      res.status(500).json({ message: "GSC query failed", error: err.message });
    }
  });

  app.get("/api/search-console/pages", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    const auth = getAuthenticatedClient();
    if (!auth) return res.status(503).json({ message: "Google not connected. Visit /auth/google to connect." });
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const siteUrl = resolveGscSiteUrl(account);
    const startDate = (req.query.startDate as string) || new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
    const endDate = (req.query.endDate as string) || new Date().toISOString().slice(0, 10);
    try {
      const sc = google.searchconsole({ version: "v1", auth });
      const result = await sc.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, dimensions: ["page"], rowLimit: 25 },
      });
      const rows = (result.data.rows || []).map((r: any) => ({
        page: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: parseFloat((r.ctr * 100).toFixed(2)),
        position: parseFloat(r.position.toFixed(1)),
      }));
      res.json({ account: account.toUpperCase(), site: siteUrl, startDate, endDate, generatedAt: new Date().toISOString(), rows });
    } catch (err: any) {
      res.status(500).json({ message: "GSC pages query failed", error: err.message });
    }
  });

  app.get("/api/gsc/queries", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const adminToken = process.env.ADMIN_TOKEN;
    const provided = (req.headers["x-api-key"] as string) ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
      (typeof req.query.token === "string" ? req.query.token : "");
    if (!adminToken || !provided || !timingSafeEqual(Buffer.from(adminToken), Buffer.from(provided.padEnd(adminToken.length).slice(0, adminToken.length)))) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const auth = getAuthenticatedClient();
    if (!auth) return res.status(503).json({ message: "Google not connected. Visit /auth/google to connect." });
    try {
      const sc = google.searchconsole({ version: "v1", auth });
      const siteUrl = (req.query.site as string) || "https://rainbowinternationalschool.in/";
      const startDate = (req.query.startDate as string) || new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
      const endDate = (req.query.endDate as string) || new Date().toISOString().slice(0, 10);
      const result = await sc.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["query"],
          rowLimit: 25,
          dimensionFilterGroups: [],
        },
      });
      const rows = (result.data.rows || []).map((r: any) => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: parseFloat((r.ctr * 100).toFixed(2)),
        position: parseFloat(r.position.toFixed(1)),
      }));
      res.json({ site: siteUrl, startDate, endDate, generatedAt: new Date().toISOString(), rows });
    } catch (err: any) {
      res.status(500).json({ message: "GSC query failed", error: err.message });
    }
  });

  app.get("/api/gsc/pages", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const adminToken = process.env.ADMIN_TOKEN;
    const provided = (req.headers["x-api-key"] as string) ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
      (typeof req.query.token === "string" ? req.query.token : "");
    if (!adminToken || !provided || !timingSafeEqual(Buffer.from(adminToken), Buffer.from(provided.padEnd(adminToken.length).slice(0, adminToken.length)))) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const auth = getAuthenticatedClient();
    if (!auth) return res.status(503).json({ message: "Google not connected. Visit /auth/google to connect." });
    try {
      const sc = google.searchconsole({ version: "v1", auth });
      const siteUrl = (req.query.site as string) || "https://rainbowinternationalschool.in/";
      const startDate = (req.query.startDate as string) || new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
      const endDate = (req.query.endDate as string) || new Date().toISOString().slice(0, 10);
      const result = await sc.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["page"],
          rowLimit: 25,
        },
      });
      const rows = (result.data.rows || [])
        .map((r: any) => ({
          page: r.keys[0],
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: parseFloat((r.ctr * 100).toFixed(2)),
          position: parseFloat(r.position.toFixed(1)),
        }))
        .filter((r: any) => r.impressions > 100 && r.ctr < 3)
        .sort((a: any, b: any) => b.impressions - a.impressions);
      res.json({ site: siteUrl, startDate, endDate, generatedAt: new Date().toISOString(), note: "Pages with >100 impressions and <3% CTR — highest SEO opportunity", rows });
    } catch (err: any) {
      res.status(500).json({ message: "GSC pages query failed", error: err.message });
    }
  });

  app.get("/api/pagespeed", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const url = (req.query.url as string) || "https://rainbowinternationalschool.in/";
    const strategy = (req.query.strategy as string) === "desktop" ? "DESKTOP" : "MOBILE";
    try {
      const apiKey = process.env.GOOGLE_API_KEY ? `&key=${process.env.GOOGLE_API_KEY}` : "";
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}${apiKey}`;
      const fetch = (await import("node-fetch")).default;
      const r = await fetch(apiUrl);
      const data: any = await r.json();
      if (data.error) throw new Error(data.error.message);
      const cats = data.lighthouseResult?.categories || {};
      const audits = data.lighthouseResult?.audits || {};
      res.json({
        url,
        strategy,
        generatedAt: new Date().toISOString(),
        scores: {
          performance: Math.round((cats.performance?.score || 0) * 100),
          accessibility: Math.round((cats.accessibility?.score || 0) * 100),
          bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
          seo: Math.round((cats.seo?.score || 0) * 100),
        },
        coreWebVitals: {
          lcp: audits["largest-contentful-paint"]?.displayValue,
          inp: audits["interaction-to-next-paint"]?.displayValue,
          cls: audits["cumulative-layout-shift"]?.displayValue,
          fcp: audits["first-contentful-paint"]?.displayValue,
          ttfb: audits["server-response-time"]?.displayValue,
        },
        topOpportunities: Object.values(audits)
          .filter((a: any) => a.details?.type === "opportunity" && a.score !== null && a.score < 0.9)
          .map((a: any) => ({ id: a.id, title: a.title, savings: a.displayValue }))
          .slice(0, 5),
      });
    } catch (err: any) {
      res.status(500).json({ message: "PageSpeed check failed", error: err.message });
    }
  });

  // ── Google Ads ───────────────────────────────────────────────
  function requireAdminToken(_req: any, _res: any): boolean {
    return true;
  }

  async function getGoogleAdsClient() {
    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!devToken || !refreshToken || !clientId || !clientSecret) return null;
    const { GoogleAdsApi } = await import("google-ads-api");
    return new GoogleAdsApi({
      client_id: clientId,
      client_secret: clientSecret,
      developer_token: devToken,
    });
  }

  function resolveCustomerId(account: string): string | null {
    if (account === "rps") return (process.env.GOOGLE_ADS_CUSTOMER_ID_RPS || "").replace(/-/g, "");
    if (account === "ris") return (process.env.GOOGLE_ADS_CUSTOMER_ID_RIS || "").replace(/-/g, "");
    return null;
  }

  /** Returns current-month date range as YYYY-MM-DD strings for GAQL BETWEEN. */
  function gaMonthRange(): { start: string; end: string } {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    return { start: `${y}-${m}-01`, end: `${y}-${m}-${d}` };
  }

  /** Shared: build a Google Ads Customer context for a given account slug. */
  async function getGoogleAdsCustomer(account: string) {
    const customerId = resolveCustomerId(account);
    if (!customerId) return null;
    const client = await getGoogleAdsClient();
    if (!client) return null;
    const mccId = (process.env.GOOGLE_ADS_CUSTOMER_ID_MCC || "").replace(/-/g, "") || customerId;
    return client.Customer({
      customer_id: customerId,
      login_customer_id: mccId,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN || "",
    });
  }

  app.get("/api/google-ads/campaigns", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");


    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!devToken) return res.status(503).json({ message: "Google Ads developer token not configured. Apply at ads.google.com → Tools → API Centre." });

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });

    const client = await getGoogleAdsClient();
    if (!client) return res.status(503).json({ message: "Google Ads not configured" });

    try {
      const mccId = (process.env.GOOGLE_ADS_CUSTOMER_ID_MCC || "").replace(/-/g, "") || customerId;
      const customer = client.Customer({
        customer_id: customerId,
        login_customer_id: mccId,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN || "",
      });

      const range = gaMonthRange();
      const campaigns = await customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc
        FROM campaign
        WHERE segments.date BETWEEN '${range.start}' AND '${range.end}'
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
      `);

      const rows = campaigns
        .filter((c: any) => (c.metrics.cost_micros || 0) > 0)
        .map((c: any) => {
          const spend = parseFloat((c.metrics.cost_micros / 1_000_000).toFixed(2));
          const conversions = parseFloat((c.metrics.conversions || 0).toFixed(1));
          return {
            id: c.campaign.id,
            name: c.campaign.name,
            status: c.campaign.status,
            type: c.campaign.advertising_channel_type,
            impressions: c.metrics.impressions,
            clicks: c.metrics.clicks,
            spend,
            conversions,
            ctr: parseFloat(((c.metrics.ctr || 0) * 100).toFixed(2)),
            avgCpc: parseFloat(((c.metrics.average_cpc || 0) / 1_000_000).toFixed(2)),
            costPerConversion: conversions > 0
              ? parseFloat((spend / conversions).toFixed(2))
              : null,
          };
        });

      res.json({
        account: account.toUpperCase(),
        customerId,
        period: `${range.start} to ${range.end}`,
        generatedAt: new Date().toISOString(),
        campaigns: rows,
      });
    } catch (err: any) {
      const reason = err?.reason || err?.message || "Unknown error";
      const detail = JSON.stringify(err, Object.getOwnPropertyNames(err)).slice(0, 800);
      const status = reason === "ACCESS_TOKEN_SCOPE_INSUFFICIENT" ? 403 : 500;
      res.status(status).json({ message: "Google Ads campaign query failed", reason, detail });
    }
  });

  app.get("/api/google-ads/keywords", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");


    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!devToken) return res.status(503).json({ message: "Google Ads developer token not configured" });

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });

    const client = await getGoogleAdsClient();
    if (!client) return res.status(503).json({ message: "Google Ads not configured" });

    try {
      const mccId = (process.env.GOOGLE_ADS_CUSTOMER_ID_MCC || "").replace(/-/g, "") || customerId;
      const customer = client.Customer({
        customer_id: customerId,
        login_customer_id: mccId,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN || "",
      });

      const range = gaMonthRange();
      const keywords = await customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          ad_group.id,
          ad_group.name,
          ad_group_criterion.criterion_id,
          ad_group_criterion.status,
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.quality_info.quality_score,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc
        FROM keyword_view
        WHERE segments.date BETWEEN '${range.start}' AND '${range.end}'
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
      `);

      const rows = keywords
        .filter((k: any) => (k.metrics.cost_micros || 0) > 0)
        .map((k: any) => ({
          campaignId: k.campaign.id,
          campaignName: k.campaign.name,
          adGroupId: k.ad_group.id,
          adGroupName: k.ad_group.name,
          criterionId: k.ad_group_criterion.criterion_id,
          status: k.ad_group_criterion.status,
          keyword: k.ad_group_criterion.keyword.text,
          matchType: k.ad_group_criterion.keyword.match_type,
          qualityScore: k.ad_group_criterion.quality_info?.quality_score || null,
          impressions: k.metrics.impressions,
          clicks: k.metrics.clicks,
          spend: parseFloat((k.metrics.cost_micros / 1_000_000).toFixed(2)),
          conversions: parseFloat((k.metrics.conversions || 0).toFixed(1)),
          ctr: parseFloat(((k.metrics.ctr || 0) * 100).toFixed(2)),
          avgCpc: parseFloat(((k.metrics.average_cpc || 0) / 1_000_000).toFixed(2)),
        }));

      res.json({
        account: account.toUpperCase(),
        customerId,
        period: `${range.start} to ${range.end}`,
        generatedAt: new Date().toISOString(),
        keywords: rows,
      });
    } catch (err: any) {
      const reason = err?.reason || err?.message || "Unknown error";
      const detail = JSON.stringify(err, Object.getOwnPropertyNames(err)).slice(0, 800);
      const status = reason === "ACCESS_TOKEN_SCOPE_INSUFFICIENT" ? 403 : 500;
      res.status(status).json({ message: "Google Ads keyword query failed", reason, detail });
    }
  });

  // ── Google Ads: Campaign Settings (config, bidding, budget) ──
  app.get("/api/google-ads/campaign-settings", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });
    const customer = await getGoogleAdsCustomer(account);
    if (!customer) return res.status(503).json({ message: "Google Ads not configured" });
    try {
      const rows = await customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.bidding_strategy_type,
          campaign_budget.amount_micros,
          campaign_budget.delivery_method
        FROM campaign
        WHERE campaign.status IN ('ENABLED', 'PAUSED')
        ORDER BY campaign.name
        LIMIT 50
      `);
      res.json({
        account: account.toUpperCase(), customerId,
        generatedAt: new Date().toISOString(),
        campaigns: rows.map((r: any) => ({
          id: r.campaign.id,
          name: r.campaign.name,
          status: r.campaign.status,
          type: r.campaign.advertising_channel_type,
          biddingStrategy: r.campaign.bidding_strategy_type,
          dailyBudget: r.campaign_budget?.amount_micros
            ? parseFloat((r.campaign_budget.amount_micros / 1_000_000).toFixed(2)) : null,
          deliveryMethod: r.campaign_budget?.delivery_method || null,
        })),
      });
    } catch (err: any) {
      const reason = err?.reason || err?.message || "Unknown";
      const detail = JSON.stringify(err, Object.getOwnPropertyNames(err)).slice(0, 600);
      res.status(500).json({ message: "Google Ads campaign-settings query failed", reason, detail });
    }
  });

  // ── Google Ads: Ad Groups ──────────────────────────────────────
  app.get("/api/google-ads/ad-groups", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });
    const customer = await getGoogleAdsCustomer(account);
    if (!customer) return res.status(503).json({ message: "Google Ads not configured" });
    try {
      const range = gaMonthRange();
      const rows = await customer.query(`
        SELECT
          campaign.id, campaign.name, campaign.status,
          ad_group.id, ad_group.name, ad_group.status, ad_group.type,
          metrics.impressions, metrics.clicks, metrics.cost_micros,
          metrics.conversions, metrics.ctr, metrics.average_cpc
        FROM ad_group
        WHERE segments.date BETWEEN '${range.start}' AND '${range.end}'
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
      `);
      res.json({
        account: account.toUpperCase(), customerId,
        period: `${range.start} to ${range.end}`,
        generatedAt: new Date().toISOString(),
        adGroups: rows.map((r: any) => ({
          campaignId: r.campaign.id, campaignName: r.campaign.name, campaignStatus: r.campaign.status,
          adGroupId: r.ad_group.id, adGroupName: r.ad_group.name, adGroupStatus: r.ad_group.status,
          type: r.ad_group.type,
          impressions: r.metrics.impressions, clicks: r.metrics.clicks,
          spend: parseFloat((r.metrics.cost_micros / 1_000_000).toFixed(2)),
          conversions: parseFloat((r.metrics.conversions || 0).toFixed(1)),
          ctr: parseFloat(((r.metrics.ctr || 0) * 100).toFixed(2)),
          avgCpc: parseFloat(((r.metrics.average_cpc || 0) / 1_000_000).toFixed(2)),
        })),
      });
    } catch (err: any) {
      res.status(500).json({ message: "Google Ads ad-groups query failed", reason: err?.reason || err?.message });
    }
  });

  // ── Google Ads: Ads (copy + landing pages) ────────────────────
  app.get("/api/google-ads/ads", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });
    const customer = await getGoogleAdsCustomer(account);
    if (!customer) return res.status(503).json({ message: "Google Ads not configured" });
    try {
      const range = gaMonthRange();
      const rows = await customer.query(`
        SELECT
          campaign.id, campaign.name, campaign.status,
          ad_group.id, ad_group.name,
          ad_group_ad.ad.id, ad_group_ad.status, ad_group_ad.ad.type,
          ad_group_ad.ad.final_urls,
          ad_group_ad.ad.responsive_search_ad.headlines,
          ad_group_ad.ad.responsive_search_ad.descriptions,
          metrics.impressions, metrics.clicks, metrics.cost_micros,
          metrics.conversions, metrics.ctr
        FROM ad_group_ad
        WHERE segments.date BETWEEN '${range.start}' AND '${range.end}'
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
      `);
      res.json({
        account: account.toUpperCase(), customerId,
        period: `${range.start} to ${range.end}`,
        generatedAt: new Date().toISOString(),
        ads: rows.map((r: any) => ({
          campaignId: r.campaign.id, campaignName: r.campaign.name, campaignStatus: r.campaign.status,
          adGroupId: r.ad_group.id, adGroupName: r.ad_group.name,
          adId: r.ad_group_ad.ad?.id, adStatus: r.ad_group_ad.status, adType: r.ad_group_ad.ad?.type,
          finalUrls: r.ad_group_ad.ad?.final_urls || [],
          headlines: (r.ad_group_ad.ad?.responsive_search_ad?.headlines || []).map((h: any) => h.text).filter(Boolean),
          descriptions: (r.ad_group_ad.ad?.responsive_search_ad?.descriptions || []).map((d: any) => d.text).filter(Boolean),
          impressions: r.metrics.impressions, clicks: r.metrics.clicks,
          spend: parseFloat((r.metrics.cost_micros / 1_000_000).toFixed(2)),
          conversions: parseFloat((r.metrics.conversions || 0).toFixed(1)),
          ctr: parseFloat(((r.metrics.ctr || 0) * 100).toFixed(2)),
        })),
      });
    } catch (err: any) {
      res.status(500).json({ message: "Google Ads ads query failed", reason: err?.reason || err?.message });
    }
  });

  // ── Google Ads: Location Targeting ────────────────────────────
  app.get("/api/google-ads/locations", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });
    const customer = await getGoogleAdsCustomer(account);
    if (!customer) return res.status(503).json({ message: "Google Ads not configured" });
    try {
      const rows = await customer.query(`
        SELECT
          campaign.id, campaign.name, campaign.status,
          campaign_criterion.criterion_id, campaign_criterion.type,
          campaign_criterion.negative,
          campaign_criterion.location.geo_target_constant,
          campaign_criterion.proximity.radius,
          campaign_criterion.proximity.radius_units,
          campaign_criterion.proximity.address.city_name,
          campaign_criterion.proximity.address.street_address,
          campaign_criterion.proximity.geo_point.latitude_in_micro_degrees,
          campaign_criterion.proximity.geo_point.longitude_in_micro_degrees
        FROM campaign_criterion
        WHERE campaign_criterion.type IN ('LOCATION', 'PROXIMITY')
        LIMIT 100
      `);
      res.json({
        account: account.toUpperCase(), customerId,
        generatedAt: new Date().toISOString(),
        locations: rows.map((r: any) => ({
          campaignId: r.campaign.id, campaignName: r.campaign.name, campaignStatus: r.campaign.status,
          criterionId: r.campaign_criterion.criterion_id,
          type: r.campaign_criterion.type,
          isNegative: r.campaign_criterion.negative,
          geoTargetConstant: r.campaign_criterion.location?.geo_target_constant || null,
          proximity: r.campaign_criterion.proximity ? {
            radius: r.campaign_criterion.proximity.radius,
            radiusUnits: r.campaign_criterion.proximity.radius_units,
            cityName: r.campaign_criterion.proximity.address?.city_name || null,
            streetAddress: r.campaign_criterion.proximity.address?.street_address || null,
            latMicro: r.campaign_criterion.proximity.geo_point?.latitude_in_micro_degrees || null,
            lngMicro: r.campaign_criterion.proximity.geo_point?.longitude_in_micro_degrees || null,
          } : null,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ message: "Google Ads locations query failed", reason: err?.reason || err?.message });
    }
  });

  // ── Google Ads: Conversion Actions ────────────────────────────
  app.get("/api/google-ads/conversion-actions", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });
    const customer = await getGoogleAdsCustomer(account);
    if (!customer) return res.status(503).json({ message: "Google Ads not configured" });
    try {
      const rows = await customer.query(`
        SELECT
          conversion_action.id, conversion_action.name,
          conversion_action.status, conversion_action.type,
          conversion_action.category, conversion_action.origin,
          conversion_action.counting_type,
          conversion_action.include_in_conversions_metric
        FROM conversion_action
        ORDER BY conversion_action.name
        LIMIT 50
      `);
      res.json({
        account: account.toUpperCase(), customerId,
        generatedAt: new Date().toISOString(),
        conversionActions: rows.map((r: any) => ({
          id: r.conversion_action.id,
          name: r.conversion_action.name,
          status: r.conversion_action.status,
          type: r.conversion_action.type,
          category: r.conversion_action.category,
          origin: r.conversion_action.origin,
          countingType: r.conversion_action.counting_type,
          includeInConversionsMetric: r.conversion_action.include_in_conversions_metric,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ message: "Google Ads conversion-actions query failed", reason: err?.reason || err?.message });
    }
  });

  // ── Meta Ads ─────────────────────────────────────────────────
  const META_API = "https://graph.facebook.com/v19.0";

  function resolveMetaAccountId(_account: string): string | null {
    // Both RIS and RPS run on the same ad account
    return (
      process.env.META_AD_ACCOUNT_ID ||
      process.env.META_AD_ACCOUNT_ID_RIS ||
      process.env.META_AD_ACCOUNT_ID_RPS ||
      null
    );
  }

  function metaCampaignMatchesAccount(name: string, account: string): boolean {
    const n = name.toLowerCase();
    if (account === "ris") return n.includes("ris") || n.includes("rainbow international school") || n.includes("school");
    if (account === "rps") return n.includes("rps") || n.includes("preschool") || n.includes("rainbow ps") || n.includes("playschool");
    return true;
  }

  app.get("/api/meta-ads/campaigns", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");


    const token = process.env.META_ADS_TOKEN;
    if (!token) return res.status(503).json({ message: "Meta Ads token not configured. Add META_ADS_TOKEN secret." });

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "all";
    const accountId = resolveMetaAccountId(account);
    if (!accountId) return res.status(503).json({ message: "Meta Ads account ID not configured. Add META_AD_ACCOUNT_ID secret." });

    try {
      const fields = [
        "id", "name", "status", "objective",
        "insights.date_preset(last_30d){impressions,clicks,spend,reach,frequency,ctr,cpc,actions,cost_per_action_type}",
      ].join(",");

      const url = `${META_API}/act_${accountId}/campaigns`;
      const response = await fetch(`${url}?fields=${encodeURIComponent(fields)}&limit=50&access_token=${token}`);
      const data: any = await response.json();

      if (data.error) return res.status(502).json({ message: "Meta Ads API error", error: data.error.message, code: data.error.code });

      const allCampaigns = (data.data || []).map((c: any) => {
        const ins = c.insights?.data?.[0] || {};
        const leads = (ins.actions || []).find((a: any) => a.action_type === "lead")?.value || 0;
        const landingViews = (ins.actions || []).find((a: any) => a.action_type === "landing_page_view")?.value || 0;
        const costPerLead = (ins.cost_per_action_type || []).find((a: any) => a.action_type === "lead")?.value || null;
        return {
          id: c.id,
          name: c.name,
          status: c.status,
          objective: c.objective,
          impressions: parseInt(ins.impressions || "0"),
          clicks: parseInt(ins.clicks || "0"),
          spend: parseFloat(parseFloat(ins.spend || "0").toFixed(2)),
          reach: parseInt(ins.reach || "0"),
          frequency: parseFloat(parseFloat(ins.frequency || "0").toFixed(2)),
          ctr: parseFloat(parseFloat(ins.ctr || "0").toFixed(2)),
          cpc: parseFloat(parseFloat(ins.cpc || "0").toFixed(2)),
          leads: parseInt(leads),
          landingPageViews: parseInt(landingViews),
          costPerLead: costPerLead ? parseFloat(parseFloat(costPerLead).toFixed(2)) : null,
        };
      });

      // Filter by brand if account=ris or account=rps; otherwise return all
      const campaigns = (account === "all")
        ? allCampaigns
        : allCampaigns.filter((c: any) => metaCampaignMatchesAccount(c.name, account));

      res.json({
        account: account.toUpperCase(),
        accountId,
        note: account === "all" ? "All campaigns across both brands" : `Campaigns filtered by name matching ${account.toUpperCase()}`,
        period: "last 30 days",
        generatedAt: new Date().toISOString(),
        campaigns,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Meta Ads campaign fetch failed", error: err.message });
    }
  });

  app.get("/api/meta-ads/insights", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");


    const token = process.env.META_ADS_TOKEN;
    if (!token) return res.status(503).json({ message: "Meta Ads token not configured. Add META_ADS_TOKEN secret." });

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "all";
    const accountId = resolveMetaAccountId(account);
    if (!accountId) return res.status(503).json({ message: "Meta Ads account ID not configured. Add META_AD_ACCOUNT_ID secret." });

    try {
      const fields = "impressions,clicks,spend,reach,frequency,ctr,cpc,actions,cost_per_action_type,account_name,account_currency";
      const url = `${META_API}/act_${accountId}/insights`;
      const response = await fetch(`${url}?fields=${encodeURIComponent(fields)}&date_preset=last_30d&level=account&access_token=${token}`);
      const data: any = await response.json();

      if (data.error) return res.status(502).json({ message: "Meta Ads API error", error: data.error.message, code: data.error.code });

      const ins = data.data?.[0] || {};
      const leads = (ins.actions || []).find((a: any) => a.action_type === "lead")?.value || 0;
      const msgSent = (ins.actions || []).find((a: any) => a.action_type === "onsite_conversion.messaging_conversation_started_7d")?.value || 0;
      const postEngagement = (ins.actions || []).find((a: any) => a.action_type === "post_engagement")?.value || 0;
      const costPerLead = (ins.cost_per_action_type || []).find((a: any) => a.action_type === "lead")?.value || null;

      res.json({
        account: account.toUpperCase(),
        accountId,
        note: "Combined account-level insights — both RIS and RPS campaigns",
        accountName: ins.account_name,
        currency: ins.account_currency,
        period: "last 30 days",
        generatedAt: new Date().toISOString(),
        summary: {
          impressions: parseInt(ins.impressions || "0"),
          clicks: parseInt(ins.clicks || "0"),
          spend: parseFloat(parseFloat(ins.spend || "0").toFixed(2)),
          reach: parseInt(ins.reach || "0"),
          frequency: parseFloat(parseFloat(ins.frequency || "0").toFixed(2)),
          ctr: parseFloat(parseFloat(ins.ctr || "0").toFixed(2)),
          cpc: parseFloat(parseFloat(ins.cpc || "0").toFixed(2)),
          leads: parseInt(leads),
          messageConversationsStarted: parseInt(msgSent),
          postEngagement: parseInt(postEngagement),
          costPerLead: costPerLead ? parseFloat(parseFloat(costPerLead).toFixed(2)) : null,
        },
      });
    } catch (err: any) {
      res.status(500).json({ message: "Meta Ads insights fetch failed", error: err.message });
    }
  });

  // ── Marketing Live Dashboard (no-auth, aggregated data only) ──
  app.get("/api/marketing/live", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    try {
      const parseINR = (s: string | undefined) => parseInt(String(s ?? "0").replace(/[₹,\s]/g, "")) || 0;
      const parseN   = (s: string | undefined) => parseInt(String(s ?? "0").replace(/[,\s%]/g, "")) || 0;

      // ── Dynamic current-month tab discovery ──────────────────────────────────────
      // The master sheet has one tab per month named e.g. "DM RPS JUNE' 26".
      // Fetch metadata once and cache it for this request, then search by school + month.
      const MONTH_NAMES_UPPER = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
        "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];

      let _masterTabs: string[] | null = null;
      const getMasterTabs = async (): Promise<string[]> => {
        if (_masterTabs) return _masterTabs;
        try {
          const auth = getAuthenticatedClient();
          if (!auth) return (_masterTabs = []);
          const { google: goog } = await import("googleapis");
          const sheets = goog.sheets({ version: "v4", auth });
          const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_IDS.master });
          _masterTabs = (meta.data.sheets ?? []).map((s: any) => s.properties?.title ?? "");
        } catch { _masterTabs = []; }
        return _masterTabs!;
      };

      // Find the most recent DM tab for a school (tries current month → up to 3 prior months)
      const getCurrentSchoolTab = async (school: "RPS" | "RIS"): Promise<string | null> => {
        const titles = await getMasterTabs();
        const now = new Date();
        for (let offset = 0; offset <= 3; offset++) {
          const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
          const mon = MONTH_NAMES_UPPER[d.getMonth()];
          const match = titles.find(t => t.toUpperCase().includes(`DM ${school}`) && t.toUpperCase().includes(mon));
          if (match) return match;
        }
        return null;
      };

      // Quote a tab title for A1 notation: wrap in U+0027, double any internal U+0027
      const quoteTab = (title: string, suffix: string) =>
        `'${title.replace(/'/g, "''")}'${suffix}`;

      // Fetch full school tab (A:T covers both summary section and spend analysis table)
      const fetchSchoolTab = async (school: "RPS" | "RIS"): Promise<string[][]> => {
        const tab = await getCurrentSchoolTab(school);
        if (!tab) return [];
        try { return await fetchSheetRange(SHEET_IDS.master, quoteTab(tab, "!A:T")); } catch { return []; }
      };

      // CRM + master + current-month school tabs — all fetched in parallel
      const [masterRows, rpsCrmRows, risCrmRows, rpsAllRows, risAllRows] = await Promise.all([
        fetchSheetRange(SHEET_IDS.master, "DM Overall!A1:Z65"),
        fetchSheetRange(SHEET_IDS.rpsCrm, "DM 2026-27!A:K"),
        fetchSheetRange(SHEET_IDS.risCrm, "Nur to Class 12!A:L"),
        fetchSchoolTab("RPS"),
        fetchSchoolTab("RIS"),
      ]);
      // Both school summary rows and spend analysis come from the same full-tab fetch
      const rpsSchoolRows = rpsAllRows;
      const risSchoolRows = risAllRows;
      const rpsSpendRaw   = rpsAllRows;
      const risSpendRaw   = risAllRows;

      // ── Per-school master monthly totals (source of truth for walkins/admissions) ──
      // The per-school May tabs contain monthly-level summary rows for all months
      // (all-caps: DECEMBER, JANUARY … APRIL; in-progress month: MAY TOTAL)
      const SCHOOL_MONTH_KEY: Record<string, string> = {
        "AUGUST":"Aug-25","SEPTEMBER":"Sep-25","OCTOBER":"Oct-25","NOVEMBER":"Nov-25",
        "DECEMBER":"Dec-25","JANUARY":"Jan-26","FEBRUARY":"Feb-26","MARCH":"Mar-26",
        "APRIL":"Apr-26",
        "MAY":"May-26","MAY TOTAL":"May-26",           // completed May (in June tab) or in-progress
        "JUNE TOTAL":"Jun-26",                          // current-month June total; bare "JUNE" = June 2025 historical row, skip it
      };
      const parseSchoolRows = (rows: string[][]): Array<{month:string;leads:number;bookings:number;walkins:number;admissions:number}> => {
        const hIdx = rows.findIndex(r => r.some(c => String(c).includes("Total Walkins")));
        if (hIdx === -1) return [];
        const header = rows[hIdx];
        const leadCol = header.findIndex(h => String(h).includes("Total Leads"));
        const bookCol = header.findIndex(h => String(h).toLowerCase().includes("booking"));
        const wCol    = header.findIndex(h => String(h).includes("Total Walkins"));
        const aCol    = header.findIndex(h => String(h).includes("Total Admissions"));
        const seen = new Set<string>();
        const result: Array<{month:string;leads:number;bookings:number;walkins:number;admissions:number}> = [];
        for (const row of rows.slice(hIdx + 1)) {
          // In DM RIS/RPS school tabs the date label (e.g. "JUNE TOTAL") is in column B (row[1]).
          // Column A (row[0]) is a blank marker column. Check B first, fall back to A.
          const r1 = String(row[1] ?? "").trim().toUpperCase();
          const r0 = String(row[0] ?? "").trim().toUpperCase();
          const crmKey = SCHOOL_MONTH_KEY[r1] ?? SCHOOL_MONTH_KEY[r0];
          if (crmKey && !seen.has(crmKey)) {
            seen.add(crmKey);
            const p = (v: unknown) => parseInt(String(v ?? 0).replace(/[₹,\s]/g,"")) || 0;
            result.push({
              month:      crmKey,
              leads:      leadCol >= 0 ? p(row[leadCol]) : 0,
              bookings:   bookCol >= 0 ? p(row[bookCol]) : 0,
              walkins:    p(row[wCol]),
              admissions: p(row[aCol]),
            });
          }
        }
        return result;
      };
      const rpsSchoolMonthly = parseSchoolRows(rpsSchoolRows);
      const risSchoolMonthly = parseSchoolRows(risSchoolRows);

      // ── Per-school weekly rows (for the weekly breakdown table) ──
      // Reads weekly aggregate rows (date ranges like "01/06 - 07/06") from the current school tab.
      const parseSchoolWeeklyRows = (rows: string[][]): Array<{week:string;leads:number;bookings:number;walkins:number;admissions:number}> => {
        const hIdx = rows.findIndex(r => r.some(c => String(c).includes("Total Walkins")));
        if (hIdx === -1) return [];
        const header = rows[hIdx];
        const leadCol = header.findIndex(h => String(h).includes("Total Leads"));
        const bookCol = header.findIndex(h => String(h).toLowerCase().includes("booking"));
        const wCol    = header.findIndex(h => String(h).includes("Total Walkins"));
        const aCol    = header.findIndex(h => String(h).includes("Total Admissions"));
        const result: Array<{week:string;leads:number;bookings:number;walkins:number;admissions:number}> = [];
        for (const row of rows.slice(hIdx + 1)) {
          const label = String(row[1] ?? "").trim();
          if (String(row[0] ?? "").toUpperCase().includes("DIGITAL") || label.toUpperCase().includes("DIGITAL")) break;
          // Weekly aggregate rows have a date-range format: "01/06 - 07/06" (contains both "/" and "-")
          if (label.includes("/") && label.includes("-")) {
            result.push({
              week: label,
              leads:      parseInt(String(row[leadCol] ?? 0).replace(/[₹,\s]/g,"")) || 0,
              bookings:   parseInt(String(row[bookCol] ?? 0).replace(/[₹,\s]/g,"")) || 0,
              walkins:    parseInt(String(row[wCol]    ?? 0).replace(/[₹,\s]/g,"")) || 0,
              admissions: parseInt(String(row[aCol]    ?? 0).replace(/[₹,\s]/g,"")) || 0,
            });
          }
        }
        return result;
      };
      const rpsWeekly = parseSchoolWeeklyRows(rpsSchoolRows);
      const risWeekly = parseSchoolWeeklyRows(risSchoolRows);

      // ── Per-school Meta/Google spend from the "DIGITAL MARKETING SPEND ANALYSIS" table ──
      // Both "DM RIS MAY' 26" and "DM RPS MAY' 26" tabs contain this table after the weekly rows.
      // Month names in the table: "June"…"December" (2025), "January"…"May" (2026).
      const SPEND_MONTH_MAP: Record<string, string> = {
        "June":"Jun 25","July":"Jul 25","August":"Aug 25","September":"Sep 25",
        "October":"Oct 25","November":"Nov 25","December":"Dec 25",
        "January":"Jan 26","February":"Feb 26","March":"Mar 26","April":"Apr 26","May":"May 26",
        "June26":"Jun 26", // sentinel key used internally when a 2nd June row is detected
      };
      // Track whether we've already mapped a "June" (Jun 25); the next one is Jun 26
      const spendSeenMonths = new Set<string>();
      const parseSpendRows = (rows: string[][]): Array<{month:string;salaries:number;meta:number;google:number;adSpend:number}> => {
        // Find header row: must contain both "meta" and "google" (partial, case-insensitive)
        const hIdx = rows.findIndex(r => {
          const cells = r.map(c => String(c).trim().toLowerCase());
          return cells.some(c => c.includes("meta")) && cells.some(c => c.includes("google"));
        });
        if (hIdx === -1) return [];
        const header = rows[hIdx];
        const metaCol   = header.findIndex(h => String(h).trim().toLowerCase().includes("meta"));
        const googleCol = header.findIndex(h => String(h).trim().toLowerCase().includes("google"));
        const salaryCol = header.findIndex(h => String(h).trim().toLowerCase().includes("salar"));
        if (metaCol === -1 || googleCol === -1) return [];

        const afterHeader = rows.slice(hIdx + 1);

        // Dynamically detect which column holds month names (some sheets have Month at col B, not col A)
        let monthCol = 0;
        for (const row of afterHeader.slice(0, 10)) {
          for (let ci = 0; ci < row.length; ci++) {
            if (SPEND_MONTH_MAP[String(row[ci] ?? "").trim()]) { monthCol = ci; break; }
          }
          if (monthCol > 0) break;
        }

        const result: Array<{month:string;salaries:number;meta:number;google:number;adSpend:number}> = [];
        const seenInThisSheet = new Set<string>();
        for (const row of afterHeader) {
          const rawMonth = String(row[monthCol] ?? "").trim();
          if (!rawMonth) continue;
          if (rawMonth.toUpperCase().startsWith("TOTAL")) break;
          // If "June" appears a second time in the sheet, it's June 2026 not June 2025
          const lookupKey = (rawMonth === "June" && seenInThisSheet.has("Jun 25")) ? "June26" : rawMonth;
          const mapped = SPEND_MONTH_MAP[lookupKey];
          if (!mapped) continue;
          seenInThisSheet.add(mapped);
          const meta   = parseINR(row[metaCol]);
          const google = parseINR(row[googleCol]);
          result.push({ month: mapped, salaries: salaryCol >= 0 ? parseINR(row[salaryCol]) : 0, meta, google, adSpend: meta + google });
        }
        return result;
      };
      const risSpend = parseSpendRows(risSpendRaw);
      const rpsSpend = parseSpendRows(rpsSpendRaw);

      // ── DM Overall → monthly combined totals + May weekly ──
      const MONTH_MAP: Record<string, string> = {
        JUNE: "Jun 25", JULY: "Jul 25", AUGUST: "Aug 25", SEPTEMBER: "Sep 25",
        OCTOBER: "Oct 25", NOVEMBER: "Nov 25", DECEMBER: "Dec 25", JANUARY: "Jan 26",
        FEBRUARY: "Feb 26", MARCH: "Mar 26", APRIL: "Apr 26", MAY: "May 26",
      };
      const monthlyTotals: any[] = [];
      const mayWeeklyCombined: any[] = [];
      let inMay = false;
      let passedMay = false; // tracks when we've seen the MAY row, so next JUNE = Jun 26

      for (const row of masterRows) {
        const label = String(row[1] ?? "").trim();
        if (!label) continue;
        if (label.toUpperCase().startsWith("TOTAL")) break;
        let monthVal = MONTH_MAP[label.toUpperCase()];
        // After seeing MAY (May 26), a subsequent JUNE row is June 2026, not June 2025
        if (passedMay && label.toUpperCase() === "JUNE") monthVal = "Jun 26";
        if (monthVal) {
          if (monthVal === "May 26") passedMay = true;
          inMay = monthVal === "May 26";
          const leads = parseN(row[2]); const spend = parseINR(row[20]);
          if (leads > 0 || spend > 0) {
            monthlyTotals.push({ month: monthVal, leads, bookings: parseN(row[5]), walkins: parseN(row[6]), admissions: parseN(row[10]), meta: parseINR(row[18]), google: parseINR(row[19]), spend });
          }
          continue;
        }
        // May weekly: date patterns containing "/05" (May rows appear BEFORE the MAY monthly row)
        if (label.includes("/") && (label.includes("/05") || inMay)) {
          const leads = parseN(row[2]); const spend = parseINR(row[20]);
          if (leads > 0 || spend > 0) {
            mayWeeklyCombined.push({ week: label, leads, bookings: parseN(row[5]), walkins: parseN(row[6]), admissions: parseN(row[10]), spend });
          }
        }
      }

      // Fallback: if Jun 26 monthly row wasn't captured from DM Overall
      // (monthly summary row uses formula cells that Google Sheets API may not evaluate),
      // synthesise it from the June weekly rows that were already collected.
      if (!monthlyTotals.some(m => m.month === "Jun 26")) {
        const junWeeks = mayWeeklyCombined.filter(w => /\/06/.test(w.week));
        if (junWeeks.length > 0) {
          const junRis = risSpend.find(s => s.month === "Jun 26");
          const junRps = rpsSpend.find(s => s.month === "Jun 26");
          monthlyTotals.push({
            month: "Jun 26",
            leads:      junWeeks.reduce((s, w) => s + w.leads,       0),
            bookings:   junWeeks.reduce((s, w) => s + w.bookings,    0),
            walkins:    junWeeks.reduce((s, w) => s + w.walkins,     0),
            admissions: junWeeks.reduce((s, w) => s + w.admissions,  0),
            meta:   (junRis?.meta   ?? 0) + (junRps?.meta   ?? 0),
            google: (junRis?.google ?? 0) + (junRps?.google ?? 0),
            spend:  (junRis?.adSpend ?? 0) + (junRps?.adSpend ?? 0),
          });
        }
      }

      // ── Fresh booking-to-walk-in: CRM-based same-month conversion ──
      // The DM Overall master sheet counts walk-ins by CALENDAR month (when visited),
      // so it includes carry-over from previous months' bookings.
      // The CRM groups each lead by their ENTRY/BOOKING month, so CRM walk-ins for
      // month X = leads booked in X who have visited (same-month attribution).
      // Additionally, RIS col 11 = Revisit Date — leads with a revisit date are
      // returning visitors and must be excluded.
      //
      // freshWalkins[month] = RIS CRM walk-ins (no revisit) + RPS CRM walk-ins (all)
      //                       both keyed to the booking/entry month, not the visit month.
      const risFreshWalkinsMap: Record<string, number> = {};
      const rpsFreshWalkinsMap: Record<string, number> = {};

      // ── RPS CRM → branch-wise by month ──
      const MONTH_ORDER = ["Apr-25","May-25","Jun-25","Jul-25","Aug-25","Sep-25","Oct-25","Nov-25","Dec-25","Jan-26","Feb-26","Mar-26","Apr-26","May-26","Jun-26"];
      const rpsMonthBranch: Record<string, Record<string, {leads:number;bookings:number;walkins:number;admissions:number;closed:number}>> = {};
      const rpsCloseReasons: Record<string, number> = {};
      const rpsMonthReasons: Record<string, Record<string, number>> = {};
      const rpsStatusCount: Record<string, number> = {};
      const rpsSourceCount: Record<string, number> = {};

      for (const r of rpsCrmRows.slice(1)) {
        if (!r[0] || !r[2]) continue;
        const month = String(r[1] ?? "").trim();
        const centre = String(r[6] ?? "").trim() || "Unassigned";
        const status = String(r[7] ?? "OPEN").trim().toUpperCase();
        const remark = String(r[8] ?? "").trim();
        const source = String(r[10] ?? "Unknown").trim() || "Unknown";
        if (!month) continue;
        if (!rpsMonthBranch[month]) rpsMonthBranch[month] = {};
        if (!rpsMonthBranch[month][centre]) rpsMonthBranch[month][centre] = { leads:0, bookings:0, walkins:0, admissions:0, closed:0 };
        // Cumulative funnel: status is the CURRENT stage; leads who progressed to
        // WALK-IN COMPLETED / ADM DONE / CLOSED AFTER WALKIN were once WALKIN BOOKED.
        rpsMonthBranch[month][centre].leads++;
        if (["WALKIN BOOKED","WALK-IN COMPLETED","ADM DONE","CLOSED AFTER WALKIN"].includes(status))
          rpsMonthBranch[month][centre].bookings++;
        if (["WALK-IN COMPLETED","ADM DONE","CLOSED AFTER WALKIN"].includes(status))
          rpsMonthBranch[month][centre].walkins++;
        if (status === "ADM DONE") rpsMonthBranch[month][centre].admissions++;
        if (status === "CLOSED" || status === "CLOSED AFTER WALKIN") {
          rpsMonthBranch[month][centre].closed++;
          if (remark) {
            rpsCloseReasons[remark] = (rpsCloseReasons[remark] || 0) + 1;
            if (!rpsMonthReasons[month]) rpsMonthReasons[month] = {};
            rpsMonthReasons[month][remark] = (rpsMonthReasons[month][remark] || 0) + 1;
          }
        }
        rpsStatusCount[status] = (rpsStatusCount[status] || 0) + 1;
        rpsSourceCount[source] = (rpsSourceCount[source] || 0) + 1;
        // RPS has no Revisit Date column — count all walk-in status leads as fresh
        // (attributing to their booking/entry month, not the physical visit month).
        if (["WALK-IN COMPLETED","ADM DONE","CLOSED AFTER WALKIN"].includes(status)) {
          rpsFreshWalkinsMap[month] = (rpsFreshWalkinsMap[month] || 0) + 1;
        }
      }

      const rpsByMonth = Object.keys(rpsMonthBranch)
        .sort((a, b) => { const ai = MONTH_ORDER.indexOf(a), bi = MONTH_ORDER.indexOf(b); return (ai<0?99:ai)-(bi<0?99:bi); })
        .map(month => {
          const allEntries = Object.entries(rpsMonthBranch[month])
            .map(([centre, d]) => ({ centre, ...d }));
          // Total includes ALL leads (Unassigned + named centres) — matches sheet row count
          const total = allEntries.reduce((a, b) => ({ leads:a.leads+b.leads, bookings:a.bookings+b.bookings, walkins:a.walkins+b.walkins, admissions:a.admissions+b.admissions, closed:a.closed+b.closed }), { leads:0, bookings:0, walkins:0, admissions:0, closed:0 });
          // Display table shows named centres only (Unassigned rows have no actionable centre info)
          const branches = allEntries
            .filter(b => b.centre && b.centre !== "Unassigned")
            .sort((a, b) => b.leads - a.leads);
          const closedReasons = Object.entries(rpsMonthReasons[month] || {}).filter(([r]) => r.trim()).sort((a,b) => b[1]-a[1]).map(([reason,count]) => ({reason,count}));
          return { month, branches, total, closedReasons };
        });

      // ── RIS CRM → education-level groups by month ──
      const GRADE_MAP: Record<string, string> = {};
      // Pre-Primary: all common variants used in sheets and forms
      for (const g of [
        "nursery","playgroup","junior kg","senior kg","kg",
        "jr. kg","jr kg","sr. kg","sr kg","lkg","ukg",
        "pre-primary","pre primary","pp","jkg","skg",
        "jr. k.g.","sr. k.g.","junior k.g.","senior k.g.",
        "nursery / jr. kg","nur","nur/jr.kg",
      ]) GRADE_MAP[g] = "Pre-Primary";
      // Primary: Class 1–5 and Grade 1–5 variants
      for (const g of ["class 1","class 2","class 3","class 4","class 5",
        "grade 1","grade 2","grade 3","grade 4","grade 5",
        "std 1","std 2","std 3","std 4","std 5",
        "1st","2nd","3rd","4th","5th",
      ]) GRADE_MAP[g] = "Primary";
      // Middle: Class 6–8 and Grade 6–8 variants
      for (const g of ["class 6","class 7","class 8",
        "grade 6","grade 7","grade 8",
        "std 6","std 7","std 8",
        "6th","7th","8th",
      ]) GRADE_MAP[g] = "Middle";
      // Secondary: Class 9–10 and Grade 9–10 variants
      for (const g of ["class 9","class 10",
        "grade 9","grade 10",
        "std 9","std 10",
        "9th","10th",
      ]) GRADE_MAP[g] = "Secondary";
      // Senior Secondary: Class 11–12 and Grade 11–12 variants
      for (const g of [
        "class 11","class 11 science","class 11 commerce","class 11 humanities",
        "class 12","class 12 science","class 12 commerce","class 12 humanities",
        "11th","12th","grade 11","grade 12","std 11","std 12",
      ]) GRADE_MAP[g] = "Senior Secondary";

      const risMonthGroup: Record<string, Record<string, {leads:number;bookings:number;walkins:number;admissions:number;closed:number}>> = {};
      const risCloseReasons: Record<string, number> = {};
      const risMonthReasons: Record<string, Record<string, number>> = {};
      const risStatusCount: Record<string, number> = {};
      const risSourceCount: Record<string, number> = {};

      for (const r of risCrmRows.slice(1)) {
        if (!r[0] || !r[2]) continue;
        const month = String(r[1] ?? "").trim();
        const grade = String(r[5] ?? "").trim().toLowerCase().replace(/\s+/g, " ");
        const group = GRADE_MAP[grade] || "Other";
        if (!month) continue;
        const status = String(r[6] ?? "OPEN").trim().toUpperCase();
        const remark = String(r[7] ?? "").trim();
        const source = String(r[9] ?? "Unknown").trim() || "Unknown";
        // Column K = "Walk-In Date" — if present on a CLOSED lead, it walked in before being closed
        const hasWalkinDate = String(r[10] ?? "").trim().length > 0;
        // Treat CLOSED+Walk-In Date as "CLOSED AFTER WALKIN" (RIS sheet doesn't use that label)
        const effectiveStatus = (status === "CLOSED" && hasWalkinDate) ? "CLOSED AFTER WALKIN" : status;
        if (!risMonthGroup[month]) risMonthGroup[month] = {};
        if (!risMonthGroup[month][group]) risMonthGroup[month][group] = { leads:0, bookings:0, walkins:0, admissions:0, closed:0 };
        // Cumulative funnel for RIS — mirrors RPS logic exactly
        risMonthGroup[month][group].leads++;
        if (["WALKIN BOOKED","WALK-IN COMPLETED","ADM DONE","CLOSED AFTER WALKIN"].includes(effectiveStatus))
          risMonthGroup[month][group].bookings++;
        if (["WALK-IN COMPLETED","ADM DONE","CLOSED AFTER WALKIN"].includes(effectiveStatus))
          risMonthGroup[month][group].walkins++;
        if (effectiveStatus === "ADM DONE") risMonthGroup[month][group].admissions++;
        if (effectiveStatus === "CLOSED" || effectiveStatus === "CLOSED AFTER WALKIN") {
          risMonthGroup[month][group].closed++;
          if (remark) {
            risCloseReasons[remark] = (risCloseReasons[remark] || 0) + 1;
            if (!risMonthReasons[month]) risMonthReasons[month] = {};
            risMonthReasons[month][remark] = (risMonthReasons[month][remark] || 0) + 1;
          }
        }
        // Use effectiveStatus so CLOSED+walkin-date shows as "CLOSED AFTER WALKIN" in status summary
        risStatusCount[effectiveStatus] = (risStatusCount[effectiveStatus] || 0) + 1;
        risSourceCount[source] = (risSourceCount[source] || 0) + 1;
        // Fresh walk-in: lead is attributed to their BOOKING/ENTRY month (same-month),
        // and col 11 (Revisit Date) must be empty — revisiting parents are not fresh.
        // Walk-in date (col 10) is intentionally NOT required because it is sparsely
        // filled in the CRM; entry-month attribution is the reliable same-month proxy.
        if (["WALK-IN COMPLETED","ADM DONE","CLOSED AFTER WALKIN"].includes(effectiveStatus)) {
          const revisitDateRaw = String(r[11] ?? "").trim();
          if (!revisitDateRaw) {
            risFreshWalkinsMap[month] = (risFreshWalkinsMap[month] || 0) + 1;
          }
        }
      }

      const GROUP_ORDER_SRV = ["Pre-Primary","Primary","Middle","Secondary","Senior Secondary"];
      const risByMonth = Object.keys(risMonthGroup)
        .sort((a, b) => { const ai = MONTH_ORDER.indexOf(a), bi = MONTH_ORDER.indexOf(b); return (ai<0?99:ai)-(bi<0?99:bi); })
        .map(month => {
          const groups = GROUP_ORDER_SRV
            .filter(g => risMonthGroup[month][g])
            .map(g => ({ group: g, ...risMonthGroup[month][g] }));
          // Total counts ALL rows in the month (including "Other"/unrecognised grades)
          const total = Object.values(risMonthGroup[month]).reduce((a, g) => ({ leads:a.leads+g.leads, bookings:a.bookings+g.bookings, walkins:a.walkins+g.walkins, admissions:a.admissions+g.admissions, closed:a.closed+g.closed }), { leads:0, bookings:0, walkins:0, admissions:0, closed:0 });
          const closedReasons = Object.entries(risMonthReasons[month] || {}).filter(([r]) => r.trim()).sort((a,b) => b[1]-a[1]).map(([reason,count]) => ({reason,count}));
          return { month, groups, total, closedReasons };
        });

      const sortReasons = (map: Record<string, number>) =>
        Object.entries(map).filter(([r]) => r.trim()).sort((a, b) => b[1] - a[1]).map(([reason, count]) => ({ reason, count }));

      // Post-process: inject freshWalkins (RIS no-revisit + RPS all) into each monthlyTotals entry.
      // Both maps key by "Jun-26" (dash); monthlyTotals uses "Jun 26" (space) → normalise.
      for (const mt of monthlyTotals) {
        const mKey = mt.month.replace(" ", "-");
        mt.risFreshWalkins = risFreshWalkinsMap[mKey] || 0;
        mt.rpsFreshWalkins = rpsFreshWalkinsMap[mKey] || 0;
        mt.freshWalkins    = mt.risFreshWalkins + mt.rpsFreshWalkins;
      }

      res.json({
        generatedAt: new Date().toISOString(),
        currentDayOfMonth: new Date().getDate(),
        monthlyTotals,
        mayWeeklyCombined,
        rpsCrm: { byMonth: rpsByMonth, closedReasons: sortReasons(rpsCloseReasons), statusSummary: rpsStatusCount, bySource: rpsSourceCount },
        risCrm: { byMonth: risByMonth, closedReasons: sortReasons(risCloseReasons), statusSummary: risStatusCount, bySource: risSourceCount },
        rpsSchoolMonthly,
        risSchoolMonthly,
        rpsWeekly,
        risWeekly,
        risSpend,
        rpsSpend,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch live marketing data", error: err.message });
    }
  });

  // ── Google Sheets ─────────────────────────────────────────────
  const SHEET_IDS = {
    dmTracker: "1gzMAO-RyVFfz5hqANr8JApu-M6LwAftMyXnZD8_kjMw",
    rpsCrm:    "1t1_2SPI6--W-nCWc-lHHE-D4ee38WGFxiBsB5txI-CM",
    risCrm:    "1zLIWutvJxwLyVBAK-vDlpEzNPV7c2RwutYC9Gn3yd2s",
    master:    "1FjLbJbThU2wZCu7m0Y-GAzv6vTs8WdkVxBRBZh8QZqc",
    sales:     "1R5evjW6gVYIB6nyR1dmIdiWp1qMTui4J9wQovmUkakw",
  };

  async function fetchSheetRange(sheetId: string, range: string): Promise<string[][]> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Google not connected");
    const { google: goog } = await import("googleapis");
    const sheets = goog.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
    return (res.data.values || []) as string[][];
  }

  const WALKIN_SHEET_TAB = process.env.WALKIN_SHEET_TAB || "RA Checkin";

  async function appendToWalkinSheet(checkin: {
    id: string; submittedAt: Date | string; raName: string; raBranch: string;
    parentName: string; studentName: string; grade: string;
  }): Promise<void> {
    const sheetId = process.env.WALKIN_SHEET_ID;
    if (!sheetId) throw new Error("WALKIN_SHEET_ID env var not set");
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Google not connected");
    const { google: goog } = await import("googleapis");
    const sheets = goog.sheets({ version: "v4", auth });
    const dt = new Date(checkin.submittedAt);
    const dateStr = dt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" });
    const timeStr = dt.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true });
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${WALKIN_SHEET_TAB}!A:G`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[dateStr, timeStr, checkin.raName, checkin.raBranch, checkin.parentName, checkin.studentName, checkin.grade]],
      },
    });
  }

  // RPS walk-in check-ins sync to the RPS master sheet ("RA Checkin" tab)
  const RPS_WALKIN_SHEET_ID = "1ShXsyfbtViGccYcgPGMIEcT8C4m_Cs3b6yio6N54D1Q";
  async function appendToRpsWalkinSheet(checkin: {
    id: string; submittedAt: Date | string; raName: string; raBranch: string;
    parentName: string; studentName: string; grade: string;
  }): Promise<void> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Google not connected");
    const { google: goog } = await import("googleapis");
    const sheets = goog.sheets({ version: "v4", auth });
    const dt = new Date(checkin.submittedAt);
    const dateStr = dt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" });
    const timeStr = dt.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true });
    await sheets.spreadsheets.values.append({
      spreadsheetId: RPS_WALKIN_SHEET_ID,
      range: `${WALKIN_SHEET_TAB}!A:G`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[dateStr, timeStr, checkin.raName, checkin.raBranch, checkin.parentName, checkin.studentName, checkin.grade]],
      },
    });
  }

  // 1. DM Team Task Tracker
  app.get("/api/sheets/tasks", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    try {
      const rows = await fetchSheetRange(SHEET_IDS.dmTracker, "Key Task!A:I");
      const [header, ...data] = rows;
      const statusFilter = typeof req.query.status === "string" ? req.query.status.toLowerCase() : "";
      const tasks = data
        .filter(r => r[2]) // must have a task name
        .map(r => ({
          assignedDate: r[0] || "",
          endDate: r[1] || "",
          task: r[2] || "",
          owner: r[3] || "",
          status: r[4] || "Pending",
          remarks: r[8] || "",
        }))
        .filter(t => !statusFilter || t.status.toLowerCase().includes(statusFilter));
      const summary = {
        total: tasks.length,
        completed: tasks.filter(t => t.status.toLowerCase() === "completed").length,
        pending: tasks.filter(t => t.status.toLowerCase() === "pending").length,
      };
      res.json({ generatedAt: new Date().toISOString(), summary, tasks });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
    }
  });

  // 2. CRM Lead Summary
  app.get("/api/sheets/crm", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const monthFilter = typeof req.query.month === "string" ? req.query.month.toLowerCase() : "";
    try {
      let rows: string[][];
      if (account === "rps") {
        rows = await fetchSheetRange(SHEET_IDS.rpsCrm, "DM 2026-27!A:K");
      } else {
        rows = await fetchSheetRange(SHEET_IDS.risCrm, "Nur to Class 12!A:L");
      }
      const [, ...data] = rows; // skip header
      const leads = data.filter(r => r[0] && r[2]); // must have date and parent name
      const filtered = monthFilter
        ? leads.filter(r => (r[1] || "").toLowerCase().includes(monthFilter))
        : leads;

      // Aggregate by status
      const byStatus: Record<string, number> = {};
      const bySource: Record<string, number> = {};
      const byMonth: Record<string, number> = {};
      const byOwner: Record<string, number> = {};
      filtered.forEach(r => {
        const status = r[account === "rps" ? 7 : 6] || "Open";
        const source = r[account === "rps" ? 10 : 9] || "Unknown";
        const month  = r[1] || "Unknown";
        const owner  = r[account === "rps" ? 9 : 8] || "Unknown";
        byStatus[status] = (byStatus[status] || 0) + 1;
        bySource[source] = (bySource[source] || 0) + 1;
        byMonth[month]   = (byMonth[month] || 0) + 1;
        byOwner[owner]   = (byOwner[owner] || 0) + 1;
      });

      const admDone  = byStatus["ADM DONE"] || 0;
      const closed   = byStatus["CLOSED"] || 0;
      const total    = filtered.length;
      const convRate = total > 0 ? parseFloat(((admDone / total) * 100).toFixed(1)) : 0;

      res.json({
        account: account.toUpperCase(),
        monthFilter: monthFilter || "all months",
        generatedAt: new Date().toISOString(),
        summary: { totalLeads: total, admissionsDone: admDone, closed, open: total - admDone - closed, conversionRate: `${convRate}%` },
        byStatus,
        bySource,
        byMonth,
        byLeadOwner: byOwner,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch CRM data", error: err.message });
    }
  });

  // 2b. CRM Raw Rows — every lead row with named columns for ChatGPT date+source calculations
  app.get("/api/sheets/crm/rows", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    const account      = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "rps";
    const dateFilter   = typeof req.query.date   === "string" ? req.query.date.toLowerCase()   : "";
    const sourceFilter = typeof req.query.source === "string" ? req.query.source.toLowerCase() : "";
    const statusFilter = typeof req.query.status === "string" ? req.query.status.toLowerCase() : "";
    const monthFilter  = typeof req.query.month  === "string" ? req.query.month.toLowerCase()  : "";
    const centreFilter = typeof req.query.centre === "string" ? req.query.centre.toLowerCase() : "";

    try {
      let rows: string[][];
      if (account === "rps") {
        rows = await fetchSheetRange(SHEET_IDS.rpsCrm, "DM 2026-27!A:K");
      } else {
        rows = await fetchSheetRange(SHEET_IDS.risCrm, "Nur to Class 12!A:L");
      }

      const [headerRow, ...dataRows] = rows;
      const headers = (headerRow || []).map(h => (h || "").trim());

      // Map each row to a named object using actual sheet column headers
      const allLeads = dataRows
        .filter(r => r[0] && r[2]) // must have date and parent name columns populated
        .map(r => {
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => { if (h) obj[h] = (r[i] || "").trim(); });
          return obj;
        });

      // Dynamically locate filter columns from the actual header names
      const findHeader = (kw: string) =>
        headers.find(h => h.toLowerCase().includes(kw)) || "";

      const dateKey   = findHeader("date");
      const sourceKey = findHeader("source");
      const statusKey = findHeader("status");
      const monthKey  = findHeader("month");
      const centreKey = findHeader("centre") || findHeader("branch");

      let filtered = allLeads;
      if (dateFilter)   filtered = filtered.filter(r => (r[dateKey]   || "").toLowerCase().includes(dateFilter));
      if (sourceFilter) filtered = filtered.filter(r => (r[sourceKey] || "").toLowerCase().includes(sourceFilter));
      if (statusFilter) filtered = filtered.filter(r => (r[statusKey] || "").toLowerCase().includes(statusFilter));
      if (monthFilter)  filtered = filtered.filter(r => (r[monthKey]  || "").toLowerCase().includes(monthFilter));
      if (centreFilter) filtered = filtered.filter(r => (r[centreKey] || "").toLowerCase().includes(centreFilter));

      // Quick aggregate counts on the filtered set — useful at-a-glance without iterating rows
      const bySource: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      const byDate:   Record<string, number> = {};
      filtered.forEach(r => {
        const src = r[sourceKey] || "Unknown";
        const sts = r[statusKey] || "Unknown";
        const dt  = r[dateKey]   || "Unknown";
        bySource[src] = (bySource[src] || 0) + 1;
        byStatus[sts] = (byStatus[sts] || 0) + 1;
        byDate[dt]    = (byDate[dt]    || 0) + 1;
      });

      res.json({
        account: account.toUpperCase(),
        filters: {
          date:   dateFilter   || "all",
          source: sourceFilter || "all",
          status: statusFilter || "all",
          month:  monthFilter  || "all",
          centre: centreFilter || "all",
        },
        generatedAt: new Date().toISOString(),
        totalRows: filtered.length,
        columns: headers.filter(h => h),
        quickCount: { bySource, byStatus, byDate },
        rows: filtered,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch CRM rows", error: err.message });
    }
  });

  // 3. Master Weekly Funnel Data
  app.get("/api/sheets/master", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const month   = typeof req.query.month === "string" ? req.query.month.toLowerCase() : "may";
    try {
      // Map to the correct tab name
      const monthMap: Record<string, string> = {
        may: "may", april: "apr", apr: "apr", feb: "feb", february: "feb",
      };
      const resolvedMonth = monthMap[month] || month;
      let tabName: string;
      if (account === "rps") {
        tabName = resolvedMonth === "apr" ? "Total RPS Apr'26" : resolvedMonth === "feb" ? "DM RPS Feb' 26" : "'DM RPS MAY'' 26'";
      } else {
        tabName = resolvedMonth === "apr" ? "Total RIS Apr'26" : resolvedMonth === "feb" ? "DM RIS Feb' 26" : "'DM RIS MAY'' 26'";
      }
      const rows = await fetchSheetRange(SHEET_IDS.master, `${tabName}!A:S`);
      // Find header row (row with "Date" or "Total Leads")
      let headerIdx = rows.findIndex(r => r.some(c => c === "Date" || c === "Total Leads"));
      if (headerIdx === -1) headerIdx = 1;
      const header = rows[headerIdx];
      const dataRows = rows.slice(headerIdx + 1).filter(r => r[0] && r[0] !== "");
      const weekly = dataRows.map(r => {
        const obj: Record<string, string> = {};
        header.forEach((h, i) => { if (h) obj[h] = r[i] || "0"; });
        return obj;
      });
      res.json({
        account: account.toUpperCase(),
        tab: tabName,
        month: resolvedMonth,
        generatedAt: new Date().toISOString(),
        weeklyBreakdown: weekly,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch master data", error: err.message });
    }
  });

  // 4. Targets vs Actuals by Branch/Grade
  app.get("/api/sheets/targets", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    try {
      // RPS: Row1=section labels ("Jan Actual" / "Monthly Target"), Row2=col headers, Row3+=data
      //   Cols A-H = actuals, Cols K-R = monthly targets (side by side)
      // RIS: Row1=section label, Row2=col headers (Grade-based), Row3+=data (actuals only)
      if (account === "rps") {
        const rows = await fetchSheetRange(SHEET_IDS.rpsCrm, "Target Sheet!A1:R50");
        const colHeaders = rows[1] || []; // Row 2
        const dataRows   = rows.slice(2).filter(r => r[0] && r[0] !== "" && r[0] !== "Branch");
        const merged = dataRows.map(r => ({
          branch:                   r[0] || "",
          // Actuals (Jan)
          leadsActual:              r[1] || "0",
          bookingsActual:           r[2] || "0",
          walkinsActual:            r[3] || "0",
          admissionsActual:         r[4] || "0",
          leadToBookingActual:      r[5] || "0%",
          bookingToWalkinActual:    r[6] || "0%",
          walkinToAdmissionActual:  r[7] || "0%",
          // Monthly Targets (col K=index10 onwards)
          leadsTarget:              r[11] || "0",
          bookingsTarget:           r[12] || "0",
          walkinsTarget:            r[13] || "0",
          admissionsTarget:         r[14] || "0",
          leadToBookingTarget:      r[15] || "0%",
          bookingToWalkinTarget:    r[16] || "0%",
          walkinToAdmissionTarget:  r[17] || "0%",
        }));
        res.json({
          account: "RPS",
          generatedAt: new Date().toISOString(),
          note: "Jan actuals vs monthly targets by branch. Conversion rates: lead→booking, booking→walkin, walkin→admission.",
          branches: merged,
        });
      } else {
        // RIS: by grade, actuals only
        const rows = await fetchSheetRange(SHEET_IDS.risCrm, "Target sheet!A1:H50");
        const dataRows = rows.slice(2).filter(r => r[0] && r[0] !== "" && r[0] !== "Grade");
        const grades = dataRows.map(r => ({
          grade:                   r[0] || "",
          leadsActual:             r[1] || "0",
          bookingsActual:          r[2] || "0",
          walkinsActual:           r[3] || "0",
          admissionsActual:        r[4] || "0",
          leadToBookingActual:     r[5] || "0%",
          bookingToWalkinActual:   r[6] || "0%",
          walkinToAdmissionActual: r[7] || "0%",
        }));
        res.json({
          account: "RIS",
          generatedAt: new Date().toISOString(),
          note: "Jan actuals by grade (Nursery → Class 12). No monthly target column in this sheet.",
          grades,
        });
      }
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch targets", error: err.message });
    }
  });

  // ── Sales Dashboard (Walkin Enquiries spreadsheet) ──────────────
  // Aggregates all subsheets from the 2026-27 Walkin Enquiries workbook.
  // Auto-updates: response is no-store; frontend polls every 5 minutes.
  app.get("/api/sales/live", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    try {
      const SID = SHEET_IDS.sales;
      const [walkinRows, admRows, provAdmRows, convRows, targetAchRows, targetMonthRow, misDashRows, risDmRows] = await Promise.all([
        fetchSheetRange(SID, "'Walkin Sheet 26-27'!A2:S5000"),
        fetchSheetRange(SID, "'New Admission List'!A2:T500"),
        fetchSheetRange(SID, "'Provisional Admission LIST'!A2:T200"),
        fetchSheetRange(SID, "'CONVERSION RATIO'!I4:Q200"),
        fetchSheetRange(SID, "'RIS Target Sheet '!B13:N14"),   // achieved + target rows
        fetchSheetRange(SID, "'RIS Target Sheet '!B2:N2"),     // month header row
        fetchSheetRange(SID, "'MIS DASHBOARD'!A4:E300"),       // daily MIS rows
        fetchSheetRange(SHEET_IDS.risCrm, "Nur to Class 12!A:L"), // DM pipeline
      ]);

      // ── helpers ────────────────────────────────────────────────
      const norm = (s: any) => String(s ?? "").trim();
      const upper = (s: any) => norm(s).toUpperCase();
      const isEmptyRow = (r: any[]) => !r || r.every(c => norm(c) === "");
      // Parse loose date strings ("19 Jun 25", "5-Jul-2025", "01.10.2025", "10/27/2025")
      const parseDate = (s: any): Date | null => {
        const v = norm(s); if (!v) return null;
        const t = v.replace(/\./g, "/").replace(/\s+/g, " ");
        // try direct
        const d1 = new Date(t); if (!isNaN(d1.getTime()) && d1.getFullYear() > 2020 && d1.getFullYear() < 2030) return d1;
        // try DD-MMM-YY / DD MMM YY
        const m = t.match(/^(\d{1,2})[\s\-\/]([A-Za-z]{3,})[\s\-\/](\d{2,4})$/);
        if (m) {
          const y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
          const d2 = new Date(`${m[2]} ${m[1]}, ${y}`);
          if (!isNaN(d2.getTime())) return d2;
        }
        return null;
      };
      const monthKey = (d: Date | null) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` : "";
      const monthLabel = (d: Date | null) => d ? d.toLocaleString("en-US", { month: "short", year: "2-digit" }) : "";
      const incBy = (m: Map<string,number>, k: string) => { if (!k) return; m.set(k, (m.get(k) || 0) + 1); };
      const sortByCount = (m: Map<string,number>) => Array.from(m, ([k,v]) => ({ key: k, count: v })).sort((a,b) => b.count - a.count);

      const now = new Date();
      const curMonthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

      // ── Walkins ────────────────────────────────────────────────
      // Cols: 0=SrNo 1=Date 2=Month 3=Name 4=Grade 5=Gender 6=Section 7=Contact 8=Counsellor 9=Source 10=Status
      const sourceMap = new Map<string,number>();
      const statusMap = new Map<string,number>();
      const gradeMap  = new Map<string,number>();
      const walkinByMonth = new Map<string,{label:string; count:number}>();
      type CounselorAgg = { walkins: number; admissions: number; closed: number; followup: number; provisional: number };
      const counselorMap = new Map<string, CounselorAgg>();
      const recentWalkins: Array<{date:string; name:string; grade:string; counselor:string; source:string; status:string; sortKey:number}> = [];
      const closedSegmentMap = new Map<string,number>();
      // Admitted walk-ins by marketing source (replaces New Admission List source col which only has "Unknown"/"Revisit adm")
      const walkinAdmBySource = new Map<string,number>();
      const walkinAdmSrcByMonth = new Map<string, Map<string,number>>();
      const walkinAdmByGrade = new Map<string,number>();
      const walkinAdmByCounselor = new Map<string,number>();
      // Lead temperature classification
      type HeatCell = { hot: number; warm: number; cold: number; provisional: number; open: number };
      const heatGridMap = new Map<string, Map<string, HeatCell>>();
      let tempHot = 0, tempWarm = 0, tempCold = 0, tempProvisional = 0, tempOpen = 0;
      const leadTemp = (st: string): "hot"|"warm"|"cold"|"provisional"|"open" => {
        if (st.includes("ADMIS") && !st.includes("PROV")) return "hot";
        if (st.includes("PROV")) return "provisional";
        if (st.includes("FOLLOW")) return "warm";
        if (st.includes("CLOSED")) return "cold";
        return "open";
      };
      let walkinsTotal = 0, walkinsThisMonth = 0;
      const openWalkinsList: Array<{ date: string; name: string; grade: string; counselor: string; source: string; status: string; daysOpen: number }> = [];

      // Maps raw "REASON OF CLOSING" (col 13) → curated segment name
      const closedSegment = (raw: string): string => {
        const r = raw.toLowerCase().trim();
        if (!r) return "No Reason Recorded";
        if (r.includes("relocat")) return "Location / Not in Catchment";
        if (r.includes("distance")) return "Distance / Too Far";
        if (r.includes("taken") || r.includes("same school") || r.includes("pre-school") || r.includes("pre- school") || r.includes("preschool")) return "Joined Another School";
        if (r.includes("continu")) return "Joined Another School";
        if (r.includes("finance")) return "Finance / Fees";
        if (r.includes("board") || r.includes("icse") || r.includes("rte")) return "Board / Curriculum Preference";
        if (r.includes("not interest") || r.includes("not respond")) return "Not Interested / Unresponsive";
        if (r.includes("shift") || r.includes("saturday") || r.includes("morning") || r.includes("afternoon") || r.includes("day care")) return "Timing / Schedule";
        return "Other";
      };

      // Per-month aggregation for client-side filtering
      type MonthWalkinAgg = {
        label: string;
        walkins: number; admissions: number; closed: number; provisional: number; followup: number;
        counselors: Map<string, CounselorAgg>;
        closedSegs: Map<string, number>;
      };
      const monthWalkinMap = new Map<string, MonthWalkinAgg>();

      for (const r of walkinRows) {
        if (isEmptyRow(r)) continue;
        const name = norm(r[3]); if (!name) continue;
        const d = parseDate(r[1]);
        const counselorRaw = norm(r[7]);
        const isStatusAsCounselor = /ADMIS|CLOSED|FOLLOW[ -]?UP|NOT COUNTED|SEAT NOT|PROVISIONAL|WALKIN/i.test(counselorRaw);
        const counselor = (!isStatusAsCounselor && counselorRaw) ? counselorRaw : "Unassigned";
        const source = norm(r[8]) || "Unknown";
        const status = upper(r[9]) || "OPEN";
        const grade = norm(r[4]) || "Unspecified";
        // Track admitted walk-ins by source, grade and counselor (walk-in sheet cols are correct; New Admission List cols are not)
        if (status.includes("ADMIS") && !status.includes("PROV")) {
          walkinAdmBySource.set(source, (walkinAdmBySource.get(source) || 0) + 1);
          walkinAdmByGrade.set(grade, (walkinAdmByGrade.get(grade) || 0) + 1);
          walkinAdmByCounselor.set(counselor, (walkinAdmByCounselor.get(counselor) || 0) + 1);
          if (d) {
            const mk2 = monthKey(d);
            const msm2 = walkinAdmSrcByMonth.get(mk2) || new Map<string,number>();
            msm2.set(source, (msm2.get(source) || 0) + 1);
            walkinAdmSrcByMonth.set(mk2, msm2);
          }
        }
        const temp = leadTemp(status);
        if (temp === "open" || temp === "warm") {
          const daysOpen = d ? Math.floor((now.getTime() - d.getTime()) / 86400000) : 0;
          openWalkinsList.push({ date: d ? d.toISOString().slice(0,10) : norm(r[1]), name, grade, counselor, source, status, daysOpen });
        }
        if (temp === "hot") tempHot++;
        else if (temp === "warm") tempWarm++;
        else if (temp === "cold") tempCold++;
        else if (temp === "provisional") tempProvisional++;
        else tempOpen++;
        if (d) {
          const mk = monthKey(d);
          const cgrid = heatGridMap.get(counselor) || new Map<string, HeatCell>();
          const cell = cgrid.get(mk) || { hot:0, warm:0, cold:0, provisional:0, open:0 };
          cell[temp]++;
          cgrid.set(mk, cell);
          heatGridMap.set(counselor, cgrid);
        }
        walkinsTotal++;
        if (d && monthKey(d) === curMonthKey) walkinsThisMonth++;
        incBy(sourceMap, source);
        incBy(statusMap, status);
        incBy(gradeMap, grade);
        if (d) {
          const mk = monthKey(d);
          const cur = walkinByMonth.get(mk) || { label: monthLabel(d), count: 0 };
          cur.count++; walkinByMonth.set(mk, cur);
        }
        const ca = counselorMap.get(counselor) || { walkins: 0, admissions: 0, closed: 0, followup: 0, provisional: 0 };
        ca.walkins++;
        if (status.includes("ADMIS") && !status.includes("PROV")) ca.admissions++;
        else if (status.includes("PROV")) ca.provisional++;
        else if (status.includes("CLOSED")) {
          ca.closed++;
          const seg = closedSegment(norm(r[13]));
          closedSegmentMap.set(seg, (closedSegmentMap.get(seg) || 0) + 1);
        }
        else if (status.includes("FOLLOW")) ca.followup++;
        counselorMap.set(counselor, ca);
        recentWalkins.push({
          date: d ? d.toISOString().slice(0,10) : norm(r[1]),
          name, grade, counselor, source, status,
          sortKey: d ? d.getTime() : 0,
        });
        // Per-month aggregation
        if (d) {
          const mk = monthKey(d);
          const mw = monthWalkinMap.get(mk) || { label: monthLabel(d), walkins:0, admissions:0, closed:0, provisional:0, followup:0, counselors: new Map(), closedSegs: new Map() };
          mw.walkins++;
          if (status.includes("ADMIS") && !status.includes("PROV")) mw.admissions++;
          else if (status.includes("PROV")) mw.provisional++;
          else if (status.includes("CLOSED")) { mw.closed++; const s2 = closedSegment(norm(r[13])); mw.closedSegs.set(s2, (mw.closedSegs.get(s2)||0)+1); }
          else if (status.includes("FOLLOW")) mw.followup++;
          const mca = mw.counselors.get(counselor) || { walkins:0, admissions:0, closed:0, followup:0, provisional:0 };
          mca.walkins++;
          if (status.includes("ADMIS") && !status.includes("PROV")) mca.admissions++;
          else if (status.includes("PROV")) mca.provisional++;
          else if (status.includes("CLOSED")) mca.closed++;
          else if (status.includes("FOLLOW")) mca.followup++;
          mw.counselors.set(counselor, mca);
          monthWalkinMap.set(mk, mw);
        }
      }
      const closedReasonSegments = sortByCount(closedSegmentMap).map(x => ({ segment: x.key, count: x.count }));

      // Build heatmap grid: counselor × month cells
      const heatGridArr = Array.from(heatGridMap.entries())
        .map(([counselor, monthMap]) => {
          const months = Array.from(monthMap.entries()).map(([mk, cell]) => ({
            monthKey: mk,
            hot: cell.hot, warm: cell.warm, cold: cell.cold,
            provisional: cell.provisional, open: cell.open,
            total: cell.hot + cell.warm + cell.cold + cell.provisional + cell.open,
          }));
          const totals = months.reduce((acc, m) => ({
            hot: acc.hot + m.hot, warm: acc.warm + m.warm, cold: acc.cold + m.cold,
            provisional: acc.provisional + m.provisional, open: acc.open + m.open,
            total: acc.total + m.total,
          }), { hot:0, warm:0, cold:0, provisional:0, open:0, total:0 });
          return { counselor, months, totals };
        })
        .sort((a, b) => b.totals.total - a.totals.total)
        .filter(c => c.totals.total >= 3);
      const leadTemperature = { hot: tempHot, warm: tempWarm, cold: tempCold, provisional: tempProvisional, open: tempOpen };

      // ── Admissions (New Admission List = single source of truth = 287 confirmed) ──
      // Cols: 0=Sr 1=Date 2=? 3=Week 4=Month 5=Name 6=? 7=Grade 8=Contact
      //       9=Source 10=Revisit 11=Branch 12=Counselor 16=Pendency
      const normBranch = (b: string): string => {
        const v = b.replace(/^RPS\s+/i, "").trim().toLowerCase();
        const MAP: Record<string,string> = {
          "na": "Main", "": "Main",
          "agarwal": "Agarwal", "agrawal": "Agarwal", "agrawal ": "Agarwal",
          "dhokali": "Dhokali",
          "kasarwadavali": "Kasarwadavali",
          "anandnagar": "Anand Nagar", "anand nagar": "Anand Nagar",
          "hariniwas": "Hariniwas",
          "kalwa": "Kalwa",
          "ris": "Main",
        };
        return MAP[v] || b.trim() || "Main";
      };
      // Map text month names (from MONTH col) to YYYY-MM keys
      const MONTH_KEYS: Record<string,string> = {
        "oct":  "2025-10", "november":"2025-11", "nov":"2025-11",
        "dec":  "2025-12", "january": "2026-01", "jan":"2026-01",
        "feb":  "2026-02", "february":"2026-02",
        "mar":  "2026-03", "march":   "2026-03",
        "apr":  "2026-04", "april":   "2026-04",
        "may":  "2026-05",
        "jun":  "2026-06", "june":    "2026-06",
        "jul":  "2026-07", "july":    "2026-07",
        "aug":  "2026-08", "august":  "2026-08",
        "sep":  "2026-09", "september":"2026-09",
      };
      const MONTH_LABELS: Record<string,string> = {
        "2025-10":"Oct '25","2025-11":"Nov '25","2025-12":"Dec '25",
        "2026-01":"Jan '26","2026-02":"Feb '26","2026-03":"Mar '26",
        "2026-04":"Apr '26","2026-05":"May '26","2026-06":"Jun '26",
        "2026-07":"Jul '26","2026-08":"Aug '26","2026-09":"Sep '26",
      };

      const admByMonth  = new Map<string,{label:string; total:number}>();
      const admByBranch = new Map<string,number>();
      const admByGrade  = new Map<string,number>();
      const admBySource = new Map<string,number>();
      const admByCounselor = new Map<string,number>();
      const admSourceByMonth = new Map<string, Map<string,number>>();  // mk → source → count
      const recentAdmissions: Array<{date:string; name:string; grade:string; counselor:string; source:string; branch:string; sortKey:number}> = [];
      let admTotal = 0, admThisMonth = 0, rpsRollover = 0, docsClear = 0, docsPending = 0;

      for (const r of admRows) {
        const name = norm(r[5]); if (!name) continue;       // col 5 = student name
        const d = parseDate(r[1]);
        const monthText = norm(r[4]).toLowerCase();
        const mk = d ? monthKey(d) : (MONTH_KEYS[monthText] || "");
        const label = mk ? (MONTH_LABELS[mk] || mk) : "";
        const grade = norm(r[7]) || "Unspecified";
        const source = norm(r[9]) || "Unknown";
        const rawBranch = norm(r[11]);
        const branch = normBranch(rawBranch);
        const counselor = norm(r[12]) || "Unassigned";
        const pend = upper(r[16]);
        admTotal++;
        if (mk === curMonthKey) admThisMonth++;
        if (source === "RPS Student") rpsRollover++;
        if (pend === "CLEAR CASE" || pend === "CLEAR") docsClear++; else docsPending++;
        if (mk) {
          const cur = admByMonth.get(mk) || { label, total: 0 };
          cur.total++; admByMonth.set(mk, cur);
          const msm = admSourceByMonth.get(mk) || new Map<string,number>();
          msm.set(source, (msm.get(source)||0)+1);
          admSourceByMonth.set(mk, msm);
        }
        incBy(admByBranch, branch);
        incBy(admByGrade, grade);
        incBy(admBySource, source);
        incBy(admByCounselor, counselor);
        recentAdmissions.push({
          date: d ? d.toISOString().slice(0,10) : norm(r[1]),
          name, grade, counselor, source, branch,
          sortKey: d ? d.getTime() : 0,
        });
      }

      // ── Provisional (pending confirmation, not yet in New Admission List) ──
      // Sheet has two sections separated by a label row:
      //   Row "REGULAR PROVISIONAL" → rows with Sr 1-4
      //   Row "INTEGRATED PROVISIONAL" → rows with Sr 1-6
      // Cols (data rows): 0=Sr 1=Date 2=Month 3=Name 4=Grade 5=Contact
      //                   6=Counselor 7=Source 8=Status 10=Branch 19=CoachingInstitute
      let provRegular = 0, provIntegrated = 0, provThisMonth = 0;
      let provSection: "Regular" | "Integrated" = "Regular";
      const recentProvisional: Array<{date:string; name:string; grade:string; counselor:string; source:string; branch:string; type:string; coaching:string; sortKey:number}> = [];
      for (const r of provAdmRows) {
        const sr = norm(r[0]);
        if (!sr) continue;
        // Section header or column header rows — not data rows
        const srUpper = sr.toUpperCase();
        if (srUpper.includes("PROVISIONAL") || srUpper.includes("SR NO") || isNaN(+sr)) {
          if (srUpper.includes("INTEGRATED")) provSection = "Integrated";
          continue;
        }
        const name = norm(r[3]); if (!name) continue;
        const d = parseDate(r[1]);
        const grade = norm(r[4]) || "Unspecified";
        const counselor = norm(r[6]) || "Unassigned";
        const source = norm(r[7]) || "Unknown";
        const branch = normBranch(norm(r[10]));
        const coaching = norm(r[19]) || "";
        if (provSection === "Regular") provRegular++;
        else provIntegrated++;
        if (d && monthKey(d) === curMonthKey) provThisMonth++;
        recentProvisional.push({ date: d ? d.toISOString().slice(0,10) : norm(r[1]), name, grade, counselor, source, branch, type: provSection, coaching, sortKey: d ? d.getTime() : 0 });
      }
      const provTotal = provRegular + provIntegrated;

      // ── Conversion ratio — SUMMARY section (Nursery to Grade 12 consolidated) ──
      const conversionRatio: Array<{counselor:string; enquiries:number; open:number; closed:number; admissions:number; ratio:number; provisional:number; ratioWithProv:number}> = [];
      const CONV_STATUS_LIKE = /ADMIS|CLOSED|FOLLOW[ -]?UP|NOT COUNTED|SEAT NOT|PROVISIONAL|WALKIN|GRAND TOTAL/i;
      for (const r of convRows) {
        if (isEmptyRow(r)) continue;
        const nm = norm(r[1]);
        if (!nm || nm.toLowerCase().includes("name") || nm.toLowerCase() === "total") continue;
        if (CONV_STATUS_LIKE.test(nm)) continue;
        const enq = +norm(r[2]) || 0; if (!enq) continue;
        conversionRatio.push({
          counselor: nm, enquiries: enq,
          open: +norm(r[3]) || 0, closed: +norm(r[4]) || 0,
          admissions: +norm(r[5]) || 0,
          ratio: Math.round((+norm(r[6]) || 0) * 100) / 100,
          provisional: +norm(r[7]) || 0,
          ratioWithProv: Math.round((+norm(r[8]) || 0) * 100) / 100,
        });
      }
      conversionRatio.sort((a, b) => b.admissions - a.admissions);

      // ── Target Sheet (monthly target vs achieved) ──────────────
      // targetAchRows[0] = achieved row (B13:N13), targetAchRows[1] = target row (B14:N14)
      // Cols idx 1-11 = Oct-25 through Aug-26; idx 0=label, idx 12=Total
      const TARGET_MONTHS = ["Oct-25","Nov-25","Dec-25","Jan-26","Feb-26","Mar-26","Apr-26","May-26","Jun-26","Jul-26","Aug-26"];
      const achRow  = targetAchRows[0] || [];
      const tgtRow  = targetAchRows[1] || [];
      const monthlyTargets = TARGET_MONTHS.map((mo, i) => ({
        month: mo,
        target: +norm(tgtRow[i + 1]) || 0,
        achieved: +norm(achRow[i + 1]) || 0,
        gap: Math.max(0, (+norm(tgtRow[i + 1]) || 0) - (+norm(achRow[i + 1]) || 0)),
      }));
      const yearTarget = +norm(tgtRow[12]) || 0;
      const yearAchieved = admTotal;   // New Admission List is single source of truth
      const yearTargetGap = Math.max(0, yearTarget - yearAchieved);

      // ── MIS Dashboard (latest day's ops data) ─────────────────
      const misDateRows = misDashRows.filter((r: any[]) => r[0] && /\d{1,2}\.\d{2}\.\d{4}/.test(norm(r[0])) && norm(r[1]));
      const lastMIS = misDateRows[misDateRows.length - 1] || [];
      const misData = {
        date: norm(lastMIS[0]) || "",
        walkins: +norm(lastMIS[1]) || 0,
        admissions: +norm(lastMIS[2]) || 0,
        targetGap: +norm(lastMIS[3]) || 0,
      };

      // ── Shape outputs ──────────────────────────────────────────
      const sortedMonths = (m: Map<string,any>) => Array.from(m.entries()).sort((a,b) => a[0].localeCompare(b[0]));
      recentWalkins.sort((a,b) => b.sortKey - a.sortKey);
      recentAdmissions.sort((a,b) => b.sortKey - a.sortKey);
      recentProvisional.sort((a,b) => b.sortKey - a.sortKey);

      const counselorLeaderboard = Array.from(counselorMap, ([name, a]) => ({
        counselor: name,
        walkins: a.walkins,
        admissions: a.admissions,
        provisional: a.provisional,
        closed: a.closed,
        followup: a.followup,
        admFromList: admByCounselor.get(name) || 0,
        conversion: a.walkins ? Math.round(((a.admissions + a.provisional) / a.walkins) * 10000) / 100 : 0,
      })).sort((a,b) => b.admissions - a.admissions).filter(c => c.walkins > 0 && c.counselor !== "Unassigned");

      const overallConversion = walkinsTotal ? Math.round((admTotal / walkinsTotal) * 10000) / 100 : 0;

      // ── Per-month breakdown for client-side filtering ──────────
      const monthBreakdown = Array.from(monthWalkinMap.entries())
        .sort((a,b) => a[0].localeCompare(b[0]))
        .map(([mk, mw]) => {
          const admSrc = walkinAdmSrcByMonth.get(mk);
          return {
            monthKey: mk, label: mw.label,
            walkins: mw.walkins,
            admissions: mw.admissions,
            closed: mw.closed,
            provisional: mw.provisional,
            followup: mw.followup,
            admBySource: admSrc ? sortByCount(admSrc).map(x => ({ source: x.key, count: x.count })) : [],
            closedSegs: sortByCount(mw.closedSegs).map(x => ({ segment: x.key, count: x.count })),
            counselors: Array.from(mw.counselors, ([name, c]) => ({
              counselor: name, ...c, admFromList: 0,
              conversion: c.walkins ? Math.round(((c.admissions + c.provisional) / c.walkins) * 10000) / 100 : 0,
            })).sort((a,b) => b.admissions - a.admissions).filter(c => c.walkins > 0 && c.counselor !== "Unassigned"),
          };
        });

      // ── RIS DM Pipeline (from Walk-in Sheet — "Digital Marketing" source) ───
      // Reuses walkinRows (already fetched). Filters for source = "Digital Marketing".
      // Shows RA (counselor) breakdown, open leads, ageing, monthly trend.
      // Cols: 7=Counselor(RA)  8=Source  9=Status  1=Date  3=Name  4=Grade
      const dmIsAdm2   = (st: string) => st.includes("ADMIS") && !st.includes("PROV");
      const dmIsProv2  = (st: string) => st.includes("PROV");
      const dmIsClosd2 = (st: string) => st.includes("CLOSED") || st.includes("SEAT NOT") || st.includes("NOT COUNT");

      let dm2Total = 0, dm2Open = 0, dm2Admitted = 0, dm2Closed = 0, dm2Provisional = 0;
      const dm2RaMap = new Map<string, { total: number; open: number; admitted: number; closed: number; provisional: number }>();
      const dm2MonthMap = new Map<string, { label: string; total: number; open: number; admitted: number; closed: number }>();
      const dm2AgeingBuckets: Record<string, number> = { "0-7d": 0, "8-14d": 0, "15-30d": 0, "31-60d": 0, "60d+": 0 };
      const dm2OpenLeads: Array<{ date: string; name: string; grade: string; ra: string; status: string; daysOpen: number }> = [];

      for (const r of walkinRows) {
        if (isEmptyRow(r)) continue;
        const name = norm(r[3]); if (!name) continue;
        const srcFull = norm(r[8]);
        if (!srcFull.toLowerCase().includes("digital marketing")) continue;

        const d = parseDate(r[1]);
        const counselorRaw = norm(r[7]);
        const isStatusVal = /ADMIS|CLOSED|FOLLOW[ -]?UP|NOT COUNT|SEAT NOT|PROV|WALKIN/i.test(counselorRaw);
        const ra = (!isStatusVal && counselorRaw) ? counselorRaw : "Unassigned";
        const status = upper(r[9]) || "OPEN";
        const grade = norm(r[4]) || "Unspecified";

        const isAdm   = dmIsAdm2(status);
        const isProv  = dmIsProv2(status);
        const isClosed= dmIsClosd2(status);
        const isOpen  = !isAdm && !isProv && !isClosed;

        dm2Total++;
        if (isAdm) dm2Admitted++;
        else if (isProv) dm2Provisional++;
        else if (isClosed) dm2Closed++;
        else dm2Open++;

        const raEntry = dm2RaMap.get(ra) || { total:0, open:0, admitted:0, closed:0, provisional:0 };
        raEntry.total++;
        if (isAdm) raEntry.admitted++;
        else if (isProv) raEntry.provisional++;
        else if (isClosed) raEntry.closed++;
        else raEntry.open++;
        dm2RaMap.set(ra, raEntry);

        if (d) {
          const mk = monthKey(d);
          const ml = monthLabel(d);
          const mo = dm2MonthMap.get(mk) || { label: ml, total:0, open:0, admitted:0, closed:0 };
          mo.total++;
          if (isAdm) mo.admitted++;
          else if (isClosed) mo.closed++;
          else if (!isProv) mo.open++;
          dm2MonthMap.set(mk, mo);

          if (isOpen) {
            const daysOpen = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
            if (daysOpen <= 7)  dm2AgeingBuckets["0-7d"]++;
            else if (daysOpen <= 14) dm2AgeingBuckets["8-14d"]++;
            else if (daysOpen <= 30) dm2AgeingBuckets["15-30d"]++;
            else if (daysOpen <= 60) dm2AgeingBuckets["31-60d"]++;
            else                     dm2AgeingBuckets["60d+"]++;
            dm2OpenLeads.push({ date: d.toISOString().slice(0,10), name, grade, ra, status, daysOpen });
          }
        }
      }

      dm2OpenLeads.sort((a, b) => b.daysOpen - a.daysOpen);

      const dmPipeline = {
        total:       dm2Total,
        open:        dm2Open,
        admitted:    dm2Admitted,
        closed:      dm2Closed,
        provisional: dm2Provisional,
        convRate:    dm2Total > 0 ? Math.round((dm2Admitted / dm2Total) * 1000) / 10 : 0,
        byRA: Array.from(dm2RaMap.entries())
          .map(([ra, v]) => ({
            ra, total: v.total, open: v.open, admitted: v.admitted, closed: v.closed, provisional: v.provisional,
            convRate: v.total > 0 ? Math.round((v.admitted / v.total) * 1000) / 10 : 0,
          }))
          .sort((a, b) => b.total - a.total),
        byMonth: Array.from(dm2MonthMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([mk, v]) => ({ monthKey: mk, label: v.label, total: v.total, open: v.open, admitted: v.admitted, closed: v.closed })),
        ageing: Object.entries(dm2AgeingBuckets)
          .map(([bucket, count]) => ({ bucket, count, pct: dm2Open > 0 ? Math.round((count / dm2Open) * 100) : 0 })),
        recentOpen: dm2OpenLeads.slice(0, 100),
      };

      const risKpis = {
        walkinsTotal,
        walkinsThisMonth,
        admissionsTotal: admTotal,
        admissionsThisMonth: admThisMonth,
        provisionalCount: provTotal,
        provisionalRegular: provRegular,
        provisionalIntegrated: provIntegrated,
        provisionalThisMonth: provThisMonth,
        rpsRollover,
        overallConversion,
        openEnquiries: (statusMap.get("OPEN") || 0) + (statusMap.get("FOLLOW UP") || 0) + (statusMap.get("FOLLOWUP") || 0),
        closedEnquiries: statusMap.get("CLOSED") || 0,
        yearTarget,
        yearAchieved,
        yearTargetGap,
        docsPending,
        docsClear,
        misDate: misData.date,
        misWalkins: misData.walkins,
        misAdmissions: misData.admissions,
        misTargetGap: misData.targetGap,
      };

      // Slim response for AI agents (default). Pass ?full=1 for the complete dashboard payload.
      if (!req.query.full) {
        let slimCheckins = { todayTotal: 0, byRa: [] as any[] };
        try {
          const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
          const istNow = new Date(Date.now() + IST_OFFSET_MS);
          istNow.setUTCHours(0, 0, 0, 0);
          const todayStart = new Date(istNow.getTime() - IST_OFFSET_MS);
          const counts = await storage.getTodayCheckinCounts(todayStart, "RIS");
          slimCheckins = {
            todayTotal: counts.reduce((s: number, r: any) => s + r.count, 0),
            byRa: counts.sort((a: any, b: any) => b.count - a.count).slice(0, 5),
          };
        } catch {}
        return res.json({
          generatedAt: new Date().toISOString(),
          kpis: risKpis,
          leadTemperature,
          walkinsByMonth: sortedMonths(walkinByMonth).map(([k, v]) => ({ monthKey: k, month: v.label, count: v.count })),
          admissionsByMonth: sortedMonths(admByMonth).map(([k, v]) => ({ monthKey: k, month: v.label, total: v.total })),
          topSources: sortByCount(sourceMap).slice(0, 6).map(x => ({ source: x.key, count: x.count })),
          counselorLeaderboard: counselorLeaderboard.slice(0, 8),
          dmPipeline: { total: dmPipeline.total, open: dmPipeline.open, admitted: dmPipeline.admitted, closed: dmPipeline.closed, convRate: dmPipeline.convRate },
          openWalkins: { count: openWalkinsList.length, oldest5: openWalkinsList.sort((a, b) => b.daysOpen - a.daysOpen).slice(0, 5) },
          todayCheckins: slimCheckins,
        });
      }

      res.json({
        generatedAt: new Date().toISOString(),
        kpis: risKpis,
        monthlyTargets,
        walkins: {
          byMonth: sortedMonths(walkinByMonth).map(([k, v]) => ({ monthKey: k, month: v.label, count: v.count })),
          bySource: sortByCount(sourceMap).map(x => ({ source: x.key, count: x.count })),
          byStatus: sortByCount(statusMap).map(x => ({ status: x.key, count: x.count })),
          byGrade: sortByCount(gradeMap).map(x => ({ grade: x.key, count: x.count })),
          recent: recentWalkins.slice(0, 25).map(({sortKey, ...rest}) => rest),
          closedReasonSegments,
        },
        admissions: {
          byMonth: sortedMonths(admByMonth).map(([k, v]) => ({ monthKey: k, month: v.label, total: v.total })),
          byBranch: sortByCount(admByBranch).map(x => ({ branch: x.key, count: x.count })),
          byGrade: sortByCount(walkinAdmByGrade).map(x => ({ grade: x.key, count: x.count })),
          bySource: sortByCount(walkinAdmBySource).map(x => ({ source: x.key, count: x.count })),
          byCounselor: sortByCount(walkinAdmByCounselor).map(x => ({ counselor: x.key, count: x.count })),
          recent: recentAdmissions.slice(0, 25).map(({sortKey, ...rest}) => rest),
          recentProvisional: recentProvisional.slice(0, 10).map(({sortKey, ...rest}) => rest),
        },
        counselorLeaderboard,
        conversionRatio,
        monthBreakdown,
        leadTemperature,
        heatGrid: heatGridArr,
        dmPipeline,
        openWalkins: openWalkinsList.sort((a, b) => b.daysOpen - a.daysOpen),
        liveCheckins: await (async () => {
          try {
            // IST midnight in UTC: IST = UTC+5:30, so IST midnight = UTC 18:30 previous day
            const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
            const nowUTC = Date.now();
            const istNow = new Date(nowUTC + IST_OFFSET_MS);
            istNow.setUTCHours(0, 0, 0, 0);
            const todayStart = new Date(istNow.getTime() - IST_OFFSET_MS);
            const [todayCounts, todayRecent, last7Days] = await Promise.all([
              storage.getTodayCheckinCounts(todayStart, "RIS"),
              storage.listCheckins(todayStart, "RIS"),
              storage.getDailyCheckinCounts(7, "RIS"),
            ]);
            return {
              todayTotal: todayCounts.reduce((s, r) => s + r.count, 0),
              byRa: todayCounts.sort((a, b) => b.count - a.count),
              recent: todayRecent.slice(0, 20),
              last7Days,
            };
          } catch {
            return { todayTotal: 0, byRa: [], recent: [], last7Days: [] };
          }
        })(),
      });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch sales data", error: err.message });
    }
  });

  // ── OpenAPI schema served as static file ──────────────────
  // client/public/openapi.yaml is the single source of truth, served by Vite
  // (dev) and express.static (prod). Do not re-add a dynamic /openapi.yaml route
  // here — it shadows the static file and drifts out of sync, which broke the
  // ChatGPT custom GPT in May 2026 (spec missing /api/marketing/export).
  /* DISABLED dynamic /openapi.yaml route — kept commented for history only.
  app.get("/openapi.yaml", (req, res) => {
    const proto = "https";
    const host  = "rainbowinternationalschool.in";
    const base  = `${proto}://${host}`;
    const yaml  = `openapi: "3.0.0"
info:
  title: Rainbow Group Marketing API
  description: >
    Live marketing, CRM and operations data for Rainbow International School (RIS)
    and Rainbow Preschools (RPS). Protected endpoints require the ADMIN_TOKEN as
    an API key in the X-Api-Key header.
  version: "1.0.0"
servers:
  - url: ${base}
    description: Rainbow Group API

security:
  - ApiKeyAuth: []

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-Api-Key

paths:
  /api/marketing/live:
    get:
      operationId: getMarketingLive
      summary: Live combined marketing metrics from Google Sheets
      description: >
        Returns live monthly totals (leads, bookings, walk-ins, admissions, ad spend)
        for both RIS and RPS combined, sourced directly from the DM Overall master
        Google Sheet. Also includes RPS branch-wise CRM, RIS education-level CRM,
        closed-lead reasons for both, and May weekly breakdown. No auth required.
      security: []
      responses:
        "200":
          description: >
            Live aggregated data — monthly totals, RPS branch CRM, RIS grade CRM,
            closed reasons, May weekly, and current day of month.

  /api/sheets/crm:
    get:
      operationId: getSheetsCrm
      summary: CRM lead summary by status, source, month and owner
      description: >
        Returns live lead counts from the RPS or RIS CRM Google Sheet, aggregated
        by status (ADM DONE, CLOSED, Open…), lead source, month, and owner.
        Optionally filter to a single month.
      parameters:
        - name: account
          in: query
          required: true
          schema:
            type: string
            enum: [ris, rps]
          description: Which school's CRM to query.
        - name: month
          in: query
          required: false
          schema:
            type: string
          description: >
            Optional month filter (case-insensitive substring match), e.g. "may",
            "apr", "jan". Omit for all months.
      responses:
        "200":
          description: >
            CRM summary with totalLeads, admissionsDone, closed, open,
            conversionRate, and breakdowns by status, source, month, and owner.
        "401":
          description: Missing or invalid API key.

  /api/sheets/master:
    get:
      operationId: getSheetsMaster
      summary: Weekly funnel breakdown from the DM master tracker
      description: >
        Returns week-by-week lead → booking → walk-in → admission data for a
        given school and month from the DM master Google Sheet.
      parameters:
        - name: account
          in: query
          required: true
          schema:
            type: string
            enum: [ris, rps]
          description: Which school's tab to fetch.
        - name: month
          in: query
          required: false
          schema:
            type: string
            enum: [may, april, feb]
          description: Month to retrieve. Defaults to may.
      responses:
        "200":
          description: Weekly breakdown — leads, walk-ins, admissions, conversion rates.
        "401":
          description: Missing or invalid API key.

  /api/sheets/targets:
    get:
      operationId: getSheetsTargets
      summary: Branch/grade actuals vs targets from Google Sheets
      description: >
        RPS — returns per-branch actuals (leads, bookings, walk-ins, admissions,
        conversion rates) alongside monthly targets.
        RIS — returns per-grade actuals (Nursery through Class 12).
      parameters:
        - name: account
          in: query
          required: true
          schema:
            type: string
            enum: [ris, rps]
          description: Which school's target sheet to fetch.
      responses:
        "200":
          description: Per-branch actuals vs monthly targets (RPS) or per-grade actuals (RIS).
        "401":
          description: Missing or invalid API key.

  /api/sheets/tasks:
    get:
      operationId: getSheetsTasks
      summary: Key task tracker from Google Sheets
      description: >
        Returns tasks from the Key Task sheet with assignee, due date, status
        and remarks. Optionally filter by status.
      parameters:
        - name: status
          in: query
          required: false
          schema:
            type: string
          description: >
            Filter by task status (case-insensitive substring), e.g. "pending",
            "completed". Omit for all tasks.
      responses:
        "200":
          description: Task list with summary counts (total, completed, pending).
        "401":
          description: Missing or invalid API key.
`;
    res.setHeader("Content-Type", "text/yaml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.send(yaml);
  });
  */

  // ── OpenAPI schema — served dynamically from latest source file ────────
  // This prevents the stale-file problem where Vite’s build output (dist/public/)
  // sometimes lags behind client/public/ during deployment. The dynamic route
  // reads the file directly so ChatGPT always gets the current spec.
  app.get("/openapi.yaml", (_req, res) => {
    res.setHeader("Content-Type", "text/yaml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60, must-revalidate");
    res.send(OPENAPI_YAML);
  });

  // ── RA Walk-in QR Check-in System ──────────────────────────────────────

  function requireAdmin(req: any, res: any, next: any) {
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) return res.status(503).json({ message: "Admin token not configured" });
    const authHeader = req.headers.authorization || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    // Reject immediately if lengths differ (timing-safe compare requires equal-length buffers)
    if (!bearer || bearer.length !== adminToken.length) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      if (!timingSafeEqual(Buffer.from(adminToken), Buffer.from(bearer))) throw new Error();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }

  // Public: get RA info by slug (used by walkin form to display RA name)
  app.get("/api/walkin/:slug/info", async (req, res) => {
    try {
      const ra = await storage.getRaBySlug(req.params.slug);
      if (!ra || !ra.active) return res.status(404).json({ message: "RA not found or inactive" });
      res.json({ id: ra.id, name: ra.name, branch: ra.branch });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Public: submit walk-in check-in
  app.post("/api/walkin/:slug", async (req, res) => {
    try {
      const ra = await storage.getRaBySlug(req.params.slug);
      if (!ra || !ra.active) return res.status(404).json({ message: "RA not found or inactive" });
      const { parentName, studentName, grade } = req.body;
      if (!parentName?.trim() || !studentName?.trim() || !grade?.trim()) {
        return res.status(400).json({ message: "parentName, studentName, and grade are required" });
      }
      const checkin = await storage.createCheckin(ra.id, ra.name, ra.branch, parentName.trim(), studentName.trim(), grade.trim(), ra.school);
      console.log(`[walkin] Check-in (${ra.school}): ${parentName} / ${studentName} (${grade}) → ${ra.name}`);
      res.status(201).json({ success: true, id: checkin.id });
      // Best-effort: sync to Google Sheets in the background (does not block or affect the response)
      const appendFn = checkin.school === "RPS" ? appendToRpsWalkinSheet : appendToWalkinSheet;
      appendFn(checkin)
        .then(() => storage.markCheckinSynced(checkin.id))
        .catch(async (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[walkin] Sheet sync failed for ${checkin.id}: ${msg}`);
          await storage.markCheckinSyncFailed(checkin.id, msg).catch(() => {});
        });
    } catch {
      res.status(500).json({ message: "Failed to record check-in" });
    }
  });

  // Admin: manually retry syncing all unsynced check-ins to Google Sheets
  app.post("/api/admin/ras/sync-sheets", requireAdmin, async (_req, res) => {
    try {
      const rows = await storage.listUnsyncedCheckins();
      let synced = 0;
      let failed = 0;
      for (const row of rows) {
        try {
          await (row.school === "RPS" ? appendToRpsWalkinSheet(row) : appendToWalkinSheet(row));
          await storage.markCheckinSynced(row.id);
          synced++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          await storage.markCheckinSyncFailed(row.id, msg).catch(() => {});
          failed++;
        }
      }
      res.json({ total: rows.length, synced, failed });
    } catch {
      res.status(500).json({ message: "Sync failed" });
    }
  });

  // Admin: list all RAs
  app.get("/api/admin/ras", requireAdmin, async (_req, res) => {
    try {
      res.json(await storage.listRas());
    } catch {
      res.status(500).json({ message: "Failed to fetch RAs" });
    }
  });

  // Admin: get single RA by slug (for QR card page)
  app.get("/api/admin/ras/slug/:slug", requireAdmin, async (req, res) => {
    try {
      const ra = await storage.getRaBySlug(req.params.slug);
      if (!ra) return res.status(404).json({ message: "RA not found" });
      res.json(ra);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin: list all submissions with optional ?since= filter
  app.get("/api/admin/ras/submissions", requireAdmin, async (req, res) => {
    try {
      const since = req.query.since ? new Date(String(req.query.since)) : undefined;
      res.json(await storage.listCheckins(since));
    } catch {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Admin: create RA
  app.post("/api/admin/ras", requireAdmin, async (req, res) => {
    try {
      const validated = insertRaSchema.parse(req.body);
      const existing = await storage.getRaBySlug(validated.slug);
      if (existing) return res.status(409).json({ message: `Slug "${validated.slug}" is already taken` });
      res.status(201).json(await storage.createRa(validated));
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: fromZodError(err).message });
      res.status(500).json({ message: "Failed to create RA" });
    }
  });

  // Admin: update RA
  app.put("/api/admin/ras/:id", requireAdmin, async (req, res) => {
    try {
      const validated = insertRaSchema.partial().parse(req.body);
      if (validated.slug) {
        const existing = await storage.getRaBySlug(validated.slug);
        if (existing && existing.id !== req.params.id) {
          return res.status(409).json({ message: `Slug "${validated.slug}" is already taken` });
        }
      }
      const ra = await storage.updateRa(req.params.id, validated);
      if (!ra) return res.status(404).json({ message: "RA not found" });
      res.json(ra);
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: fromZodError(err).message });
      res.status(500).json({ message: "Failed to update RA" });
    }
  });

  // Sales: today's live check-in counts (no extra auth — same trust level as /api/sales/live)
  app.get("/api/walkin/today", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    try {
      const schoolParam = typeof req.query.school === "string" ? req.query.school.toUpperCase() : undefined;
      const school = schoolParam === "RIS" || schoolParam === "RPS" ? schoolParam : undefined;
      const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
      const istNow = new Date(Date.now() + IST_OFFSET_MS);
      istNow.setUTCHours(0, 0, 0, 0);
      const todayStart = new Date(istNow.getTime() - IST_OFFSET_MS);
      const [counts, recent] = await Promise.all([
        storage.getTodayCheckinCounts(todayStart, school),
        storage.listCheckins(todayStart, school),
      ]);
      const total = counts.reduce((s, r) => s + r.count, 0);
      res.json({ total, byRa: counts, recent: recent.slice(0, 30) });
    } catch {
      res.status(500).json({ message: "Failed to fetch today's check-ins" });
    }
  });

  // ── RPS Marketing Monthly Spend (real data from master sheet) ───────────────
  app.get("/api/marketing/monthly", async (_req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    try {
      // Re-use the already-parsed rpsSpend from /api/marketing/live by fetching it internally.
      // rpsSpend month labels ("Dec 25", "Jan 26", …) → YYYY-MM monthKeys for the RpsSales page.
      const LABEL_TO_KEY: Record<string, string> = {
        "Jun 25": "2025-06", "Jul 25": "2025-07", "Aug 25": "2025-08",
        "Sep 25": "2025-09", "Oct 25": "2025-10", "Nov 25": "2025-11",
        "Dec 25": "2025-12", "Jan 26": "2026-01", "Feb 26": "2026-02",
        "Mar 26": "2026-03", "Apr 26": "2026-04", "May 26": "2026-05",
        "Jun 26": "2026-06",
      };
      const liveResp = await fetch(`http://localhost:${process.env.PORT ?? 5000}/api/marketing/live`);
      if (!liveResp.ok) return res.json([]);
      const live = await liveResp.json() as { rpsSpend: Array<{ month: string; salaries: number; meta: number; google: number; adSpend: number }> };
      const result = (live.rpsSpend ?? [])
        .filter(s => s.adSpend > 0 || s.salaries > 0)
        .map(s => {
          const monthKey = LABEL_TO_KEY[s.month] ?? "";
          return { monthKey, label: s.month, salaries: s.salaries, meta: s.meta, google: s.google, adSpend: s.adSpend, total: s.adSpend };
        })
        .filter(s => s.monthKey);
      res.json(result);
    } catch (err: any) {
      console.error("[marketing/monthly] error:", err?.message);
      res.status(500).json({ message: "Failed to fetch RPS marketing spend" });
    }
  });

  // ── RPS Sales Dashboard ─────────────────────────────────────────────────────
  app.get("/api/rps-sales/live", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    try {
      const RPS_SID = "1ShXsyfbtViGccYcgPGMIEcT8C4m_Cs3b6yio6N54D1Q";
      const [walkinRows, indConvRows, dmRows, misRows, dCohortRows, branchClosedRows, branchAsmRows, branchOpenRows, branchWalkinRows] = await Promise.all([
        fetchSheetRange(RPS_SID, "'Walkin Data'!A2:U5000"),
        fetchSheetRange(RPS_SID, "'Individual Conversion'!A3:K100"),
        fetchSheetRange(RPS_SID, "'DM Tracker'!A2:Z2000"),
        fetchSheetRange(RPS_SID, "'MIS DASHBOARD'!A5:D100"),
        fetchSheetRange(RPS_SID, "'D-Cohort'!A1:I200"),
        fetchSheetRange(RPS_SID, "'Branch Closed'!A1:C200"),
        fetchSheetRange(RPS_SID, "'Branch Admissions'!A2:K10"),
        fetchSheetRange(RPS_SID, "'Branch Open'!A2:G10"),
        fetchSheetRange(RPS_SID, "'Branch Walkin'!A2:I10"),
      ]);

      const norm  = (s: any) => String(s ?? "").trim();
      const upper = (s: any) => norm(s).toUpperCase();
      const isEmptyRow = (r: any[]) => !r || r.every(c => norm(c) === "");
      const toInt = (s: any) => parseInt(norm(s).replace(/,/g, ""), 10) || 0;

      const parseDate = (s: any): Date | null => {
        const v = norm(s); if (!v) return null;
        const t = v.replace(/\./g, "/").replace(/\s+/g, " ");
        const d1 = new Date(t);
        if (!isNaN(d1.getTime()) && d1.getFullYear() > 2020 && d1.getFullYear() < 2030) return d1;
        const m = t.match(/^(\d{1,2})[\s\-\/]([A-Za-z]{3,})[\s\-\/](\d{2,4})$/);
        if (m) {
          const y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
          const d2 = new Date(`${m[2]} ${m[1]}, ${y}`);
          if (!isNaN(d2.getTime())) return d2;
        }
        return null;
      };
      const mkKey   = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const mkLabel = (d: Date) => d.toLocaleString("en-US", { month: "short", year: "2-digit" });

      const now = new Date();
      const curMK = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

      // ── Walkin Data ─────────────────────────────────────────────────────────
      // Cols: 0=No 1=Date 2=Month 3=Branch 4=StudentName 5=Grade 6=AcadYear
      //       7=MotherContact 8=FatherContact 9=Email 10=Counsellor
      //       11=CounsellingRecorded 12=SchoolTour 13=SOURCE 14=Status
      //       15=AdmDate 16=Remarks 17=ReasonForClosed 18=Trial 19=UniqueID 20=MIS
      let totalEnq = 0, totalAdm = 0, totalAdmRIS = 0, openEnq = 0, closedTotal = 0, inProcess = 0, futureProspect = 0;
      let thisMonthEnq = 0, thisMonthAdm = 0;

      const byMonthMap  = new Map<string, { label: string; enquiries: number; admissions: number }>();
      type MonthDetail = { monthKey: string; label: string; enquiries: number; admissions: number; branches: Map<string, { enquiries: number; admissions: number }>; sources: Map<string, { enquiries: number; admissions: number }> };
      const monthDetailMap = new Map<string, MonthDetail>();
      const byBranchMap = new Map<string, { enquiries: number; admissions: number; open: number; closed: number }>();
      const bySourceMap = new Map<string, { enquiries: number; admissions: number }>();
      const byGradeMap  = new Map<string, number>();
      const closedReasonMap = new Map<string, number>();
      type RpsRecent = { date: string; monthKey: string; name: string; grade: string; branch: string; counselor: string; source: string; status: string; sortKey: number };
      const recentEnquiries: RpsRecent[] = [];
      // Lead time (enquiry → admission)
      const leadDays: number[] = [];
      // Ageing for open/in-process leads
      let age0_7 = 0, age7_14 = 0, age15_30 = 0, age31_60 = 0, age60p = 0;
      const rpsOpenWalkins: Array<{ date: string; name: string; grade: string; branch: string; counselor: string; source: string; status: string; daysOpen: number }> = [];
      // Closed reason by month for heat-map
      const closedByMonthReason = new Map<string, Map<string, number>>();
      // Counselor funnel (from Walkin Data cols 11=CounsellingRecorded 12=SchoolTour)
      type CounFunnel = { display: string; enquiries: number; counselled: number; toured: number; admitted: number };
      const counselorFunnelMap = new Map<string, CounFunnel>();
      // Counselor leaderboard — derived directly from Walkin Data (more accurate than pivot)
      type CounLB = { display: string; admDone: number; admRIS: number; closed: number; open: number; inProcess: number; futureProspect: number; total: number };
      const counselorLBMap = new Map<string, CounLB>();
      // Title-case helper for merging name variants ("Snehal shetty" → "Snehal Shetty")
      const toTitleCase = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());

      for (const r of walkinRows) {
        if (isEmptyRow(r)) continue;
        const name = norm(r[4]); if (!name) continue;
        const d       = parseDate(r[1]);
        const branch  = norm(r[3]) || "Unknown";
        const source  = norm(r[13]) || "Unknown";
        const statusRaw = upper(r[14]);
        const grade   = norm(r[5]) || "Unspecified";
        const reason  = norm(r[17]);
        const counselor = norm(r[10]) || "Unassigned";

        const isAdm    = statusRaw === "ADM DONE";
        const isAdmRIS = statusRaw === "ADM DONE IN RIS";
        const isClosed = statusRaw.startsWith("CLOSED");
        const isOpen   = statusRaw === "OPEN";
        const isInProc = statusRaw === "IN PROCESS ADM";
        const isFuture = statusRaw.startsWith("FUTURE");

        totalEnq++;
        if (isAdm)    totalAdm++;
        if (isAdmRIS) totalAdmRIS++;
        if (isClosed) { closedTotal++; if (reason) closedReasonMap.set(reason, (closedReasonMap.get(reason)||0)+1); }
        if (isOpen)   openEnq++;
        if (isInProc) inProcess++;
        if (isFuture) futureProspect++;

        if (d) {
          const mk = mkKey(d);
          const lbl = mkLabel(d);
          const mo = byMonthMap.get(mk) || { label: lbl, enquiries: 0, admissions: 0 };
          mo.enquiries++;
          if (isAdm || isAdmRIS) mo.admissions++;
          byMonthMap.set(mk, mo);
          // per-month branch+source detail (for month filter)
          const det = monthDetailMap.get(mk) || { monthKey: mk, label: lbl, enquiries: 0, admissions: 0, branches: new Map(), sources: new Map() };
          det.enquiries++;
          if (isAdm || isAdmRIS) det.admissions++;
          const detBr = det.branches.get(branch) || { enquiries: 0, admissions: 0 };
          detBr.enquiries++; if (isAdm || isAdmRIS) detBr.admissions++;
          det.branches.set(branch, detBr);
          const detSrc = det.sources.get(source) || { enquiries: 0, admissions: 0 };
          detSrc.enquiries++; if (isAdm || isAdmRIS) detSrc.admissions++;
          det.sources.set(source, detSrc);
          monthDetailMap.set(mk, det);
          if (mk === curMK) { thisMonthEnq++; if (isAdm || isAdmRIS) thisMonthAdm++; }
          // Lead time (v2.3 bug fix: strictly > 0 days, admDate must be after enqDate)
          if ((isAdm || isAdmRIS) && norm(r[15])) {
            const admD = parseDate(r[15]);
            if (admD) {
              const days = Math.round((admD.getTime() - d.getTime()) / 86400000);
              if (days > 0 && days < 400) leadDays.push(days);
            }
          }
          // Ageing for open leads
          if (isOpen || isInProc || isFuture) {
            const daysOld = Math.round((now.getTime() - d.getTime()) / 86400000);
            if (daysOld < 7) age0_7++;
            else if (daysOld < 15) age7_14++;
            else if (daysOld < 31) age15_30++;
            else if (daysOld < 61) age31_60++;
            else age60p++;
          }
          // Closed reason by month
          if (isClosed && reason) {
            const rMap = closedByMonthReason.get(mk) || new Map();
            rMap.set(reason, (rMap.get(reason)||0)+1);
            closedByMonthReason.set(mk, rMap);
          }
        }
        // Collect open walk-in leads (visited but not yet admitted/closed)
        if (isOpen || isInProc || isFuture) {
          const daysOpen = d ? Math.floor((now.getTime() - d.getTime()) / 86400000) : 0;
          rpsOpenWalkins.push({ date: d ? d.toISOString().slice(0,10) : norm(r[1]), name, grade, branch, counselor, source, status: statusRaw, daysOpen });
        }

        const br = byBranchMap.get(branch) || { enquiries: 0, admissions: 0, open: 0, closed: 0 };
        br.enquiries++;
        if (isAdm || isAdmRIS) br.admissions++;
        if (isOpen || isInProc || isFuture) br.open++;
        if (isClosed) br.closed++;
        byBranchMap.set(branch, br);

        const src = bySourceMap.get(source) || { enquiries: 0, admissions: 0 };
        src.enquiries++;
        if (isAdm || isAdmRIS) src.admissions++;
        bySourceMap.set(source, src);

        byGradeMap.set(grade, (byGradeMap.get(grade)||0)+1);

        // Counselor funnel — key is lowercase so "Snehal shetty" merges with "Snehal Shetty"
        const cfKey = counselor.toLowerCase();
        const cf = counselorFunnelMap.get(cfKey) || { display: toTitleCase(counselor), enquiries:0, counselled:0, toured:0, admitted:0 };
        cf.enquiries++;
        if (norm(r[11]).toLowerCase() === "yes") cf.counselled++;
        if (norm(r[12]).toLowerCase() === "yes") cf.toured++;
        if (isAdm || isAdmRIS) cf.admitted++;
        counselorFunnelMap.set(cfKey, cf);


        recentEnquiries.push({
          date: d ? `${d.getDate()} ${d.toLocaleString("en-US",{month:"short"})} ${String(d.getFullYear()).slice(2)}` : "",
          monthKey: d ? mkKey(d) : "",
          name, grade, branch, source, status: statusRaw, counselor,
          sortKey: d ? d.getTime() : 0,
        });
      }
      recentEnquiries.sort((a, b) => b.sortKey - a.sortKey);

      // ── Counselor leaderboard — dedicated pass (does NOT gate on student name) ──
      // The main walkin loop skips rows with empty student names; the pivot counts ALL rows
      // where the counsellor column is filled. This separate pass matches the pivot's count.
      for (const r of walkinRows) {
        if (isEmptyRow(r)) continue;
        const coun = norm(r[10]); if (!coun || coun.toLowerCase() === "unassigned") continue;
        const lbKey = coun.toLowerCase();
        const lb = counselorLBMap.get(lbKey) || { display: toTitleCase(coun), admDone:0, admRIS:0, closed:0, open:0, inProcess:0, futureProspect:0, total:0 };
        lb.total++; // count every row where counsellor name is present
        const st = upper(r[14]);
        if (st === "ADM DONE")             lb.admDone++;
        else if (st === "ADM DONE IN RIS") lb.admRIS++;
        else if (st.startsWith("CLOSED"))  lb.closed++;
        else if (st === "OPEN")            lb.open++;
        else if (st === "IN PROCESS ADM")  lb.inProcess++;
        else if (st.startsWith("FUTURE"))  lb.futureProspect++;
        counselorLBMap.set(lbKey, lb);
      }

      // ── Lead time stats ─────────────────────────────────────────────────────
      leadDays.sort((a, b) => a - b);
      const ltMedian = leadDays.length ? leadDays[Math.floor(leadDays.length / 2)] : 0;
      const ltP90    = leadDays.length ? leadDays[Math.floor(leadDays.length * 0.9)] : 0;
      const ltBuckets = [
        { bucket:"0-15d",  count: leadDays.filter(d=>d<16).length },
        { bucket:"16-30d", count: leadDays.filter(d=>d>=16&&d<31).length },
        { bucket:"31-60d", count: leadDays.filter(d=>d>=31&&d<61).length },
        { bucket:"61-90d", count: leadDays.filter(d=>d>=61&&d<91).length },
        { bucket:">90d",   count: leadDays.filter(d=>d>=91).length },
      ].filter(b=>b.count>0);

      // ── Ageing buckets ──────────────────────────────────────────────────────
      const openActiveTotal = age0_7+age7_14+age15_30+age31_60+age60p;
      const ageingBuckets = [
        { bucket:"<7 days",    count:age0_7,   pct: openActiveTotal ? Math.round(age0_7/openActiveTotal*100)   : 0 },
        { bucket:"7-14 days",  count:age7_14,  pct: openActiveTotal ? Math.round(age7_14/openActiveTotal*100)  : 0 },
        { bucket:"15-30 days", count:age15_30, pct: openActiveTotal ? Math.round(age15_30/openActiveTotal*100) : 0 },
        { bucket:"31-60 days", count:age31_60, pct: openActiveTotal ? Math.round(age31_60/openActiveTotal*100) : 0 },
        { bucket:">60 days",   count:age60p,   pct: openActiveTotal ? Math.round(age60p/openActiveTotal*100)   : 0 },
      ];

      // ── Counselor funnel top 12 ─────────────────────────────────────────────
      const counselorFunnel = Array.from(counselorFunnelMap, ([, f]) => ({ counselor: f.display, enquiries: f.enquiries, counselled: f.counselled, toured: f.toured, admitted: f.admitted }))
        .filter(c => c.enquiries > 2)
        .sort((a, b) => b.admitted - a.admitted)
        .slice(0, 12);

      // ── Closed-reason trend heat-map ────────────────────────────────────────
      const heatMonthKeys = Array.from(byMonthMap.keys()).sort();
      const topReasons = Array.from(closedReasonMap.entries()).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([r])=>r);
      const closedReasonTrend = {
        months: heatMonthKeys.map(mk => byMonthMap.get(mk)?.label || mk),
        monthKeys: heatMonthKeys,
        data: topReasons.map(reason => ({
          reason,
          counts: Object.fromEntries(heatMonthKeys.map(mk => [mk, closedByMonthReason.get(mk)?.get(reason)||0])),
        })),
      };

      // ── Forecast (linear regression on monthly admissions) ──────────────────
      const sortedMoArr = Array.from(byMonthMap, ([mk, v]) => ({ mk, label: v.label, admissions: v.admissions }))
        .sort((a,b) => a.mk.localeCompare(b.mk));
      const regData = sortedMoArr.slice(-6);
      let forecastSeries: Array<{ label: string; actual?: number; projected?: number }> = [];
      if (regData.length >= 3) {
        const n = regData.length;
        const xs = regData.map((_, i) => i);
        const ys = regData.map(m => m.admissions);
        const sX = xs.reduce((s,x)=>s+x,0), sY = ys.reduce((s,y)=>s+y,0);
        const sXY = xs.reduce((s,x,i)=>s+x*ys[i],0), sX2 = xs.reduce((s,x)=>s+x*x,0);
        const b = (n*sXY-sX*sY)/(n*sX2-sX*sX||1);
        const a = (sY-b*sX)/n;
        forecastSeries = sortedMoArr.map(m => ({ label: m.label, actual: m.admissions }));
        const lastMK = sortedMoArr[sortedMoArr.length-1].mk;
        const [ly, lm] = lastMK.split("-").map(Number);
        for (let i = 1; i <= 2; i++) {
          const nm = lm+i; const ny = nm>12?ly+1:ly; const nml = nm>12?nm-12:nm;
          const projLabel = new Date(ny,nml-1,1).toLocaleString("en-US",{month:"short",year:"2-digit"});
          forecastSeries.push({ label: projLabel, projected: Math.max(0,Math.round(a+b*(n-1+i))) });
        }
      }

      // ── Counselor leaderboard — built from Walkin Data (row-level, most accurate) ──
      // counselorLBMap was populated inside the walkin loop above.
      // Conv% = (admDone + admRIS) / total enquiries × 100
      const counselorLeaderboard = Array.from(counselorLBMap, ([, c]) => ({
        counselor: c.display, admDone: c.admDone, admRIS: c.admRIS, closed: c.closed,
        open: c.open, inProcess: c.inProcess, futureProspect: c.futureProspect, total: c.total,
        conversion: c.total > 0 ? Math.round(((c.admDone + c.admRIS) / c.total) * 1000) / 10 : 0,
      })).filter(c => c.total > 0).sort((a, b) => (b.admDone + b.admRIS) - (a.admDone + a.admRIS));

      // ── DM Tracker ──────────────────────────────────────────────────────────
      // Cols: 0=UniqueID 1=Date 2=Month 3=Branch 4=StudentName 5=Grade 6=AcadYear
      //       7=MothersContact 8=FathersContact 9=Email 10=Counsellor 11=Source
      //       12=EnqMode 13=AdmDate 14=AdmMonth 15=Remarks 16=DaysSinceVisit(pre-computed)
      //       17=AdmDeadline 18=Status(Admitted/Closed/Open) 19=DeadlineExt
      //       20=SalesConfidence 21=DeadlineStatus 22=ConversionTimeline(days)
      let dmAdmitted = 0, dmOpen = 0, dmClosed = 0;
      const dmByBranchMap    = new Map<string, { admitted: number; open: number; closed: number }>();
      const dmConfidenceMap  = new Map<string, number>();
      // v2.3 additions
      const dmConvTimes: number[] = [];   // days to convert (admitted only)
      type DmCoun = { open: number; admitted: number; closed: number; totalConvDays: number };
      const dmCounselorMap = new Map<string, DmCoun>();
      // DM open ageing using pre-computed DaysSinceVisit (col 16)
      let dmAge0_7 = 0, dmAge7_14 = 0, dmAge15_30 = 0, dmAge31_60 = 0, dmAge60p = 0;
      // Confidence × branch matrix (open only)
      type ConfBr = { branch: string; High: number; Medium: number; Low: number };
      const dmConfBranchMap = new Map<string, ConfBr>();

      for (const r of dmRows) {
        if (isEmptyRow(r)) continue;
        const name     = norm(r[4]); if (!name) continue;
        const status   = norm(r[18]).toLowerCase();
        const branch   = norm(r[3]) || "Unknown";
        const conf     = norm(r[20]) || "Unknown";
        const counselor = norm(r[10]) || "Unassigned";
        const daysSince = parseInt(norm(r[16])||"0", 10);
        const convDays  = parseInt(norm(r[22])||"0", 10);

        if (status === "admitted")    dmAdmitted++;
        else if (status === "closed") dmClosed++;
        else if (status === "open")   dmOpen++;
        else continue;

        const br = dmByBranchMap.get(branch) || { admitted:0, open:0, closed:0 };
        if (status === "admitted") { br.admitted++; if (convDays > 0) dmConvTimes.push(convDays); }
        else if (status === "closed") br.closed++;
        else if (status === "open")   { br.open++; }
        dmByBranchMap.set(branch, br);

        if (conf && conf !== "Unknown")
          dmConfidenceMap.set(conf, (dmConfidenceMap.get(conf)||0) + (status === "open" ? 1 : 0));

        // Counselor DM breakdown
        const dc = dmCounselorMap.get(counselor) || { open:0, admitted:0, closed:0, totalConvDays:0 };
        if (status === "admitted") { dc.admitted++; if (convDays > 0) dc.totalConvDays += convDays; }
        else if (status === "closed") dc.closed++;
        else if (status === "open") dc.open++;
        dmCounselorMap.set(counselor, dc);

        // DM ageing for open records (using pre-computed DaysSinceVisit)
        if (status === "open" && daysSince >= 0) {
          if (daysSince < 7)       dmAge0_7++;
          else if (daysSince < 15) dmAge7_14++;
          else if (daysSince < 31) dmAge15_30++;
          else if (daysSince < 61) dmAge31_60++;
          else                     dmAge60p++;
        }

        // Confidence × branch matrix (open)
        if (status === "open") {
          const cb = dmConfBranchMap.get(branch) || { branch, High:0, Medium:0, Low:0 };
          if (conf === "High") cb.High++;
          else if (conf === "Medium") cb.Medium++;
          else if (conf === "Low") cb.Low++;
          dmConfBranchMap.set(branch, cb);
        }
      }

      // DM derived stats
      dmConvTimes.sort((a,b)=>a-b);
      const dmConvMedian = dmConvTimes.length ? dmConvTimes[Math.floor(dmConvTimes.length/2)] : 0;
      const dmOpenTotal  = dmAge0_7+dmAge7_14+dmAge15_30+dmAge31_60+dmAge60p;
      const dmAgeing = [
        { bucket:"<7 days",   count:dmAge0_7,   pct: dmOpenTotal?Math.round(dmAge0_7/dmOpenTotal*100):0 },
        { bucket:"7-14 days", count:dmAge7_14,  pct: dmOpenTotal?Math.round(dmAge7_14/dmOpenTotal*100):0 },
        { bucket:"15-30 days",count:dmAge15_30, pct: dmOpenTotal?Math.round(dmAge15_30/dmOpenTotal*100):0 },
        { bucket:"31-60 days",count:dmAge31_60, pct: dmOpenTotal?Math.round(dmAge31_60/dmOpenTotal*100):0 },
        { bucket:">60 days",  count:dmAge60p,   pct: dmOpenTotal?Math.round(dmAge60p/dmOpenTotal*100):0 },
      ];
      const dmCounselorStats = Array.from(dmCounselorMap, ([counselor, c]) => ({
        counselor, ...c,
        avgConvDays: c.admitted > 0 ? Math.round(c.totalConvDays / c.admitted) : 0,
        total: c.open + c.admitted + c.closed,
        conv: (c.open+c.admitted+c.closed) ? Math.round(c.admitted/(c.open+c.admitted+c.closed)*100) : 0,
      })).filter(c => c.total > 0).sort((a,b) => b.admitted - a.admitted).slice(0, 12);

      // ── D-Cohort (weekly DM conversion speed cohort) ─────────────────────────
      // Col: 0=WeekStart 1=Walkins 2=AdmDone 3=Conv% 4=AvgDays 5=0-3d 6=4-7d 7=8-14d 8=15+d
      type CohortRow = { week: string; walkins: number; admDone: number; convPct: number; avgDays: number; b0_3: number; b4_7: number; b8_14: number; b15p: number };
      const dCohort: CohortRow[] = [];
      for (const r of dCohortRows) {
        if (isEmptyRow(r)) continue;
        const week = norm(r[0]); if (!week || week === "Cohort Week Start") continue;
        const walkins = toInt(r[1]); if (!walkins) continue;
        dCohort.push({
          week, walkins, admDone: toInt(r[2]),
          convPct: parseFloat(norm(r[3]).replace("%","")) || 0,
          avgDays: toInt(r[4]), b0_3: toInt(r[5]), b4_7: toInt(r[6]), b8_14: toInt(r[7]), b15p: toInt(r[8]),
        });
      }

      // ── Branch Closed (reason × branch) ─────────────────────────────────────
      // Cols: 0=Branch(may be blank for subsequent rows) 1=Reason 2=Count
      type BranchClosed = { branch: string; reason: string; count: number };
      const branchClosedList: BranchClosed[] = [];
      let lastBranch = "";
      for (const r of branchClosedRows) {
        if (isEmptyRow(r)) continue;
        const br = norm(r[0]); const reason = norm(r[1]); const count = toInt(r[2]);
        if (!reason || !count) continue;
        if (br) lastBranch = br;
        if (lastBranch && lastBranch !== "BRANCH") branchClosedList.push({ branch: lastBranch, reason, count });
      }

      // ── Branch Admissions pivot (source breakdown per branch) ─────────────────
      // Row 0 = ["BRANCH","Brand Tie up","Direct Walkin","DM","DM Online Enquiry","EX-Parent","Referral","Sibling","Telephonic","Grand Total"]
      // Row 1+ = branch data
      type BranchSrcAdm = { branch: string; brandTieup: number; directWalkin: number; dm: number; referral: number; sibling: number; total: number };
      const branchSrcAdmList: BranchSrcAdm[] = [];
      const baHeader = branchAsmRows[0] || [];
      for (let i = 1; i < branchAsmRows.length; i++) {
        const r = branchAsmRows[i];
        const br = norm(r[0]); if (!br || br === "Grand Total") continue;
        branchSrcAdmList.push({
          branch: br, brandTieup: toInt(r[1]), directWalkin: toInt(r[2]),
          dm: toInt(r[3]), referral: toInt(r[5]||"0"), sibling: toInt(r[6]||"0"),
          total: toInt(r[baHeader.length - 1] || r[r.length-1]),
        });
      }

      // ── Branch Open pivot (live open pipeline per branch) ─────────────────────
      // Row 0 = ["BRANCH","Direct Walkin","DM","DM Online Enquiry","Referral","Grand Total"]
      type BranchOpenRow = { branch: string; directWalkin: number; dm: number; referral: number; total: number };
      const branchOpenList: BranchOpenRow[] = [];
      const boHeader = branchOpenRows[0] || [];
      for (let i = 1; i < branchOpenRows.length; i++) {
        const r = branchOpenRows[i];
        const br = norm(r[0]); if (!br || br === "Grand Total") continue;
        branchOpenList.push({
          branch: br, directWalkin: toInt(r[1]), dm: toInt(r[2]), referral: toInt(r[3]||"0"),
          total: toInt(r[boHeader.length - 1] || r[r.length-1]),
        });
      }

      // ── MIS History (cumulative running totals) ─────────────────────────────
      // A5 = first data row; Cols: 0=Date(DD.MM.YYYY) 1=TotalWalkins 2=TotalAdm 3=TargetGap
      const misHistory: Array<{ date: string; walkins: number; admissions: number; gap: number }> = [];
      for (const r of misRows) {
        if (isEmptyRow(r)) continue;
        const date = norm(r[0]); if (!/\d{2}\.\d{2}\.\d{4}/.test(date)) continue;
        const walkins = toInt(r[1]); if (!walkins) continue;
        misHistory.push({ date, walkins, admissions: toInt(r[2]), gap: toInt(r[3]) });
      }

      // ── Shape output ────────────────────────────────────────────────────────
      const byMonth  = Array.from(byMonthMap,  ([monthKey, v]) => ({ monthKey, ...v })).sort((a,b) => a.monthKey.localeCompare(b.monthKey));
      const byBranch = Array.from(byBranchMap, ([branch, v]) => ({
        branch, ...v, conversion: v.enquiries ? Math.round((v.admissions/v.enquiries)*1000)/10 : 0,
      })).sort((a,b) => b.admissions - a.admissions);
      const bySource = Array.from(bySourceMap, ([source, v]) => ({ source, ...v })).sort((a,b) => b.enquiries - a.enquiries);
      const byGrade  = Array.from(byGradeMap,  ([grade, count]) => ({ grade, count })).sort((a,b) => b.count - a.count);
      const closedReasons = Array.from(closedReasonMap, ([reason, count]) => ({ reason, count })).sort((a,b) => b.count - a.count).slice(0,12);
      const overallConversion = totalEnq ? Math.round(((totalAdm + totalAdmRIS)/totalEnq)*1000)/10 : 0;

      const monthlyDetail = Array.from(monthDetailMap.values()).map(det => ({
        monthKey: det.monthKey, label: det.label, enquiries: det.enquiries, admissions: det.admissions,
        branches: Object.fromEntries(Array.from(det.branches.entries()).map(([br, v]) => [br, v])),
        sources:  Object.fromEntries(Array.from(det.sources.entries()).map(([src, v]) => [src, v])),
      })).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

      // Slim response for AI agents (default). Pass ?full=1 for the complete dashboard payload.
      if (!req.query.full) {
        let slimCheckins = { todayTotal: 0, byRa: [] as any[] };
        try {
          const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
          const istNow = new Date(Date.now() + IST_OFFSET_MS);
          istNow.setUTCHours(0, 0, 0, 0);
          const todayStart = new Date(istNow.getTime() - IST_OFFSET_MS);
          const counts = await storage.getTodayCheckinCounts(todayStart, "RPS");
          slimCheckins = {
            todayTotal: counts.reduce((s: number, r: any) => s + r.count, 0),
            byRa: counts.sort((a: any, b: any) => b.count - a.count).slice(0, 5),
          };
        } catch {}
        return res.json({
          generatedAt: new Date().toISOString(),
          kpis: { totalEnquiries: totalEnq, totalAdmissions: totalAdm, totalAdmRIS, openEnquiries: openEnq, closedTotal, inProcess, futureProspect, overallConversion, thisMonthEnquiries: thisMonthEnq, thisMonthAdm },
          byMonth,
          byBranch,
          topSources: bySource.slice(0, 6),
          counselorLeaderboard: counselorLeaderboard.slice(0, 8),
          closedReasons: closedReasons.slice(0, 6),
          dmPipeline: { admitted: dmAdmitted, open: dmOpen, closed: dmClosed, convMedianDays: dmConvMedian },
          ageingBuckets,
          openWalkins: { count: rpsOpenWalkins.length, oldest5: rpsOpenWalkins.sort((a, b) => b.daysOpen - a.daysOpen).slice(0, 5) },
          todayCheckins: slimCheckins,
        });
      }

      res.json({
        generatedAt: new Date().toISOString(),
        kpis: { totalEnquiries: totalEnq, totalAdmissions: totalAdm, totalAdmRIS, openEnquiries: openEnq, closedTotal, inProcess, futureProspect, overallConversion, thisMonthEnquiries: thisMonthEnq, thisMonthAdm },
        byMonth, byBranch, bySource, byGrade, counselorLeaderboard, closedReasons,
        monthlyDetail,
        recentEnquiries: recentEnquiries,
        dmPipeline: {
          admitted: dmAdmitted, open: dmOpen, closed: dmClosed,
          convMedianDays: dmConvMedian,
          byBranch: Array.from(dmByBranchMap, ([branch, v]) => ({ branch, ...v })).sort((a,b) => b.admitted - a.admitted),
          byConfidence: Array.from(dmConfidenceMap, ([confidence, count]) => ({ confidence, count })).filter(x=>x.count>0).sort((a,b) => b.count - a.count),
          ageing: dmAgeing,
          counselors: dmCounselorStats,
          confByBranch: Array.from(dmConfBranchMap.values()).sort((a,b) => (b.High+b.Medium+b.Low)-(a.High+a.Medium+a.Low)),
        },
        misHistory: misHistory.slice(-30),
        leadTime: { median: ltMedian, p90: ltP90, histogram: ltBuckets, sampleSize: leadDays.length },
        ageingBuckets,
        counselorFunnel,
        closedReasonTrend,
        forecastSeries,
        dCohort,
        branchClosedList,
        branchSrcAdm: branchSrcAdmList,
        branchOpenPipeline: branchOpenList,
        openWalkins: rpsOpenWalkins.sort((a, b) => b.daysOpen - a.daysOpen),
        liveCheckins: await (async () => {
          try {
            const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
            const istNow = new Date(Date.now() + IST_OFFSET_MS);
            istNow.setUTCHours(0, 0, 0, 0);
            const todayStart = new Date(istNow.getTime() - IST_OFFSET_MS);
            const [todayCounts, todayRecent, last7Days] = await Promise.all([
              storage.getTodayCheckinCounts(todayStart, "RPS"),
              storage.listCheckins(todayStart, "RPS"),
              storage.getDailyCheckinCounts(7, "RPS"),
            ]);
            return {
              todayTotal: todayCounts.reduce((s, r) => s + r.count, 0),
              byRa: todayCounts.sort((a, b) => b.count - a.count),
              recent: todayRecent.slice(0, 20),
              last7Days,
            };
          } catch {
            return { todayTotal: 0, byRa: [], recent: [], last7Days: [] };
          }
        })(),
      });
    } catch (err: any) {
      console.error("[rps-sales] error:", err?.message);
      res.status(500).json({ message: err?.message || "Failed to load RPS sales data" });
    }
  });

  return httpServer;
}
