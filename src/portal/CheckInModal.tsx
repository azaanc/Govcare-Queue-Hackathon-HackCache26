import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";
import { useHospital, type DepartmentId, type Language } from "./store";
import { useTranslation, languages } from "./i18n";
import { ordinal, SectionLabel } from "./PortalUI";
import { cn } from "../utils/cn";

type FormState = {
  deptId: DepartmentId;
  appointmentCode: string;
  symptoms: string;
  name: string;
  age: string;
  phone: string;
  emergency: boolean;
  insuranceProvider: string;
  policyNumber: string;
  language: Language;
  consent: boolean;
};

const initialForm: FormState = {
  deptId: "opd",
  appointmentCode: "",
  symptoms: "",
  name: "",
  age: "",
  phone: "",
  emergency: false,
  insuranceProvider: "",
  policyNumber: "",
  language: "en",
  consent: false,
};

type CheckInModalProps = {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export function CheckInModal({ open, onClose, onComplete }: CheckInModalProps) {
  const { departments, generateToken, getSnapshot, profile, language, setLanguage } = useHospital();
  const t = useTranslation(language);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({ ...initialForm, language });
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState<{ token: string; deptId: DepartmentId } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const generatedSnapshot = useMemo(
    () => (generated ? getSnapshot(generated.deptId) : null),
    [generated, getSnapshot]
  );

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAndReset();
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const update = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError("");
  };

  const closeAndReset = () => {
    setStep(1);
    setForm({ ...initialForm, language });
    setError("");
    setGenerated(null);
    onClose();
  };

  const fillDemo = () => {
    setForm((previous) => ({
      ...previous,
      name: profile.name,
      age: String(profile.age),
      phone: profile.phone,
      insuranceProvider: profile.insuranceProvider,
      policyNumber: profile.policyNumber,
      appointmentCode: "OPD-0900-42",
      symptoms: "Persistent fatigue and occasional dizziness for the past week.",
    }));
    setError("");
  };

  const next = () => {
    if (step === 2) {
      if (form.name.trim().length < 2) {
        setError("Please enter your full name.");
        return;
      }
      if (!form.age || Number(form.age) < 0 || Number(form.age) > 120) {
        setError("Please enter a valid age.");
        return;
      }
      if (form.phone.trim().length < 7) {
        setError("Please enter a mobile number so we can send queue alerts.");
        return;
      }
    }
    if (step === 3) {
      if (!form.consent) {
        setError("Please confirm your details and consent to continue.");
        return;
      }
      const token = generateToken({
        name: form.name.trim(),
        age: Number(form.age),
        phone: form.phone.trim(),
        deptId: form.deptId,
        symptoms: form.symptoms.trim(),
        emergency: form.emergency,
        severity: form.emergency ? "critical" : "routine",
        insuranceProvider: form.insuranceProvider.trim() || "Not provided",
        policyNumber: form.policyNumber.trim() || "Not provided",
        appointmentCode: form.appointmentCode.trim(),
      });
      setGenerated({ token: token.token, deptId: token.deptId });
      return;
    }
    setStep((previous) => Math.min(4, previous + 1));
    setError("");
  };

  const stepLabels = [
    t("chooseDepartment"),
    t("personalDetails"),
    t("insuranceDetails"),
  ];

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close check-in"
        onClick={closeAndReset}
        className="absolute inset-0 cursor-default bg-[#031728]/70"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkin-title"
        className="relative z-10 flex max-h-[94dvh] w-full max-w-[760px] flex-col overflow-hidden bg-white shadow-[0_30px_90px_-20px_rgba(2,19,34,0.7)] sm:max-h-[calc(100dvh-2rem)]"
      >
        <div className="h-[3px] w-full shrink-0 bg-brand" />
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e1e9ef] px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-link">
              <ClipboardCheck size={13} strokeWidth={1.9} aria-hidden="true" />
              GovCare Queue · Patient portal
            </p>
            <h2
              id="checkin-title"
              className="mt-1.5 text-[20px] font-semibold leading-[1.2] tracking-[-0.025em] text-ink sm:text-[23px]"
            >
              {generated ? t("checkInSuccess") : t("checkInTitle")}
            </h2>
            <p className="mt-1 text-[11.5px] leading-[1.5] text-[#6b7a85]">
              {generated ? t("newToken") : t("checkInSubtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={closeAndReset}
            aria-label={t("cancel")}
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-[#667581] transition-colors hover:bg-[#f2f6f9] hover:text-brand"
          >
            <X size={18} strokeWidth={1.7} />
          </button>
        </div>

        {!generated && (
          <div className="shrink-0 border-b border-[#e7edf1] bg-[#fbfcfd] px-5 py-3 sm:px-7">
            <ol className="flex items-center gap-1.5 sm:gap-2" aria-label="Check-in progress">
              {stepLabels.map((label, index) => {
                const number = index + 1;
                const active = step === number;
                const complete = step > number;
                return (
                  <li key={label} className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                    <span
                      className={cn(
                        "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border text-[9.5px] font-semibold",
                        complete
                          ? "border-[#277c55] bg-[#277c55] text-white"
                          : active
                            ? "border-brand bg-brand text-white"
                            : "border-[#ccd9e2] bg-white text-[#7b8a95]"
                      )}
                    >
                      {complete ? <Check size={11} strokeWidth={2.5} /> : number}
                    </span>
                    <span
                      className={cn(
                        "hidden truncate text-[10.5px] font-medium sm:block",
                        active ? "text-[#213848]" : complete ? "text-[#426354]" : "text-[#85939d]"
                      )}
                    >
                      {label}
                    </span>
                    {index < stepLabels.length - 1 && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mx-1 hidden h-px flex-1 sm:block",
                          step > number ? "bg-[#9bc4ae]" : "bg-[#dbe5ec]"
                        )}
                      />
                    )}
                  </li>
                );
              })}
              <li className="ml-auto hidden shrink-0 text-[10px] tabular-nums text-[#87949e] sm:block">
                {t("step")} {step} {t("of")} 3
              </li>
            </ol>
          </div>
        )}

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {generated && generatedSnapshot ? (
            <div>
              <div className="border border-[#d5e2eb] bg-[#f6fafc] px-5 py-5 text-center sm:px-8">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf6ef] text-[#277c55]">
                  <CheckCircle2 size={21} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6a7e8c]">
                  {t("token")}
                </p>
                <p className="numeric mt-1.5 text-[44px] font-semibold leading-none tracking-[-0.04em] text-brand-deep">
                  {generated.token}
                </p>
                <p className="mt-2 text-[12.5px] text-[#4e6271]">
                  {generatedSnapshot.department.name} · Room {generatedSnapshot.department.room} ·{" "}
                  {t("level")} {generatedSnapshot.department.floor}
                </p>
                <div className="mx-auto mt-5 grid max-w-[430px] grid-cols-3 divide-x divide-[#d9e4eb] border-y border-[#d9e4eb] py-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.09em] text-[#7d8c97]">{t("nowServing")}</p>
                    <p className="numeric mt-1 text-[15px] font-semibold text-[#273d4d]">
                      {generatedSnapshot.nowServing}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.09em] text-[#7d8c97]">{t("yourPosition")}</p>
                    <p className="numeric mt-1 text-[15px] font-semibold text-[#273d4d]">
                      {ordinal(generatedSnapshot.position)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.09em] text-[#7d8c97]">{t("estimatedWait")}</p>
                    <p className="numeric mt-1 text-[15px] font-semibold text-[#273d4d]">
                      {generatedSnapshot.waitMinutes} {t("minutes")}
                    </p>
                  </div>
                </div>
                {form.emergency && (
                  <p className="mx-auto mt-4 flex max-w-[430px] items-start gap-2 border border-[#e6beb8] bg-[#fcf0ee] px-3 py-2 text-left text-[11px] leading-[1.5] text-[#94372c]">
                    <CircleAlert size={14} strokeWidth={1.9} className="mt-[1px] shrink-0" aria-hidden="true" />
                    Your case has been pre-registered as a priority. The clinical team has been alerted and will
                    review you on arrival.
                  </p>
                )}
              </div>
              <p className="mt-4 text-center text-[10.5px] leading-[1.6] text-[#7b8994]">
                A confirmation SMS has been sent to {form.phone}. You can track your live position from the My visit
                dashboard.
              </p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <SectionLabel>{t("step")} 1 · Department</SectionLabel>
                      <h3 className="mt-1 text-[16px] font-semibold text-ink">{t("chooseDepartment")}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={fillDemo}
                      className="shrink-0 border border-[#d4e0e9] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-link transition-colors hover:bg-brand-light"
                    >
                      Load demo details
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Department">
                    {departments.map((department) => {
                      const selected = form.deptId === department.id;
                      return (
                        <button
                          key={department.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => update("deptId", department.id)}
                          className={cn(
                            "border px-3 py-3 text-left transition-colors",
                            selected
                              ? "border-brand bg-brand-light ring-1 ring-brand"
                              : "border-[#dbe5ec] bg-white hover:border-[#9bb8cc]"
                          )}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <Stethoscope
                              size={14}
                              strokeWidth={1.7}
                              className={selected ? "text-brand" : "text-[#7e8e99]"}
                              aria-hidden="true"
                            />
                            {selected && <Check size={13} strokeWidth={2.4} className="text-brand" aria-hidden="true" />}
                          </span>
                          <span className="mt-2 block text-[12px] font-semibold text-[#293e4d]">{department.name}</span>
                          <span className="mt-1 block text-[9.5px] text-[#72828d]">
                            {department.room} · {t("level")} {department.floor}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[11px] font-semibold text-[#354b5b]">{t("appointmentCode")}</span>
                      <input
                        ref={firstFieldRef}
                        type="text"
                        value={form.appointmentCode}
                        onChange={(event) => update("appointmentCode", event.target.value)}
                        placeholder="e.g. OPD-0900-42"
                        className="mt-1.5 h-[40px] w-full border border-[#cfdbe4] bg-white px-3 text-[12px] text-ink outline-none placeholder:text-[#97a4ad] focus:border-[#6f9bb8]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-semibold text-[#354b5b]">{t("language")}</span>
                      <select
                        value={form.language}
                        onChange={(event) => {
                          update("language", event.target.value as Language);
                          setLanguage(event.target.value as Language);
                        }}
                        className="mt-1.5 h-[40px] w-full border border-[#cfdbe4] bg-white px-3 text-[12px] text-ink outline-none focus:border-[#6f9bb8]"
                      >
                        {languages.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="mt-3.5 block">
                    <span className="text-[11px] font-semibold text-[#354b5b]">{t("symptoms")}</span>
                    <textarea
                      value={form.symptoms}
                      onChange={(event) => update("symptoms", event.target.value)}
                      rows={3}
                      placeholder="Briefly describe your symptoms or the reason for your visit"
                      className="mt-1.5 w-full resize-none border border-[#cfdbe4] bg-white px-3 py-2.5 text-[12px] leading-[1.6] text-ink outline-none placeholder:text-[#97a4ad] focus:border-[#6f9bb8]"
                    />
                  </label>
                  <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-[1.55] text-[#7a8994]">
                    <ShieldCheck size={12} strokeWidth={1.8} className="mt-[1px] shrink-0" aria-hidden="true" />
                    Symptom information helps our triage algorithm predict a more accurate wait. It is visible only
                    to your clinical team.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div>
                  <SectionLabel>{t("step")} 2 · Patient</SectionLabel>
                  <h3 className="mt-1 text-[16px] font-semibold text-ink">{t("personalDetails")}</h3>
                  <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="text-[11px] font-semibold text-[#354b5b]">{t("fullName")} *</span>
                      <input
                        ref={firstFieldRef}
                        type="text"
                        value={form.name}
                        onChange={(event) => update("name", event.target.value)}
                        placeholder="Full name as on your identity document"
                        className="mt-1.5 h-[42px] w-full border border-[#cfdbe4] bg-white px-3 text-[12.5px] text-ink outline-none placeholder:text-[#97a4ad] focus:border-[#6f9bb8]"
                        autoComplete="name"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-semibold text-[#354b5b]">{t("age")} *</span>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={form.age}
                        onChange={(event) => update("age", event.target.value)}
                        className="mt-1.5 h-[42px] w-full border border-[#cfdbe4] bg-white px-3 text-[12.5px] text-ink outline-none focus:border-[#6f9bb8]"
                        autoComplete="off"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-semibold text-[#354b5b]">{t("phone")} *</span>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(event) => update("phone", event.target.value)}
                        placeholder="For SMS queue alerts"
                        className="mt-1.5 h-[42px] w-full border border-[#cfdbe4] bg-white px-3 text-[12.5px] text-ink outline-none placeholder:text-[#97a4ad] focus:border-[#6f9bb8]"
                        autoComplete="tel"
                      />
                    </label>
                  </div>

                  <div
                    className={cn(
                      "mt-4 border p-3.5 transition-colors",
                      form.emergency ? "border-[#d9a59e] bg-[#fdf4f2]" : "border-[#dbe5ec] bg-[#fbfcfd]"
                    )}
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={form.emergency}
                        onChange={(event) => update("emergency", event.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#a53428]"
                      />
                      <span>
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#3e2c2a]">
                          <CircleAlert size={13} strokeWidth={1.9} aria-hidden="true" className="text-[#a53428]" />
                          {t("emergencyFlag")}
                        </span>
                        <span className="mt-1 block text-[10.5px] leading-[1.55] text-[#7d625e]">
                          {t("emergencyHelp")}
                        </span>
                      </span>
                    </label>
                    {form.emergency && (
                      <div className="mt-3 flex items-center gap-2 border-t border-[#e7c7c2] pt-2.5 text-[10px] font-medium text-[#8f3b30]">
                        <span aria-hidden="true" className="h-[6px] w-[6px] rounded-full bg-[#a53428] map-critical-pulse" />
                        This will create an immediate priority alert on the clinical team&apos;s dashboard.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <SectionLabel>{t("step")} 3 · Insurance</SectionLabel>
                  <h3 className="mt-1 text-[16px] font-semibold text-ink">{t("insuranceDetails")}</h3>
                  <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[11px] font-semibold text-[#354b5b]">{t("insuranceProvider")}</span>
                      <input
                        type="text"
                        value={form.insuranceProvider}
                        onChange={(event) => update("insuranceProvider", event.target.value)}
                        placeholder="e.g. National Health Scheme"
                        className="mt-1.5 h-[42px] w-full border border-[#cfdbe4] bg-white px-3 text-[12.5px] text-ink outline-none placeholder:text-[#97a4ad] focus:border-[#6f9bb8]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-semibold text-[#354b5b]">{t("policyNumber")}</span>
                      <input
                        type="text"
                        value={form.policyNumber}
                        onChange={(event) => update("policyNumber", event.target.value)}
                        placeholder="Policy or member number"
                        className="mt-1.5 h-[42px] w-full border border-[#cfdbe4] bg-white px-3 text-[12.5px] text-ink outline-none placeholder:text-[#97a4ad] focus:border-[#6f9bb8]"
                      />
                    </label>
                  </div>

                  <div className="mt-4 border border-[#dbe5ec] bg-[#f8fbfc] px-4 py-3.5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#788792]">
                      {t("review")}
                    </p>
                    <dl className="mt-2.5 grid gap-x-5 gap-y-2 text-[11.5px] sm:grid-cols-2">
                      <div className="flex justify-between gap-3 sm:block">
                        <dt className="text-[#7a8892]">{t("department")}</dt>
                        <dd className="font-medium text-[#2f4554]">
                          {departments.find((item) => item.id === form.deptId)?.name}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3 sm:block">
                        <dt className="text-[#7a8892]">Patient</dt>
                        <dd className="font-medium text-[#2f4554]">
                          {form.name || "Not entered"}
                          {form.age ? `, ${form.age}` : ""}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3 sm:block">
                        <dt className="text-[#7a8892]">Appointment</dt>
                        <dd className="font-medium text-[#2f4554]">
                          {form.appointmentCode || "Walk-in"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3 sm:block">
                        <dt className="text-[#7a8892]">Priority</dt>
                        <dd className={cn("font-medium", form.emergency ? "text-[#a53428]" : "text-[#2f4554]")}>
                          {form.emergency ? "Emergency review" : "Routine"}
                        </dd>
                      </div>
                    </dl>
                    {form.symptoms && (
                      <p className="mt-2.5 border-t border-[#e2eaef] pt-2.5 text-[11px] leading-[1.55] text-[#596c79]">
                        <span className="font-medium text-[#3b5160]">Symptoms:</span> {form.symptoms}
                      </p>
                    )}
                  </div>

                  <label className="mt-4 flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(event) => update("consent", event.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#0b3f6b]"
                    />
                    <span className="text-[10.5px] leading-[1.6] text-[#5e707c]">{t("consent")}</span>
                  </label>
                </div>
              )}
            </>
          )}

          {error && (
            <p role="alert" className="mt-3 flex items-start gap-1.5 text-[11px] font-medium text-[#a53428]">
              <CircleAlert size={13} strokeWidth={2} className="mt-[1px] shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#e1e9ef] bg-[#fbfcfd] px-5 py-3.5 sm:px-7">
          {generated ? (
            <>
              <button
                type="button"
                onClick={closeAndReset}
                className="text-[11.5px] font-medium text-[#6b7b87] transition-colors hover:text-brand"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  closeAndReset();
                  onComplete();
                }}
                className="inline-flex h-[40px] items-center gap-2 bg-brand px-4 text-[11.5px] font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                {t("goToVisit")}
                <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  if (step === 1) closeAndReset();
                  else setStep((previous) => previous - 1);
                  setError("");
                }}
                className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#61727e] transition-colors hover:text-brand"
              >
                <ArrowLeft size={14} strokeWidth={1.8} aria-hidden="true" />
                {step === 1 ? t("cancel") : t("back")}
              </button>
              <div className="flex items-center gap-3">
                {step === 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm((previous) => ({
                        ...previous,
                        name: profile.name,
                        age: String(profile.age),
                        phone: profile.phone,
                        insuranceProvider: profile.insuranceProvider,
                        policyNumber: profile.policyNumber,
                        symptoms: "Persistent fatigue and occasional dizziness.",
                        consent: true,
                      }));
                      setError("");
                      setStep(2);
                    }}
                    className="hidden text-[10.5px] font-medium text-[#7a8994] hover:text-brand sm:block"
                  >
                    Use saved profile
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex h-[40px] items-center gap-2 bg-brand px-4 text-[11.5px] font-semibold text-white transition-colors hover:bg-brand-deep"
                >
                  {step === 3 ? t("generateToken") : t("next")}
                  <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
