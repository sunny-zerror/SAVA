import type { Metadata } from "next";
import ContactDetails from "@/components/sections/contact/ContactDetails";
import ContactForm from "@/components/sections/contact/ContactForm";
import { Frame, FrameRule } from "@/components/ui/Frame";
import PageHeader from "@/components/ui/PageHeader";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata("/contact");

export default function ContactPage() {
  return (
    <Frame className="pb-section">
      <div className="grid lg:grid-cols-12">
        {/* The heading leads the left column, above the ways to get in touch */}
        <div className="flex flex-col gap-10 px-inset py-10 md:py-14 lg:col-span-5 lg:border-r lg:border-line">
          <PageHeader
            eyebrow="Client services"
            title="We'd love to hear from you"
            description="Questions about an order, your scent or delivery? Send us a message and we'll reply within one working day."
          />
          <ContactDetails />
        </div>
        <FrameRule className="lg:hidden" />
        <div className="px-inset py-10 md:py-14 lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </Frame>
  );
}
