import { it, expect } from "vitest";
import {
  emptyBusinessApplication,
  businessErrors,
  businessFeeRows,
} from "../src/lib/business-application";
it("validates required business, service and contact fields", () => {
  const draft = emptyBusinessApplication();
  expect(businessErrors(draft, 0)).toHaveProperty("type");
  expect(businessErrors(draft, 1)).toHaveProperty("name");
  expect(businessErrors(draft, 2)["services.0.category"]).toBeTruthy();
  expect(businessErrors(draft, 4)).toHaveProperty("email");
  draft.type = "mobile";
  expect(businessErrors(draft, 1)).toHaveProperty("areas");
});
it("rejects fractional/negative/unsafe advertised prices but accepts omission and whole MWK", () => {
  const draft = emptyBusinessApplication();
  draft.offerings[0]!.category = "mechanics";
  draft.offerings[0]!.description = "Engine service and repairs";
  for (const value of ["-1", "1.5", "9007199254740992"]) {
    draft.offerings[0]!.price = value;
    expect(businessErrors(draft, 2)["services.0.price"]).toBeTruthy();
  }
  for (const value of ["", "0", "25000"]) {
    draft.offerings[0]!.price = value;
    expect(businessErrors(draft, 2)).toEqual({});
  }
});
it("shows informational rates without adding or duplicating them", () => {
  const draft = emptyBusinessApplication();
  draft.type = "shop";
  draft.offerings = [
    { id: "1", category: "mechanics", description: "", price: "" },
    { id: "2", category: "mechanics", description: "", price: "" },
    { id: "3", category: "tyres", description: "", price: "" },
  ];
  expect(businessFeeRows(draft).map((row) => row.amount)).toEqual([
    50000, 20000, 50000,
  ]);
});
