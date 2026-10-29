"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, formValues } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { errorMessage } from "@/utils/errors";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { email, password } = formValues(e.currentTarget);
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err, "Incorrect email or password."));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" required />
      {error && (
        <p role="alert" className="text-caption text-sale">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth loading={loading}>
        Sign in
      </Button>
    </form>
  );
}
