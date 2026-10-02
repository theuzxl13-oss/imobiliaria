import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ListingPage } from "@/components/site/listing-page";

export const metadata: Metadata = {
  title: "Imóveis",
  description: "Todos os imóveis à venda e para alugar. Use a busca avançada para encontrar o imóvel ideal.",
  alternates: { canonical: "/imoveis" },
};

export default async function ImoveisPage({ searchParams }: PageProps<"/imoveis">) {
  return (
    <>
      <PageHero
        title="Imóveis"
        description="Combine filtros de localização, tipo, valor, área e cômodos para encontrar o imóvel ideal."
        breadcrumb={[{ label: "Imóveis" }]}
      />
      <ListingPage searchParams={await searchParams} basePath="/imoveis" />
    </>
  );
}
