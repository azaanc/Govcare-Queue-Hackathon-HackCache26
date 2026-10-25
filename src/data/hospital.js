// City District Hospital — made-up demo data. No real patients or clinical records.

export const hospital = {
  name: { en: "City District Hospital", hi: "सिटी जिला अस्पताल" },
  shortName: { en: "City District Hospital", hi: "सिटी जिला अस्पताल" },
  floors: 3,
  opdHours: "9:00 – 14:00",
};

const L = (en, hi) => ({ en, hi });

export const places = [
  // Ground floor
  {
    id: "main-entrance",
    name: L("Main entrance", "मुख्य प्रवेश द्वार"),
    floor: 0,
    x: 380,
    y: 405,
    type: "entrance",
    landmark: L("under the large blue hospital sign", "अस्पताल की बड़ी नीली तख्ती के नीचे"),
  },
  {
    id: "registration",
    name: L("Registration counters", "रजिस्ट्रेशन काउंटर"),
    floor: 0,
    x: 150,
    y: 338,
    type: "service",
    landmark: L("opposite the blue waiting chairs", "नीली कुर्सियों के सामने"),
  },
  {
    id: "help-desk",
    name: L("Help desk", "सहायता डेस्क"),
    floor: 0,
    x: 485,
    y: 338,
    type: "help",
    landmark: L("next to the main entrance, under the white sign", "मुख्य द्वार के पास, सफ़ेद तख्ती के नीचे"),
  },
  {
    id: "emergency",
    name: L("Emergency (Casualty)", "इमरजेंसी (कैज़ुअल्टी)"),
    floor: 0,
    x: 700,
    y: 392,
    type: "emergency",
    landmark: L("through the red Emergency doors, right of the main entrance", "मुख्य द्वार के दाईं ओर, लाल इमरजेंसी दरवाज़ों से अंदर"),
  },
  {
    id: "pharmacy",
    name: L("Pharmacy", "फ़ार्मेसी"),
    floor: 0,
    x: 625,
    y: 244,
    type: "service",
    landmark: L("next to the green plant, opposite the lift", "हरे पौधे के पास, लिफ़्ट के सामने"),
  },
  {
    id: "laboratory",
    name: L("Laboratory (blood tests)", "लैबोरेटरी (खून की जाँच)"),
    floor: 0,
    x: 560,
    y: 118,
    type: "service",
    landmark: L("beside the sample collection window", "सैंपल कलेक्शन खिड़की के बगल में"),
  },
  {
    id: "xray",
    name: L("X-ray", "एक्स-रे"),
    floor: 0,
    x: 690,
    y: 118,
    type: "service",
    landmark: L("opposite the X-ray waiting seats", "एक्स-रे की कुर्सियों के सामने"),
  },
  {
    id: "water",
    name: L("Drinking water", "पीने का पानी"),
    floor: 0,
    x: 300,
    y: 255,
    type: "facility",
    landmark: L("next to the notice board", "सूचना पट्ट के पास"),
  },
  {
    id: "toilets-gf",
    name: L("Toilets", "शौचालय"),
    floor: 0,
    x: 75,
    y: 145,
    type: "facility",
    landmark: L("at the end of the corridor, beside the stairs", "गलियारे के अंत में, सीढ़ियों के पास"),
  },
  {
    id: "wheelchair",
    name: L("Wheelchair point", "व्हीलचेयर प्वाइंट"),
    floor: 0,
    x: 85,
    y: 338,
    type: "accessibility",
    landmark: L("beside the registration counters", "रजिस्ट्रेशन काउंटर के बगल में"),
  },
  {
    id: "lift-gf",
    name: L("Lift", "लिफ़्ट"),
    floor: 0,
    x: 405,
    y: 218,
    type: "lift",
    landmark: L("in the centre of the ground floor, next to the stairs", "ग्राउंड फ़्लोर के बीच में, सीढ़ियों के पास"),
  },
  {
    id: "stairs-gf",
    name: L("Stairs", "सीढ़ियाँ"),
    floor: 0,
    x: 468,
    y: 218,
    type: "stairs",
    landmark: L("beside the lift", "लिफ़्ट के पास"),
  },
  {
    id: "ramp",
    name: L("Ramp", "रैम्प"),
    floor: 0,
    x: 160,
    y: 410,
    type: "accessibility",
    landmark: L("left of the main entrance", "मुख्य द्वार के बाईं ओर"),
  },

  // First floor
  {
    id: "lift-1",
    name: L("Lift", "लिफ़्ट"),
    floor: 1,
    x: 405,
    y: 218,
    type: "lift",
    landmark: L("at the centre of the first floor", "पहली मंज़िल के बीच में"),
  },
  {
    id: "stairs-1",
    name: L("Stairs", "सीढ़ियाँ"),
    floor: 1,
    x: 468,
    y: 218,
    type: "stairs",
    landmark: L("beside the lift", "लिफ़्ट के पास"),
  },
  {
    id: "waiting-a",
    name: L("Waiting hall A", "प्रतीक्षा हॉल A"),
    floor: 1,
    x: 300,
    y: 360,
    type: "waiting",
    seats: 48,
    landmark: L("opposite the OPD rooms, under the blue signs", "ओपीडी कमरों के सामने, नीली तख्तियों के नीचे"),
  },
  { id: "opd-1", name: L("OPD room 1", "ओपीडी कमरा 1"), floor: 1, x: 100, y: 105, type: "room", landmark: L("first door on the left from the lift", "लिफ़्ट से बाईं ओर पहला दरवाज़ा") },
  { id: "opd-2", name: L("OPD room 2", "ओपीडी कमरा 2"), floor: 1, x: 225, y: 105, type: "room", landmark: L("second door on the left", "बाईं ओर दूसरा दरवाज़ा") },
  { id: "opd-3", name: L("OPD room 3", "ओपीडी कमरा 3"), floor: 1, x: 350, y: 105, type: "room", landmark: L("opposite the blue chairs", "नीली कुर्सियों के सामने") },
  { id: "opd-4", name: L("OPD room 4", "ओपीडी कमरा 4"), floor: 1, x: 475, y: 105, type: "room", landmark: L("fourth door along the corridor", "गलियारे में चौथा दरवाज़ा") },
  { id: "opd-5", name: L("OPD room 5", "ओपीडी कमरा 5"), floor: 1, x: 600, y: 105, type: "room", landmark: L("next to the X-ray sign", "एक्स-रे तख्ती के पास") },
  { id: "opd-6", name: L("OPD room 6", "ओपीडी कमरा 6"), floor: 1, x: 100, y: 238, type: "room", landmark: L("beside the drinking-water point", "पीने के पानी के पास") },
  { id: "opd-7", name: L("OPD room 7", "ओपीडी कमरा 7"), floor: 1, x: 225, y: 238, type: "room", landmark: L("next to room 6", "कमरा 6 के बगल में") },
  { id: "opd-8", name: L("OPD room 8", "ओपीडी कमरा 8"), floor: 1, x: 350, y: 238, type: "room", landmark: L("beside the waiting hall", "प्रतीक्षा हॉल के पास") },
  {
    id: "toilets-1",
    name: L("Toilets", "शौचालय"),
    floor: 1,
    x: 640,
    y: 360,
    type: "facility",
    landmark: L("near the waiting hall, next to the water point", "प्रतीक्षा हॉल के पास, पानी के पॉइंट के बगल में"),
  },

  // Second floor
  {
    id: "lift-2",
    name: L("Lift", "लिफ़्ट"),
    floor: 2,
    x: 405,
    y: 218,
    type: "lift",
    landmark: L("at the centre of the second floor", "दूसरी मंज़िल के बीच में"),
  },
  {
    id: "stairs-2",
    name: L("Stairs", "सीढ़ियाँ"),
    floor: 2,
    x: 468,
    y: 218,
    type: "stairs",
    landmark: L("beside the lift", "लिफ़्ट के पास"),
  },
  { id: "ward-4", name: L("Ward 4 (Medicine)", "वार्ड 4 (मेडिसिन)"), floor: 2, x: 160, y: 120, type: "ward", landmark: L("opposite the nurses' station", "नर्स स्टेशन के सामने") },
  { id: "ward-5", name: L("Ward 5 (Surgery)", "वार्ड 5 (सर्जरी)"), floor: 2, x: 360, y: 120, type: "ward", landmark: L("beside Ward 4", "वार्ड 4 के बगल में") },
  { id: "ward-6", name: L("Ward 6 (Children)", "वार्ड 6 (बच्चे)"), floor: 2, x: 570, y: 120, type: "ward", landmark: L("near the children's play area", "बच्चों के खेल क्षेत्र के पास") },
  {
    id: "nurses",
    name: L("Nurses' station", "नर्स स्टेशन"),
    floor: 2,
    x: 360,
    y: 320,
    type: "help",
    landmark: L("in the centre of the ward corridor", "वार्ड गलियारे के बीच में"),
  },
  {
    id: "toilets-2",
    name: L("Toilets", "शौचालय"),
    floor: 2,
    x: 615,
    y: 320,
    type: "facility",
    landmark: L("beside the nurses' station", "नर्स स्टेशन के बगल में"),
  },
];

