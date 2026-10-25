import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import en from "../i18n/en.js";
import hi from "../i18n/hi.js";
import { departments, departmentById } from "../data/departments.js";
import {
  initialConsultationHistory,
  initialCurrentTokens,
  samplePatients,
  demoPatientsForCounter,
} from "../data/patients.js";
import { places, placeById } from "../data/hospital.js";
import { shortestPath, routeInstructions, routeDistanceTime, nearestHelpDesk } from "./routeUtils.js";

const STORAGE_KEY = "opd-saathi-state-v1";
const CHANNEL_NAME = "opd-saathi-sync-v1";
const dictionaries = { en, hi };

const defaultDoctorStatus = () =>
  Object.fromEntries(
    departments.map((department) => [
      department.id,
      { mode: "available", breakUntil: "11:30", lateMinutes: 0 },
    ])
  );

function buildInitialQueues() {
  const queues = {};
  const records = {};
  departments.forEach((department) => {
    queues[department.id] = {
      current: initialCurrentTokens[department.id] ?? null,
      waiting: samplePatients
        .filter((patient) => patient.deptId === department.id)
        .sort((a, b) => a.addedAt - b.addedAt)
        .map((patient) => patient.token),
    };
  });
  samplePatients.forEach((patient) => {
    records[patient.token] = {
      token: patient.token,
      deptId: patient.deptId,
      firstName: patient.nameEn.split(" ")[0],
      firstNameHi: patient.nameHi?.split(" ")[0] ?? patient.nameEn.split(" ")[0],
      fullNameEn: patient.nameEn,
      fullNameHi: patient.nameHi,
      age: patient.age,
      gender: patient.gender,
      mobile: patient.mobile,
      priority: patient.priority,
      source: patient.source,
      addedAt: patient.addedAt,
    };
  });
  return { queues, records };
}

function initialState() {
  const { queues, records } = buildInitialQueues();
  return {
    version: 1,
    settings: {
      language: "en",
      languageChosen: false,
      textSize: "normal",
      highContrast: false,
      readAloud: false,
      avoidStairs: false,
      assistedMode: false,
      alerts: false,
    },
    queues,
    records,
    activeToken: null,
    flags: [],
    doctorStatus: defaultDoctorStatus(),
    consultations: { ...initialConsultationHistory },
    announcements: [],
    speed: 1,
    lastUpdated: Date.now(),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    const base = initialState();
    return {
      ...base,
      ...parsed,
      version: 1,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      queues: parsed.queues ?? base.queues,
      records: parsed.records ?? base.records,
      doctorStatus: { ...base.doctorStatus, ...(parsed.doctorStatus ?? {}) },
      consultations: { ...base.consultations, ...(parsed.consultations ?? {}) },
    };
  } catch {
    return initialState();
  }
}

function nextTokenFor(state, deptId) {
  const department = departmentById(deptId);
  const current = state.queues[deptId]?.current;
  const waiting = state.queues[deptId]?.waiting ?? [];
  const numbers = [current, ...waiting, ...Object.keys(state.records)]
    .filter((token) => token?.startsWith(`${department.tokenPrefix}-`))
    .map((token) => Number(token.split("-")[1]))
    .filter((number) => Number.isFinite(number));
  const next = Math.max(0, ...numbers) + 1;
  return `${department.tokenPrefix}-${String(next).padStart(3, "0")}`;
}

function addRecord(state, record) {
  return { ...state, records: { ...state.records, [record.token]: record } };
}

function pushAnnouncement(state, token, deptId) {
  const department = departmentById(deptId);
  return [
    {
      id: `${token}-${Date.now()}`,
      token,
      deptId,
      room: department.room,
      roomHi: department.roomHi,
      createdAt: Date.now(),
    },
    ...(state.announcements ?? []),
  ].slice(0, 20);
}

