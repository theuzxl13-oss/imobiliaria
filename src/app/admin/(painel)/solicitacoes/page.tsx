import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { ContactCard } from "@/components/admin/contact-card";
import { SearchToolbar, TableEmpty } from "@/components/admin/search-toolbar";
import { Pagination } from "@/components/site/pagination";
import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUS_LABEL, PURPOSE_LABEL } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { ListingRequest } from "@/lib/types";

export const metadata: Metadata = { title: "Solicitações de anúncio" };

const PAGE_SIZE = 25;

function first(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function SolicitacoesPage({ searchParams }: PageProps<"/admin/solicitacoes">) {
  const params = await searchParams;
  const q = first(params.q).replace(/[%_,()\\]/g, " ").trim().slice(0, 80);
  const status = first(params.status);
  const page = Math.max(1, Number(first(params.pagina)) || 1);

  const supabase = await createClient();
  let query = supabase.from("listing_requests").select("*", { count: "exact" });
  if (status in LEAD_STATUS_LABEL) query = query.eq("status", status);
  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,city.ilike.%${q}%,neighborhood.ilike.%${q}%`);
  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  const requests = (data ?? []) as ListingRequest[];

  return (
    <>
      <PageHeader
        title="Anuncie seu imóvel"
        description="Proprietários que enviaram imóveis para avaliação pelo site."
      />
      <Suspense>
        <SearchToolbar
          placeholder="Buscar por nome, telefone, cidade ou bairro..."
          selects={[
            {
              name: "status",
              label: "Todos os status",
              options: Object.entries(LEAD_STATUS_LABEL).map(([value, label]) => ({ value, label })),
            },
          ]}
        />
      </Suspense>

      {requests.length === 0 ? (
        <TableEmpty>Nenhuma solicitação encontrada.</TableEmpty>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <ContactCard
              key={r.id}
              table="listing_requests"
              id={r.id}
              name={r.name}
              phone={r.phone}
              email={r.email}
              status={r.status}
              notes={r.notes}
              createdAt={r.created_at}
              subtitle={`${r.property_type} para ${PURPOSE_LABEL[r.purpose].toLowerCase()} — ${[r.neighborhood, r.city].filter(Boolean).join(", ")}`}
            >
              <dl className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
                <div><dt className="text-xs text-slate-500">Tipo</dt><dd className="font-semibold">{r.property_type}</dd></div>
                <div><dt className="text-xs text-slate-500">Negócio</dt><dd className="font-semibold">{PURPOSE_LABEL[r.purpose]}</dd></div>
                <div><dt className="text-xs text-slate-500">Cidade</dt><dd className="font-semibold">{r.city || "—"}</dd></div>
                <div><dt className="text-xs text-slate-500">Bairro</dt><dd className="font-semibold">{r.neighborhood || "—"}</dd></div>
                <div className="col-span-2"><dt className="text-xs text-slate-500">Valor aproximado</dt><dd className="font-semibold">{r.approximate_value ? formatCurrency(r.approximate_value) : "Não informado"}</dd></div>
              </dl>
              <div>
                <p className="text-slate-500">Descrição:</p>
                <p className="mt-1 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-slate-700">{r.description || "(sem descrição)"}</p>
              </div>
            </ContactCard>
          ))}
        </ul>
      )}
      <Pagination
        page={page}
        pageCount={Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))}
        basePath="/admin/solicitacoes"
        params={params}
      />
    </>
  );
}
