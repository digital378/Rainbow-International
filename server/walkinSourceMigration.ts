import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { walkinLeads, walkinLeadAuditLog, walkinSources, walkinSyncReconciliations } from "@shared/schema";
import { normalizeWalkinLeadSource } from "@shared/walkinLeadSource";

/**
 * Idempotently consolidate legacy digital-marketing labels for AY 2027–28.
 * The original historical trackers are not modified; every CRM change is audited.
 * The normal incremental mirror reconciles affected brand rows without clearing
 * any workbook, and retains its pending marker if sheet edits need review.
 */
export async function consolidateWalkinDigitalMarketingSources(): Promise<number> {
  return db.transaction(async tx => {
    const sources = await tx.select().from(walkinSources);
    const aliases = sources.filter(row => row.label !== "DM" && normalizeWalkinLeadSource(row.label) === "DM");
    const canonical = sources.find(row => row.label === "DM" && row.brand === null);
    if (!canonical) {
      await tx.insert(walkinSources).values({ label: "DM", brand: null, sortOrder: 0, isActive: true });
    } else if (!canonical.isActive) {
      await tx.update(walkinSources).set({ isActive: true }).where(eq(walkinSources.id, canonical.id));
    }
    for (const alias of aliases) {
      if (alias.isActive) {
        await tx.update(walkinSources).set({ isActive: false }).where(eq(walkinSources.id, alias.id));
      }
    }

    const candidates = await tx.select({
      id: walkinLeads.id,
      brand: walkinLeads.brand,
      source: walkinLeads.source,
      isArchived: walkinLeads.isArchived,
    }).from(walkinLeads).where(eq(walkinLeads.academicYear, "2027-28"));

    const changedBrands = new Set<string>();
    let changed = 0;
    for (const lead of candidates) {
      if (lead.source === "DM" || normalizeWalkinLeadSource(lead.source) !== "DM") continue;
      const [updated] = await tx.update(walkinLeads)
        .set({ source: "DM", updatedBy: "source-consolidation", updatedAt: new Date() })
        .where(and(eq(walkinLeads.id, lead.id), eq(walkinLeads.source, lead.source)))
        .returning({ id: walkinLeads.id });
      if (!updated) continue;
      await tx.insert(walkinLeadAuditLog).values({
        leadId: lead.id,
        field: "source",
        oldValue: lead.source,
        newValue: "DM",
        changedBy: "source-consolidation",
      });
      changed++;
      if (!lead.isArchived) changedBrands.add(lead.brand);
    }

    for (const scope of [...changedBrands, ...(changedBrands.size ? ["MASTER"] : [])]) {
      if (scope !== "RIS" && scope !== "RPS" && scope !== "MASTER") continue;
      await tx.insert(walkinSyncReconciliations).values({ scope, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: walkinSyncReconciliations.scope,
          set: { updatedAt: new Date() },
        });
    }
    return changed;
  });
}