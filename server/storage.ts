import {
  type Inquiry, type InsertInquiry,
  type Event, type InsertEvent,
  type CallbackRequest, type InsertCallbackRequest,
  type CareerApplication, type InsertCareerApplication,
  type BrochureRequest, type InsertBrochureRequest,
  type Ra, type InsertRa,
  type WalkinCheckin,
  inquiries, events, callbackRequests, careerApplications, brochureRequests, ras, walkinCheckins,
} from "@shared/schema";
import { db } from "./db";
import { desc, eq, gte, sql } from "drizzle-orm";

export interface IStorage {
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getAllInquiries(): Promise<Inquiry[]>;

  createEvent(event: InsertEvent): Promise<Event>;
  getAllEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<void>;

  createCallbackRequest(req: InsertCallbackRequest): Promise<CallbackRequest>;
  getAllCallbackRequests(): Promise<CallbackRequest[]>;

  createCareerApplication(app: InsertCareerApplication): Promise<CareerApplication>;
  getAllCareerApplications(): Promise<CareerApplication[]>;

  createBrochureRequest(req: InsertBrochureRequest): Promise<BrochureRequest>;
  getAllBrochureRequests(): Promise<BrochureRequest[]>;

  // RA management
  createRa(ra: InsertRa): Promise<Ra>;
  updateRa(id: string, ra: Partial<InsertRa>): Promise<Ra | undefined>;
  listRas(activeOnly?: boolean): Promise<Ra[]>;
  getRaBySlug(slug: string): Promise<Ra | undefined>;
  getRaById(id: string): Promise<Ra | undefined>;

  // Walk-in check-ins
  createCheckin(raId: string, raName: string, raBranch: string, parentName: string, studentName: string, grade: string): Promise<WalkinCheckin>;
  listCheckins(sinceDate?: Date): Promise<WalkinCheckin[]>;
  getTodayCheckinCounts(): Promise<Array<{ raName: string; raBranch: string; count: number }>>;
  getDailyCheckinCounts(days: number): Promise<Array<{ date: string; count: number }>>;
}

export class DbStorage implements IStorage {
  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [result] = await db.insert(inquiries).values(inquiry).returning();
    return result;
  }

  async getAllInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [result] = await db.insert(events).values(event).returning();
    return result;
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [result] = await db.select().from(events).where(eq(events.id, id));
    return result;
  }

  async updateEvent(id: string, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [result] = await db.update(events).set(eventData).where(eq(events.id, id)).returning();
    return result;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async createCallbackRequest(req: InsertCallbackRequest): Promise<CallbackRequest> {
    const [result] = await db.insert(callbackRequests).values(req).returning();
    return result;
  }

  async getAllCallbackRequests(): Promise<CallbackRequest[]> {
    return await db.select().from(callbackRequests).orderBy(desc(callbackRequests.createdAt));
  }

  async createCareerApplication(app: InsertCareerApplication): Promise<CareerApplication> {
    const [result] = await db.insert(careerApplications).values(app).returning();
    return result;
  }

  async getAllCareerApplications(): Promise<CareerApplication[]> {
    return await db.select().from(careerApplications).orderBy(desc(careerApplications.createdAt));
  }

  async createBrochureRequest(req: InsertBrochureRequest): Promise<BrochureRequest> {
    const [result] = await db.insert(brochureRequests).values(req).returning();
    return result;
  }

  async getAllBrochureRequests(): Promise<BrochureRequest[]> {
    return await db.select().from(brochureRequests).orderBy(desc(brochureRequests.requestedAt));
  }

  // ── RA methods ─────────────────────────────────────────────
  async createRa(ra: InsertRa): Promise<Ra> {
    const [result] = await db.insert(ras).values(ra).returning();
    return result;
  }

  async updateRa(id: string, raData: Partial<InsertRa>): Promise<Ra | undefined> {
    const [result] = await db.update(ras).set(raData).where(eq(ras.id, id)).returning();
    return result;
  }

  async listRas(activeOnly = false): Promise<Ra[]> {
    if (activeOnly) {
      return await db.select().from(ras).where(eq(ras.active, true)).orderBy(ras.name);
    }
    return await db.select().from(ras).orderBy(ras.name);
  }

  async getRaBySlug(slug: string): Promise<Ra | undefined> {
    const [result] = await db.select().from(ras).where(eq(ras.slug, slug));
    return result;
  }

  async getRaById(id: string): Promise<Ra | undefined> {
    const [result] = await db.select().from(ras).where(eq(ras.id, id));
    return result;
  }

  // ── Walk-in check-in methods ────────────────────────────────
  async createCheckin(raId: string, raName: string, raBranch: string, parentName: string, studentName: string, grade: string): Promise<WalkinCheckin> {
    const [result] = await db.insert(walkinCheckins).values({ raId, raName, raBranch, parentName, studentName, grade }).returning();
    return result;
  }

  async listCheckins(sinceDate?: Date): Promise<WalkinCheckin[]> {
    if (sinceDate) {
      return await db.select().from(walkinCheckins)
        .where(gte(walkinCheckins.submittedAt, sinceDate))
        .orderBy(desc(walkinCheckins.submittedAt));
    }
    return await db.select().from(walkinCheckins).orderBy(desc(walkinCheckins.submittedAt));
  }

  async getTodayCheckinCounts(): Promise<Array<{ raName: string; raBranch: string; count: number }>> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const rows = await db
      .select({
        raName: walkinCheckins.raName,
        raBranch: walkinCheckins.raBranch,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(walkinCheckins)
      .where(gte(walkinCheckins.submittedAt, todayStart))
      .groupBy(walkinCheckins.raName, walkinCheckins.raBranch);
    return rows;
  }

  async getDailyCheckinCounts(days: number): Promise<Array<{ date: string; count: number }>> {
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);
    const rows = await db
      .select({
        date: sql<string>`to_char(submitted_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD')`,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(walkinCheckins)
      .where(gte(walkinCheckins.submittedAt, since))
      .groupBy(sql`to_char(submitted_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(submitted_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD')`);
    return rows;
  }
}

export const storage = new DbStorage();
