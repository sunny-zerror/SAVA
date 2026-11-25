import { TextField } from "@/components/ui/form";
import PhoneField from "@/components/ui/PhoneField";
import type { Address } from "@/types";

type AddressInput = Omit<Address, "_id" | "userId">;

interface AddressFieldsProps {
  /** field-name prefix, so one form can hold two addresses ("shipping", "billing") */
  prefix: string;
  defaults?: Partial<Address> | null;
}

/** Address inputs named `${prefix}.field`; read them back with readAddress() */
export default function AddressFields({ prefix, defaults }: AddressFieldsProps) {
  const name = (field: keyof Address) => `${prefix}.${field}`;
  const ac = (token: string) => `${prefix === "billing" ? "billing" : "shipping"} ${token}`;
  // key on the default's id so picking a saved address re-fills the inputs
  const k = defaults?._id ?? "new";

  return (
    <div key={k} className="grid grid-cols-2 gap-x-3 gap-y-5 md:gap-x-4">
      <TextField
        label="First name"
        name={name("firstname")}
        defaultValue={defaults?.firstname}
        autoComplete={ac("given-name")}
        required
      />
      <TextField
        label="Last name"
        name={name("lastname")}
        defaultValue={defaults?.lastname}
        autoComplete={ac("family-name")}
        required
      />
      <TextField
        label="Flat / house no."
        name={name("flat")}
        defaultValue={defaults?.flat ?? ""}
        className="col-span-2 md:col-span-1"
      />
      <TextField
        label="Address"
        name={name("addressline1")}
        defaultValue={defaults?.addressline1}
        autoComplete={ac("address-line1")}
        required
        className="col-span-2 md:col-span-1"
      />
      <TextField
        label="Area / street (optional)"
        name={name("addressline2")}
        defaultValue={defaults?.addressline2 ?? ""}
        autoComplete={ac("address-line2")}
        className="col-span-2 md:col-span-1"
      />
      <TextField
        label="Landmark (optional)"
        name={name("landmark")}
        defaultValue={defaults?.landmark ?? ""}
        className="col-span-2 md:col-span-1"
      />
      <TextField
        label="City"
        name={name("city")}
        defaultValue={defaults?.city}
        autoComplete={ac("address-level2")}
        required
      />
      <TextField
        label="State"
        name={name("states")}
        defaultValue={defaults?.states}
        autoComplete={ac("address-level1")}
        required
      />
      <TextField
        label="PIN code"
        name={name("pincode")}
        defaultValue={defaults?.pincode}
        autoComplete={ac("postal-code")}
        inputMode="numeric"
        required
      />
      <TextField
        label="Country"
        name={name("country")}
        defaultValue={defaults?.country ?? "India"}
        autoComplete={ac("country-name")}
        required
      />
      <PhoneField
        label="Phone"
        codeName={name("countryCode")}
        numberName={name("phone")}
        defaultCode={defaults?.countryCode}
        defaultNumber={defaults?.phone}
        required
        autoCompleteSection={prefix === "billing" ? "billing" : "shipping"}
        className="col-span-2"
      />
    </div>
  );
}

/** Pulls `${prefix}.*` values out of formValues() into an address object */
export function readAddress(values: Record<string, string>, prefix: string): AddressInput {
  const get = (field: string) => values[`${prefix}.${field}`] ?? "";
  return {
    firstname: get("firstname"),
    lastname: get("lastname"),
    flat: get("flat"),
    addressline1: get("addressline1"),
    addressline2: get("addressline2"),
    landmark: get("landmark"),
    city: get("city"),
    states: get("states"),
    pincode: get("pincode"),
    country: get("country"),
    countryCode: get("countryCode"),
    phone: get("phone"),
  };
}
