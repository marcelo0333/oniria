import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

const control = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30 transition";

export function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string[] | string; hint?: string; children: ReactNode; htmlFor?: string }) {
  const err = Array.isArray(error) ? error[0] : error;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-300">{label}</label>
      {children}
      {hint && !err && <p className="text-xs text-zinc-500">{hint}</p>}
      {err && <p className="text-xs text-red-400" role="alert">{err}</p>}
    </div>
  );
}

export function Input({ label, error, hint, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string[] | string; hint?: string }) {
  const fid = id ?? props.name;
  return (
    <Field label={label} error={error} hint={hint} htmlFor={fid}>
      <input id={fid} {...props} className={control} aria-invalid={!!error} />
    </Field>
  );
}

export function Textarea({ label, error, hint, id, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string[] | string; hint?: string }) {
  const fid = id ?? props.name;
  return (
    <Field label={label} error={error} hint={hint} htmlFor={fid}>
      <textarea id={fid} {...props} className={`${control} min-h-28 resize-y`} aria-invalid={!!error} />
    </Field>
  );
}

export function SelectField({ label, error, id, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string[] | string }) {
  const fid = id ?? props.name;
  return (
    <Field label={label} error={error} htmlFor={fid}>
      <select id={fid} {...props} className={`${control} appearance-none`}>
        {children}
      </select>
    </Field>
  );
}

export function FormMessage({ state }: { state?: { message?: string; success?: boolean } }) {
  if (!state?.message) return null;
  return (
    <p role="status" className={`rounded-xl px-4 py-2.5 text-sm ${state.success ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30" : "bg-red-500/15 text-red-200 border border-red-400/30"}`}>
      {state.message}
    </p>
  );
}
