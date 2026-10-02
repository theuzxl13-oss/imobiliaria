"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card flex flex-col items-center p-10 text-center">
      <TriangleAlert className="h-10 w-10 text-amber-500" />
      <h1 className="mt-3 text-xl font-bold text-brand-950">Não foi possível carregar esta tela</h1>
      <p className="mt-1 text-sm text-slate-500">Verifique sua conexão e tente novamente.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-5">
        <RefreshCw className="h-4 w-4" /> Tentar novamente
      </button>
    </div>
  );
}
