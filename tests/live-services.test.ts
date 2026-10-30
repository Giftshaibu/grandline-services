import { describe, it, expect, vi, afterEach } from "vitest";
import { createHttpGateway } from "../src/lib/directory";
import { serviceCapabilities } from "../src/lib/service-capabilities";
import { serviceDraft, restoreServiceDraft } from "../src/lib/service-draft";
import { emptyBusinessApplication } from "../src/lib/business-application";
import { integrationFlag } from "../src/lib/config";
const base = "https://api.example.test";
afterEach(() => vi.restoreAllMocks());
describe("live Services boundary", () => {
  it("distinguishes disabled support, network failure and malformed capabilities", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ services: { discovery: false, enquiries: false } }),
        ),
      );
    expect(await createHttpGateway(base, fetcher, true).list({})).toEqual({
      state: "unavailable",
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(
      await serviceCapabilities(
        base,
        vi.fn().mockRejectedValue(new TypeError("offline")),
      ),
    ).toEqual({ state: "error", reason: "network" });
    expect(
      await serviceCapabilities(
        base,
        vi.fn().mockResolvedValue(new Response("not JSON")),
      ),
    ).toEqual({ state: "error", reason: "invalid-response" });
    expect(
      await serviceCapabilities(
        base,
        vi.fn().mockResolvedValue(new Response("{}")),
      ),
    ).toEqual({ state: "error", reason: "invalid-response" });
  });
  it("only reaches real catalogue APIs after capability confirmation and preserves empty results", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ services: { discovery: true, enquiries: true } }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [], nextCursor: null })),
      );
    expect(
      await createHttpGateway(base, fetcher, true).list({
        category: "mechanics",
      }),
    ).toEqual({ state: "ready", data: { items: [], nextCursor: null } });
    expect(fetcher.mock.calls[1]![0]).toContain(
      "/api/v1/service-providers?category=mechanics",
    );
  });
  it("does not mistake server failure for an empty catalogue", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ services: { discovery: true, enquiries: true } }),
        ),
      )
      .mockResolvedValueOnce(new Response("{}", { status: 500 }));
    expect(await createHttpGateway(base, fetcher, true).list({})).toEqual({
      state: "error",
      reason: "server",
    });
  });
  it("keeps enquiry idempotency and authentication in the backend request", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ services: { discovery: true, enquiries: true } }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "12345678-1234-4234-8234-123456789012",
            status: "submitted",
          }),
        ),
      );
    const key = "12345678-1234-4234-8234-123456789012";
    const result = await createHttpGateway(base, fetcher, true).enquire(
      {
        listingId: key,
        requestKey: key,
        name: "Customer",
        email: "customer@example.test",
        message: "Please share your service details.",
      },
      "session-token",
    );
    expect(result.state).toBe("ready");
    const options = fetcher.mock.calls[1]![1];
    expect(JSON.parse(options.body).requestKey).toBe(key);
    expect(options.headers.authorization).toBe("Bearer session-token");
  });
  it("converts local strings into backend whole-MWK drafts and restores them without leaking local IDs", () => {
    const draft = {
      ...emptyBusinessApplication(),
      type: "shop",
      areas: "Lilongwe, Blantyre\nMzuzu",
      offerings: [
        {
          id: "local-only",
          category: "mechanics",
          description: "General repairs",
          price: "12,000",
        },
      ],
    };
    const normalized = serviceDraft(draft, false);
    expect(normalized.offerings[0]).toEqual({
      category: "mechanics",
      description: "General repairs",
      price: 12000,
    });
    expect(normalized.serviceAreas).toEqual(["Lilongwe", "Blantyre", "Mzuzu"]);
    expect(JSON.stringify(normalized)).not.toContain("local-only");
    expect(restoreServiceDraft(normalized).draft.offerings[0]?.price).toBe(
      "12000",
    );
    expect(() =>
      serviceDraft(
        { ...draft, offerings: [{ ...draft.offerings[0]!, price: "0.5" }] },
        false,
      ),
    ).toThrow();
  });
  it("requires explicit true/false activation", () => {
    expect(integrationFlag(undefined)).toBe(false);
    expect(integrationFlag("true")).toBe(true);
    expect(() => integrationFlag("yes")).toThrow();
  });
});
