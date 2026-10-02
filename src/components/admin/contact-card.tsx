"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { ChevronDown, Mail, Phone, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
import { LeadStatusBadge } from "./badges";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { deleteContact, updateContact } from "@/lib/actions/admin";
import { LEAD_STATUS_LABEL } from "@/lib/constants";
import { formatDateTime, onlyDigits } from "@/lib/format";
import type { ActionResult, LeadStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ContactCard({
  table,
  id,
  name,
  phone,
  email,
  status,
  notes,
  createdAt,
  subtitle,
  propertyLink,
  children,
}: {
  table: "leads" | "listing_requests";
  id: string;
  name: string;
  phone: string;
  email: string;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  subtitle: ReactNode;
  propertyLink?: { href: string; label: string } | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(status === "novo");
  const [note, setNote] = useState(notes);
  const [confirm, setConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>, after?: () => void) {
    startTransition(async () => {
      const r = await action();
      if (r.ok) {
        toast.success(r.message ?? "Feito!");
        after?.();
        router.refresh();
      } else toast.error(r.error);
    });
  }

  const digits = onlyDigits(phone);
  const waNumber = digits.length <= 11 ? `55${digits}` : digits;

  return (
    <li className={cn("card overflow-hidden", status === "novo" && "border-rose-200")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-slate-50/60 sm:items-center"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-brand-950">{name}</p>
            <LeadStatusBadge status={status} />
          </div>
          <p className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</p>
        </div>
        <span className="hidden shrink-0 text-xs text-slate-400 sm:block">{formatDateTime(createdAt)}</span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="grid gap-5 border-t border-slate-100 p-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-3 text-sm">
            <p className="text-xs text-slate-400 sm:hidden">{formatDateTime(createdAt)}</p>
            <div className="flex flex-wrap gap-2">
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
                <WhatsAppIcon className="h-3.5 w-3.5" /> {phone}
              </a>
              <a href={`tel:${digits}`} className="btn btn-outline btn-sm">
                <Phone className="h-3.5 w-3.5" /> Ligar
              </a>
              {email && (
                <a href={`mailto:${email}`} className="btn btn-outline btn-sm">
                  <Mail className="h-3.5 w-3.5" /> {email}
                </a>
              )}
            </div>
            {propertyLink && (
              <p>
                <span className="text-slate-500">Imóvel: </span>
                <Link href={propertyLink.href} className="font-semibold text-brand-700 underline">
                  {propertyLink.label}
                </Link>
              </p>
            )}
            {children}
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="field-label">Status do atendimento</span>
              <select
                className="field"
                value={status}
                disabled={pending}
                onChange={(e) =>
                  run(() => updateContact(table, id, { status: e.target.value as LeadStatus }))
                }
              >
                {Object.entries(LEAD_STATUS_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="field-label">Anotações internas</span>
              <textarea
                className="field min-h-20"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex.: visita marcada para sexta às 15h"
              />
            </label>
            <div className="flex justify-between gap-2">
              <button type="button" onClick={() => setConfirm(true)} className="btn btn-ghost btn-sm text-rose-600 hover:bg-rose-50">
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </button>
              <button
                type="button"
                disabled={pending || note === notes}
                onClick={() => run(() => updateContact(table, id, { notes: note }))}
                className="btn btn-primary btn-sm"
              >
                <Save className="h-3.5 w-3.5" /> Salvar anotações
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm}
        danger
        title="Excluir este contato?"
        description={`O registro de ${name} será excluído definitivamente.`}
        confirmLabel="Excluir"
        loading={pending}
        onCancel={() => setConfirm(false)}
        onConfirm={() => run(() => deleteContact(table, id), () => setConfirm(false))}
      />
    </li>
  );
}
