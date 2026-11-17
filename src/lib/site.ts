export const APP_NAME = "LinkNest";
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const APP_HOST = new URL(APP_URL).host;
