import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ListingPage } from "@/components/site/listing-page";

export const metadata: Metadata = {
  title: "Imóveis à venda",
  description: "Casas, apartamentos, terrenos, chácaras e imóveis comerciais à venda.",
  alternates: { canonical: "/comprar" },
};

export default async function ComprarPage({ searchParams }: PageProps<"/comprar">) {
  return (
    <>
      <PageHero
        title="Imóveis à Venda"
        description="Encontre o imóvel para morar ou investir. Todos os imóveis disponíveis para compra."
        breadcrumb={[{ label: "Comprar" }]}
      />
      <ListingPage searchParams={await searchParams} basePath="/comprar" forced={{ purpose: "venda" }} />
    </>
  );
}
