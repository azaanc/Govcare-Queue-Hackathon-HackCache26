# OPD Saathi — GovCare Queue

**A bilingual, accessibility-first patient flow for government hospital OPDs: register in your own language, get a token, see your real place in the queue, follow a step-free route to the right room, and reach Emergency without a token.**

Built for the GovCare Queue hackathon project by **Azaan Asif Chowdhary** and **Ayaan Choudhary**.

- Live app: 'https://govcarequeue.vercel.app/'
- **Patient app:** `/#/opd`
- **Staff dashboard:** `/#/staff`
- **Waiting-room board:** `/#/board`
- **Registration counter:** `/#/staff/counter`
- **Pitch Deck:** `https://gamma.app/docs/GovCare-Queue-3h4ru76fz591ceg`

---

## The problem

Government hospital OPDs make patients wait hours to register, get a paper slip and see a doctor. Then the slip sends them to a room or ward they cannot find, in a building whose signs they may not read.

That burden falls hardest on elderly patients, people with disabilities, people who read little English, and people who rarely use smartphones — the people who can least afford a wasted morning.

## Who this is for

The primary user is **Kamla, 62**, who visits alone, reads a little Hindi, uses a basic Android phone, walks slowly and avoids stairs. The app is also designed for:

- Patients who need a helper to fill in forms (assisted mode)
- Wheelchair users and people with mobility aids
- Family members registering someone else
- People with low literacy or limited English
- OPD reception staff and doctors running queues
- Anyone in the waiting hall who needs to know when their token is called

---

## What it does — one line per screen

### Public hospital site (`/`)

A polished GovCare Queue hospital website: live service cards with waiting times, patient guidance, accessibility information and contact details.

### Language gate (`/#/opd`, first visit)

Asks the patient to choose **English** or **हिंदी**, each written in its own script, before any registration begins.

### Patient home (`/#/opd`)

Four large icon-and-word buttons — **Register**, **I have my slip**, **Find a place**, **Emergency** — plus an always-available **I need urgent help** control.

### Register (`/#/opd/register`)

Five one-question screens with a progress bar: first name, age, gender, optional mobile, and a doctor chosen from **picture cards with plain-language descriptions**. Includes an assisted-mode switch, microphone input on supported browsers, and **“Not sure? Ask at the help desk”** with directions.

### OPD slip (`/#/opd/slip`)

Shows the **token, first name, department, room, floor, doctor, people ahead and estimated wait**, with a QR code that opens this patient’s queue screen. Can be **saved as an image, printed, read aloud, or shown in large type to staff**.

### My turn (`/#/opd/turn`)

Live place in the queue, the token being served, the doctor’s status, the estimated wait and what to do next. When **three or fewer people are ahead**, the phone vibrates, makes a sound, shows a banner, raises a browser notification and displays a **simulated SMS**. When called, it shows the room in large type with directions.

### I have my slip (`/#/opd/slip-lookup`)

Find a turn by typing the token, or scan the slip’s QR code with the camera where the browser supports `BarcodeDetector`.

### Find a place (`/#/opd/find`)

Search any room, ward, lab, pharmacy, toilet or water point. Draws the route on an **inline SVG floor plan** for all three floors, with step-by-step directions and landmarks. Uses **Dijkstra’s shortest path** over the hospital graph. **Avoid stairs** excludes stair edges and routes through lifts and ramps. Includes **Listen**, **I’m lost** (nearest help desk) and a large bilingual card to show staff.

### Emergency (`/#/opd/emergency`)

The full red Emergency screen: danger signs, “go now, no token”, Casualty directions and **112 / 108** call buttons. Reachable from every screen.

### Settings (`/#/opd/settings`)

Language, three text sizes, high contrast, read aloud, assisted mode, phone alerts and **Avoid stairs**.

### Staff dashboard (`/#/staff`)

Every department’s live queue with now-serving token, waiting count, average wait and overcrowding status. Call next, no-show, send to end, move to another department, set doctor status (available / break until / running late), see urgent flags at the top until marked seen, plus demo controls.

### Registration counter (`/#/staff/counter`)

Staff register a patient in a few taps, including someone with no phone, and print the slip.

### Waiting-room board (`/#/board`)

A large-screen TV view showing the now-serving token, next three tokens and delays for every room, **alternating between English and Hindi**, and announcing each called token aloud.

### Also in the repo

