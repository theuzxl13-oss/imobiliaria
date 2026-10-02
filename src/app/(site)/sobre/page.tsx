import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Handshake, KeyRound, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { getSettings } from "@/lib/queries";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Sobre nós",
    description: `Conheça a ${settings.company_name}: compra, venda e locação de imóveis com segurança e transparência.`,
    alternates: { canonical: "/sobre" },
  };
}

export default async function SobrePage() {
  const settings = await getSettings();
  const paragraphs = settings.about_text.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <PageHero
        title={`Sobre a ${settings.company_name}`}
        description="Confiança, profissionalismo e atendimento próximo em cada negociação."
        breadcrumb={[{ label: "Sobre nós" }]}
      />
      <div className="container-site grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr]">
        <article className="card p-6 sm:p-10">
          <h2 className="section-title">Nossa história</h2>
          <div className="prose-text mt-5 leading-relaxed text-slate-600">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line">{p}</p>
              ))
            ) : (
              <p>
                Somos uma imobiliária comprometida em tornar a compra, a venda e a locação de imóveis uma
                experiência simples, transparente e segura.
              </p>
            )}
          </div>
          {settings.creci && <p className="mt-6 text-sm font-semibold text-slate-500">CRECI {settings.creci}</p>}
        </article>
        <div className="space-y-4">
          {[
            [ShieldCheck, "Segurança jurídica", "Documentação analisada com cuidado em todas as etapas."],
            [Handshake, "Transparência", "Informações claras para você decidir com tranquilidade."],
            [BadgeCheck, "Experiência", "Conhecimento do mercado imobiliário da região."],
            [KeyRound, "Do início às chaves", "Acompanhamento completo até a conclusão do negócio."],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <div key={title as string} className="card flex gap-4 p-5">
                <span className="h-fit rounded-xl bg-brand-800 p-3 text-gold-300">
                  <I className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-bold text-brand-950">{title as string}</h3>
                  <p className="mt-1 text-sm text-slate-500">{text as string}</p>
                </div>
              </div>
            );
          })}
          <Link href="/contato" className="btn btn-primary w-full py-3.5">
            Fale com a nossa equipe
          </Link>
        </div>
      </div>
    </>
  );
}
