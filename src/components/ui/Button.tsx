import Link from "next/link";
import { cn } from "@/utils/cn";

/**
 * primary — SAVA blue pill (the brand's main action)
 * ink — dark pill for quieter primary actions
 * outline — hairline pill on light backgrounds
 * light / outline-light — the same pair for use on the dark brand gradient
 * ghost — underlined text action
 */
type Variant = "primary" | "ink" | "outline" | "light" | "outline-light" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-paper hover:bg-navy",
  ink: "bg-ink text-paper hover:bg-accent",
  outline: "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-paper",
  light: "bg-paper text-ink hover:bg-mist",
  "outline-light": "border border-paper/40 text-paper hover:border-paper hover:bg-paper hover:text-ink",
  ghost: "text-ink underline underline-offset-4 decoration-ink/30 hover:decoration-ink",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
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
        <>
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <span className="sr-only">Loading</span>
        </>
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
