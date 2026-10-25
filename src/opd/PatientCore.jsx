import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  Bone,
  Check,
  ChevronRight,
  ClipboardCheck,
  Download,
  Ear,
  Eye,
  FileText,
  HeartPulse,
  HelpCircle,
  MapPin,
  Mic,
  Phone,
  Printer,
  ScanLine,
  Settings as SettingsIcon,
  Siren,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
  Volume2,
} from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { useOpd } from "./OpdProvider.jsx";
import {
  BigAction,
  InfoNote,
  ListenButton,
  OpdPage,
  SectionTitle,
  SettingsScreen,
  navigate,
  useSpeech,
} from "./OpdUI.jsx";
import { departmentById, departmentDoctor, departmentName, departmentPlain, departmentRoom } from "../data/departments.js";
import { floorLabel, placeById } from "../data/hospital.js";

const departmentIcons = {
  med: Stethoscope,
  child: Baby,
  women: HeartPulse,
  bones: Bone,
  ent: Ear,
  eyes: Eye,
  skin: Sparkles,
};

const genderOptions = [
  ["female", "genderFemale"],
  ["male", "genderMale"],
  ["other", "genderOther"],
];

function getRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function PatientHome() {
  const { t, language, settings, activeQueueInfo, setSettings } = useOpd();
  const { speak } = useSpeech();
  useEffect(() => {
    if (settings.readAloud && settings.languageChosen) {
      speak(`${t("appName")}. ${t("homeRegister")}. ${t("homeSlip")}. ${t("homeFind")}. ${t("emergency")}.`);
    }
    // Announce the home screen once when read-aloud is on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.readAloud, settings.languageChosen, language]);
  return (
    <div className="opd-app min-h-screen bg-white">
      <header className="bg-brand-deep text-white">
        <div className="container-page flex min-h-[36px] items-center justify-between gap-3 py-1 text-[11px] text-white/70">
          <span className="font-semibold text-white">OPD Saathi</span>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1.5">
              <span className="sr-only">{t("language")}</span>
              <select
                value={settings.language}
                onChange={(event) => setSettings({ language: event.target.value })}
                aria-label={t("language")}
                className="cursor-pointer bg-transparent text-[11px] font-semibold text-white outline-none"
              >
                <option value="en" className="text-ink">English</option>
                <option value="hi" className="text-ink">हिंदी</option>
              </select>
            </label>
            <button type="button" onClick={() => navigate("#/opd/settings")} className="inline-flex items-center gap-1.5 hover:text-white">
              <SettingsIcon size={11} strokeWidth={1.8} aria-hidden="true" />
              {t("settings")}
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-rule bg-white">
        <div className="container-page flex h-[72px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-link">OPD Saathi</p>
            <p className="mt-0.5 truncate text-[15px] font-semibold tracking-[-0.02em] text-brand-deep">{t("hospitalName")}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("#/opd/emergency")}
            className="inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-full border border-[#dcb1aa] bg-[#fdf3f1] px-3.5 text-[13px] font-semibold text-[#963b31] hover:bg-[#fbe7e4] sm:px-4"
          >
            <Siren size={16} strokeWidth={2} aria-hidden="true" />
            {t("emergency")}
          </button>
        </div>
      </div>

      <main className="container-page pb-12 pt-7 sm:pt-9">
        <div className="mx-auto max-w-[840px]">
          <span aria-hidden="true" className="mb-4 block h-px w-9 bg-[#a5c0d4]" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-link">{t("appTagline")}</p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="mt-2 max-w-[640px] text-[31px] font-semibold leading-[1.12] tracking-[-0.035em] text-ink sm:text-[38px]">
              {t("appName")}
            </h1>
            <div className="mt-2">
              <ListenButton text={`${t("appName")}. ${t("appTagline")}. ${t("homeOpdHours")}. ${t("homeRegister")}. ${t("homeSlip")}. ${t("homeFind")}. ${t("emergency")}`} />
            </div>
          </div>
          <p className="mt-2.5 max-w-[560px] text-[15px] leading-[1.7] text-copy">{t("homeOpdHours")} · {t("demoPatientHelp")}</p>

          {activeQueueInfo && (
            <button
              type="button"
              onClick={() => navigate("#/opd/turn")}
              className="mt-4 flex w-full items-center justify-between gap-3 border border-[#c9deea] bg-brand-light px-4 py-3 text-left hover:bg-[#e4f0f7]"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand">
                  <ClipboardCheck size={16} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-link">{t("turnTitle")}</span>
                  <span className="mt-0.5 block text-[13px] font-semibold text-[#2d4656]">
                    {activeQueueInfo.token} · {departmentName(departmentById(activeQueueInfo.deptId), language)}
                  </span>
                </span>
              </span>
              <ArrowRight size={17} strokeWidth={1.9} className="shrink-0 text-brand" aria-hidden="true" />
            </button>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <BigAction
              icon={ClipboardCheck}
              title={t("homeRegister")}
              subtitle={t("homeRegisterSub")}
              tone="primary"
              onClick={() => navigate("#/opd/register")}
            />
            <BigAction
              icon={FileText}
              title={t("homeSlip")}
              subtitle={t("homeSlipSub")}
              onClick={() => navigate("#/opd/slip-lookup")}
            />
            <BigAction
              icon={MapPin}
              title={t("homeFind")}
              subtitle={t("homeFindSub")}
              onClick={() => navigate("#/opd/find")}
            />
            <BigAction
              icon={Siren}
              title={t("homeEmergency")}
              subtitle={t("homeEmergencySub")}
              tone="emergency"
              onClick={() => navigate("#/opd/emergency")}
            />
          </div>

          <div className="mt-5 grid gap-3">
            <InfoNote>{t("opdExplain")} {t("tokenExplain")}</InfoNote>
            <InfoNote tone="access">{t("homeWalkingHelp")}</InfoNote>
            <InfoNote tone="warn">{t("priorityNoDecision")}</InfoNote>
          </div>

          <div className="mt-7 border-t border-rule pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d8c97]">{t("homeToday")}</p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-medium text-[#536976]">
              <button type="button" onClick={() => navigate("#/opd/staff")} className="hover:text-brand hover:underline">{t("homeStaffLink")}</button>
              <button type="button" onClick={() => navigate("#/board")} className="hover:text-brand hover:underline">{t("homeBoardLink")}</button>
              <button type="button" onClick={() => navigate("#/opd/counter")} className="hover:text-brand hover:underline">{t("homeCounterLink")}</button>
            </div>
          </div>
          <p className="mt-5 text-[11px] leading-[1.6] text-[#86949e]">{t("demoNotice")}</p>
        </div>
      </main>
      <footer className="border-t border-rule bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-4 text-[11px] text-[#7e8c96]">
          <span>OPD Saathi · {t("hospitalName")}</span>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate("#/")} className="hover:text-brand hover:underline">{t("hospitalWebsite")}</button>
            <span className="inline-flex items-center gap-1.5"><Phone size={11} strokeWidth={1.9} aria-hidden="true" /> 112 · 108</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const DRAFT_KEY = "opd-saathi-draft";

function loadRegistrationDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft || typeof draft.form !== "object") return null;
    return {
      step: Math.min(5, Math.max(1, Number(draft.step) || 1)),
      form: {
        firstName: String(draft.form.firstName ?? "").slice(0, 80),
        age: String(draft.form.age ?? "").slice(0, 3),
        gender: ["female", "male", "other"].includes(draft.form.gender) ? draft.form.gender : "",
        mobile: String(draft.form.mobile ?? "").slice(0, 20),
        deptId: String(draft.form.deptId ?? ""),
      },
    };
  } catch {
    return null;
  }
}

function clearRegistrationDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignore storage restrictions.
  }
}

