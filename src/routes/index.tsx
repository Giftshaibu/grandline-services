import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/ArrowUpRight01Icon";
import { Search } from "../components/search";
import { categories } from "../lib/categories";
export const Route = createFileRoute("/")({ component: Home });
function Home() {
  const navigate = useNavigate();
  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <div>
            <p className="product-label">Grandline Services</p>
            <h1>
              The right expertise.
              <br />
              For your next repair.
            </h1>
            <p>
              Explore automotive services across Malawi, from everyday
              maintenance to specialist repairs.
            </p>
          </div>
          <div className="hero-aside">
            <h2>Find the people who know your vehicle.</h2>
            <p>
              Search by service and location. Provider profiles and direct
              enquiries will open when our directory is ready.
            </p>
          </div>
        </div>
      </section>
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
      <section className="wrap help-band">
        <div>
          <h2>A clearer view before you enquire.</h2>
          <p className="muted">
            Profiles will bring service expertise, location and available
            contact information together.
          </p>
        </div>
        <div>
          <h3>Built around your search</h3>
          <p className="muted">
            We’ll show provider information as it becomes available. Ratings and
            verification badges will only appear when supported by real data.
          </p>
        </div>
      </section>
    </>
  );
}
