import { useRef, useState } from "react";
import { z } from "zod";
import { BusinessApplicationFields } from "./business-application-fields";
import { serviceDraft, restoreServiceDraft } from "../lib/service-draft";
import {
  applicationResponse,
  businessRequest,
  type SavedApplication,
} from "../lib/business-api";
import {
  saveApplicationPhotos,
  type PhotoSlot,
} from "../lib/save-application-photos";
import type { Session } from "./auth-session";

export function StaffApplicationEditor({
  application,
  session,
  onSaved,
}: {
  application: SavedApplication;
  session: Session;
  onSaved: (application: SavedApplication) => void;
}) {
  const [initial] = useState(() => restoreServiceDraft(application.payload));
  const [draft, setDraft] = useState(initial.draft);
  const [publishPhone, setPublishPhone] = useState(initial.publishPhone);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const slots = useRef(new Map<File, PhotoSlot>());
  const [photos, setPhotos] = useState(
    application.publication?.mediaIds ??
      (application.submittedMediaIds?.length
        ? application.submittedMediaIds
        : application.media
            .filter((photo) => photo.status === "uploaded")
            .map((photo) => photo.id)),
  );
  async function save() {
    if (!reason.trim() || busy) return;
    setBusy(true);
    setError("");
    const base = `/staff/services/applications/${application.id}`;
    try {
      const token = await session.getToken();
      if (!token) throw new Error("Sign in again.");
      if (photos.length + files.length > 8)
        throw new Error("Choose up to eight photos.");
      if (
        files.some(
          (file) =>
            !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
            file.size > 5 * 1024 * 1024,
        )
      )
        throw new Error("Choose JPEG, PNG or WebP photos up to 5 MB.");
      const payload = serviceDraft(draft, publishPhone);
      await saveApplicationPhotos(
        application.id,
        files,
        slots.current,
        token,
        base,
      );
      const mediaIds = [
        ...photos,
        ...files.flatMap((file) => {
          const slot = slots.current.get(file);
          return slot?.uploaded ? [slot.id] : [];
        }),
      ];
      await businessRequest(`${base}/edit`, z.unknown(), token, "POST", {
        expectedVersion: application.version,
        reason,
        draft: payload,
        mediaIds,
        removedMediaIds: application.media
          .filter(
            (photo) =>
              photo.status === "uploaded" && !photos.includes(photo.id),
          )
          .map((photo) => photo.id)
          .slice(0, 8),
      });
      const updated = await businessRequest(base, applicationResponse, token);
      onSaved(updated.application);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The listing could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <fieldset disabled={busy}>
      <legend>Edit listing</legend>
      <p>
        {application.publication?.published
          ? "Saving updates the public listing."
          : "Saving keeps the listing private."}
      </p>
      {(application.publication ? [1, 2, 4] : [0, 1, 2, 4]).map((step) => (
        <BusinessApplicationFields
          key={step}
          step={step}
          draft={draft}
          update={(key, value) =>
            setDraft((current) => ({ ...current, [key]: value }))
          }
          updateService={(index, key, value) =>
            setDraft((current) => ({
              ...current,
              offerings: current.offerings.map((item, position) =>
                position === index ? { ...item, [key]: value } : item,
              ),
            }))
          }
          addService={() =>
            setDraft((current) => ({
              ...current,
              offerings: [
                ...current.offerings,
                {
                  id: crypto.randomUUID(),
                  category: "",
                  description: "",
                  price: "",
                },
              ],
            }))
          }
          removeService={(index) =>
            setDraft((current) => ({
              ...current,
              offerings: current.offerings.filter(
                (_, position) => position !== index,
              ),
            }))
          }
        />
      ))}
      <label>
        <input
          type="checkbox"
          checked={publishPhone}
          onChange={(event) => setPublishPhone(event.target.checked)}
        />{" "}
        Show the contact phone publicly
      </label>
      <div>
        <h4>Listing photos</h4>
        {application.media
          .filter((photo) => photo.status === "uploaded")
          .map((photo) => (
            <label key={photo.id}>
              <input
                type="checkbox"
                checked={photos.includes(photo.id)}
                onChange={(event) => {
                  setPhotos((current) =>
                    event.target.checked
                      ? [...current, photo.id]
                      : current.filter((id) => id !== photo.id),
                  );
                }}
              />
              {photo.originalFilename}
            </label>
          ))}
        <label>
          Add photos{" "}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        </label>
      </div>
      <label>
        Reason for editing{" "}
        <textarea
          required
          maxLength={500}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
      <button
        type="button"
        className="button"
        disabled={!reason.trim()}
        onClick={() => void save()}
      >
        Save listing changes
      </button>
      {error && <p role="alert">{error}</p>}
    </fieldset>
  );
}
