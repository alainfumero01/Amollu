import { NextResponse } from "next/server";
import { getJobberAuthorizationUrl } from "@/lib/jobber";

export function GET() {
  try {
    return NextResponse.redirect(getJobberAuthorizationUrl());
  } catch {
    return NextResponse.json(
      { message: "Jobber OAuth is not configured yet." },
      { status: 503 },
    );
  }
}
