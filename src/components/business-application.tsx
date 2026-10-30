import { LiveApplicationActions } from "./live-application-actions";
import { liveServices } from "../lib/config";
import { useRef, useState } from "react";
import { ApplicationWizard } from "./application-wizard";
import {
  ApplicationPhotos,
  PhotoGallery,
  useApplicationPhotos,
} from "./application-photos";
import {
  ReviewSection,
  ReviewFacts,
  ListingFeeGuide,
} from "./application-fields";
import { BusinessApplicationFields } from "./business-application-fields";
import {
  businessSteps,
  businessErrors,
  businessFeeRows,
  emptyBusinessApplication,
  serviceLabel,
  type BusinessApplication,
  type ServiceOffering,
} from "../lib/business-application";
import { optionalPrice } from "../lib/application-validation";
import { ecosystem } from "../lib/config";
export function BusinessApplicationFlow() {
  const [draft, setDraft] = useState(emptyBusinessApplication);
  const photos = useApplicationPhotos();
  const nextService = useRef(2);
  const [resetKey, setResetKey] = useState(0);
  const hub = ecosystem.find((item) => item.label === "Auto Hub")?.url;
  const update = (
    field: keyof Omit<BusinessApplication, "offerings">,
    value: string,
  ) => setDraft((previous) => ({ ...previous, [field]: value }));
  const updateService = (
    index: number,
    field: keyof ServiceOffering,
    value: string,
  ) =>
    setDraft((previous) => ({
      ...previous,
      offerings: previous.offerings.map((service, item) =>
        item === index ? { ...service, [field]: value } : service,
      ),
    }));
  return (
    <ApplicationWizard
      title="List your business"
      steps={businessSteps}
      validateStep={(step) => businessErrors(draft, step)}
      onReset={() => {
        setDraft(emptyBusinessApplication());
        photos.setFiles([]);
        nextService.current = 2;
        setResetKey((value) => value + 1);
      }}
      {...(liveServices
        ? {
            liveActions: (review: boolean) => (
              <LiveApplicationActions
                key={resetKey}
                draft={draft}
                files={photos.files}
                review={review}
                onRestore={(value) => {
                  setDraft(value);
                  photos.setFiles([]);
                }}
              />
            ),
          }
        : {})}
      fees={<ListingFeeGuide rows={businessFeeRows(draft)} />}
      renderStep={(step) =>
        step === 3 ? (
          <ApplicationPhotos
            files={photos.files}
            previews={photos.previews}
            onChange={photos.setFiles}
          />
        ) : (
          <BusinessApplicationFields
            step={step}
            draft={draft}
            update={update}
            updateService={updateService}
            addService={() => {
              const id = `service-${nextService.current++}`;
              setDraft((previous) => ({
                ...previous,
                offerings: [
                  ...previous.offerings,
                  { id, category: "", description: "", price: "" },
                ],
              }));
            }}
            removeService={(index) =>
              setDraft((previous) => ({
                ...previous,
                offerings: previous.offerings.filter(
                  (_, item) => item !== index,
                ),
              }))
            }
          />
        )
      }
      renderReview={(edit) => (
        <>
          <ReviewSection title="Business type" step={0} edit={edit}>
            <p>
              {draft.type === "shop"
                ? "Physical shop or garage"
                : "Independent or mobile service provider"}
            </p>
          </ReviewSection>
          <ReviewSection title="Business details" step={1} edit={edit}>
            <ReviewFacts
              items={[
                ["Business name", draft.name],
                ["Description", draft.description],
                ["Base location", draft.location],
                ["Service areas", draft.areas],
              ]}
            />
          </ReviewSection>
          <ReviewSection title="Services" step={2} edit={edit}>
            {draft.offerings.map((service, index) => (
              <div className="application-review-service" key={service.id}>
                <h4>
                  {index + 1}. {serviceLabel(service.category)}
                </h4>
                <p>{service.description}</p>
                <p>Advertised service price: {optionalPrice(service.price)}</p>
              </div>
            ))}
            <p>
              Spare parts are separate listings. Linking them to your approved
              business profile will require backend support.
            </p>
            {hub && (
              <a href={`${hub}/sell/part`}>
                Open Auto Hub’s spare-part listing flow ↗
              </a>
            )}
          </ReviewSection>
          <ReviewSection title="Photos" step={3} edit={edit}>
            <PhotoGallery previews={photos.previews} />
          </ReviewSection>
          <ReviewSection title="Contact details" step={4} edit={edit}>
            <ReviewFacts
              items={[
                ["Contact name", draft.contactName],
                ["Phone", draft.phone],
                ["Email", draft.email],
              ]}
            />
          </ReviewSection>
        </>
      )}
    />
  );
}
