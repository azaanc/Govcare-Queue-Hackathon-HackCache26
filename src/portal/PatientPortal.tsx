import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Compass,
  CornerUpLeft,
  Download,
  HeartPulse,
  Info,
  MapPin,
  Navigation,
  Phone,
  Pill,
  Route,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { useHospital, type DepartmentId } from "./store";
import { useTranslation } from "./i18n";
import {
  NotificationIcon,
  ordinal,
  PortalFooter,
  PortalHeader,
  SectionLabel,
  SeverityBadge,
  StatusDot,
} from "./PortalUI";
import { CheckInModal } from "./CheckInModal";
import { HospitalMap, floorForDepartment } from "./HospitalMap";
import { cn } from "../utils/cn";

export type PatientTab = "visit" | "wayfinding" | "aftercare";

export function PatientPortal({
  initialTab = "visit",
  checkInOnMount = false,
  onBack,
  onStaff,
}: {
  initialTab?: PatientTab;
  checkInOnMount?: boolean;
  onBack: () => void;
  onStaff: () => void;
}) {
  const { language, profile, activeToken } = useHospital();
  const t = useTranslation(language);
  const [tab, setTab] = useState<PatientTab>(initialTab);
  const [checkInOpen, setCheckInOpen] = useState(checkInOnMount);
  const [arOpen, setArOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [tab]);

  return (
    <div className="min-h-screen bg-[#f6f9fb]">
      <PortalHeader
        mode="patient"
        activeTab={tab}
        onNavigate={(id) => setTab(id as PatientTab)}
        onBack={onBack}
        onSwitch={onStaff}
      />

      <main className="container-page pb-12 pt-7 sm:pt-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <SectionLabel>{t("patientPortal")}</SectionLabel>
            <h1 className="mt-2 text-[27px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[31px]">
              {t("goodMorning")}, {profile.name.split(" ")[0]}.
            </h1>
            <p className="mt-1.5 max-w-[560px] text-[12.5px] leading-[1.65] text-[#60717e]">
              {tab === "visit"
                ? t("visitIntro")
                : tab === "wayfinding"
                  ? t("wayfindingIntro")
                  : t("aftercareIntro")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCheckInOpen(true)}
              className="inline-flex h-[40px] items-center gap-2 bg-brand px-4 text-[11.5px] font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              <CalendarDays size={14} strokeWidth={1.9} aria-hidden="true" />
              {t("checkInNew")}
            </button>
            <button
              type="button"
              onClick={() => setTab("wayfinding")}
              className="hidden h-[40px] items-center gap-2 border border-[#cedbe5] bg-white px-3.5 text-[11.5px] font-medium text-brand transition-colors hover:bg-brand-light lg:inline-flex"
            >
              <Compass size={14} strokeWidth={1.8} aria-hidden="true" />
              {t("openMap")}
            </button>
          </div>
        </div>

        <div className="mt-6">
          {tab === "visit" && (
            <VisitDashboard
              onNavigate={setTab}
              onCheckIn={() => setCheckInOpen(true)}
              onOpenAr={() => setArOpen(true)}
            />
          )}
          {tab === "wayfinding" && (
            <WayfindingView
              initialDestination={activeToken?.deptId ?? "opd"}
              onOpenAr={() => setArOpen(true)}
            />
          )}
          {tab === "aftercare" && <AftercareView />}
        </div>
      </main>

      <PortalFooter />
      <CheckInModal
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        onComplete={() => {
          setTab("visit");
          window.scrollTo({ top: 0 });
        }}
      />
      {arOpen && <ArPreviewModal onClose={() => setArOpen(false)} />}
    </div>
  );
}

function QueueAlertBanner({ onOpen }: { onOpen: () => void }) {
  const { activeSnapshot, activeToken, language } = useHospital();
  const t = useTranslation(language);
  const completed = Boolean(activeSnapshot.completed);
  const isCalled = activeSnapshot.position === 0 && !completed;
  const isCritical = !completed && activeToken?.severity === "critical";
  const delay = completed ? 0 : activeSnapshot.delay;

  if (completed || (!isCalled && !isCritical && delay === 0)) return null;

  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-2 border px-4 py-3 transition-all duration-500 sm:flex-row sm:items-center sm:justify-between",
        isCritical || isCalled
          ? "border-[#d9aca5] border-l-[3px] border-l-[#a53428] bg-[#fcf3f1]"
          : "border-[#e2ccab] border-l-[3px] border-l-[#ad7a29] bg-[#fdf9f1]"
      )}
      role="status"
    >
      <div className="flex items-start gap-2.5">
        {isCritical || isCalled ? (
          <CircleAlert size={16} strokeWidth={1.9} className="mt-[1px] shrink-0 text-[#a53428]" aria-hidden="true" />
        ) : (
          <Clock3 size={16} strokeWidth={1.8} className="mt-[1px] shrink-0 text-[#94671e]" aria-hidden="true" />
        )}
        <div>
          <p className={cn("text-[12px] font-semibold", isCritical || isCalled ? "text-[#7e2d24]" : "text-[#6d511d]")}>
            {isCalled
              ? `${t("youAreNext")} ${activeSnapshot.department.room}.`
              : isCritical
                ? "Priority review requested"
                : `${delay} ${t("minutes")} ${t("delayedBy")}`}
          </p>
          <p className={cn("mt-0.5 text-[11px] leading-[1.5]", isCritical || isCalled ? "text-[#8f5048]" : "text-[#7f673d]")}>
            {isCalled
              ? "Your token is being called. A team member will meet you at the department entrance."
              : isCritical
                ? "Your case has been flagged for immediate clinical review. Please stay close to the waiting area and keep your phone available."
                : `The ${activeSnapshot.department.name} team has reported a delay. Your revised estimate is ${activeSnapshot.waitMinutes} minutes and has updated automatically.`}
          </p>
        </div>
      </div>
      <button type="button" onClick={onOpen} className="shrink-0 self-start text-[11px] font-semibold text-link hover:underline sm:self-auto">
        {t("openMap")} →
      </button>
    </div>
  );
}

