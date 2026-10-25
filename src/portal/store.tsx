import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "de" | "fr";
export type DepartmentId =
  | "opd"
  | "cardiology"
  | "pediatrics"
  | "laboratory"
  | "pharmacy"
  | "radiology";
export type Severity = "routine" | "urgent" | "critical";
export type StaffRole = "doctor" | "admin";

export type Department = {
  id: DepartmentId;
  name: string;
  shortName: string;
  prefix: string;
  room: string;
  floor: number;
  wing: string;
  baselineDoctors: number;
  doctors: number;
  consultMinutes: number;
};

export type QueuePatient = {
  token: string;
  tokenNumber: number;
  deptId: DepartmentId;
  name: string;
  age: number;
  severity: Severity;
  checkedIn: string;
  source: "Walk-in" | "Appointment" | "En route";
  phone?: string;
  symptoms?: string;
  insurance?: string;
  isPortalUser?: boolean;
};

export type PatientProfile = {
  name: string;
  age: number;
  phone: string;
  insuranceProvider: string;
  policyNumber: string;
  language: Language;
  appointmentCode: string;
};

export type PatientToken = {
  token: string;
  tokenNumber: number;
  deptId: DepartmentId;
  severity: Severity;
  completed?: boolean;
};

export type NotificationKind = "sms" | "delay" | "emergency" | "info";

export type NotificationItem = {
  id: number;
  kind: NotificationKind;
  title: string;
  message: string;
  time: string;
  token?: string;
};

export type CriticalAlert = {
  id: string;
  code: string;
  summary: string;
  location: string;
  eta: string;
  deptId: DepartmentId;
  acknowledged: boolean;
  received: string;
};

export type StaffSession = {
  role: StaffRole;
  name: string;
  deptId: DepartmentId;
};

export type GenerateTokenInput = {
  name: string;
  age: number;
  phone: string;
  deptId: DepartmentId;
  symptoms: string;
  emergency: boolean;
  severity: Severity;
  insuranceProvider: string;
  policyNumber: string;
  appointmentCode: string;
};

export type DepartmentSnapshot = {
  department: Department;
  queued: QueuePatient[];
  position: number;
  waitMinutes: number;
  status: "normal" | "busy" | "critical";
  delay: number;
  nowServing: string;
  completed: boolean;
};

type HospitalContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  departments: Department[];
  queue: QueuePatient[];
  nowServing: Record<DepartmentId, number>;
  delays: Record<DepartmentId, number>;
  activeToken: PatientToken | null;
  profile: PatientProfile;
  notifications: NotificationItem[];
  criticalAlerts: CriticalAlert[];
  toast: NotificationItem | null;
  staff: StaffSession | null;
  getDepartment: (id: DepartmentId) => Department;
  getQueueFor: (id: DepartmentId) => QueuePatient[];
  getSnapshot: (id: DepartmentId) => DepartmentSnapshot;
  activeSnapshot: DepartmentSnapshot;
  generateToken: (input: GenerateTokenInput) => PatientToken;
  callNext: (deptId: DepartmentId, token?: string) => QueuePatient | null;
  markEmergency: (token: string) => void;
  reportDelay: (deptId: DepartmentId, minutes?: number) => void;
  reassignDoctor: (deptId: DepartmentId) => void;
  acknowledgeAlert: (id: string) => void;
  pushAlert: (alert: Omit<CriticalAlert, "id" | "acknowledged" | "received">) => void;
  dismissToast: () => void;
  signIn: (username: string, password: string, role: StaffRole) => boolean;
  signOut: () => void;
  resetDemo: () => void;
};

