"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Images, X } from "lucide-react";
import { SafeImage } from "./safe-image";
import { cn } from "@/lib/cn";

type Photo = { id: string; url: string };

export function Gallery({ photos, title }: { photos: Photo[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStart = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const total = photos.length;

  const go = useCallback(
    (delta: number) => setIndex((i) => (total ? (i + delta + total) % total : 0)),
    [total],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, go]);

  useEffect(() => {
    const thumb = thumbsRef.current?.children[index] as HTMLElement | undefined;
    thumb?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touchStart.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchStart.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStart.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touchStart.current = null;
    },
  };

  if (total === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100">
        <SafeImage src={null} alt={title} fill className="object-cover" />
      </div>
    );
  }

  const current = photos[index];

  return (
    <div>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-900" {...swipe}>
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute inset-0 cursor-zoom-in"
          aria-label="Ampliar foto"
        >
          <SafeImage
            key={current.id}
            src={current.url}
            alt={`${title} — foto ${index + 1} de ${total}`}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover"
          />
        </button>
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto anterior"
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-800 shadow-lg transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Próxima foto"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-800 shadow-lg transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        <div className="pointer-events-none absolute right-3 bottom-3 flex gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <Images className="h-3.5 w-3.5" /> {index + 1}/{total}
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <Expand className="h-3.5 w-3.5" /> Ampliar
          </span>
        </div>
      </div>

      {total > 1 && (
        <div ref={thumbsRef} className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition sm:w-28",
                i === index ? "ring-gold-400" : "opacity-70 ring-transparent hover:opacity-100",
              )}
            >
              <SafeImage src={p.url} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de fotos ampliada"
        >
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm font-semibold">
              {index + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              aria-label="Fechar galeria"
              autoFocus
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="relative flex-1" {...swipe}>
            <SafeImage
              key={`lb-${current.id}`}
              src={current.url}
              alt={`${title} — foto ${index + 1}`}
              fill
              sizes="100vw"
              quality={85}
              className="object-contain"
            />
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Foto anterior"
                  className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 sm:left-6"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Próxima foto"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 sm:right-6"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}
          </div>
          {total > 1 && (
            <div className="scrollbar-none flex justify-center gap-2 overflow-x-auto p-4">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  className={cn(
                    "relative h-14 w-20 shrink-0 overflow-hidden rounded-md ring-2",
                    i === index ? "ring-gold-400" : "opacity-50 ring-transparent hover:opacity-100",
                  )}
                >
                  <SafeImage src={p.url} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
