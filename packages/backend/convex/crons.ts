import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const SCHOOL_CODE = "7531146";
const crons = cronJobs();

// Meals change at most a few times a day, so poll a handful of times rather
// than hourly (was 96 external calls/day).
const SYNC_HOURS_UTC = [21, 1, 5, 9, 13]; // ~06:00, 10:00, 14:00, 18:00 KST

for (const hourUTC of SYNC_HOURS_UTC) {
  crons.daily(
    `fetch meals - this week @${hourUTC}`,
    { hourUTC, minuteUTC: 0 },
    internal.meals.fetchWeek,
    { schoolcode: SCHOOL_CODE, offsetWeeks: 0 }
  );
  crons.daily(
    `fetch meals - next week @${hourUTC}`,
    { hourUTC, minuteUTC: 1 },
    internal.meals.fetchWeek,
    { schoolcode: SCHOOL_CODE, offsetWeeks: 1 }
  );
}

crons.daily(
  "fetch schedule window",
  { hourUTC: 3, minuteUTC: 0 },
  internal.schedule.fetchScheduleWindow,
  { schoolcode: SCHOOL_CODE }
);

export default crons;
