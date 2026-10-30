"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormAlert, TextField, formValues } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { errorMessage } from "@/utils/errors";

export default function SignupForm() {
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
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      await signup({
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        password: v.password,
        countryCode: v.countryCode || "+91",
        phoneNumber: v.phoneNumber,
        emailSubscribedStatus: v.newsletter ? "SUBSCRIBED" : "NEVER_SUBSCRIBED",
      });
      router.replace("/account");
    } catch (err) {
      setErrors({ form: errorMessage(err, "Couldn't create your account.") });
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-x-4 gap-y-5">
      <TextField label="First name" name="firstName" autoComplete="given-name" required />
      <TextField label="Last name" name="lastName" autoComplete="family-name" required />
      <TextField label="Email" name="email" type="email" autoComplete="email" required className="col-span-2" />
      <div className="col-span-2 grid grid-cols-[5.5rem_1fr] gap-3">
        <TextField label="Code" name="countryCode" defaultValue="+91" autoComplete="tel-country-code" required />
        <TextField label="Phone" name="phoneNumber" type="tel" autoComplete="tel-national" required />
      </div>
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
      {errors.form && <FormAlert className="col-span-2">{errors.form}</FormAlert>}
      <Button type="submit" size="lg" fullWidth loading={loading} className="col-span-2 mt-2">
        Create account
      </Button>
    </form>
  );
}
