import { ListingCallout } from "../components/listing-callout";
import { SampleCatalogue } from "../components/sample-catalogue";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { normalizeSearch } from "../lib/contracts";
import { shops } from "../lib/shops";
import { Search } from "../components/search";
import { MarketplaceHero } from "../components/marketplace-hero";
import { Availability } from "../components/availability";
export const Route = createFileRoute("/shops/")({
  validateSearch: normalizeSearch,
  component: Shops,
});
function Shops() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const query = useInfiniteQuery({
    queryKey: ["shops", search],
    queryFn: ({ signal, pageParam }) => shops.list(search, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) =>
      page.state === "ready" ? (page.data.nextCursor ?? undefined) : undefined,
    retry: false,
    enabled: shops.supported,
    ...(!shops.supported
      ? {
          initialData: {
            pages: [
              { state: "unavailable" } as Awaited<
                ReturnType<typeof shops.list>
              >,
            ],
            pageParams: [undefined],
          },
        }
      : {}),
  });
  const result = query.data?.pages.at(-1);
  const items =
    query.data?.pages.flatMap((page) =>
      page.state === "ready" ? page.data.items : [],
    ) ?? [];
  return (
    <>
      <div className="browse-hero">
        <MarketplaceHero
          image="workshop"
          title="Find your next automotive shop"
          description="Browse businesses by expertise and location. Services and spare parts, connected through one shop profile."
        />
      </div>
      <section className="wrap section">
        <Search
          initial={search}
          onSearch={(search) => {
            void navigate({ search });
          }}
        />
        <p className="criteria">
          {Object.values(search).filter(Boolean).join(" · ") || "All shops"} ·{" "}
          <a href="/shops">Clear search</a>
        </p>
        {!shops.supported && result?.state === "unavailable" ? (
          <SampleCatalogue search={search} />
        ) : (
          <Availability
            result={
              query.isError ? { state: "error", reason: "network" } : result
            }
            pending={query.isPending}
            retry={() => void query.refetch()}
          />
        )}
        {result?.state === "ready" && (
          <div className="cards">
            {items.map((shop) => (
              <article key={shop.id} className="entry-card">
                <div className="card-body">
                  <h2>
                    <a href={`/shops/${encodeURIComponent(shop.slug)}`}>
                      {shop.name}
                    </a>
                  </h2>
                  <p>{shop.location}</p>
                  <p>{shop.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
        {result?.state === "ready" && !items.length && (
          <div className="availability">
            <h2>No shops match this search.</h2>
            <p>Try another service or location.</p>
          </div>
        )}
        {query.hasNextPage && (
          <button
            className="button secondary"
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            Load more shops
          </button>
        )}
        <ListingCallout />
      </section>
    </>
  );
}
