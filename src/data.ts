import {
  Accessibility,
  Activity,
  ClipboardPlus,
  Headphones,
  MapPin,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "Services", href: "#services" },
  { label: "Queue Status", href: "#live-queue" },
  { label: "Find Your Way", href: "#find-your-way" },
  { label: "Accessibility", href: "#accessibility" },
];

export type QuickLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const quickLinks: QuickLink[] = [
  { label: "Live Queue", href: "#live-queue", icon: Activity },
  { label: "Patient Registration", href: "#visit", icon: ClipboardPlus },
  { label: "Find a Department", href: "#find-your-way", icon: MapPin },
  { label: "Accessibility", href: "#accessibility", icon: Accessibility },
  { label: "Contact Desk", href: "#contact-desk", icon: Headphones },
];

export type Service = {
  id: string;
  name: string;
  location: string;
  waitMinutes: number;
  availability: string;
  description: string;
  linkLabel: string;
  image: string;
  alt: string;
  href: string;
};

export const services: Service[] = [
  {
    id: "general-opd",
    name: "General OPD",
    location: "Outpatient Department · Block A, Level 1",
    waitMinutes: 25,
    availability: "Open now",
    description:
      "General consultations, follow-ups and referrals for adults and children.",
    linkLabel: "View OPD queue",
    image: "/images/consultation.jpg",
    alt: "A doctor listening attentively to a patient during a consultation",
    href: "#live-queue",
  },
  {
    id: "laboratory",
    name: "Laboratory",
    location: "Diagnostics · Block B, Level 0",
    waitMinutes: 15,
    availability: "Open now",
    description:
      "Blood tests, sample collection and routine diagnostic investigations.",
    linkLabel: "View laboratory queue",
    image: "/images/laboratory.jpg",
    alt: "A laboratory professional reviewing a blood sample",
    href: "#live-queue",
  },
  {
    id: "pharmacy",
    name: "Pharmacy",
    location: "Medicines · Block A, Level 0",
    waitMinutes: 10,
    availability: "Open now",
    description:
      "Prescription collection, medication guidance and refill support.",
    linkLabel: "View pharmacy queue",
    image: "/images/pharmacy.jpg",
    alt: "A pharmacist assisting a patient at the hospital pharmacy counter",
    href: "#live-queue",
  },
];

export type Guide = {
  id: string;
  title: string;
  category: string;
  readTime: string;
  image: string;
  alt: string;
  href: string;
};

export const guides: Guide[] = [
  {
    id: "queue",
    title: "Track your queue before arriving",
    category: "Queue status",
    readTime: "3 min read",
    image: "/images/queue-support.jpg",
    alt: "A patient coordinator helping an older visitor with queue information in the hospital atrium",
    href: "#queue",
  },
  {
    id: "wayfinding",
    title: "Find the right department faster",
    category: "Wayfinding",
    readTime: "4 min read",
    image: "/images/wayfinding.jpg",
    alt: "A visitor following directional signs in a bright hospital corridor",
    href: "#wayfinding",
  },
  {
    id: "accessible-routes",
    title: "Accessible routes for every patient",
    category: "Accessibility",
    readTime: "5 min read",
    image: "/images/accessibility.jpg",
    alt: "A nurse accompanying an elderly patient in a wheelchair along a step-free hospital corridor",
    href: "#accessible-routes",
  },
];

export type VisitCard = {
  id: string;
  category: string;
  title: string;
  description: string;
  linkLabel: string;
  image: string;
  alt: string;
  topicId: string;
};

export const visitCards: VisitCard[] = [
  {
    id: "prepare",
    category: "Before you arrive",
    title: "Patient guidance",
    description:
      "Know what to bring, when to register and who to ask for at each step of your visit.",
    linkLabel: "Prepare for your visit",
    image: "/images/consultation.jpg",
    alt: "A doctor listening attentively to a patient during a consultation",
    topicId: "prepare",
  },
  {
    id: "navigation",
    category: "Getting around",
    title: "Hospital navigation",
    description:
      "Follow clear, step-free directions from the entrance to the department you need.",
    linkLabel: "Plan your route",
    image: "/images/wayfinding.jpg",
    alt: "A visitor following directional signs in a bright hospital corridor",
    topicId: "navigation",
  },
  {
    id: "queue-help",
    category: "During your visit",
    title: "Queue assistance",
    description:
      "Our patient coordinators can help with registration, queue changes and priority support.",
    linkLabel: "Get queue support",
    image: "/images/queue-support.jpg",
    alt: "A patient coordinator helping an older visitor with queue information in the hospital atrium",
    topicId: "queue-help",
  },
];

export type SearchItem = {
  label: string;
  detail: string;
  type: "Department" | "Service" | "Accessibility";
  href: string;
};

