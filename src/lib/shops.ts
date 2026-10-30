import { serviceCapabilities } from "./service-capabilities";
import { z } from "zod";
import {
  shopSchema,
  searchString,
  type DirectorySearch,
  type Shop,
} from "./contracts";
import type { Result } from "./directory";
import { liveServices, apiBaseUrl } from "./config";
const page = z.object({
  items: z.array(shopSchema),
  nextCursor: z.string().nullable(),
});
async function read<T>(
  path: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  signal?: AbortSignal,
): Promise<Result<T>> {
  if (!liveServices || !apiBaseUrl) return { state: "unavailable" };
  try {
    const capability = await serviceCapabilities(
      apiBaseUrl,
      fetch,
      false,
      signal,
    );
    if (capability.state !== "ready") return capability;
    const response = await fetch(
      `${apiBaseUrl}/api/v1/shops${path}`,
      signal ? { signal } : {},
    );
    if (response.status === 404) return { state: "not-found" };
    if (!response.ok) return { state: "error", reason: "server" };
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return { state: "error", reason: "invalid-response" };
    }
    const parsed = schema.safeParse(payload);
    return parsed.success
      ? { state: "ready", data: parsed.data }
      : { state: "error", reason: "invalid-response" };
  } catch (error) {
    if (signal?.aborted) throw error;
    return { state: "error", reason: "network" };
  }
}
export const shops = {
  supported: liveServices && !!apiBaseUrl,
  list: (
    search: DirectorySearch,
    cursor?: string,
    signal?: AbortSignal,
  ): Promise<Result<{ items: Shop[]; nextCursor: string | null }>> => {
    const query = new URLSearchParams(searchString(search));
    query.set("limit", "20");
    if (cursor) query.set("cursor", cursor);
    return read(`?${query}`, page, signal);
  },
  detail: (slug: string, signal?: AbortSignal): Promise<Result<Shop>> =>
    read(`/${encodeURIComponent(slug)}`, shopSchema, signal),
};
