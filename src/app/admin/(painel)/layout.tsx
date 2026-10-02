import { ShieldAlert } from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function PainelLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireSession();

  if (!session.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="card max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-rose-500" />
          <h1 className="mt-4 text-xl font-bold text-brand-950">Acesso não autorizado</h1>
          <p className="mt-2 text-sm text-slate-500">
            O usuário <strong>{session.email}</strong> não possui permissão de administrador. Peça a um administrador
            para liberar seu acesso.
          </p>
          <form action={signOut} className="mt-6">
            <button className="btn btn-primary">Sair</button>
          </form>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const [leads, requests] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "novo"),
    supabase.from("listing_requests").select("id", { count: "exact", head: true }).eq("status", "novo"),
  ]);

  return (
    <>
      <AdminSidebar
        userName={session.name}
        userEmail={session.email}
        counts={{ leads: leads.count ?? 0, requests: requests.count ?? 0 }}
      />
      <div className="lg:pl-72">
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
}
