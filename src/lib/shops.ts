import type { Result } from "./directory";
import type { Shop, DirectorySearch } from "./contracts";
export const shops = {
  supported: false,
  list: async (
    _search: DirectorySearch,
  ): Promise<Result<{ items: Shop[]; nextCursor: string | null }>> => ({
    state: "unavailable",
  }),
  detail: async (_slug: string): Promise<Result<Shop>> => ({
    state: "unavailable",
  }),
};
