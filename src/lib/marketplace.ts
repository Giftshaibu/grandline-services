import { categories } from "./categories";
export const marketplaceLinks = [
  {
    href: "/shops",
    label: "Shops",
    description: "Browse automotive businesses",
  },
  {
    href: "/providers",
    label: "Services",
    description: "Find expertise by category",
  },
] as const;
export const productName: string = "Services";
export const searchDestination = "/shops";

export function categoryLinks(href: string): { href: string; label: string }[] {
  return categories.map(([slug, label]) => ({
    href: `${href}?category=${encodeURIComponent(slug)}`,
    label,
  }));
}

export const listingAction = {
  href: "/list-your-business",
  label: "List your business",
} as const;
