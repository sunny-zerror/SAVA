"use client";

import { RiArrowDownSLine, RiSearchLine } from "@remixicon/react";
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FieldShell, useFieldProblem } from "@/components/ui/form";
import { cn } from "@/utils/cn";

interface Country {
  code: CountryCode;
  name: string;
  dial: string;
}

/** "+91" for IN */
const dialOf = (code: CountryCode) => `+${getCountryCallingCode(code)}`;

// Ascension and Tristan da Cunha have no flag of their own on flagcdn: both fly Saint Helena's
const FLAG_ALIASES: Partial<Record<CountryCode, string>> = { AC: "sh", TA: "sh" };
const flagUrl = (code: CountryCode) => `https://flagcdn.com/${FLAG_ALIASES[code] ?? code.toLowerCase()}.svg`;

/** For dial codes several countries share, the one a saved "+1" or "+44" stands for */
const MAIN_COUNTRY: Record<string, CountryCode> = {
  "+1": "US",
  "+7": "RU",
  "+44": "GB",
  "+47": "NO",
  "+61": "AU",
  "+39": "IT",
  "+212": "MA",
  "+262": "RE",
  "+290": "SH",
  "+358": "FI",
  "+590": "GP",
  "+599": "CW",
};

/** The country a saved dial code stands for (India when there's none, or it's unknown) */
function countryOf(dial?: string | null): CountryCode {
  const code = dial?.startsWith("+") ? dial : dial ? `+${dial}` : "";
  return MAIN_COUNTRY[code] ?? getCountries().find((c) => dialOf(c) === code) ?? "IN";
}

let countries: Country[] | null = null;

