import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { ListingRequestForm } from "@/components/site/listing-request-form";
import { getCategories } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Anuncie seu imóvel",
  description: "Quer vender ou alugar seu imóvel? Envie os dados para avaliação da Toninho Imóveis.",
  alternates: { canonical: "/anuncie" },
};

export default async function AnunciePage() {
  const categories = await getCategories();

  return (
    <>
      <PageHero
        title="Anuncie seu imóvel"
        description="Quer vender ou alugar? Envie os dados do seu imóvel e nossa equipe fará uma avaliação sem compromisso."
        breadcrumb={[{ label: "Anuncie seu imóvel" }]}
      />
      <div className="container-site grid gap-8 py-12 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-5">
          <h2 className="section-title">Por que anunciar conosco?</h2>
          <ul className="space-y-4">
            {[
              ["Avaliação profissional", "Definimos o valor ideal com base no mercado da região."],
              ["Anúncio completo", "Fotos, descrição detalhada e divulgação no site e nas redes."],
              ["Clientes qualificados", "Filtramos os interessados e agendamos as visitas."],
              ["Segurança na negociação", "Cuidamos dos contratos e da documentação."],
            ].map(([title, text]) => (
              <li key={title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-bold text-brand-950">{title}</p>
                  <p className="text-sm text-slate-500">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6 sm:p-8">
          <h2 className="text-xl font-bold text-brand-950">Dados do imóvel</h2>
          <p className="mb-6 text-sm text-slate-500">Campos com * são obrigatórios.</p>
          <ListingRequestForm categories={categories.map((c) => c.name)} />
        </div>
      </div>
    </>
  );
}
