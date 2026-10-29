import { HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache, registerApolloClient } from "@apollo/client-integration-nextjs";
import { env, storeHeaders } from "@/lib/env";

/*
 * Apollo for Server Components — used by src/services for catalogue data, so
 * product and category pages render with real content and metadata for SEO.
 * Responses are cached by Next and refreshed every 60 seconds.
 */
export const { getClient, query } = registerApolloClient(
  () =>
    new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: env.graphqlUrl,
        headers: storeHeaders(),
        fetchOptions: { next: { revalidate: 60 } },
      }),
    }),
);
