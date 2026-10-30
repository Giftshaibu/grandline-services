import { z } from "zod";
import type { BusinessApplication } from "./business-application";
const normalized = z.object({
  type: z.string(),
  name: z.string(),
  description: z.string(),
  location: z.string(),
  serviceAreas: z.array(z.string()),
  offerings: z.array(
    z.object({
      category: z.string(),
      description: z.string(),
      price: z.number().int().nonnegative().nullable(),
    }),
  ),
  contactName: z.string(),
  phone: z.string(),
  email: z.string(),
  publishPhone: z.boolean(),
});
export function serviceDraft(
  draft: BusinessApplication,
  publishPhone: boolean,
) {
  return normalized.parse({
    type: draft.type,
    name: draft.name,
    description: draft.description,
    location: draft.location,
    serviceAreas: draft.areas
      .split(/[,\n]/)
      .map((area) => area.trim())
      .filter(Boolean),
    offerings: draft.offerings.map(({ category, description, price }) => ({
      category,
      description,
      price: price.trim() ? Number(price.replace(/,/g, "")) : null,
    })),
    contactName: draft.contactName,
    phone: draft.phone,
    email: draft.email,
    publishPhone,
  });
}
export function restoreServiceDraft(input: unknown) {
  const value = normalized.parse(input);
  const draft: BusinessApplication = {
    type: value.type,
    name: value.name,
    description: value.description,
    location: value.location,
    areas: value.serviceAreas.join(", "),
    contactName: value.contactName,
    phone: value.phone,
    email: value.email,
    offerings: value.offerings.map((item, index) => ({
      ...item,
      id: `saved-${index}`,
      price: item.price === null ? "" : String(item.price),
    })),
  };
  return { draft, publishPhone: value.publishPhone };
}
