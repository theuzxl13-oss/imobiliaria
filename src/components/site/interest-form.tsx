"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { submitLead } from "@/lib/actions/public";
import { Field, Honeypot, TextArea } from "@/components/ui/form-field";
import { useFormAction } from "@/lib/use-form-action";

export function InterestForm({
  propertyId,
  defaultMessage,
  submitLabel = "Tenho interesse",
}: {
  propertyId?: string;
  defaultMessage?: string;
  submitLabel?: string;
}) {
  const { state, pending, onSubmit } = useFormAction(submitLead);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "Mensagem enviada!");
      formRef.current?.reset();
    } else {
      toast.error(state.error);
    }
  }, [state]);

  const errors = state && !state.ok ? state.fieldErrors : undefined;

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-emerald-50 p-6 text-center" role="status">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        <p className="mt-3 font-bold text-emerald-900">Mensagem enviada!</p>
        <p className="mt-1 text-sm text-emerald-800">{state.message}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="relative space-y-3" noValidate>
      <Honeypot />
      {propertyId && <input type="hidden" name="property_id" value={propertyId} />}
      <Field label="Nome" name="name" required autoComplete="name" error={errors?.name} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field
          label="Telefone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="(00) 00000-0000"
          error={errors?.phone}
        />
        <Field label="E-mail" name="email" type="email" autoComplete="email" error={errors?.email} />
      </div>
      <TextArea
        label="Mensagem"
        name="message"
        rows={4}
        defaultValue={defaultMessage}
        error={errors?.message}
      />
      <button type="submit" className="btn btn-primary w-full py-3.5" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {pending ? "Enviando..." : submitLabel}
      </button>
      <p className="text-center text-[11px] text-slate-400">
        Seus dados serão usados apenas para retornarmos o seu contato.
      </p>
    </form>
  );
}
