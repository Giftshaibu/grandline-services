import { normalizeSearch, type DirectorySearch } from "../lib/contracts";
import { categories } from "../lib/categories";
export function Search({
  initial = {},
  onSearch,
}: {
  initial?: DirectorySearch;
  onSearch: (search: DirectorySearch) => void;
}) {
  return (
    <form
      className="search-panel"
      aria-label="Find automotive services"
      key={JSON.stringify(initial)}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onSearch(normalizeSearch(Object.fromEntries(form)));
      }}
    >
      <label>
        Service or expertise
        <input
          name="q"
          defaultValue={initial.q}
          placeholder="e.g. engine repair"
          maxLength={120}
        />
      </label>
      <label>
        Location
        <input
          name="location"
          defaultValue={initial.location}
          placeholder="Town or district"
          maxLength={120}
        />
      </label>
      <label>
        Service category
        <select name="category" defaultValue={initial.category || ""}>
          <option value="">All services</option>
          {categories.map(([slug, name]) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <button className="button" type="submit">
        Find providers
      </button>
    </form>
  );
}
