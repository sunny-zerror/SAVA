import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import { createMetadata } from "@/lib/seo";
import { safeNext } from "@/utils/url";

type Params = { searchParams: Promise<{ next?: string; mode?: string }> };

// Sign in and sign up share this page; ?mode=signup opens it on "Create account" (/signup redirects here)
export async function generateMetadata({ searchParams }: Params): Promise<Metadata> {
  const { mode } = await searchParams;
  return createMetadata({ title: mode === "signup" ? "Create account" : "Sign in", path: "/login", noIndex: true });
}

export default async function LoginPage({ searchParams }: Params) {
  const { next, mode } = await searchParams;
  return <AuthCard initialMode={mode === "signup" ? "signup" : "signin"} next={safeNext(next)} />;
}
