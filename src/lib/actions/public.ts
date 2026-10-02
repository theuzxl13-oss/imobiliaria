"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { leadSchema, listingRequestSchema, toFieldErrors } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

const GENERIC_ERROR = "Não foi possível enviar agora. Tente novamente em instantes ou fale pelo WhatsApp.";

/** Campo "armadilha" invisível: robôs costumam preenchê-lo. */
function isBot(form: FormData) {
  return Boolean(String(form.get("website") ?? "").trim());
}

/** Formulário "Tenho interesse" (página do imóvel) e formulário de contato. */
export async function submitLead(_prev: unknown, form: FormData): Promise<ActionResult> {
  if (isBot(form)) return { ok: true, message: "Mensagem enviada!" };

  const parsed = leadSchema.safeParse({
    property_id: String(form.get("property_id") ?? "") || null,
    name: form.get("name") ?? "",
    phone: form.get("phone") ?? "",
    email: form.get("email") ?? "",
    message: form.get("message") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: "Confira os campos destacados.", fieldErrors: toFieldErrors(parsed.error) };
  }

  const { error } = await createPublicClient().from("leads").insert(parsed.data);
  if (error) {
    console.error("[lead] erro ao salvar:", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  return {
    ok: true,
    message: "Recebemos sua mensagem! Em breve um de nossos corretores entrará em contato.",
  };
}

/** Formulário "Anuncie seu imóvel". */
export async function submitListingRequest(_prev: unknown, form: FormData): Promise<ActionResult> {
  if (isBot(form)) return { ok: true, message: "Solicitação enviada!" };

  const parsed = listingRequestSchema.safeParse({
    name: form.get("name") ?? "",
    phone: form.get("phone") ?? "",
    email: form.get("email") ?? "",
    property_type: form.get("property_type") ?? "",
    purpose: form.get("purpose") ?? "",
    city: form.get("city") ?? "",
    neighborhood: form.get("neighborhood") ?? "",
    approximate_value: form.get("approximate_value") ?? "",
    description: form.get("description") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: "Confira os campos destacados.", fieldErrors: toFieldErrors(parsed.error) };
  }

  const { error } = await createPublicClient().from("listing_requests").insert(parsed.data);
  if (error) {
    console.error("[anuncie] erro ao salvar:", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  return {
    ok: true,
    message: "Solicitação enviada para avaliação! Nossa equipe entrará em contato em breve.",
  };
}
