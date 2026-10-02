import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EyeOff, Plus, Star, Tag } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/badges";
import { PropertyActions } from "@/components/admin/property-actions";
import { SearchToolbar, TableEmpty } from "@/components/admin/search-toolbar";
import { Pagination } from "@/components/site/pagination";
import { SafeImage } from "@/components/site/safe-image";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice, normalizeText } from "@/lib/format";
import { PURPOSE_LABEL, STATUS_LABEL } from "@/lib/constants";
import type { PropertyListItem } from "@/lib/types";

export const metadata: Metadata = { title: "Gerenciar imóveis" };

const PAGE_SIZE = 20;

function first(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function GerenciarImoveisPage({ searchParams }: PageProps<"/admin/imoveis">) {
  const params = await searchParams;
  const q = first(params.q).slice(0, 100);
  const purpose = first(params.finalidade);
  const status = first(params.status);
  const page = Math.max(1, Number(first(params.pagina)) || 1);

  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select("*, category:categories(id, name, slug)", { count: "exact" });

  for (const word of normalizeText(q).split(/\s+/).filter(Boolean).slice(0, 6)) {
    query = query.ilike("search_text", `%${word.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
  }
  if (purpose === "venda" || purpose === "aluguel") query = query.eq("purpose", purpose);
  if (status in STATUS_LABEL) query = query.eq("status", status);
  if (first(params.destaque) === "1") query = query.eq("is_featured", true);
  if (first(params.oferta) === "1") query = query.eq("is_offer", true);
  if (first(params.publicado) === "0") query = query.eq("is_published", false);

  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (error && error.code !== "PGRST103") throw new Error(error.message);
  const properties = (data ?? []) as PropertyListItem[];
  const total = count ?? 0;

  return (
    <>
      <PageHeader
        title="Gerenciar imóveis"
        description={`${total} imóve${total === 1 ? "l" : "is"} encontrado${total === 1 ? "" : "s"}. Vendidos e alugados permanecem registrados para histórico.`}
        actions={
          <Link href="/admin/imoveis/novo" className="btn btn-gold">
            <Plus className="h-4 w-4" /> Cadastrar imóvel
          </Link>
        }
      />
      <Suspense>
        <SearchToolbar
          placeholder="Buscar por código, título, bairro ou cidade..."
          selects={[
            {
              name: "finalidade",
              label: "Venda/Aluguel",
              options: [
                { value: "venda", label: "Venda" },
                { value: "aluguel", label: "Aluguel" },
              ],
            },
            {
              name: "status",
              label: "Todos os status",
              options: Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
            },
          ]}
        />
      </Suspense>

      {properties.length === 0 ? (
        <TableEmpty>
          Nenhum imóvel encontrado.{" "}
          <Link href="/admin/imoveis/novo" className="font-semibold text-brand-700 underline">
            Cadastrar um imóvel
          </Link>
        </TableEmpty>
      ) : (
        <div className="card">
          {/* Tabela (desktop) */}
          <table className="hidden w-full text-left text-sm lg:table">
            <thead className="border-b border-slate-100 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Imóvel</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 font-semibold">Negócio</th>
                <th className="px-4 py-3 font-semibold">Preço</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Cadastro</th>
                <th className="px-4 py-3 font-semibold"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <SafeImage src={p.cover_image_url} alt="" fill sizes="64px" className="object-cover" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-400">#{p.code}</p>
                        <Link
                          href={`/admin/imoveis/${p.id}/editar`}
                          className="line-clamp-1 max-w-xs font-semibold text-brand-950 hover:text-brand-700"
                        >
                          {p.title}
                        </Link>
                        <p className="text-xs text-slate-500">{[p.neighborhood, p.city].filter(Boolean).join(", ")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{PURPOSE_LABEL[p.purpose]}</td>
                  <td className="px-4 py-3">
                    {p.is_offer && p.promo_price ? (
                      <>
                        <p className="text-xs text-slate-400 line-through">{formatPrice(p.price, p.purpose)}</p>
                        <p className="font-semibold text-rose-600">{formatPrice(p.promo_price, p.purpose)}</p>
                      </>
                    ) : (
                      <p className="font-semibold text-slate-800">{formatPrice(p.price, p.purpose)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <StatusBadge status={p.status} />
                      {p.is_featured && <Star className="h-4 w-4 fill-gold-400 text-gold-500" aria-label="Destaque" />}
                      {p.is_offer && <Tag className="h-4 w-4 text-rose-500" aria-label="Oferta" />}
                      {!p.is_published && <EyeOff className="h-4 w-4 text-slate-400" aria-label="Oculto do site" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <PropertyActions property={p} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Cards (mobile/tablet) */}
          <ul className="divide-y divide-slate-100 lg:hidden">
            {properties.map((p) => (
              <li key={p.id} className="flex gap-3 p-3">
                <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <SafeImage src={p.cover_image_url} alt="" fill sizes="96px" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/admin/imoveis/${p.id}/editar`} className="min-w-0">
                      <p className="text-xs font-bold text-slate-400">
                        #{p.code} · {p.category?.name ?? "—"} · {PURPOSE_LABEL[p.purpose]}
                      </p>
                      <p className="line-clamp-2 text-sm font-semibold text-brand-950">{p.title}</p>
                    </Link>
                    <PropertyActions property={p} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{formatPrice(p.effective_price, p.purpose)}</span>
                    <StatusBadge status={p.status} />
                    {p.is_featured && <Star className="h-4 w-4 fill-gold-400 text-gold-500" />}
                    {p.is_offer && <Tag className="h-4 w-4 text-rose-500" />}
                    {!p.is_published && <EyeOff className="h-4 w-4 text-slate-400" />}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">Cadastro: {formatDate(p.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Pagination
        page={page}
        pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        basePath="/admin/imoveis"
        params={params}
      />
    </>
  );
}
