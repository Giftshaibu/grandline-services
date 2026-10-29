import { ApplicationField as Field } from "./application-fields";
import { categories } from "../lib/categories";
import type {
  BusinessApplication,
  ServiceOffering,
} from "../lib/business-application";
type Props = {
  draft: BusinessApplication;
  update: (
    field: keyof Omit<BusinessApplication, "offerings">,
    value: string,
  ) => void;
  updateService: (
    index: number,
    field: keyof ServiceOffering,
    value: string,
  ) => void;
  addService: () => void;
  removeService: (index: number) => void;
  step: number;
};
export function BusinessApplicationFields({
  draft,
  update,
  updateService,
  addService,
  removeService,
  step,
}: Props) {
  if (step === 0)
    return (
      <>
        <Field name="type" label="Business type">
          <select
            value={draft.type}
            onChange={(event) => update("type", event.target.value)}
          >
            <option value="">Choose a business type</option>
            <option value="shop">Physical shop or garage</option>
            <option value="mobile">
              Independent or mobile service provider
            </option>
          </select>
        </Field>
        <p className="muted">
          Use one business identity for all your services. You do not need a
          physical shop to prepare an application.
        </p>
      </>
    );
  if (step === 1)
    return (
      <div className="application-form-grid">
        <Field name="name" label="Business or provider name">
          <input
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
            maxLength={120}
          />
        </Field>
        <Field name="location" label="Base location">
          <input
            value={draft.location}
            onChange={(event) => update("location", event.target.value)}
            maxLength={120}
            placeholder="Town or district"
          />
        </Field>
        <div className="application-wide">
          <Field name="description" label="Business description">
            <textarea
              value={draft.description}
              onChange={(event) => update("description", event.target.value)}
              minLength={10}
              maxLength={2000}
            />
          </Field>
        </div>
        <div className="application-wide">
          <Field
            name="areas"
            label={
              draft.type === "mobile"
                ? "Service areas"
                : "Service areas (optional)"
            }
            hint="Separate towns or districts with commas."
          >
            <input
              value={draft.areas}
              onChange={(event) => update("areas", event.target.value)}
              maxLength={500}
            />
          </Field>
        </div>
      </div>
    );
  if (step === 2)
    return (
      <>
        <p className="muted">
          Add the services offered by this business. Advertised prices are
          optional whole-MWK service prices, not monthly listing fees.
        </p>
        {draft.offerings.map((service, index) => (
          <section className="application-service" key={service.id}>
            <div>
              <h3>Service {index + 1}</h3>
              <button
                className="text-action"
                type="button"
                disabled={draft.offerings.length === 1}
                onClick={() => removeService(index)}
                aria-label={`Remove service ${index + 1}`}
              >
                Remove service
              </button>
            </div>
            <div className="application-form-grid">
              <Field
                name={`services.${index}.category`}
                label={`Service ${index + 1} category`}
              >
                <select
                  value={service.category}
                  onChange={(event) =>
                    updateService(index, "category", event.target.value)
                  }
                >
                  <option value="">Choose a category</option>
                  {categories.map(([slug, label]) => (
                    <option key={slug} value={slug}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                name={`services.${index}.price`}
                label={`Service ${index + 1} advertised price (MWK, optional)`}
              >
                <input
                  inputMode="numeric"
                  value={service.price}
                  onChange={(event) =>
                    updateService(index, "price", event.target.value)
                  }
                  maxLength={16}
                />
              </Field>
              <div className="application-wide">
                <Field
                  name={`services.${index}.description`}
                  label={`Service ${index + 1} description`}
                >
                  <textarea
                    value={service.description}
                    onChange={(event) =>
                      updateService(index, "description", event.target.value)
                    }
                    minLength={10}
                    maxLength={2000}
                  />
                </Field>
              </div>
            </div>
          </section>
        ))}
        <button
          className="button secondary"
          type="button"
          disabled={draft.offerings.length >= 20}
          onClick={addService}
        >
          Add another service
        </button>
        <p className="field-hint">
          Up to 20 service offerings in this preview.
        </p>
      </>
    );
  return (
    <div className="application-form-grid">
      <Field name="contactName" label="Contact name">
        <input
          value={draft.contactName}
          onChange={(event) => update("contactName", event.target.value)}
          autoComplete="name"
          maxLength={120}
        />
      </Field>
      <Field name="phone" label="Contact phone">
        <input
          type="tel"
          value={draft.phone}
          onChange={(event) => update("phone", event.target.value)}
          autoComplete="tel"
          maxLength={30}
        />
      </Field>
      <div className="application-wide">
        <Field name="email" label="Contact email">
          <input
            type="email"
            value={draft.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
            maxLength={254}
          />
        </Field>
      </div>
    </div>
  );
}
