"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { ActionResult } from "./types";

/**
 * useActionState sem o reset automático do formulário do React 19:
 * em caso de erro de validação, o visitante não perde o que digitou.
 */
export function useFormAction(action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>) {
  const [state, dispatch, pending] = useActionState<ActionResult | null, FormData>(action, null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  }

  return { state, pending, onSubmit };
}
