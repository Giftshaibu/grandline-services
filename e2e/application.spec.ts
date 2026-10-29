import { test, expect } from "@playwright/test";
const photo = {
  name: "test-photo.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  ),
};
test("business application validates, edits, previews photos and never submits", async ({
  page,
}, info) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (
      ["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) ||
      request.url().includes("/api/v1/")
    )
      writes.push(request.url());
  });
  await page.goto("/list-your-business", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Business type", { exact: true })).toBeFocused();
  await page.getByLabel("Business type", { exact: true }).selectOption("shop");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Business or provider name")
    .fill("Application Test Workshop");
  await page.getByLabel("Base location").fill("Lilongwe");
  await page
    .getByLabel("Business description")
    .fill("A test workshop application describing its automotive services.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Service 1 category").selectOption("mechanics");
  await page
    .getByLabel("Service 1 description")
    .fill("General engine maintenance and repair services.");
  await page
    .getByLabel("Service 1 advertised price (MWK, optional)")
    .fill("-1");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByLabel("Service 1 advertised price (MWK, optional)"),
  ).toBeFocused();
  await page
    .getByLabel("Service 1 advertised price (MWK, optional)")
    .fill("25000");
  await page.getByRole("button", { name: "Add another service" }).click();
  await page.getByLabel("Service 2 category").selectOption("tyres");
  await page
    .getByLabel("Service 2 description")
    .fill("Tyre fitting and wheel maintenance services.");
  await page.getByRole("button", { name: "Remove service 2" }).click();
  await expect(page.getByLabel("Service 2 category")).toHaveCount(0);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByLabel("Service 1 category")).toHaveValue("mechanics");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Choose photos").setInputFiles(photo);
  await expect(
    page.getByRole("img", { name: /Selected photo 1/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remove photo 1" }).click();
  await expect(page.getByRole("img", { name: /Selected photo 1/ })).toHaveCount(
    0,
  );
  await page.getByLabel("Choose photos").setInputFiles(photo);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Contact name", { exact: true }).fill("Test Applicant");
  await page.getByLabel("Contact phone").fill("+2651234567");
  await page.getByLabel("Contact email").fill("bad");
  await page.getByRole("button", { name: "Review application" }).click();
  await expect(page.getByLabel("Contact email")).toBeFocused();
  await page.getByLabel("Contact email").fill("applicant@example.test");
  await page.getByRole("button", { name: "Review application" }).click();
  await expect(
    page.getByRole("button", { name: "Submission unavailable", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("complementary", { name: "Monthly listing fee guidance" }),
  ).toContainText("20,000");
  await page
    .getByRole("button", { name: "Edit business details", exact: true })
    .click();
  await page
    .getByLabel("Business or provider name")
    .fill("Edited Test Workshop");
  await page
    .getByRole("button", { name: "Save changes & return to review" })
    .click();
  await expect(
    page.getByText("Edited Test Workshop", { exact: true }),
  ).toBeVisible();
  await page
    .locator("img")
    .evaluateAll((images) =>
      Promise.all(
        images.map((image) =>
          (image as HTMLImageElement).decode().catch(() => {}),
        ),
      ),
    );
  await page.screenshot({
    path: info.outputPath("application-review.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    ),
  ).not.toContain("applicant@example.test");
  expect(writes).toEqual([]);
  await page.getByRole("button", { name: "Reset draft" }).click();
  await expect(page.getByLabel("Business type", { exact: true })).toHaveValue(
    "",
  );
  await page
    .getByLabel("Business type", { exact: true })
    .selectOption("mobile");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Business type", { exact: true })).toHaveValue(
    "",
  );
});
test("application is disabled without JavaScript and mobile navigation links to it", async ({
  browser,
  page,
}, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJs = await context.newPage();
  await noJs.goto("/list-your-business", { waitUntil: "domcontentloaded" });
  await expect(
    noJs.getByLabel("Business type", { exact: true }),
  ).toBeDisabled();
  await expect(
    noJs.getByRole("button", { name: "Continue", exact: true }),
  ).toBeDisabled();
  await context.close();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: /List your business/ })
      .click();
  } else
    await page
      .locator("header")
      .getByRole("link", { name: "List your business", exact: true })
      .click();
  await expect(page).toHaveURL(/list-your-business/);
});

test("page exit clears the temporary application draft", async ({ page }) => {
  await page.goto("/list-your-business", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Business type", { exact: true }).selectOption("shop");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Business or provider name")
    .fill("Temporary private draft");
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  await expect(page.getByLabel("Business type", { exact: true })).toHaveValue(
    "",
  );
  await page.getByLabel("Business type", { exact: true }).selectOption("shop");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Business or provider name")).toHaveValue("");
});
