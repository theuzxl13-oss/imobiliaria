import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { InterestForm } from "@/components/site/interest-form";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { getSettings } from "@/lib/queries";
import { whatsappHref } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Toninho Imóveis por WhatsApp, telefone, e-mail ou formulário.",
  alternates: { canonical: "/contato" },
};

export default async function ContatoPage() {
  const settings = await getSettings();

  const items = [
    settings.phone && { icon: Phone, label: "Telefone", value: settings.phone, href: `tel:${settings.phone.replace(/\D/g, "")}` },
    settings.email && { icon: Mail, label: "E-mail", value: settings.email, href: `mailto:${settings.email}` },
    settings.address && { icon: MapPin, label: "Endereço", value: settings.address },
    settings.business_hours && { icon: Clock, label: "Horário de atendimento", value: settings.business_hours },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <>
      <PageHero
        title="Contato"
        description="Estamos prontos para ajudar você a comprar, vender ou alugar."
        breadcrumb={[{ label: "Contato" }]}
      />
      <div className="container-site grid gap-8 py-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <a
            href={whatsappHref(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl bg-whatsapp p-6 text-white shadow-card transition hover:bg-whatsapp-dark"
          >
            <WhatsAppIcon className="h-10 w-10" />
            <div>
              <p className="text-lg font-bold">Falar no WhatsApp</p>
              <p className="text-sm text-white/90">Atendimento rápido e direto com um corretor.</p>
            </div>
          </a>
          <ul className="card divide-y divide-slate-100">
            {items.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex gap-4 p-5">
                <span className="h-fit rounded-xl bg-brand-50 p-3 text-brand-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-950">{label}</p>
                  {href ? (
                    <a href={href} className="break-all text-slate-600 hover:text-brand-700">{value}</a>
                  ) : (
                    <p className="text-slate-600">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6 sm:p-8">
          <h2 className="text-xl font-bold text-brand-950">Envie uma mensagem</h2>
          <p className="mb-6 text-sm text-slate-500">Responderemos o mais breve possível.</p>
          <InterestForm submitLabel="Enviar mensagem" />
        </div>
      </div>
    </>
  );
}
