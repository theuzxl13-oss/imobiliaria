"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Maximize2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
import { SafeImage } from "@/components/site/safe-image";
import { addPropertyImages, deleteImage, reorderImages, setCoverImage } from "@/lib/actions/admin";
import { ACCEPTED_IMAGES, uploadImages, validateImageFiles } from "@/lib/upload";
import type { ActionResult, PropertyImage } from "@/lib/types";
import { cn } from "@/lib/cn";

export function PhotoManager({ propertyId, images }: { propertyId: string; images: PropertyImage[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<PropertyImage | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [order, setOrder] = useState<string[] | null>(null);

  // Ordem exibida: capa primeiro, depois a posição definida.
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const list = order
    ? order.map((id) => sorted.find((i) => i.id === id)).filter((i): i is PropertyImage => Boolean(i))
    : sorted;

  function run(action: () => Promise<ActionResult>, after?: () => void) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message ?? "Feito!");
        after?.();
      } else {
        toast.error(result.error);
      }
      setOrder(null);
      router.refresh();
    });
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const ids = list.map((i) => i.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setOrder(ids);
    run(() => reorderImages(propertyId, ids));
  }

  async function upload(fileList: FileList | File[] | null) {
    if (!fileList) return;
    const { valid, errors } = validateImageFiles([...fileList]);
    errors.forEach((m) => toast.error(m));
    if (!valid.length) return;

    setUploading(`Enviando 0/${valid.length}...`);
    const { paths, failed } = await uploadImages(`properties/${propertyId}`, valid, (d, t) =>
      setUploading(`Enviando ${d}/${t}...`),
    );
    if (failed.length) toast.error(`Falha ao enviar: ${failed.join(", ")}`);
    if (paths.length) {
      const result = await addPropertyImages(propertyId, paths);
      if (result.ok) toast.success(result.message ?? "Fotos adicionadas!");
      else toast.error(result.error);
    }
    setUploading(null);
    router.refresh();
  }

  const busy = pending || Boolean(uploading);

  return (
    <section className="card p-5 sm:p-6" id="fotos">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-brand-950">Fotos ({images.length})</h2>
          <p className="text-sm text-slate-500">
            As alterações aparecem no site imediatamente. Use as setas para ordenar e a estrela para definir a foto principal.
          </p>
        </div>
        {busy && (
          <span className="flex items-center gap-2 text-sm font-semibold text-brand-700">
            <Loader2 className="h-4 w-4 animate-spin" /> {uploading ?? "Salvando..."}
          </span>
        )}
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!busy) upload(e.dataTransfer.files);
        }}
        className={cn(
          "mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition",
          dragOver ? "border-brand-500 bg-brand-50" : "border-slate-300 hover:border-brand-400 hover:bg-brand-50/40",
          busy && "pointer-events-none opacity-60",
        )}
      >
        <ImagePlus className="h-7 w-7 text-brand-500" />
        <span className="text-sm font-semibold text-brand-900">Adicionar fotos</span>
        <span className="text-xs text-slate-500">Clique ou arraste as imagens aqui · JPG, PNG ou WebP</span>
        <input
          type="file"
          accept={ACCEPTED_IMAGES}
          multiple
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            upload(e.target.files ? [...e.target.files] : null);
            e.target.value = "";
          }}
        />
      </label>

      {list.length === 0 ? (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Este imóvel ainda não tem fotos. Imóveis com fotos recebem muito mais contatos!
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((img, i) => (
            <li
              key={img.id}
              className={cn(
                "overflow-hidden rounded-xl border bg-white",
                img.is_cover ? "border-gold-400 ring-2 ring-gold-300" : "border-slate-200",
              )}
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                <SafeImage src={img.url} alt={`Foto ${i + 1}`} fill sizes="240px" className="object-cover" />
                <span className="absolute top-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                {img.is_cover && (
                  <span className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-md bg-gold-400 px-1.5 py-0.5 text-[10px] font-bold text-brand-950">
                    <Star className="h-3 w-3 fill-current" /> Principal
                  </span>
                )}
                <a
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-1.5 bottom-1.5 rounded-md bg-white/90 p-1 text-slate-700"
                  aria-label="Ver foto em tamanho real"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={busy || i === 0}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    aria-label="Mover para a esquerda"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={busy || i === list.length - 1}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    aria-label="Mover para a direita"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex">
                  {!img.is_cover && (
                    <button
                      type="button"
                      onClick={() => run(() => setCoverImage(img.id))}
                      disabled={busy}
                      className="rounded-md p-1.5 text-gold-600 hover:bg-gold-50"
                      title="Definir como foto principal"
                      aria-label="Definir como foto principal"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setToDelete(img)}
                    disabled={busy}
                    className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                    aria-label="Excluir foto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        danger
        title="Excluir esta foto?"
        description="A foto será removida do imóvel e do armazenamento. Esta ação não pode ser desfeita."
        confirmLabel="Excluir foto"
        loading={pending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && run(() => deleteImage(toDelete.id), () => setToDelete(null))}
      />
    </section>
  );
}
