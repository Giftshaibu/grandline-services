import type { Entry, Shop, DirectorySearch } from "./contracts";
import { categories } from "./categories";
export const sampleShops: Shop[] = categories.map(
  ([category, label], index) => ({
    id: `00000000-0000-4000-8000-${String(index + 10).padStart(12, "0")}`,
    slug: `sample-${category}`,
    name: `Example ${label.toLowerCase()} shop`,
    description:
      "An illustrative shop profile for exploring the directory layout. This is not a real business, service offer or spare-part seller.",
    location:
      index % 3 === 0 ? "Lilongwe" : index % 3 === 1 ? "Blantyre" : "Mzuzu",
    serviceArea: [],
    images: ["/marketplace-workshop.jpg"],
    contact: {},
    services: [
      {
        name: label,
        category,
        description:
          "Sample service description. Enquiries and bookings are unavailable.",
      },
    ],
  }),
);
export const sampleProviders: Entry[] = sampleShops.map((shop) => ({
  ...shop,
  categories: shop.services.map((service) => service.category),
}));
export function sampleResults(search: DirectorySearch) {
  return sampleShops.filter(
    (shop) =>
      (!search.category ||
        shop.services.some(
          (service) => service.category === search.category,
        )) &&
      (!search.location ||
        shop.location.toLowerCase().includes(search.location.toLowerCase())) &&
      (!search.q ||
        `${shop.name} ${shop.description} ${shop.services.map((service) => service.name).join(" ")}`
          .toLowerCase()
          .includes(search.q.toLowerCase())),
  );
}
