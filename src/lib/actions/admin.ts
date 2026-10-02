"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { STORAGE_BUCKET } from "@/lib/env";
import { slugify } from "@/lib/format";
import { propertySchema, settingsSchema, toFieldErrors, type PropertyInput } from "@/lib/validation";
import type { ActionResult, LeadStatus, PropertyStatus } from "@/lib/types";

/* ---------------------------------------------------------------------
   Utilitários
   --------------------------------------------------------------------- */

/** Atualiza todas as páginas públicas (home, listagens, página do imóvel). */
function refreshSite() {
  revalidatePath("/", "layout");
}

type DbError = { code?: string; message: string } | null;

function dbError(error: DbError, fallback = "Não foi possível salvar. Tente novamente."): string {
  if (!error) return fallback;
  console.error("[admin]", error.code, error.message);
  if (error.code === "23505") {
    if (error.message.includes("code")) return "Já existe um imóvel com este código.";
    return "Já existe um registro com este nome.";
  }
  if (error.code === "42501") return "Você não tem permissão para esta ação.";
  if (error.code === "23514") return "Algum valor informado é inválido. Confira os campos.";
  return fallback;
}

async function guard<T>(fn: () => Promise<T>): Promise<T | { ok: false; error: string }> {
  try {
    return await fn();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro inesperado.";
    console.error("[admin] ", message);
    return { ok: false, error: message === "Acesso não autorizado." ? message : "Erro inesperado. Tente novamente." };
  }
}

const uuid = z.uuid();

/* ---------------------------------------------------------------------
   Imóveis
   --------------------------------------------------------------------- */

function toRow(data: z.output<typeof propertySchema>) {
  const { feature_ids: _features, code, ...rest } = data;
  void _features;
  return {
    ...rest,
    ...(code ? { code } : {}),
    state: rest.state.toUpperCase(),
  };
}

async function saveFeatures(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  propertyId: string,
  featureIds: string[],
) {
  const { error: delError } = await supabase.from("property_features").delete().eq("property_id", propertyId);
  if (delError) return delError;
  if (featureIds.length === 0) return null;
  const { error } = await supabase
    .from("property_features")
    .insert([...new Set(featureIds)].map((feature_id) => ({ property_id: propertyId, feature_id })));
  return error;
}

export async function createProperty(
  input: PropertyInput,
): Promise<ActionResult<{ id: string; code: string }>> {
  return guard(async () => {
    const { supabase, session } = await requireAdmin();
    const parsed = propertySchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false as const, error: "Confira os campos destacados.", fieldErrors: toFieldErrors(parsed.error) };
    }

    const { data, error } = await supabase
      .from("properties")
      .insert({ ...toRow(parsed.data), created_by: session.userId })
      .select("id, code")
      .single();
    if (error || !data) return { ok: false as const, error: dbError(error) };

    const featError = await saveFeatures(supabase, data.id, parsed.data.feature_ids);
    if (featError) return { ok: false as const, error: dbError(featError, "Imóvel salvo, mas houve erro nas características.") };

    refreshSite();
    return { ok: true as const, data, message: `Imóvel ${data.code} cadastrado com sucesso!` };
  });
}

export async function updateProperty(id: string, input: PropertyInput): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    if (!uuid.safeParse(id).success) return { ok: false as const, error: "Imóvel inválido." };
    const parsed = propertySchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false as const, error: "Confira os campos destacados.", fieldErrors: toFieldErrors(parsed.error) };
    }
    if (!parsed.data.code) {
      return { ok: false as const, error: "Informe o código do imóvel.", fieldErrors: { code: "Informe o código." } };
    }

    const { error } = await supabase.from("properties").update(toRow(parsed.data)).eq("id", id);
    if (error) return { ok: false as const, error: dbError(error) };

    const featError = await saveFeatures(supabase, id, parsed.data.feature_ids);
    if (featError) return { ok: false as const, error: dbError(featError) };

    refreshSite();
    return { ok: true as const, message: "Alterações salvas! O site já foi atualizado." };
  });
}

type QuickAction =
  | { type: "featured"; value: boolean }
  | { type: "published"; value: boolean }
  | { type: "status"; value: PropertyStatus }
  | { type: "offer"; promoPrice: number | null };

const STATUS_VALUES = ["disponivel", "reservado", "vendido", "alugado", "indisponivel"] as const;