const initialDepartments: Department[] = [
  {
    id: "opd",
    name: "General OPD",
    shortName: "OPD",
    prefix: "G",
    room: "A-102",
    floor: 1,
    wing: "Wing A",
    baselineDoctors: 2,
    doctors: 2,
    consultMinutes: 9,
  },
  {
    id: "cardiology",
    name: "Cardiology",
    shortName: "Cardiology",
    prefix: "C",
    room: "C-204",
    floor: 2,
    wing: "Wing C",
    baselineDoctors: 1,
    doctors: 1,
    consultMinutes: 12,
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    shortName: "Pediatrics",
    prefix: "P",
    room: "A-210",
    floor: 2,
    wing: "Wing A",
    baselineDoctors: 2,
    doctors: 2,
    consultMinutes: 8,
  },
  {
    id: "laboratory",
    name: "Laboratory",
    shortName: "Laboratory",
    prefix: "L",
    room: "B-G04",
    floor: 0,
    wing: "Wing B",
    baselineDoctors: 3,
    doctors: 3,
    consultMinutes: 6,
  },
  {
    id: "pharmacy",
    name: "Pharmacy",
    shortName: "Pharmacy",
    prefix: "PH",
    room: "A-G08",
    floor: 0,
    wing: "Wing A",
    baselineDoctors: 2,
    doctors: 2,
    consultMinutes: 5,
  },
  {
    id: "radiology",
    name: "Radiology",
    shortName: "Radiology",
    prefix: "R",
    room: "B-101",
    floor: 1,
    wing: "Wing B",
    baselineDoctors: 1,
    doctors: 1,
    consultMinutes: 14,
  },
];

const initialQueue: QueuePatient[] = [
  { token: "G-39", tokenNumber: 39, deptId: "opd", name: "Rohan Verma", age: 31, severity: "routine", checkedIn: "08:12", source: "Walk-in" },
  { token: "G-40", tokenNumber: 40, deptId: "opd", name: "Anita Rao", age: 68, severity: "routine", checkedIn: "08:16", source: "Appointment" },
  { token: "G-41", tokenNumber: 41, deptId: "opd", name: "Daniel Fernandes", age: 45, severity: "routine", checkedIn: "08:19", source: "Walk-in" },
  {
    token: "G-42",
    tokenNumber: 42,
    deptId: "opd",
    name: "Maya Sharma",
    age: 34,
    severity: "routine",
    checkedIn: "08:22",
    source: "Appointment",
    phone: "07700 900 421",
    symptoms: "Persistent fatigue and low blood pressure",
    insurance: "National Health Scheme",
    isPortalUser: true,
  },
  { token: "G-43", tokenNumber: 43, deptId: "opd", name: "Ibrahim Khan", age: 57, severity: "routine", checkedIn: "08:26", source: "Walk-in" },
  { token: "C-11", tokenNumber: 11, deptId: "cardiology", name: "Helena Bossi", age: 63, severity: "routine", checkedIn: "08:07", source: "Appointment" },
  { token: "C-12", tokenNumber: 12, deptId: "cardiology", name: "Arun Lal", age: 51, severity: "routine", checkedIn: "08:21", source: "Appointment" },
  { token: "C-13", tokenNumber: 13, deptId: "cardiology", name: "Sofia Marín", age: 47, severity: "urgent", checkedIn: "08:25", source: "Walk-in" },
  { token: "P-21", tokenNumber: 21, deptId: "pediatrics", name: "Leo Weber", age: 6, severity: "routine", checkedIn: "08:10", source: "Appointment" },
  { token: "P-22", tokenNumber: 22, deptId: "pediatrics", name: "Nora Ali", age: 9, severity: "routine", checkedIn: "08:18", source: "Appointment" },
  { token: "P-23", tokenNumber: 23, deptId: "pediatrics", name: "Samir Das", age: 4, severity: "routine", checkedIn: "08:24", source: "Walk-in" },
  { token: "L-31", tokenNumber: 31, deptId: "laboratory", name: "Grace Tan", age: 39, severity: "routine", checkedIn: "08:02", source: "Walk-in" },
  { token: "L-32", tokenNumber: 32, deptId: "laboratory", name: "Peter Kovač", age: 62, severity: "routine", checkedIn: "08:09", source: "Appointment" },
  { token: "L-33", tokenNumber: 33, deptId: "laboratory", name: "Amara Okafor", age: 28, severity: "routine", checkedIn: "08:14", source: "Walk-in" },
  { token: "L-34", tokenNumber: 34, deptId: "laboratory", name: "Noah Fischer", age: 44, severity: "routine", checkedIn: "08:20", source: "Appointment" },
  { token: "PH-41", tokenNumber: 41, deptId: "pharmacy", name: "Elena Weber", age: 72, severity: "routine", checkedIn: "07:58", source: "Walk-in" },
  { token: "PH-42", tokenNumber: 42, deptId: "pharmacy", name: "Rahul Mehta", age: 36, severity: "routine", checkedIn: "08:03", source: "Appointment" },
  { token: "PH-43", tokenNumber: 43, deptId: "pharmacy", name: "Fatima Noor", age: 54, severity: "routine", checkedIn: "08:06", source: "Walk-in" },
  { token: "PH-44", tokenNumber: 44, deptId: "pharmacy", name: "Jonas Keller", age: 29, severity: "routine", checkedIn: "08:11", source: "Walk-in" },
  { token: "PH-45", tokenNumber: 45, deptId: "pharmacy", name: "Mina Park", age: 61, severity: "routine", checkedIn: "08:15", source: "Appointment" },
  { token: "PH-46", tokenNumber: 46, deptId: "pharmacy", name: "Owen Price", age: 48, severity: "routine", checkedIn: "08:18", source: "Walk-in" },
  { token: "PH-47", tokenNumber: 47, deptId: "pharmacy", name: "Sana Iqbal", age: 33, severity: "routine", checkedIn: "08:23", source: "Walk-in" },
  { token: "R-15", tokenNumber: 15, deptId: "radiology", name: "Lucia Romano", age: 59, severity: "routine", checkedIn: "08:05", source: "Appointment" },
  { token: "R-16", tokenNumber: 16, deptId: "radiology", name: "Victor Chen", age: 66, severity: "routine", checkedIn: "08:12", source: "Appointment" },
  { token: "R-17", tokenNumber: 17, deptId: "radiology", name: "Hannah Wolf", age: 41, severity: "routine", checkedIn: "08:19", source: "Walk-in" },
  { token: "R-18", tokenNumber: 18, deptId: "radiology", name: "Yusuf Demir", age: 52, severity: "routine", checkedIn: "08:24", source: "Appointment" },
];

