import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import SignupForm from "@/components/auth/SignupForm";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "Create account", path: "/signup", noIndex: true });

export default function SignupPage() {
  return (
    <AuthCard
      eyebrow="Join the club"
      title="Create account"
      description="Join to track orders and check out faster."
      footer={{ text: "Already have an account?", linkLabel: "Sign in", href: "/login" }}
    >
      <SignupForm />
    </AuthCard>
  );
}
