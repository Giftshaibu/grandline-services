import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { directory } from "../lib/directory";
import { Availability } from "../components/availability";
import { Enquiry } from "../components/enquiry";
export const Route = createFileRoute("/providers/$slug")({
  component: Profile,
});
function Profile() {
  const { slug } = Route.useParams();
  const query = useQuery({
    enabled: directory.supported,
    ...(!directory.supported
      ? {
          initialData: { state: "unavailable" } as Awaited<
            ReturnType<typeof directory.detail>
          >,
        }
      : {}),
    queryKey: ["provider", slug],
    queryFn: ({ signal }) => directory.detail(slug, undefined, signal),
    retry: false,
  });
  const result = query.data;
  return (
    <section className="wrap section">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Services</Link>
        <span>/</span>
        <Link to="/providers">Providers</Link>
      </nav>
      {result?.state === "ready" ? (
        <div className="detail-layout">
          <article>
            <h1 className="directory-title">{result.data.name}</h1>
            <p>{result.data.location}</p>
            {result.data.images[0] && (
              <img
                className="detail-image"
                src={result.data.images[0]}
                alt={result.data.name}
              />
            )}
            <p>{result.data.description}</p>
            <h2>Expertise</h2>
            <p>{result.data.categories.join(" · ")}</p>
            {result.data.supportedMakes?.length ? (
              <p>Vehicle makes: {result.data.supportedMakes.join(", ")}</p>
            ) : null}
            {result.data.serviceArea.length ? (
              <p>Service areas: {result.data.serviceArea.join(", ")}</p>
            ) : null}
            {result.data.operatingHours?.length ? (
              <dl className="facts">
                {result.data.operatingHours.map((item) => (
                  <div key={item.day}>
                    <dt>{item.day}</dt>
                    <dd>{item.hours}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <div className="contact-links">
              {result.data.contact.phone && (
                <a href={`tel:${result.data.contact.phone}`}>Call provider</a>
              )}
              {result.data.contact.whatsapp && (
                <a
                  href={`https://wa.me/${result.data.contact.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </article>
          <Enquiry />
        </div>
      ) : (
        <>
          <h1 className="directory-title">Provider details</h1>
          <Availability
            result={
              query.isError ? { state: "error", reason: "network" } : result
            }
            pending={query.isPending}
            retry={() => {
              void query.refetch();
            }}
          />
          <Enquiry />
        </>
      )}
    </section>
  );
}