const nowServingInitial: Record<DepartmentId, number> = {
  opd: 38,
  cardiology: 10,
  pediatrics: 20,
  laboratory: 30,
  pharmacy: 40,
  radiology: 14,
};

const initialAlerts: CriticalAlert[] = [
  {
    id: "alert-stroke",
    code: "CODE STROKE",
    summary: "Suspected acute stroke · FAST positive · pre-registered",
    location: "Ambulance bay · East entrance",
    eta: "4 min",
    deptId: "cardiology",
    acknowledged: false,
    received: "08:24",
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: 2,
    kind: "info",
    title: "Your appointment is confirmed",
    message: "General OPD · Dr. Anika Mehta · Today, 09:00",
    time: "08:22",
  },
  {
    id: 1,
    kind: "delay",
    title: "Queue moving normally",
    message: "General OPD is currently serving token G-38. No delays reported.",
    time: "08:20",
  },
];

const initialProfile: PatientProfile = {
  name: "Maya Sharma",
  age: 34,
  phone: "07700 900 421",
  insuranceProvider: "National Health Scheme",
  policyNumber: "NHS-884-2019",
  language: "en",
  appointmentCode: "OPD-0900-42",
};

const activeInitial: PatientToken = { token: "G-42", tokenNumber: 42, deptId: "opd", severity: "routine" };

const staffCredentials: Record<StaffRole, { username: string; password: string; name: string; deptId: DepartmentId }> = {
  doctor: { username: "doctor", password: "govcare26", name: "Dr. Anika Mehta", deptId: "opd" },
  admin: { username: "admin", password: "govcare26", name: "Hospital Administrator", deptId: "opd" },
};

const HospitalContext = createContext<HospitalContextValue | null>(null);
const severityRank: Record<Severity, number> = { critical: 0, urgent: 1, routine: 2 };

