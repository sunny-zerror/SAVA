"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { RiAddLine, RiEditLine, RiMapPin2Line } from "@remixicon/react";
import { useState } from "react";
import AddressFields, { readAddress } from "@/components/checkout/AddressFields";
import { Button } from "@/components/ui/Button";
import { Checkbox, TextField, formValues } from "@/components/ui/form";
import Skeleton from "@/components/ui/Skeleton";
import { GET_ADDRESSES, SAVE_ADDRESS } from "@/graphql";
import { toast } from "@/store/toast-store";
import type { Address } from "@/types";
import { errorMessage } from "@/utils/errors";

export default function AddressesTab({ userId }: { userId: string }) {
  const { data, loading } = useQuery(GET_ADDRESSES, {
    variables: { filters: { userId }, limit: 50, sort: { primary: "DESC", createdAt: "DESC" } },
  });
  const [save, { loading: saving }] = useMutation(SAVE_ADDRESS, { refetchQueries: ["GetAddressByFilters"] });
  // null = list view, "new" = blank form, otherwise the address being edited
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const addresses = data?.getAddressByFilters.data ?? [];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    const current = editing !== "new" ? editing : null;
    try {
      await save({
        variables: {
          input: {
            ...readAddress(v, "address"),
            userId,
            addressType: v.addressType || "Home",
            primary: Boolean(v.primary),
          },
          ...(current?._id ? { id: current._id } : {}),
        },
      });
      toast.success("Address saved");
      setEditing(null);
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't save this address."));
    }
  }

  if (loading && !data) {
    return (
      <div className="grid gap-grid md:grid-cols-2">
        <Skeleton className="h-52 rounded-3xl" />
        <Skeleton className="h-52 rounded-3xl" />
      </div>
    );
  }

  if (editing) {
    const current = editing === "new" ? null : editing;
    return (
      <form
        onSubmit={onSubmit}
        aria-labelledby="address-form"
        className="flex max-w-3xl flex-col gap-6 rounded-3xl border border-line p-5 md:p-8"
      >
        <h2 id="address-form" className="text-2xl md:text-3xl">
          {current ? "Edit address" : "New address"}
        </h2>
        <TextField
          label="Label"
          name="addressType"
          placeholder="Home, Work…"
          defaultValue={current?.addressType ?? ""}
        />
        <AddressFields prefix="address" defaults={current} />
        <Checkbox
          name="primary"
          defaultChecked={current?.primary ?? addresses.length === 0}
          label="Use as my default address"
        />
        <div className="flex flex-wrap gap-3 border-t border-line pt-6">
          <Button type="submit" loading={saving}>
            Save address
          </Button>
          <Button type="button" variant="outline" onClick={() => setEditing(null)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <ul className="grid gap-grid md:grid-cols-2 xl:grid-cols-3">
      {addresses.map((a) => (
        <li key={a._id} className="flex flex-col gap-4 rounded-3xl border border-line p-6 text-caption md:p-8">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-bold">
              <RiMapPin2Line aria-hidden="true" className="size-4 text-accent" />
              {a.addressType || "Address"}
            </p>
            {a.primary && (
              <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-paper">Default</span>
            )}
          </div>
          <p className="text-muted">
            <span className="font-bold text-ink">
              {a.firstname} {a.lastname}
            </span>
            <br />
            {[a.flat, a.addressline1, a.addressline2].filter(Boolean).join(", ")}
            <br />
            {a.city}, {a.states} {a.pincode}, {a.country}
            <br />
            {a.countryCode} {a.phone}
          </p>
          <button
            onClick={() => setEditing(a)}
            aria-label={`Edit ${a.addressType || "address"}: ${a.addressline1}`}
            className="mt-auto inline-flex items-center gap-1.5 self-start font-bold transition-colors hover:text-accent"
          >
            <RiEditLine aria-hidden="true" className="size-4" />
            Edit
          </button>
        </li>
      ))}
      {/* The "add" tile sits in the grid like another card; it explains itself when the list is empty */}
      <li>
        <button
          onClick={() => setEditing("new")}
          className="group flex size-full min-h-52 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-ink/20 p-6 text-center transition-colors hover:border-accent hover:bg-surface"
        >
          <span
            aria-hidden="true"
            className="center size-12 rounded-full bg-accent text-paper transition-transform duration-300 group-hover:scale-110"
          >
            <RiAddLine className="size-5" />
          </span>
          <span className="font-bold">Add address</span>
          {addresses.length === 0 && <span className="text-caption text-muted">No saved addresses yet.</span>}
        </button>
      </li>
    </ul>
  );
}
