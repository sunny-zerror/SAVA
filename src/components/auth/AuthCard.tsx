import Link from "next/link";

interface AuthCardProps {
  title: string;
  description: string;
  footer: { text: string; linkLabel: string; href: string };
  children: React.ReactNode;
}

export default function AuthCard({ title, description, footer, children }: AuthCardProps) {
  return (
    <section className="section container flex justify-center">
      <div className="flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-3 text-center">
          <h1 className="text-4xl md:text-5xl">{title}</h1>
          <p className="text-body text-muted">{description}</p>
        </header>
        {children}
        <p className="text-center text-caption text-muted">
          {footer.text}{" "}
          <Link href={footer.href} className="text-ink underline underline-offset-4">
            {footer.linkLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}

/** Only allow same-site redirect targets like "/account?tab=orders" */
export const safeNext = (next?: string | string[]) =>
  typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
