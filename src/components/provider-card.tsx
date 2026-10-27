import type { Entry } from "../lib/contracts";
export function ProviderCard({ entry }: { entry: Entry }) {
  return (
    <article className="entry-card">
      {entry.images[0] && (
        <img src={entry.images[0]} alt={entry.name} loading="lazy" />
      )}
      <div className="card-body">
        <h3>
          <a href={`/providers/${encodeURIComponent(entry.slug)}`}>
            {entry.name}
          </a>
        </h3>
        <p>{entry.location}</p>
        <p className="muted">{entry.categories.join(" · ")}</p>
        <a
          className="button secondary"
          href={`/providers/${encodeURIComponent(entry.slug)}`}
        >
          View provider
        </a>
      </div>
    </article>
  );
}
