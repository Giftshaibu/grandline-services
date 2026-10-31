import { ShopStock } from "./shop-stock";
import { liveServices } from "../lib/config";
import type { Shop } from "../lib/contracts";
import { ecosystem } from "../lib/config";
export function ShopProfile({ shop }: { shop: Shop }) {
  const hub = ecosystem.find((item) => item.label === "Auto Hub")?.url;
  return (
    <article>
      <h1 className="directory-title">{shop.name}</h1>
      <p className="muted">{shop.location}</p>
      {shop.images[0] && (
        <img className="detail-image" src={shop.images[0]} alt={shop.name} />
      )}
      <p>{shop.description}</p>
      <div className="contact-links">
        {shop.contact.phone && (
          <a href={`tel:${shop.contact.phone}`}>Call shop</a>
        )}
        {shop.contact.whatsapp && (
          <a href={`https://wa.me/${shop.contact.whatsapp.replace(/\D/g, "")}`}>
            WhatsApp shop
          </a>
        )}
      </div>
      <nav className="shop-tabs" aria-label="Shop sections">
        <a href="#shop-services">Services</a>
        <a href="#shop-parts">Spare parts</a>
        <a href="#shop-vehicles">Vehicles</a>
      </nav>
      <section id="shop-services">
        <h2>Services</h2>
        {shop.services.length ? (
          shop.services.map((service) => (
            <div key={service.name} className="review-panel">
              <h3>{service.name}</h3>
              {service.description && <p>{service.description}</p>}
            </div>
          ))
        ) : (
          <p>Service details have not been supplied.</p>
        )}
      </section>
      {liveServices ? (
        <ShopStock slug={shop.slug} kind="spare-parts" />
      ) : (
        <ShopParts hub={hub} />
      )}
      <ShopStock slug={shop.slug} kind="vehicles" />
    </article>
  );
}
export function ShopParts({ hub }: { hub: string | undefined }) {
  return (
    <section id="shop-parts" className="review-panel">
      <h2>Spare parts</h2>
      <p>
        Shop-linked inventory is not available yet. Individual spare-part
        listings remain available through Auto Hub.
      </p>
      {hub ? (
        <a className="button secondary" href={`${hub}/parts`}>
          Browse all spare parts on Auto Hub ↗
        </a>
      ) : (
        <p className="local-preview-note">
          Spare-part browsing is currently unavailable from this page.
        </p>
      )}
    </section>
  );
}
