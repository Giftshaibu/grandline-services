import { categories } from "./categories";
import { contactErrors, required, wholeNumber } from "./application-validation";
export type ServiceOffering = {
  id: string;
  category: string;
  description: string;
  price: string;
};
export type BusinessApplication = {
  type: string;
  name: string;
  description: string;
  location: string;
  areas: string;
  contactName: string;
  phone: string;
  email: string;
  offerings: ServiceOffering[];
};
export function emptyBusinessApplication(): BusinessApplication {
  return {
    type: "",
    name: "",
    description: "",
    location: "",
    areas: "",
    contactName: "",
    phone: "",
    email: "",
    offerings: [{ id: "service-1", category: "", description: "", price: "" }],
  };
}
export const businessSteps = [
  "Business type",
  "Business details",
  "Services",
  "Photos",
  "Contact details",
  "Review",
];
export function businessErrors(draft: BusinessApplication, step: number) {
  const errors: Record<string, string> = {};
  const check = (name: string, error: string) => {
    if (error) errors[name] = error;
  };
  if (step === 0 && !["shop", "mobile"].includes(draft.type))
    errors["type"] = "Choose a shop or independent/mobile provider.";
  if (step === 1) {
    check("name", required(draft.name, "Business name"));
    check(
      "description",
      required(draft.description, "Business description", 10),
    );
    check("location", required(draft.location, "Base location"));
    if (draft.type === "mobile")
      check("areas", required(draft.areas, "Service areas"));
  }
  if (step === 2) {
    if (!draft.offerings.length)
      errors["offerings"] = "Add at least one service.";
    draft.offerings.forEach((service, index) => {
      if (!categories.some(([slug]) => slug === service.category))
        errors[`services.${index}.category`] = "Choose a service category.";
      check(
        `services.${index}.description`,
        required(service.description, "Service description", 10),
      );
      check(
        `services.${index}.price`,
        wholeNumber(service.price, "Advertised price"),
      );
    });
  }
  if (step === 4) return contactErrors(draft);
  return errors;
}
const rates: Record<string, number> = {
  mechanics: 20000,
  garages: 50000,
  "auto-electricians": 20000,
  diagnostics: 20000,
  "body-repair": 50000,
  tyres: 50000,
  batteries: 50000,
  "air-conditioning": 20000,
};
export function businessFeeRows(draft: BusinessApplication) {
  const rows =
    draft.type === "shop" ? [{ label: "Auto shops", amount: 50000 }] : [];
  for (const category of new Set(
    draft.offerings.map((service) => service.category),
  )) {
    const amount = rates[category];
    const label = categories.find(([slug]) => slug === category)?.[1];
    if (amount && label) rows.push({ label, amount });
  }
  return rows;
}
export function serviceLabel(category: string) {
  return categories.find(([slug]) => slug === category)?.[1] ?? category;
}
