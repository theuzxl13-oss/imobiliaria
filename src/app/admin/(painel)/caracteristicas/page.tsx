import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { getAdminTaxonomies } from "@/lib/admin-queries";

export const metadata: Metadata = { title: "Características e categorias" };

export default async function CaracteristicasPage() {
  const { categories, features } = await getAdminTaxonomies();
  return (
    <>
      <PageHeader
        title="Características e categorias"
        description="Configure as opções disponíveis no cadastro de imóveis e nos filtros do site."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <TaxonomyManager
          table="features"
          title="Características do imóvel"
          description="Ex.: Piscina, Churrasqueira, Aceita animais."
          items={features}
          deleteWarning="A característica será removida de todos os imóveis que a possuem."
        />
        <TaxonomyManager
          table="categories"
          title="Categorias (tipos de imóvel)"
          description="Ex.: Casa, Apartamento, Terreno."
          items={categories}
          deleteWarning="Os imóveis desta categoria ficarão sem categoria até serem editados."
        />
      </div>
    </>
  );
}
