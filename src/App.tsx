import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { QuickLinks, QueueNotice } from "./components/QuickAccess";
import { ServiceCard, GuideCard, VisitCard } from "./components/ContentCards";
import { AccessibilityPanel } from "./components/AccessibilityPanel";
import { InfoDialog } from "./components/InfoDialog";
import { SiteFooter } from "./components/SiteFooter";
import { guides, infoTopics, services, visitCards } from "./data";
import { HospitalProvider, useHospital } from "./portal/store";
import { PatientPortal, type PatientTab } from "./portal/PatientPortal";
import { StaffPortal } from "./portal/StaffPortal";
import { PortalToast } from "./portal/PortalUI";
import { OpdProvider } from "./opd/OpdProvider.jsx";
import { OpdRoutes } from "./opd/OpdApp.jsx";
import { GlobalEmergencyButton, OngoingHelpBar } from "./opd/OpdUI.jsx";

type AppView = "home" | "patient" | "staff";

// Remove a same-page fragment from the URL without triggering the hash router.
function clearUrlHash() {
  if (window.location.hash && !window.location.hash.startsWith("#/")) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
}

export default function App() {
  return (
    <HospitalProvider>
      <OpdProvider>
        <RootRouter />
      </OpdProvider>
    </HospitalProvider>
  );
}

function RootRouter() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  // Support /staff and /board as direct entry points, then normalise to a hash
  // route so every in-app link keeps working.
  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, "");
    if (path === "/staff" || path === "/board") {
      window.history.replaceState(null, "", "/");
      window.location.hash = path === "/staff" ? "#/staff" : "#/board";
      setHash(window.location.hash);
    }
  }, []);

  const [clean] = hash
    .replace(/^#\/?/, "")
    .replace(/\/+$/, "")
    .split("?");
  const path = window.location.pathname.replace(/\/+$/, "");
  const directStaff = path === "/staff";
  const directBoard = path === "/board";
  const isBoard = clean === "board" || directBoard;
  const isOpd =
    clean === "opd" ||
    clean.startsWith("opd/") ||
    clean === "staff" ||
    clean.startsWith("staff/") ||
    directStaff ||
    directBoard;

  if (isOpd || isBoard) {
    return (
      <>
        <OpdRoutes forcedRoute={directBoard ? "board" : directStaff ? "staff" : null} />
        {!isBoard && <GlobalEmergencyButton />}
        <OngoingHelpBar />
      </>
    );
  }

  return <AppShell />;
}

