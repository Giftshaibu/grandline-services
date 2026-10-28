import { useState } from "react";
import type { DirectorySearch } from "../lib/contracts";
import { sampleResults } from "../lib/sample-catalogue";
import { SampleNotice } from "./sample-notice";
export function SampleCatalogue({
  search,
  mode = "shops",
}: {
  search: DirectorySearch;
  mode?: "shops" | "providers";
}) {
  const [sort, setSort] = useState("name");
  const entries = [...sampleResults(search)].sort((a, b) =>
    sort === "location"
      ? a.location.localeCompare(b.location)
      : a.name.localeCompare(b.name),
  );
  return (
    <section aria-label="Sample catalogue">
      <SampleNotice />
      <div className="catalogue-toolbar">
        <p>{entries.length} sample listings · not live businesses</p>
        <label>
          Sort sample listings
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="name">Name</option>
            <option value="location">Location</option>
          </select>
        </label>
      </div>
      {entries.length ? (
        <div className="cards">
          {entries.map((shop) => (
            <article key={shop.slug} className="entry-card sample-card">
              <a
                href={`/${mode}/${shop.slug}`}
                className="sample-media"
                aria-label={`View ${shop.name}`}
              >
                <img src={shop.images[0]} alt="" loading="lazy" />
                <span>Illustrative photo</span>
              </a>
              <div className="card-body">
                <span className="sample-label">
                  Sample {mode === "shops" ? "shop" : "provider"}
                </span>
                <h3>
                  <a href={`/${mode}/${shop.slug}`}>{shop.name}</a>
                </h3>
                <p>{shop.location}</p>
                <p className="muted sample-description">
                  {shop.services.map((service) => service.name).join(" · ")}
                </p>
                <a className="button secondary" href={`/${mode}/${shop.slug}`}>
                  View sample details →
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="catalogue-empty">
          <h2>No sample listings match these filters.</h2>
          <p>
            Try another category or location. This does not reflect real
            businesses.
          </p>
          <a href={`/${mode}`}>Clear sample filters</a>
        </div>
      )}
    </section>
  );
}
