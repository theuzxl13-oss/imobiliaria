"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-site flex flex-col items-center py-20 text-center">
      <div className="rounded-2xl bg-amber-50 p-4 text-amber-600">
        <TriangleAlert className="h-8 w-8" />
      </div>
      <h1 className="mt-4 text-2xl font-extrabold text-brand-950">Algo não saiu como esperado</h1>
      <p className="mt-2 max-w-md text-slate-500">
        Não conseguimos carregar esta página agora. Verifique sua conexão e tente novamente.
      </p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6">
        <RefreshCw className="h-4 w-4" /> Tentar novamente
      </button>
    </div>
  );
}
