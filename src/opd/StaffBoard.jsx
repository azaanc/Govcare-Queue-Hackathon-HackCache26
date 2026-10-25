import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  DoorOpen,
  LayoutGrid,
  ListOrdered,
  MapPinned,
  Monitor,
  Plus,
  Printer,
  RotateCcw,
  Send,
  Siren,
  Stethoscope,
  UserRound,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { useOpd } from "./OpdProvider.jsx";
import {
  FloorTabs,
  InfoNote,
  OpdPage,
  SectionTitle,
  StaffOnlyNote,
  ListenButton,
  navigate,
  useSpeech,
} from "./OpdUI.jsx";
import {
  departments,
  departmentById,
  departmentDoctor,
  departmentName,
  departmentRoom,
} from "../data/departments.js";
import { floorLabel } from "../data/hospital.js";
import en from "../i18n/en.js";
import hi from "../i18n/hi.js";

function dictionary(language) {
  return language === "hi" ? hi : en;
}

function StaffAlertSound({ count }) {
  const previous = useRef(count);
  useEffect(() => {
    if (count > previous.current) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const context = new AudioContextClass();
          [0, 0.22, 0.46].forEach((offset, index) => {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = "sine";
            oscillator.frequency.value = index === 2 ? 1046 : 880;
            gain.gain.setValueAtTime(0.0001, context.currentTime + offset);
            gain.gain.exponentialRampToValueAtTime(0.14, context.currentTime + offset + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + offset + 0.3);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(context.currentTime + offset);
            oscillator.stop(context.currentTime + offset + 0.35);
          });
          window.setTimeout(() => context.close?.(), 1300);
        }
      } catch {
        // Sound is supplementary; the alert stays visible until seen.
      }
    }
    previous.current = count;
  }, [count]);
  return null;
}

