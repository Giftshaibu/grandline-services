export function publicUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const url = new URL(value.trim());
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Use a public HTTP(S) URL without credentials.");
  return url.toString().replace(/\/$/, "");
}
export const ecosystem = [
  {
    label: "Auto Hub",
    url: publicUrl(
      import.meta.env["VITE_HUB_URL"]?.trim() ||
        "https://www.grandlineautomw.com",
    ),
  },
  {
    label: "Services",
    url: publicUrl(
      import.meta.env["VITE_SERVICES_URL"]?.trim() ||
        "https://services.grandlineautomw.com",
    ),
  },
  {
    label: "Mobility",
    url: publicUrl(
      import.meta.env["VITE_MOBILITY_URL"]?.trim() ||
        "https://grandline-mobility.vercel.app",
    ),
  },
];
export const apiBaseUrl = publicUrl(import.meta.env["VITE_API_BASE_URL"]);
export const clerkKey =
  import.meta.env["VITE_CLERK_PUBLISHABLE_KEY"]?.trim() || "";

export function integrationFlag(value: unknown) {
  if (value === undefined || value === "" || value === "false") return false;
  if (value === "true") return true;
  throw new Error("VITE_SERVICES_LIVE must be true or false.");
}
export const liveServices = integrationFlag(
  import.meta.env["VITE_SERVICES_LIVE"],
);
if (liveServices && !apiBaseUrl)
  throw new Error("VITE_SERVICES_LIVE requires VITE_API_BASE_URL.");
