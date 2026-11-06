import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { WelcomeDialog } from "@grandline/ui";

afterEach(() => { cleanup(); localStorage.clear(); delete (HTMLDialogElement.prototype as { showModal?: unknown }).showModal; delete (HTMLDialogElement.prototype as { close?: unknown }).close; vi.restoreAllMocks(); });
it("shows the product welcome on each signed-out refresh and skips signed-in visitors", () => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute("open", ""); } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute("open"); } });
  const props = { product: "services-test", title: "Find a service", description: "Browse local providers", options: [{ label: "Browse", description: "See providers", href: "/providers" }] };
  const first = render(<WelcomeDialog {...props} />);
  expect(screen.getByRole("dialog")).toHaveAttribute("open");
  fireEvent.click(screen.getByRole("button", { name: "Just browsing" }));
  expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
  first.unmount();
  render(<WelcomeDialog {...props} />);
  expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute("open");
  cleanup(); localStorage.clear();
  render(<WelcomeDialog {...props} signedIn />);
  expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
});
