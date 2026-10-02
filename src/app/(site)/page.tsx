import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Handshake,
  KeyRound,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { HeroSearch } from "@/components/site/hero-search";
import { SafeImage } from "@/components/site/safe-image";
import { PropertyGrid } from "@/components/site/property-card";
import { SectionHeader } from "@/components/site/section-header";
import { CategoryIcon } from "@/components/site/category-icon";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { JsonLd } from "@/components/site/json-ld";
import {
  getCategories,
  getCategoryCounts,
  getFeaturedProperties,
  getLatestByPurpose,
  getOfferProperties,
  getSettings,
} from "@/lib/queries";
import { whatsappHref } from "@/lib/site";
import { SITE_URL } from "@/lib/env";
import { pluralize } from "@/lib/format";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, categories, counts, featured, forSale, forRent, offers] = await Promise.all([
    getSettings(),
    getCategories(),
    getCategoryCounts(),
    getFeaturedProperties(8),
    getLatestByPurpose("venda", 8),
    getLatestByPurpose("aluguel", 8),
    getOfferProperties(8),
  ]);

  const waHref = whatsappHref(settings);
  const aboutParagraphs = settings.about_text.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          name: settings.company_name,
          url: SITE_URL,
          logo: settings.logo_url ?? `${SITE_URL}/icon.svg`,
          telephone: settings.phone || undefined,
          email: settings.email || undefined,
          address: settings.address || undefined,
          openingHours: settings.business_hours || undefined,
        }}
      />

      {/* BANNER + BUSCA */}
      <section className="hero-pattern relative isolate overflow-hidden text-white">
        <SafeImage
          hideOnError
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/80 via-brand-950/30 to-transparent" />
        <div className="container-site py-16 sm:py-24 lg:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-gold-200 backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Negócios imobiliários com segurança e transparência
            </p>
            <h1 className="mt-5 text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Encontre o imóvel <span className="text-gold-300">ideal</span> para você.
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-200 sm:text-lg">
              Casas, apartamentos, terrenos, chácaras e imóveis comerciais para comprar ou alugar,
              com o atendimento próximo da {settings.company_name}.
            </p>
          </div>
          <div className="mt-8 max-w-5xl">
            <HeroSearch categories={categories} />
          </div>
          <dl className="mt-10 grid max-w-3xl grid-cols-3 gap-4 text-center sm:text-left">
            {[
              ["Atendimento", "personalizado"],
              ["Documentação", "segura"],
              ["Imóveis", "selecionados"],
            ].map(([a, b]) => (
              <div key={a} className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                <BadgeCheck className="mx-auto h-5 w-5 text-gold-300 sm:mx-0" />
                <dt className="text-sm font-bold">{a}</dt>
                <dd className="text-sm text-slate-300">{b}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* IMÓVEIS EM DESTAQUE */}
      {featured.length > 0 && (
        <section className="container-site py-16">
          <SectionHeader
            eyebrow="Seleção especial"
            title="Imóveis em destaque"
            description="Oportunidades escolhidas a dedo pela nossa equipe."
            href="/imoveis"
          />
          <PropertyGrid properties={featured} />
        </section>
      )}

      {/* VENDA */}
      {forSale.length > 0 && (
        <section className="bg-white py-16">
          <div className="container-site">
            <SectionHeader
              eyebrow="Comprar"
              title="Imóveis à venda"
              description="Realize o sonho da casa própria ou faça um ótimo investimento."
              href="/comprar"
              linkLabel="Ver imóveis à venda"
            />
            <PropertyGrid properties={forSale} />
          </div>
        </section>
      )}

      {/* ALUGUEL */}
      {forRent.length > 0 && (
        <section className="container-site py-16">
          <SectionHeader
            eyebrow="Alugar"
            title="Imóveis para alugar"
            description="Opções para morar ou trabalhar, com contratos claros e seguros."
            href="/alugar"
            linkLabel="Ver imóveis para alugar"
          />
          <PropertyGrid properties={forRent} />
        </section>
      )}

      {/* OFERTAS */}
      {offers.length > 0 && (
        <section className="bg-gradient-to-b from-rose-50/70 to-transparent py-16">
          <div className="container-site">
            <SectionHeader
              eyebrow="Preços especiais"
              title="Ofertas imperdíveis"
              description="Imóveis com condições especiais por tempo limitado."
              href="/ofertas"
              linkLabel="Ver todas as ofertas"
            />
            <PropertyGrid properties={offers} />
          </div>
        </section>
      )}

      {/* CATEGORIAS */}
      {categories.length > 0 && (
        <section className="bg-white py-16">
          <div className="container-site">
            <SectionHeader
              eyebrow="Categorias"
              title="O que você está procurando?"
              description="Navegue pelos tipos de imóveis disponíveis."
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map((c) => {
                const count = counts.get(c.id) ?? 0;
                return (
                  <Link
                    key={c.id}
                    href={`/imoveis?tipo=${c.slug}`}
                    className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white hover:shadow-card"
                  >
                    <span className="rounded-xl bg-brand-800 p-3 text-gold-300 transition group-hover:bg-gold-400 group-hover:text-brand-950">
                      <CategoryIcon slug={c.slug} className="h-6 w-6" />
                    </span>
                    <span>
                      <span className="block font-bold text-brand-950">{c.name}</span>
                      <span className="text-xs text-slate-500">
                        {count > 0 ? pluralize(count, "imóvel", "imóveis") : "Consulte"}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ANUNCIE SEU IMÓVEL */}
      <section className="container-site py-16">
        <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-12 text-white sm:px-12">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="section-eyebrow text-gold-300">Quer vender ou alugar?</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Anuncie seu imóvel com a {settings.company_name}
              </h2>
              <p className="mt-3 max-w-xl text-slate-300">
                Avaliamos seu imóvel, produzimos um anúncio profissional e cuidamos de toda a
                negociação para você vender ou alugar com rapidez e segurança.
              </p>
              <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
                {[
                  [Megaphone, "Divulgação profissional"],
                  [Handshake, "Negociação segura"],
                  [KeyRound, "Suporte até as chaves"],
                ].map(([Icon, label]) => {
                  const I = Icon as typeof Megaphone;
                  return (
                    <li key={label as string} className="flex items-center gap-2">
                      <I className="h-5 w-5 text-gold-300" />
                      {label as string}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <Link href="/anuncie" className="btn btn-gold px-7 py-4 text-base">
                Quero anunciar meu imóvel
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-xs text-slate-400">Avaliação sem compromisso.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="bg-white py-16">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="section-eyebrow">Sobre nós</p>
            <h2 className="section-title">Conheça a {settings.company_name}</h2>
            <div className="prose-text mt-4 text-slate-600">
              {(aboutParagraphs.length ? aboutParagraphs.slice(0, 2) : [
                "Somos uma imobiliária comprometida em tornar a compra, a venda e a locação de imóveis uma experiência simples, transparente e segura.",
              ]).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <Link href="/sobre" className="btn btn-outline mt-6">
              Saiba mais sobre nós
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              [ShieldCheck, "Segurança", "Contratos e documentação conferidos com cuidado."],
              [Handshake, "Confiança", "Relacionamento transparente do início ao fim."],
              [BadgeCheck, "Qualidade", "Imóveis avaliados e anúncios completos."],
              [KeyRound, "Agilidade", "Atendimento rápido para você não perder oportunidades."],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <div key={title as string} className="rounded-2xl border border-slate-200 p-5">
                  <I className="h-7 w-7 text-gold-500" />
                  <h3 className="mt-3 font-bold text-brand-950">{title as string}</h3>
                  <p className="mt-1 text-sm text-slate-500">{text as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTATO / WHATSAPP */}
      <section className="container-site py-16">
        <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="section-eyebrow">Fale conosco</p>
            <h2 className="section-title">Vamos encontrar o seu próximo imóvel?</h2>
            <p className="mt-3 text-slate-600">
              Nossa equipe está pronta para entender o que você procura e apresentar as melhores
              opções. Chame no WhatsApp ou faça uma visita.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp px-6 py-3.5">
                <WhatsAppIcon className="h-5 w-5" />
                Falar no WhatsApp
              </a>
              <Link href="/contato" className="btn btn-outline px-6 py-3.5">
                Enviar mensagem
              </Link>
            </div>
          </div>
          <ul className="space-y-4 rounded-2xl bg-slate-50 p-6 text-sm">
            {settings.phone && (
              <li className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="font-semibold text-brand-950">Telefone</p>
                  <p className="text-slate-600">{settings.phone}</p>
                </div>
              </li>
            )}
            {settings.email && (
              <li className="flex gap-3">
                <Mail className="h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="font-semibold text-brand-950">E-mail</p>
                  <p className="break-all text-slate-600">{settings.email}</p>
                </div>
              </li>
            )}
            {settings.address && (
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="font-semibold text-brand-950">Endereço</p>
                  <p className="text-slate-600">{settings.address}</p>
                </div>
              </li>
            )}
            {settings.business_hours && (
              <li className="flex gap-3">
                <Clock className="h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="font-semibold text-brand-950">Horário de atendimento</p>
                  <p className="text-slate-600">{settings.business_hours}</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      </section>
    </>
  );
}
