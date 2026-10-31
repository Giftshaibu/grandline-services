import { z } from "zod";
const text = z.string().trim().min(1).max(300);
export const safeUrl = z
  .string()
  .url()
  .refine((value) => {
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "HTTP(S) URL required");
export const contactSchema = z.object({
  phone: text.optional(),
  whatsapp: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/)
    .optional(),
});
export const providerSchema = z.object({
  id: z.string().uuid(),
  slug: text,
  name: text,
  description: z.string().trim().min(1).max(2000),
  location: text,
  serviceArea: z.array(text).default([]),
  images: z.array(safeUrl).default([]),
  contact: contactSchema,
});
export const categorySchema = z.object({ slug: text, name: text });
export const searchSchema = z.object({
  q: z.string().trim().max(120).catch("").optional(),
  location: z.string().trim().max(120).catch("").optional(),
  category: z.string().trim().max(80).catch("").optional(),
});
export type DirectorySearch = z.infer<typeof searchSchema>;
export function normalizeSearch(input: unknown): DirectorySearch {
  return Object.fromEntries(
    Object.entries(searchSchema.parse(input)).filter(([, value]) => value),
  );
}
export function searchString(input: DirectorySearch) {
  return new URLSearchParams(
    normalizeSearch(input) as Record<string, string>,
  ).toString();
}
export const enquirySchema = z.object({
  listingId: z.string().uuid(),
  message: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters.")
    .max(2000),
  requestKey: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  email: z.string().email().max(254),
});
export const enquiryReceiptSchema = z.object({
  id: z.string().uuid(),
  status: z.literal("submitted"),
});
export type Enquiry = z.infer<typeof enquirySchema>;
export const entrySchema = providerSchema.extend({
  businessSlug: text.optional(),
  categories: z.array(text).min(1),
  supportedMakes: z.array(text).optional(),
  operatingHours: z.array(z.object({ day: text, hours: text })).optional(),
});
export const pageSchema = z.object({
  items: z.array(entrySchema),
  nextCursor: z.string().nullable(),
});
export type Entry = z.infer<typeof entrySchema>;

// Proposed unified identity; not an implemented backend API.
export const shopSchema = providerSchema.extend({
  services: z
    .array(
      z.object({
        name: text,
        description: z.string().max(2000).optional(),
        category: text,
      }),
    )
    .default([]),
});
export type Shop = z.infer<typeof shopSchema>;
