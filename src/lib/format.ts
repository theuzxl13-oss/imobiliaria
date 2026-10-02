import type { Property, PropertyListItem, Purpose } from "./types";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  return currency.format(Number(value));
}

export function formatPrice(value: number, purpose: Purpose) {
  return purpose === "aluguel" ? `${formatCurrency(value)}/mês` : formatCurrency(value);
}

export function formatArea(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  return `${number.format(Number(value))} m²`;
}

export function formatNumber(value: number) {
  return number.format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

/** Remove acentos e deixa em minúsculas (igual à função normalize_text do banco). */
export function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function slugify(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** URL amigável: /imovel/casa-3-quartos-centro-0001 (o código fica sempre no final). */
export function propertySlug(p: Pick<PropertyListItem, "code" | "neighborhood" | "bedrooms"> & {
  category?: { name: string } | null;
  title?: string;
}) {
  const parts = [p.category?.name ?? p.title ?? "imovel"];
  if (p.bedrooms > 0) parts.push(`${p.bedrooms} ${p.bedrooms === 1 ? "quarto" : "quartos"}`);
  if (p.neighborhood) parts.push(p.neighborhood);
  return `${slugify(parts.join(" "))}-${p.code.toLowerCase()}`;
}

export function propertyPath(p: Parameters<typeof propertySlug>[0]) {
  return `/imovel/${propertySlug(p)}`;
}

/** Extrai o código do imóvel do final do slug. */
export function codeFromSlug(slug: string) {
  const code = slug.split("-").pop() ?? "";
  return /^[a-z0-9]{1,20}$/i.test(code) ? code : null;
}

export function hasActiveOffer(p: Pick<Property, "is_offer" | "promo_price" | "price">) {
  return p.is_offer && p.promo_price !== null && Number(p.promo_price) < Number(p.price);
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function whatsappLink(number: string, message?: string) {
  const digits = onlyDigits(number);
  if (!digits) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function locationLabel(p: Pick<Property, "neighborhood" | "city" | "state">) {
  const city = [p.city, p.state].filter(Boolean).join("/");
  return [p.neighborhood, city].filter(Boolean).join(", ");
}

export function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}