function AppShell() {
  const { language } = useHospital();
  const [topicId, setTopicId] = useState<string | null>(null);
  const [view, setView] = useState<AppView>("home");
  const [initialTab, setInitialTab] = useState<PatientTab>("visit");
  const [checkInOnMount, setCheckInOnMount] = useState(false);
  const openTopic = useCallback((id: string) => setTopicId(id), []);
  const closeTopic = useCallback(() => setTopicId(null), []);
  const topic = infoTopics.find((item) => item.id === topicId) ?? null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  // The public website and staff portal are English; only the patient portal is
  // translated. Keep the document language accurate for screen readers.
  useEffect(() => {
    document.documentElement.lang = view === "patient" ? language : "en";
  }, [view, language]);

  useEffect(() => {
    document.title =
      view === "home"
        ? "GovCare Queue — Government Hospital Network"
        : view === "patient"
          ? "Patient Portal — GovCare Queue"
          : "Staff Access — GovCare Queue";
  }, [view]);

  const openPortal = useCallback(
    (tab: PatientTab = "visit", checkIn = false) => {
      setInitialTab(tab);
      setCheckInOnMount(checkIn);
      setView("patient");
      clearUrlHash();
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    []
  );

  const openStaff = useCallback(() => {
    setView("staff");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const openHome = useCallback(() => {
    setCheckInOnMount(false);
    setTopicId(null);
    setView("home");
    clearUrlHash();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const closeAndScroll = useCallback((id: string) => {
    setTopicId(null);
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    clearUrlHash();
  }, []);

  const handleTopicCta = useCallback(
    (id: string) => {
      if (id === "queue") {
        openPortal("visit");
        return;
      }
      if (id === "accessible-routes") {
        setTopicId("accessibility");
        return;
      }
      if (id === "accessibility") {
        window.location.href = "tel:0800600200";
        setTopicId(null);
        return;
      }
      if (id === "prepare" || id === "queue-help") {
        window.location.href = "tel:0800600100";
        setTopicId(null);
        return;
      }
      // Wayfinding and route guidance: show the accessible-routes section.
      closeAndScroll("accessibility");
    },
    [closeAndScroll, openPortal]
  );

  // Make every simple in-page anchor scroll reliably, including the logo on
  // repeated clicks and nav links whose fragment is already in the URL.
  useEffect(() => {
    if (view !== "home") return undefined;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href === "#" || href.startsWith("#/")) return;
      if (anchor.dataset.noAnchor === "true") return;
      const id = decodeURIComponent(href.slice(1));
      const section = document.getElementById(id);
      if (!section) return;
      event.preventDefault();
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      clearUrlHash();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [view]);

  if (view === "patient") {
    return (
      <>
        <PatientPortal
          initialTab={initialTab}
          checkInOnMount={checkInOnMount}
          onBack={openHome}
          onStaff={openStaff}
        />
        <PortalToast />
      </>
    );
  }

  if (view === "staff") {
    return (
      <>
        <StaffPortal onBack={openHome} onSwitch={() => openPortal("visit")} />
        <PortalToast />
      </>
    );
  }

  return (
    <div id="top" className="min-h-screen bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:inline-flex focus:h-10 focus:items-center focus:bg-white focus:px-4 focus:text-[13px] focus:font-semibold focus:text-brand focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Header
        onOpenPortal={() => openPortal("visit")}
        onOpenStaff={openStaff}
        onOpenOpd={() => {
          window.location.hash = "#/opd";
        }}
        onHome={openHome}
      />

      <main id="main">
        <Hero />
        <QuickLinks onOpenPortal={openPortal} />
        <QueueNotice onOpen={openTopic} />

        <section aria-labelledby="introduction-heading">
          <div className="container-page pb-10 pt-11 text-center sm:pt-12 lg:pb-12 lg:pt-14">
            <span
              aria-hidden="true"
              className="mx-auto mb-6 block h-px w-9 bg-[#a5c0d4]"
            />
            <h2
              id="introduction-heading"
              className="mx-auto max-w-[770px] text-[30px] font-semibold leading-[1.17] tracking-[-0.032em] text-ink sm:text-[34px]"
            >
              Care that respects your time and your needs.
            </h2>
            <p className="mx-auto mt-4 max-w-[650px] text-[13.5px] leading-[1.8] text-copy sm:text-[14px]">
              Waiting-time transparency, clear wayfinding and step-free access are built into every
              visit. We want you to know how long you may wait, where to go next, and who can help
              you along the way.
            </p>
          </div>
        </section>

        <section
          id="live-queue"
          aria-labelledby="services-heading"
          className="container-page scroll-mt-24"
        >
          <span id="services" aria-hidden="true" className="block h-0 scroll-mt-24" />
          <h2 id="services-heading" className="sr-only">
            Live waiting times for hospital services
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onViewQueue={() => openPortal("visit")}
              />
            ))}
          </div>
        </section>

        <section
          id="find-your-way"
          aria-labelledby="guides-heading"
          className="container-page scroll-mt-24 pt-16 sm:pt-[72px]"
        >
          <div className="mb-7 flex items-end justify-between gap-6">
            <div>
              <p className="flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.15em] text-link">
                <span aria-hidden="true" className="h-px w-5 bg-[#9dbdd4]" />
                Patient guidance
              </p>
              <h2
                id="guides-heading"
                className="mt-2.5 max-w-[620px] text-[26px] font-semibold leading-[1.2] tracking-[-0.03em] text-ink sm:text-[29px]"
              >
                Plan ahead. Move with confidence.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => openTopic("wayfinding")}
              aria-haspopup="dialog"
              className="text-link hidden shrink-0 pb-1 sm:inline-flex"
            >
              How wayfinding works
              <ArrowRight size={14} strokeWidth={1.9} aria-hidden="true" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} onOpen={openTopic} />
            ))}
          </div>
        </section>

        <AccessibilityPanel onOpen={openTopic} />

        <section
          id="visit"
          aria-labelledby="visit-heading"
          className="container-page mt-16 scroll-mt-24 sm:mt-20 lg:mt-24"
        >
          <div className="mx-auto max-w-[650px] text-center">
            <h2
              id="visit-heading"
              className="text-[29px] font-semibold leading-[1.18] tracking-[-0.032em] text-ink sm:text-[33px]"
            >
              Your hospital visit, made easier
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-[13.5px] leading-[1.75] text-copy">
              Simple steps, helpful people and clear information at every stage of your care.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:mt-9 lg:grid-cols-3 lg:gap-6">
            {visitCards.map((card) => (
              <VisitCard key={card.id} card={card} onOpen={openTopic} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />

      <InfoDialog topic={topic} onClose={closeTopic} onSelectCta={handleTopicCta} />
      <PortalToast />
    </div>
  );
}