function recordConsultation(state, deptId) {
  const department = departmentById(deptId);
  const duration = Math.max(4, Math.round(department.averageConsultation * (0.85 + Math.random() * 0.3)));
  const list = [...(state.consultations[deptId] ?? []), duration].slice(-10);
  return { ...state.consultations, [deptId]: list };
}

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.patch }, lastUpdated: Date.now() };
    case "LANGUAGE_CHOSEN":
      return {
        ...state,
        settings: { ...state.settings, language: action.language, languageChosen: true },
      };
    case "REGISTER": {
      const { patient } = action;
      const queue = state.queues[patient.deptId] ?? { current: null, waiting: [] };
      const nextState = {
        ...state,
        queues: {
          ...state.queues,
          [patient.deptId]: { ...queue, waiting: [...queue.waiting, patient.token] },
        },
        activeToken: action.activate === false ? state.activeToken : patient.token,
        lastUpdated: Date.now(),
      };
      return addRecord(nextState, patient);
    }
    case "ACTIVE_TOKEN":
      return { ...state, activeToken: action.token, lastUpdated: Date.now() };
    case "CALL_NEXT": {
      const { deptId, token } = action;
      const queue = state.queues[deptId];
      if (!queue) return state;
      const waiting = [...queue.waiting];
      const index = token ? waiting.indexOf(token) : 0;
      if (index < 0 || waiting.length === 0) return state;
      const called = waiting[index];
      waiting.splice(index, 1);
      return {
        ...state,
        queues: { ...state.queues, [deptId]: { current: called, waiting } },
        consultations: recordConsultation(state, deptId),
        announcements: pushAnnouncement(state, called, deptId),
        lastUpdated: Date.now(),
        lastCalled: { token: called, deptId, at: Date.now() },
      };
    }
    case "NO_SHOW": {
      const { token, deptId } = action;
      const queue = state.queues[deptId];
      if (!queue) return state;
      if (queue.current === token) {
        return { ...state, queues: { ...state.queues, [deptId]: { ...queue, current: null } } };
      }
      return {
        ...state,
        queues: { ...state.queues, [deptId]: { ...queue, waiting: queue.waiting.filter((item) => item !== token) } },
        flags: state.flags.filter((flag) => flag.token !== token),
        lastUpdated: Date.now(),
      };
    }
    case "SEND_END": {
      const { token, deptId } = action;
      const queue = state.queues[deptId];
      if (!queue || !queue.waiting.includes(token)) return state;
      const waiting = queue.waiting.filter((item) => item !== token);
      waiting.push(token);
      return {
        ...state,
        queues: { ...state.queues, [deptId]: { ...queue, waiting } },
        lastUpdated: Date.now(),
      };
    }
    case "TRANSFER": {
      const { token, from, to } = action;
      const source = state.queues[from];
      if (!source || !state.queues[to] || source.waiting.indexOf(token) < 0) return state;
      const records = { ...state.records, [token]: { ...state.records[token], deptId: to } };
      return {
        ...state,
        queues: {
          ...state.queues,
          [from]: { ...source, waiting: source.waiting.filter((item) => item !== token) },
          [to]: { ...state.queues[to], waiting: [...state.queues[to].waiting, token] },
        },
        records,
        lastUpdated: Date.now(),
      };
    }
    case "DOCTOR_STATUS":
      return {
        ...state,
        doctorStatus: {
          ...state.doctorStatus,
          [action.deptId]: { ...state.doctorStatus[action.deptId], ...action.patch },
        },
        lastUpdated: Date.now(),
      };
    case "RAISE_FLAG": {
      const flag = action.flag;
      return {
        ...state,
        // Only collapse repeat flags for the same known token. Anonymous flags
        // from someone without a token are separate requests and must all be kept.
        flags: [
          flag,
          ...state.flags.filter(
            (item) => !(flag.token && item.token === flag.token && item.seen === false)
          ),
        ],
        lastUpdated: Date.now(),
      };
    }
    case "SEEN_FLAG":
      return {
        ...state,
        flags: state.flags.map((flag) => (flag.id === action.id ? { ...flag, seen: true, seenAt: Date.now() } : flag)),
        lastUpdated: Date.now(),
      };
    case "ADD_PATIENTS": {
      const queues = { ...state.queues };
      const records = { ...state.records };
      action.patients.forEach((patient) => {
        queues[patient.deptId] = {
          ...queues[patient.deptId],
          waiting: [...(queues[patient.deptId]?.waiting ?? []), patient.token],
        };
        records[patient.token] = patient;
      });
      return { ...state, queues, records, lastUpdated: Date.now() };
    }
    case "SPEED":
      return { ...state, speed: action.speed };
    case "RESET":
      try {
        localStorage.removeItem("opd-saathi-draft");
      } catch {
        // Draft cleanup is best effort in restricted browsers.
      }
      return initialState();
    default:
      return state;
  }
}

const OpdContext = createContext(null);

function makeOrigin() {
  try {
    return crypto.randomUUID();
  } catch {
    return `tab-${Math.random().toString(36).slice(2)}`;
  }
}

