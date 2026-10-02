import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SETTINGS } from "@/lib/queries";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (
    <>
      <PageHeader
        title="Configurações da imobiliária"
        description="Estas informações aparecem automaticamente no site (topo, rodapé, contato, WhatsApp e Sobre nós)."
      />
      <SettingsForm settings={{ ...DEFAULT_SETTINGS, ...(data ?? {}) }} />
    </>
  );
}
