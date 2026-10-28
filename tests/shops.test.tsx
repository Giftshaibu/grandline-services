import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { ShopProfile, ShopParts } from "../src/components/shop-profile";
import { shopSchema } from "../src/lib/contracts";
import { shops } from "../src/lib/shops";
import { provider } from "./fixtures";
it("keeps shop operations unavailable", async () => {
  expect(shops.supported).toBe(false);
  expect(await shops.list({ q: "shop" })).toEqual({ state: "unavailable" });
  expect(await shops.detail("fixture")).toEqual({ state: "unavailable" });
});
it("shows supplied services without invented contact or inventory", () => {
  render(
    <ShopProfile
      shop={shopSchema.parse({
        ...provider,
        services: [{ name: "Engine repair", category: "mechanics" }],
      })}
    />,
  );
  expect(screen.getByRole("heading", { name: "Engine repair" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Spare parts" })).toHaveAttribute(
    "href",
    "#shop-parts",
  );
  expect(
    screen.queryByRole("link", { name: "Call shop" }),
  ).not.toBeInTheDocument();
});
it("links all parts rather than a hypothetical shop filter", () => {
  render(<ShopParts hub="https://hub.example" />);
  expect(screen.getByRole("link")).toHaveAttribute(
    "href",
    "https://hub.example/parts",
  );
});
it("hides unconfigured parts destinations", () => {
  render(<ShopParts hub={undefined} />);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});
