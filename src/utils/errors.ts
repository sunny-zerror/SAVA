import { CombinedGraphQLErrors } from "@apollo/client";

/** A message fit to show a shopper, from whatever Apollo or fetch threw */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (CombinedGraphQLErrors.is(error)) return error.errors[0]?.message || fallback;
  if (error instanceof Error && error.message && !/fetch|network/i.test(error.message)) return error.message;
  return fallback;
}
