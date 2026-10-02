import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, History } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { PropertyForm } from "@/components/admin/property-form";
import { PhotoManager } from "@/components/admin/photo-manager";
import { StatusBadge } from "@/components/admin/badges";
import { getAdminProperty, getAdminTaxonomies, getStatusHistory } from "@/lib/admin-queries";
import { formatDateTime, propertyPath } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Editar imóvel" };

export default async function EditarImovelPage({ params, searchParams }: PageProps<"/admin/imoveis/[id]/editar">) {
  const { id } = await params;
  const { novo } = await searchParams;
  const [property, taxonomies, history] = await Promise.all([
    getAdminProperty(id),
    getAdminTaxonomies(),
    getStatusHistory(id),
  ]);
  if (!property) notFound();

  return (
    <>
      <Link href="/admin/imoveis" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Gerenciar imóveis
      </Link>
      <PageHeader
        title={`Editar imóvel #${property.code}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {property.title} <StatusBadge status={property.status} />
            {!property.is_published && <span className="badge bg-slate-100 text-slate-600 ring-slate-300">Oculto do site</span>}
          </span>
        }
        actions={
          <a href={propertyPath(property)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            <ExternalLink className="h-4 w-4" /> Visualizar no site
          </a>
        }
      />

      {novo === "1" && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <strong>Imóvel cadastrado!</strong> Confira as fotos abaixo — você pode adicionar mais, escolher a foto
          principal e alterar a ordem.
        </div>
      )}

      <div className="space-y-6">
        <PhotoManager propertyId={property.id} images={property.images} />
        {history.length > 0 && (
          <section className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-brand-950">
              <History className="h-4 w-4 text-gold-500" /> Histórico de status
            </h2>
            <ol className="mt-4 space-y-2 text-sm">
              {history.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center gap-2 text-slate-600">
                  <span className="text-xs text-slate-400">{formatDateTime(h.changed_at)}</span>
                  {h.old_status ? (
                    <>
                      {STATUS_LABEL[h.old_status]} → <strong className="text-slate-800">{STATUS_LABEL[h.new_status]}</strong>
                    </>
                  ) : (
                    <>
                      Cadastrado como <strong className="text-slate-800">{STATUS_LABEL[h.new_status]}</strong>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
        <PropertyForm property={property} categories={taxonomies.categories} features={taxonomies.features} />
      </div>

    </>
  );
}
