import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  Home,
  Inbox,
  KeyRound,
  Megaphone,
  Plus,
  Star,
  Tag,
  Handshake,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { LeadStatusBadge, StatusBadge } from "@/components/admin/badges";
import { SafeImage } from "@/components/site/safe-image";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import { PURPOSE_LABEL } from "@/lib/constants";
import type { Lead, PropertyListItem } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const count = (build: (q: ReturnType<typeof base>) => ReturnType<typeof base>) =>
    build(base()).then((r) => r.count ?? 0);
  function base() {
    return supabase.from("properties").select("id", { count: "exact", head: true });
  }

  const [
    total,
    venda,
    aluguel,
    disponiveis,
    vendidos,
    alugados,
    destaques,
    ofertas,
    leadsTotal,
    leadsNovos,
    requests,
    latest,
    latestLeads,
  ] = await Promise.all([
    count((q) => q),
    count((q) => q.eq("purpose", "venda")),
    count((q) => q.eq("purpose", "aluguel")),
    count((q) => q.eq("status", "disponivel")),
    count((q) => q.eq("status", "vendido")),
    count((q) => q.eq("status", "alugado")),
    count((q) => q.eq("is_featured", true)),
    count((q) => q.eq("is_offer", true)),
    supabase.from("leads").select("id", { count: "exact", head: true }).then((r) => r.count ?? 0),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "novo").then((r) => r.count ?? 0),
    supabase.from("listing_requests").select("id", { count: "exact", head: true }).eq("status", "novo").then((r) => r.count ?? 0),
    supabase
      .from("properties")
      .select("*, category:categories(id, name, slug)")
      .order("created_at", { ascending: false })
      .limit(6)
      .then((r) => (r.data ?? []) as PropertyListItem[]),
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)
      .then((r) => (r.data ?? []) as Lead[]),
  ]);

  const stats = [
    { label: "Total de imóveis", value: total, icon: Home, color: "bg-brand-800 text-white", href: "/admin/imoveis" },
    { label: "Imóveis à venda", value: venda, icon: BadgeDollarSign, color: "bg-sky-100 text-sky-700", href: "/admin/imoveis?finalidade=venda" },
    { label: "Imóveis para aluguel", value: aluguel, icon: KeyRound, color: "bg-violet-100 text-violet-700", href: "/admin/imoveis?finalidade=aluguel" },
    { label: "Disponíveis", value: disponiveis, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", href: "/admin/imoveis?status=disponivel" },
    { label: "Vendidos", value: vendidos, icon: Handshake, color: "bg-slate-200 text-slate-700", href: "/admin/imoveis?status=vendido" },
    { label: "Alugados", value: alugados, icon: KeyRound, color: "bg-slate-200 text-slate-700", href: "/admin/imoveis?status=alugado" },
    { label: "Em destaque", value: destaques, icon: Star, color: "bg-gold-100 text-gold-700", href: "/admin/imoveis?destaque=1" },
    { label: "Em oferta", value: ofertas, icon: Tag, color: "bg-rose-100 text-rose-700", href: "/admin/imoveis?oferta=1" },
    { label: "Contatos recebidos", value: leadsTotal, icon: Inbox, color: "bg-amber-100 text-amber-700", href: "/admin/interessados", extra: leadsNovos ? `${leadsNovos} novo(s)` : undefined },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral da Toninho Imóveis."
        actions={
          <Link href="/admin/imoveis/novo" className="btn btn-gold">
            <Plus className="h-4 w-4" /> Cadastrar imóvel
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, color, href, extra }) => (
          <Link key={label} href={href} className="card p-4 transition hover:-translate-y-0.5 hover:shadow-card-hover">
            <span className={`inline-flex rounded-xl p-2.5 ${color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-brand-950">{value}</p>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            {extra && <p className="mt-1 text-xs font-bold text-rose-600">{extra}</p>}
          </Link>
        ))}
        {requests > 0 && (
          <Link href="/admin/solicitacoes" className="card border-gold-300 bg-gold-50 p-4 transition hover:-translate-y-0.5">
            <span className="inline-flex rounded-xl bg-gold-400 p-2.5 text-brand-950">
              <Megaphone className="h-5 w-5" />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-brand-950">{requests}</p>
            <p className="text-xs font-medium text-slate-600">Novas solicitações de anúncio</p>
          </Link>
        )}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-brand-950">Últimos imóveis cadastrados</h2>
            <Link href="/admin/imoveis" className="flex items-center gap-1 text-sm font-semibold text-brand-700">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {latest.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">Nenhum imóvel cadastrado ainda.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {latest.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/imoveis/${p.id}/editar`} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                    <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <SafeImage src={p.cover_image_url} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-brand-950">
                        <span className="text-slate-400">#{p.code}</span> {p.title}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {PURPOSE_LABEL[p.purpose]} · {formatPrice(p.effective_price, p.purpose)} · {formatDate(p.created_at)}
                      </span>
                    </span>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-brand-950">Últimos contatos</h2>
            <Link href="/admin/interessados" className="flex items-center gap-1 text-sm font-semibold text-brand-700">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {latestLeads.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">Nenhum contato recebido ainda.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {latestLeads.map((l) => (
                <li key={l.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-950">{l.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {l.property_code ? `Imóvel #${l.property_code}` : "Contato geral"} · {formatDateTime(l.created_at)}
                      </p>
                    </div>
                    <LeadStatusBadge status={l.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
