"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
import { deleteTaxonomy, saveTaxonomy } from "@/lib/actions/admin";
import type { ActionResult } from "@/lib/types";

type Item = { id: string; name: string; sort_order: number };

export function TaxonomyManager({
  table,
  title,
  description,
  items,
  deleteWarning,
}: {
  table: "features" | "categories";
  title: string;
  description: string;
  items: Item[];
  deleteWarning: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [toDelete, setToDelete] = useState<Item | null>(null);

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

  function add(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const nextOrder = Math.max(0, ...items.map((i) => i.sort_order)) + 1;
    run(() => saveTaxonomy(table, { name: newName, sort_order: nextOrder }), () => setNewName(""));
  }

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-base font-bold text-brand-950">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>

      <form onSubmit={add} className="mt-4 flex gap-2">
        <input
          className="field"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome"
          maxLength={60}
          aria-label={`Novo item em ${title}`}
        />
        <button type="submit" className="btn btn-primary shrink-0" disabled={pending || !newName.trim()}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Adicionar
        </button>
      </form>

      <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 px-3 py-2">
            {editing?.id === item.id ? (
              <form
                className="flex flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(
                    () => saveTaxonomy(table, { id: item.id, name: editing.name, sort_order: item.sort_order }),
                    () => setEditing(null),
                  );
                }}
              >
                <input
                  className="field py-1.5"
                  value={editing.name}
                  onChange={(e) => setEditing({ id: item.id, name: e.target.value })}
                  autoFocus
                  maxLength={60}
                  aria-label="Nome"
                />
                <button type="submit" className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" aria-label="Salvar" disabled={pending}>
                  <Check className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Cancelar">
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium text-slate-800">{item.name}</span>
                <button
                  type="button"
                  onClick={() => setEditing({ id: item.id, name: item.name })}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label={`Editar ${item.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(item)}
                  className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                  aria-label={`Excluir ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </li>
        ))}
        {items.length === 0 && <li className="px-3 py-4 text-sm text-slate-500">Nenhum item cadastrado.</li>}
      </ul>

      <ConfirmDialog
        open={Boolean(toDelete)}
        danger
        title={`Excluir "${toDelete?.name}"?`}
        description={deleteWarning}
        confirmLabel="Excluir"
        loading={pending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && run(() => deleteTaxonomy(table, toDelete.id), () => setToDelete(null))}
      />
    </section>
  );
}
