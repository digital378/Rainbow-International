import { type Inquiry, type InsertInquiry, type Event, type InsertEvent, type CallbackRequest, type InsertCallbackRequest, inquiries, events, callbackRequests } from "@shared/schema";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";

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
}

export const storage = new DbStorage();
