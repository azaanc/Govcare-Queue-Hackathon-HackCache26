import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Globe2,
  Headphones,
  Home,
  MapPin,
  Phone,
  Settings,
  Siren,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { floorLabel, placeById, placesOnFloor } from "../data/hospital.js";
import { departmentById } from "../data/departments.js";
import { useOpd } from "./OpdProvider.jsx";
import { cn } from "../utils/cn";

export function navigate(path) {
  if (!path) return;
  if (window.location.hash === path) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }
  window.location.hash = path;
}

export function useSpeech() {
  const { settings, language } = useOpd();
  const [speaking, setSpeaking] = useState(false);

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text) => {
      if (!("speechSynthesis" in window) || !text) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  useEffect(() => {
    if (settings.readAloud) {
      // Screen components call speak explicitly with a concise screen summary.
    }
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [settings.readAloud]);

  return { speak, stop, speaking };
}

export function ListenButton({ text, label, className = "", compact = false }) {
  const { t } = useOpd();
  const { speak, stop, speaking } = useSpeech();
  return (
    <button
      type="button"
      onClick={() => (speaking ? stop() : speak(text))}
      aria-label={speaking ? t("stopReading") : (label ?? t("readAloud"))}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[2px] border border-[#c7d8e4] bg-white px-3 text-[13px] font-semibold text-brand transition-colors hover:bg-brand-light",
        compact && "min-h-[38px] px-2.5 text-[12px]",
        className
      )}
    >
      {speaking ? <VolumeX size={17} strokeWidth={1.9} aria-hidden="true" /> : <Volume2 size={17} strokeWidth={1.9} aria-hidden="true" />}
      <span>{speaking ? t("stopReading") : (label ?? t("readAloud"))}</span>
    </button>
  );
}

export function LanguageGate() {
  const { t, chooseLanguage, settings } = useOpd();
  const [urgentOpen, setUrgentOpen] = useState(false);
  if (settings.languageChosen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[#04192b]/60 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="language-title">
      <div className="w-full max-w-[540px] border border-[#d7e3eb] bg-white shadow-[0_30px_90px_-25px_rgba(3,20,36,0.65)]">
        <div className="h-[3px] w-full bg-brand" />
        <div className="px-6 py-7 sm:px-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-brand">
            <Globe2 size={22} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h1 id="language-title" className="mt-4 text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink">
            {t("chooseLanguage")}
          </h1>
          <p className="mt-2 text-[15px] leading-[1.6] text-copy">{t("chooseLanguageHelp")}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => chooseLanguage("en")}
              className="flex min-h-[64px] items-center justify-between gap-3 border border-[#cedbe5] bg-white px-4 text-left text-[18px] font-semibold text-[#243c4d] transition-colors hover:border-brand hover:bg-brand-light"
            >
              English
              <ArrowRight size={19} strokeWidth={2} className="text-brand" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => chooseLanguage("hi")}
              className="flex min-h-[64px] items-center justify-between gap-3 border border-[#cedbe5] bg-white px-4 text-left text-[18px] font-semibold text-[#243c4d] transition-colors hover:border-brand hover:bg-brand-light"
            >
              हिंदी
              <ArrowRight size={19} strokeWidth={2} className="text-brand" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-4 grid gap-2 border-t border-rule pt-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                chooseLanguage(settings.language || "en");
                navigate("#/opd/emergency");
              }}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 bg-[#a53428] px-2 text-white hover:bg-[#8f2e23]"
            >
              <Siren size={16} strokeWidth={2} aria-hidden="true" />
              {t("emergencyShort")} — 112 · 108
            </button>
            <button
              type="button"
              onClick={() => setUrgentOpen(true)}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 border border-[#dcb1aa] bg-[#fdf3f1] px-2 text-[#963b31] hover:bg-[#fbe7e4]"
            >
              <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
              {t("urgentHelp")}
            </button>
          </div>
          <UrgentFlagModal open={urgentOpen} onClose={() => setUrgentOpen(false)} />
          <p className="mt-3 text-[12px] leading-[1.6] text-[#7a8994]">{t("demoNotice")}</p>
        </div>
      </div>
    </div>
  );
}