export function OpdProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const originRef = useRef(makeOrigin());
  const remoteRef = useRef(false);
  const channelRef = useRef(null);

  useEffect(() => {
    let channel = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = channel;
      channel.onmessage = (event) => {
        if (!event.data || event.data.origin === originRef.current) return;
        if (event.data.type === "STATE" && event.data.state?.version === 1) {
          remoteRef.current = true;
          dispatch({ type: "HYDRATE", state: event.data.state });
        }
      };
    }
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const next = JSON.parse(event.newValue);
        if (next?.version === 1) {
          remoteRef.current = true;
          dispatch({ type: "HYDRATE", state: next });
        }
      } catch {
        // Ignore a malformed value written by another tab.
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      channel?.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable in private mode; the app still works for this tab.
    }
    if (remoteRef.current) {
      remoteRef.current = false;
      return;
    }
    channelRef.current?.postMessage({ type: "STATE", origin: originRef.current, state });
  }, [state]);

  useEffect(() => {
    document.documentElement.lang = state.settings.language === "hi" ? "hi" : "en";
    document.documentElement.dataset.opdContrast = state.settings.highContrast ? "high" : "normal";
    document.documentElement.dataset.opdText = state.settings.textSize;
  }, [state.settings.language, state.settings.highContrast, state.settings.textSize]);

  const t = useCallback(
    (key, variables = {}) => {
      const single = dictionaries[state.settings.language]?.[key] ?? dictionaries.en[key] ?? key;
      return String(single).replace(/\{(\w+)\}/g, (_, name) => String(variables[name] ?? ""));
    },
    [state.settings.language]
  );

  const language = state.settings.language;
  const setSettings = useCallback((patch) => dispatch({ type: "SETTINGS", patch }), []);
  const chooseLanguage = useCallback((nextLanguage) => dispatch({ type: "LANGUAGE_CHOSEN", language: nextLanguage }), []);

  const getAverageConsultation = useCallback(
    (deptId) => {
      const department = departmentById(deptId);
      const history = state.consultations[deptId] ?? [];
      if (!history.length) return department.averageConsultation;
      return history.reduce((sum, value) => sum + value, 0) / history.length;
    },
    [state.consultations]
  );

  const getDelay = useCallback(
    (deptId) => state.doctorStatus[deptId]?.lateMinutes ?? 0,
    [state.doctorStatus]
  );

  const getWaitingInfo = useCallback(
    (deptId) => {
      const queue = state.queues[deptId] ?? { current: null, waiting: [] };
      const average = getAverageConsultation(deptId);
      const delay = getDelay(deptId);
      const waiting = queue.waiting.map((token, index) => {
        const raw = index * average + delay;
        const rounded = Math.max(0, Math.round(raw / 5) * 5);
        return { token, peopleAhead: index, waitMinutes: rounded, record: state.records[token] };
      });
      return {
        department: departmentById(deptId),
        current: queue.current,
        waiting,
        averageWait: Math.max(0, Math.round((queue.waiting.length * average + delay) / 5) * 5),
        averageConsultation: average,
        delay,
        doctorStatus: state.doctorStatus[deptId] ?? { mode: "available", lateMinutes: 0 },
        occupancy:
          queue.waiting.length / Math.max(1, departmentById(deptId).seats),
      };
    },
    [getAverageConsultation, getDelay, state.doctorStatus, state.queues, state.records]
  );

  const findToken = useCallback(
    (rawToken) => {
      const token = String(rawToken ?? "").trim().toUpperCase();
      if (!token) return null;
      for (const department of departments) {
        const queue = state.queues[department.id];
        if (!queue) continue;
        if (queue.current === token) {
          return {
            ...getWaitingInfo(department.id),
            token,
            deptId: department.id,
            status: "called",
            peopleAhead: 0,
            waitMinutes: 0,
            record: state.records[token] ?? null,
          };
        }
        const index = queue.waiting.indexOf(token);
        if (index >= 0) {
          return {
            ...getWaitingInfo(department.id),
            token,
            deptId: department.id,
            status: "waiting",
            peopleAhead: index,
            waitMinutes: getWaitingInfo(department.id).waiting[index]?.waitMinutes ?? 5,
            record: state.records[token] ?? null,
          };
        }
      }
      return null;
    },
    [getWaitingInfo, state.queues, state.records]
  );

  const registerPatient = useCallback(
    (patient, options = {}) => {
      const token = nextTokenFor(state, patient.deptId);
      const record = {
        ...patient,
        token,
        source: patient.source ?? "walk-in",
        addedAt: Date.now(),
      };
      dispatch({ type: "REGISTER", patient: record, activate: options.activate !== false });
      return token;
    },
    [state]
  );

  const callNext = useCallback(
    (deptId, token = null) => {
      const info = getWaitingInfo(deptId);
      const nextToken = token ?? info.waiting[0]?.token;
      if (!nextToken) return null;
      dispatch({ type: "CALL_NEXT", deptId, token: nextToken });
      return nextToken;
    },
    [getWaitingInfo]
  );

  const markNoShow = useCallback((token, deptId) => dispatch({ type: "NO_SHOW", token, deptId }), []);
  const sendToEnd = useCallback((token, deptId) => dispatch({ type: "SEND_END", token, deptId }), []);
  const transferPatient = useCallback((token, from, to) => dispatch({ type: "TRANSFER", token, from, to }), []);
  const setDoctorStatus = useCallback((deptId, patch) => dispatch({ type: "DOCTOR_STATUS", deptId, patch }), []);
  const reportDelay = useCallback(
    (deptId, minutes = 10) => {
      const current = state.doctorStatus[deptId]?.lateMinutes ?? 0;
      dispatch({ type: "DOCTOR_STATUS", deptId, patch: { mode: "late", lateMinutes: current + minutes } });
    },
    [state.doctorStatus]
  );

  const raiseUrgentFlag = useCallback(
    ({ reasonKey, token, deptId }) => {
      const flag = {
        id: `flag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        reasonKey,
        token: token ?? null,
        deptId: deptId ?? null,
        createdAt: Date.now(),
        seen: false,
      };
      dispatch({ type: "RAISE_FLAG", flag });
      return flag;
    },
    []
  );

  const markFlagSeen = useCallback((id) => dispatch({ type: "SEEN_FLAG", id }), []);

  const addSamplePatients = useCallback(
    (count = 20) => {
      const queues = state.queues;
      const records = {};
      const generated = [];
      const highestByPrefix = {};
      Object.values(state.records).forEach((record) => {
        const department = departments.find((entry) => entry.id === record.deptId);
        if (!department) return;
        const number = Number(String(record.token).split("-")[1]);
        if (!Number.isFinite(number)) return;
        highestByPrefix[department.tokenPrefix] = Math.max(highestByPrefix[department.tokenPrefix] ?? 0, number);
      });
      const firstNames = [
        ["Sita", "सीता"], ["Ravi", "रवि"], ["Nirmala", "निर्मला"], ["Arun", "अरुण"],
        ["Pooja", "पूजा"], ["Mahesh", "महेश"], ["Salma", "सलमा"], ["Rohit", "रोहित"],
        ["Kusum", "कुसुम"], ["Ajay", "अजय"], ["Bharti", "भारती"], ["Suresh", "सुरेश"],
        ["Fatima", "फ़ातिमा"], ["Vikram", "विक्रम"], ["Geeta", "गीता"], ["Anil", "अनिल"],
        ["Rani", "रानी"], ["Dinesh", "दिनेश"], ["Mamta", "ममता"], ["Sanjay", "संजय"],
      ];
      for (let i = 0; i < count; i += 1) {
        const department = departments[i % departments.length];
        const [nameEn, nameHi] = firstNames[i % firstNames.length];
        const queue = queues[department.id];
        const numbers = [queue.current, ...queue.waiting]
          .filter(Boolean)
          .map((item) => Number(String(item).split("-")[1]))
          .filter(Number.isFinite);
        const tempNumber =
          Math.max(highestByPrefix[department.tokenPrefix] ?? 0, ...numbers, 0) +
          1 +
          Math.floor(i / departments.length);
        highestByPrefix[department.tokenPrefix] = tempNumber;
        const token = `${department.tokenPrefix}-${String(tempNumber).padStart(3, "0")}`;
        const record = {
          token,
          deptId: department.id,
          firstName: nameEn,
          firstNameHi: nameHi,
          fullNameEn: `${nameEn} ${i % 2 ? "Kumar" : "Devi"}`,
          fullNameHi: nameHi,
          age: 24 + ((i * 7) % 50),
          gender: i % 2 ? "male" : "female",
          mobile: "",
          priority: "routine",
          source: "sample",
          addedAt: Date.now() - i * 60_000,
        };
        records[token] = record;
        generated.push(record);
      }
      dispatch({ type: "ADD_PATIENTS", patients: generated });
    },
    [state.queues]
  );

  const setSpeed = useCallback((speed) => dispatch({ type: "SPEED", speed }), []);
  const resetDemo = useCallback(() => dispatch({ type: "RESET" }), []);
  const setActiveToken = useCallback((token) => dispatch({ type: "ACTIVE_TOKEN", token }), []);

  // Demo speed: when 10× is on, call the next patient every 6 seconds in the
  // active patient's department (or General Medicine if nobody is registered).
  useEffect(() => {
    if (state.speed <= 1) return undefined;
    const interval = window.setInterval(() => {
      const activeRecord = state.activeToken ? state.records[state.activeToken] : null;
      const deptId = activeRecord?.deptId ?? "med";
      callNext(deptId);
    }, 6000);
    return () => window.clearInterval(interval);
  }, [callNext, state.activeToken, state.records, state.speed]);

  const routeBetween = useCallback(
    (fromId, toId, avoidStairs = state.settings.avoidStairs) => {
      const path = shortestPath(fromId, toId, avoidStairs);
      if (!path) return null;
      return {
        ...path,
        distance: Math.round(path.distance),
        minutes: routeDistanceTime(path.distance),
        steps: routeInstructions(path, language, t),
      };
    },
    [language, state.settings.avoidStairs, t]
  );

  const routeToHelp = useCallback(
    (fromId, avoidStairs = state.settings.avoidStairs) => {
      const option = nearestHelpDesk(fromId, avoidStairs);
      if (!option?.path) return { destination: placeById("help-desk"), path: null };
      return {
        destination: placeById(option.id),
        path: {
          ...option.path,
          distance: Math.round(option.path.distance),
          minutes: routeDistanceTime(option.path.distance),
          steps: routeInstructions(option.path, language, t),
        },
      };
    },
    [language, state.settings.avoidStairs, t]
  );

  const activeQueueInfo = useMemo(() => {
    if (!state.activeToken) return null;
    return findToken(state.activeToken);
  }, [findToken, state.activeToken]);

  const unseenFlags = state.flags.filter((flag) => !flag.seen);

  const value = useMemo(
    () => ({
      state,
      language,
      t,
      settings: state.settings,
      setSettings,
      chooseLanguage,
      queues: state.queues,
      records: state.records,
      departments,
      places,
      flags: state.flags,
      unseenFlags,
      doctorStatus: state.doctorStatus,
      activeToken: state.activeToken,
      activeQueueInfo,
      announcements: state.announcements,
      speed: state.speed,
      findToken,
      registerPatient,
      callNext,
      markNoShow,
      sendToEnd,
      transferPatient,
      setDoctorStatus,
      reportDelay,
      raiseUrgentFlag,
      markFlagSeen,
      addSamplePatients,
      setSpeed,
      resetDemo,
      setActiveToken,
      getWaitingInfo,
      getAverageConsultation,
      routeBetween,
      routeToHelp,
      placeById,
      floorRoutes: (path) => {
        if (!path) return new Map();
        const grouped = new Map();
        path.nodes.forEach((id) => {
          const place = placeById(id);
          if (!grouped.has(place.floor)) grouped.set(place.floor, []);
          grouped.get(place.floor).push(id);
        });
        return grouped;
      },
      demoPatients: demoPatientsForCounter,
    }),
    [
      state,
      language,
      t,
      settingsState(state.settings),
      setSettings,
      chooseLanguage,
      activeQueueInfo,
      findToken,
      registerPatient,
      callNext,
      markNoShow,
      sendToEnd,
      transferPatient,
      setDoctorStatus,
      reportDelay,
      raiseUrgentFlag,
      markFlagSeen,
      addSamplePatients,
      setSpeed,
      resetDemo,
      setActiveToken,
      getWaitingInfo,
      getAverageConsultation,
      routeBetween,
      routeToHelp,
      unseenFlags,
    ]
  );

  return <OpdContext.Provider value={value}>{children}</OpdContext.Provider>;
}

// Keeps the dependency list stable while still updating when a setting changes.
function settingsState(settings) {
  return `${settings.language}|${settings.textSize}|${settings.highContrast}|${settings.readAloud}|${settings.avoidStairs}|${settings.assistedMode}|${settings.alerts}`;
}

export function useOpd() {
  const context = useContext(OpdContext);
  if (!context) throw new Error("useOpd must be used inside OpdProvider");
  return context;
}
