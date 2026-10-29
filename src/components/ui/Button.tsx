import Link from "next/link";
import { cn } from "@/utils/cn";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "text-cta inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink/85",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-6",
  lg: "h-13 px-8",
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
}

export const buttonClass = ({ variant = "primary", size = "md", fullWidth, className }: StyleProps = {}) =>
  cn(base, variants[variant], variant !== "ghost" && sizes[size], fullWidth && "w-full", className);

type ButtonProps = StyleProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export function Button({ variant, size, fullWidth, className, loading, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={buttonClass({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}

type ButtonLinkProps = StyleProps & React.ComponentProps<typeof Link>;

export function ButtonLink({ variant, size, fullWidth, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass({ variant, size, fullWidth, className })} {...props} />;
}
