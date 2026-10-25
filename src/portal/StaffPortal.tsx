import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Eye,
  EyeOff,
  Gauge,
  LayoutGrid,
  LogIn,
  MapPinned,
  Plus,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import { useHospital, type DepartmentId, type Severity } from "./store";
import { useTranslation } from "./i18n";
import {
  DemoCredentials,
  NotificationIcon,
  PortalFooter,
  PortalHeader,
  SectionLabel,
  SeverityBadge,
  StatusDot,
} from "./PortalUI";
import { HospitalMap } from "./HospitalMap";
import { cn } from "../utils/cn";

const severityOrder: Record<Severity, number> = { critical: 0, urgent: 1, routine: 2 };
const allDepartments: { id: DepartmentId; name: string }[] = [
  { id: "opd", name: "General OPD" },
  { id: "cardiology", name: "Cardiology" },
  { id: "pediatrics", name: "Pediatrics" },
  { id: "laboratory", name: "Laboratory" },
  { id: "pharmacy", name: "Pharmacy" },
  { id: "radiology", name: "Radiology" },
];

export function StaffPortal({ onBack, onSwitch }: { onBack: () => void; onSwitch: () => void }) {
  const { staff } = useHospital();

  return (
    <div className="min-h-screen bg-[#f6f9fb]">
      <PortalHeader mode="staff" onNavigate={() => undefined} onBack={onBack} onSwitch={onSwitch} />
      <main className="container-page pb-12 pt-7 sm:pt-8">
        {staff ? <StaffDashboard /> : <StaffLogin />}
      </main>
      <PortalFooter />
    </div>
  );
}

