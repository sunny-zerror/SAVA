"use client";

import { env, storeHeaders } from "@/lib/env";

/*
 * Nimbbl payment, as wired in z-commerce:
 *   1. clientCheckout (GraphQL) creates the order and returns nimbblData.token
 *   2. openNimbblCheckout(token) shows the Nimbbl modal
 *   3. when it closes, the payload is posted to the backend for verification,
 *      which answers with the page to send the shopper to
 *      (/checkout/thank-you?orderId=… or /checkout/payment-failed)
 */

interface NimbblResponse {
  event_type?: string;
  payload?: Record<string, unknown>;
}

export async function openNimbblCheckout(token: string): Promise<string> {
  // Loaded on demand: the SDK touches window and only checkout needs it
  const { default: Checkout } = await import("nimbbl_sonic");

  return new Promise((resolve, reject) => {
    let settled = false;
    const checkout = new Checkout({ token });
    checkout.open({
      callback_handler: async (response: NimbblResponse) => {
        if (settled || response?.event_type !== "globalCloseCheckoutModal" || !response.payload) return;
        settled = true;
        try {
          resolve(await verifyPayment(response.payload));
        } catch (error) {
          reject(error);
        }
      },
    });
  });
}

/** Returns the redirect path chosen by the backend */
async function verifyPayment(payload: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${env.backendUrl}/api/payment/handle-order-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...storeHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Payment verification failed (${res.status})`);

  const json = await res.json();
  const redirectUrl: string | undefined = json?.data?.redirectUrl;
  if (!redirectUrl) return "/checkout/payment-failed";

  // Keep navigation on this site even if the backend returns an absolute URL
  const url = new URL(redirectUrl, window.location.origin);
  if (json?.data?.awb_code) url.searchParams.set("awb_code", json.data.awb_code);
  return url.pathname + url.search;
}
