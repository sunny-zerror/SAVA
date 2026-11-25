import { siteSearch } from "@/services/search";

/** The search drawer's live results: GET /api/search?q=term (disallowed in robots.ts, like all of /api) */
export async function GET(request: Request) {
  // Capped: nothing sensible is longer, and the term is matched against every product and post
  const term = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  const results = await siteSearch(term);
  return Response.json(results, {
    // The same term gives the same results for a while: let a CDN answer repeats
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" },
  });
}
