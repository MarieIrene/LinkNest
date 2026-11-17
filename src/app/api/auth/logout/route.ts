import { NextResponse } from "next/server";
import { removeSession } from "@/lib/auth";

function logout(req: Request) {
  return removeSession(NextResponse.redirect(new URL("/login", req.url), 303));
}

export const GET = logout;
export const POST = logout;