/** Ações rápidas da tela "Gerenciar imóveis". */
export async function quickUpdateProperty(id: string, action: QuickAction): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    if (!uuid.safeParse(id).success) return { ok: false as const, error: "Imóvel inválido." };

    let patch: Record<string, unknown>;
    let message: string;
    switch (action.type) {
      case "featured":
        patch = { is_featured: action.value };
        message = action.value ? "Imóvel marcado como destaque." : "Destaque removido.";
        break;
      case "published":
        patch = { is_published: action.value };
        message = action.value ? "Imóvel publicado no site." : "Imóvel desativado (oculto do site).";
        break;
      case "status":
        if (!STATUS_VALUES.includes(action.value)) return { ok: false as const, error: "Status inválido." };
        patch = { status: action.value };
        message = "Status atualizado.";
        break;
      case "offer": {
        if (action.promoPrice === null) {
          patch = { is_offer: false, promo_price: null };
          message = "Oferta removida.";
        } else {
          const { data: current } = await supabase.from("properties").select("price").eq("id", id).single();
          if (!current) return { ok: false as const, error: "Imóvel não encontrado." };
          if (!(action.promoPrice > 0) || action.promoPrice >= Number(current.price)) {
            return { ok: false as const, error: "O preço promocional deve ser menor que o preço normal." };
          }
          patch = { is_offer: true, promo_price: action.promoPrice };
          message = "Oferta criada! O imóvel já aparece na página de ofertas.";
        }
        break;
      }
    }

    const { error } = await supabase.from("properties").update(patch).eq("id", id);
    if (error) return { ok: false as const, error: dbError(error) };
    refreshSite();
    return { ok: true as const, message };
  });
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    if (!uuid.safeParse(id).success) return { ok: false as const, error: "Imóvel inválido." };

    const { data: images } = await supabase
      .from("property_images")
      .select("storage_path")
      .eq("property_id", id);

    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return { ok: false as const, error: dbError(error, "Não foi possível excluir.") };

    const paths = (images ?? []).map((i) => i.storage_path).filter((p): p is string => Boolean(p));
    if (paths.length) await supabase.storage.from(STORAGE_BUCKET).remove(paths);

    refreshSite();
    return { ok: true as const, message: "Imóvel excluído." };
  });
}

/* ---------------------------------------------------------------------
   Fotos
   --------------------------------------------------------------------- */

/** Registra fotos já enviadas ao Storage (o upload é feito pelo navegador). */
export async function addPropertyImages(propertyId: string, storagePaths: string[]): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    if (!uuid.safeParse(propertyId).success) return { ok: false as const, error: "Imóvel inválido." };
    const valid = storagePaths.filter((p) => p.startsWith(`properties/${propertyId}/`) && !p.includes(".."));
    if (valid.length === 0) return { ok: false as const, error: "Nenhuma foto válida." };

    const { data: existing } = await supabase
      .from("property_images")
      .select("position, is_cover")
      .eq("property_id", propertyId);
    const start = Math.max(-1, ...(existing ?? []).map((i) => i.position)) + 1;
    const hasCover = (existing ?? []).some((i) => i.is_cover);

    const rows = valid.map((path, i) => ({
      property_id: propertyId,
      storage_path: path,
      url: supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl,
      position: start + i,
      is_cover: !hasCover && i === 0,
    }));

    const { error } = await supabase.from("property_images").insert(rows);
    if (error) return { ok: false as const, error: dbError(error, "Não foi possível registrar as fotos.") };
    refreshSite();
    return { ok: true as const, message: `${rows.length} foto(s) adicionada(s).` };
  });
}

export async function setCoverImage(imageId: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const { data: image } = await supabase
      .from("property_images")
      .select("id, property_id")
      .eq("id", imageId)
      .single();
    if (!image) return { ok: false as const, error: "Foto não encontrada." };

    await supabase.from("property_images").update({ is_cover: false }).eq("property_id", image.property_id);
    const { error } = await supabase.from("property_images").update({ is_cover: true }).eq("id", imageId);
    if (error) return { ok: false as const, error: dbError(error) };
    refreshSite();
    return { ok: true as const, message: "Foto principal definida." };
  });
}

export async function reorderImages(propertyId: string, orderedIds: string[]): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    if (!uuid.safeParse(propertyId).success) return { ok: false as const, error: "Imóvel inválido." };
    const results = await Promise.all(
      orderedIds.map((id, position) =>
        supabase.from("property_images").update({ position }).eq("id", id).eq("property_id", propertyId),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) return { ok: false as const, error: dbError(failed.error) };
    refreshSite();
    return { ok: true as const, message: "Ordem das fotos atualizada." };
  });
}

export async function deleteImage(imageId: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const { data: image } = await supabase
      .from("property_images")
      .select("id, property_id, storage_path, is_cover")
      .eq("id", imageId)
      .single();
    if (!image) return { ok: false as const, error: "Foto não encontrada." };

    const { error } = await supabase.from("property_images").delete().eq("id", imageId);
    if (error) return { ok: false as const, error: dbError(error) };
    if (image.storage_path) await supabase.storage.from(STORAGE_BUCKET).remove([image.storage_path]);

    if (image.is_cover) {
      const { data: next } = await supabase
        .from("property_images")
        .select("id")
        .eq("property_id", image.property_id)
        .order("position")
        .limit(1)
        .maybeSingle();
      if (next) await supabase.from("property_images").update({ is_cover: true }).eq("id", next.id);
    }
    refreshSite();
    return { ok: true as const, message: "Foto excluída." };
  });
}

/* ---------------------------------------------------------------------
   Interessados e solicitações de anúncio
   --------------------------------------------------------------------- */

const LEAD_STATUS = ["novo", "em_atendimento", "contato_realizado", "visita_agendada", "finalizado"] as const;

