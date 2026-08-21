import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth";

const ddayFields = { title: v.string(), targetDate: v.string() };

const YYYYMMDD = /^\d{8}$/;
function assertValidTargetDate(targetDate: string): void {
  if (!YYYYMMDD.test(targetDate)) {
    throw new Error("Invalid targetDate; expected an 8-digit YYYYMMDD string");
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("ddays").withIndex("by_target_date").collect(),
});

export const create = mutation({
  args: { sessionToken: v.string(), ...ddayFields },
  handler: async (ctx, { sessionToken, ...fields }) => {
    await requireAdmin(ctx, sessionToken);
    assertValidTargetDate(fields.targetDate);
    const now = Date.now();
    return await ctx.db.insert("ddays", { ...fields, createdAt: now, updatedAt: now });
  },
});

export const update = mutation({
  args: { sessionToken: v.string(), id: v.id("ddays"), ...ddayFields },
  handler: async (ctx, { sessionToken, id, ...updates }) => {
    await requireAdmin(ctx, sessionToken);
    assertValidTargetDate(updates.targetDate);
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { sessionToken: v.string(), id: v.id("ddays") },
  handler: async (ctx, { sessionToken, id }) => {
    await requireAdmin(ctx, sessionToken);
    await ctx.db.delete(id);
  },
});
