import { useInfiniteQuery } from "@tanstack/react-query";
import { shopStock, type StockKind } from "../lib/shop-stock";
import { ecosystem, liveServices } from "../lib/config";
import { Availability } from "./availability";
function ConnectedStock({ slug, kind }: { slug: string; kind: StockKind }) {
  const hub = ecosystem.find((item) => item.label === "Auto Hub")?.url;
  const title = kind === "vehicles" ? "Vehicles" : "Spare parts";
  const query = useInfiniteQuery({
    queryKey: ["shop-stock", kind, slug],
    enabled: liveServices,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      shopStock(kind, slug, pageParam, signal),
    getNextPageParam: (page) =>
      page.state === "ready" ? (page.data.nextCursor ?? undefined) : undefined,
    ...(!liveServices
      ? {
          initialData: {
            pages: [{ state: "unavailable" as const }],
            pageParams: [undefined],
          },
        }
      : {}),
    retry: false,
  });
  const result = query.data?.pages.at(-1);
  const items =
    query.data?.pages.flatMap((page) =>
      page.state === "ready" ? page.data.items : [],
    ) ?? [];
  return (
    <section
      id={kind === "vehicles" ? "shop-vehicles" : "shop-parts"}
      className="section"
    >
      <h2>{title}</h2>
      {result?.state === "unavailable" ? (
        <p>
          Connected {title.toLowerCase()} inventory is unavailable for this shop
          on this deployment.
        </p>
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
        <>
          <p>
            {result.data.total} published{" "}
            {kind === "vehicles" ? "vehicles" : "spare parts"} associated with
            this shop.
          </p>
          {!items.length ? (
            <p>
              No published {title.toLowerCase()} are currently associated with
              this shop.
            </p>
          ) : (
            <div className="cards">
              {items.map((item) => (
                <article className="entry-card" key={item.id}>
                  {item.images[0] && (
                    <img
                      className="card-image"
                      src={item.images[0]}
                      alt={item.title}
                      loading="lazy"
                    />
                  )}
                  <div className="card-body">
                    <h3>
                      {hub ? (
                        <a
                          href={`${hub}/${kind === "vehicles" ? "vehicles" : "parts"}/${encodeURIComponent(item.slug)}`}
                        >
                          {item.title} ↗
                        </a>
                      ) : (
                        item.title
                      )}
                    </h3>
                    <p>{item.location}</p>
                    <p className="card-price">
                      MK {item.price.toLocaleString("en-MW")}
                    </p>
                    {!hub && <p>Auto Hub links are not configured.</p>}
                  </div>
                </article>
              ))}
            </div>
          )}
          {query.hasNextPage && (
            <button
              type="button"
              className="button secondary"
              disabled={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              Load more {title.toLowerCase()}
            </button>
          )}
        </>
      )}
      {hub && (
        <a href={`${hub}/${kind === "vehicles" ? "vehicles" : "parts"}`}>
          Browse all {title.toLowerCase()} on Auto Hub ↗
        </a>
      )}
    </section>
  );
}

export function ShopStock({ slug, kind }: { slug: string; kind: StockKind }) {
  const hub = ecosystem.find((item) => item.label === "Auto Hub")?.url;
  const title = kind === "vehicles" ? "Vehicles" : "Spare parts";
  return liveServices ? (
    <ConnectedStock slug={slug} kind={kind} />
  ) : (
    <section
      id={kind === "vehicles" ? "shop-vehicles" : "shop-parts"}
      className="section"
    >
      <h2>{title}</h2>
      <p>
        Connected {title.toLowerCase()} inventory is unavailable in this
        preview.
      </p>
      {hub && (
        <a href={`${hub}/${kind === "vehicles" ? "vehicles" : "parts"}`}>
          Browse all {title.toLowerCase()} on Auto Hub ↗
        </a>
      )}
    </section>
  );
}
