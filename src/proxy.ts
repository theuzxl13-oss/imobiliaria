import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // O proxy roda apenas no painel administrativo.
  matcher: ["/admin", "/admin/:path*"],
};
