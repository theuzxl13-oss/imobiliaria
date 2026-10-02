import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { PropertyForm } from "@/components/admin/property-form";
import { getAdminTaxonomies } from "@/lib/admin-queries";

export const metadata: Metadata = { title: "Cadastrar imóvel" };

export default async function NovoImovelPage() {
  const { categories, features } = await getAdminTaxonomies();
  return (
    <>
      <PageHeader
        title="Cadastrar imóvel"
        description="Preencha os dados do imóvel. Ao salvar, ele já aparece no site (se estiver publicado)."
      />
      <PropertyForm categories={categories} features={features} />
    </>
  );
}