function OpdMark() {
  const { t } = useOpd();
  return (
    <span className="inline-flex items-center gap-[9px] whitespace-nowrap sm:gap-[11px]">
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0">
        <rect width="38" height="38" rx="2" fill="#0b3f6b" />
        <path d="M16.4 8.2h5.2v8.2h8.2v5.2h-8.2v8.2h-5.2v-8.2h-8.2v-5.2h8.2V8.2Z" fill="#ffffff" />
        <rect x="29" y="5" width="4" height="4" fill="#9fc4dc" />
      </svg>
      <span className="flex flex-col">
        <span className="text-[18px] font-semibold leading-none tracking-[-0.04em] text-brand-deep sm:text-[20px]">
          OPD <span className="font-normal text-link">Saathi</span>
        </span>
        <span className="mt-[5px] hidden text-[8.5px] font-medium uppercase leading-none tracking-[0.14em] text-copy sm:block">
          {t("hospitalName")}
        </span>
      </span>
    </span>
  );
}

export function OpdHeader({ pageTitle = "", compact = false }) {
  const { t, settings, setSettings, activeQueueInfo } = useOpd();
  const emergencyVisible = !["emergency"].includes(pageTitle);

  return (
    <header className="relative z-40 bg-white">
      <div className="bg-brand-deep text-white/75">
        <div className="container-page flex min-h-[36px] items-center justify-between gap-3 py-1 text-[11px]">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="font-semibold text-white">OPD Saathi</span>
            <span aria-hidden="true" className="h-3 w-px bg-white/20" />
            <span className="truncate">{t("hospitalName")}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
            <label className="inline-flex items-center gap-1 text-[11px] text-white/80">
              <Globe2 size={11} strokeWidth={1.8} aria-hidden="true" />
              <span className="sr-only">{t("language")}</span>
              <select
                value={settings.language}
                onChange={(event) => setSettings({ language: event.target.value, languageChosen: true })}
                className="cursor-pointer appearance-none bg-transparent text-[11px] font-semibold text-white outline-none"
                aria-label={t("language")}
              >
                <option value="en" className="text-ink">English</option>
                <option value="hi" className="text-ink">हिंदी</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => navigate("#/opd/settings")}
              className="inline-flex items-center gap-1.5 text-[11px] transition-colors hover:text-white"
            >
              <Settings size={11} strokeWidth={1.8} aria-hidden="true" />
              {t("settings")}
            </button>
            <button
              type="button"
              onClick={() => navigate("#/opd/emergency")}
              className="inline-flex items-center gap-1.5 font-semibold text-[#ffd9d3] transition-colors hover:text-white"
            >
              <Siren size={12} strokeWidth={2} aria-hidden="true" />
              {t("emergencyShort")}
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-rule bg-white">
        <div className={cn("container-page flex items-center justify-between gap-4", compact ? "h-[62px]" : "h-[74px]")}>
          <button
            type="button"
            onClick={() => navigate("#/opd")}
            aria-label={`${t("appName")} ${t("home")}`}
            className="min-w-0 text-left"
          >
            <OpdMark />
          </button>
          <div className="flex shrink-0 items-center gap-2">
            {activeQueueInfo && (
              <button
                type="button"
                onClick={() => navigate("#/opd/turn")}
                className="hidden min-h-[38px] items-center gap-2 border border-[#cfdde7] bg-[#f8fbfc] px-3 text-[12px] font-semibold text-brand sm:inline-flex"
              >
                <span className="numeric">{activeQueueInfo.token}</span>
                <ArrowRight size={13} strokeWidth={1.9} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("#/opd")}
              aria-label={t("home")}
              className="inline-flex h-[38px] w-[38px] items-center justify-center border border-[#cfdde7] text-brand transition-colors hover:bg-brand-light"
            >
              <Home size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
            {emergencyVisible && (
              <button
                type="button"
                onClick={() => navigate("#/opd/emergency")}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-[#dfb0a9] bg-[#fdf3f1] px-3 text-[12px] font-semibold text-[#963b31] transition-colors hover:bg-[#fbe7e4] sm:px-4"
              >
                <Siren size={15} strokeWidth={2} aria-hidden="true" />
                {t("emergency")}
              </button>
            )}
          </div>
        </div>
      </div>
      {pageTitle && (
        <div className="border-b border-rule bg-[#f8fbfc]">
          <div className="container-page flex min-h-[34px] items-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6d7e89]">{pageTitle}</p>
          </div>
        </div>
      )}
    </header>
  );
}

export function OpdFooter() {
  const { t } = useOpd();
  return (
    <footer className="mt-10 border-t border-rule bg-white">
      <div className="container-page flex flex-col gap-3 py-5 text-[11.5px] leading-[1.6] text-[#74838e] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-[#455b6b]">OPD Saathi · {t("hospitalName")}</p>
          <p className="mt-0.5">{t("demoNotice")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button type="button" onClick={() => navigate("#/opd/settings")} className="hover:text-brand hover:underline">
            {t("settings")}
          </button>
          <button type="button" onClick={() => navigate("#/opd/emergency")} className="font-semibold text-[#963b31] hover:underline">
            {t("emergency")}
          </button>
          <button type="button" onClick={() => navigate("#/")} className="hover:text-brand hover:underline">
            {t("hospitalWebsite")}
          </button>
          <span className="inline-flex items-center gap-1.5">
            <Phone size={11} strokeWidth={1.9} aria-hidden="true" />
            112 · 108
          </span>
        </div>
      </div>
    </footer>
  );
}

export function OpdPage({ title, subtitle, children, backTo, backLabel, actions, footer = true, className = "" }) {
  const { t } = useOpd();
  const headingRef = useRef(null);
  const summary = `${title}. ${subtitle ?? ""}`;
  const { speak } = useSpeech();
  const { settings } = useOpd();

  useEffect(() => {
    headingRef.current?.focus();
    if (settings.readAloud) speak(summary);
    // summary changes are intentional: each screen is announced once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  return (
    <div className={`opd-app min-h-screen bg-[#f6f9fb] ${className}`}>
      <OpdHeader pageTitle={title} />
      <main id="opd-main" className="container-page pb-12 pt-5 sm:pt-7">
        {(backTo || actions) && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            {backTo ? (
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-[#61727e] transition-colors hover:text-brand"
              >
                <ArrowLeft size={16} strokeWidth={1.9} aria-hidden="true" />
                {backLabel ?? t("back")}
              </button>
            ) : <span />}
            {actions}
          </div>
        )}
        <div className="mx-auto max-w-[1100px]">
          {!backTo && (
            <span aria-hidden="true" className="mb-3 block h-px w-8 bg-[#9fbdd2]" />
          )}
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="opd-heading max-w-[760px] text-[28px] font-semibold leading-[1.16] tracking-[-0.032em] text-ink outline-none focus:outline-none focus-visible:outline-none sm:text-[34px]"
          >
            {title}
          </h1>
          {subtitle && <p className="mt-2 max-w-[680px] text-[15px] leading-[1.7] text-copy sm:text-[16px]">{subtitle}</p>}
          <div className="mt-5">{children}</div>
        </div>
      </main>
      {footer && <OpdFooter />}
    </div>
  );
}

export function BigAction({ icon: Icon, title, subtitle, onClick, href, tone = "default", disabled = false }) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      {...(href ? { href } : { type: "button", onClick, disabled })}
      className={cn(
        "group flex min-h-[76px] w-full items-center gap-4 border px-4 py-3.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link",
        tone === "emergency"
          ? "border-[#dcb1aa] bg-[#fdf4f2] hover:bg-[#fbe9e6]"
          : tone === "primary"
            ? "border-brand bg-brand text-white hover:bg-brand-deep"
            : "border-[#d3e0e9] bg-white hover:border-[#94b4ca] hover:bg-[#fbfdfe]",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
          tone === "emergency"
            ? "bg-[#f6ddd9] text-[#973c31]"
            : tone === "primary"
              ? "bg-white/15 text-white"
              : "bg-brand-light text-brand"
        )}
      >
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[17px] font-semibold leading-[1.35]",
            tone === "primary" ? "text-white" : tone === "emergency" ? "text-[#7e2f26]" : "text-ink"
          )}
        >
          {title}
        </span>
        {subtitle && (
          <span
            className={cn(
              "mt-0.5 block text-[12px] leading-[1.5]",
              tone === "primary" ? "text-white/70" : tone === "emergency" ? "text-[#8a554f]" : "text-[#71818d]"
            )}
          >
            {subtitle}
          </span>
        )}
      </span>
      <ArrowRight
        size={18}
        strokeWidth={1.9}
        className={cn(
          "shrink-0 transition-transform group-hover:translate-x-0.5",
          tone === "primary" ? "text-white/70" : tone === "emergency" ? "text-[#a44b40]" : "text-[#7b91a1]"
        )}
        aria-hidden="true"
      />
    </Tag>
  );
}

