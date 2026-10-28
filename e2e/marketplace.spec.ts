import { test, expect } from "@playwright/test";
test("marketplace search and responsive menu", async ({ page }, info) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  await page.getByRole("button", { name: "Open search", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("What are you looking for?").fill("test search");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Search", exact: true })
    .click();
  await expect(page).toHaveURL(/q=test/);
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("shop search and services-parts sections stay unavailable", async ({
  page,
}) => {
  await page.goto("/shops?q=garage&location=Mzuzu", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByLabel("Service or expertise")).toHaveValue("garage");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Location", { exact: true })).toHaveValue(
    "Mzuzu",
  );
  await page.goto("/shops/not-real", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("navigation", { name: "Shop sections" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Spare parts", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Enquiries unavailable" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Directory coming soon", { exact: true }),
  ).toBeVisible();
});

test("marketplace page visual and category navigation", async ({
  page,
}, info) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  if (info.project.name === "desktop") {
    const menu = page
      .getByRole("navigation", { name: "Main navigation" })
      .locator("details")
      .first();
    await menu.locator("summary").click();
    await expect(menu.locator(".nav-categories a").first()).toBeVisible();
    await menu.locator(".nav-categories a").first().click();
    await expect(page).toHaveURL(/category=/);
  }
  await page.goto("/shops", { waitUntil: "domcontentloaded" });
  await page.screenshot({
    path: info.outputPath("journey.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
