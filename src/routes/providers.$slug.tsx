import { createFileRoute } from "@tanstack/react-router";
import { Availability } from "../components/availability";
export const Route = createFileRoute("/providers/$slug")({
  component: () => (
    <section className="wrap section">
      <h1 className="directory-title">Provider details</h1>
      <Availability result={{ state: "unavailable" }} />
    </section>
  ),
});
