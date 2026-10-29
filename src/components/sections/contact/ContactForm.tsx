"use client";

import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextArea, TextField, formValues } from "@/components/ui/form";
import { CREATE_CONTACT } from "@/graphql";
import { isApiConfigured } from "@/lib/env";
import { toast } from "@/store/toast-store";
import { errorMessage } from "@/utils/errors";

export default function ContactForm() {
  const [createContact, { loading }] = useMutation(CREATE_CONTACT);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!isApiConfigured) {
      toast.info("Demo mode — connect z-commerce in .env.local to send messages.");
      return;
    }
    const { name, email, phoneNumber, subject, message } = formValues(form);
    try {
      await createContact({
        variables: { input: { name, email, phoneNumber: phoneNumber || undefined, subject, message } },
      });
      form.reset();
      setSent(true);
    } catch (error) {
      toast.error(errorMessage(error, "Your message didn't send. Please try again."));
    }
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col gap-4 bg-surface p-8">
        <h2 className="text-3xl">Thank you</h2>
        <p className="text-body text-muted">We&apos;ve received your message and will be in touch shortly.</p>
        <Button variant="outline" className="self-start" onClick={() => setSent(false)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
      <TextField label="Name" name="name" autoComplete="name" required />
      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      <TextField label="Phone (optional)" name="phoneNumber" type="tel" autoComplete="tel" />
      <TextField label="Subject" name="subject" required />
      <TextArea label="Message" name="message" required className="md:col-span-2" />
      <Button type="submit" size="lg" loading={loading} className="md:col-span-2 md:justify-self-start">
        Send message
      </Button>
    </form>
  );
}
