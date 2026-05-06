import type { Express } from "express";
import { createServer, type Server } from "http";
import { timingSafeEqual } from "node:crypto";
import { storage } from "./storage";
import { insertInquirySchema, insertEventSchema, insertCallbackRequestSchema, insertCareerApplicationSchema, insertBrochureRequestSchema } from "@shared/schema";
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

  // ── Marketing dashboard JSON export (token-protected) ─────
  // GET /api/marketing/export
  //   Header: Authorization: Bearer <ADMIN_TOKEN>   (preferred — does not log)
  //   Query : ?token=<ADMIN_TOKEN>                  (convenient but logged)
  // Returns the full Marketing dashboard dataset for ChatGPT / external analysis.
  app.get("/api/marketing/export", async (req, res) => {
    try {
      const adminToken = process.env.ADMIN_TOKEN;
      if (!adminToken) {
        return res.status(503).json({ message: "Service unavailable" });
      }
      const headerToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      const xApiKey = typeof req.headers["x-api-key"] === "string" ? req.headers["x-api-key"] : "";
      const queryToken = typeof req.query.token === "string" ? req.query.token : "";
      const presented = xApiKey || headerToken || queryToken;
      const safeEq = (a: string, b: string) => {
        const ab = Buffer.from(a, "utf8");
        const bb = Buffer.from(b, "utf8");
        if (ab.length !== bb.length) return false;
        return timingSafeEqual(ab, bb);
      };
      if (!presented || !safeEq(presented, adminToken)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const data = await import("@shared/marketingData");
      res.setHeader("Cache-Control", "no-store, private, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Vary", "Authorization");
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
      const adminToken = process.env.ADMIN_TOKEN;
      if (!adminToken) {
        return res.status(503).json({ message: "Service unavailable" });
      }
      const headerToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      const xApiKey = typeof req.headers["x-api-key"] === "string" ? req.headers["x-api-key"] : "";
      const queryToken = typeof req.query.token === "string" ? req.query.token : "";
      const presented = xApiKey || headerToken || queryToken;
      const safeEq = (a: string, b: string) => {
        const ab = Buffer.from(a, "utf8");
        const bb = Buffer.from(b, "utf8");
        if (ab.length !== bb.length) return false;
        return timingSafeEqual(ab, bb);
      };
      if (!presented || !safeEq(presented, adminToken)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const data = await import("@shared/marketingData");
      res.setHeader("Cache-Control", "no-store, private, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Vary", "Authorization");
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
    "https://www.googleapis.com/auth/spreadsheets.readonly",
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
    if (!requireAdminToken(req, res)) return;
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
    if (!requireAdminToken(req, res)) return;
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
    const adminToken = process.env.ADMIN_TOKEN;
    const provided = (req.headers["x-api-key"] as string) ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
      (typeof req.query.token === "string" ? req.query.token : "");
    if (!adminToken || !provided || !timingSafeEqual(Buffer.from(adminToken), Buffer.from(provided.padEnd(adminToken.length).slice(0, adminToken.length)))) {
      return res.status(401).json({ message: "Unauthorized" });
    }
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
  function requireAdminToken(req: any, res: any): boolean {
    const adminToken = process.env.ADMIN_TOKEN;
    const provided = (req.headers["x-api-key"] as string) ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
      (typeof req.query.token === "string" ? req.query.token : "");
    if (!adminToken || !provided) { res.status(401).json({ message: "Unauthorized" }); return false; }
    try {
      if (!timingSafeEqual(Buffer.from(adminToken), Buffer.from(provided.padEnd(adminToken.length).slice(0, adminToken.length)))) {
        res.status(401).json({ message: "Unauthorized" }); return false;
      }
    } catch { res.status(401).json({ message: "Unauthorized" }); return false; }
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

  app.get("/api/google-ads/campaigns", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    if (!requireAdminToken(req, res)) return;

    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!devToken) return res.status(503).json({ message: "Google Ads developer token not configured. Apply at ads.google.com → Tools → API Centre." });

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });

    const client = await getGoogleAdsClient();
    if (!client) return res.status(503).json({ message: "Google Ads not configured" });

    try {
      const customer = client.Customer({
        customer_id: customerId,
        login_customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID_MCC || "6478938011",
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });

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
          metrics.average_cpc,
          metrics.cost_per_conversion
        FROM campaign
        WHERE campaign.status = 'ENABLED'
          AND segments.date DURING LAST_30_DAYS
        ORDER BY metrics.cost_micros DESC
        LIMIT 20
      `);

      const rows = campaigns.map((c: any) => ({
        id: c.campaign.id,
        name: c.campaign.name,
        type: c.campaign.advertising_channel_type,
        impressions: c.metrics.impressions,
        clicks: c.metrics.clicks,
        spend: parseFloat((c.metrics.cost_micros / 1_000_000).toFixed(2)),
        conversions: parseFloat((c.metrics.conversions || 0).toFixed(1)),
        ctr: parseFloat((c.metrics.ctr * 100).toFixed(2)),
        avgCpc: parseFloat((c.metrics.average_cpc / 1_000_000).toFixed(2)),
        costPerConversion: c.metrics.cost_per_conversion > 0
          ? parseFloat((c.metrics.cost_per_conversion / 1_000_000).toFixed(2))
          : null,
      }));

      res.json({
        account: account.toUpperCase(),
        customerId,
        period: "last 30 days",
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
    if (!requireAdminToken(req, res)) return;

    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!devToken) return res.status(503).json({ message: "Google Ads developer token not configured" });

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });

    const client = await getGoogleAdsClient();
    if (!client) return res.status(503).json({ message: "Google Ads not configured" });

    try {
      const customer = client.Customer({
        customer_id: customerId,
        login_customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID_MCC || "6478938011",
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });

      const keywords = await customer.query(`
        SELECT
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
        WHERE campaign.status = 'ENABLED'
          AND ad_group.status = 'ENABLED'
          AND ad_group_criterion.status = 'ENABLED'
          AND segments.date DURING LAST_30_DAYS
        ORDER BY metrics.cost_micros DESC
        LIMIT 25
      `);

      const rows = keywords.map((k: any) => ({
        keyword: k.ad_group_criterion.keyword.text,
        matchType: k.ad_group_criterion.keyword.match_type,
        qualityScore: k.ad_group_criterion.quality_info?.quality_score || null,
        impressions: k.metrics.impressions,
        clicks: k.metrics.clicks,
        spend: parseFloat((k.metrics.cost_micros / 1_000_000).toFixed(2)),
        conversions: parseFloat((k.metrics.conversions || 0).toFixed(1)),
        ctr: parseFloat((k.metrics.ctr * 100).toFixed(2)),
        avgCpc: parseFloat((k.metrics.average_cpc / 1_000_000).toFixed(2)),
      }));

      res.json({
        account: account.toUpperCase(),
        customerId,
        period: "last 30 days",
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
    if (!requireAdminToken(req, res)) return;

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
    if (!requireAdminToken(req, res)) return;

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

      const [masterRows, rpsCrmRows, risCrmRows, rpsSchoolRows, risSchoolRows] = await Promise.all([
        fetchSheetRange(SHEET_IDS.master, "DM Overall!A1:Z65"),
        fetchSheetRange(SHEET_IDS.rpsCrm, "DM 2026-27!A:K"),
        fetchSheetRange(SHEET_IDS.risCrm, "Nur to Class 12!A:L"),
        fetchSheetRange(SHEET_IDS.master, "DM RPS MAY' 26!A:S"),
        fetchSheetRange(SHEET_IDS.master, "DM RIS MAY' 26!A:S"),
      ]);

      // ── Per-school master monthly totals (source of truth for walkins/admissions) ──
      // The per-school May tabs contain monthly-level summary rows for all months
      // (all-caps: DECEMBER, JANUARY … APRIL; in-progress month: MAY TOTAL)
      const SCHOOL_MONTH_KEY: Record<string, string> = {
        "AUGUST":"Aug-25","SEPTEMBER":"Sep-25","OCTOBER":"Oct-25","NOVEMBER":"Nov-25",
        "DECEMBER":"Dec-25","JANUARY":"Jan-26","FEBRUARY":"Feb-26","MARCH":"Mar-26",
        "APRIL":"Apr-26","MAY TOTAL":"May-26",
      };
      function parseSchoolRows(rows: string[][]): Array<{month:string;walkins:number;admissions:number}> {
        const hIdx = rows.findIndex(r => r.some(c => String(c).includes("Total Walkins")));
        if (hIdx === -1) return [];
        const header = rows[hIdx];
        const wCol = header.findIndex(h => String(h).includes("Total Walkins"));
        const aCol = header.findIndex(h => String(h).includes("Total Admissions"));
        const seen = new Set<string>();
        const result: Array<{month:string;walkins:number;admissions:number}> = [];
        for (const row of rows.slice(hIdx + 1)) {
          const dateStr = String(row[0] ?? "").trim().toUpperCase();
          const crmKey  = SCHOOL_MONTH_KEY[dateStr];
          if (crmKey && !seen.has(crmKey)) {
            seen.add(crmKey);
            result.push({ month: crmKey, walkins: parseInt(String(row[wCol]??0).replace(/[,\s]/g,""))||0, admissions: parseInt(String(row[aCol]??0).replace(/[,\s]/g,""))||0 });
          }
        }
        return result;
      }
      const rpsSchoolMonthly = parseSchoolRows(rpsSchoolRows);
      const risSchoolMonthly = parseSchoolRows(risSchoolRows);

      // ── DM Overall → monthly combined totals + May weekly ──
      const MONTH_MAP: Record<string, string> = {
        JUNE: "Jun 25", JULY: "Jul 25", AUGUST: "Aug 25", SEPTEMBER: "Sep 25",
        OCTOBER: "Oct 25", NOVEMBER: "Nov 25", DECEMBER: "Dec 25", JANUARY: "Jan 26",
        FEBRUARY: "Feb 26", MARCH: "Mar 26", APRIL: "Apr 26", MAY: "May 26",
      };
      const monthlyTotals: any[] = [];
      const mayWeeklyCombined: any[] = [];
      let inMay = false;

      for (const row of masterRows) {
        const label = String(row[1] ?? "").trim();
        if (!label) continue;
        if (label.toUpperCase().startsWith("TOTAL")) break;
        const monthVal = MONTH_MAP[label.toUpperCase()];
        if (monthVal) {
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

      // ── RPS CRM → branch-wise by month ──
      const MONTH_ORDER = ["Apr-25","May-25","Jun-25","Jul-25","Aug-25","Sep-25","Oct-25","Nov-25","Dec-25","Jan-26","Feb-26","Mar-26","Apr-26","May-26"];
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
      }

      const rpsByMonth = Object.keys(rpsMonthBranch)
        .sort((a, b) => { const ai = MONTH_ORDER.indexOf(a), bi = MONTH_ORDER.indexOf(b); return (ai<0?99:ai)-(bi<0?99:bi); })
        .map(month => {
          const branches = Object.entries(rpsMonthBranch[month])
            .map(([centre, d]) => ({ centre, ...d }))
            .filter(b => b.centre && b.centre !== "Unassigned")
            .sort((a, b) => b.leads - a.leads);
          const total = branches.reduce((a, b) => ({ leads:a.leads+b.leads, bookings:a.bookings+b.bookings, walkins:a.walkins+b.walkins, admissions:a.admissions+b.admissions, closed:a.closed+b.closed }), { leads:0, bookings:0, walkins:0, admissions:0, closed:0 });
          const closedReasons = Object.entries(rpsMonthReasons[month] || {}).filter(([r]) => r.trim()).sort((a,b) => b[1]-a[1]).map(([reason,count]) => ({reason,count}));
          return { month, branches, total, closedReasons };
        });

      // ── RIS CRM → education-level groups by month ──
      const GRADE_MAP: Record<string, string> = {};
      for (const g of ["nursery","playgroup","junior kg","junior kg","senior kg","senior kg","kg"]) GRADE_MAP[g] = "Pre-Primary";
      for (const g of ["class 1","class 2","class 3","class 4","class 5"]) GRADE_MAP[g] = "Primary";
      for (const g of ["class 6","class 7","class 8"]) GRADE_MAP[g] = "Middle";
      for (const g of ["class 9","class 10"]) GRADE_MAP[g] = "Secondary";
      for (const g of ["class 11","class 11 science","class 11 commerce","class 11 humanities","11th","class 12","class 12 science","class 12 commerce","class 12 humanities"]) GRADE_MAP[g] = "Senior Secondary";

      const risMonthGroup: Record<string, Record<string, {leads:number;bookings:number;walkins:number;admissions:number;closed:number}>> = {};
      const risCloseReasons: Record<string, number> = {};
      const risMonthReasons: Record<string, Record<string, number>> = {};
      const risStatusCount: Record<string, number> = {};
      const risSourceCount: Record<string, number> = {};

      for (const r of risCrmRows.slice(1)) {
        if (!r[0] || !r[2]) continue;
        const month = String(r[1] ?? "").trim();
        const grade = String(r[5] ?? "").trim().toLowerCase().replace(/\s+/g, " ");
        const group = GRADE_MAP[grade];
        if (!month || !group) continue;
        const status = String(r[6] ?? "OPEN").trim().toUpperCase();
        const remark = String(r[7] ?? "").trim();
        const source = String(r[9] ?? "Unknown").trim() || "Unknown";
        if (!risMonthGroup[month]) risMonthGroup[month] = {};
        if (!risMonthGroup[month][group]) risMonthGroup[month][group] = { leads:0, bookings:0, walkins:0, admissions:0, closed:0 };
        // Cumulative funnel for RIS (no "CLOSED AFTER WALKIN" status in RIS CRM)
        risMonthGroup[month][group].leads++;
        if (["WALKIN BOOKED","WALK-IN COMPLETED","ADM DONE"].includes(status))
          risMonthGroup[month][group].bookings++;
        if (["WALK-IN COMPLETED","ADM DONE"].includes(status))
          risMonthGroup[month][group].walkins++;
        if (status === "ADM DONE") risMonthGroup[month][group].admissions++;
        if (status === "CLOSED") {
          risMonthGroup[month][group].closed++;
          if (remark) {
            risCloseReasons[remark] = (risCloseReasons[remark] || 0) + 1;
            if (!risMonthReasons[month]) risMonthReasons[month] = {};
            risMonthReasons[month][remark] = (risMonthReasons[month][remark] || 0) + 1;
          }
        }
        risStatusCount[status] = (risStatusCount[status] || 0) + 1;
        risSourceCount[source] = (risSourceCount[source] || 0) + 1;
      }

      const GROUP_ORDER_SRV = ["Pre-Primary","Primary","Middle","Secondary","Senior Secondary"];
      const risByMonth = Object.keys(risMonthGroup)
        .sort((a, b) => { const ai = MONTH_ORDER.indexOf(a), bi = MONTH_ORDER.indexOf(b); return (ai<0?99:ai)-(bi<0?99:bi); })
        .map(month => {
          const groups = GROUP_ORDER_SRV
            .filter(g => risMonthGroup[month][g])
            .map(g => ({ group: g, ...risMonthGroup[month][g] }));
          const total = groups.reduce((a, g) => ({ leads:a.leads+g.leads, bookings:a.bookings+g.bookings, walkins:a.walkins+g.walkins, admissions:a.admissions+g.admissions, closed:a.closed+g.closed }), { leads:0, bookings:0, walkins:0, admissions:0, closed:0 });
          const closedReasons = Object.entries(risMonthReasons[month] || {}).filter(([r]) => r.trim()).sort((a,b) => b[1]-a[1]).map(([reason,count]) => ({reason,count}));
          return { month, groups, total, closedReasons };
        });

      const sortReasons = (map: Record<string, number>) =>
        Object.entries(map).filter(([r]) => r.trim()).sort((a, b) => b[1] - a[1]).map(([reason, count]) => ({ reason, count }));

      res.json({
        generatedAt: new Date().toISOString(),
        currentDayOfMonth: new Date().getDate(),
        monthlyTotals,
        mayWeeklyCombined,
        rpsCrm: { byMonth: rpsByMonth, closedReasons: sortReasons(rpsCloseReasons), statusSummary: rpsStatusCount, bySource: rpsSourceCount },
        risCrm: { byMonth: risByMonth, closedReasons: sortReasons(risCloseReasons), statusSummary: risStatusCount, bySource: risSourceCount },
        rpsSchoolMonthly,
        risSchoolMonthly,
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
  };

  async function fetchSheetRange(sheetId: string, range: string): Promise<string[][]> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Google not connected");
    const { google: goog } = await import("googleapis");
    const sheets = goog.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
    return (res.data.values || []) as string[][];
  }

  // 1. DM Team Task Tracker
  app.get("/api/sheets/tasks", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    if (!requireAdminToken(req, res)) return;
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
    if (!requireAdminToken(req, res)) return;
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

  // 3. Master Weekly Funnel Data
  app.get("/api/sheets/master", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    if (!requireAdminToken(req, res)) return;
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
        tabName = resolvedMonth === "apr" ? "Total RPS Apr'26" : resolvedMonth === "feb" ? "DM RPS Feb' 26" : "DM RPS MAY' 26";
      } else {
        tabName = resolvedMonth === "apr" ? "Total RIS Apr'26" : resolvedMonth === "feb" ? "DM RIS Feb' 26" : "DM RIS MAY' 26";
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
    if (!requireAdminToken(req, res)) return;
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

  // ── OpenAPI schema served as static file ──────────────────
  // client/public/openapi.yaml is served by Vite (dev) and express.static (prod).
  // ChatGPT "Add actions → Import from URL": https://rainbowinternationalschool.in/openapi.yaml
  // This dynamic route is kept only as a fallback; the static file normally wins.
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

  return httpServer;
}
