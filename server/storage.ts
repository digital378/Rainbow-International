import {
  type Inquiry, type InsertInquiry,
  type Event, type InsertEvent,
  type CallbackRequest, type InsertCallbackRequest,
  type CareerApplication, type InsertCareerApplication,
  type BrochureRequest, type InsertBrochureRequest,
  type Ra, type InsertRa,
  type WalkinCheckin,
  type BlogPost, type InsertBlogPost,
  type FriendshipSchool, type InsertFriendshipSchool,
  type FriendshipSchoolLead, type InsertFriendshipLead,
  inquiries, events, callbackRequests, careerApplications, brochureRequests, ras, walkinCheckins, blogPostsTable,
  friendshipSchools, friendshipSchoolLeads,
} from "@shared/schema";
import { db } from "./db";
import { desc, eq, gte, and, sql, count } from "drizzle-orm";

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
  createCheckin(raId: string, raName: string, raBranch: string, parentName: string, studentName: string, grade: string, school?: string): Promise<WalkinCheckin>;
  listCheckins(sinceDate?: Date, school?: string): Promise<WalkinCheckin[]>;
  listUnsyncedCheckins(): Promise<WalkinCheckin[]>;
  markCheckinSynced(id: string): Promise<void>;
  markCheckinSyncFailed(id: string, error: string): Promise<void>;
  getTodayCheckinCounts(since: Date, school?: string): Promise<Array<{ raName: string; raBranch: string; count: number }>>;
  getDailyCheckinCounts(days: number, school?: string): Promise<Array<{ date: string; count: number }>>;

  // Blog posts
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  upsertBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(originalSlug: string, data: InsertBlogPost): Promise<BlogPost | undefined>;
  deleteBlogPost(slug: string): Promise<void>;
  getAllBlogSlugs(): Promise<string[]>;

  // Friendship Schools
  createFriendshipSchool(school: InsertFriendshipSchool): Promise<FriendshipSchool>;
  updateFriendshipSchool(id: number, data: Partial<InsertFriendshipSchool>): Promise<FriendshipSchool | undefined>;
  listFriendshipSchools(): Promise<(FriendshipSchool & { leadCount: number })[]>;
  getFriendshipSchoolById(id: number): Promise<FriendshipSchool | undefined>;
  getFriendshipSchoolByToken(token: string): Promise<FriendshipSchool | undefined>;
  regenerateFriendshipSchoolToken(id: number, newToken: string): Promise<FriendshipSchool | undefined>;

  // Friendship School Leads
  createFriendshipLead(lead: InsertFriendshipLead): Promise<FriendshipSchoolLead>;
  createFriendshipLeads(leads: InsertFriendshipLead[]): Promise<FriendshipSchoolLead[]>;
  listFriendshipLeads(schoolId?: number, status?: string, limit?: number, offset?: number): Promise<FriendshipSchoolLead[]>;
  listFailedFriendshipLeads(): Promise<FriendshipSchoolLead[]>;
  markFriendshipLeadSynced(id: number): Promise<void>;
  markFriendshipLeadSyncFailed(id: number): Promise<void>;
  updateFriendshipLead(id: number, data: { status?: string; commissionPaid?: boolean }): Promise<FriendshipSchoolLead | undefined>;
  bulkUpdateFriendshipLeadStatuses(schoolId: number, updates: { phone: string; status: string }[]): Promise<number>;
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
  async createCheckin(raId: string, raName: string, raBranch: string, parentName: string, studentName: string, grade: string, school = "RIS"): Promise<WalkinCheckin> {
    const [result] = await db.insert(walkinCheckins).values({ raId, raName, raBranch, school, parentName, studentName, grade }).returning();
    return result;
  }

  async listCheckins(sinceDate?: Date, school?: string): Promise<WalkinCheckin[]> {
    const conds = [];
    if (sinceDate) conds.push(gte(walkinCheckins.submittedAt, sinceDate));
    if (school) conds.push(eq(walkinCheckins.school, school));
    const where = conds.length ? and(...conds) : undefined;
    return await db.select().from(walkinCheckins)
      .where(where)
      .orderBy(desc(walkinCheckins.submittedAt));
  }

  async listUnsyncedCheckins(): Promise<WalkinCheckin[]> {
    return await db.select().from(walkinCheckins)
      .where(eq(walkinCheckins.syncedToSheets, false))
      .orderBy(walkinCheckins.submittedAt);
  }

  async markCheckinSynced(id: string): Promise<void> {
    await db.update(walkinCheckins)
      .set({ syncedToSheets: true, sheetSyncError: null })
      .where(eq(walkinCheckins.id, id));
  }

  async markCheckinSyncFailed(id: string, error: string): Promise<void> {
    await db.update(walkinCheckins)
      .set({ syncedToSheets: false, sheetSyncError: error })
      .where(eq(walkinCheckins.id, id));
  }

  async getTodayCheckinCounts(since: Date, school?: string): Promise<Array<{ raName: string; raBranch: string; count: number }>> {
    const conds = [gte(walkinCheckins.submittedAt, since)];
    if (school) conds.push(eq(walkinCheckins.school, school));
    const rows = await db
      .select({
        raName: walkinCheckins.raName,
        raBranch: walkinCheckins.raBranch,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(walkinCheckins)
      .where(and(...conds))
      .groupBy(walkinCheckins.raName, walkinCheckins.raBranch);
    return rows;
  }

  async getDailyCheckinCounts(days: number, school?: string): Promise<Array<{ date: string; count: number }>> {
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(Date.now() + IST_OFFSET_MS);
    istNow.setDate(istNow.getDate() - (days - 1));
    istNow.setUTCHours(0, 0, 0, 0);
    const since = new Date(istNow.getTime() - IST_OFFSET_MS);
    const conds = [gte(walkinCheckins.submittedAt, since)];
    if (school) conds.push(eq(walkinCheckins.school, school));
    const rows = await db
      .select({
        date: sql<string>`to_char(submitted_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD')`,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(walkinCheckins)
      .where(and(...conds))
      .groupBy(sql`to_char(submitted_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(submitted_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD')`);
    return rows;
  }

  // ── Blog post methods ────────────────────────────────────────
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.publishedAt));
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [result] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, slug));
    return result;
  }

  async upsertBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [result] = await db
      .insert(blogPostsTable)
      .values(post)
      .onConflictDoUpdate({
        target: blogPostsTable.slug,
        set: {
          title: post.title,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          keywords: post.keywords,
          date: post.date,
          cat: post.cat,
          thumbUrl: post.thumbUrl,
          heroUrl: post.heroUrl,
          intro: post.intro,
          sections: post.sections,
          conclusion: post.conclusion,
          relatedSlugs: post.relatedSlugs,
          internalLinks: post.internalLinks,
          faqs: post.faqs,
          publishedAt: post.publishedAt,
        },
      })
      .returning();
    return result;
  }

  async updateBlogPost(originalSlug: string, data: InsertBlogPost): Promise<BlogPost | undefined> {
    const [result] = await db
      .update(blogPostsTable)
      .set({
        slug: data.slug,
        title: data.title,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
        date: data.date,
        cat: data.cat,
        thumbUrl: data.thumbUrl,
        heroUrl: data.heroUrl,
        intro: data.intro,
        sections: data.sections,
        conclusion: data.conclusion,
        relatedSlugs: data.relatedSlugs,
        internalLinks: data.internalLinks,
        faqs: data.faqs,
        publishedAt: data.publishedAt,
      })
      .where(eq(blogPostsTable.slug, originalSlug))
      .returning();
    return result;
  }

  async deleteBlogPost(slug: string): Promise<void> {
    await db.delete(blogPostsTable).where(eq(blogPostsTable.slug, slug));
  }

  async getAllBlogSlugs(): Promise<string[]> {
    const rows = await db.select({ slug: blogPostsTable.slug }).from(blogPostsTable);
    return rows.map((r) => r.slug);
  }

  // ── Friendship School methods ─────────────────────────────────
  async createFriendshipSchool(school: InsertFriendshipSchool): Promise<FriendshipSchool> {
    const [result] = await db.insert(friendshipSchools).values(school).returning();
    return result;
  }

  async updateFriendshipSchool(id: number, data: Partial<InsertFriendshipSchool>): Promise<FriendshipSchool | undefined> {
    const [result] = await db.update(friendshipSchools).set(data).where(eq(friendshipSchools.id, id)).returning();
    return result;
  }

  async deleteFriendshipSchool(id: number): Promise<void> {
    await db.delete(friendshipSchoolLeads).where(eq(friendshipSchoolLeads.schoolId, id));
    await db.delete(friendshipSchools).where(eq(friendshipSchools.id, id));
  }

  async listFriendshipSchools(): Promise<(FriendshipSchool & { leadCount: number })[]> {
    const schools = await db.select().from(friendshipSchools).orderBy(friendshipSchools.name);
    const counts = await db
      .select({ schoolId: friendshipSchoolLeads.schoolId, leadCount: count() })
      .from(friendshipSchoolLeads)
      .groupBy(friendshipSchoolLeads.schoolId);
    const countMap = new Map(counts.map(c => [c.schoolId, Number(c.leadCount)]));
    return schools.map(s => ({ ...s, leadCount: countMap.get(s.id) ?? 0 }));
  }

  async getFriendshipSchoolById(id: number): Promise<FriendshipSchool | undefined> {
    const [result] = await db.select().from(friendshipSchools).where(eq(friendshipSchools.id, id));
    return result;
  }

  async getFriendshipSchoolByToken(token: string): Promise<FriendshipSchool | undefined> {
    const [result] = await db.select().from(friendshipSchools).where(eq(friendshipSchools.token, token));
    return result;
  }

  async regenerateFriendshipSchoolToken(id: number, newToken: string): Promise<FriendshipSchool | undefined> {
    const [result] = await db.update(friendshipSchools).set({ token: newToken }).where(eq(friendshipSchools.id, id)).returning();
    return result;
  }

  async createFriendshipLead(lead: InsertFriendshipLead): Promise<FriendshipSchoolLead> {
    const [result] = await db.insert(friendshipSchoolLeads).values(lead).returning();
    return result;
  }

  async createFriendshipLeads(leads: InsertFriendshipLead[]): Promise<FriendshipSchoolLead[]> {
    if (leads.length === 0) return [];
    return await db.insert(friendshipSchoolLeads).values(leads).returning();
  }

  async listFriendshipLeads(schoolId?: number, status?: string, limit = 200, offset = 0): Promise<FriendshipSchoolLead[]> {
    const conds = [];
    if (schoolId) conds.push(eq(friendshipSchoolLeads.schoolId, schoolId));
    if (status) conds.push(eq(friendshipSchoolLeads.status, status));
    const where = conds.length ? and(...conds) : undefined;
    return await db.select().from(friendshipSchoolLeads).where(where)
      .orderBy(desc(friendshipSchoolLeads.submittedAt))
      .limit(limit).offset(offset);
  }

  async listFailedFriendshipLeads(): Promise<FriendshipSchoolLead[]> {
    return await db.select().from(friendshipSchoolLeads).where(eq(friendshipSchoolLeads.syncFailed, true)).orderBy(friendshipSchoolLeads.submittedAt);
  }

  async markFriendshipLeadSynced(id: number): Promise<void> {
    await db.update(friendshipSchoolLeads).set({ syncedToSheets: true, syncFailed: false }).where(eq(friendshipSchoolLeads.id, id));
  }

  async markFriendshipLeadSyncFailed(id: number): Promise<void> {
    await db.update(friendshipSchoolLeads).set({ syncFailed: true }).where(eq(friendshipSchoolLeads.id, id));
  }

  async updateFriendshipLead(id: number, data: { status?: string; commissionPaid?: boolean }): Promise<FriendshipSchoolLead | undefined> {
    const [result] = await db.update(friendshipSchoolLeads).set(data).where(eq(friendshipSchoolLeads.id, id)).returning();
    return result;
  }

  async bulkUpdateFriendshipLeadStatuses(schoolId: number, updates: { phone: string; status: string }[]): Promise<number> {
    let count = 0;
    for (const { phone, status } of updates) {
      const result = await db
        .update(friendshipSchoolLeads)
        .set({ status })
        .where(and(eq(friendshipSchoolLeads.schoolId, schoolId), eq(friendshipSchoolLeads.phone, phone)))
        .returning({ id: friendshipSchoolLeads.id });
      count += result.length;
    }
    return count;
  }

  async getFriendshipLeadStats(): Promise<{ totalLeads: number; walkIns: number; admissions: number }> {
    const rows = await db
      .select({ status: friendshipSchoolLeads.status, cnt: count() })
      .from(friendshipSchoolLeads)
      .groupBy(friendshipSchoolLeads.status);
    let totalLeads = 0, walkIns = 0, admissions = 0;
    for (const r of rows) {
      const n = Number(r.cnt);
      totalLeads += n;
      if (r.status === "Walk-in Completed" || r.status === "Admission Done") walkIns += n;
      if (r.status === "Admission Done") admissions += n;
    }
    return { totalLeads, walkIns, admissions };
  }
}

export const storage = new DbStorage();
