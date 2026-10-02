import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ListingPage } from "@/components/site/listing-page";

export const metadata: Metadata = {
  title: "Imóveis para alugar",
  description: "Casas, apartamentos e salas comerciais para alugar.",
  alternates: { canonical: "/alugar" },
};

export default async function AlugarPage({ searchParams }: PageProps<"/alugar">) {
  return (
    <>
      <PageHero
        title="Imóveis para Alugar"
        description="Opções para morar ou trabalhar, com contrato claro e atendimento próximo."
        breadcrumb={[{ label: "Alugar" }]}
      />
      <ListingPage searchParams={await searchParams} basePath="/alugar" forced={{ purpose: "aluguel" }} />
    </>
  );
}
