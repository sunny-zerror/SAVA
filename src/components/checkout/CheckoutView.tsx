"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { RiLockLine, RiPlugLine, RiShoppingBag3Line } from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AddressFields, { readAddress } from "@/components/checkout/AddressFields";
import OrderSummary from "@/components/checkout/OrderSummary";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, TextField, formValues } from "@/components/ui/form";
import Skeleton from "@/components/ui/Skeleton";
import { CHECKOUT, GET_ADDRESSES } from "@/graphql";
import { useCart } from "@/hooks/useCart";
import { isApiConfigured } from "@/lib/env";
import { openNimbblCheckout } from "@/lib/payment";
import { selectIsLoggedIn, useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import type { Address } from "@/types";
import { cn } from "@/utils/cn";
import { errorMessage } from "@/utils/errors";

export default function CheckoutView() {
  const router = useRouter();
  const { cart, lines, loading, applyCoupon, removeCoupon } = useCart();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const [sameBilling, setSameBilling] = useState(true);
  const [paying, setPaying] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [checkout] = useMutation(CHECKOUT);

  const { data: addressData } = useQuery(GET_ADDRESSES, {
    variables: { filters: { userId: user?._id }, limit: 20, sort: { primary: "DESC", createdAt: "DESC" } },
    skip: !isLoggedIn || !user?._id,
  });
  const saved = addressData?.getAddressByFilters.data ?? [];
  const chosen: Address | undefined = saved.find((a) => a._id === savedId) ?? saved.find((a) => a.primary) ?? saved[0];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cart) return;
    const v = formValues(e.currentTarget);
    const shippingAddress = { ...readAddress(v, "shipping"), email: v.email, primary: true };
    const billingAddress = sameBilling
      ? { ...shippingAddress, primary: false }
      : { ...readAddress(v, "billing"), email: v.email, primary: false };

    setPaying(true);
    try {
      const { data } = await checkout({
        variables: {
          input: {
            cartId: cart._id,
            userData: {
              firstName: shippingAddress.firstname,
              lastName: shippingAddress.lastname,
              email: v.email,
              phoneNumber: shippingAddress.phone,
              countryCode: shippingAddress.countryCode,
              emailSubscribedStatus: v.newsletter ? "SUBSCRIBED" : user?.emailSubscribedStatus || "NEVER_SUBSCRIBED",
            },
            shippingAddress,
            billingAddress,
          },
        },
      });
      const token = data?.clientCheckout.nimbblData?.token;
      if (!token) throw new Error("Payment couldn't be started.");
      router.push(await openNimbblCheckout(token));
    } catch (error) {
      toast.error(errorMessage(error, "Checkout failed. Please try again."));
      setPaying(false);
    }
  }

  if (!isApiConfigured) {
    return (
      <StatePanel
        icon={<RiPlugLine className="size-6" />}
        title="Checkout needs the store connection"
        body="Add NEXT_PUBLIC_GRAPHQL_API_URL, NEXT_PUBLIC_BACKEND_ENDPOINT and NEXT_PUBLIC_DB_TOKEN to .env.local to take orders."
      >
        <ButtonLink href="/shop" variant="outline">
          Back to shop
        </ButtonLink>
      </StatePanel>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-stack lg:grid-cols-[1fr_28rem]" aria-busy="true" aria-label="Loading checkout">
        <Skeleton className="h-[32rem] rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  if (!cart || lines.length === 0) {
    return (
      <StatePanel
        icon={<RiShoppingBag3Line className="size-6" />}
        title="Your bag is empty"
        body="Add a stick or two and come back to check out."
      >
        <ButtonLink href="/shop">Continue shopping</ButtonLink>
      </StatePanel>
    );
  }

  const total = cart.discountedPrice || cart.totalprice;

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-stack lg:grid-cols-[1fr_28rem] xl:gap-16">
      <div className="flex flex-col gap-grid">
        <fieldset className={step}>
          <legend className="sr-only">Contact</legend>
          <StepTitle n={1} title="Contact">
            {!isLoggedIn && (
              <Link
                href="/login?next=/checkout"
                className="text-caption font-bold text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
              >
                Sign in
              </Link>
            )}
          </StepTitle>
          <TextField label="Email" name="email" type="email" autoComplete="email" defaultValue={user?.email} required />
          <Checkbox name="newsletter" label="Email me with news and offers" />
        </fieldset>

        <fieldset className={step}>
          <legend className="sr-only">Delivery address</legend>
          <StepTitle n={2} title="Delivery address" />
          {saved.length > 0 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Saved addresses">
              {saved.map((a) => (
                <button
                  key={a._id}
                  type="button"
                  onClick={() => setSavedId(a._id ?? null)}
                  aria-pressed={a._id === chosen?._id}
                  className="max-w-full truncate rounded-full border border-line px-4 py-2 text-caption transition-colors hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-paper"
                >
                  {a.addressType || a.city} — {a.addressline1}
                </button>
              ))}
            </div>
          )}
          <AddressFields
            prefix="shipping"
            defaults={
              chosen ?? { firstname: user?.firstName, lastname: user?.lastName, phone: user?.phoneNumber ?? "" }
            }
          />
        </fieldset>

        <fieldset className={step}>
          <legend className="sr-only">Billing address</legend>
          <StepTitle n={3} title="Billing address" />
          <Checkbox
            checked={sameBilling}
            onChange={(e) => setSameBilling(e.target.checked)}
            label="Same as delivery address"
          />
          {!sameBilling && <AddressFields prefix="billing" />}
        </fieldset>

        <PayButton paying={paying} className="hidden lg:flex" />
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]">
        <OrderSummary
          lines={lines}
          subtotal={cart.totalprice}
          discount={cart.totalDiscount}
          tax={cart.totalTax}
          total={total}
          coupon={{ code: cart.coupon?.couponCode, onApply: applyCoupon, onRemove: removeCoupon }}
        />
        <PayButton paying={paying} className="flex lg:hidden" />
      </div>
    </form>
  );
}

const step = "flex min-w-0 flex-col gap-5 rounded-3xl border border-line p-5 md:p-8";

/** Numbered step heading inside a checkout fieldset (the legend itself stays visually hidden) */
function StepTitle({ n, title, children }: { n: number; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p aria-hidden="true" className="flex items-center gap-3 font-primary text-xl font-bold md:text-2xl">
        <span className="center size-8 shrink-0 rounded-full bg-accent text-sm text-paper">{n}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

function PayButton({ paying, className }: { paying: boolean; className?: string }) {
  return (
    <div className={cn("flex-col gap-3", className)}>
      <Button type="submit" size="lg" fullWidth loading={paying}>
        <RiLockLine aria-hidden="true" className="size-4" />
        Pay now
      </Button>
      <p className="text-center text-caption text-muted">Payments are processed securely by Nimbbl.</p>
    </div>
  );
}

/** Centred card for the empty / not-connected states */
function StatePanel({
  icon,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-3xl bg-surface px-6 py-14 text-center md:px-12">
      <span aria-hidden="true" className="center size-14 rounded-full bg-paper text-accent">
        {icon}
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl">{title}</h2>
        <p className="text-body text-muted">{body}</p>
      </div>
      {children}
    </div>
  );
}