export function RegisterScreen() {
  const {
    t,
    language,
    settings,
    setSettings,
    departments,
    registerPatient,
  } = useOpd();
  const { speak } = useSpeech();
  const draft = useMemo(() => loadRegistrationDraft(), []);
  const [step, setStep] = useState(draft?.step ?? 1);
  const [form, setForm] = useState(draft?.form ?? {
    firstName: "",
    age: "",
    gender: "",
    mobile: "",
    deptId: "",
  });
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const micSupported = Boolean(getRecognition());
  const totalSteps = 5;
  const fieldLabels = [t("qName"), t("qAge"), t("qGender"), t("qMobile"), t("qDoctor")];

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, form }));
    } catch {
      // The flow still works when storage is unavailable.
    }
  }, [step, form]);

  useEffect(() => {
    if (settings.readAloud) speak(fieldLabels[step - 1]);
    // Never let a recording from the previous question fill the next answer.
    if (listeningRef.current) {
      listeningRef.current = false;
      const active = recognitionRef.current;
      recognitionRef.current = null;
      setListening(false);
      try {
        active?.abort?.();
      } catch {
        // The session may already have ended.
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    return () => {
      listeningRef.current = false;
      try {
        recognitionRef.current?.abort?.();
      } catch {
        // The session may already have ended.
      }
      recognitionRef.current = null;
    };
  }, []);

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError("");
  };

  const validate = () => {
    if (step === 1 && !form.firstName.trim()) return t("requiredName");
    if (step === 2) {
      const age = Number(form.age);
      if (!form.age || !Number.isFinite(age) || age < 0 || age > 120) return t("requiredAge");
    }
    if (step === 3 && !form.gender) return t("requiredGender");
    if (step === 5 && !form.deptId) return t("requiredDoctor");
    return "";
  };

  const next = () => {
    const message = validate();
    if (message) {
      setError(message);
      speak(message);
      return;
    }
    setError("");
    if (step < totalSteps) {
      setStep((previous) => previous + 1);
      return;
    }
    const token = registerPatient({
      deptId: form.deptId,
      firstName: form.firstName.trim(),
      firstNameHi: form.firstName.trim(),
      fullNameEn: form.firstName.trim(),
      fullNameHi: form.firstName.trim(),
      age: Number(form.age),
      gender: form.gender,
      mobile: form.mobile.trim(),
      priority: "routine",
      source: "self-registration",
    });
    if (token) {
      clearRegistrationDraft();
      navigate("#/opd/slip");
    }
  };

  const back = () => {
    setError("");
    if (step > 1) setStep((previous) => previous - 1);
    else navigate("#/opd");
  };

  const startListening = (field) => {
    if (!micSupported) {
      setError(t("micUnsupported"));
      return;
    }
    // A second tap stops the active session instead of starting another one.
    // The ref is set synchronously so a very fast double-tap cannot race state.
    if (listeningRef.current) {
      const active = recognitionRef.current;
      listeningRef.current = false;
      recognitionRef.current = null;
      setListening(false);
      try {
        active?.stop?.();
      } catch {
        // Nothing is left to stop.
      }
      return;
    }
    try {
      recognitionRef.current?.abort?.();
    } catch {
      // Ignore a stale browser recognition instance.
    }
    recognitionRef.current = null;
    const Recognition = getRecognition();
    const recognition = new Recognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      if (recognitionRef.current === recognition) setListening(true);
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      listeningRef.current = false;
      setListening(false);
    };
    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      listeningRef.current = false;
      setListening(false);
      const reason = event?.error;
      if (reason === "not-allowed" || reason === "service-not-allowed") setError(t("micUnsupported"));
      else if (reason === "no-speech") setError(t("micNoSpeech"));
    };
    recognition.onresult = (event) => {
      if (recognitionRef.current !== recognition) return;
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) update(field, field === "age" ? transcript.replace(/[^0-9]/g, "") : transcript);
    };
    recognitionRef.current = recognition;
    listeningRef.current = true;
    try {
      recognition.start();
    } catch (error) {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
        listeningRef.current = false;
        setListening(false);
        // InvalidStateError means another session is active, not that mic is unsupported.
        if (error?.name !== "InvalidStateError") setError(t("micUnsupported"));
      }
    }
  };

  const microphone = (field) => (
    <button
      type="button"
      onClick={() => startListening(field)}
      aria-label={t("microphone")}
      className={`inline-flex min-h-[52px] items-center gap-2 border px-3 text-[12px] font-semibold ${listening ? "border-[#a53428] bg-[#fdf3f1] text-[#963b31]" : "border-[#c7d8e4] bg-white text-brand hover:bg-brand-light"}`}
    >
      <Mic size={17} strokeWidth={1.9} aria-hidden="true" />
      {listening ? t("micListening") : t("microphone")}
    </button>
  );

  const renderQuestion = () => {
    if (step === 1) {
      return (
        <div>
          <div className="border border-[#dfb3ac] border-l-[3px] border-l-[#a53428] bg-[#fdf4f2] px-4 py-3.5">
            <div className="flex items-start gap-2.5">
              <Siren size={18} strokeWidth={2} className="mt-[1px] shrink-0 text-[#973c31]" aria-hidden="true" />
              <div>
                <p className="text-[15px] font-semibold leading-[1.4] text-[#7e2f26]">{t("emergencySignsTitle")}</p>
                <p className="mt-1 text-[12px] leading-[1.6] text-[#8a554f]">{t("emergencySignsIntro")}</p>
                <ul className="mt-2 grid gap-1.5 text-[12.5px] leading-[1.45] text-[#7e3b32] sm:grid-cols-2">
                  {["signChestPain", "signBreathing", "signBleeding", "signFainting", "signWeakness", "signInjury", "signPregnancy", "signChild"].map((key) => (
                    <li key={key} className="flex items-start gap-1.5">
                      <span aria-hidden="true" className="mt-[7px] h-[4px] w-[4px] shrink-0 rounded-full bg-[#a53428]" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => navigate("#/opd/emergency")}
                  className="mt-3 inline-flex min-h-[42px] items-center gap-2 bg-[#a53428] px-3.5 text-[12px] font-semibold text-white hover:bg-[#8f2e23]"
                >
                  <Siren size={14} strokeWidth={2} aria-hidden="true" />
                  {t("emergencyHelp")}
                </button>
              </div>
            </div>
          </div>
          <label className="mt-5 block">
            <span className="text-[19px] font-semibold leading-[1.35] text-ink">{t("qName")}</span>
            <span className="mt-1 block text-[12px] leading-[1.55] text-[#71828d]">{t("qNameHelp")}</span>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => update("firstName", event.target.value)}
                placeholder={t("qNamePlace")}
                autoComplete="off"
                className="min-h-[56px] w-full border border-[#c7d6e1] bg-white px-3 text-[18px] text-ink outline-none placeholder:text-[#99a6af] focus:border-[#6f9bb8]"
              />
              {micSupported ? microphone("firstName") : null}
            </div>
          </label>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div>
          <p className="text-[12px] leading-[1.6] text-[#71828d]">{t("qAgeHelp")}</p>
          <label className="mt-3 block">
            <span className="text-[19px] font-semibold text-ink">{t("qAge")}</span>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                type="number"
                min={0}
                max={120}
                inputMode="numeric"
                value={form.age}
                onChange={(event) => update("age", event.target.value)}
                className="min-h-[56px] w-full border border-[#c7d6e1] bg-white px-3 text-[18px] text-ink outline-none focus:border-[#6f9bb8]"
              />
              {micSupported ? microphone("age") : null}
            </div>
          </label>
        </div>
      );
    }
    if (step === 3) {
      return (
        <fieldset>
          <legend className="text-[19px] font-semibold text-ink">{t("qGender")}</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {genderOptions.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => update("gender", value)}
                aria-pressed={form.gender === value}
                className={`flex min-h-[62px] items-center gap-2.5 border px-3 text-left text-[14px] font-semibold ${form.gender === value ? "border-brand bg-brand-light text-brand ring-1 ring-brand" : "border-[#cfdce5] bg-white text-[#435a69] hover:bg-[#f7fafc]"}`}
              >
                {form.gender === value ? <Check size={17} strokeWidth={2.4} className="shrink-0" aria-hidden="true" /> : <UserRound size={17} strokeWidth={1.8} className="shrink-0 text-[#7d8f9b]" aria-hidden="true" />}
                {t(label)}
              </button>
            ))}
          </div>
        </fieldset>
      );
    }
    if (step === 4) {
      return (
        <div>
          <p className="text-[12px] leading-[1.6] text-[#71828d]">{t("qMobileHelp")}</p>
          <label className="mt-3 block">
            <span className="text-[19px] font-semibold text-ink">
              {t("qMobile")} <span className="text-[12px] font-normal text-[#7a8b96]">({t("optional")})</span>
            </span>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                type="tel"
                inputMode="tel"
                value={form.mobile}
                onChange={(event) => update("mobile", event.target.value)}
                placeholder="9000000000"
                className="min-h-[56px] w-full border border-[#c7d6e1] bg-white px-3 text-[18px] text-ink outline-none placeholder:text-[#99a6af] focus:border-[#6f9bb8]"
              />
              {micSupported ? microphone("mobile") : null}
            </div>
          </label>
          <p className="mt-2 text-[11.5px] leading-[1.55] text-[#7a8994]">{t("registrationPrivacy")}</p>
        </div>
      );
    }
    return (
      <div>
        <p className="text-[12px] leading-[1.6] text-[#71828d]">{t("qDoctorHelp")}</p>
        <p className="mt-3 text-[19px] font-semibold text-ink">{t("qDoctor")}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {departments.map((department) => {
            const Icon = departmentIcons[department.id] ?? Stethoscope;
            const active = form.deptId === department.id;
            return (
              <button
                key={department.id}
                type="button"
                onClick={() => update("deptId", department.id)}
                aria-pressed={active}
                className={`flex min-h-[76px] items-center gap-3 border px-3 py-2.5 text-left transition-colors ${active ? "border-brand bg-brand-light ring-1 ring-brand" : "border-[#cfdce5] bg-white hover:border-[#9cb8ca] hover:bg-[#fbfdfe]"}`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${active ? "bg-brand text-white" : "bg-[#eef4f8] text-[#45687e]"}`}>
                  <Icon size={21} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-[#273f4f]">{departmentName(department, language)}</span>
                  <span className="mt-0.5 block text-[11.5px] leading-[1.45] text-[#71828d]">{departmentPlain(department, language)}</span>
                  <span className="mt-0.5 block text-[10.5px] text-[#8b98a2]">{departmentRoom(department, language)} · {departmentDoctor(department, language)}</span>
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => navigate("#/opd/find?to=help-desk&lost=1")}
          className="mt-3 flex min-h-[52px] w-full items-center justify-between gap-3 border border-[#c7d8e4] bg-white px-3 text-left text-[13px] font-semibold text-brand hover:bg-brand-light"
        >
          <span className="flex items-center gap-2">
            <HelpCircle size={17} strokeWidth={1.8} aria-hidden="true" />
            {t("notSure")}
          </span>
          <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    );
  };

  return (
    <OpdPage
      title={t("registerTitle")}
      subtitle={t("registerIntro")}
      backTo="#/opd"
    >
      <div className="mx-auto max-w-[820px]">
        <div className="mb-4 flex flex-col justify-between gap-3 border border-[#d7e3eb] bg-white px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6f818d]">{t("assistMode")}</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.assistedMode}
              aria-label={t("assistMode")}
              onClick={() => {
                const next = !settings.assistedMode;
                setSettings(next ? { assistedMode: true, textSize: "large", readAloud: true, avoidStairs: true } : { assistedMode: false });
              }}
              className={`relative h-[26px] w-[46px] rounded-full border ${settings.assistedMode ? "border-brand bg-brand" : "border-[#bccbd5] bg-[#dbe5eb]"}`}
            >
              <span className={`absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-[left] ${settings.assistedMode ? "left-[22px]" : "left-[2px]"}`} />
            </button>
          </div>
          <p className="text-[11px] leading-[1.5] text-[#7a8b96]">{t("assistModeHelp")}</p>
        </div>

        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] leading-[1.5] text-[#7a8994]">{t("demoPatientHelp")}</p>
          <button
            type="button"
            onClick={() => setForm((previous) => ({ ...previous, firstName: "Kamla", age: "62", gender: "female" }))}
            className="inline-flex min-h-[34px] items-center gap-1.5 border border-[#cfdde7] bg-white px-2.5 text-[10.5px] font-semibold text-brand hover:bg-brand-light"
          >
            <UserRound size={12} strokeWidth={1.9} aria-hidden="true" />
            {t("useKamla")} · 62
          </button>
        </div>
        <div className="border border-[#d7e3eb] bg-white">
          <div className="border-b border-[#e5ecf1] px-4 py-3.5 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#6f818d]">
                {t("step")} {step} {t("of")} {totalSteps}
              </p>
              <ListenButton text={`${fieldLabels[step - 1]} ${step === 1 ? t("qNameHelp") : ""}`} compact />
            </div>
            <div className="mt-2 flex gap-1" role="progressbar" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={step} aria-label={t("progressLabel")}>
              {Array.from({ length: totalSteps }).map((_, index) => (
                <span key={index} className={`h-[5px] flex-1 ${index < step ? "bg-brand" : "bg-[#e5edf2]"}`} />
              ))}
            </div>
          </div>
          <div className="px-4 py-5 sm:px-6">{renderQuestion()}</div>
          {error && (
            <div role="alert" className="mx-4 mb-4 flex items-start gap-2 border border-[#dfb3ac] bg-[#fdf3f1] px-3 py-2.5 text-[12.5px] leading-[1.55] text-[#943a31] sm:mx-6">
              <Siren size={14} strokeWidth={2} className="mt-[1px] shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-[#e5ecf1] bg-[#fbfcfd] px-4 py-3.5 sm:px-6">
            <button type="button" onClick={back} className="inline-flex min-h-[48px] items-center gap-1.5 text-[13px] font-medium text-[#61727e] hover:text-brand">
              <ArrowLeft size={16} strokeWidth={1.9} aria-hidden="true" />
              {t("back")}
            </button>
            <button
              type="button"
              onClick={next}
              className="inline-flex min-h-[56px] items-center gap-2 bg-brand px-5 text-[14px] font-semibold text-white hover:bg-brand-deep"
            >
              {step === totalSteps ? t("registerSubmit") : t("next")}
              <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </OpdPage>
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function qrValue(token) {
  const url = new URL(window.location.href);
  url.hash = `#/opd/turn?token=${encodeURIComponent(token)}`;
  url.search = "";
  return url.toString();
}

function slipPatientName(record, t) {
  if (!record) return t("demoPatientName");
  return record.firstName || record.fullNameEn || t("demoPatientName");
}

export function SlipScreen() {
  const { t, language, settings, activeToken, findToken, activeQueueInfo } = useOpd();
  const { speak } = useSpeech();
  const [large, setLarge] = useState(false);
  const [saved, setSaved] = useState("");
  const info = activeQueueInfo ?? (activeToken ? findToken(activeToken) : null);
  const department = info ? departmentById(info.deptId) : null;
  const record = info?.record;
  const firstName = slipPatientName(record, t);
  const patientName = language === "hi" && record?.firstNameHi ? record.firstNameHi : firstName;
  const qr = activeToken ? qrValue(activeToken) : "";
  const summary = department
    ? `${t("slipTitle")}. ${t("slipPatient")} ${patientName}. ${t("slipDepartment")} ${departmentName(department, language)}. ${departmentRoom(department, language)}. ${t("slipDoctor")} ${departmentDoctor(department, language)}. ${info.peopleAhead} ${t("slipAhead")}. ${t("slipWait")}: ${info.waitMinutes} ${t("min")}. ${t("emergencyNoToken")}`
    : t("slipNotReady");

  useEffect(() => {
    if (department && settings.readAloud) speak(summary);
    // Read once only when read-aloud is enabled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeToken, settings.readAloud]);

  const saveImage = () => {
    if (!department || !info) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = 1160;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0b3f6b";
      ctx.fillRect(0, 0, canvas.width, 132);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px Arial";
      ctx.fillText("OPD Saathi", 52, 65);
      ctx.font = "20px Arial";
      ctx.fillText(`${t("hospitalName")} · ${t("slipTitle")}`, 52, 98);
      ctx.fillStyle = "#0b3f6b";
      ctx.font = "bold 92px Arial";
      ctx.fillText(activeToken, 52, 260);
      ctx.fillStyle = "#243746";
      ctx.font = "bold 24px Arial";
      ctx.fillText(patientName, 54, 320);
      const rows = [
        [t("slipDepartment"), departmentName(department, language)],
        [t("slipRoomFloor"), `${departmentRoom(department, language)} · ${floorLabel(department.floor, language)}`],
        [t("slipDoctor"), departmentDoctor(department, language)],
        [t("slipHours"), department.hours],
        [t("slipAhead"), String(info.peopleAhead)],
        [t("slipWait"), `${t("about")} ${info.waitMinutes} ${t("min")}`],
      ];
      ctx.font = "21px Arial";
      rows.forEach(([label, value], index) => {
        const y = 410 + index * 60;
        ctx.fillStyle = "#72838f";
        ctx.fillText(label, 54, y);
        ctx.fillStyle = "#1e3849";
        ctx.font = "bold 23px Arial";
        ctx.fillText(String(value), 360, y);
        ctx.font = "21px Arial";
      });
      const qrCanvas = document.getElementById("slip-qr-download");
      if (qrCanvas) ctx.drawImage(qrCanvas, 600, 760, 230, 230);
      ctx.fillStyle = "#6d7e89";
      ctx.font = "18px Arial";
      ctx.fillText(t("slipQrHelp"), 54, 820);
      ctx.fillText(t("emergencyNoToken"), 54, 1000);
      ctx.fillText(`${t("emergency")}: 112 · ${t("emergencyCall108")}`, 54, 1040);
      ctx.fillText(t("slipNoAadhaar"), 54, 1080);
      const link = document.createElement("a");
      link.download = `opd-slip-${activeToken}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setSaved(t("slipSaved"));
      speak(t("slipSaved"));
    } catch {
      setSaved(t("slipSaveFailed"));
    }
  };

  const printSlip = () => {
    if (!department || !info) return;
    const qrSvg = document.getElementById("slip-qr-print")?.innerHTML ?? "";
    const win = window.open("", "_blank", "width=900,height=1100");
    if (!win) {
      setSaved(t("slipSaveFailed"));
      return;
    }
    win.document.write(`<!doctype html><html lang="${language}"><head><title>${escapeHtml(t("slipTitle"))}</title><style>
      body{font-family:Arial,sans-serif;margin:0;padding:36px;color:#162b3a}
      .head{background:#0b3f6b;color:white;padding:24px 28px}
      .brand{font-size:28px;font-weight:700}.sub{font-size:14px;margin-top:6px;opacity:.8}
      .card{margin-top:22px;border:1px solid #cddce6;padding:28px}
      .token{font-size:60px;font-weight:700;color:#0b3f6b;margin:0}
      table{width:100%;margin-top:20px;border-collapse:collapse}td{padding:9px 0;border-bottom:1px solid #edf2f5;font-size:16px}
      td:last-child{text-align:right;font-weight:600}.qr{margin-top:24px;display:flex;gap:24px;align-items:center}
      .qr svg{width:160px;height:160px}.small{font-size:13px;color:#697b87;line-height:1.55}
    </style></head><body><div class="head"><div class="brand">OPD Saathi</div><div class="sub">${t("hospitalName")} · ${t("slipTitle")}</div></div>
    <div class="card"><h1 class="token">${escapeHtml(activeToken)}</h1><div style="font-size:18px;font-weight:600;margin-top:8px">${escapeHtml(patientName)}</div>
    <table><tr><td>${t("slipDepartment")}</td><td>${departmentName(department, language)}</td></tr>
    <tr><td>${t("slipRoomFloor")}</td><td>${departmentRoom(department, language)} · ${floorLabel(department.floor, language)}</td></tr>
    <tr><td>${t("slipDoctor")}</td><td>${departmentDoctor(department, language)}</td></tr>
    <tr><td>${t("slipHours")}</td><td>${department.hours}</td></tr>
    <tr><td>${t("slipAhead")}</td><td>${info.peopleAhead}</td></tr>
    <tr><td>${t("slipWait")}</td><td>${info.waitMinutes} ${t("min")}</td></tr></table>
    <div class="qr"><div>${qrSvg}</div><div class="small">${t("slipQrHelp")}<br><br><b>${t("emergencyNoToken")}</b><br>112 · 108<br>${t("slipNoAadhaar")}</div></div></div>
    </body></html>`);
    win.document.close();
    window.setTimeout(() => {
      try {
        win.focus();
        win.print();
      } catch {
        // The slip is still visible in the new window for manual printing.
      }
    }, 300);
  };

  if (!info || !department) {
    return (
      <OpdPage title={t("slipNotReady")} subtitle={t("homeRegisterSub")} backTo="#/opd">
        <div className="mx-auto max-w-[620px]">
          <BigAction icon={ClipboardCheck} title={t("homeRegister")} subtitle={t("homeRegisterSub")} tone="primary" onClick={() => navigate("#/opd/register")} />
        </div>
      </OpdPage>
    );
  }

  return (
    <OpdPage
      title={t("slipTitle")}
      subtitle={t("slipKeep")}
      backTo="#/opd"
      actions={<ListenButton text={summary} />}
    >
      <div className="mx-auto grid max-w-[1000px] gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className={`border border-[#cbdbe5] bg-white ${large ? "text-[19px]" : ""}`} aria-labelledby="slip-token">
          <div className="flex items-start justify-between gap-3 bg-brand-deep px-5 py-4 text-white">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a8c9de]">OPD Saathi · {t("slipTitle")}</p>
              <p className="mt-1 text-[13px] font-medium text-white/80">{t("hospitalName")}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center border border-white/25 text-white">
              <FileText size={17} strokeWidth={1.8} aria-hidden="true" />
            </span>
          </div>
          <div className="px-5 py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-[#6f818d]">{t("token")}</p>
                <p id="slip-token" className={`numeric mt-1 font-semibold leading-none tracking-[-0.035em] text-brand-deep ${large ? "text-[64px]" : "text-[50px]"}`}>
                  {activeToken}
                </p>
                <p className={`mt-2 font-semibold text-[#2a4253] ${large ? "text-[24px]" : "text-[18px]"}`}>{patientName}</p>
              </div>
              <span className="border border-[#b9d4c4] bg-[#eff8f3] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#2e6b50]">
                {info.status === "called" ? t("timeNow") : t("registered")}
              </span>
            </div>

            <p className="mt-3 border border-[#d7e3eb] bg-[#f7fafc] px-3 py-2 text-[11.5px] leading-[1.55] text-[#5c717e]">{t("tokenExplain")}</p>
            <dl className="mt-4 grid gap-x-5 gap-y-2.5 border-t border-[#e5ecf1] pt-4 text-[13px] sm:grid-cols-2">
              {[
                [t("slipDepartment"), departmentName(department, language)],
                [t("slipRoomFloor"), `${departmentRoom(department, language)} · ${floorLabel(department.floor, language)}`],
                [t("slipDoctor"), departmentDoctor(department, language)],
                [t("slipHours"), department.hours],
                [t("slipAhead"), String(info.peopleAhead)],
                [t("slipWait"), `${t("about")} ${info.waitMinutes} ${t("min")}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 border-b border-[#edf2f5] pb-2">
                  <dt className="text-[#7a8a95]">{label}</dt>
                  <dd className="text-right font-semibold text-[#2d4657]">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => navigate("#/opd/turn")} className="inline-flex min-h-[48px] items-center gap-2 bg-brand px-4 text-[13px] font-semibold text-white hover:bg-brand-deep">
                {t("slipMyTurn")}
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setLarge((value) => !value)} className="inline-flex min-h-[48px] items-center gap-2 border border-[#cfdde7] bg-white px-3 text-[12.5px] font-semibold text-brand hover:bg-brand-light">
                <Users size={15} strokeWidth={1.8} aria-hidden="true" />
                {large ? t("slipNormal") : t("slipLarge")}
              </button>
              <button type="button" onClick={() => { clearRegistrationDraft(); navigate("#/opd/register"); }} className="inline-flex min-h-[48px] items-center gap-2 border border-[#cfdde7] bg-white px-3 text-[12.5px] font-semibold text-[#5a6f7c] hover:bg-[#f7fafc]">
                {t("slipNewPatient")}
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="border border-[#cbdbe5] bg-white p-4">
            <SectionTitle icon={ScanLine}>{t("slipQrTitle")}</SectionTitle>
            <div className="mt-3 flex justify-center border border-[#d7e3eb] bg-white p-3">
              <div id="slip-qr-print">
                <QRCodeSVG value={qr} size={184} bgColor="#ffffff" fgColor="#0b3f6b" level="M" marginSize={2} aria-label={t("slipQrTitle")} />
              </div>
              <div className="sr-only" aria-hidden="true">
                <QRCodeCanvas id="slip-qr-download" value={qr} size={230} bgColor="#ffffff" fgColor="#0b3f6b" level="M" marginSize={2} />
              </div>
            </div>
            <p className="mt-2 text-[11.5px] leading-[1.6] text-[#70818d]">{t("slipQrHelp")}</p>
          </section>
          <section className="border border-[#d7e3eb] bg-white p-4">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={saveImage} className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 border border-[#cfdde7] bg-white px-3 text-[12px] font-semibold text-brand hover:bg-brand-light">
                <Download size={15} strokeWidth={1.9} aria-hidden="true" />
                {t("slipSave")}
              </button>
              <button type="button" onClick={printSlip} className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 border border-[#cfdde7] bg-white px-3 text-[12px] font-semibold text-brand hover:bg-brand-light">
                <Printer size={15} strokeWidth={1.9} aria-hidden="true" />
                {t("slipPrint")}
              </button>
            </div>
            {saved && <p className="mt-2 text-[11.5px] font-medium text-[#2e6b50]" role="status">{saved}</p>}
            <p className="mt-3 flex items-start gap-1.5 border-t border-[#edf2f5] pt-3 text-[11px] leading-[1.55] text-[#7a8994]">
              <span aria-hidden="true" className="mt-[4px] h-1 w-1 rounded-full bg-[#7a8994]" />
              {t("slipNoAadhaar")}
            </p>
          </section>
          <InfoNote tone="danger" icon={Siren}>
            <strong className="block text-[13px]">{t("emergencySignsTitle")}</strong>
            <span className="mt-1 block">{t("emergencySignsIntro")}</span>
            <button type="button" onClick={() => navigate("#/opd/emergency")} className="mt-2 inline-flex min-h-[40px] items-center gap-1.5 bg-[#a53428] px-3 text-[11.5px] font-semibold text-white hover:bg-[#8f2e23]">
              {t("emergencyHelp")}
              <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
            </button>
          </InfoNote>
        </aside>
      </div>
      <div className="sr-only" aria-live="polite">{summary}</div>
    </OpdPage>
  );
}

export function SettingsPage() {
  const { t } = useOpd();
  return (
    <OpdPage title={t("settingsTitle")} subtitle={t("settingsIntro")} backTo="#/opd">
      <div className="mx-auto max-w-[1000px]">
        <SettingsScreen />
      </div>
    </OpdPage>
  );
}
