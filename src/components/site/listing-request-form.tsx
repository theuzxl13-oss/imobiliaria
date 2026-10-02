"use client";

import { useEffect } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { submitListingRequest } from "@/lib/actions/public";
import { Field, Honeypot, Select, TextArea } from "@/components/ui/form-field";
import { useFormAction } from "@/lib/use-form-action";

export function ListingRequestForm({ categories }: { categories: string[] }) {
  const { state, pending, onSubmit } = useFormAction(submitListingRequest);

  useEffect(() => {
    if (state?.ok) toast.success(state.message ?? "Solicitação enviada!");
    else if (state && !state.ok) toast.error(state.error);
  }, [state]);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-emerald-50 p-8 text-center" role="status">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        <p className="mt-3 text-lg font-bold text-emerald-900">Solicitação enviada!</p>
        <p className="mt-1 text-sm text-emerald-800">{state.message}</p>
      </div>
    );
  }

  const errors = state && !state.ok ? state.fieldErrors : undefined;
  const types = categories.length ? categories : ["Casa", "Apartamento", "Terreno", "Comercial", "Outros"];

  return (
    <form onSubmit={onSubmit} className="relative grid gap-4 sm:grid-cols-2" noValidate>
      <Honeypot />
      <Field className="sm:col-span-2" label="Nome" name="name" required autoComplete="name" error={errors?.name} />
      <Field label="Telefone / WhatsApp" name="phone" type="tel" required autoComplete="tel" placeholder="(00) 00000-0000" error={errors?.phone} />
      <Field label="E-mail" name="email" type="email" autoComplete="email" error={errors?.email} />
      <Select label="Tipo de imóvel" name="property_type" required defaultValue="" error={errors?.property_type}>
        <option value="" disabled>Selecione</option>
        {types.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </Select>
      <Select label="Venda ou aluguel" name="purpose" required defaultValue="" error={errors?.purpose}>
        <option value="" disabled>Selecione</option>
        <option value="venda">Venda</option>
        <option value="aluguel">Aluguel</option>
      </Select>
      <Field label="Cidade" name="city" required error={errors?.city} />
      <Field label="Bairro" name="neighborhood" error={errors?.neighborhood} />
      <Field
        className="sm:col-span-2"
        label="Valor aproximado (R$)"
        name="approximate_value"
        inputMode="decimal"
        placeholder="Ex.: 350.000"
        error={errors?.approximate_value}
      />
      <TextArea
        className="sm:col-span-2"
        label="Descrição"
        name="description"
        rows={5}
        placeholder="Conte um pouco sobre o imóvel: quartos, área, diferenciais, estado de conservação..."
        error={errors?.description}
      />
      <button type="submit" className="btn btn-primary py-3.5 sm:col-span-2" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {pending ? "Enviando..." : "Enviar para avaliação"}
      </button>
    </form>
  );
}