/**
 * Undirected walking graph. `stairs: true` edges are excluded when the patient
 * has asked to avoid stairs. Vertical lift edges have zero floor distance.
 */
export const paths = [
  // Ground floor
  { from: "main-entrance", to: "registration", metres: 14 },
  { from: "main-entrance", to: "help-desk", metres: 11 },
  { from: "main-entrance", to: "lift-gf", metres: 38 },
  { from: "main-entrance", to: "stairs-gf", metres: 42, stairs: true },
  { from: "main-entrance", to: "ramp", metres: 16 },
  { from: "main-entrance", to: "emergency", metres: 24 },
  { from: "registration", to: "help-desk", metres: 28 },
  { from: "registration", to: "wheelchair", metres: 8 },
  { from: "registration", to: "ramp", metres: 10 },
  { from: "registration", to: "water", metres: 32 },
  { from: "registration", to: "toilets-gf", metres: 40 },
  { from: "help-desk", to: "water", metres: 17 },
  { from: "help-desk", to: "lift-gf", metres: 22 },
  { from: "help-desk", to: "emergency", metres: 36 },
  { from: "help-desk", to: "pharmacy", metres: 33 },
  { from: "help-desk", to: "toilets-gf", metres: 55 },
  { from: "pharmacy", to: "laboratory", metres: 44 },
  { from: "pharmacy", to: "xray", metres: 39 },
  { from: "pharmacy", to: "emergency", metres: 31 },
  { from: "pharmacy", to: "lift-gf", metres: 28 },
  { from: "laboratory", to: "xray", metres: 22 },
  { from: "laboratory", to: "lift-gf", metres: 42 },
  { from: "xray", to: "lift-gf", metres: 46 },
  { from: "water", to: "lift-gf", metres: 18 },
  { from: "lift-gf", to: "stairs-gf", metres: 7 },
  { from: "ramp", to: "wheelchair", metres: 12 },
  { from: "wheelchair", to: "toilets-gf", metres: 30 },
  { from: "stairs-gf", to: "toilets-gf", metres: 32, stairs: true },
  { from: "lift-gf", to: "lift-1", metres: 0, vertical: true },
  { from: "lift-1", to: "lift-2", metres: 0, vertical: true },
  { from: "stairs-gf", to: "stairs-1", metres: 18, stairs: true, vertical: true },
  { from: "stairs-1", to: "stairs-2", metres: 18, stairs: true, vertical: true },

  // First floor
  { from: "lift-1", to: "stairs-1", metres: 7 },
  { from: "lift-1", to: "waiting-a", metres: 34 },
  { from: "waiting-a", to: "opd-1", metres: 30 },
  { from: "waiting-a", to: "opd-2", metres: 24 },
  { from: "waiting-a", to: "opd-3", metres: 16 },
  { from: "waiting-a", to: "opd-4", metres: 20 },
  { from: "waiting-a", to: "opd-5", metres: 32 },
  { from: "waiting-a", to: "opd-6", metres: 24 },
  { from: "waiting-a", to: "opd-7", metres: 18 },
  { from: "waiting-a", to: "opd-8", metres: 14 },
  { from: "waiting-a", to: "toilets-1", metres: 27 },
  { from: "lift-1", to: "opd-1", metres: 28 },
  { from: "lift-1", to: "opd-2", metres: 22 },
  { from: "lift-1", to: "opd-3", metres: 18 },
  { from: "lift-1", to: "opd-4", metres: 26 },
  { from: "lift-1", to: "opd-5", metres: 38 },
  { from: "opd-1", to: "opd-2", metres: 12 },
  { from: "opd-2", to: "opd-3", metres: 12 },
  { from: "opd-3", to: "opd-4", metres: 12 },
  { from: "opd-4", to: "opd-5", metres: 12 },
  { from: "opd-6", to: "opd-7", metres: 12 },
  { from: "opd-7", to: "opd-8", metres: 12 },
  { from: "opd-1", to: "opd-6", metres: 15 },
  { from: "opd-2", to: "opd-7", metres: 15 },
  { from: "opd-3", to: "opd-8", metres: 15 },
  { from: "opd-4", to: "opd-5", metres: 12 },
  { from: "opd-5", to: "toilets-1", metres: 22 },
  { from: "opd-8", to: "waiting-a", metres: 14 },
  { from: "opd-6", to: "lift-1", metres: 26 },
  { from: "toilets-1", to: "stairs-1", metres: 37 },
  { from: "toilets-1", to: "lift-1", metres: 47 },

  // Second floor
  { from: "lift-2", to: "stairs-2", metres: 7 },
  { from: "lift-2", to: "nurses", metres: 30 },
  { from: "lift-2", to: "ward-4", metres: 34 },
  { from: "nurses", to: "ward-4", metres: 27 },
  { from: "nurses", to: "ward-5", metres: 18 },
  { from: "nurses", to: "ward-6", metres: 25 },
  { from: "nurses", to: "toilets-2", metres: 26 },
  { from: "ward-4", to: "ward-5", metres: 24 },
  { from: "ward-5", to: "ward-6", metres: 26 },
  { from: "ward-6", to: "toilets-2", metres: 28 },
  { from: "toilets-2", to: "stairs-2", metres: 20 },
  { from: "toilets-2", to: "lift-2", metres: 32 },
  { from: "ward-6", to: "stairs-2", metres: 27 },
];

export const helpDeskIds = ["help-desk", "nurses"];

export function placeById(id) {
  return places.find((place) => place.id === id) ?? places[0];
}

export function placesOnFloor(floor) {
  return places.filter((place) => place.floor === Number(floor));
}

export function floorLabel(floor, language = "en") {
  const level = Number(floor);
  if (level === 0) return language === "hi" ? "ग्राउंड फ़्लोर" : "Ground floor";
  if (language === "hi") {
    if (level === 1) return "पहली मंज़िल";
    if (level === 2) return "दूसरी मंज़िल";
    if (level === 3) return "तीसरी मंज़िल";
    return `${level} मंज़िल`;
  }
  return `Floor ${level}`;
}