The original **GovCare Queue patient portal** (header → Patient portal) and **staff portal** (header → Staff access) remain available. They demonstrate check-in, a digital token, predictive queueing, aftercare, a staff login and a bottleneck heatmap. They use the same design system and are not required for the OPD Saathi demo.

---

## How emergencies are handled

Emergency care is the one flow that must never depend on registration, a token, a queue or a language choice.

- **A red Emergency button is on every screen**, including before registration and on the Board. It opens the same Emergency screen.
- The **first registration screen lists the danger signs**: chest pain, trouble breathing, heavy bleeding, fainting or not waking, sudden weakness or a drooping face, a serious injury, a pregnant woman who is bleeding or in severe pain, and a child who is very unwell.
- The Emergency screen says plainly: **go to Casualty now, you do not need a token**, and shows the walking route to Casualty.
- **112** (all-in-one emergency) and **108** (ambulance) are one tap away.
- **I need urgent help** is available at all times. It sends a flag to the top of the staff dashboard, with a sound, until a staff member marks it seen.
- The app does **not** assess urgency. It never says a case can wait. It never asks an urgent patient to register first. **Only qualified hospital staff decide who is urgent.**

### Why the app never decides who is urgent

Triage is a clinical judgement. A symptom that looks minor to a patient — or to a model — can be a time-critical emergency. Letting software decide would risk delaying care and would shift clinical responsibility onto an unqualified system. OPD Saathi therefore has one job in an emergency: **show the way, show the numbers, raise the flag, and get a human involved immediately.**

---

## Design decisions and why

| Decision | Why |
| --- | --- |
| **Assisted mode** | Kamla may not be the one typing. One switch gives larger text, read-aloud and stair-free routing, and tells staff a helper filled the form. |
| **Picture cards, not department lists** | “General Medicine” means little to many patients. Cards pair an icon with plain words — *fever, cough, BP, sugar* — so the choice is recognisable without reading English. |
| **Avoid stairs by default in assisted mode** | Walking slowly or avoiding stairs should not require finding a setting. Lifts and ramps become the default route. |
| **English and Hindi, chosen before anything else** | A patient cannot consent to a form they cannot read. Language is the first decision, and every label, landmark, direction and announcement switches with it. |
| **Read aloud everywhere** | Reading is a barrier for many older patients. Every important screen has a Listen control, and assisted mode can read automatically. |
| **One question per registration screen** | Five short steps are less frightening than one long form, and a progress bar shows how much is left. |
| **Back keeps every answer + draft autosave** | Losing answers is a common reason people abandon a form or need staff help. |
| **Large tap targets and high contrast** | Designed for a 360px basic Android phone, for shaky hands and poor eyesight, and for use in a bright hospital corridor. |
| **A large bilingual card for staff** | When navigation fails, the fastest fix is a human. The card shows the destination in the patient’s language and English. |
| **No Aadhaar or ABHA** | The brief explicitly forbids real identity numbers. The slip shows only token, first name and department. |

---

## How waiting time is worked out

For each department:

1. Take the **average consultation time of the last 10 consultations**. If there are fewer than 10, use the sample average in `departments.js`.
2. For a patient with **N people ahead**, multiply `N × average`.
3. Add the doctor’s **reported delay** in minutes.
4. Round to the nearest **5 minutes**.
5. Show it as **“about … minutes”**.

```
estimated wait = round5(people ahead × average of last 10 consults + reported doctor delay)
```

The estimate is recalculated whenever the queue moves, a delay is reported or a doctor is reassigned. When three or fewer people are ahead, the patient is treated as “close to turn” and receives the near-turn alerts. When the token is called, the screen shows **“It’s your turn”** with the room.

This is a demonstration formula, not a clinically validated prediction. A real deployment would use live consultation timestamps and clinician-entered service times.

---

## How it improves a hospital visit today

| Today | With OPD Saathi |
| --- | --- |
| Queue at a counter to register on paper | Register from home or the waiting hall in Hindi, with a helper if needed |
| A paper slip with a room number and no directions | A digital slip with a QR code, room, floor and live queue screen |
| No idea how long the wait is, so people crowd the corridor | A visible position, estimated wait and a near-turn alert |
| Everyone waits in the same place to hear a token called | Wait comfortably, get an SMS-style alert and a called-token screen |
| Asking three people where Room 3 is | A step-free route with landmarks, read aloud, plus a card to show staff |
| Urgent patients waiting behind a queue | A separate Emergency path and an urgent flag that reaches staff immediately |
| Staff juggling paper lists and shouting names | One dashboard to call, transfer, flag no-shows and set doctor delays |
| People who cannot read English left behind | Full Hindi UI, read aloud, picture cards and assisted mode |

