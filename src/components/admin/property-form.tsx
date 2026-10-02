"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { ImagePlus, Loader2, Save, Star, X } from "lucide-react";
import { toast } from "sonner";
import { addPropertyImages, createProperty, updateProperty } from "@/lib/actions/admin";
import { uploadImages, validateImageFiles, ACCEPTED_IMAGES } from "@/lib/upload";
import { BRAZIL_STATES, STATUS_LABEL } from "@/lib/constants";
import type { Category, Feature, PropertyDetail, PropertyStatus, Purpose } from "@/lib/types";
import { cn } from "@/lib/cn";

type FormState = {
  code: string;
  title: string;
  description: string;
  purpose: Purpose | "";
  category_id: string;
  status: PropertyStatus;
  is_published: boolean;
  is_featured: boolean;
  is_offer: boolean;
  price: string;
  promo_price: string;
  zip_code: string;
  state: string;
  city: string;
  neighborhood: string;
  address: string;
  address_number: string;
  complement: string;
  show_address: boolean;
  bedrooms: string;
  suites: string;
  bathrooms: string;
  parking_spots: string;
  total_area: string;
  built_area: string;
  condo_fee: string;
  iptu: string;
  feature_ids: string[];
};

const moneyFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

function money(value: number | null | undefined) {
  return value === null || value === undefined ? "" : moneyFormat.format(Number(value));
}

function initialState(p?: PropertyDetail): FormState {
  return {
    code: p?.code ?? "",
    title: p?.title ?? "",
    description: p?.description ?? "",
    purpose: p?.purpose ?? "",
    category_id: p?.category_id ?? "",
    status: p?.status ?? "disponivel",
    is_published: p?.is_published ?? true,
    is_featured: p?.is_featured ?? false,
    is_offer: p?.is_offer ?? false,
    price: money(p?.price),
    promo_price: money(p?.promo_price),
    zip_code: p?.zip_code ?? "",
    state: p?.state ?? "",
    city: p?.city ?? "",
    neighborhood: p?.neighborhood ?? "",
    address: p?.address ?? "",
    address_number: p?.address_number ?? "",
    complement: p?.complement ?? "",
    show_address: p?.show_address ?? false,
    bedrooms: String(p?.bedrooms ?? 0),
    suites: String(p?.suites ?? 0),
    bathrooms: String(p?.bathrooms ?? 0),
    parking_spots: String(p?.parking_spots ?? 0),
    total_area: money(p?.total_area),
    built_area: money(p?.built_area),
    condo_fee: money(p?.condo_fee),
    iptu: money(p?.iptu),
    feature_ids: p?.features.map((f) => f.id) ?? [],
  };
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-base font-bold text-brand-950">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-brand-700" : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked && "translate-x-5",
          )}
        />
      </button>
      <span>
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        {description && <span className="block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
}