export function HospitalProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [queue, setQueue] = useState<QueuePatient[]>(initialQueue);
  const [nowServing, setNowServing] = useState<Record<DepartmentId, number>>(nowServingInitial);
  const [delays, setDelays] = useState<Record<DepartmentId, number>>({
    opd: 0,
    cardiology: 0,
    pediatrics: 0,
    laboratory: 0,
    pharmacy: 10,
    radiology: 0,
  });
  const [activeToken, setActiveToken] = useState<PatientToken | null>(activeInitial);
  const [profile, setProfile] = useState<PatientProfile>(initialProfile);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>(initialAlerts);
  const [toast, setToast] = useState<NotificationItem | null>(null);
  const [staff, setStaff] = useState<StaffSession | null>(null);
  const notificationId = useRef(3);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((item: NotificationItem) => {
    setToast(item);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 6200);
  }, []);

  const addNotification = useCallback(
    (item: Omit<NotificationItem, "id" | "time">) => {
      const entry: NotificationItem = {
        ...item,
        id: notificationId.current++,
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      };
      setNotifications((previous) => [entry, ...previous].slice(0, 12));
      showToast(entry);
      return entry;
    },
    [showToast]
  );

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    setProfile((previous) => ({ ...previous, language: next }));
  }, []);

  const getDepartment = useCallback(
    (id: DepartmentId) => departments.find((department) => department.id === id) ?? departments[0],
    [departments]
  );

  const getQueueFor = useCallback(
    (id: DepartmentId) =>
      queue
        .filter((patient) => patient.deptId === id)
        .sort(
          (a, b) =>
            severityRank[a.severity] - severityRank[b.severity] ||
            a.tokenNumber - b.tokenNumber
        ),
    [queue]
  );

  const getSnapshot = useCallback(
    (id: DepartmentId): DepartmentSnapshot => {
      const department = getDepartment(id);
      const queued = getQueueFor(id);
      const isActiveDepartment = activeToken?.deptId === id;
      const activeIndex = isActiveDepartment
        ? queued.findIndex((patient) => patient.token === activeToken?.token)
        : -1;
      const completed = Boolean(isActiveDepartment && activeToken?.completed);
      const isCalled = isActiveDepartment && !completed && activeIndex < 0;
      const position = isActiveDepartment && activeIndex >= 0 ? activeIndex + 1 : 0;
      const severityWeight = (severity: Severity) =>
        severity === "critical" ? 3.4 : severity === "urgent" ? 1.8 : 1;
      const relevantPatients =
        isActiveDepartment && activeIndex >= 0 ? queued.slice(0, activeIndex + 1) : queued;
      const weightedJobs = Math.max(
        1,
        relevantPatients.reduce((total, patient) => total + severityWeight(patient.severity), 0)
      );
      const activeSeverityFactor = isActiveDepartment
        ? activeToken?.severity === "critical"
          ? 0.55
          : activeToken?.severity === "urgent"
            ? 0.8
            : 1
        : 1;
      const velocity = Math.max(1, department.doctors);
      const predictiveWait = isCalled
        ? 0
        : Math.round((department.consultMinutes / velocity) * weightedJobs * activeSeverityFactor);
      const delay = delays[id] ?? 0;
      const waitMinutes = isCalled ? 0 : Math.max(2, predictiveWait + delay);
      const status: DepartmentSnapshot["status"] =
        queued.length >= 7 || waitMinutes >= 34
          ? "critical"
          : queued.length >= 4 || waitMinutes >= 18
            ? "busy"
            : "normal";
      return {
        department,
        queued,
        position,
        waitMinutes,
        status,
        delay,
        nowServing: `${department.prefix}-${nowServing[id]}`,
        completed,
      };
    },
    [activeToken, delays, getDepartment, getQueueFor, nowServing]
  );

  const getActiveSnapshot = useCallback((): DepartmentSnapshot => {
    if (!activeToken) return getSnapshot("opd");
    return getSnapshot(activeToken.deptId);
  }, [activeToken, getSnapshot]);

  const generateToken = useCallback(
    (input: GenerateTokenInput) => {
      const department = getDepartment(input.deptId);
      const highestExisting = queue
        .filter((patient) => patient.deptId === input.deptId)
        .reduce((highest, patient) => Math.max(highest, patient.tokenNumber), 0);
      const tokenNumber = Math.max(nowServing[input.deptId] ?? 0, highestExisting) + 1;
      const token = `${department.prefix}-${tokenNumber}`;
      const severity: Severity = input.emergency ? "critical" : input.severity;
      const patient: QueuePatient = {
        token,
        tokenNumber,
        deptId: input.deptId,
        name: input.name,
        age: input.age,
        severity,
        checkedIn: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        source: input.appointmentCode ? "Appointment" : "Walk-in",
        phone: input.phone,
        symptoms: input.symptoms,
        insurance: input.insuranceProvider,
        isPortalUser: true,
      };
      // A patient has one active portal token. Re-check-in replaces it rather than
      // leaving a ghost token behind in the department queue.
      setQueue((previous) => [...previous.filter((entry) => !entry.isPortalUser), patient]);
      setActiveToken({ token, tokenNumber, deptId: input.deptId, severity, completed: false });
      setProfile((previous) => ({
        ...previous,
        name: input.name,
        age: input.age,
        phone: input.phone,
        insuranceProvider: input.insuranceProvider,
        policyNumber: input.policyNumber,
        appointmentCode: input.appointmentCode,
      }));
      addNotification({
        kind: input.emergency ? "emergency" : "sms",
        title: input.emergency ? "Emergency token issued" : `Check-in complete · ${token}`,
        message: input.emergency
          ? `Your case has been flagged for immediate clinical review. ${department.name} staff have been alerted.`
          : `You are checked in for ${department.name}. Track your live position in the patient portal.`,
        token,
      });
      if (input.emergency) {
        setCriticalAlerts((previous) => [
          {
            id: `alert-${token}`,
            code: "PRIORITY PATIENT",
            summary: `${input.name}, ${input.age} · ${input.symptoms || "Emergency pre-registration"}`,
            location: "Main atrium · Patient portal check-in",
            eta: "Now",
            deptId: input.deptId,
            acknowledged: false,
            received: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          },
          ...previous,
        ]);
      }
      return { token, tokenNumber, deptId: input.deptId, severity };
    },
    [addNotification, getDepartment, nowServing, queue]
  );

  const callNext = useCallback(
    (deptId: DepartmentId, targetToken?: string) => {
      const department = getDepartment(deptId);
      const departmentQueue = getQueueFor(deptId);
      if (!departmentQueue.length) {
        addNotification({
          kind: "info",
          title: "Queue is clear",
          message: `There are no patients waiting in ${department.name}.`,
        });
        return null;
      }
      const nextPatient =
        (targetToken
          ? departmentQueue.find((patient) => patient.token === targetToken)
          : undefined) ?? departmentQueue[0];
      setQueue((previous) => previous.filter((patient) => patient.token !== nextPatient.token));
      setNowServing((previous) => ({
        ...previous,
        [deptId]: nextPatient.tokenNumber,
      }));
      setActiveToken((previous) => {
        if (!previous) return previous;
        if (previous.token === nextPatient.token) {
          return { ...previous, tokenNumber: nextPatient.tokenNumber, completed: false };
        }
        const previousStillWaiting = departmentQueue.some((patient) => patient.token === previous.token);
        if (previous.deptId === deptId && !previousStillWaiting) {
          return { ...previous, completed: true };
        }
        return previous;
      });
      addNotification({
        kind: "sms",
        title: `Token ${nextPatient.token} called`,
        message: `Token ${nextPatient.token}, please proceed to Room ${department.room}, Level ${department.floor} ${department.wing}. An SMS alert has been sent.`,
        token: nextPatient.token,
      });
      return nextPatient;
    },
    [addNotification, getDepartment, getQueueFor]
  );

  const markEmergency = useCallback(
    (token: string) => {
      const patient = queue.find((entry) => entry.token === token);
      if (!patient) return;
      setQueue((previous) =>
        previous.map((entry) =>
          entry.token === token ? { ...entry, severity: "critical" as Severity } : entry
        )
      );
      if (activeToken?.token === token) {
        setActiveToken((previous) => (previous ? { ...previous, severity: "critical" } : previous));
      }
      const department = getDepartment(patient.deptId);
      setCriticalAlerts((previous) => [
        {
          id: `alert-${token}-${Date.now()}`,
          code: "PRIORITY REVIEW",
          summary: `${patient.name}, ${patient.age} · bumped by triage algorithm`,
          location: department.name,
          eta: "Now",
          deptId: patient.deptId,
          acknowledged: false,
          received: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        },
        ...previous,
      ]);
      addNotification({
        kind: "emergency",
        title: `Priority triage · ${token}`,
        message: `Token ${token} has been moved to the front of the ${department.name} queue. The clinical team has been alerted.`,
        token,
      });
    },
    [activeToken, addNotification, getDepartment, queue]
  );

  const reportDelay = useCallback(
    (deptId: DepartmentId, minutes = 10) => {
      const department = getDepartment(deptId);
      setDelays((previous) => ({ ...previous, [deptId]: previous[deptId] + minutes }));
      addNotification({
        kind: "delay",
        title: `${department.name} update`,
        message: `A ${minutes}-minute delay has been reported. Your revised estimate has been updated automatically.`,
      });
    },
    [addNotification, getDepartment]
  );

  const reassignDoctor = useCallback(
    (deptId: DepartmentId) => {
      const department = getDepartment(deptId);
      setDepartments((previous) =>
        previous.map((entry) =>
          entry.id === deptId ? { ...entry, doctors: entry.doctors + 1 } : entry
        )
      );
      setDelays((previous) => ({ ...previous, [deptId]: Math.max(0, previous[deptId] - 5) }));
      addNotification({
        kind: "info",
        title: "Staff reallocated",
        message: `One additional clinician has been assigned to ${department.name}. Predicted waiting times have been recalculated.`,
      });
    },
    [addNotification, getDepartment]
  );

  const acknowledgeAlert = useCallback((id: string) => {
    setCriticalAlerts((previous) =>
      previous.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert))
    );
  }, []);

  const pushAlert = useCallback(
    (alert: Omit<CriticalAlert, "id" | "acknowledged" | "received">) => {
      setCriticalAlerts((previous) => [
        {
          ...alert,
          id: `alert-${Date.now()}`,
          acknowledged: false,
          received: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        },
        ...previous,
      ]);
      addNotification({
        kind: "emergency",
        title: `${alert.code} · incoming`,
        message: `${alert.summary} · ${alert.location} · ETA ${alert.eta}`,
      });
    },
    [addNotification]
  );

  const signIn = useCallback((username: string, password: string, role: StaffRole) => {
    const credentials = staffCredentials[role];
    const valid =
      (username.trim() === credentials.username || username.trim() === "doctor@govcare.gov" || username.trim() === "admin@govcare.gov") &&
      password === credentials.password;
    if (!valid) return false;
    setStaff({ role, name: credentials.name, deptId: credentials.deptId });
    return true;
  }, []);

  const signOut = useCallback(() => setStaff(null), []);

  const resetDemo = useCallback(() => {
    setDepartments(initialDepartments);
    setQueue(initialQueue);
    setNowServing(nowServingInitial);
    setDelays({ opd: 0, cardiology: 0, pediatrics: 0, laboratory: 0, pharmacy: 10, radiology: 0 });
    setActiveToken(activeInitial);
    setProfile(initialProfile);
    setNotifications(initialNotifications);
    setCriticalAlerts(initialAlerts);
    setToast(null);
    setLanguageState("en");
    notificationId.current = 3;
  }, []);

  const value = useMemo<HospitalContextValue>(
    () => ({
      language,
      setLanguage,
      departments,
      queue,
      nowServing,
      delays,
      activeToken,
      profile,
      notifications,
      criticalAlerts,
      toast,
      staff,
      getDepartment,
      getQueueFor,
      getSnapshot,
      activeSnapshot: getActiveSnapshot(),
      generateToken,
      callNext,
      markEmergency,
      reportDelay,
      reassignDoctor,
      acknowledgeAlert,
      pushAlert,
      dismissToast: () => setToast(null),
      signIn,
      signOut,
      resetDemo,
    }),
    [
      language,
      setLanguage,
      departments,
      queue,
      nowServing,
      delays,
      activeToken,
      profile,
      notifications,
      criticalAlerts,
      toast,
      staff,
      getDepartment,
      getQueueFor,
      getSnapshot,
      getActiveSnapshot,
      generateToken,
      callNext,
      markEmergency,
      reportDelay,
      reassignDoctor,
      acknowledgeAlert,
      pushAlert,
      signIn,
      signOut,
      resetDemo,
    ]
  );

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>;
}

export function useHospital() {
  const context = useContext(HospitalContext);
  if (!context) throw new Error("useHospital must be used inside HospitalProvider");
  return context;
}
