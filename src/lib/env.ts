// NEXT_PUBLIC_* values are inlined at build time, so they must be read with
// literal property names (no dynamic process.env[key] lookups).
export const env = {
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "",
  backendUrl: (process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "").replace(/\/+$/, ""),
  dbToken: process.env.NEXT_PUBLIC_DB_TOKEN || "",
};

/**
 * False until .env.local points at a z-commerce store. While false the catalogue
 * renders from src/data/mock-products.ts and cart/account actions explain what's missing.
 */
export const isApiConfigured = Boolean(env.graphqlUrl && env.dbToken);

/** Headers every z-commerce request needs */
export const storeHeaders = (): Record<string, string> => ({
  dbtoken: `Bearer ${env.dbToken}`,
});
