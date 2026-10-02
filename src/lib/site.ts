import { DEFAULT_WHATSAPP } from "./env";
import { whatsappLink } from "./format";
import type { SiteSettings } from "./types";

export function whatsappNumber(settings: SiteSettings) {
  return settings.whatsapp || DEFAULT_WHATSAPP;
}

/** Link do WhatsApp com mensagem; sem número configurado, leva para /contato. */
export function whatsappHref(settings: SiteSettings, message?: string) {
  const text =
    message ?? `Olá! Vim pelo site da ${settings.company_name} e gostaria de mais informações.`;
  return whatsappLink(whatsappNumber(settings), text) ?? "/contato";
}

export function propertyWhatsappMessage(settings: SiteSettings, code: string) {
  return `Olá! Vi o imóvel código #${code} no site da ${settings.company_name} e gostaria de mais informações.`;
}

export function socialUrl(value: string, network: "instagram" | "facebook") {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "");
  return network === "instagram"
    ? `https://instagram.com/${handle}`
    : `https://facebook.com/${handle}`;
}
