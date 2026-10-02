import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { UsersManager } from "@/components/admin/users-manager";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Usuários" };

export default async function UsuariosPage() {
  const session = await requireSession();
  const supabase = await createClient();
  const { data } = await supabase.from("admins").select("user_id, name, email, created_at").order("created_at");
  const canCreate = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY);

  return (
    <>
      <PageHeader title="Usuários administradores" description="Pessoas com acesso ao painel." />
      <UsersManager admins={data ?? []} currentUserId={session.userId} canCreate={canCreate} />
    </>
  );
}
