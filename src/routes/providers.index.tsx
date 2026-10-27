import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { normalizeSearch } from "../lib/contracts";
import { directory } from "../lib/directory";
import { Search } from "../components/search";
import { Availability } from "../components/availability";
import { ProviderCard } from "../components/provider-card";
export const Route = createFileRoute("/providers/")({
  validateSearch: normalizeSearch,
  component: Providers,
});
function Providers() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const query = useInfiniteQuery({
    enabled: directory.supported,
    ...(!directory.supported
      ? {
          initialData: {
            pages: [
              { state: "unavailable" } as Awaited<
                ReturnType<typeof directory.list>
              >,
            ],
            pageParams: [undefined],
          },
        }
      : {}),
    queryKey: ["providers", search],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      directory.list(search, undefined, signal, pageParam),
    getNextPageParam: (page) =>
      page.state === "ready" ? (page.data.nextCursor ?? undefined) : undefined,
    retry: false,
  });
  const result = query.data?.pages.at(-1);
  const entries =
    query.data?.pages.flatMap((page) =>
      page.state === "ready" ? page.data.items : [],
    ) ?? [];
  return (
    <section className="wrap section">
      <h1 className="directory-title">Find a service provider</h1>
      <p className="muted">Search expertise and location across Malawi.</p>
      <Search
        initial={search}
        onSearch={(search) => {
          void navigate({ search });
        }}
      />
      <p className="criteria">
        {Object.values(search).filter(Boolean).length
          ? `Search criteria: ${Object.values(search).filter(Boolean).join(" · ")}`
          : "All service categories"}{" "}
        ·{" "}
        <button
          onClick={() => {
            void navigate({ search: {} });
          }}
        >
          Clear search
        </button>
      </p>
      <Availability
        result={query.isError ? { state: "error", reason: "network" } : result}
        pending={query.isPending}
        retry={() => {
          void query.refetch();
        }}
      />
      {result?.state === "ready" &&
        (entries.length ? (
          <>
            <div className="cards">
              {entries.map((entry) => (
                <ProviderCard key={entry.id} entry={entry} />
              ))}
            </div>
            {query.hasNextPage && (
              <button
                className="button secondary"
                disabled={query.isFetchingNextPage}
                onClick={() => {
                  void query.fetchNextPage();
                }}
              >
                Load more providers
              </button>
            )}
          </>
        ) : (
          <div className="availability">
            <h2>No providers match this search.</h2>
            <p>Try another service or location.</p>
          </div>
        ))}
    </section>
  );
}
