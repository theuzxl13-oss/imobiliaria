import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { ContactCard } from "@/components/admin/contact-card";
import { SearchToolbar, TableEmpty } from "@/components/admin/search-toolbar";
import { Pagination } from "@/components/site/pagination";
import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUS_LABEL } from "@/lib/constants";
import type { Lead } from "@/lib/types";

export const metadata: Metadata = { title: "Interessados" };

const PAGE_SIZE = 25;

function first(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function InteressadosPage({ searchParams }: PageProps<"/admin/interessados">) {
  const params = await searchParams;
  const q = first(params.q).replace(/[%_,()\\]/g, " ").trim().slice(0, 80);
  const status = first(params.status);
  const page = Math.max(1, Number(first(params.pagina)) || 1);

  const supabase = await createClient();
  let query = supabase.from("leads").select("*", { count: "exact" });
  if (status in LEAD_STATUS_LABEL) query = query.eq("status", status);
  if (q) {
    query = query.or(
      `name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%,property_code.ilike.%${q}%,property_title.ilike.%${q}%`,
    );
  }
  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  const leads = (data ?? []) as Lead[];

  return (
    <>
      <PageHeader
        title="Interessados"
        description="Contatos enviados pelo formulário dos imóveis e pela página de contato."
      />
      <Suspense>
        <SearchToolbar
          placeholder="Buscar por nome, telefone, e-mail ou código do imóvel..."
          selects={[
            {
              name: "status",
              label: "Todos os status",
              options: Object.entries(LEAD_STATUS_LABEL).map(([value, label]) => ({ value, label })),
            },
          ]}
        />
      </Suspense>

      {leads.length === 0 ? (
        <TableEmpty>Nenhum contato encontrado.</TableEmpty>
      ) : (
        <ul className="space-y-3">
          {leads.map((l) => (
            <ContactCard
              key={l.id}
              table="leads"
              id={l.id}
              name={l.name}
              phone={l.phone}
              email={l.email}
              status={l.status}
              notes={l.notes}
              createdAt={l.created_at}
              subtitle={
                l.property_code
                  ? `Imóvel #${l.property_code} — ${l.property_title ?? ""}`
                  : "Contato geral (página de contato)"
              }
              propertyLink={
                l.property_id && l.property_code
                  ? { href: `/admin/imoveis/${l.property_id}/editar`, label: `#${l.property_code} — ${l.property_title}` }
                  : null
              }
            >
              <div>
                <p className="text-slate-500">Mensagem:</p>
                <p className="mt-1 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-slate-700">
                  {l.message || "(sem mensagem)"}
                </p>
              </div>
            </ContactCard>
          ))}
        </ul>
      )}
      <Pagination
        page={page}
        pageCount={Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))}
        basePath="/admin/interessados"
        params={params}
      />
    </>
  );
}
