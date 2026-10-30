import { useEffect, useState } from "react";
import { z } from "zod";
import { AuthSession, type Session } from "./auth-session";
import {
  applicationPage,
  applicationResponse,
  businessRequest,
  type SavedApplication,
} from "../lib/business-api";
import { BusinessBillingPanel } from "./business-billing-panel";
import { liveServices } from "../lib/config";
export function StaffApplications() {
  return (
    <section className="wrap section">
      <h1 className="directory-title">Services staff workspace</h1>
      {liveServices ? (
        <AuthSession>
          {(session) =>
            session.staff ? (
              <StaffQueue session={session} />
            ) : (
              <p>
                Staff access requires the active Clerk organization’s admin
                role.
              </p>
            )
          }
        </AuthSession>
      ) : (
        <p>Staff integrations are not enabled on this deployment.</p>
      )}
    </section>
  );
}
function StaffQueue({ session }: { session: Session }) {
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState<SavedApplication[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [selected, setSelected] = useState<SavedApplication | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<Record<string, string>>({});
  async function load(next?: string) {
    setBusy(true);
    setMessage("");
    try {
      const token = await session.getToken();
      if (!token) throw new Error("Sign in again.");
      const page = await businessRequest(
        `/staff/services/applications?status=${status}${next ? `&cursor=${encodeURIComponent(next)}` : ""}`,
        applicationPage,
        token,
      );
      setItems((previous) =>
        next ? [...previous, ...page.items] : page.items,
      );
      setCursor(page.nextCursor);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "The staff queue failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    setReady(true);
    void load();
  }, [status]);
  async function act(action: string, decision?: string) {
    if (!selected || !reason.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      const token = await session.getToken();
      if (!token) throw new Error("Sign in again.");
      await businessRequest(
        `/staff/services/applications/${selected.id}/${action}`,
        z.unknown(),
        token,
        "POST",
        {
          expectedVersion: selected.version,
          reason,
          ...(decision ? { decision } : {}),
        },
      );
      setSelected(
        (
          await businessRequest(
            `/staff/services/applications/${selected.id}`,
            applicationResponse,
            token,
          )
        ).application,
      );
      setMessage(
        action === "publish"
          ? "Published after approval and verified-payment checks."
          : action === "unpublish"
            ? "Profile unpublished."
            : "Review decision saved. Approval does not publish a profile.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The staff action failed. Refresh the application before retrying.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <fieldset disabled={!ready || busy}>
        <label>
          Application status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setSelected(null);
              setImages({});
            }}
          >
            {[
              "pending",
              "changes_requested",
              "approved",
              "rejected",
              "draft",
            ].map((value) => (
              <option key={value} value={value}>
                {value.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button secondary"
          onClick={() => void load()}
        >
          Refresh queue
        </button>
        <div className="cards">
          {items.map((application) => (
            <article className="entry-card" key={application.id}>
              <div className="card-body">
                <h2>
                  {String(application.payload["name"] || "Untitled business")}
                </h2>
                <p>
                  {application.status} · Revision {application.version}
                </p>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setSelected(application);
                    setReason("");
                    setImages({});
                  }}
                >
                  Review application
                </button>
              </div>
            </article>
          ))}
        </div>
        {cursor && (
          <button
            type="button"
            className="button secondary"
            onClick={() => void load(cursor)}
          >
            Load more applications
          </button>
        )}
      </fieldset>
      {!busy && !items.length && <p>No applications in this queue.</p>}
      {selected && (
        <>
          <article className="review-panel">
            <h2>{String(selected.payload["name"] || "Application details")}</h2>
            <dl className="facts">
              {Object.entries(selected.payload)
                .filter(([key]) => key !== "offerings")
                .map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </dd>
                  </div>
                ))}
            </dl>
            {Array.isArray(selected.payload["offerings"]) &&
              selected.payload["offerings"].map((input, index) => {
                const service = z
                  .object({
                    category: z.string(),
                    description: z.string(),
                    price: z.number().nullable(),
                  })
                  .safeParse(input);
                return service.success ? (
                  <div className="application-review-service" key={index}>
                    <h3>{service.data.category.replaceAll("-", " ")}</h3>
                    <p>{service.data.description}</p>
                    {service.data.price !== null && (
                      <p>
                        Advertised price: MK{" "}
                        {service.data.price.toLocaleString("en-MW")}
                      </p>
                    )}
                  </div>
                ) : (
                  <p key={index} role="alert">
                    This service has an invalid response. Refresh before making
                    a decision.
                  </p>
                );
              })}
            <h3>Application photos</h3>
            {selected.media.map((media) => (
              <div key={media.id}>
                <p>
                  {media.originalFilename} · {media.status}
                </p>
                {images[media.id] ? (
                  <img
                    src={images[media.id]}
                    alt={media.originalFilename}
                    className="detail-image"
                  />
                ) : (
                  <button
                    type="button"
                    className="text-action"
                    disabled={busy || media.status !== "uploaded"}
                    onClick={() => {
                      void (async () => {
                        try {
                          const token = await session.getToken();
                          if (!token) throw new Error("Sign in again.");
                          const image = await businessRequest(
                            `/staff/services/applications/${selected.id}/media/${media.id}/read`,
                            z.object({ url: z.string().url() }),
                            token,
                          );
                          setImages((previous) => ({
                            ...previous,
                            [media.id]: image.url,
                          }));
                        } catch (error) {
                          setMessage(
                            error instanceof Error
                              ? error.message
                              : "Photo unavailable.",
                          );
                        }
                      })();
                    }}
                  >
                    View private photo
                  </button>
                )}
              </div>
            ))}
            <fieldset disabled={!ready || busy}>
              <label>
                Decision / publication reason
                <textarea
                  maxLength={500}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>
              <div className="application-actions">
                {selected.status === "pending" &&
                  (
                    [
                      ["approve", "Approve application"],
                      ["request_changes", "Request changes"],
                      ["reject", "Reject application"],
                    ] as const
                  ).map(([decision, label]) => (
                    <button
                      type="button"
                      className="button secondary"
                      disabled={!reason.trim()}
                      key={decision}
                      onClick={() => void act("review", decision)}
                    >
                      {label}
                    </button>
                  ))}
                {selected.status === "approved" && (
                  <button
                    type="button"
                    className="button"
                    disabled={!reason.trim()}
                    onClick={() => void act("publish")}
                  >
                    Publish after payment checks
                  </button>
                )}
                <button
                  type="button"
                  className="button secondary"
                  disabled={!reason.trim() || !selected.publication?.published}
                  onClick={() => void act("unpublish")}
                >
                  Unpublish existing profile
                </button>
              </div>
            </fieldset>
            <details>
              <summary>Application audit history</summary>
              {selected.events.map((event, index) => (
                <p key={index}>
                  {event.action} · {event.reason || ""} ·{" "}
                  {new Date(event.createdAt).toLocaleString("en-GB")}
                </p>
              ))}
            </details>
          </article>
          <BusinessBillingPanel
            key={selected.businessId}
            businessId={selected.businessId}
            session={session}
            staff
          />
        </>
      )}
      {busy && <p role="status">Loading staff workspace…</p>}
      {message && <p role="status">{message}</p>}
    </>
  );
}
