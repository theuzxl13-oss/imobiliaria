import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Base = { label: string; name: string; error?: string; hint?: ReactNode; className?: string };

export function Field({
  label,
  name,
  error,
  hint,
  className,
  ...props
}: Base & InputHTMLAttributes<HTMLInputElement>) {
  const id = props.id ?? `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {props.required && <span className="text-rose-500"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn("field", error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15")}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  label,
  name,
  error,
  hint,
  className,
  ...props
}: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = props.id ?? `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {props.required && <span className="text-rose-500"> *</span>}
      </label>
      <textarea
        id={id}
        name={name}
        aria-invalid={Boolean(error) || undefined}
        className={cn("field min-h-28 resize-y", error && "border-rose-400")}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  name,
  error,
  hint,
  className,
  children,
  ...props
}: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = props.id ?? `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {props.required && <span className="text-rose-500"> *</span>}
      </label>
      <select
        id={id}
        name={name}
        aria-invalid={Boolean(error) || undefined}
        className={cn("field", error && "border-rose-400")}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

/** Campo invisível anti-spam (honeypot). */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Não preencha este campo
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
