import { sampleShops } from "../lib/sample-catalogue";
import { SampleNotice } from "../components/sample-notice";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { shops } from "../lib/shops";
import { ecosystem } from "../lib/config";
import { ShopProfile, ShopParts } from "../components/shop-profile";
import { Availability } from "../components/availability";
import { Enquiry } from "../components/enquiry";
export const Route = createFileRoute("/shops/$slug")({
  head: ({ params }) =>
    params.slug.startsWith("sample-")
      ? { meta: [{ name: "robots", content: "noindex,nofollow" }] }
      : {},
  component: ShopDetail,
});
function ShopDetail() {
  const { slug } = Route.useParams();
  const query = useQuery({
    queryKey: ["shop", slug],
    queryFn: () => shops.detail(slug),
    enabled: shops.supported,
    ...(!shops.supported
      ? {
          initialData: { state: "unavailable" } as Awaited<
            ReturnType<typeof shops.detail>
          >,
        }
      : {}),
    retry: false,
  });
  const sample = !shops.supported
    ? sampleShops.find((shop) => shop.slug === slug)
    : undefined;
  return (
    <section className="wrap section">
      {sample && <SampleNotice />}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Services</a>
        <span>/</span>
        <a href="/shops">Shops</a>
      </nav>
      {sample ? (
        <ShopProfile shop={sample} />
      ) : query.data?.state === "ready" ? (
        <ShopProfile shop={query.data.data} />
      ) : (
        <>
          <h1 className="directory-title">Shop details</h1>
          <Availability
            result={
              query.isError ? { state: "error", reason: "network" } : query.data
            }
            pending={query.isPending}
          />
          <nav className="shop-tabs" aria-label="Shop sections">
            <a href="#shop-services">Services</a>
            <a href="#shop-parts">Spare parts</a>
          </nav>
          <section id="shop-services">
            <h2>Services</h2>
            <p>Shop services will appear when the directory is connected.</p>
          </section>
          <ShopParts
            hub={ecosystem.find((item) => item.label === "Auto Hub")?.url}
          />
        </>
      )}
      <Enquiry
        {...(query.data?.state === "ready"
          ? { listingId: query.data.data.id }
          : {})}
      />
    </section>
  );
}
