"use client";

import { RiArrowDownSLine, RiErrorWarningLine } from "@remixicon/react";
import { useId, useState } from "react";
import { fieldClass } from "@/components/ui/field-class";
import { cn } from "@/utils/cn";

export { fieldClass };

type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Why the browser finds a field invalid, in words: "Email is required.", "Enter a valid email address." */
function describeProblem(field: FieldElement, label: string) {
  const name = label.replace(/\s*\(optional\)\s*/i, "").trim();
  const { validity } = field;
  if (validity.valueMissing) return `${name} is required.`;
  if (validity.typeMismatch && field.type === "email") return "Enter a valid email address.";
  if (validity.tooShort && field instanceof HTMLInputElement) return `Use at least ${field.minLength} characters.`;
  return field.validationMessage;
}

/**
 * The browser's own checks (required, type="email"…), shown under the field instead of in its bubble.
 * On submit every invalid field says what's wrong, the first takes focus, and typing clears it.
 */
export function useFieldProblem(label: string) {
  const [problem, setProblem] = useState("");
  return {
    problem,
    onInvalid: (event: React.FormEvent<FieldElement>) => {
      event.preventDefault();
      const field = event.currentTarget;
      setProblem(describeProblem(field, label));
      // Each invalid field hears about the submit; only the first in the form takes focus
      const form = field.form;
      if (form?.dataset.invalidFocus) return;
      if (form) {
        form.dataset.invalidFocus = "1";
        queueMicrotask(() => delete form.dataset.invalidFocus);
      }
      field.focus();
    },
    onInput: () => setProblem(""),
  };
}

export interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: (id: string, describedBy?: string) => React.ReactNode;
}

export function FieldShell({ label, error, hint, className, children }: FieldShellProps) {
  const id = useId();
  // The last error stays in place while its line closes, so the text doesn't vanish first
  const [shownError, setShownError] = useState(error ?? "");
  if (error && error !== shownError) setShownError(error);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={id} className="text-caption font-medium text-ink">
        {label}
      </label>
      {children(id, describedBy)}
      {hint && !error && (
        <p id={`${id}-hint`} className="px-1 text-caption text-muted">
          {hint}
        </p>
      )}
      {/* The error opens beneath the field, and folds away once it's put right */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin] duration-500 ease-out-expo",
          error ? "grid-rows-[1fr] opacity-100" : "-mt-2 grid-rows-[0fr] opacity-0",
        )}
      >
        <p id={`${id}-error`} className="flex min-h-0 items-start gap-1.5 overflow-hidden px-1 text-caption text-sale">
          <RiErrorWarningLine aria-hidden="true" className="mt-0.75 size-3.5 shrink-0" />
          {shownError}
        </p>
      </div>
    </div>
  );
}

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string };

export function TextField({ label, error, hint, className, onInvalid, onInput, ...props }: TextFieldProps) {
  const field = useFieldProblem(label);
  const shown = error || field.problem;
  return (
    <FieldShell label={label} error={shown} hint={hint} className={className}>
      {(id, describedBy) => (
        <input
          id={id}
          aria-invalid={Boolean(shown) || undefined}
          aria-describedby={describedBy}
          className={fieldClass}
          {...props}
          onInvalid={(event) => {
            field.onInvalid(event);
            onInvalid?.(event);
          }}
          onInput={(event) => {
            field.onInput();
            onInput?.(event);
          }}
        />
      )}
    </FieldShell>
  );
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string };

export function TextArea({ label, error, className, onInvalid, onInput, ...props }: TextAreaProps) {
  const field = useFieldProblem(label);
  const shown = error || field.problem;
  return (
    <FieldShell label={label} error={shown} className={className}>
      {(id, describedBy) => (
        <textarea
          id={id}
          rows={5}
          aria-invalid={Boolean(shown) || undefined}
          aria-describedby={describedBy}
          className={cn(fieldClass, "h-auto resize-y py-3")}
          {...props}
          onInvalid={(event) => {
            field.onInvalid(event);
            onInvalid?.(event);
          }}
          onInput={(event) => {
            field.onInput();
            onInput?.(event);
          }}
        />
      )}
    </FieldShell>
  );
}

type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
};

export function SelectField({ label, error, options, className, onInvalid, onInput, ...props }: SelectFieldProps) {
  const field = useFieldProblem(label);
  const shown = error || field.problem;
  return (
    <FieldShell label={label} error={shown} className={className}>
      {(id, describedBy) => (
        <div className="relative">
          <select
            id={id}
            aria-invalid={Boolean(shown) || undefined}
            aria-describedby={describedBy}
            className={cn(fieldClass, "cursor-pointer appearance-none pr-11")}
            {...props}
            onInvalid={(event) => {
              field.onInvalid(event);
              onInvalid?.(event);
            }}
            onInput={(event) => {
              field.onInput();
              onInput?.(event);
            }}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <RiArrowDownSLine
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted"
          />
        </div>
      )}
    </FieldShell>
  );
}

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { label: React.ReactNode };

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-3 text-caption text-ink", className)}>
      <input type="checkbox" className="size-4.5 shrink-0 cursor-pointer rounded accent-accent" {...props} />
      <span>{label}</span>
    </label>
  );
}

/** Form-level error under the fields ("Incorrect email or password.") */
export function FormAlert({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border border-sale/20 bg-sale/5 px-4 py-3 text-caption text-sale",
        className,
      )}
    >
      <RiErrorWarningLine aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** Reads a submitted form as a plain string record */
export const formValues = (form: HTMLFormElement) =>
  Object.fromEntries(Array.from(new FormData(form).entries()).map(([k, v]) => [k, String(v).trim()]));
