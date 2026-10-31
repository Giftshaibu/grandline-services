import { EcosystemDiscovery } from "../components/ecosystem-navigation";
import { ListingCallout } from "../components/listing-callout";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/ArrowUpRight01Icon";
import { MarketplaceHero } from "../components/marketplace-hero";
import { Search } from "../components/search";
import { categories } from "../lib/categories";
export const Route = createFileRoute("/")({ component: Home });
function Home() {
  const navigate = useNavigate();
  return (
    <>
      <MarketplaceHero
        image="workshop"
        title="Your vehicle. The right people."
        description="Explore automotive shops, specialist services and spare parts across Malawi."
      >
        <a className="button" href="/shops">
          Browse shops →
        </a>
      </MarketplaceHero>
      <section className="wrap section">
        <h2>What does your vehicle need?</h2>
        <Search
          onSearch={(search) => {
            void navigate({ to: "/providers", search });
          }}
        />
        <div className="section-heading">
          <div>
            <h2>Explore automotive expertise</h2>
            <p className="muted">Start with the service you need.</p>
          </div>
          <Link to="/providers">All services →</Link>
        </div>
        <div className="category-list">
          {categories.map(([slug, name]) => (
            <Link
              key={slug}
              className="category-link"
              to="/providers"
              search={{ category: slug }}
            >
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={22} />
              {name}
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
      <EcosystemDiscovery />
      <section className="wrap help-band">
        <div>
          <h2>One shop. Services and spare parts.</h2>
          <p className="muted">
            Browse a business profile to explore its services and connect to
            spare parts on Auto Hub.
          </p>
        </div>
        <div>
          <h3>Built around your search</h3>
          <p className="muted">
            Individual sellers can still list spare parts. Shop-owned parts will
            connect to a shared business profile when the directory becomes
            available.
          </p>
        </div>
        <ListingCallout />
      </section>
    </>
  );
}
