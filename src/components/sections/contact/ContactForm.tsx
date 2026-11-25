"use client";

import { useMutation } from "@apollo/client/react";
import { RiCheckLine } from "@remixicon/react";
import { useState } from "react";
import BlobButton from "@/components/ui/BlobButton";
import { TextArea, TextField, formValues } from "@/components/ui/form";
import { CREATE_CONTACT } from "@/graphql";
import { isApiConfigured } from "@/lib/env";
import { localSendMessage } from "@/lib/local-shop";
import { toast } from "@/store/toast-store";
import { errorMessage } from "@/utils/errors";

export default function ContactForm() {
  const [createContact, { loading }] = useMutation(CREATE_CONTACT);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const { name, email, phoneNumber, subject, message } = formValues(form);
    // Without z-commerce the message is kept in this browser (src/lib/local-shop.ts)
    if (!isApiConfigured) {
      localSendMessage({ name, email, phoneNumber: phoneNumber || undefined, subject, message });
      form.reset();
      setSent(true);
      toast.success("Message sent. We will reply within one working day.");
      return;
    }
    try {
      await createContact({
        variables: { input: { name, email, phoneNumber: phoneNumber || undefined, subject, message } },
      });
      form.reset();
      setSent(true);
      toast.success("Message sent. We will reply within one working day.");
    } catch (error) {
      toast.error(errorMessage(error, "Your message didn't send. Please try again."));
    }
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-start gap-5 rounded-3xl bg-surface p-8 md:p-12">
        <span aria-hidden="true" className="center size-14 rounded-full bg-success text-paper">
          <RiCheckLine className="size-6" />
        </span>
        <h2 className="text-h3">Thank you</h2>
        <p className="text-body-lg text-muted">We&apos;ve received your message and will be in touch shortly.</p>
        <BlobButton tone="soft" onClick={() => setSent(false)}>
          Send another
        </BlobButton>
      </div>
    );
  }

  return (
    // The form rises in as one block, not field by field
    <form data-reveal onSubmit={onSubmit} aria-labelledby="contact-form" className="grid gap-5 md:grid-cols-2">
      <h2 id="contact-form" className="text-h3 md:col-span-2">
        Send us a message
      </h2>
      <TextField label="Name" name="name" autoComplete="name" required />
      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      <TextField label="Phone (optional)" name="phoneNumber" type="tel" autoComplete="tel" />
      <TextField label="Subject" name="subject" required />
      <TextArea label="Message" name="message" required className="md:col-span-2" />
      <BlobButton type="submit" loading={loading} className="mt-2 justify-self-start md:col-span-2">
        Send message
      </BlobButton>
    </form>
  );
}
