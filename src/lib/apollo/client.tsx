"use client";

import { ApolloLink, CombinedGraphQLErrors, HttpLink, ServerError } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { ApolloClient, ApolloNextAppProvider, InMemoryCache } from "@apollo/client-integration-nextjs";
import { from, switchMap } from "rxjs";
import { env, storeHeaders } from "@/lib/env";
import { REFRESH_TOKEN_QUERY } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";

/* ---------- Token refresh -------------------------------------------------- */

// One refresh at a time: requests that fail together all wait on the same promise
let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setTokens, clear } = useAuthStore.getState();
  if (!refreshToken) throw new Error("No refresh token");

  try {
    const res = await fetch(env.graphqlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...storeHeaders() },
      body: JSON.stringify({ query: REFRESH_TOKEN_QUERY, variables: { refreshToken } }),
    });
    const json = await res.json();
    const tokens = json?.data?.refreshToken;
    if (!tokens?.accessToken) throw new Error(json?.errors?.[0]?.message || "Refresh failed");
    setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken as string;
  } catch (error) {
    // Refresh token expired or revoked — sign out locally; /account will send them to /login
    clear();
    throw error;
  }
}

const isAuthError = (error: unknown) =>
  (CombinedGraphQLErrors.is(error) &&
    error.errors.some(
      (e) =>
        e.extensions?.code === "UNAUTHENTICATED" || e.message === "TOKEN_EXPIRED" || e.message === "Unauthorized!!",
    )) ||
  (ServerError.is(error) && error.statusCode === 401);

/* ---------- Links ---------------------------------------------------------- */

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (!isAuthError(error) || !useAuthStore.getState().refreshToken) return;

  refreshing ??= refreshAccessToken().finally(() => {
    refreshing = null;
  });

  return from(refreshing).pipe(
    switchMap((token) => {
      operation.setContext(({ headers = {} }) => ({
        headers: { ...headers, authtoken: `Bearer ${token}` },
      }));
      return forward(operation);
    }),
  );
});

// dbtoken picks the client's store; authtoken identifies the signed-in customer
const authLink = new ApolloLink((operation, forward) => {
  const { accessToken } = useAuthStore.getState();
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...storeHeaders(),
      ...(accessToken ? { authtoken: `Bearer ${accessToken}` } : {}),
    },
  }));
  return forward(operation);
});

function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([
      errorLink,
      authLink,
      new HttpLink({ uri: env.graphqlUrl, fetchOptions: { cache: "no-store" } }),
    ]),
  });
}

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}