export const searchItems: SearchItem[] = [
  { label: "General OPD", detail: "Block A · Level 1", type: "Department", href: "#services" },
  { label: "Laboratory", detail: "Block B · Level 0", type: "Department", href: "#services" },
  { label: "Pharmacy", detail: "Block A · Level 0", type: "Department", href: "#services" },
  { label: "Cardiology", detail: "Block C · Level 2", type: "Department", href: "#find-your-way" },
  { label: "Radiology", detail: "Block B · Level 1", type: "Department", href: "#find-your-way" },
  { label: "Maternity", detail: "Women's Centre · Level 3", type: "Department", href: "#find-your-way" },
  { label: "Patient registration", detail: "Main entrance · Ground floor", type: "Service", href: "#visit" },
  { label: "Live queue status", detail: "Updated every few minutes", type: "Service", href: "#live-queue" },
  { label: "Queue assistance desk", detail: "Main atrium · Ground floor", type: "Service", href: "#visit" },
  { label: "Wheelchair assistance", detail: "East entrance · Mobility desk", type: "Accessibility", href: "#accessibility" },
  { label: "Step-free routes", detail: "All wings · Lift access", type: "Accessibility", href: "#accessibility" },
  { label: "Accessible parking", detail: "Level 0 · East entrance", type: "Accessibility", href: "#accessibility" },
];

export type InfoTopic = {
  id: string;
  kicker: string;
  title: string;
  summary: string;
  paragraphs: string[];
  points?: { title: string; text: string }[];
  note?: string;
  cta?: string;
};

