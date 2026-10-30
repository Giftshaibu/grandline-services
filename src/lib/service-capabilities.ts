import { z } from "zod";
import type { Result } from "./directory";
const schema = z.object({
  services: z.object({ discovery: z.boolean(), enquiries: z.boolean() }),
});
export async function serviceCapabilities(
  base: string,
  transport: typeof fetch,
  enquiry = false,
  signal?: AbortSignal,
): Promise<Result<true>> {
  let response: Response;
  try {
    response = await transport(
      base.replace(/\/$/, "") + "/api/v1/capabilities",
      signal ? { signal } : {},
    );
  } catch (error) {
    if (signal?.aborted) throw error;
    return { state: "error", reason: "network" };
  }
  if (response.status === 404 || response.status === 503)
    return { state: "unavailable" };
  if (!response.ok)
    return {
      state: "error",
      reason:
        response.status === 429
          ? "rate-limit"
          : response.status === 401 || response.status === 403
            ? "unauthorized"
            : "server",
    };
  try {
    const result = schema.safeParse(await response.json());
    if (!result.success) return { state: "error", reason: "invalid-response" };
    return result.data.services.discovery &&
      (!enquiry || result.data.services.enquiries)
      ? { state: "ready", data: true }
      : { state: "unavailable" };
  } catch {
    return { state: "error", reason: "invalid-response" };
  }
}
