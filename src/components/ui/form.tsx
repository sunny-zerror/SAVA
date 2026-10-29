import { useId } from "react";
import { cn } from "@/utils/cn";

const fieldClass =
  "h-12 w-full border border-line bg-paper px-4 text-body outline-none transition-colors placeholder:text-muted/70 focus:border-ink aria-[invalid=true]:border-sale";

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
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-caption text-muted">
        {label}
      </label>
      {children(id, describedBy)}
      {(error || hint) && (
        <p id={describedBy} className={cn("text-caption", error ? "text-sale" : "text-muted")}>
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
          className={cn(fieldClass, "h-auto py-3")}
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
        <select
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={fieldClass}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { label: React.ReactNode };

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-3 text-caption", className)}>
      <input type="checkbox" className="size-4 accent-ink" {...props} />
      <span>{label}</span>
    </label>
  );
}

/** Reads a submitted form as a plain string record */
export const formValues = (form: HTMLFormElement) =>
  Object.fromEntries(Array.from(new FormData(form).entries()).map(([k, v]) => [k, String(v).trim()]));
