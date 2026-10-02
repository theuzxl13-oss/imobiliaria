import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  Bath,
  BedDouble,
  Building,
  Car,
  Check,
  ChevronRight,
  Hash,
  Info,
  LandPlot,
  MapPin,
  Ruler,
  ShowerHead,
} from "lucide-react";
import { Gallery } from "@/components/site/gallery";
import { InterestForm } from "@/components/site/interest-form";
import { ShareButtons } from "@/components/site/share-buttons";
import { PropertyGrid } from "@/components/site/property-card";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { JsonLd } from "@/components/site/json-ld";
import { getPropertyByCode, getSettings, getSimilarProperties } from "@/lib/queries";
import {
  codeFromSlug,
  formatArea,
  formatCurrency,
  formatPrice,
  hasActiveOffer,
  locationLabel,
  propertyPath,
  propertySlug,
} from "@/lib/format";
import { PURPOSE_BADGE, PURPOSE_LABEL, STATUS_LABEL } from "@/lib/constants";
import { propertyWhatsappMessage, whatsappHref } from "@/lib/site";
import { SITE_URL } from "@/lib/env";
import { cn } from "@/lib/cn";

export const revalidate = 60;

async function load(slug: string) {
  const code = codeFromSlug(slug);
  if (!code) return null;
  return getPropertyByCode(code);
}

