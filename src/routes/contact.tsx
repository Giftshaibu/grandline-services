import { createFileRoute } from "@tanstack/react-router";
import { GrandlineContactDetails } from "@grandline/ui/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact Grandline Services" }, { name: "description", content: "Call, WhatsApp or email the Grandline team." }] }),
  component: () => (
    <section className="wrap section">
      <h1 className="directory-title">Contact us</h1>
      <p>Talk to the team about shops, services or your business listing.</p>
      <GrandlineContactDetails headingLevel={2} />
    </section>
  ),
});
