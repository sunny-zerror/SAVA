import type { Metadata } from "next";
import ContactDetails from "@/components/sections/contact/ContactDetails";
import ContactForm from "@/components/sections/contact/ContactForm";
import PageHeader from "@/components/ui/PageHeader";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata("/contact");

export default function ContactPage() {
  return (
    <section className="section container flex flex-col gap-stack">
      <PageHeader eyebrow="Client services" title="Contact us" />
      <div className="grid gap-stack lg:grid-cols-[1fr_2fr]">
        <ContactDetails />
        <ContactForm />
      </div>
    </section>
  );
}