function OvercrowdingBadge({ waiting, seats, t }) {
  const ratio = waiting / Math.max(1, seats);
  const level = ratio >= 0.85 ? "over" : ratio >= 0.55 ? "busy" : "normal";
  const classes =
    level === "over"
      ? "border-[#d9aaa3] bg-[#fdf1ef] text-[#963b31]"
      : level === "busy"
        ? "border-[#e1cba9] bg-[#fdf9f1] text-[#8a6323]"
        : "border-[#b9d4c4] bg-[#eff8f3] text-[#2f6b50]";
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.05em] ${classes}`}>
      {level === "over" ? <CircleAlert size={11} strokeWidth={2.2} aria-hidden="true" /> : level === "busy" ? <AlertTriangle size={11} strokeWidth={2} aria-hidden="true" /> : <CheckCircle2 size={11} strokeWidth={2} aria-hidden="true" />}
      {level === "over" ? t("staffOvercrowded") : level === "busy" ? t("staffBusy") : t("staffNormal")}
      {level === "over" && <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
    </span>
  );
}

function DoctorStatusControl({ deptId }) {
  const { t, language, doctorStatus, setDoctorStatus } = useOpd();
  const department = departmentById(deptId);
  const current = doctorStatus[deptId] ?? { mode: "available", breakUntil: "11:30", lateMinutes: 0 };
  const [mode, setMode] = useState(current.mode);
  const [breakUntil, setBreakUntil] = useState(current.breakUntil ?? "11:30");
  const [late, setLate] = useState(String(current.lateMinutes ?? 0));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMode(current.mode);
    setBreakUntil(current.breakUntil ?? "11:30");
    setLate(String(current.lateMinutes ?? 0));
  }, [current.mode, current.breakUntil, current.lateMinutes]);

  const save = () => {
    setDoctorStatus(deptId, {
      mode,
      breakUntil,
      lateMinutes: Math.max(0, Math.min(240, Number(late) || 0)),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="border-t border-[#edf2f5] bg-[#fbfcfd] px-3 py-2.5">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#7c8b95]">{t("staffDoctorStatus")}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <select
          value={mode}
          onChange={(event) => setMode(event.target.value)}
          aria-label={`${t("staffDoctorStatus")} · ${departmentName(department, language)}`}
          className="min-h-[31px] border border-[#cfdde7] bg-white px-1.5 text-[10px] font-medium text-[#425b6a] outline-none"
        >
          <option value="available">{t("staffSetAvailable")}</option>
          <option value="break">{t("staffSetBreak")}</option>
          <option value="late">{t("staffSetLate")}</option>
        </select>
        {mode === "break" && (
          <label className="flex items-center gap-1 text-[9px] text-[#71828d]">
            <span>{t("staffBreakUntil")}</span>
            <input type="time" value={breakUntil} onChange={(event) => setBreakUntil(event.target.value)} className="min-h-[31px] border border-[#cfdde7] bg-white px-1 text-[10px] text-[#425b6a]" />
          </label>
        )}
        {mode === "late" && (
          <label className="flex items-center gap-1 text-[9px] text-[#71828d]">
            <span>{t("staffLateMinutes")}</span>
            <input type="number" min="0" max="240" value={late} onChange={(event) => setLate(event.target.value)} className="min-h-[31px] w-[52px] border border-[#cfdde7] bg-white px-1 text-[10px] text-[#425b6a]" />
          </label>
        )}
        <button type="button" onClick={save} className="min-h-[31px] bg-brand px-2.5 text-[9.5px] font-semibold text-white hover:bg-brand-deep">
          {t("staffUpdateStatus")}
        </button>
        {saved && <span className="text-[9px] font-medium text-[#277c55]">{t("staffStatusSaved")}</span>}
      </div>
    </div>
  );
}

function PatientManageRow({ item, deptId }) {
  const { t, language, markNoShow, sendToEnd, transferPatient } = useOpd();
  const [target, setTarget] = useState("");
  const department = departmentById(deptId);
  const record = item.record;
  const displayName = language === "hi" ? record?.fullNameHi || record?.firstNameHi : record?.fullNameEn || record?.firstName;
  return (
    <li className="border-b border-[#edf2f5] px-3 py-2.5 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="numeric flex items-center gap-1.5 text-[11.5px] font-semibold text-[#324b5b]">
            {item.token}
            {record?.priority === "urgent" && <AlertTriangle size={11} strokeWidth={2} className="text-[#a53428]" aria-label={t("staffFlags")} />}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-[#84939d]">{displayName || t("staffWaiting")} · {item.peopleAhead} {t("slipAhead").toLowerCase()}</p>
        </div>
        <span className="whitespace-nowrap border border-[#e2e9ee] bg-white px-1.5 py-0.5 text-[8.5px] text-[#7c8b95]">~{item.waitMinutes} {t("min")}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <button type="button" onClick={() => markNoShow(item.token, deptId)} aria-label={`${t("staffNoShow")} · ${item.token}`} className="min-h-[28px] border border-[#d7e3eb] bg-white px-2 text-[8.5px] font-semibold text-[#6b7d89] hover:bg-[#f7fafc]">
          {t("staffNoShow")}
        </button>
        <button type="button" onClick={() => sendToEnd(item.token, deptId)} aria-label={`${t("staffSendEnd")} · ${item.token}`} className="min-h-[28px] border border-[#d7e3eb] bg-white px-2 text-[8.5px] font-semibold text-[#6b7d89] hover:bg-[#f7fafc]">
          {t("staffSendEnd")}
        </button>
        <div className="flex items-center gap-1">
          <select value={target} onChange={(event) => setTarget(event.target.value)} aria-label={`${t("staffTransfer")} · ${item.token}`} className="min-h-[28px] max-w-[116px] border border-[#d7e3eb] bg-white px-1 text-[8.5px] text-[#6b7d89]">
            <option value="">{t("staffTransferTo")}</option>
            {departments.filter((entry) => entry.id !== deptId).map((entry) => (
              <option key={entry.id} value={entry.id}>{departmentName(entry, language)}</option>
            ))}
          </select>
          <button type="button" disabled={!target} onClick={() => { transferPatient(item.token, deptId, target); setTarget(""); }} aria-label={`${t("staffTransfer")} ${item.token}`} className="flex min-h-[28px] w-[28px] items-center justify-center border border-[#d7e3eb] bg-white text-brand disabled:opacity-40">
            <Send size={11} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  );
}

function DepartmentCard({ departmentId, index }) {
  const {
    t,
    language,
    getWaitingInfo,
    callNext,
    doctorStatus,
    reportDelay,
  } = useOpd();
  const info = getWaitingInfo(departmentId);
  const department = departmentById(departmentId);
  const current = doctorStatus[departmentId] ?? { mode: "available" };
  const [manage, setManage] = useState(false);
  const nextThree = info.waiting.slice(0, 3);
  return (
    <section className="border border-[#d7e3eb] bg-white" aria-labelledby={`dept-${departmentId}`}>
      <div className="flex items-start justify-between gap-3 border-b border-[#e5ecf1] px-3.5 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h2 id={`dept-${departmentId}`} className="text-[14px] font-semibold leading-[1.3] text-[#263f4f]">{departmentName(department, language)}</h2>
            <span className={`border px-1.5 py-[1px] text-[8.5px] font-semibold uppercase tracking-[0.04em] ${current.mode === "available" ? "border-[#b9d4c4] bg-[#eff8f3] text-[#2f6b50]" : current.mode === "break" ? "border-[#d7e3eb] bg-[#f7fafc] text-[#687b87]" : "border-[#e1cba9] bg-[#fdf9f1] text-[#8a6323]"}`}>
              {current.mode === "available" ? t("staffSetAvailable") : current.mode === "break" ? t("staffSetBreak") : t("staffSetLate")}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[#84939d]">{departmentRoom(department, language)} · {floorLabel(department.floor, language)} · {departmentDoctor(department, language)}</p>
        </div>
        <OvercrowdingBadge waiting={info.waiting.length} seats={department.seats} t={t} />
      </div>

      <div className="grid grid-cols-3 divide-x divide-[#edf2f5] border-b border-[#e5ecf1]">
        <div className="px-3 py-2.5">
          <p className="text-[8.5px] uppercase tracking-[0.07em] text-[#84939d]">{t("staffNowServing")}</p>
          <p className="numeric mt-0.5 text-[16px] font-semibold leading-none text-brand-deep">{info.current ?? "—"}</p>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[8.5px] uppercase tracking-[0.07em] text-[#84939d]">{t("staffWaiting")}</p>
          <p className="numeric mt-0.5 text-[16px] font-semibold leading-none text-[#263f4f]">{info.waiting.length}</p>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[8.5px] uppercase tracking-[0.07em] text-[#84939d]">{t("staffAverageWait")}</p>
          <p className="mt-0.5 text-[16px] font-semibold leading-none text-[#263f4f]"><span className="numeric">~{info.averageWait}</span> <span className="text-[9px] font-normal text-[#84939d]">{t("min")}</span></p>
        </div>
      </div>

      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.07em] text-[#7c8b95]">{t("boardNext")}</p>
          <p className="text-[9.5px] text-[#7c8b95]">{t("staffSeats", { waiting: info.waiting.length, seats: department.seats })}</p>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {nextThree.length ? nextThree.map((item) => (
            <span key={item.token} className="numeric border border-[#d7e3eb] bg-[#fbfcfd] px-1.5 py-1 text-[9px] font-semibold text-[#566b79]">{item.token}</span>
          )) : <span className="text-[10px] text-[#8a98a2]">{t("staffEmptyQueue")}</span>}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => callNext(departmentId)}
            disabled={!info.waiting.length}
            className="inline-flex min-h-[34px] flex-1 items-center justify-center gap-1.5 bg-brand px-2.5 text-[9.5px] font-semibold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Bell size={12} strokeWidth={2} aria-hidden="true" />
            {t("staffCallNext")}
          </button>
          <button type="button" onClick={() => setManage((value) => !value)} className="inline-flex min-h-[34px] items-center gap-1 border border-[#cfdde7] bg-white px-2 text-[9px] font-semibold text-[#5c717e] hover:bg-[#f7fafc]">
            <ListOrdered size={11} strokeWidth={1.9} aria-hidden="true" />
            {manage ? t("close") : t("staffQueue")}
          </button>
          <button type="button" onClick={() => reportDelay(departmentId)} title={t("reportDelay")} aria-label={`${t("reportDelay")} · ${departmentName(department, language)}`} className="inline-flex min-h-[34px] items-center gap-1 border border-[#e0d3c0] bg-white px-2 text-[9px] font-semibold text-[#8a6323] hover:bg-[#fdf9f1]">
            <Clock3 size={11} strokeWidth={1.9} aria-hidden="true" />
            {t("delayShort")}
          </button>
        </div>
      </div>

      {manage && (
        <div className="border-t border-[#e5ecf1]">
          {info.waiting.length ? (
            <ul>
              {info.waiting.slice(0, 8).map((item) => (
                <PatientManageRow key={item.token} item={item} deptId={departmentId} />
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-[11px] text-[#84939d]">{t("staffEmptyQueue")}</p>
          )}
        </div>
      )}

      <DoctorStatusControl deptId={departmentId} />
    </section>
  );
}

export function StaffDashboardScreen() {
  const {
    t,
    language,
    unseenFlags,
    flags,
    markFlagSeen,
    getWaitingInfo,
    callNext,
    addSamplePatients,
    speed,
    setSpeed,
    resetDemo,
  } = useOpd();
  const [message, setMessage] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const { speak } = useSpeech();
  const totalWaiting = departments.reduce((sum, department) => sum + getWaitingInfo(department.id).waiting.length, 0);
  const averageWait = Math.round(
    departments.reduce((sum, department) => sum + getWaitingInfo(department.id).averageWait, 0) / departments.length
  );

  useEffect(() => {
    if (unseenFlags.length > 0) {
      speak(
        `${unseenFlags.length} ${t("staffFlags")}. ${unseenFlags
          .slice(0, 2)
          .map((flag) => t(flag.reasonKey))
          .join(". ")}`
      );
    }
    // Only announce when the unseen count changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unseenFlags.length]);

  const announce = (text) => {
    setMessage(text);
    speak(text);
    window.setTimeout(() => setMessage(""), 2800);
  };

  return (
    <OpdPage
      title={t("staffTitle")}
      subtitle={t("staffCallNote")}
      backTo="#/opd"
      actions={
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate("#/opd/counter")} className="inline-flex min-h-[38px] items-center gap-1.5 border border-[#cfdde7] bg-white px-3 text-[11px] font-semibold text-brand hover:bg-brand-light">
            <ClipboardCheck size={13} strokeWidth={1.9} aria-hidden="true" />
            {t("staffViewCounter")}
          </button>
          <button type="button" onClick={() => navigate("#/board")} className="inline-flex min-h-[38px] items-center gap-1.5 border border-[#cfdde7] bg-white px-3 text-[11px] font-semibold text-brand hover:bg-brand-light">
            <Monitor size={13} strokeWidth={1.9} aria-hidden="true" />
            {t("staffViewBoard")}
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-[1220px]">
        <StaffAlertSound count={unseenFlags.length} />
        <StaffOnlyNote />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border border-[#cfdde7] bg-white px-3.5 py-2.5">
          <p className="flex items-center gap-2 text-[11.5px] text-[#5d707d]">
            <span aria-hidden="true" className="h-[6px] w-[6px] rounded-full bg-[#277c55]" />
            <strong className="font-semibold text-[#334c5c]">{t("staffLive")}</strong> · {t("staffAllDepartments")} · {t("staffRealLogin")}
          </p>
          <button type="button" onClick={() => speak(`${t("staffTitle")}. ${unseenFlags.length} ${t("staffFlags")}.`)} className="inline-flex min-h-[32px] items-center gap-1.5 text-[10.5px] font-semibold text-link">
            <Volume2 size={13} strokeWidth={1.9} aria-hidden="true" />
            {t("readAloud")}
          </button>
        </div>

        {unseenFlags.length > 0 && (
          <section className="mt-3 border border-[#d9aaa3] border-l-[3px] border-l-[#a53428] bg-[#fdf3f1]" aria-labelledby="flags-title">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eccfcb] px-3.5 py-2.5">
              <h2 id="flags-title" className="flex items-center gap-2 text-[12px] font-semibold text-[#7e2f26]">
                <span aria-hidden="true" className="flex h-2 w-2 items-center justify-center">
                  <span className="absolute h-2 w-2 animate-ping rounded-full bg-[#a53428] opacity-40" />
                  <span className="h-2 w-2 rounded-full bg-[#a53428]" />
                </span>
                {t("staffFlags")} · {unseenFlags.length}
              </h2>
              <p className="text-[10px] text-[#8a554f]">{t("staffFlagsTop")}</p>
            </div>
            <ul className="divide-y divide-[#eccfcb]">
              {flags.map((flag) => (
                <li key={flag.id} className={`flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 ${flag.seen ? "bg-white opacity-70" : ""}`}>
                  <div className="flex items-start gap-2.5">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${flag.seen ? "bg-[#eff3f5] text-[#7c8b95]" : "bg-[#a53428] text-white"}`}>
                      <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[11.5px] font-semibold text-[#6d332c]">{t(flag.reasonKey)}</p>
                      <p className="mt-0.5 text-[9.5px] text-[#8a6762]">
                        {flag.token ?? t("homeRegister")} {flag.deptId ? `· ${departmentName(departmentById(flag.deptId), language)}` : ""} · {t("minutesAgo", { count: Math.max(0, Math.round((Date.now() - flag.createdAt) / 60000)) })}
                      </p>
                    </div>
                  </div>
                  {flag.seen ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-medium text-[#2f6b50]"><Check size={12} strokeWidth={2.4} aria-hidden="true" />{t("staffSeen")}</span>
                  ) : (
                    <button type="button" onClick={() => markFlagSeen(flag.id)} className="min-h-[34px] border border-[#c99790] bg-white px-2.5 text-[10px] font-semibold text-[#8f352b] hover:bg-[#fdf7f5]">
                      {t("staffMarkSeen")}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {message && (
          <div role="status" className="fixed bottom-4 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-[520px] -translate-x-1/2 border border-[#b9d4c4] bg-[#f2f9f5] px-4 py-3 text-[12px] font-medium text-[#2f6b50] shadow-lg">
            {message}
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {[
            [t("staffWaiting"), totalWaiting, Users],
            [t("staffAverageWait"), `~${averageWait} ${t("min")}`, Clock3],
            [t("staffFlags"), unseenFlags.length, Siren],
            [t("staffViewQueue"), departments.length, LayoutGrid],
          ].map(([label, value, Icon]) => (
            <div key={label} className="border border-[#d7e3eb] bg-white px-3.5 py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[9px] font-semibold uppercase leading-[1.4] tracking-[0.07em] text-[#7a8a95]">{label}</p>
                <Icon size={14} strokeWidth={1.8} className="text-link" aria-hidden="true" />
              </div>
              <p className="numeric mt-1.5 text-[24px] font-semibold leading-none tracking-[-0.03em] text-[#1f3747]">{value}</p>
            </div>
          ))}
        </div>

        <section className="mt-3 border border-[#d7e3eb] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5ecf1] px-3.5 py-3">
            <div>
              <SectionTitle icon={Stethoscope}>{t("staffTitle")}</SectionTitle>
              <p className="mt-1 text-[10.5px] text-[#7a8a95]">{t("staffAlertSound")} {t("staffBoardAnnounce")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" onClick={() => { addSamplePatients(20); announce(t("staffAdd20Done")); }} className="inline-flex min-h-[34px] items-center gap-1.5 border border-[#cfdde7] bg-white px-2.5 text-[9.5px] font-semibold text-[#4e6574] hover:bg-[#f7fafc]">
                <Plus size={11} strokeWidth={2.2} aria-hidden="true" />
                {t("staffAdd20")}
              </button>
              <button type="button" onClick={() => { const next = speed > 1 ? 1 : 10; setSpeed(next); announce(next > 1 ? t("staffSpeedOn") : t("staffSpeedOff")); }} className={`inline-flex min-h-[34px] items-center gap-1.5 border px-2.5 text-[9.5px] font-semibold ${speed > 1 ? "border-brand bg-brand text-white" : "border-[#cfdde7] bg-white text-[#4e6574]"} hover:opacity-90`}>
                <CalendarClock size={11} strokeWidth={2} aria-hidden="true" />
                {speed > 1 ? "10×" : t("staffSpeed")}
              </button>
              <button type="button" onClick={() => setResetOpen(true)} className="inline-flex min-h-[34px] items-center gap-1.5 border border-[#e0d6ce] bg-white px-2.5 text-[9.5px] font-semibold text-[#9a6c4b] hover:bg-[#fdf9f1]">
                <RotateCcw size={11} strokeWidth={2} aria-hidden="true" />
                {t("staffReset")}
              </button>
            </div>
          </div>
          <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
            {departments.map((department, index) => <DepartmentCard key={department.id} departmentId={department.id} index={index} />)}
          </div>
        </section>

        <section className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="border border-[#d7e3eb] bg-white p-3.5">
            <SectionTitle icon={Siren}>{t("emergencySignsTitle")}</SectionTitle>
            <p className="mt-1.5 text-[11.5px] leading-[1.65] text-[#7a8a95]">{t("emergencyStaffNote")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a href="tel:112" className="inline-flex min-h-[38px] items-center gap-1.5 bg-[#a53428] px-3 text-[11px] font-semibold text-white">112</a>
              <a href="tel:108" className="inline-flex min-h-[38px] items-center gap-1.5 border border-[#e1c0bb] px-3 text-[11px] font-semibold text-[#963b31]">108</a>
            </div>
          </div>
          <div className="border border-[#d7e3eb] bg-white p-3.5">
            <SectionTitle icon={Monitor}>{t("staffDemo")}</SectionTitle>
            <p className="mt-1.5 text-[11.5px] leading-[1.65] text-[#7a8a95]">{t("staffCallNote")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => setSpeed(speed > 1 ? 1 : 10)} className="inline-flex min-h-[38px] items-center gap-1.5 border border-[#cfdde7] bg-white px-3 text-[11px] font-semibold text-brand">{speed > 1 ? t("staffNormalSpeed") : t("staffSpeed")}</button>
              <button type="button" onClick={() => navigate("#/board")} className="inline-flex min-h-[38px] items-center gap-1.5 bg-brand px-3 text-[11px] font-semibold text-white">{t("staffViewBoard")}</button>
            </div>
          </div>
        </section>

        {resetOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#04192b]/60 p-4" role="dialog" aria-modal="true" aria-labelledby="reset-title">
            <div className="w-full max-w-[460px] border border-[#d7e3eb] bg-white">
              <div className="h-[3px] bg-[#a53428]" />
              <div className="px-5 py-4">
                <h2 id="reset-title" className="text-[17px] font-semibold text-ink">{t("staffReset")}</h2>
                <p className="mt-1.5 text-[12.5px] leading-[1.65] text-[#6b7c87]">{t("resetConfirm")}</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setResetOpen(false)} className="min-h-[38px] border border-[#d7e3eb] px-3 text-[11.5px] font-semibold text-[#647682]">{t("cancel")}</button>
                  <button type="button" onClick={() => { resetDemo(); setResetOpen(false); setMessage(t("resetDone")); }} className="min-h-[38px] bg-[#a53428] px-3 text-[11.5px] font-semibold text-white">{t("staffReset")}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </OpdPage>
  );
}

function escapePrint(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function printCounterSlip(token, department, patient, t, language) {
  const win = window.open("", "_blank", "width=760,height=760");
  if (!win) return;
  win.document.write(`<!doctype html><html lang="${language}"><head><title>OPD slip ${token}</title><style>
    body{font-family:Arial,sans-serif;padding:32px;color:#172d3c}.head{background:#0b3f6b;color:#fff;padding:22px}.brand{font-size:25px;font-weight:700}
    .token{font-size:54px;color:#0b3f6b;margin:20px 0 4px;font-weight:700}.card{border:1px solid #d1dfe8;padding:24px;margin-top:16px}
    table{width:100%;border-collapse:collapse;margin-top:14px}td{padding:8px 0;border-bottom:1px solid #edf2f5;font-size:15px}td:last-child{text-align:right;font-weight:600}
    .note{font-size:12px;color:#6f808b;line-height:1.55;margin-top:18px}
  </style></head><body><div class="head"><div class="brand">OPD Saathi</div><div>${t("hospitalName")} · ${t("slipTitle")}</div></div>
  <div class="card"><div class="token">${escapePrint(token)}</div><div style="font-size:17px;font-weight:600">${escapePrint(patient.firstName)}</div>
  <table><tr><td>${t("slipDepartment")}</td><td>${departmentName(department, language)}</td></tr>
  <tr><td>${t("slipRoomFloor")}</td><td>${departmentRoom(department, language)} · ${floorLabel(department.floor, language)}</td></tr>
  <tr><td>${t("slipDoctor")}</td><td>${departmentDoctor(department, language)}</td></tr>
  <tr><td>${t("slipHours")}</td><td>${department.hours}</td></tr></table>
  <div class="note">${t("emergencyHelp")}<br>112 · 108<br>${t("slipNoAadhaar")}</div></div>
  </body></html>`);
  win.document.close();
  window.setTimeout(() => {
    try {
      win.focus();
      win.print();
    } catch {
      // Keep the slip visible if this browser blocks automatic printing.
    }
  }, 300);
}

export function RegistrationCounterScreen() {
  const { t, language, registerPatient, demoPatients } = useOpd();
  const [form, setForm] = useState({ firstName: "", age: "", gender: "female", mobile: "", deptId: "med" });
  const [error, setError] = useState("");
  const [last, setLast] = useState(null);

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError("");
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.firstName.trim()) { setError(t("requiredName")); return; }
    const age = Number(form.age);
    if (!form.age || !Number.isFinite(age) || age < 0 || age > 120) { setError(t("requiredAge")); return; }
    const token = registerPatient(
      {
        deptId: form.deptId,
        firstName: form.firstName.trim(),
        firstNameHi: form.firstName.trim(),
        fullNameEn: form.firstName.trim(),
        fullNameHi: form.firstName.trim(),
        age,
        gender: form.gender,
        mobile: form.mobile.trim(),
        priority: "routine",
        source: "counter",
      },
      { activate: false }
    );
    setLast({ token, deptId: form.deptId, firstName: form.firstName.trim() });
  };

  const department = departmentById(form.deptId);
  return (
    <OpdPage
      title={t("counterTitle")}
      subtitle={t("counterIntro")}
      backTo="#/staff"
      actions={<ListenButton text={`${t("counterTitle")}. ${t("counterIntro")}. ${t("counterPrivacy")}`} />}
    >
      <div className="mx-auto grid max-w-[1000px] gap-4 lg:grid-cols-[1.3fr_1fr]">
        <form onSubmit={submit} className="border border-[#d7e3eb] bg-white">
          <div className="border-b border-[#e5ecf1] px-4 py-3.5">
            <SectionTitle icon={ClipboardCheck}>{t("counterNew")}</SectionTitle>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-[12px] font-semibold text-[#354b5b]">{t("counterFirstName")}</span>
              <input value={form.firstName} onChange={(event) => update("firstName", event.target.value)} className="mt-1 min-h-[46px] w-full border border-[#c7d6e1] bg-white px-3 text-[15px] text-ink outline-none focus:border-[#6f9bb8]" />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-[#354b5b]">{t("counterAge")}</span>
              <input type="number" min="0" max="120" value={form.age} onChange={(event) => update("age", event.target.value)} className="mt-1 min-h-[46px] w-full border border-[#c7d6e1] bg-white px-3 text-[15px] text-ink outline-none focus:border-[#6f9bb8]" />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-[#354b5b]">{t("counterGender")}</span>
              <select value={form.gender} onChange={(event) => update("gender", event.target.value)} className="mt-1 min-h-[46px] w-full border border-[#c7d6e1] bg-white px-2.5 text-[13px] text-ink outline-none focus:border-[#6f9bb8]">
                <option value="female">{t("genderFemale")}</option>
                <option value="male">{t("genderMale")}</option>
                <option value="other">{t("genderOther")}</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-[#354b5b]">{t("counterMobile")}</span>
              <input type="tel" value={form.mobile} onChange={(event) => update("mobile", event.target.value)} className="mt-1 min-h-[46px] w-full border border-[#c7d6e1] bg-white px-3 text-[15px] text-ink outline-none focus:border-[#6f9bb8]" />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-[#354b5b]">{t("counterChooseDept")}</span>
              <select value={form.deptId} onChange={(event) => update("deptId", event.target.value)} className="mt-1 min-h-[46px] w-full border border-[#c7d6e1] bg-white px-2.5 text-[13px] text-ink outline-none focus:border-[#6f9bb8]">
                {departments.map((entry) => <option key={entry.id} value={entry.id}>{departmentName(entry, language)} · {departmentRoom(entry, language)}</option>)}
              </select>
            </label>
            <div className="sm:col-span-2">
              <label className="flex min-h-[42px] items-center gap-2 border border-[#d7e3eb] bg-[#fbfcfd] px-3 text-[11.5px] text-[#60737f]">
                <input type="checkbox" defaultChecked className="accent-[#0b3f6b]" />
                {t("counterHelper")}
              </label>
            </div>
            {error && <p role="alert" className="text-[12px] font-medium text-[#a53428] sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf2f5] pt-3">
              <p className="max-w-[360px] text-[10.5px] leading-[1.5] text-[#7a8994]">{t("counterPrivacy")}</p>
              <button type="submit" className="inline-flex min-h-[48px] items-center gap-2 bg-brand px-4 text-[13px] font-semibold text-white hover:bg-brand-deep">
                <Plus size={15} strokeWidth={2.2} aria-hidden="true" />
                {t("counterRegister")}
              </button>
            </div>
          </div>
        </form>

        <aside className="space-y-4">
          {last ? (
            <div className="border border-[#b9d4c4] bg-[#f4faf7] p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2f6b50]">
                <CheckCircle2 size={14} strokeWidth={2} aria-hidden="true" />
                {t("counterRegistered")}
              </p>
              <p className="numeric mt-2 text-[34px] font-semibold leading-none text-brand-deep">{last.token}</p>
              <p className="mt-1 text-[12px] text-[#536976]">{last.firstName} · {departmentName(departmentById(last.deptId), language)} · {departmentRoom(departmentById(last.deptId), language)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => printCounterSlip(last.token, departmentById(last.deptId), last, t, language)} className="inline-flex min-h-[42px] items-center gap-1.5 bg-brand px-3 text-[11.5px] font-semibold text-white hover:bg-brand-deep">
                  <Printer size={14} strokeWidth={1.9} aria-hidden="true" />
                  {t("counterPrint")}
                </button>
                <button type="button" onClick={() => setLast(null)} className="inline-flex min-h-[42px] items-center gap-1.5 border border-[#cfdbe4] bg-white px-3 text-[11.5px] font-semibold text-brand hover:bg-brand-light">
                  {t("counterNext")}
                </button>
              </div>
            </div>
          ) : (
            <InfoNote tone="access">{t("counterIntro")}</InfoNote>
          )}
          <div className="border border-[#d7e3eb] bg-white p-4">
            <SectionTitle icon={ClipboardCheck}>{t("useKamla")}</SectionTitle>
            <p className="mt-1.5 text-[11.5px] leading-[1.6] text-[#7a8994]">{t("demoPatientHelp")}</p>
            {demoPatients.slice(0, 1).map((patient) => (
              <button
                key={patient.nameEn}
                type="button"
                onClick={() => setForm({ firstName: language === "hi" ? patient.nameHi : patient.nameEn, age: String(patient.age), gender: patient.gender, mobile: patient.mobile, deptId: "med" })}
                className="mt-2 inline-flex min-h-[38px] items-center gap-1.5 border border-[#cfdde7] bg-white px-3 text-[11px] font-semibold text-brand hover:bg-brand-light"
              >
                <UserRound size={13} strokeWidth={1.9} aria-hidden="true" />
                {t("useKamla")} · {patient.age}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => navigate("#/staff")} className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 border border-[#cfdde7] bg-white text-[12px] font-semibold text-brand hover:bg-brand-light">
            <ArrowLeft size={15} strokeWidth={1.9} aria-hidden="true" />
            {t("staffTitle")}
          </button>
        </aside>
      </div>
    </OpdPage>
  );
}

export function BoardScreen() {
  const { t: globalT, language, getWaitingInfo, announcements, doctorStatus } = useOpd();
  const [boardLanguage, setBoardLanguage] = useState(language);
  const t = useCallback((key, variables) => {
    const dict = dictionary(boardLanguage);
    return String(dict[key] ?? en[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(variables?.[name] ?? ""));
  }, [boardLanguage]);
  const announcedRef = useRef("");
  const latestAnnouncement = announcements[0];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBoardLanguage((previous) => (previous === "en" ? "hi" : "en"));
    }, 6000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!latestAnnouncement || announcedRef.current === latestAnnouncement.id) return;
    announcedRef.current = latestAnnouncement.id;
    const department = departmentById(latestAnnouncement.deptId);
    const room = boardLanguage === "hi" ? department.roomHi : department.room;
    const text = t("boardAnnouncement", { token: latestAnnouncement.token, room });
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = boardLanguage === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
    // Announce once per new called token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestAnnouncement?.id]);

  return (
    <div className="opd-app min-h-screen bg-[#062b49] text-white" lang={boardLanguage}>
      <header className="border-b border-white/15 bg-[#041f35]">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border border-white/30 text-[#a9cae0]">
              <Monitor size={23} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-[21px] font-semibold tracking-[-0.025em]">{t("boardTitle")}</h1>
              <p className="text-[12px] text-white/60">{t("boardSub")} · {t("boardOpdHours")}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="tel:112" className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-white/25 bg-[#7f2b23]/50 px-3 text-[11px] font-semibold text-white hover:bg-[#7f2b23]/70">
              <Siren size={13} strokeWidth={2} aria-hidden="true" />
              {t("emergency")} · 112 · 108
            </a>
            <button type="button" onClick={() => navigate("#/opd/emergency")} className="min-h-[38px] border border-white/20 px-2.5 text-[10px] font-medium text-white/70 hover:bg-white/10">
              {t("emergencyHelp")}
            </button>
            <span className="border border-white/20 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/70">
              {boardLanguage === "en" ? "English" : "हिंदी"}
            </span>
            <button type="button" onClick={() => navigate("#/opd/staff")} className="inline-flex min-h-[38px] items-center gap-1.5 border border-white/20 px-3 text-[11px] font-medium text-white/75 hover:bg-white/10">
              <ArrowLeft size={13} strokeWidth={1.9} aria-hidden="true" />
              {t("boardExit")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-5 py-5 sm:px-8 sm:py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] text-white/55">{t("boardLanguageNote")}</p>
          <button
            type="button"
            onClick={() => {
              const request = document.documentElement.requestFullscreen?.();
              if (request?.catch) request.catch(() => undefined);
            }}
            className="inline-flex min-h-[36px] items-center gap-1.5 border border-white/20 px-3 text-[10.5px] font-medium text-white/70 hover:bg-white/10"
          >
            <Monitor size={13} strokeWidth={1.9} aria-hidden="true" />
            {t("boardFullScreen")}
          </button>
        </div>

        {latestAnnouncement && (
          <div className="mb-4 flex flex-wrap items-center gap-3 border border-[#4f87a6] bg-[#0b3f6b] px-4 py-3.5">
            <Volume2 size={21} strokeWidth={1.7} className="text-[#a9cae0]" aria-hidden="true" />
            <p className="text-[18px] font-semibold leading-[1.35] sm:text-[21px]">
              {t("boardAnnouncement", {
                token: latestAnnouncement.token,
                room: boardLanguage === "hi" ? latestAnnouncement.roomHi : latestAnnouncement.room,
              })}
            </p>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {departments.map((department) => {
            const info = getWaitingInfo(department.id);
            const status = doctorStatus[department.id] ?? { mode: "available" };
            const next = info.waiting.slice(0, 3);
            return (
              <section key={department.id} className="border border-[#28536f] bg-[#0a3557]" aria-labelledby={`board-${department.id}`}>
                <div className="flex items-start justify-between gap-2 border-b border-[#28536f] px-3.5 py-2.5">
                  <div>
                    <h2 id={`board-${department.id}`} className="text-[15px] font-semibold leading-[1.3] text-white">{departmentName(department, boardLanguage)}</h2>
                    <p className="mt-0.5 text-[11px] text-[#9fbdd0]">{departmentRoom(department, boardLanguage)} · {floorLabel(department.floor, boardLanguage)}</p>
                  </div>
                  <span className={`border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.05em] ${info.occupancy >= 0.85 ? "border-[#d28b82] bg-[#6f2b23] text-[#ffd7d1]" : info.occupancy >= 0.55 ? "border-[#c4a671] bg-[#4f3f23] text-[#f2deb7]" : "border-[#4f8870] bg-[#173f32] text-[#bde0ce]"}`}>
                    {info.occupancy >= 0.85 ? t("staffOvercrowded") : info.occupancy >= 0.55 ? t("staffBusy") : t("staffNormal")}
                  </span>
                </div>
                <div className="px-3.5 py-3">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#9fbdd0]">{t("boardNowServing")}</p>
                  <p className={`numeric mt-1 font-semibold leading-none tracking-[-0.03em] ${info.current ? "text-[47px] text-white" : "text-[30px] text-[#adc7d6]"}`}>{info.current ?? t("boardNoQueue")}</p>
                </div>
                <div className="border-t border-[#28536f] px-3.5 py-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.09em] text-[#9fbdd0]">{t("boardNext")}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {next.length ? next.map((item) => (
                      <span key={item.token} className="numeric border border-[#3a6581] bg-[#0e4066] px-2 py-1 text-[11px] font-semibold text-[#e2eff7]">{item.token}</span>
                    )) : <span className="text-[11px] text-[#9fbdd0]">—</span>}
                  </div>
                  <p className={`mt-2 flex items-center gap-1.5 text-[10px] ${status.mode === "late" ? "text-[#f2d5a6]" : "text-[#b7d0df]"}`}>
                    <Clock3 size={11} strokeWidth={1.8} aria-hidden="true" />
                    {status.mode === "break"
                      ? t("boardBreak", { time: status.breakUntil ?? "11:30" })
                      : status.mode === "late"
                        ? t("boardDelay", { count: info.delay })
                        : info.delay > 0
                          ? t("boardDelay", { count: info.delay })
                          : t("boardNoDelay")}
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#28536f] pt-3 text-[11px] text-[#9fbdd0]">
          <p>{t("hospitalName")} · {t("boardSub")} · {t("emergencyShort")}: 112 / 108</p>
          <p className="flex items-center gap-2"><Bell size={12} strokeWidth={1.8} aria-hidden="true" /> {latestAnnouncement ? t("boardAnnouncement", { token: latestAnnouncement.token, room: boardLanguage === "hi" ? latestAnnouncement.roomHi : latestAnnouncement.room }) : t("boardNoDelay")}</p>
        </footer>
      </main>
    </div>
  );
}