function VisitDashboard({
  onNavigate,
  onCheckIn,
  onOpenAr,
}: {
  onNavigate: (tab: PatientTab) => void;
  onCheckIn: () => void;
  onOpenAr: () => void;
}) {
  const {
    activeToken,
    activeSnapshot,
    profile,
    language,
    getDepartment,
    getSnapshot,
    notifications,
  } = useHospital();
  const t = useTranslation(language);
  const department = activeToken ? getDepartment(activeToken.deptId) : getDepartment("opd");
  const liveQueue = getSnapshot(department.id).queued;
  const activeQueue = activeSnapshot.queued;
  const completed = Boolean(activeSnapshot.completed);
  const isCalled = activeSnapshot.position === 0 && !completed;
  const displayPosition = completed
    ? t("visitComplete")
    : isCalled
      ? t("youAreNext").split(" ")[0]
      : ordinal(activeSnapshot.position);

  const timelineTokens = useMemo(() => {
    const behindActive = liveQueue.findIndex((patient) => patient.token === activeToken?.token);
    const queueWindow = behindActive >= 0 ? liveQueue.slice(0, behindActive + 1) : liveQueue.slice(0, 4);
    return [activeSnapshot.nowServing, ...queueWindow.map((patient) => patient.token)].slice(0, 7);
  }, [activeSnapshot.nowServing, activeToken?.token, liveQueue]);

  return (
    <div>
      <QueueAlertBanner onOpen={() => onNavigate("wayfinding")} />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <section className="relative overflow-hidden bg-brand-deep text-white" aria-labelledby="token-heading">
            <div aria-hidden="true" className="absolute right-0 top-0 h-full w-[38%] opacity-[0.08]">
              <div className="absolute right-8 top-8 h-36 w-36 rounded-full border-[20px] border-white" />
              <div className="absolute bottom-0 right-0 h-24 w-24 bg-white" />
            </div>
            <div className="relative px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#9fc4db]">
                    <BadgeCheck size={13} strokeWidth={1.9} aria-hidden="true" />
                    {t("token")}
                  </p>
                  <h2 id="token-heading" className="mt-1.5 text-[15px] font-medium leading-[1.3] text-white/90">
                    {department.name} · {t("appointment")} today
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 border border-white/20 bg-white/5 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#c7e2f1]">
                  <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-[#6fd0a1]" />
                  {t("live")}
                </span>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-12 sm:items-end">
                <div className="sm:col-span-5">
                  <p className="numeric text-[50px] font-semibold leading-[0.9] tracking-[-0.045em] sm:text-[58px]">
                    {activeToken?.token ?? "G-42"}
                  </p>
                  <p className="mt-2.5 text-[11.5px] text-white/60">
                    {profile.name} · {profile.age} years
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:col-span-7 sm:grid-cols-2">
                  <div className="border-l border-white/15 pl-4">
                    <p className="text-[9px] uppercase tracking-[0.11em] text-white/50">{t("nowServing")}</p>
                    <p className="numeric mt-1.5 text-[20px] font-semibold leading-none">{activeSnapshot.nowServing}</p>
                  </div>
                  <div className="border-l border-white/15 pl-4">
                    <p className="text-[9px] uppercase tracking-[0.11em] text-white/50">{t("yourPosition")}</p>
                    <p className="mt-1.5 text-[20px] font-semibold leading-none">
                      {completed ? displayPosition : isCalled ? "Next" : `${displayPosition} in line`}
                    </p>
                  </div>
                  <div className="border-l border-white/15 pl-4">
                    <p className="text-[9px] uppercase tracking-[0.11em] text-white/50">{t("estimatedWait")}</p>
                    <p className={cn("mt-1.5 text-[20px] font-semibold leading-none", !isCalled && "numeric")}>
                      {completed ? "—" : isCalled ? t("waitNow") : activeSnapshot.waitMinutes}
                      {!isCalled && !completed && (
                        <span className="ml-1 text-[10px] font-normal text-white/60">{t("minutes")}</span>
                      )}
                    </p>
                  </div>
                  <div className="border-l border-white/15 pl-4">
                    <p className="text-[9px] uppercase tracking-[0.11em] text-white/50">{t("department")}</p>
                    <p className="mt-1.5 text-[12.5px] font-semibold leading-[1.3]">{department.name}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
                <a
                  href="#portal-directions"
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate("wayfinding");
                  }}
                  className="inline-flex items-center gap-2 text-[11.5px] font-medium text-white/80 transition-colors hover:text-white hover:underline hover:underline-offset-2"
                >
                  <MapPin size={14} strokeWidth={1.7} aria-hidden="true" />
                  Room {department.room} · {t("level")} {department.floor} · {department.wing}
                  <ArrowRight size={13} strokeWidth={1.9} aria-hidden="true" />
                </a>
                <SeverityBadge
                  severity={activeToken?.severity ?? "routine"}
                  label={activeToken?.severity === "critical" ? "Priority" : activeToken?.severity === "urgent" ? "Urgent" : "Standard"}
                />
              </div>
            </div>
          </section>

          <section className="border border-[#dbe5ec] bg-white" aria-labelledby="queue-prediction-heading">
            <div className="flex flex-col justify-between gap-3 border-b border-[#e5ecf1] px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <SectionLabel>Predictive triage</SectionLabel>
                <h2 id="queue-prediction-heading" className="mt-1 text-[16px] font-semibold tracking-[-0.015em] text-ink">
                  Live queue · {department.name}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#5d6f7b]">
                  <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-[#277c55]" />
                  Updated moments ago
                </span>
                <span className="border border-[#d5e2ea] bg-[#f7fafc] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#506674]">
                  {department.doctors} clinicians
                </span>
              </div>
            </div>

            <div className="px-5 py-5">
              <div className="flex items-center justify-between gap-3 text-[10px] font-medium text-[#6b7e8b]">
                <span>{t("nowServing")} · {activeSnapshot.nowServing}</span>
                <span className="text-brand">
                  {completed ? t("visitComplete") : isCalled ? "Your turn" : `Your token · ${activeToken?.token}`}
                </span>
              </div>
              <div className="relative mt-3 h-[5px] bg-[#e7eef3]">
                <div
                  className="absolute inset-y-0 left-0 bg-brand transition-[width] duration-700 ease-out"
                  style={{
                    width: isCalled || completed ? "100%" : `${Math.min(91, Math.max(22, 100 - (activeSnapshot.position / Math.max(5, activeSnapshot.position + 2)) * 100))}%`,
                  }}
                />
                <div
                  className="absolute -top-[3px] h-[11px] w-[11px] rounded-full border-2 border-white bg-brand ring-1 ring-brand/30 transition-[left] duration-700"
                  style={{
                    left: isCalled || completed
                      ? "calc(100% - 11px)"
                      : `calc(${Math.min(91, Math.max(22, 100 - (activeSnapshot.position / Math.max(5, activeSnapshot.position + 2)) * 100))}% - 5px)`,
                  }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 overflow-x-auto pb-1">
                {timelineTokens.map((token, index) => {
                  const isYours = token === activeToken?.token;
                  return (
                    <span
                      key={`${token}-${index}`}
                      className={cn(
                        "numeric shrink-0 border px-2 py-1 text-[9.5px] font-semibold",
                        isYours
                          ? "border-brand bg-brand text-white"
                          : index === 0
                            ? "border-[#b9d3c6] bg-[#eff8f3] text-[#37705a]"
                            : "border-[#e0e8ee] bg-[#fbfcfd] text-[#7b8c98]"
                      )}
                    >
                      {token}
                      {isYours && " · you"}
                    </span>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3 border-t border-[#e6edf2] pt-4 sm:grid-cols-3">
                <div className="flex items-start gap-2">
                  <Stethoscope size={15} strokeWidth={1.7} className="mt-0.5 shrink-0 text-link" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6b7e8b]">Doctor velocity</p>
                    <p className="mt-1 text-[11px] leading-[1.5] text-[#4f6371]">
                      {department.doctors} clinicians · ~{department.consultMinutes} min per consult
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <UserRound size={15} strokeWidth={1.7} className="mt-0.5 shrink-0 text-link" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6b7e8b]">Triage</p>
                    <p className="mt-1 text-[11px] leading-[1.5] text-[#4f6371]">
                      {activeQueue.length} in queue · {activeSnapshot.delay > 0 ? `${activeSnapshot.delay} min delay` : "no reported delay"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock3 size={15} strokeWidth={1.7} className="mt-0.5 shrink-0 text-link" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6b7e8b]">Predicted wait</p>
                    <p className="mt-1 text-[11px] leading-[1.5] text-[#4f6371]">
                      {completed
                        ? t("visitCompleteHelp")
                        : isCalled
                          ? `${t("waitNow")} — proceed to the department`
                          : `${activeSnapshot.waitMinutes} min, recalculated live`}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-3.5 flex items-start gap-1.5 text-[10px] leading-[1.55] text-[#82909a]">
                <Info size={11} strokeWidth={1.8} className="mt-[1px] shrink-0" aria-hidden="true" />
                Priority and emergency cases are seen first. Your estimated wait adapts automatically when circumstances change.
              </p>
            </div>
          </section>

          <section className="border border-[#dbe5ec] bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-[#e5ecf1] px-5 py-4">
              <div>
                <SectionLabel>{t("roomDirections")}</SectionLabel>
                <h2 className="mt-1 text-[16px] font-semibold text-ink">
                  {t("level")} {department.floor} · {department.wing} · Room {department.room}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("wayfinding")}
                className="text-link shrink-0 text-[11px]"
              >
                {t("openMap")}
                <ArrowRight size={13} strokeWidth={1.9} aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-0 md:grid-cols-[1.45fr_1fr]">
              <div className="border-b border-[#e5ecf1] p-4 md:border-b-0 md:border-r">
                <HospitalMap
                  floor={department.floor}
                  mode="route"
                  destination={department.id}
                  compact
                />
              </div>
              <div className="flex flex-col justify-center gap-3.5 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-[10px] font-semibold text-brand">
                    1
                  </span>
                  <p className="mt-0.5 text-[11.5px] leading-[1.55] text-[#506471]">
                    Enter through the main atrium and continue to Lift A.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-[10px] font-semibold text-brand">
                    2
                  </span>
                  <p className="mt-0.5 text-[11.5px] leading-[1.55] text-[#506471]">
                    Take the lift to Level {department.floor} and follow the blue signs.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">
                    <MapPin size={12} strokeWidth={2} aria-hidden="true" />
                  </span>
                  <p className="mt-0.5 text-[11.5px] leading-[1.55] text-[#506471]">
                    Check in at the <strong className="font-semibold text-[#2d4352]">reception desk</strong> in{" "}
                    {department.wing}. Room {department.room} is a 2-minute step-free walk from the lift.
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-2 border border-[#d7e4ec] bg-[#f7fafc] px-3 py-2">
                  <Accessibility size={14} strokeWidth={1.8} className="shrink-0 text-link" aria-hidden="true" />
                  <p className="text-[10px] leading-[1.5] text-[#60737f]">
                    Step-free route available · {t("lift")} access
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:col-span-4" aria-label="Visit details">
          <section className="border border-[#dbe5ec] bg-white">
            <div className="flex items-center justify-between border-b border-[#e5ecf1] px-4 py-3.5">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.09em] text-[#536876]">{t("appointment")}</h2>
              <CalendarDays size={15} strokeWidth={1.7} className="text-link" aria-hidden="true" />
            </div>
            <dl className="divide-y divide-[#edf2f5]">
              {[
                { label: t("department"), value: department.name },
                { label: "Clinician", value: "Dr. Anika Mehta" },
                { label: "Date", value: "Today, 26 Oct" },
                { label: "Time", value: "09:00 – 09:20" },
                { label: t("roomDirections"), value: `Room ${department.room} · ${t("level")} ${department.floor}` },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <dt className="text-[10.5px] text-[#7a8a95]">{row.label}</dt>
                  <dd className="text-right text-[11px] font-medium text-[#344b5b]">{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-[#e5ecf1] px-4 py-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={13} strokeWidth={1.9} className="mt-[2px] shrink-0 text-[#277c55]" aria-hidden="true" />
                <p className="text-[10.5px] leading-[1.5] text-[#5a6f7c]">
                  <span className="font-semibold text-[#334b5b]">Checked in.</span> Insurance details verified in advance.
                </p>
              </div>
              <button
                type="button"
                onClick={onCheckIn}
                className="mt-3 flex w-full items-center justify-between border border-[#d4e1e9] px-3 py-2 text-[10.5px] font-medium text-brand transition-colors hover:bg-brand-light"
              >
                {t("checkInNew")}
                <ChevronRight size={13} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </section>

          <section className="border border-[#cfe0e9] bg-brand-light p-4">
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-brand">
                <Accessibility size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-link">Accessibility support</p>
                <h2 className="mt-1 text-[13px] font-semibold leading-[1.35] text-[#263f50]">
                  Need help getting to your appointment?
                </h2>
                <p className="mt-1.5 text-[10.5px] leading-[1.6] text-[#586f7c]">
                  A mobility assistant can meet you at the East entrance and accompany you to {department.name}.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate("wayfinding")}
                    className="inline-flex h-[31px] items-center gap-1.5 bg-brand px-2.5 text-[10px] font-semibold text-white transition-colors hover:bg-brand-deep"
                  >
                    Plan accessible route
                    <ArrowRight size={11} strokeWidth={2} aria-hidden="true" />
                  </button>
                  <a
                    href="tel:0800600200"
                    className="inline-flex h-[31px] items-center gap-1.5 border border-[#b9d2e1] bg-white px-2.5 text-[10px] font-semibold text-brand transition-colors hover:bg-white/70"
                  >
                    <Phone size={11} strokeWidth={1.9} aria-hidden="true" />
                    0800 600 200
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="border border-[#dbe5ec] bg-white">
            <div className="flex items-center justify-between border-b border-[#e5ecf1] px-4 py-3.5">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.09em] text-[#536876]">{t("queueAlerts")}</h2>
              <Bell size={15} strokeWidth={1.7} className="text-link" aria-hidden="true" />
            </div>
            <ul className="divide-y divide-[#edf2f5]">
              {notifications.slice(0, 4).map((notification) => (
                <li key={notification.id} className="flex items-start gap-2.5 px-4 py-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                      notification.kind === "emergency"
                        ? "bg-[#fbeeec] text-[#a53428]"
                        : notification.kind === "sms"
                          ? "bg-[#eef7f2] text-[#277c55]"
                          : "bg-brand-light text-brand"
                    )}
                  >
                    <NotificationIcon kind={notification.kind} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold leading-[1.4] text-[#354b5a]">{notification.title}</p>
                    <p className="mt-0.5 text-[10px] leading-[1.5] text-[#758590]">{notification.message}</p>
                    <p className="mt-1 text-[9px] text-[#99a5ad]">{notification.time}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#e5ecf1] bg-[#fbfcfd] px-4 py-2.5">
              <p className="text-[9.5px] leading-[1.5] text-[#86949e]">
                Queue alerts are also sent to {profile.phone ? profile.phone.replace(/\d(?=\d{3})/g, "•") : "your mobile"}.
              </p>
            </div>
          </section>

          <section className="border border-[#dbe5ec] bg-white p-4">
            <div className="flex items-center gap-2">
              <HeartPulse size={15} strokeWidth={1.7} className="text-link" aria-hidden="true" />
              <h2 className="text-[12px] font-semibold text-[#334b5b]">{t("aftercare")}</h2>
            </div>
            <p className="mt-1.5 text-[10.5px] leading-[1.6] text-[#6b7c87]">
              After your consultation, your discharge plan and recovery checklist will appear here.
            </p>
            <button
              type="button"
              onClick={() => onNavigate("aftercare")}
              className="text-link mt-2.5 text-[10.5px]"
            >
              View aftercare
              <ArrowRight size={12} strokeWidth={1.9} aria-hidden="true" />
            </button>
          </section>
        </aside>
      </div>

      <div className="mt-5 flex flex-col items-start justify-between gap-3 border border-[#dbe5ec] bg-white px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-2.5">
          <Info size={14} strokeWidth={1.8} className="mt-[1px] shrink-0 text-link" aria-hidden="true" />
          <p className="text-[10.5px] leading-[1.6] text-[#6b7c87]">
            Emergency or feeling worse while you wait? Tell a member of staff immediately. Emergencies always receive
            clinical priority.
          </p>
        </div>
        <a
          href="tel:108"
          className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-brand transition-colors hover:text-link"
        >
          <Phone size={12} strokeWidth={1.9} aria-hidden="true" />
          Emergency 108
        </a>
      </div>

      <button
        type="button"
        onClick={onOpenAr}
        className="sr-only"
        aria-label={t("arPreview")}
      />
    </div>
  );
}

function WayfindingView({
  initialDestination,
  onOpenAr,
}: {
  initialDestination: DepartmentId;
  onOpenAr: () => void;
}) {
  const { language, getDepartment, getSnapshot } = useHospital();
  const t = useTranslation(language);
  const [destination, setDestination] = useState<DepartmentId>(initialDestination);
  const [accessible, setAccessible] = useState(true);
  const [floor, setFloor] = useState(floorForDepartment(initialDestination));
  const department = getDepartment(destination);
  const snapshot = getSnapshot(destination);

  useEffect(() => {
    setFloor(floorForDepartment(destination));
  }, [destination]);

  const steps = [
    {
      title: "Enter through the main atrium",
      detail: "Use the north entrance. The indoor wayfinding screen is directly ahead.",
      icon: Navigation,
      floor: 0,
    },
    {
      title: accessible ? `Take Lift A to Level ${department.floor}` : `Take the central stairs to Level ${department.floor}`,
      detail: accessible
        ? "Lifts A and B serve every public floor. Both have audio announcements and tactile buttons."
        : "The central stairs are quicker but are not step-free. Switch on step-free routing for lift access.",
      icon: ArrowUp,
      floor: 0,
    },
    {
      title: `Turn left into ${department.wing}`,
      detail: `Follow the deep-blue clinical signs for ${department.name}. The route is level from the lift lobby.`,
      icon: CornerUpLeft,
      floor: department.floor,
    },
    {
      title: `Continue to Room ${department.room}`,
      detail: `${department.name} reception is on your right. Show your digital token at the desk.`,
      icon: MapPin,
      floor: department.floor,
    },
  ];

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <section className="border border-[#dbe5ec] bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-[#e4ecf1] px-4 py-3.5 sm:flex-row sm:items-center">
              <div>
                <SectionLabel>AR indoor wayfinding</SectionLabel>
                <h2 className="mt-1 text-[15px] font-semibold text-ink">
                  Route to {department.name} · Room {department.room}
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFloor(level)}
                    aria-pressed={floor === level}
                    className={cn(
                      "h-[30px] border px-2.5 text-[10.5px] font-medium transition-colors",
                      floor === level
                        ? "border-brand bg-brand text-white"
                        : "border-[#d6e2e9] bg-white text-[#627481] hover:bg-[#f5f9fb]"
                    )}
                  >
                    {level === 0 ? t("groundFloor") : `${t("level")} ${level}`}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <HospitalMap floor={floor} mode="route" destination={destination} />
              {floor !== department.floor && (
                <p className="mt-2 flex items-start gap-1.5 border border-[#e2d3b6] bg-[#fdf9f1] px-2.5 py-2 text-[10px] leading-[1.5] text-[#846326]">
                  <Info size={11} strokeWidth={1.9} className="mt-[1px] shrink-0" aria-hidden="true" />
                  This level is not on your route. {department.name} is on Level {department.floor}.
                </p>
              )}
            </div>
            <div className="flex flex-col justify-between gap-3 border-t border-[#e4ecf1] bg-[#fbfcfd] px-4 py-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Route size={14} strokeWidth={1.8} className="text-link" aria-hidden="true" />
                <p className="text-[10.5px] text-[#617480]">
                  Approx. 4 min walk · 230 m · {accessible ? "step-free" : "via central stairs"}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenAr}
                className="inline-flex h-[32px] items-center gap-1.5 self-start border border-brand bg-white px-2.5 text-[10px] font-semibold text-brand transition-colors hover:bg-brand-light sm:self-auto"
              >
                <Compass size={12} strokeWidth={1.9} aria-hidden="true" />
                {t("arPreview")}
              </button>
            </div>
          </section>

          <section className="border border-[#dbe5ec] bg-white">
            <div className="border-b border-[#e5ecf1] px-5 py-4">
              <SectionLabel>{t("routeSteps")}</SectionLabel>
              <h2 className="mt-1 text-[16px] font-semibold text-ink">From the main entrance to {department.name}</h2>
            </div>
            <ol className="divide-y divide-[#edf2f5]">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="flex items-start gap-3.5 px-5 py-4">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center border text-[10px] font-semibold",
                        step.floor === floor
                          ? "border-brand bg-brand text-white"
                          : "border-[#d6e2e9] bg-[#f7fafc] text-[#657985]"
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[12px] font-semibold leading-[1.4] text-[#2c4352]">{step.title}</p>
                        <span className="hidden shrink-0 items-center gap-1 text-[9px] uppercase tracking-[0.06em] text-[#87959f] sm:flex">
                          <Icon size={12} strokeWidth={1.8} aria-hidden="true" />
                          {step.floor === 0 ? t("groundFloor") : `${t("level")} ${step.floor}`}
                        </span>
                      </div>
                      <p className="mt-1 text-[10.5px] leading-[1.6] text-[#71818c]">{step.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5ecf1] bg-[#f7fafc] px-5 py-3">
              <label className="flex cursor-pointer items-center gap-2.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={accessible}
                  aria-label={t("accessibilityRoute")}
                  onClick={() => setAccessible((previous) => !previous)}
                  className={cn(
                    "relative h-[21px] w-[38px] rounded-full border transition-colors",
                    accessible ? "border-brand bg-brand" : "border-[#bccbd5] bg-[#dbe5eb]"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-[2px] h-[15px] w-[15px] rounded-full bg-white shadow-sm transition-[left] duration-200",
                      accessible ? "left-[20px]" : "left-[2px]"
                    )}
                  />
                </button>
                <span>
                  <span className="block text-[10.5px] font-semibold text-[#354d5d]">{t("accessibilityRoute")}</span>
                  <span className="block text-[9px] text-[#7d8c96]">{t("avoidStairs")}</span>
                </span>
              </label>
              <p className="flex items-center gap-1.5 text-[9.5px] text-[#687b87]">
                <Accessibility size={12} strokeWidth={1.8} aria-hidden="true" /> All public lifts are wheelchair accessible
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:col-span-4">
          <section className="border border-[#dbe5ec] bg-white">
            <div className="border-b border-[#e5ecf1] px-4 py-3.5">
              <SectionLabel>{t("destination")}</SectionLabel>
              <h2 className="mt-1 text-[14px] font-semibold text-ink">Where would you like to go?</h2>
            </div>
            <div className="p-2.5">
              {(["opd", "cardiology", "pediatrics", "laboratory", "pharmacy", "radiology"] as DepartmentId[]).map(
                (id) => {
                  const option = getDepartment(id);
                  const active = destination === id;
                  const optionSnapshot = getSnapshot(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setDestination(id)}
                      aria-pressed={active}
                      className={cn(
                        "flex w-full items-center gap-3 border px-2.5 py-2.5 text-left transition-colors",
                        active
                          ? "border-[#9bbdd2] bg-brand-light"
                          : "border-transparent hover:border-[#dde6ec] hover:bg-[#f9fbfc]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center",
                          active ? "bg-brand text-white" : "bg-[#eff4f7] text-[#637985]"
                        )}
                      >
                        <Building2 size={14} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11.5px] font-semibold text-[#314957]">{option.name}</span>
                        <span className="mt-0.5 block text-[9.5px] text-[#7a8a95]">
                          {option.room} · {t("level")} {option.floor} · ~{optionSnapshot.waitMinutes} {t("minutes")}
                        </span>
                      </span>
                      {active && <Check size={14} strokeWidth={2.2} className="shrink-0 text-brand" aria-hidden="true" />}
                    </button>
                  );
                }
              )}
            </div>
          </section>

          <section className="border border-[#dbe5ec] bg-white p-4">
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                <Stethoscope size={16} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-link">Your destination</p>
                <h2 className="mt-1 text-[15px] font-semibold text-[#283f4f]">{department.name}</h2>
                <p className="mt-1 text-[10.5px] leading-[1.6] text-[#6b7c87]">
                  Room {department.room} · {t("level")} {department.floor} · {department.wing}
                </p>
                <div className="mt-3 border-t border-[#e5ecf1] pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-[#7b8a95]">Live department status</span>
                    <span className="text-[10px] font-medium">
                      <StatusDot status={snapshot.status} />
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-[#7b8a95]">Estimated wait</span>
                    <span className="numeric text-[10px] font-semibold text-[#3d5362]">
                      {snapshot.waitMinutes} {t("minutes")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border border-[#cfe0e9] bg-brand-light p-4">
            <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.11em] text-link">
              <Accessibility size={12} strokeWidth={1.9} aria-hidden="true" />
              Accessibility support
            </p>
            <p className="mt-2 text-[11px] leading-[1.65] text-[#526b79]">
              Need a wheelchair, an escort or a quiet waiting space? Call the mobility desk and a member of the team
              will meet you at the East entrance.
            </p>
            <a
              href="tel:0800600200"
              className="mt-3 inline-flex h-[32px] items-center gap-1.5 bg-brand px-3 text-[10px] font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              <Phone size={11} strokeWidth={1.9} aria-hidden="true" />
              0800 600 200
            </a>
          </section>

          <div className="flex items-start gap-2 border border-[#dbe5ec] bg-white px-4 py-3">
            <Info size={13} strokeWidth={1.8} className="mt-[1px] shrink-0 text-link" aria-hidden="true" />
            <p className="text-[10px] leading-[1.6] text-[#6f7f89]">
              AR wayfinding works indoors without mobile data. The live camera preview is a demonstration on this
              device.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AftercareView() {
  const { profile, language } = useHospital();
  const t = useTranslation(language);
  const [pain, setPain] = useState(3);
  const [notes, setNotes] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [checklist, setChecklist] = useState([
    { id: "medication", label: "Take medication as prescribed", detail: "Morning and evening with food", done: true },
    { id: "hydration", label: "Drink at least 1.5 litres of water", detail: "Avoid caffeine after 16:00", done: true },
    { id: "wound", label: "Check your dressing", detail: "Keep the area clean and dry", done: false },
    { id: "mobility", label: "Short mobility walk", detail: "10 minutes around the house, if comfortable", done: false },
    { id: "followup", label: "Confirm follow-up appointment", detail: "General OPD · 2 November, 09:20", done: false },
  ]);
  const completed = checklist.filter((item) => item.done).length;
  const progress = Math.round((completed / checklist.length) * 100);

  const downloadSummary = () => {
    const content = [
      "CARECONNECT GOVERNMENT HOSPITAL",
      "Discharge summary — demonstration",
      "",
      `Patient: ${profile.name}, ${profile.age}`,
      "Department: General OPD",
      "Clinician: Dr. Anika Mehta",
      "Consultation date: 26 October 2026",
      "",
      "Discharge instructions:",
      "- Continue prescribed medication as directed for 5 days.",
      "- Keep the dressing clean and dry. Change every 48 hours.",
      "- Return to the Emergency Department if you develop a fever above 38.5°C, severe pain or bleeding.",
      "- Book a follow-up if symptoms have not improved within 7 days.",
      "",
      "Follow-up: General OPD, 2 November 2026 at 09:20.",
      "Patient advice line: 0800 600 100",
      "",
      "This document was generated from a demo environment and is not a medical record.",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "GovCare-Queue-discharge-summary.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 border border-[#cfe0e9] bg-brand-light px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand">
            <HeartPulse size={18} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.13em] text-link">Aftercare · Day 2</p>
            <h2 className="mt-1 text-[15px] font-semibold text-[#263f50]">{t("aftercareTitle")}</h2>
            <p className="mt-1 text-[10.5px] leading-[1.55] text-[#5c7380]">{t("aftercareSubtitle")}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 border-l-0 border-[#bfd6e4] pl-0 sm:border-l sm:pl-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.1em] text-[#788b97]">Recovery progress</p>
            <p className="numeric mt-0.5 text-[18px] font-semibold text-brand-deep">{progress}%</p>
          </div>
          <div className="h-10 w-[72px]">
            <div className="mt-3 h-[4px] w-full bg-white">
              <div className="h-full bg-brand transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <section className="border border-[#dbe5ec] bg-white">
            <div className="flex items-center justify-between border-b border-[#e5ecf1] px-5 py-4">
              <div>
                <SectionLabel>{t("recoveryChecklist")}</SectionLabel>
                <h2 className="mt-1 text-[16px] font-semibold text-ink">Your recovery plan for today</h2>
              </div>
              <span className="numeric border border-[#dbe5ec] bg-[#f7fafc] px-2 py-1 text-[9.5px] font-semibold text-[#5b707d]">
                {completed}/{checklist.length} complete
              </span>
            </div>
            <ul className="divide-y divide-[#edf2f5]">
              {checklist.map((item) => (
                <li key={item.id} className="flex items-start gap-3.5 px-5 py-3.5">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.done}
                    aria-label={item.label}
                    onClick={() =>
                      setChecklist((previous) =>
                        previous.map((entry) => (entry.id === item.id ? { ...entry, done: !entry.done } : entry))
                      )
                    }
                    className={cn(
                      "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center border transition-colors",
                      item.done
                        ? "border-[#277c55] bg-[#277c55] text-white"
                        : "border-[#b9c8d2] bg-white text-transparent hover:border-brand"
                    )}
                  >
                    <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-[12px] font-medium leading-[1.4]", item.done ? "text-[#7d8d97] line-through" : "text-[#314957]")}>
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-[1.5] text-[#8896a0]">{item.detail}</p>
                  </div>
                  {item.done && <span className="text-[9px] font-medium uppercase tracking-[0.06em] text-[#277c55]">Done</span>}
                </li>
              ))}
            </ul>
            <div className="border-t border-[#e5ecf1] px-5 py-3">
              <div className="h-[5px] bg-[#e8eff4]">
                <div className="h-full bg-[#277c55] transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </section>

          <section className="border border-[#dbe5ec] bg-white">
            <div className="border-b border-[#e5ecf1] px-5 py-4">
              <SectionLabel>{t("dailyCheckIn")}</SectionLabel>
              <h2 className="mt-1 text-[16px] font-semibold text-ink">How are you feeling today?</h2>
            </div>
            <div className="px-5 py-4">
              <label className="block">
                <span className="flex items-center justify-between gap-3 text-[11px] font-medium text-[#3e5565]">
                  {t("painLevel")}
                  <span className="numeric text-[15px] font-semibold text-brand">{pain}/10</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={pain}
                  onChange={(event) => setPain(Number(event.target.value))}
                  className="mt-2.5 w-full accent-[#0b3f6b]"
                  aria-label={t("painLevel")}
                />
                <span className="mt-1 flex justify-between text-[9px] text-[#84929c]">
                  <span>No pain</span>
                  <span>Severe</span>
                </span>
              </label>
              <label className="mt-4 block">
                <span className="text-[11px] font-medium text-[#3e5565]">Anything your care team should know?</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={2}
                  placeholder="Optional notes about your recovery today"
                  className="mt-1.5 w-full resize-none border border-[#cfdbe4] bg-white px-3 py-2.5 text-[11.5px] leading-[1.6] text-ink outline-none placeholder:text-[#97a4ad] focus:border-[#6f9bb8]"
                />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))}
                  className="inline-flex h-[36px] items-center gap-1.5 bg-brand px-3.5 text-[11px] font-semibold text-white transition-colors hover:bg-brand-deep"
                >
                  <CheckCircle2 size={13} strokeWidth={1.9} aria-hidden="true" />
                  {t("saveCheckIn")}
                </button>
                {savedAt && (
                  <span className="flex items-center gap-1.5 text-[10.5px] text-[#277c55]" role="status">
                    <Check size={12} strokeWidth={2.4} aria-hidden="true" />
                    {t("saved")} at {savedAt}
                  </span>
                )}
              </div>
              <p className="mt-3 flex items-start gap-1.5 border-t border-[#e8eef2] pt-3 text-[9.5px] leading-[1.55] text-[#85939d]">
                <ShieldIcon />
                If your pain is above 7, or you have chest pain, breathing difficulty or heavy bleeding, call 108 or
                return to the Emergency Department immediately.
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:col-span-4">
          <section className="border border-[#dbe5ec] bg-white">
            <div className="flex items-center justify-between border-b border-[#e5ecf1] px-4 py-3.5">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.09em] text-[#536876]">{t("dischargeSummary")}</h2>
              <ClipboardIcon />
            </div>
            <div className="px-4 py-4">
              <p className="text-[11.5px] leading-[1.65] text-[#60727e]">
                Your visit summary includes medication guidance, warning signs and your follow-up details.
              </p>
              <dl className="mt-3 space-y-2 border-t border-[#edf2f5] pt-3 text-[10.5px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#81909a]">Reviewed by</dt>
                  <dd className="font-medium text-[#3b5363]">Dr. Anika Mehta</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#81909a]">Date</dt>
                  <dd className="font-medium text-[#3b5363]">26 Oct 2026</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={downloadSummary}
                className="mt-3 flex w-full items-center justify-between border border-[#d4e1e9] bg-[#fbfcfd] px-3 py-2 text-[10.5px] font-semibold text-brand transition-colors hover:bg-brand-light"
              >
                {t("download")} discharge summary
                <Download size={13} strokeWidth={1.9} aria-hidden="true" />
              </button>
            </div>
          </section>

          <section className="border border-[#dbe5ec] bg-white p-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} strokeWidth={1.8} className="text-link" aria-hidden="true" />
              <h2 className="text-[12px] font-semibold text-[#344d5c]">{t("followUp")}</h2>
            </div>
            <div className="mt-3 border-l-2 border-[#79a9c7] bg-[#f7fafc] px-3 py-2.5">
              <p className="text-[11px] font-semibold text-[#304a5a]">General OPD · 2 November</p>
              <p className="mt-0.5 text-[10px] text-[#738692]">09:20 · Room A-102 · Dr. Anika Mehta</p>
              <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.06em] text-[#277c55]">
                <CheckCircle2 size={10} strokeWidth={2.2} aria-hidden="true" /> {t("scheduled")}
              </span>
            </div>
            <a
              href="tel:0800600100"
              className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] font-medium text-link hover:underline"
            >
              <Phone size={11} strokeWidth={1.9} aria-hidden="true" />
              Reschedule or ask a question
            </a>
          </section>

          <section className="border border-[#dbe5ec] bg-white p-4">
            <h2 className="text-[12px] font-semibold text-[#344d5c]">{t("careTeam")}</h2>
            <ul className="mt-3 divide-y divide-[#edf2f5]">
              <li className="flex items-center gap-2.5 pb-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[9px] font-semibold text-white">AM</span>
                <div>
                  <p className="text-[10.5px] font-semibold text-[#354d5c]">Dr. Anika Mehta</p>
                  <p className="text-[9px] text-[#87949e]">General OPD · Lead clinician</p>
                </div>
              </li>
              <li className="flex items-center gap-2.5 py-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eaf1f6] text-[9px] font-semibold text-brand">NP</span>
                <div>
                  <p className="text-[10.5px] font-semibold text-[#354d5c]">Nurse Priya Nair</p>
                  <p className="text-[9px] text-[#87949e]">Transitional care coordinator</p>
                </div>
              </li>
            </ul>
            <p className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-link">
              <Phone size={11} strokeWidth={1.9} aria-hidden="true" />
              0800 600 100 · Mon–Sat, 07:00–20:00
            </p>
          </section>

          <section className="border border-[#cfe0e9] bg-brand-light p-4">
            <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.11em] text-link">
              <Bell size={11} strokeWidth={1.9} aria-hidden="true" /> Patient reminder
            </p>
            <p className="mt-1.5 text-[10.5px] leading-[1.65] text-[#596f7c]">
              Your care coordinator will call tomorrow between 10:00 and 12:00 for a short recovery check.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ArPreviewModal({ onClose }: { onClose: () => void }) {
  const { activeToken, getDepartment, language } = useHospital();
  const t = useTranslation(language);
  const department = activeToken ? getDepartment(activeToken.deptId) : getDepartment("opd");
  const [step, setStep] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const arSteps = [
    {
      instruction: `Continue straight through the atrium`,
      distance: "18 m",
      detail: "Keep the reception desk on your left and follow the blue floor line.",
      icon: ArrowUp,
    },
    {
      instruction: `Turn left towards ${t("lift")}`,
      distance: "6 m",
      detail: `Lift A is directly ahead. Take it to ${t("level")} ${department.floor}.`,
      icon: CornerUpLeft,
    },
    {
      instruction: `Follow signs for ${department.name}`,
      distance: "24 m",
      detail: `Continue along ${department.wing} until you see the ${department.name} reception desk.`,
      icon: ArrowRight,
    },
    {
      instruction: `You have arrived at Room ${department.room}`,
      distance: "0 m",
      detail: "Show your digital token at reception. A member of staff will call you when it is your turn.",
      icon: MapPin,
    },
  ];
  const current = arSteps[step];
  const Icon = current.icon;

  return createPortal(
    <div className="fixed inset-0 z-[92] bg-[#031523]">
      <img
        src="/images/wayfinding.jpg"
        alt="Indoor hospital corridor used for the augmented reality navigation preview"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#041829]/60" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,17,30,0.6)_0%,rgba(2,17,30,0.05)_40%,rgba(2,17,30,0.85)_100%)]" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-white/15 bg-[#041829]/45 px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center border border-white/25 text-white">
              <Compass size={15} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div>
              <p id="ar-preview-title" className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#a8c8dd]">
                AR indoor wayfinding
              </p>
              <p className="text-[11px] text-white/80">GovCare Queue main campus · simulated live view</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close AR preview"
            className="flex h-8 w-8 items-center justify-center border border-white/25 text-white transition-colors hover:bg-white/10"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6">
          <div className="absolute left-4 top-4 h-7 w-7 border-l border-t border-white/40 sm:left-8 sm:top-8" />
          <div className="absolute right-4 top-4 h-7 w-7 border-r border-t border-white/40 sm:right-8 sm:top-8" />
          <div className="absolute bottom-4 left-4 h-7 w-7 border-b border-l border-white/40 sm:bottom-8 sm:left-8" />
          <div className="absolute bottom-4 right-4 h-7 w-7 border-b border-r border-white/40 sm:bottom-8 sm:right-8" />

          <div className="relative flex max-w-[620px] flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 border border-white/30 bg-[#041829]/55 px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-[0.1em] text-white/85 backdrop-blur-sm">
              <Navigation size={11} strokeWidth={1.9} aria-hidden="true" />
              {current.distance} · {step + 1} of {arSteps.length}
            </span>
            <div className="relative mt-5 flex h-[116px] w-[116px] items-center justify-center rounded-full border-[1.5px] border-white/65 bg-[#072c49]/40">
              <div className="absolute inset-[15px] rounded-full border border-dashed border-white/35" />
              <Icon size={54} strokeWidth={1.15} className="relative text-white" aria-hidden="true" />
            </div>
            <p className="mt-5 max-w-[460px] text-[24px] font-semibold leading-[1.2] tracking-[-0.03em] text-white sm:text-[28px]">
              {current.instruction}
            </p>
            <p className="mt-2 max-w-[400px] text-[12px] leading-[1.65] text-white/70">{current.detail}</p>
          </div>
        </div>

        <div className="border-t border-[#dbe5ec] bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="mx-auto flex max-w-[860px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-brand-light text-brand">
                <Accessibility size={15} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10.5px] font-semibold text-[#2f4858]">
                  Step-free route to {department.name} · Room {department.room}
                </p>
                <p className="mt-0.5 text-[10px] text-[#758691]">
                  {t("level")} {department.floor} · {department.wing} · AR guidance updates as you move
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((previous) => previous - 1)}
                  className="inline-flex h-[38px] items-center gap-1.5 border border-[#cedbe4] bg-white px-3 text-[11px] font-medium text-[#5a6d79] transition-colors hover:bg-[#f6f9fb]"
                >
                  <ArrowLeft size={13} strokeWidth={1.9} aria-hidden="true" />
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={() => (step === arSteps.length - 1 ? onClose() : setStep((previous) => previous + 1))}
                className="inline-flex h-[38px] items-center gap-2 bg-brand px-4 text-[11px] font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                {step === arSteps.length - 1 ? "Finish route" : "Next direction"}
                <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ShieldIcon() {
  return (
    <span aria-hidden="true" className="mt-[1px] flex h-3 w-3 shrink-0 items-center justify-center border border-[#87949e] text-[7px] font-bold text-[#87949e]">
      i
    </span>
  );
}

function ClipboardIcon() {
  return <Pill size={15} strokeWidth={1.7} className="text-link" aria-hidden="true" />;
}