/** Every country with a dial code, A to Z, built on first open */
function countryList() {
  if (!countries) {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    countries = getCountries()
      .map((code) => ({ code, name: names.of(code) ?? code, dial: dialOf(code) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  return countries;
}

function Flag({ code }: { code: CountryCode }) {
  return (
    <Image
      src={flagUrl(code)}
      alt=""
      width={20}
      height={14}
      unoptimized
      className="h-3.5 w-5 shrink-0 rounded-xs bg-line object-cover"
    />
  );
}

interface PhoneFieldProps {
  label: string;
  /** Form field names: the dial code ("+91") and the number, read back with formValues() */
  codeName: string;
  numberName: string;
  defaultCode?: string | null;
  defaultNumber?: string | null;
  required?: boolean;
  /** autocomplete section, e.g. "shipping" */
  autoCompleteSection?: string;
  className?: string;
}

/**
 * Phone number with its country: a flag and dial code you pick from a searchable list of every
 * country, then the number. The number is checked against the country's numbering plan, and any
 * problem shows under the field like the other fields' (form.tsx). Pasting "+44 7400 123456"
 * switches the country. Posts the dial code and the number as two fields, as the API keeps them.
 */
export default function PhoneField({
  label,
  codeName,
  numberName,
  defaultCode,
  defaultNumber,
  required,
  autoCompleteSection,
  className,
}: PhoneFieldProps) {
  const [country, setCountry] = useState<CountryCode>(() => countryOf(defaultCode));
  const [number, setNumber] = useState(defaultNumber ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const field = useFieldProblem(label);

  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const section = autoCompleteSection ? `${autoCompleteSection} ` : "";

  // A number that can't exist in the chosen country fails the form's own check, like a bad email
  useEffect(() => {
    input.current?.setCustomValidity(
      number && !isValidPhoneNumber(number, country) ? "Enter a valid phone number for this country." : "",
    );
  }, [number, country]);

  // Closes on a click anywhere outside
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // The highlighted country stays in view while arrowing through
  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const q = query.trim().toLowerCase();
  const digits = q.replace(/\D/g, "");
  // Names that start with the search come first ("india" → India, not British Indian Ocean Territory)
  const leads = (c: Country) => c.name.toLowerCase().startsWith(q) || c.code.toLowerCase() === q;
  const results = open
    ? countryList()
        .filter(
          (c) =>
            !q ||
            c.name.toLowerCase().includes(q) ||
            c.code.toLowerCase() === q ||
            (digits && c.dial.slice(1).startsWith(digits)),
        )
        .sort((a, b) => (q ? Number(leads(b)) - Number(leads(a)) : 0))
    : [];

  const openList = () => {
    setQuery("");
    setActive(0);
    setOpen(true);
  };

  const close = (focus: "trigger" | "input" = "trigger") => {
    setOpen(false);
    (focus === "input" ? input : trigger).current?.focus();
  };

  const select = (c: Country) => {
    setCountry(c.code);
    field.onInput();
    close("input");
  };

  const onSearchKey = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (results.length ? (i + step + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (results[active]) select(results[active]);
    } else if (event.key === "Escape") {
      // Closes the list, not the drawer or page it sits in
      event.stopPropagation();
      close();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  const onNumber = (raw: string) => {
    // A pasted international number picks its country and keeps the national part
    if (raw.trim().startsWith("+")) {
      const parsed = parsePhoneNumberFromString(raw);
      if (parsed?.country) {
        setCountry(parsed.country);
        setNumber(parsed.nationalNumber);
        return;
      }
    }
    setNumber(raw.replace(/\D/g, "").slice(0, 15));
  };

  return (
    <FieldShell label={label} error={field.problem} className={className}>
      {(id, describedBy) => (
        <div ref={root} className="relative">
          <input type="hidden" name={codeName} value={dialOf(country)} />
          <div
            className={cn(
              // As fieldClass, with the focus ring on the whole box (the country button and the number)
              "flex h-12 items-stretch rounded-lg border transition-[background-color,border-color,box-shadow] duration-300 focus-within:bg-paper focus-within:ring-4",
              field.problem
                ? "border-sale bg-paper focus-within:ring-sale/15"
                : "border-transparent bg-surface focus-within:border-accent focus-within:ring-accent/15 hover:border-line",
            )}
          >
            <button
              ref={trigger}
              type="button"
              aria-label={`Country code ${dialOf(country)}, change country`}
              aria-haspopup="listbox"
              aria-expanded={open}
              onClick={() => (open ? close() : openList())}
              onKeyDown={(event) => {
                if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                  event.preventDefault();
                  openList();
                }
              }}
              className="flex shrink-0 items-center gap-2 rounded-l-lg pr-2.5 pl-4 text-input text-ink tabular-nums outline-none focus-visible:bg-mist/60"
            >
              <Flag code={country} />
              {dialOf(country)}
              <RiArrowDownSLine
                aria-hidden="true"
                className={cn("size-4 text-muted transition-transform duration-300", open && "rotate-180")}
              />
            </button>
            <span aria-hidden="true" className="my-3 w-px bg-ink/10" />
            <input
              ref={input}
              id={id}
              name={numberName}
              type="tel"
              inputMode="tel"
              autoComplete={`${section}tel-national`}
              required={required}
              value={number}
              onChange={(event) => onNumber(event.target.value)}
              onInvalid={field.onInvalid}
              onInput={field.onInput}
              aria-invalid={Boolean(field.problem) || undefined}
              aria-describedby={describedBy}
              className="min-w-0 flex-1 bg-transparent px-3 text-input text-ink outline-none placeholder:text-muted/60"
            />
          </div>

          {open && (
            <div className="absolute inset-x-0 top-full z-30 mt-2 animate-fade-up overflow-hidden rounded-xl bg-paper shadow-xl ring-1 shadow-navy/10 ring-line">
              <label className="flex items-center gap-2 border-b border-line px-4">
                <RiSearchLine aria-hidden="true" className="size-4 shrink-0 text-muted" />
                <span className="sr-only">Search countries</span>
                <input
                  autoFocus
                  type="text"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={`${id}-countries`}
                  aria-activedescendant={results[active] ? `${id}-${results[active].code}` : undefined}
                  autoComplete="off"
                  placeholder="Search country or code"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onSearchKey}
                  className="h-11 min-w-0 flex-1 bg-transparent text-input text-ink outline-none placeholder:text-muted/60"
                />
              </label>
              <ul
                ref={list}
                id={`${id}-countries`}
                role="listbox"
                aria-label="Countries"
                data-lenis-prevent
                className="max-h-64 scrollbar-thin overflow-y-auto overscroll-contain py-1"
              >
                {results.length === 0 ? (
                  <li className="px-4 py-3 text-caption text-muted">No matches</li>
                ) : (
                  results.map((c, i) => (
                    <li
                      key={c.code}
                      id={`${id}-${c.code}`}
                      role="option"
                      aria-selected={c.code === country}
                      data-index={i}
                      onPointerMove={() => setActive(i)}
                      onClick={() => select(c)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-4 py-2.5 text-caption text-ink transition-colors",
                        i === active && "bg-surface",
                        c.code === country && "font-medium text-accent",
                      )}
                    >
                      <Flag code={c.code} />
                      <span className="min-w-0 flex-1 truncate">{c.name}</span>
                      <span className="shrink-0 text-muted tabular-nums">{c.dial}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </FieldShell>
  );
}
