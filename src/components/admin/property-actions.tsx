"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Handshake,
  KeyRound,
  MoreVertical,
  Pencil,
  Star,
  StarOff,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
import { deleteProperty, quickUpdateProperty } from "@/lib/actions/admin";
import { formatCurrency, propertyPath } from "@/lib/format";
import { parseMoney } from "@/lib/validation";
import type { ActionResult, PropertyListItem } from "@/lib/types";
import { cn } from "@/lib/cn";

export function PropertyActions({ property }: { property: PropertyListItem }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<null | "delete" | "offer">(null);
  const [promo, setPromo] = useState("");
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function run(action: () => Promise<ActionResult>, after?: () => void) {
    setMenuOpen(false);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message ?? "Feito!");
        after?.();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const item =
    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50";

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/imoveis/${property.id}/editar`}
        className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
        title="Editar"
        aria-label={`Editar imóvel ${property.code}`}
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className={cn("rounded-lg p-2 text-slate-500 hover:bg-slate-100", pending && "animate-pulse")}
          aria-label={`Mais ações do imóvel ${property.code}`}
          aria-expanded={menuOpen}
          disabled={pending}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
            <Link href={`/admin/imoveis/${property.id}/editar`} className={item}>
              <Pencil className="h-4 w-4" /> Editar
            </Link>
            <a href={propertyPath(property)} target="_blank" rel="noopener noreferrer" className={item}>
              <Eye className="h-4 w-4" /> Visualizar no site
            </a>
            <div className="my-1 border-t border-slate-100" />
            <button
              type="button"
              className={item}
              onClick={() => run(() => quickUpdateProperty(property.id, { type: "featured", value: !property.is_featured }))}
            >
              {property.is_featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4 text-gold-500" />}
              {property.is_featured ? "Remover destaque" : "Destacar"}
            </button>
            {property.is_offer ? (
              <button
                type="button"
                className={item}
                onClick={() => run(() => quickUpdateProperty(property.id, { type: "offer", promoPrice: null }))}
              >
                <Tag className="h-4 w-4" /> Remover oferta
              </button>
            ) : (
              <button
                type="button"
                className={item}
                onClick={() => {
                  setMenuOpen(false);
                  setPromo("");
                  setDialog("offer");
                }}
              >
                <Tag className="h-4 w-4 text-rose-500" /> Criar oferta
              </button>
            )}
            <div className="my-1 border-t border-slate-100" />
            {property.status !== "disponivel" && (
              <button
                type="button"
                className={item}
                onClick={() => run(() => quickUpdateProperty(property.id, { type: "status", value: "disponivel" }))}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Marcar disponível
              </button>
            )}
            {property.status !== "vendido" && (
              <button
                type="button"
                className={item}
                onClick={() => run(() => quickUpdateProperty(property.id, { type: "status", value: "vendido" }))}
              >
                <Handshake className="h-4 w-4" /> Marcar vendido
              </button>
            )}
            {property.status !== "alugado" && (
              <button
                type="button"
                className={item}
                onClick={() => run(() => quickUpdateProperty(property.id, { type: "status", value: "alugado" }))}
              >
                <KeyRound className="h-4 w-4" /> Marcar alugado
              </button>
            )}
            <button
              type="button"
              className={item}
              onClick={() =>
                run(() => quickUpdateProperty(property.id, { type: "published", value: !property.is_published }))
              }
            >
              {property.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {property.is_published ? "Desativar (ocultar do site)" : "Publicar no site"}
            </button>
            <div className="my-1 border-t border-slate-100" />
            <button
              type="button"
              className={cn(item, "text-rose-600 hover:bg-rose-50")}
              onClick={() => {
                setMenuOpen(false);
                setDialog("delete");
              }}
            >
              <Trash2 className="h-4 w-4" /> Excluir
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={dialog === "delete"}
        danger
        title={`Excluir o imóvel #${property.code}?`}
        description={
          <>
            <strong>{property.title}</strong> e todas as suas fotos serão excluídos definitivamente. Esta ação não
            pode ser desfeita. Se quiser apenas manter o histórico, use <em>Desativar</em> ou marque como vendido/alugado.
          </>
        }
        confirmLabel="Excluir definitivamente"
        loading={pending}
        onCancel={() => setDialog(null)}
        onConfirm={() => run(() => deleteProperty(property.id), () => setDialog(null))}
      />

      <ConfirmDialog
        open={dialog === "offer"}
        title={`Criar oferta para #${property.code}`}
        description={
          <>
            Preço normal: <strong>{formatCurrency(property.price)}</strong>. Informe o preço promocional — o site
            exibirá <em>DE / POR</em>.
          </>
        }
        confirmLabel="Criar oferta"
        loading={pending}
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          const value = parseMoney(promo);
          if (value === null || Number.isNaN(value)) {
            toast.error("Informe um preço promocional válido.");
            return;
          }
          run(() => quickUpdateProperty(property.id, { type: "offer", promoPrice: value }), () => setDialog(null));
        }}
      >
        <label className="mt-4 block">
          <span className="field-label">Preço promocional (R$)</span>
          <input
            className="field"
            inputMode="decimal"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder="Ex.: 590.000"
            autoFocus
          />
        </label>
      </ConfirmDialog>
    </div>
  );
}
