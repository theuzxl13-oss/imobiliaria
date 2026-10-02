import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
import { WhatsAppIcon } from "./whatsapp-icon";
import { socialUrl, whatsappHref } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M13.5 21.9v-7.4h2.5l.4-2.9h-2.9V9.8c0-.8.2-1.4 1.4-1.4h1.6V5.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.1H7.9v2.9h2.5v7.4a10 10 0 1 1 3.1 0Z" />
    </svg>
  );
}

export function Footer({ settings }: { settings: SiteSettings }) {
  const instagram = socialUrl(settings.instagram, "instagram");
  const facebook = socialUrl(settings.facebook, "facebook");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-brand-950 text-slate-300">
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo name={settings.company_name} logoUrl={null} variant="light" />
          <p className="text-sm leading-relaxed text-slate-400">
            Compra, venda e locação de imóveis com atendimento próximo, transparência e segurança em
            cada etapa.
          </p>
          {settings.creci && <p className="text-xs text-slate-500">CRECI {settings.creci}</p>}
          {(instagram || facebook) && (
            <div className="flex gap-2">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="rounded-lg bg-white/5 p-2.5 transition hover:bg-white/10 hover:text-white"
                >
                  <InstagramIcon />
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="rounded-lg bg-white/5 p-2.5 transition hover:bg-white/10 hover:text-white"
                >
                  <FacebookIcon />
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold tracking-wider text-white uppercase">Imóveis</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-gold-300" href="/comprar">Imóveis à venda</Link></li>
            <li><Link className="hover:text-gold-300" href="/alugar">Imóveis para alugar</Link></li>
            <li><Link className="hover:text-gold-300" href="/ofertas">Ofertas</Link></li>
            <li><Link className="hover:text-gold-300" href="/imoveis">Todos os imóveis</Link></li>
            <li><Link className="hover:text-gold-300" href="/anuncie">Anuncie seu imóvel</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold tracking-wider text-white uppercase">Institucional</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-gold-300" href="/sobre">Sobre nós</Link></li>
            <li><Link className="hover:text-gold-300" href="/contato">Contato</Link></li>
            <li>
              <a className="hover:text-gold-300" href={whatsappHref(settings)} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold tracking-wider text-white uppercase">Atendimento</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {settings.phone && (
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="hover:text-white">
                  {settings.phone}
                </a>
              </li>
            )}
            <li className="flex gap-2.5">
              <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <a href={whatsappHref(settings)} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                Fale pelo WhatsApp
              </a>
            </li>
            {settings.email && (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-white">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span>{settings.address}</span>
              </li>
            )}
            {settings.business_hours && (
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span>{settings.business_hours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <p>
            © {year} {settings.company_name}. Todos os direitos reservados.
          </p>
          <p>Imagens meramente ilustrativas. Valores sujeitos a alteração.</p>
        </div>
      </div>
    </footer>
  );
}
