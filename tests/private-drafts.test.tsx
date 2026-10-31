import { renderHook, act } from "@testing-library/react";
import { it, expect, vi } from "vitest";
vi.mock("../src/lib/business-api", async (original) => ({
  ...(await original<typeof import("../src/lib/business-api")>()),
  businessRequest: vi.fn(),
}));
import { businessRequest } from "../src/lib/business-api";
import { useSavedApplication } from "../src/lib/use-saved-application";
import { emptyBusinessApplication } from "../src/lib/business-application";
import { serviceDraft } from "../src/lib/service-draft";
const id = "12345678-1234-4234-8234-123456789012";
const draft = { ...emptyBusinessApplication(), name: "Private owner profile" };
const row = {
  id,
  businessId: id,
  status: "draft",
  version: 1,
  payload: serviceDraft(draft, false),
  media: [],
  events: [],
};
const session = { staff: false, getToken: async () => "token" };
it("clears lifted private application fields when the authenticated scope unmounts", async () => {
  const restore = vi.fn();
  vi.mocked(businessRequest).mockResolvedValue({ application: row });
  const hook = renderHook(() =>
    useSavedApplication(emptyBusinessApplication(), [], restore, session),
  );
  act(() => hook.result.current.setSelected(id));
  await act(async () => hook.result.current.resume("token"));
  expect(restore).toHaveBeenLastCalledWith(
    expect.objectContaining({ name: draft.name }),
  );
  hook.unmount();
  await Promise.resolve();
  expect(restore).toHaveBeenLastCalledWith(emptyBusinessApplication());
});
it("does not restore a late private response after sign-out or account switching", async () => {
  const restore = vi.fn();
  let resolve: (value: unknown) => void = () => {};
  vi.mocked(businessRequest).mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const hook = renderHook(() =>
    useSavedApplication(emptyBusinessApplication(), [], restore, session),
  );
  act(() => hook.result.current.setSelected(id));
  const pending = hook.result.current.resume("token");
  hook.unmount();
  await act(async () => {
    resolve({ application: row });
    await pending;
  });
  expect(restore).not.toHaveBeenCalled();
});
