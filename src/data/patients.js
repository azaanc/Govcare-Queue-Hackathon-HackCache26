// Made-up patients for the City District Hospital demo. No real person is represented.

export const demoPatientProfile = {
  firstName: "Kamla",
  firstNameHi: "कमला",
  fullName: "Kamla Devi",
  age: 62,
  gender: "female",
  mobile: "",
};

export const initialCurrentTokens = {
  med: "MED-041",
  child: "CHD-018",
  women: "WOM-022",
  bones: "BON-014",
  ent: "ENT-009",
  eyes: "EYE-011",
  skin: "SKN-007",
};

export const initialConsultationHistory = {
  med: [12, 14, 10, 13, 12, 15, 11, 12, 13, 12],
  child: [9, 10, 11, 9, 8, 10, 10, 11, 9, 10],
  women: [15, 16, 14, 15, 13, 15, 17, 14, 15, 16],
  bones: [13, 12, 14, 13, 15, 12, 13, 14, 13, 12],
  ent: [10, 9, 11, 10, 10, 12, 9, 10, 11, 10],
  eyes: [9, 8, 10, 9, 9, 11, 8, 9, 10, 9],
  skin: [10, 11, 9, 10, 10, 12, 9, 10, 11, 10],
};

const p = (token, deptId, nameEn, nameHi, age, gender, priority = "routine", minutesAgo = 20) => ({
  token,
  deptId,
  nameEn,
  nameHi,
  age,
  gender,
  mobile: "",
  priority,
  source: "walk-in",
  addedAt: Date.now() - minutesAgo * 60_000,
});

export const samplePatients = [
  p("MED-042", "med", "Ramesh Kumar", "रमेश कुमार", 54, "male", "routine", 24),
  p("MED-043", "med", "Sunita Bai", "सुनीता बाई", 47, "female", "routine", 18),
  p("MED-044", "med", "Arjun Patel", "अर्जुन पटेल", 29, "male", "routine", 12),
  p("CHD-019", "child", "Aarav Sahu", "आरव साहू", 4, "male", "routine", 17),
  p("CHD-020", "child", "Riya Yadav", "रिया यादव", 8, "female", "routine", 11),
  p("WOM-023", "women", "Lakshmi Verma", "लक्ष्मी वर्मा", 35, "female", "routine", 21),
  p("WOM-024", "women", "Pooja Kori", "पूजा कोरी", 26, "female", "routine", 10),
  p("BON-015", "bones", "Mohan Lal", "मोहन लाल", 68, "male", "routine", 25),
  p("BON-016", "bones", "Shanti Devi", "शांति देवी", 61, "female", "routine", 14),
  p("ENT-010", "ent", "Ganesh Prasad", "गणेश प्रसाद", 39, "male", "routine", 16),
  p("ENT-011", "ent", "Nazma Begum", "नज़मा बेगम", 45, "female", "routine", 8),
  p("EYE-012", "eyes", "Rajesh Tiwari", "राजेश तिवारी", 57, "male", "routine", 19),
  p("EYE-013", "eyes", "Meena Joshi", "मीना जोशी", 50, "female", "routine", 9),
  p("SKN-008", "skin", "Deepak Soni", "दीपक सोनी", 32, "male", "routine", 15),
  p("SKN-009", "skin", "Asha Pandey", "आशा पांडेय", 44, "female", "routine", 7),
  p("MED-045", "med", "Ram Singh", "राम सिंह", 70, "male", "routine", 5),
  p("CHD-021", "child", "Kabir Ali", "कबीर अली", 6, "male", "routine", 4),
  p("WOM-025", "women", "Radha Yadav", "राधा यादव", 31, "female", "routine", 3),
  p("BON-017", "bones", "Kailash Meena", "कैलाश मीना", 59, "male", "routine", 2),
  p("EYE-014", "eyes", "Kiran Rao", "किरण राव", 40, "female", "routine", 1),
];

export const demoPatientsForCounter = [
  { nameEn: "Kamla Devi", nameHi: "कमला देवी", age: 62, gender: "female", mobile: "" },
  { nameEn: "Rajendra Kumar", nameHi: "राजेंद्र कुमार", age: 55, gender: "male", mobile: "" },
  { nameEn: "Mariam Khatoon", nameHi: "मरियम खातून", age: 48, gender: "female", mobile: "9000000012" },
  { nameEn: "Deepak Kumar", nameHi: "दीपक कुमार", age: 36, gender: "male", mobile: "" },
];
