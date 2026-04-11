import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInquirySchema, insertEventSchema, insertCallbackRequestSchema, insertCareerApplicationSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import nodemailer from "nodemailer";
import { registerSSRRoutes } from "./ssrBlog";
import { registerHomeSSR } from "./ssrHome";
import { registerPageSSR } from "./ssrPages";

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

async function sendCareerEmail(data: { name: string; email: string; phone: string; position: string; experience?: string | null; qualification?: string | null; message?: string | null }) {
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
          ${tableRow("Experience", data.experience)}
          ${tableRow("Qualification", data.qualification)}
          ${tableRow("Message", data.message)}
        </table>
        <p style="color:#888;font-size:12px;margin-top:16px;padding:0 4px;">Submitted via the school website careers page.</p>
      </div>
    `,
  });
  console.log("[career] Email sent to", CAREER_EMAIL_TO);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  registerHomeSSR(app);
  registerPageSSR(app);
  registerSSRRoutes(app);

  const wpRedirects: Record<string, string> = {
    "/rainbow-preschool-international": "/pre-primary-school-thane",
    "/importance-of-foundational-literacy-and-numeracy-in-schools": "/blog/importance-of-foundational-literacy-and-numeracy-in-schools",
    "/benefits-of-rainbow-international-school": "/about-rainbow-international-school",
    "/fee-structure-2": "/fee-structure",
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
  app.post("/api/career-applications", async (req, res) => {
    try {
      const validatedData = insertCareerApplicationSchema.parse(req.body);
      const application = await storage.createCareerApplication(validatedData);
      sendCareerEmail(validatedData).catch((err) =>
        console.error("[career] Email error:", err)
      );
      res.status(201).json(application);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to submit career application" });
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

  return httpServer;
}
