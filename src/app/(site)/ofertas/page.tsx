import type { Metadata } from "next";
import { Tag } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { ListingPage } from "@/components/site/listing-page";

export const metadata: Metadata = {
  title: "Ofertas",
  description: "Imóveis com preços promocionais e condições especiais.",
  alternates: { canonical: "/ofertas" },
};

export default async function OfertasPage({ searchParams }: PageProps<"/ofertas">) {
  return (
    <>
      <PageHero
        title="Ofertas"
        description="Imóveis com preço promocional por tempo limitado. Aproveite!"
        breadcrumb={[{ label: "Ofertas" }]}
      >
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold uppercase">
          <Tag className="h-3.5 w-3.5" /> Preços especiais
        </p>
      </PageHero>
      <ListingPage searchParams={await searchParams} basePath="/ofertas" forced={{ offer: true }} />
    </>
  );
}
