import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("timetables").first();
  },
});

export const save = mutation({
  args: {
    sessionToken: v.string(),
    day_time: v.array(v.string()),
    timetable: v.array(
      v.array(
        v.object({
          period: v.number(),
          subject: v.string(),
          teacher: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, { sessionToken, day_time, timetable }) => {
    await requireAdmin(ctx, sessionToken);

    if (timetable.length !== 5) {
      throw new Error("timetable must have exactly 5 day columns (Mon–Fri)");
    }
    const periodCount = day_time.length;
    for (const day of timetable) {
      if (day.length !== periodCount) {
        throw new Error("every day must have the same number of periods as day_time");
      }
    }

    const existing = await ctx.db.query("timetables").first();
    if (existing) {
      await ctx.db.patch(existing._id, { day_time, timetable, editedAt: Date.now() });
      return existing._id;
    }
    return await ctx.db.insert("timetables", { day_time, timetable, editedAt: Date.now() });
  },
});
