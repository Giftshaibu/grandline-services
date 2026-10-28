import { it, expect } from "vitest";
import {
  sampleShops,
  sampleProviders,
  sampleResults,
} from "../src/lib/sample-catalogue";
import { shops } from "../src/lib/shops";
it("filters illustrative shops by service and location", () => {
  expect(
    sampleResults({ category: "mechanics", location: "lilongwe" }),
  ).toHaveLength(1);
  expect(sampleResults({ q: "impossible" })).toEqual([]);
});
it("uses the same sample identity for shop and provider without live contact data", () => {
  expect(
    sampleShops.every(
      (shop, index) =>
        shop.slug === sampleProviders[index]?.slug &&
        shop.name.startsWith("Example") &&
        Object.keys(shop.contact).length === 0,
    ),
  ).toBe(true);
  expect(shops.supported).toBe(false);
});
