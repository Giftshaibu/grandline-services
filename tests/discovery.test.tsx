import { render, screen, fireEvent } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { Search } from "../src/components/search";
import { ProviderCard } from "../src/components/provider-card";
import { entrySchema } from "../src/lib/contracts";
import { entry } from "./fixtures";
it("submits normalized criteria without claiming provider results", () => {
  const submit = vi.fn();
  render(<Search onSearch={submit} />);
  fireEvent.change(screen.getByLabelText("Service or expertise"), {
    target: { value: " engine " },
  });
  fireEvent.change(screen.getByLabelText("Location"), {
    target: { value: "Mzuzu" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Find providers" }));
  expect(submit).toHaveBeenCalledWith({ q: "engine", location: "Mzuzu" });
});
it("renders only supplied provider facts and a real profile address", () => {
  render(<ProviderCard entry={entrySchema.parse(entry)} />);
  expect(
    screen.getByRole("heading", { name: "Fixture Workshop" }),
  ).toBeVisible();
  expect(screen.getByRole("link", { name: "View provider" })).toHaveAttribute(
    "href",
    "/providers/fixture-provider",
  );
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.queryByText(/Verified|rating/i)).not.toBeInTheDocument();
});
it("rejects invalid profile media without throwing", () => {
  expect(
    entrySchema.safeParse({ ...entry, images: ["not a URL"] }).success,
  ).toBe(false);
});
