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
      {/* On wide screens a screen tall, less the header, with the line between the columns running down
          to the footer. Both columns share their top and bottom space: the h1 and the form's heading
          start level, and the ways to get in touch end level with the form's button */}
      <div className="grid lg:min-h-[calc(100svh-var(--spacing-header))] lg:grid-cols-12">
        <div className="flex flex-col gap-10 px-inset py-10 md:py-14 lg:col-span-5 lg:justify-between lg:border-r lg:border-line">
          <PageHeader
            title="We'd love to hear from you"
            description="Questions about an order, your scent or delivery? Send us a message and we'll reply within one working day."
          />
          <ContactDetails />
        </div>
        <FrameRule className="lg:hidden" />
        <div className="flex flex-col px-inset pt-10 pb-section md:pt-14 lg:col-span-7 lg:pb-14">
          <ContactForm />
        </div>
      </div>
    </Frame>
  );
}
