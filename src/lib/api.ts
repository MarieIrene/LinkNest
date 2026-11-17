import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import type { ZodError } from "zod";

export function jsonError(error: string, status = 400, fields?: Record<string, string>) {
  return NextResponse.json({ error, fields }, { status });
}

export const unauthorized = () => jsonError("Log in to continue.", 401);

export function zodFields(err: ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export function isUniqueViolation(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}
