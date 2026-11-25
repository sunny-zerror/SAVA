"use client";

import { useMutation } from "@apollo/client/react";
import BlobButton from "@/components/ui/BlobButton";
import { TextField, formValues } from "@/components/ui/form";
import PhoneField from "@/components/ui/PhoneField";
import { CHANGE_PASSWORD, UPDATE_PROFILE } from "@/graphql";
import { isApiConfigured } from "@/lib/env";
import { localUpdateUser } from "@/lib/local-shop";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import type { User } from "@/types";
import { errorMessage } from "@/utils/errors";

export default function ProfileTab({ user }: { user: User }) {
  const [updateProfile, { loading: savingProfile }] = useMutation(UPDATE_PROFILE);
  const [changePassword, { loading: savingPassword }] = useMutation(CHANGE_PASSWORD);

  async function onProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    // Without z-commerce: the account kept on this device (src/lib/local-shop.ts)
    if (!isApiConfigured) {
      const updated = {
        ...user,
        firstName: v.firstName,
        lastName: v.lastName,
        countryCode: v.countryCode,
        phoneNumber: v.phoneNumber,
      };
      localUpdateUser(updated);
      useAuthStore.getState().setUser(updated);
      toast.success("Profile updated");
      return;
    }
    try {
      const { data } = await updateProfile({
        variables: {
          id: user._id,
          input: {
            firstName: v.firstName,
            lastName: v.lastName,
            email: user.email,
            countryCode: v.countryCode,
            phoneNumber: v.phoneNumber,
          },
        },
      });
      if (data?.clientUserUpdate.user) useAuthStore.getState().setUser({ ...user, ...data.clientUserUpdate.user });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't update your profile."));
    }
  }

  async function onPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const v = formValues(form);
    if (v.newPassword.length < 8) return toast.error("Use at least 8 characters for the new password.");
    if (v.newPassword !== v.confirmPassword) return toast.error("New passwords don't match.");
    // Local accounts keep no password (any one signs in), so there's nothing to change
    if (!isApiConfigured) {
      form.reset();
      toast.success("Password changed");
      return;
    }
    try {
      const { data } = await changePassword({
        variables: { email: user.email, currentPassword: v.currentPassword, newPassword: v.newPassword },
      });
      const result = data?.changeUserPassword;
      if (result?.accessToken) useAuthStore.getState().setTokens(result.accessToken, result.refreshToken);
      form.reset();
      toast.success("Password changed");
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't change your password."));
    }
  }

  return (
    <div className="grid items-start gap-grid lg:grid-cols-2">
      <form
        onSubmit={onProfile}
        aria-labelledby="profile-details"
        className="flex flex-col gap-5 rounded-3xl border border-line p-5 md:p-8"
      >
        <h2 id="profile-details" className="text-h3">
          Your details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            name="firstName"
            defaultValue={user.firstName}
            autoComplete="given-name"
            required
          />
          <TextField
            label="Last name"
            name="lastName"
            defaultValue={user.lastName}
            autoComplete="family-name"
            required
          />
        </div>
        <TextField
          label="Email"
          name="email"
          type="email"
          defaultValue={user.email}
          disabled
          hint="Contact us to change your email."
        />
        <PhoneField
          label="Phone"
          codeName="countryCode"
          numberName="phoneNumber"
          defaultCode={user.countryCode}
          defaultNumber={user.phoneNumber}
        />
        <BlobButton type="submit" loading={savingProfile} className="mt-2 self-start">
          Save details
        </BlobButton>
      </form>

      <form
        onSubmit={onPassword}
        aria-labelledby="profile-password"
        className="flex flex-col gap-5 rounded-3xl border border-line p-5 md:p-8"
      >
        <h2 id="profile-password" className="text-h3">
          Password
        </h2>
        <TextField
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        <TextField
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 8 characters"
        />
        <TextField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        <BlobButton type="submit" loading={savingPassword} className="mt-2 self-start">
          Change password
        </BlobButton>
      </form>
    </div>
  );
}
