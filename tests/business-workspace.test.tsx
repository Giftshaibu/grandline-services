import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
vi.mock("../src/lib/config", () => ({
  liveServices: true,
  apiBaseUrl: "https://api.example.test",
  ecosystem: [],
}));
vi.mock("../src/components/auth-session", () => ({
  AuthSession: ({ children }: { children: (session: unknown) => unknown }) =>
    children({ staff: true, getToken: async () => "token" }),
}));
vi.mock("../src/lib/business-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/lib/business-api")>()),
  businessRequest: vi.fn(),
}));
import { businessRequest, ApiError } from "../src/lib/business-api";
import { BusinessBillingPanel } from "../src/components/business-billing-panel";
import { LiveApplicationActions } from "../src/components/live-application-actions";
import { StaffApplications } from "../src/components/staff-applications";
const request = vi.mocked(businessRequest);
const id = "12345678-1234-4234-8234-123456789012";
const billing = {
  billing: { agreedFee: 30000, quoteVersion: 1, paidUntil: null },
  reviewRequired: false,
  overdue: false,
  categoryGuidance: [
    { category: "mechanics", monthlyFee: 20000 },
    { category: "garages", monthlyFee: 50000 },
  ],
  payments: [
    {
      id,
      status: "pending",
      reference: "REF-1",
      method: "bank_transfer",
      amount: 30000,
    },
  ],
  events: [],
  instructions: {
    paymentAccounts: [],
    contactPath: "/contact",
    message: "Payment accounts are not configured.",
  },
};
const application = {
  id,
  businessId: id,
  version: 2,
  status: "pending",
  payload: {
    type: "shop",
    name: "Test workshop",
    description: "Vehicle repairs",
    location: "Lilongwe",
    serviceAreas: [],
    offerings: [
      { category: "mechanics", description: "General repairs", price: 10000 },
    ],
    contactName: "Owner",
    phone: "+265999000000",
    email: "owner@example.test",
    publishPhone: false,
  },
  media: [],
  events: [],
};
beforeEach(() => {
  request.mockReset();
});
describe("business billing and staff controls", () => {
  it("shows a single agreed fee and never exposes receipt verification to owners", async () => {
    request.mockResolvedValue(billing);
    render(
      <BusinessBillingPanel
        businessId={id}
        session={{ staff: false, getToken: async () => "token" }}
      />,
    );
    await screen.findByText("MK 30,000 per 30 days");
    expect(
      screen.queryByText("Verify received payment"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Submit payment reference")).toBeDisabled();
    expect(
      screen.getByText("Payment accounts are not configured."),
    ).toBeInTheDocument();
    expect(screen.queryByText("MK 70,000 per 30 days")).not.toBeInTheDocument();
  });
  it("requires a receipt check and audit reason before staff verification", async () => {
    request.mockImplementation(async (path) =>
      path.includes("/verify") ? {} : billing,
    );
    render(
      <BusinessBillingPanel
        businessId={id}
        session={{ staff: true, getToken: async () => "token" }}
        staff
      />,
    );
    const verify = await screen.findByText("Verify received payment");
    expect(verify).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Staff reason / receipt note"), {
      target: { value: "Receipt checked externally" },
    });
    expect(verify).toBeDisabled();
    fireEvent.click(
      screen.getByLabelText(
        "I checked the actual bank/mobile-money receipt externally",
      ),
    );
    fireEvent.click(verify);
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        `/staff/business-billing/${id}/services/payments/${id}/verify`,
        expect.anything(),
        "token",
        "POST",
        { decision: "verified", reason: "Receipt checked externally" },
      ),
    );
  });
  it("keeps approval separate from publication and shows backend payment rejection", async () => {
    let approved = false;
    request.mockImplementation(async (path, _schema, _token, _method) => {
      if (path.includes("business-billing")) return billing;
      if (path.includes("?status="))
        return { items: [application], nextCursor: null };
      if (path.endsWith("/review")) {
        approved = true;
        return {};
      }
      if (path.endsWith("/publish"))
        throw new ApiError(
          409,
          "PAYMENT_REQUIRED",
          "Staff must verify payment before publication.",
        );
      return {
        application: {
          ...application,
          status: approved ? "approved" : "pending",
          version: approved ? 3 : 2,
        },
      };
    });
    render(<StaffApplications />);
    fireEvent.click(await screen.findByText("Review application"));
    fireEvent.change(screen.getByLabelText("Decision / publication reason"), {
      target: { value: "Profile details checked" },
    });
    fireEvent.click(screen.getByText("Approve application"));
    await screen.findByText("Publish after payment checks");
    expect(
      request.mock.calls.some((call) => call[0].endsWith("/publish")),
    ).toBe(false);
    fireEvent.click(screen.getByText("Publish after payment checks"));
    await screen.findByText("Staff must verify payment before publication.");
    expect(
      screen.queryByText(
        "Published after approval and verified-payment checks.",
      ),
    ).not.toBeInTheDocument();
  });
  it("keeps exploration local until an explicit draft save and submits only after review", async () => {
    const draft = {
      type: "shop",
      name: "Test workshop",
      description: "Vehicle repairs and service",
      location: "Lilongwe",
      areas: "",
      contactName: "Owner",
      phone: "+265999000000",
      email: "owner@example.test",
      offerings: [
        {
          id: "local-service",
          category: "mechanics",
          description: "General repairs",
          price: "10000",
        },
      ],
    };
    let status = "draft";
    let version = 1;
    request.mockImplementation(async (path, _schema, _token, method, _body) => {
      if (path === "/users/me") return {};
      if (path === "/businesses") return { business: { id } };
      if (path.endsWith("/submit")) {
        status = "pending";
        version++;
        return { application: { ...application, status, version } };
      }
      if (path.startsWith("/services/applications")) {
        if (method === "PATCH") version++;
        return { application: { ...application, status, version } };
      }
      throw new Error("Unexpected request");
    });
    render(
      <LiveApplicationActions
        draft={draft}
        files={[]}
        review
        onRestore={vi.fn()}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText("Save draft and photos")).not.toBeDisabled(),
    );
    expect(request).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Save draft and photos"));
    await screen.findByText(
      "Draft and selected photos saved privately. Nothing has been published.",
    );
    const create = request.mock.calls.find(
      (call) => call[0] === "/services/applications" && call[3] === "POST",
    );
    expect(create?.[4]).toEqual(
      expect.objectContaining({
        businessId: id,
        requestKey: expect.any(String),
        draft: expect.objectContaining({
          publishPhone: false,
          offerings: [
            {
              category: "mechanics",
              description: "General repairs",
              price: 10000,
            },
          ],
        }),
      }),
    );
    expect(request.mock.calls.some((call) => call[0].endsWith("/submit"))).toBe(
      false,
    );
    fireEvent.click(screen.getByText("Submit for staff review"));
    await screen.findByText(
      "Application submitted for staff review. Approval and verified monthly payment are required before publication.",
    );
    expect(screen.getByText("Save draft and photos")).toBeDisabled();
  });
});
