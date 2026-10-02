"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
import { Field } from "@/components/ui/form-field";
import { createAdminUser, removeAdminUser } from "@/lib/actions/admin";
import { formatDate } from "@/lib/format";

type Admin = { user_id: string; name: string; email: string; created_at: string };

export function UsersManager({
  admins,
  currentUserId,
  canCreate,
}: {
  admins: Admin[];
  currentUserId: string;
  canCreate: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toRemove, setToRemove] = useState<Admin | null>(null);

  function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as { name: string; email: string; password: string };
    startTransition(async () => {
      const r = await createAdminUser(data);
      if (r.ok) {
        toast.success(r.message ?? "Criado!");
        setErrors({});
        form.reset();
        router.refresh();
      } else {
        setErrors(r.fieldErrors ?? {});
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <section className="card overflow-hidden">
        <h2 className="border-b border-slate-100 px-5 py-4 font-bold text-brand-950">Administradores</h2>
        <ul className="divide-y divide-slate-100">
          {admins.map((a) => (
            <li key={a.user_id} className="flex items-center gap-3 px-5 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-white">
                {(a.name || a.email).charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-950">
                  {a.name} {a.user_id === currentUserId && <span className="text-xs text-slate-400">(você)</span>}
                </p>
                <p className="truncate text-xs text-slate-500">{a.email} · desde {formatDate(a.created_at)}</p>
              </div>
              {a.user_id !== currentUserId && (
                <button
                  type="button"
                  onClick={() => setToRemove(a)}
                  className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                  aria-label={`Remover ${a.email}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="font-bold text-brand-950">Novo administrador</h2>
        {canCreate ? (
          <form onSubmit={create} className="mt-4 space-y-3" noValidate>
            <Field label="Nome" name="name" required error={errors.name} />
            <Field label="E-mail" name="email" type="email" required error={errors.email} />
            <Field label="Senha inicial" name="password" type="password" required minLength={8} autoComplete="new-password" error={errors.password} hint="Mínimo de 8 caracteres." />
            <button type="submit" className="btn btn-primary w-full" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Criar administrador
            </button>
          </form>
        ) : (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Para criar administradores pelo painel, configure a variável <code>SUPABASE_SERVICE_ROLE_KEY</code> no
            servidor (Vercel). Também é possível usar o comando <code>npm run admin:create</code> (veja o README).
          </p>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(toRemove)}
        danger
        title="Remover administrador?"
        description={`${toRemove?.email} perderá o acesso ao painel.`}
        confirmLabel="Remover acesso"
        loading={pending}
        onCancel={() => setToRemove(null)}
        onConfirm={() =>
          toRemove &&
          startTransition(async () => {
            const r = await removeAdminUser(toRemove.user_id);
            if (r.ok) {
              toast.success(r.message ?? "Removido");
              setToRemove(null);
              router.refresh();
            } else toast.error(r.error);
          })
        }
      />
    </div>
  );
}
