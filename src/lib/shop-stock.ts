import { z } from "zod";
import type { Result } from "./directory";
import { safeUrl } from "./contracts";
import { apiBaseUrl, liveServices } from "./config";
export type StockKind = "vehicles" | "spare-parts";
export type Stock = {
  id: string;
  slug: string;
  title: string;
  price: number;
  images: string[];
  location: string;
};
const vehicle = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  price: z.number().int().nonnegative().safe(),
  currency: z.literal("MWK"),
  images: z.array(safeUrl),
  location: z.string(),
});
const part = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  brand: z.string(),
  listing: z.object({
    price: z.number().int().positive().safe(),
    currency: z.literal("MWK"),
  }),
  images: z.array(safeUrl),
  seller: z.object({ location: z.string() }),
});
const vehiclePage = z.object({
  items: z.array(vehicle),
  nextCursor: z.string().uuid().nullable(),
  total: z.number().int().nonnegative(),
});
const partPage = z.object({
  items: z.array(part),
  nextCursor: z.string().uuid().nullable(),
  total: z.number().int().nonnegative(),
});
export type StockPage = {
  items: Stock[];
  nextCursor: string | null;
  total: number;
};
export function createShopStockGateway(base: string, transport: typeof fetch) {
  return async (
    kind: StockKind,
    slug: string,
    cursor?: string,
    signal?: AbortSignal,
  ): Promise<Result<StockPage>> => {
    try {
      const capability = await transport(
        `${base.replace(/\/$/, "")}/api/v1/capabilities`,
        signal ? { signal } : {},
      );
      if (capability.status === 404 || capability.status === 503)
        return { state: "unavailable" };
      if (!capability.ok) return { state: "error", reason: "server" };
      let flags: unknown;
      try {
        flags = await capability.json();
      } catch {
        return { state: "error", reason: "invalid-response" };
      }
      const supported = z
        .object({ shopInventory: z.boolean() })
        .safeParse(flags);
      if (!supported.success)
        return { state: "error", reason: "invalid-response" };
      if (!supported.data.shopInventory) return { state: "unavailable" };
      const query = new URLSearchParams({ limit: "20" });
      if (cursor) query.set("cursor", cursor);
      const response = await transport(
        `${base.replace(/\/$/, "")}/api/v1/shops/${encodeURIComponent(slug)}/${kind}?${query}`,
        signal ? { signal } : {},
      );
      if (response.status === 404) return { state: "not-found" };
      if (response.status === 503) return { state: "unavailable" };
      if (!response.ok) return { state: "error", reason: "server" };
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        return { state: "error", reason: "invalid-response" };
      }
      if (kind === "vehicles") {
        const page = vehiclePage.safeParse(payload);
        return page.success
          ? {
              state: "ready",
              data: {
                ...page.data,
                items: page.data.items.map((item) => ({
                  id: item.id,
                  slug: item.slug,
                  title: item.title,
                  price: item.price,
                  images: item.images,
                  location: item.location,
                })),
              },
            }
          : { state: "error", reason: "invalid-response" };
      }
      const page = partPage.safeParse(payload);
      return page.success
        ? {
            state: "ready",
            data: {
              ...page.data,
              items: page.data.items.map((item) => ({
                id: item.id,
                slug: item.slug,
                title: `${item.brand} ${item.name}`,
                price: item.listing.price,
                images: item.images,
                location: item.seller.location,
              })),
            },
          }
        : { state: "error", reason: "invalid-response" };
    } catch (error) {
      if (signal?.aborted) throw error;
      return { state: "error", reason: "network" };
    }
  };
}
export const shopStock =
  liveServices && apiBaseUrl
    ? createShopStockGateway(apiBaseUrl, (...args) => fetch(...args))
    : async (): Promise<Result<StockPage>> => ({ state: "unavailable" });
