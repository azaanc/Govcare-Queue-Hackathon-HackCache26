import { useEffect, useState } from "react";
import { useOpd } from "./OpdProvider.jsx";
import { LanguageGate } from "./OpdUI.jsx";
import {
  PatientHome,
  RegisterScreen,
  SettingsPage,
  SlipScreen,
} from "./PatientCore.jsx";
import {
  EmergencyScreen,
  FindPlaceScreen,
  MyTurnScreen,
  SlipLookupScreen,
} from "./PatientGuidance.jsx";
import {
  BoardScreen,
  RegistrationCounterScreen,
  StaffDashboardScreen,
} from "./StaffBoard.jsx";

export function parseOpdRoute(hash = window.location.hash) {
  const clean = (hash || "").replace(/^#\/?/, "");
  const [path] = clean.split("?");
  return path.replace(/\/+$/, "");
}

export function OpdRoutes({ forcedRoute = null }) {
  const { settings } = useOpd();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  useEffect(() => {
    setHash(window.location.hash);
  }, [forcedRoute]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [hash, forcedRoute]);

  const route = forcedRoute ?? parseOpdRoute(hash);

  useEffect(() => {
    document.title =
      route === "board"
        ? "OPD Waiting Board — OPD Saathi"
        : route.includes("staff") || route.includes("counter")
          ? "Staff Dashboard — OPD Saathi"
          : "OPD Saathi — City District Hospital";
  }, [route]);

  if (route === "board") return <BoardScreen />;
  if (route === "staff" || route === "opd/staff") return <StaffDashboardScreen />;
  if (route === "staff/counter" || route === "opd/counter") return <RegistrationCounterScreen />;
  if (route === "opd/settings") return <SettingsPage />;

  let screen = <PatientHome />;
  if (route === "opd/register") screen = <RegisterScreen />;
  else if (route === "opd/slip") screen = <SlipScreen />;
  else if (route === "opd/turn") screen = <MyTurnScreen />;
  else if (route === "opd/slip-lookup") screen = <SlipLookupScreen />;
  else if (route === "opd/find") screen = <FindPlaceScreen />;
  else if (route === "opd/emergency") screen = <EmergencyScreen />;

  return (
    <>
      {screen}
      {route.startsWith("opd") && route !== "opd/emergency" && <LanguageGate />}
      <span className="sr-only" aria-live="polite">
        {settings.language === "hi" ? "भाषा हिंदी में है" : "Language is English"}
      </span>
    </>
  );
}

export function OpdSettingsStandalone() {
  return <SettingsPage />;
}