export function InfoNote({ children, tone = "info", icon: Icon }) {
  const defaultIcon = Icon ?? (tone === "danger" ? AlertTriangle : tone === "access" ? Accessibility : null);
  const Tag = defaultIcon ?? InfoIcon;
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 border px-3.5 py-3 text-[12.5px] leading-[1.65]",
        tone === "danger"
          ? "border-[#dfb3ac] border-l-[3px] border-l-[#a53428] bg-[#fdf3f1] text-[#7e3b32]"
          : tone === "warn"
            ? "border-[#e3ccaa] border-l-[3px] border-l-[#a47a2c] bg-[#fdf9f1] text-[#725a2d]"
            : tone === "access"
              ? "border-[#c5dce8] border-l-[3px] border-l-[#3c7b9f] bg-[#f3f9fc] text-[#405e70]"
              : "border-[#d7e3eb] bg-[#f7fafc] text-[#526874]"
      )}
    >
      <Tag size={16} strokeWidth={1.9} className="mt-[1px] shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

function InfoIcon({ size = 16, strokeWidth = 1.9, className }) {
  return <MapPin size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}

export function SectionTitle({ children, icon: Icon }) {
  return (
    <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.09em] text-[#536876]">
      {Icon && <Icon size={15} strokeWidth={1.8} className="text-link" aria-hidden="true" />}
      {children}
    </h2>
  );
}

