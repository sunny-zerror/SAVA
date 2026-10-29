"use client";

import { useMutation, useQuery } from "@apollo/client/react";
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
      <div className="flex flex-col items-start gap-4 bg-surface p-8">
        <h2 className="text-3xl">Checkout needs the store connection</h2>
        <p className="text-body text-muted">
          Add NEXT_PUBLIC_GRAPHQL_API_URL, NEXT_PUBLIC_BACKEND_ENDPOINT and NEXT_PUBLIC_DB_TOKEN to .env.local to take
          orders.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-stack lg:grid-cols-[1fr_28rem]">
        <Skeleton className="h-[32rem]" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!cart || lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-section text-center">
        <p className="font-primary text-3xl">Your bag is empty</p>
        <ButtonLink href="/shop">Continue shopping</ButtonLink>
      </div>
    );
  }

  const total = cart.discountedPrice || cart.totalprice;

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-stack lg:grid-cols-[1fr_28rem]">
      <div className="flex flex-col gap-10">
        <fieldset className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <legend className="font-primary text-2xl">Contact</legend>
            {!isLoggedIn && (
              <Link href="/login?next=/checkout" className="text-caption underline">
                Sign in
              </Link>
            )}
          </div>
          <TextField label="Email" name="email" type="email" autoComplete="email" defaultValue={user?.email} required />
          <Checkbox name="newsletter" label="Email me with news and offers" />
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-4 font-primary text-2xl">Delivery address</legend>
          {saved.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {saved.map((a) => (
                <button
                  key={a._id}
                  type="button"
                  onClick={() => setSavedId(a._id ?? null)}
                  aria-pressed={a._id === chosen?._id}
                  className="border border-line px-3 py-2 text-caption aria-pressed:border-ink"
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

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-4 font-primary text-2xl">Billing address</legend>
          <Checkbox
            checked={sameBilling}
            onChange={(e) => setSameBilling(e.target.checked)}
            label="Same as delivery address"
          />
          {!sameBilling && <AddressFields prefix="billing" />}
        </fieldset>

        <Button type="submit" size="lg" loading={paying} className="hidden lg:inline-flex">
          Pay now
        </Button>
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
        <Button type="submit" size="lg" fullWidth loading={paying} className="lg:hidden">
          Pay now
        </Button>
      </div>
    </form>
  );
}