export async function updateContact(
  table: "leads" | "listing_requests",
  id: string,
  patch: { status?: LeadStatus; notes?: string },
): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    if (!uuid.safeParse(id).success) return { ok: false as const, error: "Registro inválido." };
    if (table !== "leads" && table !== "listing_requests") return { ok: false as const, error: "Inválido." };
    const update: Record<string, string> = {};
    if (patch.status) {
      if (!LEAD_STATUS.includes(patch.status)) return { ok: false as const, error: "Status inválido." };
      update.status = patch.status;
    }
    if (patch.notes !== undefined) update.notes = patch.notes.slice(0, 5000);

    const { error } = await supabase.from(table).update(update).eq("id", id);
    if (error) return { ok: false as const, error: dbError(error) };
    revalidatePath("/admin", "layout");
    return { ok: true as const, message: patch.status ? "Status do atendimento atualizado." : "Anotações salvas." };
  });
}

export async function deleteContact(table: "leads" | "listing_requests", id: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    if (!uuid.safeParse(id).success) return { ok: false as const, error: "Registro inválido." };
    if (table !== "leads" && table !== "listing_requests") return { ok: false as const, error: "Inválido." };
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return { ok: false as const, error: dbError(error) };
    revalidatePath("/admin", "layout");
    return { ok: true as const, message: "Registro excluído." };
  });
}

/* ---------------------------------------------------------------------
   Características e categorias
   --------------------------------------------------------------------- */

const nameSchema = z.string().trim().min(2, "Nome muito curto.").max(60, "Nome muito longo.");

export async function saveTaxonomy(
  table: "features" | "categories",
  input: { id?: string; name: string; sort_order?: number },
): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    if (table !== "features" && table !== "categories") return { ok: false as const, error: "Inválido." };
    const name = nameSchema.safeParse(input.name);
    if (!name.success) return { ok: false as const, error: name.error.issues[0].message };

    const row: Record<string, unknown> = { name: name.data, sort_order: Math.trunc(input.sort_order ?? 0) };
    if (table === "categories") row.slug = slugify(name.data);

    const { error } = input.id
      ? await supabase.from(table).update(row).eq("id", input.id)
      : await supabase.from(table).insert(row);
    if (error) return { ok: false as const, error: dbError(error) };
    refreshSite();
    return { ok: true as const, message: input.id ? "Atualizado com sucesso." : "Adicionado com sucesso." };
  });
}

export async function deleteTaxonomy(table: "features" | "categories", id: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    if (table !== "features" && table !== "categories") return { ok: false as const, error: "Inválido." };
    if (!uuid.safeParse(id).success) return { ok: false as const, error: "Registro inválido." };
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return { ok: false as const, error: dbError(error) };
    refreshSite();
    return { ok: true as const, message: "Excluído com sucesso." };
  });
}

/* ---------------------------------------------------------------------
   Configurações
   --------------------------------------------------------------------- */

export async function updateSettings(input: Record<string, string>): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false as const, error: "Confira os campos destacados.", fieldErrors: toFieldErrors(parsed.error) };
    }
    const { error } = await supabase.from("site_settings").update(parsed.data).eq("id", 1);
    if (error) return { ok: false as const, error: dbError(error) };
    refreshSite();
    return { ok: true as const, message: "Configurações salvas! O site já foi atualizado." };
  });
}

/* ---------------------------------------------------------------------
   Usuários administradores (requer SUPABASE_SERVICE_ROLE_KEY)
   --------------------------------------------------------------------- */

const newAdminSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(120),
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres.").max(72),
});

export async function createAdminUser(input: { name: string; email: string; password: string }): Promise<ActionResult> {
  return guard(async () => {
    await requireAdmin();
    const service = createServiceClient();
    if (!service) {
      return { ok: false as const, error: "Configure SUPABASE_SERVICE_ROLE_KEY no servidor para criar usuários." };
    }
    const parsed = newAdminSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false as const, error: "Confira os campos.", fieldErrors: toFieldErrors(parsed.error) };
    }

    const { data, error } = await service.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { name: parsed.data.name },
    });
    if (error || !data.user) {
      const exists = error?.message.toLowerCase().includes("already");
      return { ok: false as const, error: exists ? "Já existe um usuário com este e-mail." : "Não foi possível criar o usuário." };
    }

    const { error: adminError } = await service
      .from("admins")
      .insert({ user_id: data.user.id, name: parsed.data.name, email: parsed.data.email });
    if (adminError) return { ok: false as const, error: dbError(adminError) };

    revalidatePath("/admin/usuarios");
    return { ok: true as const, message: "Administrador criado com sucesso." };
  });
}

export async function removeAdminUser(userId: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase, session } = await requireAdmin();
    if (userId === session.userId) return { ok: false as const, error: "Você não pode remover o seu próprio acesso." };
    const { error } = await supabase.from("admins").delete().eq("user_id", userId);
    if (error) return { ok: false as const, error: dbError(error) };
    await createServiceClient()?.auth.admin.deleteUser(userId);
    revalidatePath("/admin/usuarios");
    return { ok: true as const, message: "Acesso de administrador removido." };
  });
}
