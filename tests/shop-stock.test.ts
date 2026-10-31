import { describe, it, expect, vi } from "vitest";
import { createShopStockGateway } from "../src/lib/shop-stock";
const base = "https://api.example.test";
const id = "12345678-1234-4234-8234-123456789012";
describe("real associated shop inventory", () => {
  it("does not call inventory endpoints while the capability is unavailable", async () => {
    const transport = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ shopInventory: false })),
      );
    expect(
      await createShopStockGateway(base, transport)("vehicles", "shop"),
    ).toEqual({ state: "unavailable" });
    expect(transport).toHaveBeenCalledTimes(1);
  });
  it("preserves a genuine empty result and public-only count", async () => {
    const transport = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ shopInventory: true })),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [], nextCursor: null, total: 0 })),
      );
    expect(
      await createShopStockGateway(base, transport)("vehicles", "shop"),
    ).toEqual({
      state: "ready",
      data: { items: [], nextCursor: null, total: 0 },
    });
  });
  it("maps associated vehicle sales without treating them as hire availability", async () => {
    const transport = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ shopInventory: true })),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                id,
                slug: "test-car",
                title: "Toyota RAV4",
                price: 15000000,
                currency: "MWK",
                images: [],
                location: "Lilongwe",
              },
            ],
            nextCursor: id,
            total: 2,
          }),
        ),
      );
    const result = await createShopStockGateway(base, transport)(
      "vehicles",
      "shop",
      id,
    );
    expect(result.state).toBe("ready");
    if (result.state === "ready") {
      expect(result.data.items[0]?.title).toBe("Toyota RAV4");
      expect(result.data.total).toBe(2);
    }
    expect(transport.mock.calls[1]?.[0]).toContain(
      `/api/v1/shops/shop/vehicles?limit=20&cursor=${id}`,
    );
  });
  it("maps spare-part inventory using existing listing prices and seller location", async () => {
    const transport = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ shopInventory: true })),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                id,
                slug: "filter",
                name: "Oil filter",
                brand: "Fixture",
                listing: { price: 45000, currency: "MWK" },
                seller: { location: "Mzuzu" },
                images: [],
              },
            ],
            nextCursor: null,
            total: 1,
          }),
        ),
      );
    const result = await createShopStockGateway(base, transport)(
      "spare-parts",
      "shop",
    );
    expect(result.state).toBe("ready");
    if (result.state === "ready")
      expect(result.data.items[0]).toEqual({
        id,
        slug: "filter",
        title: "Fixture Oil filter",
        price: 45000,
        location: "Mzuzu",
        images: [],
      });
  });
  it("keeps server failure, invalid data and removed shops distinct", async () => {
    for (const [response, expected] of [
      [
        new Response("{}", { status: 500 }),
        { state: "error", reason: "server" },
      ],
      [
        new Response("not JSON"),
        { state: "error", reason: "invalid-response" },
      ],
      [new Response("{}", { status: 404 }), { state: "not-found" }],
    ] as const) {
      const transport = vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ shopInventory: true })),
        )
        .mockResolvedValueOnce(response);
      expect(
        await createShopStockGateway(base, transport)("vehicles", "shop"),
      ).toEqual(expected);
    }
  });
});
