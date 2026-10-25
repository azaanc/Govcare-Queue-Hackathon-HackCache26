import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bell,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  Ear,
  FileText,
  Headphones,
  HeartPulse,
  HelpCircle,
  Hospital,
  LocateFixed,
  MapPin,
  MessageSquareText,
  Navigation,
  Phone,
  Search,
  Siren,
  Smartphone,
  Stethoscope,
  Volume2,
  X,
} from "lucide-react";
import { useOpd } from "./OpdProvider.jsx";
import {
  BigAction,
  FloorTabs,
  HospitalFloorPlan,
  InfoNote,
  ListenButton,
  OpdPage,
  SectionTitle,
  navigate,
  useSpeech,
} from "./OpdUI.jsx";
import {
  departmentById,
  departmentDoctor,
  departmentName,
  departmentRoom,
} from "../data/departments.js";
import { floorLabel, placeById, places } from "../data/hospital.js";
import { nearestHelpDesk } from "./routeUtils.js";

function queryParam(name) {
  const hash = window.location.hash || "";
  const question = hash.indexOf("?");
  if (question < 0) return "";
  return new URLSearchParams(hash.slice(question + 1)).get(name) ?? "";
}

function beep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.5);
    window.setTimeout(() => context.close?.(), 700);
  } catch {
    // Sound is a helpful extra, never a requirement for queue status.
  }
}

