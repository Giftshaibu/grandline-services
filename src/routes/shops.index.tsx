import { ListingCallout } from "../components/listing-callout";
import { SampleCatalogue } from "../components/sample-catalogue";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
  const query = useQuery({
    queryKey: ["shops", search],
    queryFn: () => shops.list(search),
    enabled: shops.supported,
    initialData: { state: "unavailable" } as Awaited<
      ReturnType<typeof shops.list>
    >,
  });
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
        {query.data.state === "unavailable" ? (
          <SampleCatalogue search={search} />
        ) : (
          <Availability result={query.data} pending={query.isPending} />
        )}
        {query.data.state === "ready" && (
          <div className="cards">
            {query.data.data.items.map((shop) => (
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
        <ListingCallout />
      </section>
    </>
  );
}
