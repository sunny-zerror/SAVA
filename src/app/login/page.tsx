import type { Metadata } from "next";
import AuthCard, { safeNext } from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "Sign in", path: "/login", noIndex: true });

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthCard
      title="Sign in"
      description="Track orders, save addresses and check out faster."
      footer={{ text: "New here?", linkLabel: "Create an account", href: "/signup" }}
    >
      <LoginForm next={safeNext(next)} />
    </AuthCard>
  );
}