export async function generateMetadata({ params }: PageProps<"/imovel/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const property = await load(slug);
  if (!property) return { title: "Imóvel não encontrado" };

  const price = formatPrice(property.effective_price, property.purpose);
  const description =
    `${PURPOSE_BADGE[property.purpose]} · ${property.category?.name ?? "Imóvel"} em ${locationLabel(property)} · ${price}. ` +
    property.description.replace(/\s+/g, " ").slice(0, 120);
  const path = propertyPath(property);

  return {
    title: `${property.title} — Cód. ${property.code}`,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: `${property.title} | ${price}`,
      description,
      images: property.images.slice(0, 4).map((img) => ({ url: img.url, alt: property.title })),
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function PropertyPage({ params }: PageProps<"/imovel/[slug]">) {
  const { slug } = await params;
  const property = await load(slug);
  if (!property) notFound();

  // Mantém sempre a URL amigável atualizada (ex.: se o bairro for alterado).
  const canonicalSlug = propertySlug(property);
  if (slug !== canonicalSlug) permanentRedirect(`/imovel/${canonicalSlug}`);

  const [settings, similar] = await Promise.all([getSettings(), getSimilarProperties(property)]);
  const offer = hasActiveOffer(property);
  const closed = property.status === "vendido" || property.status === "alugado";
  const url = `${SITE_URL}${propertyPath(property)}`;
  const waHref = whatsappHref(settings, propertyWhatsappMessage(settings, property.code));

  const facts = [
    { icon: BedDouble, label: "Dormitórios", value: property.bedrooms },
    { icon: ShowerHead, label: "Suítes", value: property.suites },
    { icon: Bath, label: "Banheiros", value: property.bathrooms },
    { icon: Car, label: "Vagas", value: property.parking_spots },
    { icon: Building, label: "Área construída", value: formatArea(property.built_area) || "—" },
    { icon: LandPlot, label: "Área total", value: formatArea(property.total_area) || "—" },
  ];

  const fullAddress = property.show_address
    ? [
        [property.address, property.address_number].filter(Boolean).join(", "),
        property.complement,
        locationLabel(property),
        property.zip_code && property.zip_code !== "00000-000" ? `CEP ${property.zip_code}` : "",
      ]
        .filter(Boolean)
        .join(" — ")
    : locationLabel(property);

  const mapsQuery = encodeURIComponent(
    property.show_address
      ? `${property.address} ${property.address_number}, ${property.neighborhood}, ${property.city} ${property.state}`
      : `${property.neighborhood}, ${property.city} ${property.state}`,
  );

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          name: property.title,
          description: property.description,
          url,
          image: property.images.map((i) => i.url),
          datePosted: property.created_at,
          offers: {
            "@type": "Offer",
            price: property.effective_price,
            priceCurrency: "BRL",
            availability: closed ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            businessFunction:
              property.purpose === "aluguel"
                ? "http://purl.org/goodrelations/v1#LeaseOut"
                : "http://purl.org/goodrelations/v1#Sell",
          },
          address: {
            "@type": "PostalAddress",
            addressLocality: property.city,
            addressRegion: property.state,
            addressCountry: "BR",
          },
        }}
      />

      <div className="container-site py-6 sm:py-8">
        <nav aria-label="Você está em" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-700">Início</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={property.purpose === "venda" ? "/comprar" : "/alugar"} className="hover:text-brand-700">
            {property.purpose === "venda" ? "Comprar" : "Alugar"}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-700">Cód. {property.code}</span>
        </nav>

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-brand-800 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
                {PURPOSE_BADGE[property.purpose]}
              </span>
              {property.category && (
                <span className="rounded-md bg-brand-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-brand-800 uppercase">
                  {property.category.name}
                </span>
              )}
              {offer && (
                <span className="rounded-md bg-rose-600 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white uppercase">
                  Oferta
                </span>
              )}
              {property.is_featured && (
                <span className="rounded-md bg-gold-400 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-brand-950 uppercase">
                  Destaque
                </span>
              )}
              {property.status !== "disponivel" && (
                <span className="rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white uppercase">
                  {STATUS_LABEL[property.status]}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-brand-950 sm:text-3xl">
              {property.title}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gold-500" /> {locationLabel(property)}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="h-4 w-4 text-gold-500" /> Código do imóvel: <strong className="text-slate-700">{property.code}</strong>
              </span>
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-8">
            <Gallery photos={property.images.map((i) => ({ id: i.id, url: i.url }))} title={property.title} />

            {closed && (
              <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <Info className="h-5 w-5 shrink-0" />
                <p>
                  Este imóvel já foi <strong>{STATUS_LABEL[property.status].toLowerCase()}</strong>. Fale com a nossa
                  equipe para conhecer opções semelhantes.
                </p>
              </div>
            )}

            <section aria-labelledby="detalhes" className="card p-5 sm:p-6">
              <h2 id="detalhes" className="text-lg font-bold text-brand-950">Detalhes do imóvel</h2>
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="rounded-lg bg-white p-2 text-brand-600 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <dt className="text-xs text-slate-500">{label}</dt>
                      <dd className="font-bold text-brand-950">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="descricao" className="card p-5 sm:p-6">
              <h2 id="descricao" className="text-lg font-bold text-brand-950">Descrição</h2>
              <div className="prose-text mt-3 text-[15px] leading-relaxed text-slate-600">
                {property.description
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i} className="whitespace-pre-line">{p}</p>
                  ))}
                {!property.description && <p>Entre em contato para mais informações sobre este imóvel.</p>}
              </div>
            </section>

            {property.features.length > 0 && (
              <section aria-labelledby="caracteristicas" className="card p-5 sm:p-6">
                <h2 id="caracteristicas" className="text-lg font-bold text-brand-950">Características do imóvel</h2>
                <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                  {property.features.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="rounded-full bg-emerald-50 p-1 text-emerald-600">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {f.name}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="localizacao" className="card p-5 sm:p-6">
              <h2 id="localizacao" className="text-lg font-bold text-brand-950">Localização</h2>
              <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                {fullAddress}
              </p>
              {!property.show_address && (
                <p className="mt-2 text-xs text-slate-400">
                  Por segurança, o endereço completo é informado no atendimento.
                </p>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm mt-4"
              >
                Ver região no Google Maps
              </a>
            </section>
          </div>

          {/* Coluna lateral */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {PURPOSE_LABEL[property.purpose]}
              </p>
              {offer ? (
                <div className="mt-1">
                  <p className="text-sm text-slate-500">
                    DE: <span className="line-through">{formatPrice(property.price, property.purpose)}</span>
                  </p>
                  <p className="text-3xl font-extrabold text-rose-600">
                    <span className="text-base font-bold">POR: </span>
                    {formatPrice(property.promo_price!, property.purpose)}
                  </p>
                  <p className="mt-1 inline-block rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">
                    Economia de {formatCurrency(property.price - property.promo_price!)}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-3xl font-extrabold text-brand-900">
                  {formatPrice(property.price, property.purpose)}
                </p>
              )}

              {(property.condo_fee || property.iptu) && (
                <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
                  {property.condo_fee ? (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Condomínio</dt>
                      <dd className="font-semibold text-slate-800">{formatCurrency(property.condo_fee)}/mês</dd>
                    </div>
                  ) : null}
                  {property.iptu ? (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">IPTU</dt>
                      <dd className="font-semibold text-slate-800">{formatCurrency(property.iptu)}/ano</dd>
                    </div>
                  ) : null}
                </dl>
              )}

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp mt-5 w-full py-3.5 text-base"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Tenho interesse neste imóvel
              </a>
              <p className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-400">
                <Ruler className="h-3 w-3" /> Informe o código <strong>#{property.code}</strong> no atendimento
              </p>
            </div>

            <div className="card p-5 sm:p-6" id="interesse">
              <h2 className="text-base font-bold text-brand-950">Quero mais informações</h2>
              <p className="mb-4 text-sm text-slate-500">Preencha e retornaremos rapidamente.</p>
              <InterestForm
                propertyId={property.id}
                defaultMessage={`Olá! Tenho interesse no imóvel código #${property.code} (${property.title}). Aguardo contato.`}
              />
            </div>

            <div className="card p-5 sm:p-6">
              <ShareButtons url={url} title={property.title} />
            </div>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className={cn("border-t border-slate-200 bg-white py-14")}>
          <div className="container-site">
            <h2 className="section-title mb-6">Imóveis semelhantes</h2>
            <PropertyGrid properties={similar} />
          </div>
        </section>
      )}
    </>
  );
}
