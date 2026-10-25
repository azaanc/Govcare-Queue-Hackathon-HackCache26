// City District Hospital OPD departments — fictional staff and sample service times.

export const departments = [
  {
    id: "med",
    name: { en: "General Medicine", hi: "जनरल मेडिसिन" },
    plain: { en: "fever, cough, BP, sugar", hi: "बुखार, खाँसी, बीपी, शुगर" },
    tokenPrefix: "MED",
    room: "Room 1",
    roomId: "opd-1",
    roomHi: "कमरा 1",
    floor: 1,
    doctor: { en: "Dr. R. Sahu", hi: "डॉ. आर. साहू" },
    hours: "9:00 – 14:00",
    averageConsultation: 12,
    seats: 32,
    waitingPlace: "waiting-a",
    accent: "#0b3f6b",
  },
  {
    id: "child",
    name: { en: "Children", hi: "बच्चे" },
    plain: { en: "children under 14 who are unwell", hi: "14 साल से छोटे बीमार बच्चे" },
    tokenPrefix: "CHD",
    room: "Room 3",
    roomId: "opd-3",
    roomHi: "कमरा 3",
    floor: 1,
    doctor: { en: "Dr. P. Meena", hi: "डॉ. पी. मीना" },
    hours: "9:00 – 14:00",
    averageConsultation: 10,
    seats: 24,
    waitingPlace: "waiting-a",
    accent: "#3c6f8f",
  },
  {
    id: "women",
    name: { en: "Women and pregnancy", hi: "महिलाएँ और गर्भावस्था" },
    plain: { en: "pregnancy care, monthly problems", hi: "गर्भावस्था की देखभाल, मासिक समस्याएँ" },
    tokenPrefix: "WOM",
    room: "Room 4",
    roomId: "opd-4",
    roomHi: "कमरा 4",
    floor: 1,
    doctor: { en: "Dr. S. Bano", hi: "डॉ. एस. बानो" },
    hours: "9:00 – 14:00",
    averageConsultation: 15,
    seats: 20,
    waitingPlace: "waiting-a",
    accent: "#765a7e",
  },
  {
    id: "bones",
    name: { en: "Bones and joints", hi: "हड्डी और जोड़" },
    plain: { en: "bone pain, injury, joint swelling", hi: "हड्डी में दर्द, चोट, जोड़ों में सूजन" },
    tokenPrefix: "BON",
    room: "Room 5",
    roomId: "opd-5",
    roomHi: "कमरा 5",
    floor: 1,
    doctor: { en: "Dr. A. Kujur", hi: "डॉ. ए. कुजूर" },
    hours: "9:00 – 14:00",
    averageConsultation: 13,
    seats: 20,
    waitingPlace: "waiting-a",
    accent: "#846238",
  },
  {
    id: "ent",
    name: { en: "Ear, nose and throat", hi: "कान, नाक और गला" },
    plain: { en: "ear pain, blocked nose, sore throat", hi: "कान दर्द, बंद नाक, गला खराब" },
    tokenPrefix: "ENT",
    room: "Room 6",
    roomId: "opd-6",
    roomHi: "कमरा 6",
    floor: 1,
    doctor: { en: "Dr. N. Topno", hi: "डॉ. एन. टोपनो" },
    hours: "9:00 – 14:00",
    averageConsultation: 10,
    seats: 16,
    waitingPlace: "waiting-a",
    accent: "#4c7a70",
  },
  {
    id: "eyes",
    name: { en: "Eyes", hi: "आँखें" },
    plain: { en: "blurred vision, red or painful eyes", hi: "धुंधला दिखना, लाल या दर्द भरी आँखें" },
    tokenPrefix: "EYE",
    room: "Room 7",
    roomId: "opd-7",
    roomHi: "कमरा 7",
    floor: 1,
    doctor: { en: "Dr. K. Minz", hi: "डॉ. के. मिंज" },
    hours: "9:00 – 14:00",
    averageConsultation: 9,
    seats: 16,
    waitingPlace: "waiting-a",
    accent: "#5d7160",
  },
  {
    id: "skin",
    name: { en: "Skin", hi: "त्वचा" },
    plain: { en: "rashes, itching, skin infections", hi: "दाने, खुजली, त्वचा का संक्रमण" },
    tokenPrefix: "SKN",
    room: "Room 8",
    roomId: "opd-8",
    roomHi: "कमरा 8",
    floor: 1,
    doctor: { en: "Dr. J. Ekka", hi: "डॉ. जे. एक्का" },
    hours: "9:00 – 14:00",
    averageConsultation: 10,
    seats: 16,
    waitingPlace: "waiting-a",
    accent: "#8f5f50",
  },
];

export function departmentById(id) {
  return departments.find((department) => department.id === id) ?? departments[0];
}

export const departmentName = (department, language = "en") =>
  department?.name?.[language] ?? department?.name?.en ?? "";

export const departmentRoom = (department, language = "en") => {
  if (!department) return "";
  const number = department.room.replace(/[^0-9]/g, "");
  return language === "hi" ? `कमरा ${number}` : `Room ${number}`;
};

export const departmentDoctor = (department, language = "en") =>
  department?.doctor?.[language] ?? department?.doctor?.en ?? "";

export const departmentPlain = (department, language = "en") =>
  department?.plain?.[language] ?? department?.plain?.en ?? "";
