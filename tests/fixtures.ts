// Isolated test fixtures. Never import from application source.
export const provider = {
  id: "12345678-1234-4234-8234-123456789012",
  slug: "fixture-provider",
  name: "Fixture Workshop",
  description: "Test-only provider description",
  location: "Lilongwe",
  serviceArea: ["Lilongwe"],
  images: [],
  contact: {},
};
export const entry = { ...provider, categories: ["mechanics"] };
