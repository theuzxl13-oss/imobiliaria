"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { WhatsAppIcon } from "./whatsapp-icon";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === "function",
    () => false,
  );
  const text = `${title} — ${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      /* compartilhamento cancelado */
    }
  }

  const btn =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50";

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-950">
        <Share2 className="h-4 w-4 text-gold-500" /> Compartilhar imóvel
      </p>
      <div className="grid grid-cols-3 gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
        >
          <WhatsAppIcon className="h-4 w-4 text-whatsapp" /> WhatsApp
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#1877f2]" fill="currentColor" aria-hidden>
            <path d="M13.5 21.9v-7.4h2.5l.4-2.9h-2.9V9.8c0-.8.2-1.4 1.4-1.4h1.6V5.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.1H7.9v2.9h2.5v7.4a10 10 0 1 1 3.1 0Z" />
          </svg>
          Facebook
        </a>
        <button type="button" onClick={copy} className={btn}>
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar link"}
        </button>
      </div>
      {canShare && (
        <button
          type="button"
          onClick={nativeShare}
          className="mt-2 w-full rounded-xl py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
        >
          Mais opções de compartilhamento…
        </button>
      )}
    </div>
  );
}
