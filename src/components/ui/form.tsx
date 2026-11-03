import { RiArrowDownSLine, RiErrorWarningLine } from "@remixicon/react";
import { useId } from "react";
import { cn } from "@/utils/cn";

// Soft tinted fields that turn white with a blue ring on focus; errors swap the ring to sale red
export const fieldClass =
  "h-12 w-full rounded-2xl border border-transparent bg-surface px-4 text-input text-ink outline-none transition-[background-color,border-color,box-shadow] duration-300 placeholder:text-muted/60 hover:border-line focus:border-accent focus:bg-paper focus:ring-4 focus:ring-accent/15 disabled:cursor-not-allowed disabled:text-muted aria-[invalid=true]:border-sale aria-[invalid=true]:bg-paper aria-[invalid=true]:focus:ring-sale/15";

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: (id: string, describedBy?: string) => React.ReactNode;
}

function FieldShell({ label, error, hint, className, children }: FieldShellProps) {
  const id = useId();
  const describedBy = error || hint ? `${id}-note` : undefined;
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={id} className="text-caption font-medium text-ink">
        {label}
      </label>
      {children(id, describedBy)}
      {(error || hint) && (
        <p id={describedBy} className={cn("px-1 text-caption", error ? "text-sale" : "text-muted")}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string };

export function TextField({ label, error, hint, className, ...props }: TextFieldProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={className}>
      {(id, describedBy) => (
        <input
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={fieldClass}
          {...props}
        />
      )}
    </FieldShell>
  );
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string };

export function TextArea({ label, error, className, ...props }: TextAreaProps) {
  return (
    <FieldShell label={label} error={error} className={className}>
      {(id, describedBy) => (
        <textarea
          id={id}
          rows={5}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(fieldClass, "h-auto resize-y py-3")}
          {...props}
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

export function SelectField({ label, error, options, className, ...props }: SelectFieldProps) {
  return (
    <FieldShell label={label} error={error} className={className}>
      {(id, describedBy) => (
        <div className="relative">
          <select
            id={id}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            className={cn(fieldClass, "cursor-pointer appearance-none pr-11")}
            {...props}
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