---

## How to run it(locally)

**Requirements:** Node.js 20.19+ (22 or 24 recommended).

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

Production build:

```bash
npm run build
npm run preview
```

Build output is `dist/`.

### Recommended demo setup

Open **three browser windows in the same browser profile, side by side**:

1. **Patient:** `/#/opd`
2. **Staff:** `/#/staff`
3. **Board:** `/#/board`

Use **Reset everything** on the staff dashboard before the run. Queues and flags sync between these tabs through `localStorage` and `BroadcastChannel`.

---

## What is simulated

Everything is fictional and client-side:

- The hospital, all patients, staff names, tokens, queues and consultation histories
- No backend, database, payment or real hospital integration
- No real login on the OPD staff dashboard; the GovCare staff portal only demonstrates a demo login
- SMS is a **simulated preview**, not a real message
- QR codes point to this app’s own queue route
- Phone vibration, browser notifications and spoken announcements depend on the device and permissions
- Microphone recognition and camera QR scanning depend on browser support
- Queue state is shared **only between tabs in the same browser**, not between devices
- Waiting times are a demo formula, not a medical prediction
- No Aadhaar, ABHA or real patient data is collected

---

## What we would build next

1. **A real backend and hospital queue integration**, so staff and patients on different devices see the same queue.
2. **Verified staff login with roles and an audit trail** for every call, transfer, flag and status change.
3. **A production SMS provider** for near-turn and called-token messages, with Hindi templates and delivery receipts.
4. **Real multilingual voice and text**, including more languages and recorded audio for low-literacy users.
5. **Offline maps and a native app shell**, so directions work on weak hospital Wi-Fi.
6. **Live consultation timing** instead of the demo delay model, plus per-doctor schedules.
7. **Accessibility testing with patients**, wheelchair users and elderly users in a real hospital corridor.
8. **A proper triage protocol owned by clinicians**, with staff alerts and escalation — never an app decision.
9. **Printing and kiosk hardware integration** at registration counters.
10. **Analytics for hospital administrators**, with privacy safeguards, to reduce bottlenecks.

---

## Tech and project structure

- **React 19 + Vite 7 + Tailwind CSS 4**
- **TypeScript** for the original hospital site, **plain JavaScript JSX** for the OPD Saathi module
- **lucide-react** icons and **qrcode.react** for real SVG/PNG QR codes
- No UI component library, no backend, no database, no image downloads at runtime

```
src/
  components/        GovCare Queue public hospital site
  portal/            Original patient portal and staff portal
  data/
    hospital.js      City District Hospital floors, places, landmarks and path graph
    departments.js   OPD rooms, doctors, hours, sample consultation times
    patients.js      Fictional patients and seed queues
  i18n/
    en.js            OPD Saathi English text
    hi.js            OPD Saathi Hindi text
  opd/
    OpdProvider.jsx  Shared queue state, localStorage + BroadcastChannel, wait formula
    OpdApp.jsx       Route handling for every OPD screen
    OpdUI.jsx        Shared accessible components, SVG floor plans, settings
    PatientCore.jsx  Home, registration, OPD slip, settings
    PatientGuidance.jsx  My turn, slip lookup, Find a place, Emergency
    StaffBoard.jsx   Staff dashboard, counter, waiting-room board
    routeUtils.js    Dijkstra shortest path and bilingual turn-by-turn instructions
  i18n.ts            German/French/English for the original portal
  portal/            Original portal screens and state
```

## Important note on privacy and safety

This is a **demo prototype**, not a clinical system. It must not be used to make decisions about real patients. Do not enter real names, phone numbers, health records, Aadhaar numbers or ABHA numbers.

---


## Known limitations

- State is per-browser, not per-hospital. Different devices do not share a queue.
- No real authentication. The OPD staff dashboard is intentionally open for the demo.
- The waiting-time model is illustrative, not clinically validated.
- Speech recognition, speech synthesis, vibration, notifications and QR scanning depend on the browser, the operating system and the permissions granted.
- The app does not connect to any real queue, medical record, SMS gateway or mapping service.
- The app never assesses urgency. Emergency decisions remain with hospital staff.
