"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BlobButton from "@/components/ui/BlobButton";
import { TextField, formValues } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/store/toast-store";
import { errorMessage } from "@/utils/errors";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const { login } = useAuth();
  // The fields turn red with a refused sign-in; the reason is in the toast
  const [refused, setRefused] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { email, password } = formValues(e.currentTarget);
    setRefused(false);
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.firstName}!`);
      router.replace(next);
    } catch (err) {
      setRefused(true);
      toast.error(errorMessage(err, "Incorrect email or password."));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        aria-invalid={refused || undefined}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        aria-invalid={refused || undefined}
      />
      <BlobButton type="submit" block loading={loading} className="mt-2">
        Sign in
      </BlobButton>
    </form>
  );
}