function StaffLogin() {
  const { language, signIn } = useHospital();
  const t = useTranslation(language);
  const [role, setRole] = useState<"doctor" | "admin">("doctor");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    const success = signIn(username, password, role);
    if (!success) {
      setError("Those credentials do not match this demo. Use the details below or try doctor / govcare26.");
    }
  };

  const useDemo = () => {
    setUsername(role === "doctor" ? "doctor" : "admin");
    setPassword("govcare26");
    setError("");
  };

  return (
    <div className="mx-auto max-w-[980px]">
      <div className="mb-5 flex items-center gap-2 text-[10.5px] text-[#71818c]">
        <ShieldCheck size={14} strokeWidth={1.8} className="text-link" aria-hidden="true" />
        Secure staff access · GovCare Queue · Government Hospital
      </div>

      <div className="grid overflow-hidden border border-[#d7e3eb] bg-white lg:grid-cols-12">
        <div className="relative overflow-hidden bg-brand-deep px-6 py-7 text-white sm:px-8 sm:py-9 lg:col-span-5">
          <div aria-hidden="true" className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-[28px] border-white/[0.045]" />
          <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full border-[32px] border-white/[0.035]" />
          <div className="relative">
            <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9dc3da]">
              <span aria-hidden="true" className="h-px w-5 bg-[#8cb7d1]" />
              Hospital command centre
            </p>
            <h1 className="mt-4 max-w-[300px] text-[29px] font-semibold leading-[1.14] tracking-[-0.03em]">
              {t("staffLogin")}
            </h1>
            <p className="mt-3 max-w-[320px] text-[12px] leading-[1.7] text-white/65">
              Keep queues moving, respond to critical cases and reallocate clinical staff where they are needed most.
            </p>

            <ul className="mt-7 space-y-4">
              {[
                { icon: Users, title: "Live patient queue", text: "One-click call next, priority and delay controls." },
                { icon: BellRing, title: "Emergency pre-alerts", text: "Instant critical codes from check-in and ambulance teams." },
                { icon: MapPinned, title: "Bottleneck heatmap", text: "Spot overloaded departments and rebalance in real time." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-white/20 bg-white/5 text-[#b4d3e5]">
                      <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[11.5px] font-semibold text-white/90">{item.title}</p>
                      <p className="mt-0.5 text-[10px] leading-[1.55] text-white/55">{item.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex items-start gap-2 border-t border-white/15 pt-4">
              <ShieldCheck size={13} strokeWidth={1.8} className="mt-[1px] shrink-0 text-[#9fc6dc]" aria-hidden="true" />
              <p className="text-[9.5px] leading-[1.6] text-white/50">
                Demo environment. No real patient information is used or stored. Access is for GovCare Queue staff only.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-7 sm:px-8 sm:py-8 lg:col-span-7 lg:px-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SectionLabel>Demo sign-in</SectionLabel>
              <h2 className="mt-2 text-[21px] font-semibold tracking-[-0.025em] text-ink">{t("welcomeBack")}</h2>
              <p className="mt-1 text-[11.5px] leading-[1.6] text-[#6d7d88]">
                Sign in to open the clinical queue and analytics dashboard.
              </p>
            </div>
            <span className="hidden items-center gap-1.5 border border-[#d6e3eb] bg-[#f8fbfc] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#5d7280] sm:flex">
              <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-[#277c55]" />
              Demo online
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 border border-[#d5e1e9] p-1" role="tablist" aria-label="Staff role">
            {(["doctor", "admin"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={role === option}
                onClick={() => {
                  setRole(option);
                  setError("");
                }}
                className={cn(
                  "flex h-[36px] items-center justify-center gap-1.5 text-[11px] font-semibold transition-colors",
                  role === option ? "bg-brand text-white" : "text-[#5d6f7b] hover:bg-[#f4f8fa]"
                )}
              >
                {option === "doctor" ? <Stethoscope size={13} strokeWidth={1.8} aria-hidden="true" /> : <LayoutGrid size={13} strokeWidth={1.8} aria-hidden="true" />}
                {option === "doctor" ? t("doctor") : t("administrator")}
              </button>
            ))}
          </div>

          <form className="mt-5 space-y-3.5" onSubmit={submit}>
            <label className="block">
              <span className="text-[11px] font-semibold text-[#354b5b]">{t("username")}</span>
              <div className="relative mt-1.5">
                <UserRound
                  size={14}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9ba4]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError("");
                  }}
                  placeholder={role === "doctor" ? "doctor" : "admin"}
                  autoComplete="username"
                  className="h-[42px] w-full border border-[#cfdbe4] bg-white pl-9 pr-3 text-[12.5px] text-ink outline-none placeholder:text-[#9aa6ae] focus:border-[#6f9bb8]"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold text-[#354b5b]">{t("password")}</span>
              <div className="relative mt-1.5">
                <ShieldCheck
                  size={14}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9ba4]"
                  aria-hidden="true"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your demo password"
                  autoComplete="current-password"
                  className="h-[42px] w-full border border-[#cfdbe4] bg-white pl-9 pr-10 text-[12.5px] text-ink outline-none placeholder:text-[#9aa6ae] focus:border-[#6f9bb8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[#81909a] transition-colors hover:text-brand"
                >
                  {showPassword ? <EyeOff size={14} strokeWidth={1.8} /> : <Eye size={14} strokeWidth={1.8} />}
                </button>
              </div>
            </label>

            {error && (
              <p role="alert" className="flex items-start gap-1.5 text-[10.5px] font-medium leading-[1.5] text-[#a53428]">
                <CircleAlert size={12} strokeWidth={2} className="mt-[1px] shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}

            <button
              type="submit"
              className="inline-flex h-[42px] w-full items-center justify-center gap-2 bg-brand text-[12px] font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              <LogIn size={14} strokeWidth={1.9} aria-hidden="true" />
              {t("signIn")}
            </button>
          </form>

          <div className="mt-5">
            <DemoCredentials role={role} onUse={useDemo} />
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[9.5px] text-[#8a98a2]">
            <ShieldCheck size={11} strokeWidth={1.8} aria-hidden="true" />
            This is a hackathon demonstration environment · no real patient data.
          </p>
        </div>
      </div>
    </div>
  );
}

function StaffDashboard() {
  const {
    staff,
    language,
    queue,
    departments,
    criticalAlerts,
    notifications,
    getDepartment,
    getSnapshot,
    callNext,
    markEmergency,
    reportDelay,
    reassignDoctor,
    acknowledgeAlert,
    pushAlert,
    resetDemo,
    signOut,
  } = useHospital();
  const t = useTranslation(language);
  const [filter, setFilter] = useState<"all" | DepartmentId>(staff?.role === "admin" ? "all" : staff?.deptId ?? "opd");
  const [analytics, setAnalytics] = useState(false);
  const [analyticsFloor, setAnalyticsFloor] = useState(0);

  useEffect(() => {
    setFilter(staff?.role === "admin" ? "all" : staff?.deptId ?? "opd");
  }, [staff]);

  const sortedQueue = useMemo(() => {
    const filtered = queue.filter((patient) => filter === "all" || patient.deptId === filter);
    return [...filtered].sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.checkedIn.localeCompare(b.checkedIn)
    );
  }, [filter, queue]);

  const allSnapshots = departments.map((department) => getSnapshot(department.id));
  const totalWaiting = queue.length;
  const averageWait = Math.round(allSnapshots.reduce((total, snapshot) => total + snapshot.waitMinutes, 0) / allSnapshots.length);
  const criticalWaiting = queue.filter((patient) => patient.severity === "critical").length;
  const doctorsOnDuty = departments.reduce((total, department) => total + department.doctors, 0);
  const openAlerts = criticalAlerts.filter((alert) => !alert.acknowledged);
  const targetDept = filter === "all" ? staff?.deptId ?? "opd" : filter;
  const targetDepartment = getDepartment(targetDept);
  const unacknowledgedHigh = openAlerts.find((alert) => alert.deptId === targetDept);

  const startDemoAlert = () => {
    pushAlert({
      code: "CODE CARDIAC",
      summary: "Pre-registered chest pain · ambulance en route · paramedic assessment attached",
      location: "Ambulance bay · East entrance",
      eta: "7 min",
      deptId: targetDept,
    });
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <SectionLabel>{staff?.role === "admin" ? "Hospital administrator" : "Doctor dashboard"}</SectionLabel>
            <span className="h-3 w-px bg-[#cfdce5]" />
            <span className="text-[9.5px] font-medium uppercase tracking-[0.08em] text-[#7b8b96]">
              {staff?.role === "admin" ? "All departments" : getDepartment(staff?.deptId ?? "opd").name}
            </span>
          </div>
          <h1 className="mt-2 text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[30px]">
            {t("welcomeBack")}, {staff?.name}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#6d7e89]">
            <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-[#277c55]" />
            {doctorsOnDuty} clinicians on duty · Live operational view · Sat, 26 October
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => reportDelay(targetDept)}
            className="inline-flex h-[38px] items-center gap-1.5 border border-[#cddae4] bg-white px-3 text-[10.5px] font-semibold text-[#4f6472] transition-colors hover:border-[#a9c0d0] hover:bg-[#f8fbfc]"
          >
            <Clock3 size={13} strokeWidth={1.8} aria-hidden="true" />
            {t("reportDelay")}
          </button>
          <button
            type="button"
            onClick={() => {
              const called = callNext(targetDept);
              if (called) setFilter(staff?.role === "admin" ? targetDept : filter);
            }}
            className="inline-flex h-[38px] items-center gap-1.5 bg-brand px-3.5 text-[10.5px] font-semibold text-white transition-colors hover:bg-brand-deep"
          >
            <BellRing size={13} strokeWidth={1.9} aria-hidden="true" />
            {t("callNext")}
            <span className="ml-1 border-l border-white/20 pl-2 text-[9px] font-normal text-white/65">
              {targetDepartment.shortName}
            </span>
          </button>
        </div>
      </div>

      {openAlerts.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 border border-[#dcb2ac] border-l-[3px] border-l-[#a53428] bg-[#fcf1ef] px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <span aria-hidden="true" className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full bg-[#a53428] map-critical-pulse" />
            <p className="text-[11px] leading-[1.55] text-[#7d3d34]">
              <strong className="font-semibold">{openAlerts.length} critical pre-alert{openAlerts.length > 1 ? "s" : ""}</strong>{" "}
              requiring clinical acknowledgement
              {unacknowledgedHigh ? ` · ${unacknowledgedHigh.code} ETA ${unacknowledgedHigh.eta}` : ""}.
            </p>
          </div>
          <button
            type="button"
            onClick={startDemoAlert}
            className="shrink-0 self-start text-[10px] font-semibold text-[#8f3c30] underline underline-offset-2 hover:text-[#6d291f] sm:self-auto"
          >
            Simulate incoming critical code →
          </button>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
        {[
          { label: t("patientsWaiting"), value: String(totalWaiting), note: "Across all departments", icon: Users, accent: "text-[#326c92]" },
          { label: t("avgWait"), value: `${averageWait} min`, note: "Predictive, adjusted live", icon: Clock3, accent: "text-[#8b6322]" },
          { label: t("criticalCases"), value: String(criticalWaiting + openAlerts.length), note: `${openAlerts.length} unacknowledged`, icon: AlertTriangle, accent: "text-[#a53428]" },
          { label: t("rescheduled"), value: "148", note: "+9% vs. last Saturday", icon: CheckCircle2, accent: "text-[#277c55]" },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="border border-[#dbe5ec] bg-white px-4 py-3.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[9.5px] font-semibold uppercase leading-[1.4] tracking-[0.075em] text-[#7a8a95]">{metric.label}</p>
                <Icon size={14} strokeWidth={1.7} className={metric.accent} aria-hidden="true" />
              </div>
              <p className="numeric mt-2 text-[26px] font-semibold leading-none tracking-[-0.03em] text-[#1d3445]">{metric.value}</p>
              <p className="mt-1.5 text-[9.5px] text-[#8c99a2]">{metric.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col justify-between gap-3 border border-[#d8e3eb] bg-white px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-2.5">
          <Gauge size={15} strokeWidth={1.8} className="mt-[1px] shrink-0 text-link" aria-hidden="true" />
          <div>
            <p className="text-[11.5px] font-semibold text-[#334b5b]">{t("analyticsView")}</p>
            <p className="mt-0.5 text-[10px] leading-[1.45] text-[#7a8a95]">
              Overlay live department pressure on the hospital floor map and reallocate clinicians.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={analytics}
          aria-label={t("analyticsView")}
          onClick={() => setAnalytics((previous) => !previous)}
          className="flex shrink-0 items-center gap-2.5 self-start sm:self-auto"
        >
          <span className="text-[10px] font-medium text-[#5a6f7c]">{analytics ? "On" : "Off"}</span>
          <span
            className={cn(
              "relative h-[22px] w-[40px] rounded-full border transition-colors",
              analytics ? "border-brand bg-brand" : "border-[#bccbd5] bg-[#dbe5eb]"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-[2px] h-[16px] w-[16px] rounded-full bg-white shadow-sm transition-[left] duration-200",
                analytics ? "left-[21px]" : "left-[2px]"
              )}
            />
          </span>
        </button>
      </div>

      {analytics && (
        <section className="mt-4 border border-[#d8e3eb] bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-[#e4ecf1] px-4 py-3.5 sm:flex-row sm:items-center">
            <div>
              <SectionLabel>Hospital analytics · Live</SectionLabel>
              <h2 className="mt-1 text-[15px] font-semibold text-ink">{t("bottleneckMap")}</h2>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setAnalyticsFloor(level)}
                  aria-pressed={analyticsFloor === level}
                  className={cn(
                    "h-[28px] border px-2.5 text-[9.5px] font-medium transition-colors",
                    analyticsFloor === level
                      ? "border-brand bg-brand text-white"
                      : "border-[#d6e2e9] bg-white text-[#627481] hover:bg-[#f5f9fb]"
                  )}
                >
                  {level === 0 ? t("groundFloor") : `${t("level")} ${level}`}
                </button>
              ))}
            </div>
          </div>
          <div className="grid lg:grid-cols-12">
            <div className="border-b border-[#e4ecf1] p-4 lg:col-span-7 lg:border-b-0 lg:border-r">
              <HospitalMap floor={analyticsFloor} mode="heatmap" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-[9.5px] text-[#778994]">
                  <span aria-hidden="true" className="h-[6px] w-[6px] rounded-full bg-[#b53426] map-critical-pulse" />
                  Red zones exceed the 30-minute service threshold
                </p>
                <button
                  type="button"
                  onClick={startDemoAlert}
                  className="text-[9.5px] font-medium text-[#8b98a1] hover:text-brand"
                >
                  Test alert
                </button>
              </div>
            </div>
            <div className="p-4 lg:col-span-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[#617581]">
                  Department pressure
                </h3>
                <span className="text-[9px] text-[#8b99a3]">live estimate</span>
              </div>
              <ul className="mt-2.5 divide-y divide-[#edf2f5]">
                {allSnapshots.map((snapshot) => (
                  <li key={snapshot.department.id} className="py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold text-[#334b5b]">{snapshot.department.name}</p>
                        <p className="mt-0.5 text-[9px] text-[#84939d]">
                          {snapshot.queued.length} waiting · {snapshot.department.doctors} doctors · ~{snapshot.waitMinutes} min
                        </p>
                      </div>
                      <StatusDot status={snapshot.status} className="shrink-0 text-[9px] font-medium" />
                    </div>
                    {snapshot.status !== "normal" && (
                      <button
                        type="button"
                        onClick={() => reassignDoctor(snapshot.department.id)}
                        className="mt-1.5 inline-flex items-center gap-1 border border-[#d2e0e9] bg-[#f9fbfc] px-2 py-1 text-[8.5px] font-semibold text-link transition-colors hover:bg-brand-light"
                      >
                        <Plus size={9} strokeWidth={2.4} aria-hidden="true" />
                        {t("reallocate")}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <section className="border border-[#dbe5ec] bg-white lg:col-span-8">
          <div className="flex flex-col justify-between gap-3 border-b border-[#e4ecf1] px-4 py-3.5 sm:flex-row sm:items-center">
            <div>
              <SectionLabel>Queue operations</SectionLabel>
              <h2 className="mt-1 text-[15px] font-semibold text-ink">{t("patientQueue")}</h2>
            </div>
            <div className="relative">
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as "all" | DepartmentId)}
                aria-label="Filter patient queue by department"
                className="h-[32px] min-w-[145px] appearance-none border border-[#d2dfe8] bg-[#fbfcfd] pl-2.5 pr-8 text-[10.5px] font-medium text-[#4a5f6d] outline-none focus:border-[#7fa6bf]"
              >
                <option value="all">{t("all")} departments</option>
                {allDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} strokeWidth={1.8} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#738590]" aria-hidden="true" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[670px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e5ecf1] bg-[#fbfcfd] text-[8.5px] font-semibold uppercase tracking-[0.08em] text-[#7c8b95]">
                  <th scope="col" className="px-4 py-2.5">Token</th>
                  <th scope="col" className="px-3 py-2.5">Patient</th>
                  <th scope="col" className="px-3 py-2.5">Department</th>
                  <th scope="col" className="px-3 py-2.5">Arrival</th>
                  <th scope="col" className="px-3 py-2.5">Priority</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedQueue.slice(0, 10).map((patient) => {
                  const department = getDepartment(patient.deptId);
                  const snapshot = getSnapshot(patient.deptId);
                  return (
                    <tr
                      key={patient.token}
                      className={cn(
                        "border-b border-[#edf2f5] text-[10.5px] transition-colors last:border-b-0 hover:bg-[#fafcfd]",
                        patient.severity === "critical" && "bg-[#fdf8f7]"
                      )}
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="numeric flex items-center gap-1.5 font-semibold text-[#2d4657]">
                          {patient.severity === "critical" && (
                            <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-[#b53426] map-critical-pulse" />
                          )}
                          {patient.token}
                        </span>
                        {patient.isPortalUser && <span className="mt-1 block text-[8px] uppercase tracking-[0.05em] text-link">Portal</span>}
                      </td>
                      <td className="px-3 py-3">
                        <span className="block font-medium text-[#354c5b]">{patient.name}</span>
                        <span className="mt-0.5 block text-[9px] text-[#8997a1]">
                          {patient.age} yrs · {patient.source}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="block text-[#4d6271]">{department.shortName}</span>
                        <span className="mt-0.5 block text-[9px] text-[#8a99a2]">
                          Rm {department.room} · ~{snapshot.waitMinutes} min
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[#657783]">{patient.checkedIn}</td>
                      <td className="px-3 py-3">
                        <SeverityBadge severity={patient.severity} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {patient.severity !== "critical" && (
                            <button
                              type="button"
                              onClick={() => markEmergency(patient.token)}
                              title={`Mark ${patient.name} as emergency priority`}
                              className="inline-flex h-[26px] items-center gap-1 border border-[#dfc8c2] bg-white px-2 text-[8.5px] font-semibold text-[#99443a] transition-colors hover:bg-[#fcf1ef]"
                            >
                              <AlertTriangle size={9} strokeWidth={2} aria-hidden="true" />
                              Priority
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => callNext(patient.deptId, patient.token)}
                            title={`Call ${patient.token}`}
                            className="inline-flex h-[26px] items-center gap-1 bg-brand px-2 text-[8.5px] font-semibold text-white transition-colors hover:bg-brand-deep"
                          >
                            Call
                            <ArrowRight size={9} strokeWidth={2.2} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sortedQueue.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[11px] text-[#7d8b95]">
                      <CheckCircle2 size={20} strokeWidth={1.6} className="mx-auto text-[#277c55]" aria-hidden="true" />
                      <span className="mt-2 block font-medium text-[#4c615f]">{t("queueClear")}</span>
                      <span className="mt-0.5 block text-[10px]">No patients are currently waiting in this view.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e5ecf1] bg-[#fbfcfd] px-4 py-2.5">
            <p className="text-[9.5px] text-[#86949e]">
              Sorted by clinical priority, then arrival time · {sortedQueue.length} shown
            </p>
            <p className="flex items-center gap-1.5 text-[9.5px] text-[#607580]">
              <Clock3 size={10} strokeWidth={1.8} aria-hidden="true" />
              {targetDepartment.name}: {getSnapshot(targetDepartment.id).delay > 0 ? `${getSnapshot(targetDepartment.id).delay} min reported delay` : "no reported delay"}
            </p>
          </div>
        </section>

        <aside className="space-y-5 lg:col-span-4">
          <section className="border border-[#dbe5ec] bg-white">
            <div className="flex items-center justify-between border-b border-[#e4ecf1] px-4 py-3.5">
              <div className="flex items-center gap-2">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.09em] text-[#536876]">{t("criticalAlerts")}</h2>
                {openAlerts.length > 0 && (
                  <span className="rounded-full bg-[#a53428] px-1.5 py-[1px] text-[8.5px] font-bold text-white">{openAlerts.length}</span>
                )}
              </div>
              <AlertTriangle size={15} strokeWidth={1.8} className="text-[#a53428]" aria-hidden="true" />
            </div>
            {criticalAlerts.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <CheckCircle2 size={18} strokeWidth={1.6} className="mx-auto text-[#277c55]" aria-hidden="true" />
                <p className="mt-1.5 text-[10.5px] text-[#758792]">No critical alerts. All incoming cases acknowledged.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[#edf2f5]">
                {criticalAlerts.slice(0, 4).map((alert) => (
                  <li
                    key={alert.id}
                    className={cn("px-4 py-3", alert.acknowledged ? "bg-white" : "border-l-2 border-l-[#b53426] bg-[#fdf8f7]")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#a53428]">
                        {!alert.acknowledged && <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-[#b53426] map-critical-pulse" />}
                        {alert.code}
                      </p>
                      <span className="whitespace-nowrap text-[9px] text-[#8c99a2]">ETA {alert.eta}</span>
                    </div>
                    <p className="mt-1 text-[10.5px] leading-[1.5] text-[#516570]">{alert.summary}</p>
                    <p className="mt-1 flex items-center gap-1 text-[9px] text-[#8a98a2]">
                      <MapPinned size={10} strokeWidth={1.8} aria-hidden="true" />
                      {alert.location} · {getDepartment(alert.deptId).name}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[8.5px] text-[#9aa5ad]">Received {alert.received}</span>
                      {alert.acknowledged ? (
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-medium text-[#277c55]">
                          <CheckCircle2 size={10} strokeWidth={2} aria-hidden="true" />
                          {t("acknowledged")}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="border border-[#d7b1ab] bg-white px-2 py-1 text-[8.5px] font-semibold text-[#8f3c32] transition-colors hover:bg-[#fcf1ef]"
                        >
                          {t("acknowledge")}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-[#e5ecf1] px-4 py-2.5">
              <button
                type="button"
                onClick={startDemoAlert}
                className="flex items-center gap-1.5 text-[9px] font-medium text-[#82919b] transition-colors hover:text-brand"
              >
                <Plus size={10} strokeWidth={2} aria-hidden="true" />
                Simulate incoming priority code
              </button>
            </div>
          </section>

          <section className="border border-[#dbe5ec] bg-white">
            <div className="flex items-center justify-between border-b border-[#e4ecf1] px-4 py-3.5">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.09em] text-[#536876]">{t("tokenHistory")}</h2>
              <BellRing size={14} strokeWidth={1.7} className="text-link" aria-hidden="true" />
            </div>
            <ul className="divide-y divide-[#edf2f5]">
              {notifications.slice(0, 5).map((notification) => (
                <li key={notification.id} className="flex items-start gap-2.5 px-4 py-2.5">
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      notification.kind === "emergency"
                        ? "bg-[#fbeeec] text-[#a53428]"
                        : notification.kind === "sms"
                          ? "bg-[#eef7f2] text-[#277c55]"
                          : "bg-brand-light text-brand"
                    )}
                  >
                    <NotificationIcon kind={notification.kind} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold leading-[1.35] text-[#3a5160]">{notification.title}</p>
                    <p className="mt-0.5 text-[9px] leading-[1.45] text-[#84929c]">{notification.message}</p>
                  </div>
                  <span className="whitespace-nowrap text-[8px] text-[#9ba6ae]">{notification.time}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-[#cfe0e9] bg-brand-light p-4">
            <div className="flex items-center gap-2">
              <Stethoscope size={14} strokeWidth={1.8} className="text-link" aria-hidden="true" />
              <h2 className="text-[11.5px] font-semibold text-[#334f5f]">Staff reallocation</h2>
            </div>
            <p className="mt-1.5 text-[10px] leading-[1.6] text-[#5f7581]">
              {allSnapshots.filter((snapshot) => snapshot.status === "critical").length > 0
                ? "Overloaded areas detected. Reassign a clinician from the analytics view to reduce predicted waits."
                : "All departments are within their normal service threshold. No reallocation needed."}
            </p>
            <button
              type="button"
              onClick={() => setAnalytics(true)}
              className="mt-2 inline-flex items-center gap-1 text-[9.5px] font-semibold text-link hover:underline"
            >
              Open bottleneck map
              <ArrowRight size={10} strokeWidth={2} aria-hidden="true" />
            </button>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 border border-[#e0e7ec] bg-white px-3 py-2.5">
            <button
              type="button"
              onClick={resetDemo}
              className="inline-flex items-center gap-1.5 text-[9px] font-medium text-[#85939c] transition-colors hover:text-brand"
            >
              <RotateCcw size={10} strokeWidth={1.9} aria-hidden="true" />
              Reset demo data
            </button>
            <button
              type="button"
              onClick={signOut}
              className="text-[9px] font-medium text-[#85939c] transition-colors hover:text-brand"
            >
              Sign out
            </button>
          </div>
        </aside>
      </div>

      <div className="mt-4 flex flex-col items-start justify-between gap-2 border border-[#dbe5ec] bg-white px-4 py-3 sm:flex-row sm:items-center">
        <p className="flex items-start gap-1.5 text-[9.5px] leading-[1.55] text-[#7e8d97]">
          <Activity size={12} strokeWidth={1.8} className="mt-[1px] shrink-0 text-link" aria-hidden="true" />
          Predictive waits recalculate from clinician velocity, queue composition and reported delays. Emergency cases
          are always prioritised.
        </p>
        <p className="flex shrink-0 items-center gap-1.5 text-[9.5px] text-[#8d99a2]">
          <CalendarClock size={11} strokeWidth={1.8} aria-hidden="true" />
          Refreshed just now
        </p>
      </div>
    </div>
  );
}
