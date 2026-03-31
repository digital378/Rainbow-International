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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email().optional().or(z.literal("")),
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
