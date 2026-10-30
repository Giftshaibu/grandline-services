import { liveServices } from "../lib/config";
import { createFileRoute } from "@tanstack/react-router";
import { BusinessApplicationFlow } from "../components/business-application";
export const Route = createFileRoute("/list-your-business")({
  head: () => ({
    meta: [
      { title: "List your business — Grandline Services" },
      {
        name: "description",
        content: liveServices
          ? "Prepare a shop or service-provider application, save a private draft and submit it for staff review."
          : "Prepare a shop or service-provider application for future staff review. Submission is not yet available.",
      },
    ],
  }),
  component: BusinessApplicationFlow,
});
