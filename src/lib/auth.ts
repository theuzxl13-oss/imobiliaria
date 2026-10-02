import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
};

/** Usuário logado + verificação na tabela "admins". */
export const getSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: admin } = await supabase
    .from("admins")
    .select("name, email")
    .eq("user_id", data.user.id)
    .maybeSingle();

  return {
    userId: data.user.id,
    email: data.user.email ?? "",
    name: admin?.name || data.user.email || "Administrador",
    isAdmin: Boolean(admin),
  };
});

/** Para páginas do painel: redireciona quem não está logado. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Para Server Actions: garante que quem chama é administrador. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) {
    throw new Error("Acesso não autorizado.");
  }
  const supabase = await createClient();
  return { session, supabase };
}