export function MyTurnScreen() {
  const {
    t,
    language,
    settings,
    setSettings,
    activeToken,
    findToken,
    activeQueueInfo,
    setActiveToken,
  } = useOpd();
  const queryToken = queryParam("token");
  const { speak } = useSpeech();
  const [sms, setSms] = useState(null);
  const alertRef = useRef({ token: "", near: false, called: false });
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  useEffect(() => {
    if (queryToken && queryToken.toUpperCase() !== activeToken) {
      const found = findToken(queryToken);
      if (found) setActiveToken(found.token);
    }
  }, [activeToken, findToken, queryToken, setActiveToken]);

  const info = activeQueueInfo ?? (queryToken ? findToken(queryToken) : null);
  const department = info ? departmentById(info.deptId) : null;
  const doctorStatus = info?.doctorStatus ?? { mode: "available" };
  const called = info?.status === "called";
  const near = !called && info?.peopleAhead <= 3;
  const summary = info
    ? `${t("turnTitle")}. ${called ? t("calledTitle", { token: info.token }) : t("aheadCount", { count: info.peopleAhead })}. ${t("waitEstimate", { count: info.waitMinutes })}. ${t("nowServing")} ${info.current ?? ""}.`
    : t("noToken");

  useEffect(() => {
    if (!info) return;
    const state = alertRef.current;
    if (state.token !== info.token) {
      alertRef.current = { token: info.token, near: false, called: false };
    }
    const fire = (kind) => {
      if (navigator.vibrate) navigator.vibrate(kind === "called" ? [300, 120, 300, 120, 450] : [220, 100, 220]);
      beep();
      if (settings.readAloud || kind === "called") {
        speak(
          kind === "called"
            ? t("calledTitle", { token: info.token })
            : t("nearMessage", { room: departmentRoom(department, language) })
        );
      }
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(kind === "called" ? t("calledTitle", { token: info.token }) : t("nearBanner"), {
            body: t("nearMessage", { room: departmentRoom(department, language) }),
            tag: `${info.token}-${kind}`,
          });
        } catch {
          // Some browsers only allow service-worker notifications.
        }
      }
      setSms({
        kind,
        text:
          kind === "called"
            ? t("calledNotification", { token: info.token, room: departmentRoom(department, language) })
            : t("nearMessage", { room: departmentRoom(department, language) }),
        time: new Date().toLocaleTimeString(language === "hi" ? "hi-IN" : "en-GB", { hour: "2-digit", minute: "2-digit" }),
      });
    };
    if (called && !alertRef.current.called) {
      alertRef.current.called = true;
      fire("called");
    } else if (near && !alertRef.current.near) {
      alertRef.current.near = true;
      fire("near");
    }
    // Play alerts once for each crossing, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [called, info?.token, near]);

  useEffect(() => {
    if (!info || !settings.readAloud) return;
    speak(summary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info?.status, info?.peopleAhead, settings.readAloud]);

  const enableAlerts = async () => {
    if (typeof Notification === "undefined") {
      setNotificationPermission("unsupported");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
      setSettings({ alerts: result === "granted" });
    } catch {
      setNotificationPermission("denied");
    }
  };

  if (!info || !department) {
    return (
      <OpdPage title={t("noToken")} subtitle={t("findAnother")} backTo="#/opd">
        <div className="mx-auto grid max-w-[700px] gap-3">
          <BigAction icon={ClipboardCheckIcon} title={t("homeRegister")} subtitle={t("homeRegisterSub")} tone="primary" onClick={() => navigate("#/opd/register")} />
          <BigAction icon={ScanIcon} title={t("homeSlip")} subtitle={t("homeSlipSub")} onClick={() => navigate("#/opd/slip-lookup")} />
        </div>
      </OpdPage>
    );
  }

  return (
    <OpdPage
      title={t("turnTitle")}
      subtitle={`${info.token} · ${departmentName(department, language)}`}
      backTo="#/opd"
      actions={<ListenButton text={summary} />}
    >
      <div className="mx-auto max-w-[1000px]">
        {sms && (
          <div
            role="status"
            className={`mb-4 flex items-start gap-3 border px-4 py-3.5 ${sms.kind === "called" ? "border-[#d9aca5] border-l-[3px] border-l-[#a53428] bg-[#fcf3f1]" : "border-[#e1cba9] border-l-[3px] border-l-[#a27627] bg-[#fdf9f1]"}`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${sms.kind === "called" ? "bg-[#a53428] text-white" : "bg-[#f2e3c7] text-[#8b6222]"}`}>
              {sms.kind === "called" ? <Siren size={18} strokeWidth={2} aria-hidden="true" /> : <Smartphone size={18} strokeWidth={1.8} aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8a6d3a]">{t("smsPreview")} · {sms.time}</p>
              <p className={`mt-1 text-[15px] font-semibold leading-[1.45] ${sms.kind === "called" ? "text-[#7e2f26]" : "text-[#725a2d]"}`}>
                {sms.kind === "called" ? t("calledTitle", { token: info.token }) : t("nearBanner")}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-[1.55] text-[#5f6f79]">{sms.text}</p>
            </div>
            <button type="button" onClick={() => setSms(null)} aria-label={t("close")} className="shrink-0 text-[#7c8b95] hover:text-brand"><X size={16} strokeWidth={1.8} /></button>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className={`border ${called ? "border-[#d9aca5] bg-[#fdf7f5]" : "border-[#cbdbe5] bg-white"}`}>
            <div className={`px-5 py-5 ${called ? "bg-[#a53428] text-white" : "bg-brand-deep text-white"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
                  {called ? t("calledTitle", { token: info.token }) : t("myTurnLabel")}
                </span>
                <span className="border border-white/20 bg-white/10 px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-white/80">
                  {called ? t("timeNow") : `${info.current ?? "—"} ${t("staffNowServing")}`}
                </span>
              </div>
              <p className="numeric mt-2 text-[48px] font-semibold leading-none tracking-[-0.04em] sm:text-[58px]">{info.token}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="border-l border-white/20 pl-3">
                  <p className="text-[9px] uppercase tracking-[0.09em] text-white/55">{t("yourPlace")}</p>
                  <p className="mt-1 text-[17px] font-semibold leading-[1.25]">{called ? t("timeNow") : info.peopleAhead === 0 ? t("firstAhead") : t("aheadCount", { count: info.peopleAhead })}</p>
                </div>
                <div className="border-l border-white/20 pl-3">
                  <p className="text-[9px] uppercase tracking-[0.09em] text-white/55">{t("waitEstimateLabel")}</p>
                  <p className="numeric mt-1 text-[17px] font-semibold leading-[1.25]">{called ? t("timeNow") : t("waitEstimate", { count: info.waitMinutes })}</p>
                </div>
                <div className="col-span-2 border-l border-white/20 pl-3 sm:col-span-1">
                  <p className="text-[9px] uppercase tracking-[0.09em] text-white/55">{t("nowServing")}</p>
                  <p className="numeric mt-1 text-[17px] font-semibold leading-[1.25]">{info.current ?? "—"}</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4">
              {called ? (
                <div className="border border-[#d9aca5] bg-white px-4 py-4">
                  <p className="text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#7e2f26]">
                    {t("calledTitle", { token: info.token })}
                  </p>
                  <p className="mt-1.5 text-[15px] leading-[1.6] text-[#5c6f7b]">{t("calledSub", { room: departmentRoom(department, language) })}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => navigate(`#/opd/find?to=${department.roomId}`)} className="inline-flex min-h-[52px] items-center gap-2 bg-[#a53428] px-4 text-[13px] font-semibold text-white hover:bg-[#8f2e23]">
                      <Navigation size={16} strokeWidth={2} aria-hidden="true" />
                      {t("calledDirections")}
                    </button>
                    <button type="button" onClick={() => speak(t("calledTitle", { token: info.token }))} className="inline-flex min-h-[52px] items-center gap-2 border border-[#d7e3eb] bg-white px-4 text-[13px] font-semibold text-brand hover:bg-brand-light">
                      <Volume2 size={16} strokeWidth={1.9} aria-hidden="true" />
                      {t("readAloud")}
                    </button>
                  </div>
                  <p className="mt-2 text-[11.5px] leading-[1.55] text-[#7c8b95]">{t("calledBoard")}</p>
                </div>
              ) : (
                <div>
                  <SectionTitle icon={MessageSquareText}>{t("nextStep")}</SectionTitle>
                  <p className="mt-2 text-[15px] leading-[1.7] text-[#4d6473]">
                    {near ? t("nextStepClose", { room: departmentRoom(department, language) }) : t("nextStepWait")}
                  </p>
                  {near && (
                    <div className="mt-3 flex items-start gap-2 border border-[#e1cba9] bg-[#fdf9f1] px-3 py-2.5">
                      <Bell size={16} strokeWidth={1.9} className="mt-[1px] shrink-0 text-[#906725]" aria-hidden="true" />
                      <p className="text-[12.5px] leading-[1.55] text-[#725a2d]">{t("nearBanner")} — {t("nearMessage", { room: departmentRoom(department, language) })}</p>
                    </div>
                  )}
                  <button type="button" onClick={() => navigate(`#/opd/find?to=${department.roomId}`)} className="mt-3 inline-flex min-h-[50px] items-center gap-2 bg-brand px-4 text-[13px] font-semibold text-white hover:bg-brand-deep">
                    <MapPin size={16} strokeWidth={1.9} aria-hidden="true" />
                    {t("goFindPlace")}
                  </button>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="border border-[#d7e3eb] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5ecf1] px-4 py-3">
                <SectionTitle icon={Stethoscope}>{t("doctorStatus")}</SectionTitle>
                <span className="text-[10px] text-[#8a98a2]">{departmentRoom(department, language)}</span>
              </div>
              <div className="px-4 py-3.5">
                <p className="flex items-center gap-2 text-[15px] font-semibold text-[#2e4656]">
                  <span aria-hidden="true" className={`h-2 w-2 rounded-full ${doctorStatus.mode === "available" ? "bg-[#277c55]" : doctorStatus.mode === "late" ? "bg-[#ae761f]" : "bg-[#6f7c86]"}`} />
                  {doctorStatus.mode === "available" ? t("doctorAvailable") : doctorStatus.mode === "break" ? t("doctorBreakUntil", { time: doctorStatus.breakUntil ?? "11:30" }) : t("doctorLateBy", { count: doctorStatus.lateMinutes ?? 0 })}
                </p>
                <p className="mt-1 text-[11.5px] leading-[1.55] text-[#758590]">{t("doctorFallback")}</p>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#edf2f5] pt-3">
                  <div>
                    <p className="text-[10px] text-[#7e8d97]">{t("doctor")}</p>
                    <p className="mt-0.5 text-[12px] font-medium text-[#3b5363]">{departmentDoctor(department, language)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#7e8d97]">{t("slipRoomFloor")}</p>
                    <p className="mt-0.5 text-[12px] font-medium text-[#3b5363]">{departmentRoom(department, language)} · {floorLabel(department.floor, language)}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="border border-[#d7e3eb] bg-white p-4">
              <SectionTitle icon={Bell}>{t("alertsSetting")}</SectionTitle>
              <button
                type="button"
                onClick={enableAlerts}
                disabled={notificationPermission === "unsupported"}
                className="mt-2 inline-flex min-h-[44px] w-full items-center justify-between gap-2 border border-[#cfdde7] bg-[#fbfdfe] px-3 text-[12px] font-semibold text-brand hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {notificationPermission === "granted" ? t("alertsOn") : t("enableAlerts")}
                <Bell size={15} strokeWidth={1.8} aria-hidden="true" />
              </button>
              <p className="mt-2 text-[11px] leading-[1.55] text-[#81909a]">
                {notificationPermission === "unsupported" ? t("alertsUnsupported") : t("alertsSettingHelp")}
              </p>
            </section>

            <section className="border border-[#d7e3eb] bg-[#f7fafc] p-4">
              <p className="text-[11px] leading-[1.65] text-[#6f7f89]">{t("waitFormula")}</p>
              <p className="mt-1.5 text-[10px] leading-[1.55] text-[#8a98a2]">{t("liveUpdates")}</p>
            </section>
          </aside>
        </div>
      </div>
    </OpdPage>
  );
}

function ClipboardCheckIcon({ size = 22, strokeWidth = 1.8, className }) {
  return <FileText size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
function ScanIcon({ size = 22, strokeWidth = 1.8, className }) {
  return <Camera size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}

function extractToken(raw) {
  if (!raw) return "";
  const text = String(raw).trim();
  try {
    const url = new URL(text);
    const query = new URLSearchParams(url.hash.split("?")[1] ?? url.search);
    const fromUrl = query.get("token");
    if (fromUrl) return fromUrl.toUpperCase();
  } catch {
    // Not a URL; continue with a direct token.
  }
  const match = text.match(/[A-Z]{2,4}-\d{2,4}/i);
  return match ? match[0].toUpperCase() : text.toUpperCase();
}

export function SlipLookupScreen() {
  const { t, findToken, setActiveToken, settings } = useOpd();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanNote, setScanNote] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimer = useRef(null);
  const supported = typeof window !== "undefined" && "BarcodeDetector" in window;

  const stopScan = useCallback(() => {
    if (scanTimer.current) window.clearInterval(scanTimer.current);
    scanTimer.current = null;
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stopScan(), [stopScan]);

  useEffect(() => {
    if (settings.readAloud) {
      // The page heading is announced by the page wrapper.
    }
  }, [settings.readAloud]);

  const submit = (raw = token) => {
    const value = raw.trim();
    if (!value) {
      setError(t("tokenNotFound"));
      return;
    }
    const found = findToken(value);
    if (!found) {
      setError(t("tokenNotFound"));
      return;
    }
    setError("");
    setActiveToken(found.token);
    stopScan();
    navigate(`#/opd/turn?token=${encodeURIComponent(found.token)}`);
  };

  const startCameraScan = async () => {
    if (!supported) return;
    setError("");
    setScanNote(t("scanStarting"));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      setScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      scanTimer.current = window.setInterval(async () => {
        if (!videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes?.length) {
            const raw = codes[0].rawValue ?? "";
            const next = extractToken(raw);
            setScanNote(t("scanFound"));
            submit(next);
          } else {
            setScanNote(t("scanNoCode"));
          }
        } catch {
          setScanNote(t("scanNoCode"));
        }
      }, 900);
    } catch {
      setScanNote("");
      setError(t("scanDenied"));
      stopScan();
    }
  };

  return (
    <OpdPage title={t("haveSlipTitle")} subtitle={t("haveSlipIntro")} backTo="#/opd">
      <div className="mb-3 flex justify-end">
        <ListenButton text={`${t("haveSlipTitle")}. ${t("haveSlipIntro")}`} />
      </div>
      <div className="mx-auto grid max-w-[980px] gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="border border-[#d7e3eb] bg-white p-4 sm:p-5">
          <label className="block">
            <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <FileText size={17} strokeWidth={1.8} className="text-link" aria-hidden="true" />
              {t("tokenLabel")}
            </span>
            <input
              type="text"
              value={token}
              onChange={(event) => {
                setToken(event.target.value.toUpperCase());
                setError("");
              }}
              placeholder={t("tokenPlace")}
              autoCapitalize="characters"
              autoComplete="off"
              className="mt-2 min-h-[56px] w-full border border-[#c7d6e1] bg-white px-3 text-[18px] font-semibold tracking-[0.03em] text-ink outline-none placeholder:font-normal placeholder:text-[#99a6af] focus:border-[#6f9bb8]"
            />
          </label>
          {error && (
            <p role="alert" className="mt-2 flex items-start gap-1.5 text-[12.5px] font-medium leading-[1.55] text-[#a53428]">
              <AlertTriangle size={14} strokeWidth={2} className="mt-[1px] shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          <button type="button" onClick={() => submit()} className="mt-3 inline-flex min-h-[56px] w-full items-center justify-center gap-2 bg-brand px-4 text-[14px] font-semibold text-white hover:bg-brand-deep sm:w-auto">
            <Search size={17} strokeWidth={2} aria-hidden="true" />
            {t("findToken")}
          </button>

          <div className="mt-5 border-t border-[#edf2f5] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7c8b95]">{t("scanQrLabel")}</p>
            {supported ? (
              <>
                {!scanning ? (
                  <button type="button" onClick={startCameraScan} className="mt-2 inline-flex min-h-[50px] items-center gap-2 border border-[#cfdde7] bg-white px-4 text-[13px] font-semibold text-brand hover:bg-brand-light">
                    <Camera size={17} strokeWidth={1.9} aria-hidden="true" />
                    {t("scanQr")}
                  </button>
                ) : (
                  <button type="button" onClick={stopScan} className="mt-2 inline-flex min-h-[44px] items-center gap-2 border border-[#dfb3ac] bg-[#fdf3f1] px-3 text-[12px] font-semibold text-[#963b31]">
                    <X size={15} strokeWidth={2} aria-hidden="true" />
                    {t("stopScan")}
                  </button>
                )}
                <video ref={videoRef} className={`mt-2 w-full max-w-[420px] border border-[#d7e3eb] bg-[#e8eef2] ${scanning ? "block" : "hidden"}`} muted playsInline aria-label={t("scanQr")} />
                {scanning && <p className="mt-1 text-[11.5px] text-[#6f7f89]" role="status">{scanNote}</p>}
              </>
            ) : (
              <p className="mt-2 text-[11.5px] leading-[1.55] text-[#7c8b95]">{t("scanUnsupported")}</p>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <InfoNote tone="warn">{t("homeSlipSub")}. {t("opdExplain")}</InfoNote>
          <div className="border border-[#cbdbe5] bg-brand-light p-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-link">
              <HelpCircle size={13} strokeWidth={1.9} aria-hidden="true" />
              {t("notSure")}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-[1.65] text-[#526b79]">{t("helpDeskRoute")}</p>
            <button type="button" onClick={() => navigate("#/opd/find?to=help-desk")} className="mt-3 inline-flex min-h-[44px] items-center gap-2 bg-brand px-3.5 text-[12px] font-semibold text-white hover:bg-brand-deep">
              <MapPin size={15} strokeWidth={1.9} aria-hidden="true" />
              {t("helpDeskShowWay")}
            </button>
          </div>
        </aside>
      </div>
    </OpdPage>
  );
}

export function FindPlaceScreen() {
  const {
    t,
    language,
    settings,
    setSettings,
    activeQueueInfo,
    routeBetween,
    routeToHelp,
    placeById: getPlace,
  } = useOpd();
  const { speak } = useSpeech();
  const mapRef = useRef(null);
  const activeDept = activeQueueInfo ? departmentById(activeQueueInfo.deptId) : null;
  const queryTo = queryParam("to");
  const queryLost = queryParam("lost");
  const [fromId, setFromId] = useState(activeDept?.roomId ?? "main-entrance");
  const [toId, setToId] = useState(queryTo && getPlace(queryTo) ? queryTo : "help-desk");
  const [avoidStairs, setAvoidStairs] = useState(settings.avoidStairs || settings.assistedMode);
  const [search, setSearch] = useState("");
  const [lostMode, setLostMode] = useState(queryLost === "1");
  const [activeFloor, setActiveFloor] = useState(getPlace(activeDept?.roomId ?? "main-entrance").floor);

  useEffect(() => {
    if (queryTo && getPlace(queryTo)) {
      setToId(queryTo);
      setActiveFloor(getPlace(queryTo).floor);
    }
    if (queryLost === "1") setLostMode(true);
  }, [getPlace, queryLost, queryTo]);

  const lostRoute = useMemo(
    () => (lostMode ? routeToHelp(fromId, avoidStairs) : null),
    [avoidStairs, fromId, lostMode, routeToHelp]
  );

  const intendedPlace = getPlace(toId);
  const destinationId = lostMode ? lostRoute?.destination?.id ?? "help-desk" : toId;
  const route = useMemo(
    () => routeBetween(fromId, destinationId, avoidStairs),
    [avoidStairs, destinationId, fromId, routeBetween]
  );
  const fromPlace = getPlace(fromId);
  const toPlace = getPlace(destinationId);
  const filteredPlaces = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = term
      ? places.filter((place) => {
          const en = `${place.name.en} ${place.landmark.en}`.toLowerCase();
          const hi = `${place.name.hi} ${place.landmark.hi}`.toLowerCase();
          return en.includes(term) || hi.includes(term);
        })
      : places;
    return [...list].sort((a, b) => a.floor - b.floor || a.name[language].localeCompare(b.name[language]));
  }, [language, search]);
  const routeFloors = useMemo(() => {
    if (!route) return [fromPlace.floor];
    return [...new Set(route.nodes.map((id) => getPlace(id).floor))].sort((a, b) => a - b);
  }, [fromPlace.floor, getPlace, route]);

  const instructionText = route?.steps?.map((step) => step.text).join(" ") ?? t("noRoute");

  const toggleLost = () => {
    setLostMode(true);
    setSearch("");
    setActiveFloor(getPlace("help-desk").floor);
  };

  const updateAvoidStairs = (next) => {
    setAvoidStairs(next);
    setSettings({ avoidStairs: next });
  };

  const makeCardText = () =>
    `${t("lostDestination")}: ${toPlace.name.hi} (${toPlace.name.en}). ${toPlace.landmark.hi} / ${toPlace.landmark.en}. ${t("hospitalName")}.`;

  return (
    <OpdPage
      title={lostMode ? t("lostTitle") : t("findTitle")}
      subtitle={t("findIntro")}
      backTo="#/opd"
      actions={
        <div className="flex gap-2">
          <ListenButton text={instructionText} label={t("listenSteps")} compact />
          <button type="button" onClick={toggleLost} className="inline-flex min-h-[38px] items-center gap-1.5 border border-[#e0b6b0] bg-[#fdf3f1] px-3 text-[12px] font-semibold text-[#963b31] hover:bg-[#fbe9e6]">
            <AlertTriangle size={14} strokeWidth={1.9} aria-hidden="true" />
            {t("lost")}
          </button>
        </div>
      }
    >
      <div className="mx-auto grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <section className="space-y-4">
          <div className="border border-[#d7e3eb] bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6f818d]">{t("fromLabel")}</span>
                <select value={fromId} onChange={(event) => { setFromId(event.target.value); setActiveFloor(getPlace(event.target.value).floor); }} className="mt-1.5 min-h-[46px] w-full border border-[#c7d6e1] bg-white px-2.5 text-[13px] text-ink outline-none focus:border-[#6f9bb8]">
                  {places.map((place) => (
                    <option key={place.id} value={place.id}>{place.name[language]} · {floorLabel(place.floor, language)}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6f818d]">{t("toLabel")}</span>
                <select value={toId} onChange={(event) => { setToId(event.target.value); setLostMode(false); setActiveFloor(getPlace(event.target.value).floor); }} className="mt-1.5 min-h-[46px] w-full border border-[#c7d6e1] bg-white px-2.5 text-[13px] text-ink outline-none focus:border-[#6f9bb8]">
                  {places.map((place) => (
                    <option key={place.id} value={place.id}>{place.name[language]} · {floorLabel(place.floor, language)}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-3 block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6f818d]">{t("searchPlace")}</span>
              <div className="relative mt-1.5">
                <Search size={15} strokeWidth={1.9} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7f909c]" aria-hidden="true" />
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("searchPlace")} className="min-h-[46px] w-full border border-[#c7d6e1] bg-white pl-9 pr-3 text-[13px] text-ink outline-none placeholder:text-[#99a6af] focus:border-[#6f9bb8]" />
              </div>
            </label>
            {search && (
              <div className="mt-2 max-h-[220px] overflow-y-auto border border-[#e2ebf0]">
                {filteredPlaces.length === 0 ? (
                  <p className="px-3 py-3 text-[12px] text-[#7c8b95]">{t("noPlaces")}</p>
                ) : filteredPlaces.map((place) => (
                  <button key={place.id} type="button" onClick={() => { setToId(place.id); setLostMode(false); setActiveFloor(place.floor); setSearch(""); }} className="flex min-h-[42px] w-full items-center justify-between gap-3 border-b border-[#edf2f5] px-3 py-2 text-left text-[12px] last:border-b-0 hover:bg-[#f7fafc]">
                    <span className="font-medium text-[#324b5b]">{place.name[language]}</span>
                    <span className="text-[10px] text-[#8997a1]">{floorLabel(place.floor, language)}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  mapRef.current?.focus({ preventScroll: true });
                }}
                className="inline-flex min-h-[46px] items-center gap-2 bg-brand px-4 text-[12.5px] font-semibold text-white hover:bg-brand-deep"
              >
                <Navigation size={16} strokeWidth={1.9} aria-hidden="true" />
                {t("showRoute")}
              </button>
              <span className="text-[11px] text-[#71828d]">{t("routeHelp")}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf2f5] pt-3">
              <label className="flex min-h-[44px] cursor-pointer items-center gap-2">
                <button type="button" role="switch" aria-checked={avoidStairs} aria-label={t("avoidStairs")} onClick={() => updateAvoidStairs(!avoidStairs)} className={`relative h-[26px] w-[46px] rounded-full border ${avoidStairs ? "border-brand bg-brand" : "border-[#bccbd5] bg-[#dbe5eb]"}`}>
                  <span className={`absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-[left] ${avoidStairs ? "left-[22px]" : "left-[2px]"}`} />
                </button>
                <span>
                  <span className="block text-[12px] font-semibold text-[#334d5d]">{t("avoidStairs")}</span>
                  <span className="block text-[10px] text-[#7d8c96]">{t("avoidStairsHelp")}</span>
                </span>
              </label>
              <span className="flex items-center gap-1.5 text-[10.5px] text-[#687b87]">
                <Accessibility size={13} strokeWidth={1.8} aria-hidden="true" />
                {t("liftNote")}
              </span>
            </div>
          </div>

          <div ref={mapRef} tabIndex={-1} className="border border-[#d7e3eb] bg-white outline-none">
            <div className="flex flex-col justify-between gap-2 border-b border-[#e5ecf1] px-4 py-3 sm:flex-row sm:items-center">
              <div>
                <SectionTitle icon={MapPin}>{t("routeTo", { place: toPlace.name[language] })}</SectionTitle>
                <p className="mt-1 text-[12px] text-[#6c7e89]">{t("routeOnFloor")}</p>
              </div>
              <FloorTabs floors={routeFloors.length ? routeFloors : [0, 1, 2]} active={activeFloor} onChange={setActiveFloor} />
            </div>
            <div className="p-3">
              <HospitalFloorPlan
                floor={activeFloor}
                path={route}
                currentId={fromId}
                destinationId={destinationId}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e5ecf1] bg-[#fbfcfd] px-4 py-2.5 text-[11.5px] text-[#627682]">
              <span className="flex items-center gap-1.5"><Navigation size={13} strokeWidth={1.8} aria-hidden="true" /> {route ? t("routeDistance", { count: route.distance }) : t("noRoute")}</span>
              <span className="flex items-center gap-1.5"><Clock3 size={13} strokeWidth={1.8} aria-hidden="true" /> {route ? t("routeTime", { count: route.minutes }) : "—"}</span>
              {avoidStairs && <span className="flex items-center gap-1.5 font-medium text-[#2e6b50]"><Accessibility size={13} strokeWidth={1.9} aria-hidden="true" /> {t("stepFree")}</span>}
            </div>
          </div>

          <div className="border border-[#d7e3eb] bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-[#e5ecf1] px-4 py-3">
              <SectionTitle icon={Navigation}>{t("stepByStep")}</SectionTitle>
              <ListenButton text={instructionText} label={t("listenSteps")} compact />
            </div>
            {route ? (
              <ol className="divide-y divide-[#edf2f5]">
                {route.steps.map((step, index) => (
                  <li key={`${step.kind}-${index}-${step.text.slice(0, 10)}`} className="flex items-start gap-3 px-4 py-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center border text-[10.5px] font-semibold ${step.kind === "stairs" ? "border-[#e1cba9] bg-[#fdf9f1] text-[#8a6323]" : step.kind === "arrive" ? "border-brand bg-brand text-white" : "border-[#d6e2e9] bg-[#f7fafc] text-[#657985]"}`}>
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-[1.6] text-[#334c5c]">{step.text}</p>
                      <p className="mt-0.5 text-[9.5px] uppercase tracking-[0.06em] text-[#8b98a2]">{floorLabel(step.floor, language)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="p-4">
                <InfoNote tone="warn">{t("noRoute")}</InfoNote>
              </div>
            )}
            <div className="border-t border-[#e5ecf1] bg-[#fbfcfd] px-4 py-2.5">
              <p className="flex items-start gap-1.5 text-[10.5px] leading-[1.55] text-[#7d8c96]">
                <HelpCircle size={12} strokeWidth={1.8} className="mt-[1px] shrink-0" aria-hidden="true" />
                {t("routeHelp")}
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="border border-[#c9deea] bg-brand-light p-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-link">
              <MapPin size={14} strokeWidth={1.9} aria-hidden="true" />
              {t("lostCard")}
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#708691]">{t("lostDestination")}</p>
            <p className="mt-1 text-[20px] font-semibold leading-[1.25] text-brand-deep">{intendedPlace.name[language]}</p>
            <p className="mt-0.5 text-[12px] text-[#5b7381]">{intendedPlace.landmark[language]}</p>
            <div className="mt-3 border-t border-[#bed5e3] pt-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#708691]">{t("lostEnglish")}</p>
              <p className="mt-1 text-[15px] font-semibold leading-[1.35] text-[#2d4656]">{intendedPlace.name.en}</p>
              <p className="mt-0.5 text-[11px] text-[#647985]">{intendedPlace.landmark.en}</p>
            </div>
            {lostMode && (
              <p className="mt-2 border-t border-[#bed5e3] pt-2 text-[10.5px] leading-[1.55] text-[#526b79]">
                {t("lostTitle")}: {lostRoute?.destination?.name?.[language] ?? t("help-desk")}
              </p>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#687d89]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[9px] font-semibold text-brand">OPD</span>
              {t("hospitalName")} · {floorLabel(intendedPlace.floor, language)}
            </p>
          </section>

          {lostMode && lostRoute?.path ? (
            <section className="border border-[#e1cba9] bg-[#fdf9f1] p-4">
              <SectionTitle icon={HelpCircle}>{t("lostTitle")}</SectionTitle>
              <p className="mt-2 text-[12px] leading-[1.6] text-[#6e5a34]">
                {t("routeDistance", { count: lostRoute.path.distance })} · {t("routeTime", { count: lostRoute.path.minutes })}
              </p>
              <button type="button" onClick={() => speak(lostRoute.path.steps.map((step) => step.text).join(" "))} className="mt-2 inline-flex min-h-[42px] items-center gap-2 border border-[#d9c19a] bg-white px-3 text-[11.5px] font-semibold text-[#725a2d]">
                <Volume2 size={14} strokeWidth={1.9} aria-hidden="true" />
                {t("listenSteps")}
              </button>
            </section>
          ) : (
            <button type="button" onClick={toggleLost} className="flex min-h-[58px] w-full items-center justify-between gap-3 border border-[#e0b6b0] bg-[#fdf3f1] px-4 text-left text-[13px] font-semibold text-[#963b31] hover:bg-[#fbe9e6]">
              <span className="flex items-center gap-2"><LocateFixed size={16} strokeWidth={1.9} aria-hidden="true" />{t("lost")}</span>
              <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
            </button>
          )}

          <button type="button" onClick={() => speak(makeCardText())} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 border border-[#cfdde7] bg-white px-3 text-[12px] font-semibold text-brand hover:bg-brand-light">
            <Headphones size={15} strokeWidth={1.9} aria-hidden="true" />
            {t("readAloud")}
          </button>
        </aside>
      </div>
    </OpdPage>
  );
}

export function EmergencyScreen() {
  const {
    t,
    language,
    settings,
    activeQueueInfo,
    routeBetween,
    routeToHelp,
  } = useOpd();
  const { speak } = useSpeech();
  const mapRef = useRef(null);
  const activeDept = activeQueueInfo ? departmentById(activeQueueInfo.deptId) : null;
  const fromId = activeDept?.roomId ?? "main-entrance";
  const fromPlace = placeById(fromId);
  const route = useMemo(
    () => routeBetween(fromId, "emergency", true) ?? routeBetween(fromId, "emergency", false),
    [fromId, routeBetween]
  );
  const destination = placeById("emergency");
  const [floor, setFloor] = useState(0);
  const summary = `${t("emergency")}. ${t("emergencyGoNow")} ${t("emergencyNoToken")} ${t("emergencyCall112")} ${t("emergencyCall108")}`;
  const signs = ["signChestPain", "signBreathing", "signBleeding", "signFainting", "signWeakness", "signInjury", "signPregnancy", "signChild"];
  const stepText = route?.steps.map((step) => step.text).join(" ") ?? "";
  const routeFloors = route ? [...new Set(route.nodes.map((id) => placeById(id).floor))] : [0];

  useEffect(() => {
    if (settings.readAloud) speak(summary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.readAloud]);

  return (
    <OpdPage
      title={t("emergencySignsTitle")}
      subtitle={t("emergencySignsIntro")}
      backTo="#/opd"
      actions={<ListenButton text={`${summary} ${stepText}`} />}
    >
      <div className="mx-auto grid max-w-[1100px] gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <section className="border border-[#d9aaa3] bg-[#fdf3f1]">
            <div className="bg-[#a53428] px-5 py-4 text-white">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-white/75">
                <Siren size={14} strokeWidth={2.2} aria-hidden="true" />
                {t("emergency")}
              </p>
              <h2 className="mt-1 text-[24px] font-semibold leading-[1.2]">{t("emergencyHelp")}</h2>
              <p className="mt-1.5 text-[14px] leading-[1.65] text-white/85">{t("emergencyGoNow")}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[16px] font-semibold text-[#7e2f26]">{t("emergencyNoToken")}</p>
              <p className="mt-1 text-[13px] leading-[1.65] text-[#82534c]">
                {t("emergencyStaffNote")}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <a href="tel:112" className="inline-flex min-h-[56px] items-center justify-between gap-3 bg-[#a53428] px-4 text-[15px] font-semibold text-white hover:bg-[#8f2e23]">
                  <span className="flex items-center gap-2"><Phone size={18} strokeWidth={2} aria-hidden="true" />112</span>
                  <span className="text-[11px] font-medium">{t("emergencyCall112")}</span>
                </a>
                <a href="tel:108" className="inline-flex min-h-[56px] items-center justify-between gap-3 border border-[#b8837c] bg-white px-4 text-[15px] font-semibold text-[#8f352b] hover:bg-[#fdf3f1]">
                  <span className="flex items-center gap-2"><Phone size={18} strokeWidth={2} aria-hidden="true" />108</span>
                  <span className="text-[11px] font-medium">{t("emergencyCall108")}</span>
                </a>
              </div>
            </div>
          </section>

          <section className="border border-[#d7e3eb] bg-white p-4">
            <SectionTitle icon={AlertTriangle}>{t("emergencySignsTitle")}</SectionTitle>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {signs.map((key) => (
                <li key={key} className="flex items-start gap-2 border border-[#e9d4d0] bg-[#fefaf9] px-3 py-2.5 text-[13px] leading-[1.45] text-[#6f423c]">
                  <span aria-hidden="true" className="mt-[6px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#a53428]" />
                  {t(key)}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="border border-[#d7e3eb] bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-[#e5ecf1] px-4 py-3">
              <SectionTitle icon={MapPin}>{t("routeTo", { place: destination.name[language] })}</SectionTitle>
              <FloorTabs floors={routeFloors} active={floor} onChange={setFloor} />
            </div>
            <div className="p-3">
              <HospitalFloorPlan
                floor={floor}
                path={route}
                currentId={fromId}
                destinationId="emergency"
              />
            </div>
            <div className="border-t border-[#e5ecf1] bg-[#fbfcfd] px-4 py-2.5 text-[11.5px] text-[#667a86]">
              {route ? `${t("routeDistance", { count: route.distance })} · ${t("routeTime", { count: route.minutes })}` : t("noRoute")}
            </div>
          </section>

          <section className="border border-[#d7e3eb] bg-white p-4">
            <SectionTitle icon={Navigation}>{t("stepByStep")}</SectionTitle>
            <p className="mt-2 text-[12px] leading-[1.65] text-[#526976]">
              {t("emergencyGoNow")}
            </p>
            {route?.steps?.map((step, index) => (
              <p key={`${index}-${step.text.slice(0, 8)}`} className="mt-2 flex items-start gap-2 text-[12px] leading-[1.55] text-[#425d6d]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#a53428] text-[9px] font-semibold text-white">{index + 1}</span>
                {step.text}
              </p>
            ))}
            <button type="button" onClick={() => speak(stepText)} className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 border border-[#cfdde7] bg-[#fbfdfe] px-3 text-[12px] font-semibold text-brand">
              <Volume2 size={15} strokeWidth={1.9} aria-hidden="true" />
              {t("readAloud")}
            </button>
          </section>

          <InfoNote tone="danger" icon={Siren}>
            <strong className="block">{t("emergencyNoToken")}</strong>
            <span className="mt-1 block">{t("emergencyStaffNote")}</span>
          </InfoNote>

          <div className="border border-[#cbdbe5] bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#70818d]">{t("lostCard")}</p>
            <p className="mt-1.5 text-[15px] font-semibold leading-[1.4] text-[#2b4555]">{fromPlace.name[language]} → {destination.name[language]}</p>
            <p className="mt-1 text-[11.5px] leading-[1.55] text-[#768692]">{destination.landmark[language]}</p>
            <p className="mt-2 border-t border-[#edf2f5] pt-2 text-[11px] leading-[1.55] text-[#768692]">
              <b className="text-[#3d5463]">{destination.name.en}</b> · {destination.landmark.en}
            </p>
          </div>
        </aside>
      </div>
    </OpdPage>
  );
}