export const infoTopics: InfoTopic[] = [
  {
    id: "queue",
    kicker: "Patient guide · Queue status",
    title: "Track your queue before arriving",
    summary:
      "Check current waits, understand how your position is calculated, and plan when to leave home.",
    paragraphs: [
      "GovCare Queue shows an estimated wait for every high-volume department. The figure is based on the number of registered patients, the average consultation time and the clinicians currently on duty. It is a guide, not a guaranteed appointment time.",
      "Please register or confirm your booking as soon as you arrive. If you cannot attend, cancel or reschedule so that someone else can use the place. Your live position is displayed on the waiting-area screens and in your patient portal.",
    ],
    points: [
      { title: "Updated regularly", text: "Estimates refresh every 2–5 minutes throughout the day." },
      { title: "Emergency priority", text: "Urgent cases are seen first and may extend routine waits." },
      { title: "Arrive 10 minutes early", text: "Allow time for registration, identification and insurance checks." },
    ],
    note: "Waiting can change without notice. Contact the patient desk if you need assistance with your appointment.",
    cta: "View live queue",
  },
  {
    id: "wayfinding",
    kicker: "Patient guide · Wayfinding",
    title: "Find the right department faster",
    summary:
      "Use entrance-specific directions, floor guides and the help desk to reach your appointment on time.",
    paragraphs: [
      "Enter through the main atrium on the north side for Outpatient Services, Diagnostics and Patient Registration. The East entrance is closest to the Mobility Desk, accessible parking and step-free access to the lower ground floor.",
      "All wings are connected by public lifts. Department signs follow a consistent colour system: deep blue for clinical services, pale blue for diagnostics and green for visitor facilities. Staff and volunteers at the atrium can walk you through a route if you are unsure.",
    ],
    points: [
      { title: "Block A", text: "General OPD, Pharmacy and Patient Registration." },
      { title: "Block B", text: "Laboratory, Imaging and Radiology." },
      { title: "Block C", text: "Specialist clinics, including Cardiology." },
    ],
    note: "Allow at least 15 minutes to park, register and reach your department from the main entrance.",
    cta: "View accessible routes",
  },
  {
    id: "accessible-routes",
    kicker: "Accessibility · Step-free access",
    title: "Accessible routes for every patient",
    summary:
      "Clear, step-free ways through the hospital, with support for mobility needs and sensory sensitivities.",
    paragraphs: [
      "Every public area can be reached without using stairs. Step-free entrances are available at the main atrium and the East entrance, where accessible parking is located. Lifts are wide enough for wheelchairs and mobility scooters, and our route map highlights accessible toilets and rest areas.",
      "A trained mobility team can meet you at arrivals, help with a wheelchair and accompany you to your department. For sensory needs, there are quiet waiting spaces on each level and hearing loops at registration and consultation desks.",
    ],
    points: [
      { title: "Mobility support", text: "Wheelchairs and assistance available at both entrances." },
      { title: "Step-free routes", text: "Lifts and level access to all patient services." },
      { title: "Quiet spaces", text: "Low-stimulation waiting rooms on levels 0–3." },
    ],
    note: "To arrange support before your visit, call the Mobility Desk on 0800 600 200.",
    cta: "Accessibility information",
  },
  {
    id: "accessibility",
    kicker: "Accessibility at GovCare Queue",
    title: "Healthcare navigation for everyone",
    summary:
      "Practical, person-centred support for elderly patients, wheelchair users and everyone visiting the hospital.",
    paragraphs: [
      "Step-free routes connect every public entrance with outpatient services, diagnostics, the pharmacy and visitor facilities. Our teams can meet you at arrivals, help with a wheelchair and accompany you directly to the right department.",
      "We also provide clear large-print directions, hearing loops at reception and consultation desks, and quiet waiting areas. Tell the patient desk what you need — before or during your visit — and we will make the necessary arrangements.",
    ],
    points: [
      { title: "Step-free access", text: "Main and East entrances, all public floors." },
      { title: "Mobility support", text: "Wheelchairs, escorting and accessible parking." },
      { title: "Elderly patient support", text: "Priority seating and staff assistance on request." },
    ],
    note: "Accessibility Desk · Ground floor, East wing · 0800 600 200",
    cta: "Contact the accessibility desk",
  },
  {
    id: "prepare",
    kicker: "Patient guidance · Before you arrive",
    title: "Prepare for a smoother visit",
    summary:
      "A short checklist to help registration, consultation and collection run without delay.",
    paragraphs: [
      "Bring a photo ID, your appointment letter or patient reference number, and any referral documents. If you take regular medication, a current list can help your clinician. Arriving around ten minutes before your appointment leaves time for registration.",
      "For payment or insurance questions, stop at the patient desk on the ground floor before your consultation. A coordinator can confirm coverage and let you know about any fees in advance.",
    ],
    points: [
      { title: "Identification", text: "A government photo ID and your patient number." },
      { title: "Records", text: "Referral letters, test results and a medication list." },
      { title: "Payment", text: "Insurance details or a valid exemption certificate." },
    ],
    note: "Need help preparing? Contact the patient desk on 0800 600 100.",
    cta: "Contact the patient desk",
  },
  {
    id: "navigation",
    kicker: "Patient guidance · Getting around",
    title: "Plan your route through the hospital",
    summary:
      "Know which entrance and lift to use before you step inside.",
    paragraphs: [
      "The main atrium entrance is the most direct route to General OPD, Patient Registration and the Pharmacy. Use the East entrance for accessible parking and the Mobility Desk. Both entrances connect to all clinical levels through public lifts.",
      "Wayfinding screens are located at every lift lobby and list approximate walking times. If you are uncertain, ask any staff member — they can point you to the department or arrange an escort for patients who need one.",
    ],
    points: [
      { title: "From the main atrium", text: "OPD is on Level 1; Pharmacy and Registration on Level 0." },
      { title: "From the East entrance", text: "Mobility Desk is immediately to the left of the entrance." },
      { title: "Lift access", text: "Public lifts A and B serve all clinical floors." },
    ],
    note: "Allow 10–15 minutes between registration and your appointment time.",
    cta: "Open accessible routes",
  },
  {
    id: "queue-help",
    kicker: "Patient guidance · During your visit",
    title: "Get queue and registration support",
    summary:
      "A patient coordinator can help when your plans change or you need more assistance.",
    paragraphs: [
      "Visit the queue assistance desk in the main atrium if you need help checking in, updating an appointment or understanding your waiting time. Coordinators can also confirm whether you are in the right queue.",
      "If you feel unwell while waiting, speak to any member of staff immediately. Emergency and urgent patients are clinically prioritised, and your place in the routine queue will be held while you are assessed.",
    ],
    points: [
      { title: "Main atrium desk", text: "Open Monday to Saturday, 07:00–20:00." },
      { title: "Telephone support", text: "Call 0800 600 100 for appointment and queue help." },
      { title: "Interpreter support", text: "Ask the desk team; language assistance is available." },
    ],
    note: "If your condition worsens, alert staff immediately or go to the Emergency Department on Level 0.",
    cta: "Talk to a patient coordinator",
  },
];

export const footerColumns = [
  {
    title: "Hospital services",
    links: [
      { label: "Outpatient services", href: "#services" },
      { label: "Laboratory & diagnostics", href: "#services" },
      { label: "Pharmacy", href: "#services" },
      { label: "Live queue status", href: "#live-queue" },
      { label: "All departments", href: "#find-your-way" },
    ],
  },
  {
    title: "Patient information",
    links: [
      { label: "First visit checklist", href: "#prepare" },
      { label: "Access & visiting", href: "#visit" },
      { label: "Accessibility", href: "#accessibility" },
      { label: "Patient rights", href: "#contact-desk" },
      { label: "Feedback & complaints", href: "#contact-desk" },
    ],
  },
];
