import { NextResponse } from "next/server";

export function GET() {
  const hasCredentials = Boolean(process.env.JOBBER_CLIENT_ID && process.env.JOBBER_CLIENT_SECRET);
  const hasRefreshToken = Boolean(process.env.JOBBER_REFRESH_TOKEN);

  return NextResponse.json({
    configured: hasCredentials && hasRefreshToken,
    hasCredentials,
    connected: hasRefreshToken,
  });
}
