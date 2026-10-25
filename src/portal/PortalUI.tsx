import {
  Accessibility,
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  Globe2,
  LogIn,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "../components/Logo";
import { languages, useTranslation, type TranslationKey } from "./i18n";
import { useHospital, type Language, type Severity } from "./store";
import { cn } from "../utils/cn";

export function LanguageSelect({ inverted = false }: { inverted?: boolean }) {
  const { language, setLanguage } = useHospital();
  const t = useTranslation(language);

  return (
    <label
      className={cn(
        "inline-flex items-center gap-1.5 text-[10.5px]",
        inverted ? "text-white/70" : "text-[#586a78]"
      )}
    >
      <Globe2 size={12} strokeWidth={1.8} aria-hidden="true" />
      <span className="sr-only">{t("language")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className={cn(
          "cursor-pointer appearance-none bg-transparent pr-1 text-[10.5px] font-medium outline-none",
          inverted ? "text-white" : "text-[#334a5b]"
        )}
        aria-label={t("language")}
      >
        {languages.map((option) => (
          <option key={option.value} value={option.value} className="text-[#17222c]">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PortalHeader({
  mode,
  activeTab,
  onNavigate,
  onBack,
  onSwitch,
}: {
  mode: "patient" | "staff";
  activeTab?: string;
  onNavigate: (id: string) => void;
  onBack: () => void;
  onSwitch: () => void;
}) {
  const { language, profile, staff, signOut } = useHospital();
  const t = useTranslation(language);
  const patientTabs: { id: string; label: TranslationKey }[] = [
    { id: "visit", label: "myVisit" },
    { id: "wayfinding", label: "wayfinding" },
    { id: "aftercare", label: "aftercare" },
  ];

  return (
    <header className="relative z-30 bg-white">
      <div className="bg-brand-deep text-white/70">
        <div className="container-page flex h-8 items-center justify-between gap-4 text-[10px]">
          <div className="flex items-center gap-2.5">
            <span className="font-medium text-white/90">GovCare Queue</span>
            <span aria-hidden="true" className="h-3 w-px bg-white/20" />
            <span className="hidden sm:inline">
              {mode === "patient" ? t("patientPortal") : t("staffAccess")}
            </span>
            <span className="hidden border border-white/20 px-1.5 py-0.5 text-[8.5px] uppercase tracking-[0.1em] text-white/55 md:inline">
              Demo
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <ArrowLeft size={11} strokeWidth={1.9} aria-hidden="true" />
              <span className="hidden sm:inline">{t("backToWebsite")}</span>
              <span className="sm:hidden">Website</span>
            </button>
            <span aria-hidden="true" className="h-3 w-px bg-white/20" />
            {mode === "patient" ? (
              <LanguageSelect inverted />
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10.5px] text-white/60">
                <ShieldCheck size={11} strokeWidth={1.8} aria-hidden="true" />
                Staff portal
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-[#dde6ec] bg-white">
        <div className="container-page flex h-[68px] items-center justify-between gap-5">
          <button type="button" onClick={onBack} aria-label="GovCare Queue hospital home" className="shrink-0 origin-left scale-[0.82] sm:scale-100">
            <Logo />
          </button>

          {mode === "patient" ? (
            <nav aria-label="Patient portal sections" className="hidden h-full items-stretch md:flex">
              {patientTabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={activeTab === item.id ? "page" : undefined}
                  className={cn(
                    "relative px-4 text-[12.5px] font-medium transition-colors hover:text-brand",
                    activeTab === item.id ? "text-brand" : "text-[#546472]"
                  )}
                >
                  {t(item.label)}
                  {activeTab === item.id && (
                    <span aria-hidden="true" className="absolute inset-x-3 bottom-0 h-[2px] bg-brand" />
                  )}
                </button>
              ))}
            </nav>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <ShieldCheck size={15} strokeWidth={1.7} className="text-link" aria-hidden="true" />
              <span className="text-[12.5px] font-medium text-[#415462]">
                {staff?.role === "admin" ? t("administrator") : t("doctor")} · {t("staffDesk")}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            {mode === "patient" ? (
              <>
                <div className="hidden items-center gap-2 border border-[#dce6ed] bg-[#fbfcfd] py-1.5 pl-1.5 pr-3 sm:flex">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">
                    {profile.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span className="max-w-[105px] truncate text-[11px] font-medium text-[#384c5c]">
                    {profile.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSwitch}
                  className="inline-flex h-[36px] items-center gap-1.5 rounded-[2px] border border-[#cedbe5] bg-white px-3 text-[11px] font-semibold text-brand transition-colors hover:bg-brand-light"
                >
                  <LogIn size={13} strokeWidth={1.9} aria-hidden="true" />
                  <span className="hidden sm:inline">{t("staffAccess")}</span>
                  <span className="sm:hidden">Staff</span>
                </button>
              </>
            ) : (
              <>
                <div className="hidden flex-col items-end leading-tight sm:flex">
                  <span className="text-[11px] font-semibold text-[#263c4d]">{staff?.name}</span>
                  <span className="text-[9.5px] uppercase tracking-[0.08em] text-[#7a8a96]">
                    {staff?.role === "admin" ? t("administrator") : t("doctor")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSwitch}
                  className="inline-flex h-[36px] items-center gap-1.5 rounded-[2px] bg-brand px-3 text-[11px] font-semibold text-white transition-colors hover:bg-brand-deep"
                >
                  <Accessibility size={13} strokeWidth={1.9} aria-hidden="true" />
                  <span className="hidden sm:inline">{t("patientPortal")}</span>
                  <span className="sm:hidden">Patient</span>
                </button>
                {staff && (
                  <button
                    type="button"
                    onClick={signOut}
                    className="text-[10.5px] font-medium text-[#6a7985] transition-colors hover:text-brand"
                  >
                    {t("signOut")}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {mode === "patient" && (
          <div className="flex border-t border-[#e8eef2] md:hidden">
            <div className="container-page flex">
              {patientTabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={activeTab === item.id ? "page" : undefined}
                  className={cn(
                    "relative flex-1 py-3 text-center text-[11.5px] font-medium",
                    activeTab === item.id ? "text-brand" : "text-[#64737e]"
                  )}
                >
                  {t(item.label)}
                  {activeTab === item.id && (
                    <span aria-hidden="true" className="absolute inset-x-4 bottom-0 h-[2px] bg-brand" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export function PortalFooter() {
  return (
    <footer className="mt-10 border-t border-[#dce6ed] bg-white">
      <div className="container-page flex flex-col gap-2 py-5 text-[10.5px] text-[#74838e] sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-[#455b6b]">GovCare Queue</span> · Government Hospital
          Network · Patient portal
        </p>
        <p>Demo environment · Your information is not stored on a real medical record system.</p>
      </div>
    </footer>
  );
}

export function SeverityBadge({ severity, label }: { severity: Severity; label?: string }) {
  const config: Record<Severity, { text: string; classes: string }> = {
    routine: { text: label ?? "Routine", classes: "border-[#d8e2e9] bg-[#f7fafb] text-[#546772]" },
    urgent: { text: label ?? "Urgent", classes: "border-[#ead4a9] bg-[#fdf7ea] text-[#926018]" },
    critical: { text: label ?? "Critical", classes: "border-[#e7c2bd] bg-[#fdf0ee] text-[#a23428]" },
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-[3px] text-[9.5px] font-semibold uppercase tracking-[0.055em]",
        config[severity].classes
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-[5px] w-[5px] rounded-full bg-current",
          severity === "critical" && "map-critical-pulse"
        )}
      />
      {config[severity].text}
    </span>
  );
}

export function StatusDot({ status, className }: { status: "normal" | "busy" | "critical"; className?: string }) {
  const color = status === "normal" ? "bg-[#277c55]" : status === "busy" ? "bg-[#ae761f]" : "bg-[#b53426]";
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        aria-hidden="true"
        className={cn("h-[6px] w-[6px] rounded-full", color, status === "critical" && "map-critical-pulse")}
      />
      {status === "normal" ? "Normal" : status === "busy" ? "Busy" : "Overloaded"}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-link">
      {children}
    </span>
  );
}

export function ordinal(value: number) {
  if (value <= 0) return "Next";
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
}

export function NotificationIcon({ kind }: { kind: "sms" | "delay" | "emergency" | "info" }) {
  if (kind === "emergency") return <TriangleAlert size={15} strokeWidth={1.8} />;
  if (kind === "sms") return <Bell size={15} strokeWidth={1.8} />;
  if (kind === "delay") return <ChevronRight size={15} strokeWidth={1.8} />;
  return <CheckCircle2 size={15} strokeWidth={1.8} />;
}

export function PortalToast() {
  const { toast, dismissToast } = useHospital();
  if (!toast) return null;

  const urgent = toast.kind === "emergency";
  const sms = toast.kind === "sms";

  return (
    <div
      role="status"
      aria-live="polite"
      className="portal-toast fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-[430px] border border-[#cfdde7] bg-white p-0 shadow-[0_22px_60px_-20px_rgba(4,28,49,0.55)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:mx-0"
    >
      <div className={cn("h-[3px] w-full", urgent ? "bg-alert" : sms ? "bg-[#277c55]" : "bg-brand")} />
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            urgent ? "bg-[#fbeceb] text-alert" : sms ? "bg-[#ecf6f0] text-[#277c55]" : "bg-brand-light text-brand"
          )}
        >
          <NotificationIcon kind={toast.kind} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#445a69]">
              {urgent ? "Priority alert" : sms ? "SMS notification" : "Queue update"}
            </p>
            <span className="text-[9.5px] text-[#8a97a1]">{toast.time}</span>
          </div>
          <p className="mt-1 text-[12.5px] font-semibold leading-[1.35] text-ink">{toast.title}</p>
          <p className="mt-1 text-[11.5px] leading-[1.55] text-[#5d6d78]">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Dismiss notification"
          className="mt-0.5 text-[#81909a] transition-colors hover:text-brand"
        >
          <X size={15} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

export function DemoCredentials({
  role,
  onUse,
}: {
  role: "doctor" | "admin";
  onUse: () => void;
}) {
  const t = useTranslation(useHospital().language);
  const credentials = role === "doctor" ? { username: "doctor", password: "govcare26" } : { username: "admin", password: "govcare26" };
  return (
    <div className="border border-[#dce6ed] bg-[#f7fafb] px-4 py-3.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#7a8994]">
        {t("demoCredentials")}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-[#4d6170]">
        <span>
          {t("username")}: <strong className="font-semibold text-[#213745]">{credentials.username}</strong>
        </span>
        <span>
          {t("password")}: <strong className="font-semibold text-[#213745]">{credentials.password}</strong>
        </span>
      </div>
      <button
        type="button"
        onClick={onUse}
        className="mt-2.5 text-[11px] font-semibold text-link underline-offset-2 hover:underline"
      >
        Use demo credentials →
      </button>
    </div>
  );
}
