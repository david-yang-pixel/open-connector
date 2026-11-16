import { describe, expect, it, vi } from "vitest";
import { lacunaActionHandlers, lacunaBaseUrl } from "./runtime.ts";

describe("Lacuna full-view routing", () => {
  it("maps full direction, author, and hypothesis routes from Lacuna URLs", async () => {
    const fetcher = vi.fn<typeof fetch>(async (request) => {
      const url = new URL(String(request));
      if (url.pathname === "/api/v1/clusters/91") return Response.json({ type: "direction", id: 91 });
      if (url.pathname === "/api/v1/context/author/aut_example") {
        expect(Object.fromEntries(url.searchParams)).toEqual({ include_neighbors: "true" });
        return Response.json({ type: "author", id: "aut_example" });
      }
      if (url.pathname === "/api/v1/hypotheses/db4199b6b8055f3e") {
        return Response.json({ type: "hypothesis", id: "db4199b6b8055f3e" });
      }
      throw new Error(`Unexpected Lacuna path: ${url.pathname}`);
    });

    await expect(
      lacunaActionHandlers.get_direction(
        { directionIdOrUrl: `${lacunaBaseUrl}/direction/example/91`, view: "full" },
        { fetcher },
      ),
    ).resolves.toMatchObject({ cluster_id: 91 });
    await expect(
      lacunaActionHandlers.get_author_context(
        { authorIdOrUrl: `${lacunaBaseUrl}/author/example/aut_example`, view: "full", includeNeighbors: true },
        { fetcher },
      ),
    ).resolves.toMatchObject({ author_id: "aut_example" });
    await expect(
      lacunaActionHandlers.get_hypothesis(
        {
          hypothesisIdOrUrl: `${lacunaBaseUrl}/hypothesis/spectral-hydrodynamics-of-heteropolymer-folding-DB4199B6B8055F3E`,
          view: "full",
        },
        { fetcher },
      ),
    ).resolves.toMatchObject({ hypothesis_id: "db4199b6b8055f3e" });
  });
});
