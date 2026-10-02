import "server-only";
import { createClient } from "@/lib/supabase/server";
import { toDetail } from "@/lib/queries";
import type { Category, Feature, StatusHistoryEntry } from "@/lib/types";

/** Consultas do painel (com a sessão do administrador: enxergam tudo). */

export async function getAdminTaxonomies() {
  const supabase = await createClient();
  const [categories, features] = await Promise.all([
    supabase.from("categories").select("id, name, slug, sort_order").order("sort_order").order("name"),
    supabase.from("features").select("id, name, sort_order").order("sort_order").order("name"),
  ]);
  return {
    categories: (categories.data ?? []) as Category[],
    features: (features.data ?? []) as Feature[],
  };
}

export async function getAdminProperty(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select(
      "*, category:categories(id, name, slug), images:property_images(*), property_features(feature:features(id, name, sort_order))",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const detail = toDetail(data);
  detail.images.sort((a, b) => a.position - b.position);
  return detail;
}

export async function getStatusHistory(propertyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("property_status_history")
    .select("id, old_status, new_status, changed_at")
    .eq("property_id", propertyId)
    .order("changed_at", { ascending: false })
    .limit(20);
  return (data ?? []) as StatusHistoryEntry[];
}
