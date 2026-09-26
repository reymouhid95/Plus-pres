import type { NextRequest } from "next/server";
import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";

export function proxy(request: NextRequest) {
  return withAuth(request as NextRequestWithAuth);
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/game/:path*"],
};
