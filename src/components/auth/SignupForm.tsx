"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BlobButton from "@/components/ui/BlobButton";
import { Checkbox, TextField, formValues } from "@/components/ui/form";
import PhoneField from "@/components/ui/PhoneField";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/store/toast-store";
import { errorMessage } from "@/utils/errors";

export default function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const { signup } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = formValues(e.currentTarget);

    const found: Record<string, string> = {};
    if (v.password.length < 8) found.password = "Use at least 8 characters.";
    if (v.password !== v.confirmPassword) found.confirmPassword = "Passwords don't match.";
    // Shown under their fields, like the browser's own checks
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      const user = await signup({
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        password: v.password,
        countryCode: v.countryCode || "+91",
        phoneNumber: v.phoneNumber,
        emailSubscribedStatus: v.newsletter ? "SUBSCRIBED" : "NEVER_SUBSCRIBED",
      });
      toast.success(`Welcome to SAVA, ${user.firstName}! Your account is ready.`);
      router.replace(next);
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't create your account."));
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      // A password error clears as soon as that field is typed in again
      onInput={(e) => {
        const name = (e.target as HTMLInputElement).name;
        if (errors[name]) setErrors((current) => ({ ...current, [name]: "" }));
      }}
      className="grid grid-cols-2 gap-x-4 gap-y-5"
    >
      <TextField label="First name" name="firstName" autoComplete="given-name" required />
      <TextField label="Last name" name="lastName" autoComplete="family-name" required />
      <TextField label="Email" name="email" type="email" autoComplete="email" required className="col-span-2" />
      <PhoneField label="Phone" codeName="countryCode" numberName="phoneNumber" required className="col-span-2" />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={errors.password}
        hint="At least 8 characters"
        className="col-span-2"
      />
      <TextField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
        className="col-span-2"
      />
      <Checkbox name="newsletter" label="Email me about new arrivals and offers" className="col-span-2" />
      <BlobButton type="submit" block loading={loading} className="col-span-2 mt-2">
        Create account
      </BlobButton>
    </form>
  );
}
