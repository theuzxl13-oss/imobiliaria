import { z } from "zod";

/** Converte os erros do Zod em { campo: mensagem }. */
export function toFieldErrors(error: z.ZodError) {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

const phone = z
  .string()
  .trim()
  .refine((v) => v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 13, {
    message: "Informe um telefone válido com DDD.",
  })
  .pipe(z.string().max(30));

const optionalEmail = z
  .string()
  .trim()
  .max(160)
  .refine((v) => v === "" || z.email().safeParse(v).success, { message: "Informe um e-mail válido." });

/** Converte "1.234,56" / "1234.56" / "" em número (ou null). */
export function parseMoney(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const n = Number(normalized.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

const money = (label: string) =>
  z.preprocess(
    parseMoney,
    z
      .number({ error: `${label}: valor inválido.` })
      .nonnegative(`${label} não pode ser negativo.`)
      .max(999_999_999_999, `${label}: valor muito alto.`)
      .nullable(),
  );

export const leadSchema = z.object({
  property_id: z.uuid().nullable(),
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  phone,
  email: optionalEmail,
  message: z.string().trim().max(2000, "Mensagem muito longa."),
});

export const listingRequestSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  phone,
  email: optionalEmail,
  property_type: z.string().trim().min(1, "Selecione o tipo do imóvel.").max(60),
  purpose: z.enum(["venda", "aluguel"], { error: "Selecione venda ou aluguel." }),
  city: z.string().trim().min(2, "Informe a cidade.").max(120),
  neighborhood: z.string().trim().max(120),
  approximate_value: money("Valor aproximado"),
  description: z.string().trim().max(3000, "Descrição muito longa."),
});

const int = (label: string) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number({ error: `${label}: número inválido.` }).int(`${label}: use número inteiro.`).min(0).max(999),
  );

export const propertySchema = z
  .object({
    code: z
      .string()
      .trim()
      .max(20)
      .refine((v) => v === "" || /^[A-Za-z0-9]+$/.test(v), "Use apenas letras e números no código."),
    title: z.string().trim().min(3, "Informe o título.").max(160),
    description: z.string().trim().max(10000),
    purpose: z.enum(["venda", "aluguel"], { error: "Selecione a finalidade." }),
    category_id: z.preprocess((v) => (v === "" ? null : v), z.uuid().nullable()),
    status: z.enum(["disponivel", "reservado", "vendido", "alugado", "indisponivel"]),
    is_published: z.boolean(),
    is_featured: z.boolean(),
    is_offer: z.boolean(),
    price: z.preprocess(
      parseMoney,
      z.number({ error: "Informe o preço." }).nonnegative().max(999_999_999_999),
    ),
    promo_price: money("Preço promocional"),
    zip_code: z.string().trim().max(9),
    state: z.string().trim().max(2),
    city: z.string().trim().min(2, "Informe a cidade.").max(120),
    neighborhood: z.string().trim().max(120),
    address: z.string().trim().max(200),
    address_number: z.string().trim().max(20),
    complement: z.string().trim().max(120),
    show_address: z.boolean(),
    bedrooms: int("Dormitórios"),
    suites: int("Suítes"),
    bathrooms: int("Banheiros"),
    parking_spots: int("Vagas"),
    total_area: money("Área total"),
    built_area: money("Área construída"),
    condo_fee: money("Condomínio"),
    iptu: money("IPTU"),
    feature_ids: z.array(z.uuid()).max(100),
  })
  .superRefine((data, ctx) => {
    if (data.is_offer) {
      if (data.promo_price === null) {
        ctx.addIssue({ code: "custom", path: ["promo_price"], message: "Informe o preço promocional da oferta." });
      } else if (data.promo_price >= data.price) {
        ctx.addIssue({
          code: "custom",
          path: ["promo_price"],
          message: "O preço promocional deve ser menor que o preço normal.",
        });
      }
    }
  });

export type PropertyInput = z.input<typeof propertySchema>;
export type PropertyData = z.output<typeof propertySchema>;

export const settingsSchema = z.object({
  company_name: z.string().trim().min(2, "Informe o nome da imobiliária.").max(120),
  logo_url: z.preprocess((v) => (v === "" ? null : v), z.url().nullable()),
  phone: z.string().trim().max(30),
  whatsapp: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v === "" || (v.length >= 12 && v.length <= 13), {
      message: "WhatsApp: informe DDI + DDD + número. Ex.: 5511999999999",
    }),
  email: optionalEmail,
  address: z.string().trim().max(250),
  instagram: z.string().trim().max(200),
  facebook: z.string().trim().max(200),
  business_hours: z.string().trim().max(250),
  about_text: z.string().trim().max(5000),
  creci: z.string().trim().max(40),
});
