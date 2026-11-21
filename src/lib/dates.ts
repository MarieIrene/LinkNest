/**
 * Dates in the admin panel always show Kigali time. Fixing the time zone also keeps the
 * server (UTC on Vercel) and the browser from rendering different text for the same date.
 */
const TZ = "Africa/Kigali";

export const formatDateTime = (d: Date | string) =>
  new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: TZ });

export const formatDate = (d: Date | string, style: "medium" | "long" = "medium") =>
  new Date(d).toLocaleDateString("en-GB", { dateStyle: style, timeZone: TZ });

export const formatDayMonth = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: TZ });