const floorBounds = { minX: 40, maxX: 800, minY: 55, maxY: 445 };

export function HospitalFloorPlan({ floor = 0, path = null, currentId = null, destinationId = null, compact = false }) {
  const { language, t } = useOpd();
  const floorPlaces = useMemo(() => placesOnFloor(floor), [floor]);
  const typeKeys = {
    entrance: "mapEntrance",
    service: "mapService",
    help: "mapHelp",
    emergency: "mapEmergency",
    facility: "mapFacility",
    accessibility: "mapAccess",
    lift: "mapLift",
    stairs: "mapStairs",
    room: "mapRoom",
    waiting: "mapWaiting",
    ward: "mapWard",
  };
  const nodes = path?.nodes ?? [];
  const floorNodes = nodes.filter((id) => placeById(id).floor === Number(floor));
  const routePoints = floorNodes.map((id) => {
    const place = placeById(id);
    return `${place.x},${place.y}`;
  });
  const current = currentId ? placeById(currentId) : null;
  const destination = destinationId ? placeById(destinationId) : null;
  const destinationOnFloor = destination?.floor === Number(floor);

  return (
    <div className="w-full overflow-hidden border border-[#d7e3eb] bg-[#f8fbfd]">
      <svg
        viewBox="0 0 840 500"
        role="img"
        aria-label={`${t("floorPlan")} · ${floorLabel(floor, language)}`}
        className="block h-auto w-full"
      >
        <defs>
          <pattern id={`opd-grid-${floor}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#e7eff4" />
          </pattern>
          <marker id={`opd-arrow-${floor}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0b527e" />
          </marker>
        </defs>
        <rect width="840" height="500" fill="#f8fbfd" />
        <rect width="840" height="500" fill={`url(#opd-grid-${floor})`} />
        <rect x="35" y="35" width="770" height="420" rx="2" fill="#ffffff" stroke="#c8d7e2" strokeWidth="1.3" />
        <rect x="310" y="195" width="230" height="105" fill="#f2f7fa" stroke="#dce7ef" />
        <text x="425" y="245" textAnchor="middle" fill="#687985" fontSize="10" fontWeight="600" letterSpacing="1">
          {t("centralCorridor")}
        </text>
        <text x="425" y="263" textAnchor="middle" fill="#8796a1" fontSize="8.5">
          {floorLabel(floor, language)}
        </text>

        {floorPlaces.map((place) => {
          const width = place.type === "facility" || place.type === "lift" || place.type === "stairs" ? 72 : 104;
          const height = place.type === "facility" || place.type === "lift" || place.type === "stairs" ? 54 : 58;
          const isDestination = destinationOnFloor && place.id === destination?.id;
          const isCurrent = current?.floor === Number(floor) && place.id === current?.id;
          return (
            <g key={place.id}>
              <rect
                x={place.x - width / 2}
                y={place.y - height / 2}
                width={width}
                height={height}
                rx="2"
                fill={isDestination ? "#e5f1f8" : isCurrent ? "#eef7f1" : "#fbfdfe"}
                stroke={isDestination ? "#3c7b9f" : isCurrent ? "#4e8b68" : "#d6e2ea"}
                strokeWidth={isDestination || isCurrent ? 1.8 : 1}
              />
              <text
                x={place.x}
                y={place.y - 2}
                textAnchor="middle"
                fill="#263d4d"
                fontSize={compact ? "8" : "9"}
                fontWeight="600"
                fontFamily="Inter, sans-serif"
              >
                {String(place.name[language] ?? place.name.en).slice(0, 22)}
              </text>
              <text
                x={place.x}
                y={place.y + 11}
                textAnchor="middle"
                fill="#758691"
                fontSize={compact ? "6.5" : "7.5"}
                fontFamily="Inter, sans-serif"
              >
                {place.type === "lift" || place.type === "stairs" ? floorLabel(place.floor, language) : t(typeKeys[place.type] ?? "mapPlace")}
              </text>
              {isDestination && (
                <g>
                  <circle cx={place.x} cy={place.y - height / 2 - 8} r="5" fill="#0b3f6b" />
                  <text x={place.x + 9} y={place.y - height / 2 - 5} fill="#0b3f6b" fontSize="7.5" fontWeight="700">
                    {t("mapTo").toUpperCase()}
                  </text>
                </g>
              )}
              {isCurrent && (
                <g>
                  <circle cx={place.x} cy={place.y - height / 2 - 8} r="4.5" fill="#277c55" />
                  <text x={place.x + 8} y={place.y - height / 2 - 5} fill="#277c55" fontSize="7.5" fontWeight="700">
                    {t("you")}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {floorNodes.length > 1 && (
          <>
            <polyline points={routePoints.join(" ")} fill="none" stroke="#ffffff" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
            <polyline
              points={routePoints.join(" ")}
              fill="none"
              stroke="#0b527e"
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="9 7"
              markerEnd={`url(#opd-arrow-${floor})`}
              className="opd-map-route"
            />
          </>
        )}
        {floorNodes.length === 1 && (current || destination) && (
          <circle
            cx={placeById(floorNodes[0]).x}
            cy={placeById(floorNodes[0]).y}
            r="7"
            fill="#0b527e"
            stroke="#fff"
            strokeWidth="3"
          />
        )}

        <text x="52" y="478" fill="#8a98a2" fontSize="8" fontFamily="Inter, sans-serif">
          {t("hospitalName")} · {floorLabel(floor, language)} · {t("schematicPlan")}
        </text>
      </svg>
    </div>
  );
}

export function FloorTabs({ floors, active, onChange }) {
  const { t } = useOpd();
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t("floorPlan")}>
      {floors.map((floor) => (
        <button
          key={floor}
          type="button"
          role="tab"
          aria-selected={active === floor}
          onClick={() => onChange(floor)}
          className={cn(
            "min-h-[36px] border px-3 text-[11.5px] font-semibold transition-colors",
            active === floor
              ? "border-brand bg-brand text-white"
              : "border-[#d6e2e9] bg-white text-[#627481] hover:bg-[#f5f9fb]"
          )}
        >
          {floor === 0 ? "G" : floor}
        </button>
      ))}
    </div>
  );
}

export function StaffOnlyNote() {
  const { t } = useOpd();
  return <InfoNote tone="warn">{t("staffLoginNote")}</InfoNote>;
}

export function UrgentFlagModal({ open, onClose }) {
  const { t, raiseUrgentFlag, activeQueueInfo, activeToken } = useOpd();
  const [reason, setReason] = useState("urgentReasonUnwell");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) setSent(false);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const close = () => onClose();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("hashchange", close);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("hashchange", close);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;
  const reasons = [
    "urgentReasonUnwell",
    "urgentReasonPain",
    "urgentReasonBreathing",
    "urgentReasonFell",
    "urgentReasonHelper",
    "urgentReasonOther",
  ];
  const send = () => {
    raiseUrgentFlag({
      reasonKey: reason,
      token: activeToken,
      deptId: activeQueueInfo?.deptId ?? null,
    });
    setSent(true);
  };
  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-[#04192b]/60 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="urgent-title">
      <div className="w-full max-w-[580px] border border-[#d7e3eb] bg-white shadow-[0_30px_90px_-25px_rgba(3,20,36,0.65)]">
        <div className="h-[3px] w-full bg-[#a53428]" />
        <div className="flex items-start justify-between gap-3 border-b border-rule px-5 py-4">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#a53428]">
              <AlertTriangle size={13} strokeWidth={2} aria-hidden="true" />
              {t("urgentHelp")}
            </p>
            <h2 id="urgent-title" className="mt-1.5 text-[21px] font-semibold text-ink">{t("urgentHelpTitle")}</h2>
            <p className="mt-1 text-[13px] leading-[1.6] text-copy">{t("urgentHelpIntro")}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t("close")} className="flex h-8 w-8 shrink-0 items-center justify-center text-[#667581] hover:bg-[#f2f6f9]">
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>
        {sent ? (
          <div className="px-5 py-6">
            <div className="flex items-start gap-3 border border-[#bcd9c9] bg-[#f2f9f5] px-4 py-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#277c55] text-white">
                <Check size={17} strokeWidth={2.4} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-[#2f5d48]">{t("urgentSent")}</p>
                <p className="mt-1 text-[13px] leading-[1.65] text-[#4f6f60]">{t("urgentSentHelp")}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={() => navigate("#/opd/emergency")} className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 bg-[#a53428] px-4 text-[13px] font-semibold text-white hover:bg-[#8f2e23]">
                <Siren size={16} strokeWidth={2} aria-hidden="true" />
                {t("urgentGoEmergency")}
              </button>
              <button type="button" onClick={onClose} className="inline-flex min-h-[48px] flex-1 items-center justify-center border border-[#cedbe5] px-4 text-[13px] font-semibold text-brand hover:bg-brand-light">
                {t("close")}
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-4">
            <fieldset>
              <legend className="text-[13px] font-semibold text-[#354b5b]">{t("urgentReason")}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {reasons.map((key) => (
                  <label key={key} className={`flex min-h-[46px] cursor-pointer items-center gap-2.5 border px-3 py-2 text-[13px] leading-[1.4] ${reason === key ? "border-brand bg-brand-light text-brand" : "border-[#d7e3eb] text-[#4e6473]"}`}>
                    <input type="radio" name="urgent-reason" value={key} checked={reason === key} onChange={() => setReason(key)} className="accent-[#0b3f6b]" />
                    {t(key)}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={send} className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 bg-[#a53428] px-4 text-[13px] font-semibold text-white hover:bg-[#8f2e23]">
                <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
                {t("urgentSend")}
              </button>
              <button type="button" onClick={() => navigate("#/opd/emergency")} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#dcb1aa] px-4 text-[13px] font-semibold text-[#963b31] hover:bg-[#fdf3f1]">
                <Siren size={15} strokeWidth={2} aria-hidden="true" />
                {t("emergency")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function OngoingHelpBar() {
  const { t } = useOpd();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);
  return (
    <>
      <div className="fixed bottom-3 left-3 z-[55] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#dca9a2] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#943a31] shadow-[0_8px_24px_-10px_rgba(4,28,49,0.45)] hover:bg-[#fdf3f1]"
        >
          <AlertTriangle size={15} strokeWidth={2} aria-hidden="true" />
          {t("urgentHelp")}
        </button>
      </div>
      <UrgentFlagModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function GlobalEmergencyButton() {
  const { t } = useOpd();
  return (
    <button
      type="button"
      onClick={() => navigate("#/opd/emergency")}
      className="fixed bottom-3 right-3 z-[58] inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#7e2f26] bg-[#a53428] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_10px_28px_-12px_rgba(86,22,14,0.7)] transition-colors hover:bg-[#8f2e23]"
      aria-label={`${t("emergency")}: ${t("emergencyHelp")} · 112 · 108`}
    >
      <Siren size={16} strokeWidth={2} aria-hidden="true" />
      {t("emergencyShort")}
    </button>
  );
}

export function SettingsScreen({ embedded = false }) {
  const { t, settings, setSettings } = useOpd();
  const { speak } = useSpeech();
  const [confirmReset, setConfirmReset] = useState(false);
  const { resetDemo } = useOpd();

  const toggle = async (key) => {
    let next = !settings[key];
    if (key === "alerts" && next) {
      if (typeof Notification === "undefined") {
        next = false;
      } else {
        try {
          next = (await Notification.requestPermission()) === "granted";
        } catch {
          next = false;
        }
      }
    }
    setSettings({ [key]: next });
    if (key === "assistedMode" && next) setSettings({ textSize: "large", readAloud: true, avoidStairs: true });
  };

  const content = (
    <div className={`grid gap-4 ${embedded ? "" : "lg:grid-cols-2"}`}>
      <section className="border border-[#d7e3eb] bg-white">
        <div className="border-b border-[#e5ecf1] px-4 py-3.5">
          <SectionTitle icon={Globe2}>{t("language")}</SectionTitle>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3">
          <button
            type="button"
            onClick={() => setSettings({ language: "en" })}
            aria-pressed={settings.language === "en"}
            className={`min-h-[56px] border px-3 text-[16px] font-semibold ${settings.language === "en" ? "border-brand bg-brand text-white" : "border-[#cfdce5] bg-white text-ink hover:bg-brand-light"}`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setSettings({ language: "hi" })}
            aria-pressed={settings.language === "hi"}
            className={`min-h-[56px] border px-3 text-[16px] font-semibold ${settings.language === "hi" ? "border-brand bg-brand text-white" : "border-[#cfdce5] bg-white text-ink hover:bg-brand-light"}`}
          >
            हिंदी
          </button>
        </div>
      </section>

      <section className="border border-[#d7e3eb] bg-white">
        <div className="border-b border-[#e5ecf1] px-4 py-3.5">
          <SectionTitle icon={Accessibility}>{t("textSize")}</SectionTitle>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {[
            ["normal", t("textNormal"), "text-[13px]"],
            ["large", t("textLarge"), "text-[17px]"],
            ["largest", t("textLargest"), "text-[21px]"],
          ].map(([value, label, size]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSettings({ textSize: value })}
              aria-pressed={settings.textSize === value}
              className={`flex min-h-[62px] flex-col items-center justify-center border px-2 font-semibold ${settings.textSize === value ? "border-brand bg-brand-light text-brand ring-1 ring-brand" : "border-[#cfdce5] bg-white text-[#4f6471] hover:bg-[#f7fafc]"}`}
            >
              <span className={size}>A</span>
              <span className="mt-0.5 text-[10px]">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="border border-[#d7e3eb] bg-white lg:col-span-2">
        <div className="border-b border-[#e5ecf1] px-4 py-3.5">
          <SectionTitle icon={Headphones}>{t("settingsTitle")}</SectionTitle>
        </div>
        <div className="divide-y divide-[#edf2f5]">
          {[
            ["highContrast", t("highContrast"), t("highContrastHelp")],
            ["readAloud", t("readAloudSetting"), t("readAloudHelp")],
            ["assistedMode", t("assistedModeSetting"), t("assistedModeHelp")],
            ["alerts", t("alertsSetting"), t("alertsSettingHelp")],
            ["avoidStairs", t("avoidStairs"), t("avoidStairsHelp")],
          ].map(([key, title, help]) => (
            <div key={key} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <div>
                <p className="text-[14px] font-semibold text-[#2e4656]">{title}</p>
                <p className="mt-0.5 text-[11.5px] leading-[1.55] text-[#778792]">{help}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(settings[key])}
                aria-label={title}
                onClick={() => toggle(key)}
                className={`relative h-[26px] w-[46px] shrink-0 rounded-full border transition-colors ${settings[key] ? "border-brand bg-brand" : "border-[#bccbd5] bg-[#dbe5eb]"}`}
              >
                <span className={`absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-[left] ${settings[key] ? "left-[22px]" : "left-[2px]"}`} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-[#d7e3eb] bg-white lg:col-span-2">
        <div className="border-b border-[#e5ecf1] px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <SectionTitle icon={Phone}>{t("emergencySettings")}</SectionTitle>
            <ListenButton text={`${t("settingsTitle")}. ${t("textSize")}. ${t("highContrast")}. ${t("readAloudSetting")}. ${t("emergencySettings")}: 112, 108.`} compact />
          </div>
        </div>
        <div className="grid gap-2 p-3 sm:grid-cols-2">
          <a href="tel:112" className="flex min-h-[58px] items-center justify-between gap-3 border border-[#e0b6b0] bg-[#fdf3f1] px-3 text-[15px] font-semibold text-[#8e352b]">
            <span>112</span>
            <span className="text-[11.5px] font-medium">{t("emergencyCall112")}</span>
            <Phone size={16} strokeWidth={2} aria-hidden="true" />
          </a>
          <a href="tel:108" className="flex min-h-[58px] items-center justify-between gap-3 border border-[#d7e3eb] bg-[#f7fafc] px-3 text-[15px] font-semibold text-brand">
            <span>108</span>
            <span className="text-[11.5px] font-medium">{t("emergencyCall108")}</span>
            <Phone size={16} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
        <p className="border-t border-[#edf2f5] px-4 py-3 text-[11.5px] leading-[1.6] text-[#6c7d89]">{t("emergencySettingsHelp")}</p>
      </section>

      <section className="border border-[#d7e3eb] bg-white lg:col-span-2">
        <div className="border-b border-[#e5ecf1] px-4 py-3.5">
          <SectionTitle icon={Accessibility}>{t("privacyTitle")}</SectionTitle>
        </div>
        <div className="px-4 py-3.5">
          <p className="text-[12px] leading-[1.65] text-[#5d707d]">{t("privacyText")}</p>
          {confirmReset ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 border border-[#e3c8c3] bg-[#fdf5f3] px-3 py-2.5">
              <p className="flex-1 text-[12px] text-[#8f3a31]">{t("resetConfirm")}</p>
              <button type="button" onClick={() => { resetDemo(); setConfirmReset(false); speak(t("resetDone")); }} className="min-h-[38px] bg-[#a53428] px-3 text-[11.5px] font-semibold text-white">{t("staffReset")}</button>
              <button type="button" onClick={() => setConfirmReset(false)} className="min-h-[38px] border border-[#d7e3eb] px-3 text-[11.5px] font-semibold text-[#647682]">{t("cancel")}</button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmReset(true)} className="mt-3 min-h-[40px] border border-[#d7e3eb] px-3 text-[12px] font-semibold text-[#6d7d88] hover:bg-[#f7fafc]">
              {t("demoData")}
            </button>
          )}
        </div>
      </section>
    </div>
  );

  return content;
}
