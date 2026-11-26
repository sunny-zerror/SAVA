import type { Metadata } from "next";
import ContactDetails from "@/components/sections/contact/ContactDetails";
import ContactForm from "@/components/sections/contact/ContactForm";
import { Frame, FrameRule } from "@/components/ui/Frame";
import PageHeader from "@/components/ui/PageHeader";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata("/contact");

export default function ContactPage() {
  return (
    <Frame>
      <div className="grid lg:grid-cols-12">
        {/* The heading leads the left column, above the ways to get in touch. The section's bottom space is
            inside the columns, so the line between them runs down to the footer */}
        <div className="flex flex-col gap-10 px-inset py-10 md:py-14 lg:col-span-5 lg:border-r lg:border-line lg:pb-section">
          <PageHeader
            eyebrow="Client services"
            title="We'd love to hear from you"
            description="Questions about an order, your scent or delivery? Send us a message and we'll reply within one working day."
          />
          <ContactDetails />
        </div>
        <FrameRule className="lg:hidden" />
        <div className="px-inset pt-10 pb-section md:pt-14 lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </Frame>
  );
}
