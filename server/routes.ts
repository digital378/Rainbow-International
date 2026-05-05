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
      const status = reason === "ACCESS_TOKEN_SCOPE_INSUFFICIENT" ? 403 : 500;
      res.status(status).json({ message: "Google Ads campaign query failed", reason });
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
      const status = reason === "ACCESS_TOKEN_SCOPE_INSUFFICIENT" ? 403 : 500;
      res.status(status).json({ message: "Google Ads keyword query failed", reason });
    }
  });

  return httpServer;
}
