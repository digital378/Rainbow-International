import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const inquiries = pgTable("inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentName: text("parent_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  studentName: text("student_name").notNull(),
  grade: text("grade").notNull(),
  preferredTime: text("preferred_time"),
  source: text("source"),
  message: text("message"),
  pagePath: text("page_path"),
  pageTitle: text("page_title"),
  formLocation: text("form_location"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
  source: true,
}).extend({
  parentName: z.string().min(1, "Parent name is required"),
  phone: z.string().min(1, "Phone number is required"),
  studentName: z.string().min(1, "Child's name is required"),
  grade: z.string().min(1, "Please select a class"),
  preferredTime: z.string().optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
  pagePath: z.string().optional().or(z.literal("")),
  pageTitle: z.string().optional().or(z.literal("")),
  formLocation: z.string().optional().or(z.literal("")),
  utmSource: z.string().optional().or(z.literal("")),
  utmMedium: z.string().optional().or(z.literal("")),
  utmCampaign: z.string().optional().or(z.literal("")),
  utmTerm: z.string().optional().or(z.literal("")),
  utmContent: z.string().optional().or(z.literal("")),
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export const callbackRequests = pgTable("callback_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  preferredTime: text("preferred_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCallbackRequestSchema = createInsertSchema(callbackRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertCallbackRequest = z.infer<typeof insertCallbackRequestSchema>;
export type CallbackRequest = typeof callbackRequests.$inferSelect;

export const careerApplications = pgTable("career_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  position: text("position").notNull(),
  experience: text("experience"),
  qualification: text("qualification"),
  currentLocation: text("current_location"),
  resumeFilename: text("resume_filename"),
  resumeMimeType: text("resume_mime_type"),
  resumeSize: text("resume_size"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCareerApplicationSchema = createInsertSchema(careerApplications).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  position: z.string().min(1, "Please select a position"),
  experience: z.string().min(1, "Total experience is required"),
  qualification: z.string().min(1, "Qualification is required"),
  currentLocation: z.string().min(1, "Current location is required"),
  resumeFilename: z.string().optional().or(z.literal("")),
  resumeMimeType: z.string().optional().or(z.literal("")),
  resumeSize: z.string().optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
});

export type InsertCareerApplication = z.infer<typeof insertCareerApplicationSchema>;
export type CareerApplication = typeof careerApplications.$inferSelect;

export const brochureRequests = pgTable("brochure_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardNumber: text("card_number").notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
});

export const insertBrochureRequestSchema = createInsertSchema(brochureRequests).omit({
  id: true,
  requestedAt: true,
}).extend({
  cardNumber: z.string().min(1, "Privilege card number is required"),
  name: z.string().optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export type InsertBrochureRequest = z.infer<typeof insertBrochureRequestSchema>;
export type BrochureRequest = typeof brochureRequests.$inferSelect;
