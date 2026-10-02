"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateSettings } from "@/lib/actions/admin";
import { ACCEPTED_IMAGES, publicUrl, uploadImages, validateImageFiles } from "@/lib/upload";
import { Field, TextArea } from "@/components/ui/form-field";
import type { SiteSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  async function uploadLogo(files: FileList | null) {
    if (!files?.length) return;
    const { valid, errors } = validateImageFiles([files[0]]);
    errors.forEach((m) => toast.error(m));
    if (!valid.length) return;
    setUploading(true);
    const { paths } = await uploadImages("site", valid);
    setUploading(false);
    if (!paths.length) return toast.error("Não foi possível enviar o logotipo.");
    setLogoUrl(publicUrl(paths[0]));
    toast.info("Logotipo enviado. Clique em Salvar configurações para aplicar.");
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    data.logo_url = logoUrl;
    startTransition(async () => {
      const r = await updateSettings(data);
      if (r.ok) {
        setErrors({});
        toast.success(r.message ?? "Salvo!");
        router.refresh();
      } else {
        setErrors(r.fieldErrors ?? {});
        toast.error(r.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <section className="card p-5 sm:p-6">
        <h2 className="text-base font-bold text-brand-950">Identidade</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_280px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2" label="Nome da imobiliária" name="company_name" defaultValue={settings.company_name} required error={errors.company_name} />
            <Field label="CRECI" name="creci" defaultValue={settings.creci} error={errors.creci} hint="Exibido no rodapé e na página Sobre." />
          </div>
          <div>
            <span className="field-label">Logotipo</span>
            <div className="flex h-24 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3">
              {logoUrl ? (
                <span className="relative h-full w-full">
                  <Image src={logoUrl} alt="Logotipo" fill sizes="260px" className="object-contain" />
                </span>
              ) : (
                <span className="text-xs text-slate-400">Usando o logotipo padrão</span>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <label className="btn btn-outline btn-sm flex-1 cursor-pointer">
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                Enviar logotipo
                <input
                  type="file"
                  accept={ACCEPTED_IMAGES}
                  className="sr-only"
                  onChange={(e) => {
                    uploadLogo(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              {logoUrl && (
                <button type="button" onClick={() => setLogoUrl("")} className="btn btn-outline btn-sm" aria-label="Remover logotipo">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">PNG com fundo transparente, horizontal.</p>
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-base font-bold text-brand-950">Contato</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Telefone" name="phone" defaultValue={settings.phone} placeholder="(00) 0000-0000" error={errors.phone} />
          <Field
            label="WhatsApp"
            name="whatsapp"
            defaultValue={settings.whatsapp}
            placeholder="5511999999999"
            inputMode="numeric"
            error={errors.whatsapp}
            hint="Somente números: 55 + DDD + número. Usado em todos os botões de WhatsApp do site."
          />
          <Field label="E-mail" name="email" type="email" defaultValue={settings.email} error={errors.email} />
          <Field label="Horário de atendimento" name="business_hours" defaultValue={settings.business_hours} error={errors.business_hours} />
          <Field className="sm:col-span-2" label="Endereço" name="address" defaultValue={settings.address} error={errors.address} />
          <Field label="Instagram" name="instagram" defaultValue={settings.instagram} placeholder="@toninhoimoveis ou link" error={errors.instagram} />
          <Field label="Facebook" name="facebook" defaultValue={settings.facebook} placeholder="Link da página" error={errors.facebook} />
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-base font-bold text-brand-950">Sobre nós</h2>
        <TextArea
          className="mt-5"
          label='Texto "Sobre nós"'
          name="about_text"
          rows={8}
          defaultValue={settings.about_text}
          error={errors.about_text}
          hint="Deixe uma linha em branco entre os parágrafos."
        />
      </section>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={pending || uploading}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar configurações
        </button>
      </div>
    </form>
  );
}
