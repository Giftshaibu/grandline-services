import { CatalogueCardFrame, CatalogueImage, CatalogueCardBody, CatalogueTitle } from "@grandline/ui";
import type { Entry } from "../lib/contracts";
export function ProviderCard({ entry }: { entry: Entry }) {
  return (
    <CatalogueCardFrame className="entry-card">
      <CatalogueImage src={entry.images[0]} alt={entry.name} />
      <CatalogueCardBody>
        {entry.reviewStatus === "pending" && <p className="grandline-public-review">Pending review</p>}
        <CatalogueTitle>
          <a href={`/providers/${encodeURIComponent(entry.slug)}`}>
            {entry.name}
          </a>
        </CatalogueTitle>
        <p className="grandline-card-meta">{entry.location}</p>
        <p className="grandline-card-meta">{entry.categories.join(" · ")}</p>
        <a
          className="button secondary"
          href={`/providers/${encodeURIComponent(entry.slug)}`}
        >
          View provider
        </a>
      </CatalogueCardBody>
    </CatalogueCardFrame>
  );
}