export function PropertyForm({
  property,
  categories,
  features,
}: {
  property?: PropertyDetail;
  categories: Category[];
  features: Feature[];
}) {
  const router = useRouter();
  const isEdit = Boolean(property);
  const [form, setForm] = useState<FormState>(() => initialState(property));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const input = (key: keyof FormState) => ({
    id: `p-${key}`,
    name: key,
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      set(key, e.target.value as never),
    "aria-invalid": Boolean(errors[key]) || undefined,
    className: cn("field", errors[key] && "border-rose-400"),
  });

  const label = (key: keyof FormState, text: string, required = false) => (
    <label htmlFor={`p-${key}`} className="field-label">
      {text}
      {required && <span className="text-rose-500"> *</span>}
    </label>
  );

  const err = (key: string) => (errors[key] ? <p className="field-error">{errors[key]}</p> : null);

  async function lookupCep() {
    const cep = form.zip_code.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) return;
      setForm((f) => ({
        ...f,
        zip_code: `${cep.slice(0, 5)}-${cep.slice(5)}`,
        state: data.uf || f.state,
        city: data.localidade || f.city,
        neighborhood: data.bairro || f.neighborhood,
        address: data.logradouro || f.address,
      }));
    } catch {
      /* sem internet ou CEP inválido: preenchimento manual */
    }
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const { valid, errors: fileErrors } = validateImageFiles([...list]);
    fileErrors.forEach((m) => toast.error(m));
    setFiles((f) => [...f, ...valid]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    startTransition(async () => {
      const payload = { ...form, purpose: form.purpose || undefined } as never;

      if (isEdit && property) {
        const result = await updateProperty(property.id, payload);
        if (!result.ok) {
          setErrors(result.fieldErrors ?? {});
          toast.error(result.error);
          return;
        }
        toast.success(result.message ?? "Salvo!");
        router.refresh();
        return;
      }

      const result = await createProperty(payload);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }

      const { id } = result.data;
      if (files.length > 0) {
        setProgress(`Enviando fotos (0/${files.length})...`);
        const { paths, failed } = await uploadImages(`properties/${id}`, files, (done, total) =>
          setProgress(`Enviando fotos (${done}/${total})...`),
        );
        if (paths.length) {
          const reg = await addPropertyImages(id, paths);
          if (!reg.ok) toast.error(reg.error);
        }
        if (failed.length) toast.error(`Falha ao enviar: ${failed.join(", ")}`);
        setProgress(null);
      }
      toast.success(result.message ?? "Imóvel cadastrado!");
      router.push(`/admin/imoveis/${id}/editar?novo=1`);
    });
  }

  const firstError = Object.entries(errors).find(([, v]) => v);

  return (
    <form onSubmit={submit} noValidate className="space-y-6 pb-24">
      <Section title="Informações principais">
        <div className="grid gap-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            {label("code", "Código do imóvel")}
            <input {...input("code")} placeholder={isEdit ? "" : "Automático"} maxLength={20} />
            {errors.code ? err("code") : !isEdit && <p className="mt-1 text-xs text-slate-500">Deixe vazio para gerar automaticamente.</p>}
          </div>
          <div className="sm:col-span-4">
            {label("title", "Título", true)}
            <input {...input("title")} placeholder="Ex.: Casa com 3 quartos e piscina no Centro" maxLength={160} />
            {err("title")}
          </div>
          <div className="sm:col-span-2">
            {label("purpose", "Finalidade", true)}
            <select {...input("purpose")}>
              <option value="">Selecione</option>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>
            {err("purpose")}
          </div>
          <div className="sm:col-span-2">
            {label("category_id", "Categoria")}
            <select {...input("category_id")}>
              <option value="">Selecione</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {err("category_id")}
          </div>
          <div className="sm:col-span-2">
            {label("status", "Status")}
            <select {...input("status")}>
              {Object.entries(STATUS_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-6">
            {label("description", "Descrição")}
            <textarea {...input("description")} rows={7} placeholder="Descreva o imóvel, diferenciais, estado de conservação, proximidades..." />
            {err("description")}
          </div>
        </div>
      </Section>

      <Section title="Valores" description="Use valores em reais. Ex.: 650.000 ou 2.200,00">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            {label("price", form.purpose === "aluguel" ? "Aluguel mensal (R$)" : "Preço (R$)", true)}
            <input {...input("price")} inputMode="decimal" />
            {err("price")}
          </div>
          <div>
            {label("promo_price", "Preço promocional (R$)")}
            <input {...input("promo_price")} inputMode="decimal" placeholder="Opcional" />
            {err("promo_price")}
          </div>
          <div>
            {label("condo_fee", "Condomínio (R$/mês)")}
            <input {...input("condo_fee")} inputMode="decimal" placeholder="Quando existir" />
            {err("condo_fee")}
          </div>
          <div>
            {label("iptu", "IPTU (R$/ano)")}
            <input {...input("iptu")} inputMode="decimal" />
            {err("iptu")}
          </div>
        </div>
        <div className="mt-4">
          <Toggle
            checked={form.is_offer}
            onChange={(v) => set("is_offer", v)}
            label="Imóvel em oferta"
            description="Exibe DE (preço normal) / POR (preço promocional) e inclui o imóvel na página Ofertas."
          />
        </div>
      </Section>

      <Section title="Localização">
        <div className="grid gap-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            {label("zip_code", "CEP")}
            <input {...input("zip_code")} onBlur={lookupCep} inputMode="numeric" placeholder="00000-000" maxLength={9} />
            <p className="mt-1 text-xs text-slate-500">Preenche o endereço automaticamente.</p>
          </div>
          <div className="sm:col-span-1">
            {label("state", "Estado")}
            <select {...input("state")}>
              <option value="">UF</option>
              {BRAZIL_STATES.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            {label("city", "Cidade", true)}
            <input {...input("city")} />
            {err("city")}
          </div>
          <div className="sm:col-span-2">
            {label("neighborhood", "Bairro")}
            <input {...input("neighborhood")} />
          </div>
          <div className="sm:col-span-3">
            {label("address", "Endereço")}
            <input {...input("address")} placeholder="Rua, avenida..." />
          </div>
          <div className="sm:col-span-1">
            {label("address_number", "Número")}
            <input {...input("address_number")} />
          </div>
          <div className="sm:col-span-3">
            {label("complement", "Complemento")}
            <input {...input("complement")} placeholder="Apto, bloco, lote..." />
          </div>
          <div className="sm:col-span-3 sm:pt-6">
            <Toggle
              checked={form.show_address}
              onChange={(v) => set("show_address", v)}
              label="Mostrar endereço completo no site"
              description="Desligado: o site mostra apenas bairro e cidade."
            />
          </div>
        </div>
      </Section>

      <Section title="Detalhes">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ["bedrooms", "Dormitórios"],
              ["suites", "Suítes"],
              ["bathrooms", "Banheiros"],
              ["parking_spots", "Vagas"],
            ] as const
          ).map(([key, text]) => (
            <div key={key}>
              {label(key, text)}
              <input {...input(key)} type="number" min={0} max={999} inputMode="numeric" />
              {err(key)}
            </div>
          ))}
          <div>
            {label("built_area", "Área construída (m²)")}
            <input {...input("built_area")} inputMode="decimal" />
            {err("built_area")}
          </div>
          <div>
            {label("total_area", "Área total (m²)")}
            <input {...input("total_area")} inputMode="decimal" />
            {err("total_area")}
          </div>
        </div>
      </Section>

      <Section title="Características" description="Gerencie a lista em Características e categorias.">
        {features.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma característica cadastrada.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {features.map((f) => {
              const checked = form.feature_ids.includes(f.id);
              return (
                <label
                  key={f.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition",
                    checked ? "border-brand-300 bg-brand-50 font-semibold text-brand-900" : "border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brand-700"
                    checked={checked}
                    onChange={() =>
                      set(
                        "feature_ids",
                        checked ? form.feature_ids.filter((id) => id !== f.id) : [...form.feature_ids, f.id],
                      )
                    }
                  />
                  {f.name}
                </label>
              );
            })}
          </div>
        )}
      </Section>

      {!isEdit && (
        <Section title="Fotos" description="A primeira foto será a foto principal. Depois de salvar você pode reordenar, trocar a principal e adicionar mais fotos.">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-brand-400 hover:bg-brand-50/40">
            <ImagePlus className="h-8 w-8 text-brand-500" />
            <span className="text-sm font-semibold text-brand-900">Clique para selecionar as fotos</span>
            <span className="text-xs text-slate-500">JPG, PNG ou WebP · várias de uma vez · até 15 MB cada</span>
            <input
              type="file"
              accept={ACCEPTED_IMAGES}
              multiple
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          {files.length > 0 && (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {files.map((file, i) => (
                <li key={`${file.name}-${i}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                  <Image src={previews[i]} alt={file.name} fill unoptimized className="object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-md bg-gold-400 px-1.5 py-0.5 text-[10px] font-bold text-brand-950">
                      <Star className="h-3 w-3" /> Principal
                    </span>
                  )}
                  <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1">
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => setFiles((f) => [f[i], ...f.filter((_, j) => j !== i)])}
                        className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-slate-700"
                      >
                        Tornar principal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setFiles((f) => f.filter((_, j) => j !== i))}
                      className="ml-auto rounded-md bg-rose-600 p-1 text-white"
                      aria-label={`Remover ${file.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      <Section title="Publicação">
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle
            checked={form.is_published}
            onChange={(v) => set("is_published", v)}
            label="Publicado no site"
            description="Desligado: o imóvel fica apenas no painel (ex.: vendido/alugado que não deve aparecer)."
          />
          <Toggle
            checked={form.is_featured}
            onChange={(v) => set("is_featured", v)}
            label="Imóvel em destaque"
            description="Aparece na seção Imóveis em destaque da página inicial."
          />
        </div>
      </Section>

      {/* Barra fixa de salvar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur lg:left-72">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <p className="truncate text-sm text-slate-500">
            {progress ?? (firstError ? <span className="text-rose-600">{firstError[1]}</span> : isEdit ? "Edite e salve as alterações." : "Preencha os dados e salve.")}
          </p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => router.back()} className="btn btn-outline hidden sm:inline-flex" disabled={pending}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar imóvel"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
