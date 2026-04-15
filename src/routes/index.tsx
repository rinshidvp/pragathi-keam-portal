import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import EventsSection from "@/components/EventsSection";
import CutoffSection from "@/components/CutoffSection";
import AcademicSection from "@/components/AcademicSection";
import ContactsSection from "@/components/ContactsSection";
import Footer from "@/components/Footer";
import CosmIQBadge from "@/components/CosmIQBadge";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "KEAM Help Desk 2026 — Pragathi College Union, TKMCE" },
      { name: "description", content: "Official KEAM Aspirant Help Desk by Pragathi College Union 2026 at TKM College of Engineering. Mock tests, PYQs, cut-off ranks & mentorship." },
      { property: "og:title", content: "KEAM Help Desk 2026 — Pragathi College Union" },
      { property: "og:description", content: "Your gateway to TKMCE. Access KEAM prep resources, cut-off data & direct mentorship." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <EventsSection />
      <CutoffSection />
      <AcademicSection />
      <ContactsSection />
      <Footer />
      <CosmIQBadge />
    </div>
  );
}
