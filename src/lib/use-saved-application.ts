import { flushSync } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  applicationResponse,
  businessPage,
  businessResponse,
  businessRequest,
  type SavedApplication,
} from "./business-api";
import { serviceDraft, restoreServiceDraft } from "./service-draft";
import {
  businessErrors,
  emptyBusinessApplication,
  type BusinessApplication,
} from "./business-application";
import {
  saveApplicationPhotos,
  type PhotoSlot,
} from "./save-application-photos";
import { validateApplicationPhotos } from "../components/application-photos";
import type { Session } from "../components/auth-session";
export function useSavedApplication(
  draft: BusinessApplication,
  files: File[],
  onRestore: (draft: BusinessApplication) => void,
  session: Session,
) {
  const discard = useRef(onRestore);
  discard.current = onRestore;
  const active = useRef(true);
  const restoredPrivateDraft = useRef(false);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      queueMicrotask(() => {
        if (!active.current && restoredPrivateDraft.current)
          flushSync(() => discard.current(emptyBusinessApplication()));
      });
    };
  }, []);
  const [application, setApplication] = useState<SavedApplication | null>(null);
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [businessId, setBusinessId] = useState("");
  const [selected, setSelected] = useState("");
  const [publishPhone, setPublishPhone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const requestKey = useRef<string | null>(null);
  const slots = useRef(new Map<File, PhotoSlot>());
  const feedback = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    setReady(true);
    const id = new URLSearchParams(window.location.search).get("application");
    if (id && /^[0-9a-f-]{36}$/i.test(id)) setSelected(id);
  }, []);
  useEffect(() => {
    if (failed) feedback.current?.focus();
  }, [failed, message]);
  const editable =
    !application || ["draft", "changes_requested"].includes(application.status);
  async function execute(work: (token: string) => Promise<void>) {
    setBusy(true);
    setFailed(false);
    setMessage("");
    try {
      const token = await session.getToken();
      if (!token) throw new Error("Your session expired. Sign in again.");
      await work(token);
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error ? error.message : "The request failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function load(token: string) {
    await businessRequest("/users/me", z.unknown(), token, "PUT");
    const result = await businessRequest("/businesses", businessPage, token);
    setBusinesses(result.items);
    setMessage(
      result.nextCursor
        ? "Showing the first 20 businesses. Resume additional applications from My businesses."
        : "Choose a business, or save as a new business.",
    );
  }
  async function resume(token: string) {
    if (!selected) throw new Error("Choose a saved application.");
    const row = (
      await businessRequest(
        `/services/applications/${selected}`,
        applicationResponse,
        token,
      )
    ).application;
    if (!active.current) return;
    const restored = restoreServiceDraft(row.payload);
    restoredPrivateDraft.current = true;
    setApplication(row);
    setBusinessId(row.businessId);
    setPublishPhone(restored.publishPhone);
    onRestore(restored.draft);
    slots.current.clear();
    setMessage(
      "Saved application loaded. Local changes are not saved automatically.",
    );
  }
  async function save(token: string) {
    const invalid = validateApplicationPhotos(files);
    if (invalid) throw new Error(invalid);
    let current = application;
    let business = businessId;
    if (!current) {
      await businessRequest("/users/me", z.unknown(), token, "PUT");
      if (!business) {
        business = (
          await businessRequest(
            "/businesses",
            businessResponse,
            token,
            "POST",
            {
              name: draft.name.trim() || "Untitled business",
              products: ["services"],
            },
          )
        ).business.id;
        setBusinessId(business);
      }
      requestKey.current ??= crypto.randomUUID();
      current = (
        await businessRequest(
          "/services/applications",
          applicationResponse,
          token,
          "POST",
          {
            businessId: business,
            requestKey: requestKey.current,
            draft: serviceDraft(draft, publishPhone),
          },
        )
      ).application;
      setApplication(current);
      setSelected(current.id);
    } else {
      current = (
        await businessRequest(
          `/services/applications/${current.id}`,
          applicationResponse,
          token,
          "PATCH",
          {
            expectedVersion: current.version,
            draft: serviceDraft(draft, publishPhone),
          },
        )
      ).application;
      setApplication(current);
    }
    try {
      await saveApplicationPhotos(current.id, files, slots.current, token);
    } catch (error) {
      try {
        setApplication(
          (
            await businessRequest(
              `/services/applications/${current.id}`,
              applicationResponse,
              token,
            )
          ).application,
        );
      } catch {
        /* Preserve the original failure and current local draft. */
      }
      throw error;
    }
    current = (
      await businessRequest(
        `/services/applications/${current.id}`,
        applicationResponse,
        token,
      )
    ).application;
    setApplication(current);
    setMessage(
      "Draft and selected photos saved privately. Nothing has been published.",
    );
    return current;
  }
  async function submit(token: string) {
    for (let step = 0; step < 5; step++) {
      const errors = businessErrors(draft, step);
      if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
    }
    const saved = await save(token);
    if (saved.media.some((item) => item.status === "pending"))
      throw new Error("Complete or remove pending photos before submitting.");
    const submitted = (
      await businessRequest(
        `/services/applications/${saved.id}/submit`,
        applicationResponse,
        token,
        "POST",
        {
          expectedVersion: saved.version,
          mediaIds: saved.media
            .filter((item) => item.status === "uploaded")
            .map((item) => item.id),
        },
      )
    ).application;
    setApplication(submitted);
    setMessage(
      "Application submitted for staff review. Approval and verified monthly payment are required before publication.",
    );
  }

  async function removeSavedPhoto(token: string, id: string) {
    if (!application) return;
    await businessRequest(
      `/services/applications/${application.id}/media/${id}`,
      z.unknown(),
      token,
      "DELETE",
    );
    setApplication(
      (
        await businessRequest(
          `/services/applications/${application.id}`,
          applicationResponse,
          token,
        )
      ).application,
    );
    for (const [file, slot] of slots.current)
      if (slot.id === id) slots.current.delete(file);
    setMessage(
      "Saved photo removed. Remove its local preview too before saving again.",
    );
  }
  async function startRevision(token: string) {
    if (!application) return;
    setApplication(
      (
        await businessRequest(
          `/services/applications/${application.id}/revise`,
          applicationResponse,
          token,
          "POST",
          { expectedVersion: application.version },
        )
      ).application,
    );
    setMessage(
      "New draft revision started. Existing published details remain unchanged.",
    );
  }
  return {
    application,
    businesses,
    businessId,
    setBusinessId,
    selected,
    setSelected,
    publishPhone,
    setPublishPhone,
    busy,
    ready,
    message,
    failed,
    feedback,
    editable,
    execute,
    load,
    resume,
    save,
    submit,
    removeSavedPhoto,
    startRevision,
  };
}
