/* Waymark prototype. Sample scenario only. No live location, vision, or calls. */
(function () {
  const $ = (id) => document.getElementById(id);

  const PLACES = {
    citycare: { name: "CityCare Pharmacy", kind: "Pharmacy", area: "Church Street", metres: 250, distance: "250 metres", entrance: "Reported main entrance faces Church Street, beside the bus stop. Floor information is not available.", phone: "080 0000 1101", cat: "pharmacy" },
    medplus: { name: "MedPlus", kind: "Pharmacy", area: "Brigade Road", metres: 480, distance: "480 metres", entrance: "Reported entrance is on Brigade Road. Door side is not confirmed.", phone: "080 0000 1102", cat: "pharmacy" },
    apollo: { name: "Apollo Pharmacy", kind: "Pharmacy", area: "Residency Road", metres: 620, distance: "620 metres", entrance: "Reported entrance is at street level. This may be out of date.", phone: "080 0000 1103", cat: "pharmacy" },
    home: { name: "Home", kind: "Saved place", area: "12th Main, Indiranagar", metres: 1800, distance: "1.8 kilometres", entrance: "Saved note: ground-floor gate on 12th Main.", phone: "", cat: "saved" },
    work: { name: "Work", kind: "Saved place", area: "City College, Gate 2", metres: 950, distance: "950 metres", entrance: "Saved note: Gate 2 faces the bus bay.", phone: "", cat: "saved" },
    metro: { name: "MG Road Metro", kind: "Metro station", area: "MG Road", metres: 400, distance: "400 metres", entrance: "Reported Entrance A is at the east end of the station. Platform data is not live.", phone: "", cat: "transit" },
    bus: { name: "Church Street bus stop", kind: "Bus stop", area: "Church Street", metres: 180, distance: "180 metres", entrance: "The stop is beside CityCare Pharmacy in this sample. Routes listed: 201 and 335.", phone: "", cat: "transit" },
    hospital: { name: "City Hospital", kind: "Hospital", area: "Richmond Road", metres: 1100, distance: "1.1 kilometres", entrance: "Reported emergency entrance is on Richmond Road, separate from the main lobby.", phone: "080 0000 1911", cat: "hospital" },
    police: { name: "Cubbon Park police help desk", kind: "Police", area: "MG Road", metres: 700, distance: "700 metres", entrance: "Reported public desk faces MG Road. Hours are not confirmed.", phone: "080 0000 1000", cat: "police" },
    restroom: { name: "Public restroom", kind: "Restroom", area: "MG Road Metro", metres: 420, distance: "420 metres", entrance: "Reported accessible cubicle is inside Entrance A. Availability is not live.", phone: "", cat: "restroom" },
    atm: { name: "Alliance Bank ATM", kind: "ATM", area: "MG Road", metres: 90, distance: "90 metres", entrance: "Reported ATM is on the sidewalk, to the right of the bank doors.", phone: "", cat: "atm" },
    college: { name: "City College", kind: "College", area: "Gate 2", metres: 950, distance: "950 metres", entrance: "Gate 2 faces the bus bay. Reception is reported just inside, on the right.", phone: "", cat: "college" },
    cafe: { name: "South Indian Cafe", kind: "Restaurant", area: "Church Street", metres: 300, distance: "300 metres", entrance: "Reported door is at street level, two shops past the pharmacy.", phone: "", cat: "food" }
  };

  const ROUTES = {
    accessible: {
      name: "Sidewalk route",
      time: "9 minutes",
      distance: "620 metres",
      turns: "3 turns",
      crossings: "2 mapped crossings",
      access: "Uses mapped sidewalks and avoids a staircase on Museum Road. One crossing has no recorded pedestrian signal.",
      confidence: "Medium confidence. Sample map dated 2 November 2026.",
      hazards: "Unverified report: broken tactile paving at Church Street. It may already have changed."
    },
    short: {
      name: "Shorter route",
      time: "6 minutes",
      distance: "410 metres",
      turns: "2 turns",
      crossings: "3 crossings, including 1 unmarked",
      access: "Part of this route has no mapped sidewalk. It is shorter and a poorer walking route.",
      confidence: "Low confidence for walking access.",
      hazards: "Includes an unmarked crossing. This route is not described as safe."
    },
    signals: {
      name: "Signalized crossings route",
      time: "11 minutes",
      distance: "740 metres",
      turns: "4 turns",
      crossings: "2 crossings with mapped signals",
      access: "Passes a metro entrance that is often staffed. Lighting data is incomplete, so this route is not preferred for light.",
      confidence: "Medium confidence. Signal records can be out of date.",
      hazards: "No construction is recorded in the sample. That does not mean the street is clear."
    }
  };

  const LANG_SAMPLE = {
    English: { lang: "en-IN", line: "Continue straight for about forty metres." },
    Hindi: { lang: "hi-IN", line: "लगभग चालीस मीटर तक सीधे चलते रहें।" },
    Kannada: { lang: "kn-IN", line: "ನೇರವಾಗಿ ಮುಂದೆ ಹೋಗಿ." },
    Tamil: { lang: "ta-IN", line: "நேராக முன்னால் செல்லுங்கள்." }
  };

  const S = {
    screen: "splash",
    stack: [],
    theme: "light",
    wire: false,
    large: false,
    mode: "blind",
    lang: "English",
    rate: "Normal",
    feedback: "both",
    hapticScale: 1,
    hapticSwap: false,
    alertMode: "fewer",
    offline: false,
    mapReady: false,
    gpsOk: true,
    micOk: false,
    locOk: false,
    contact: null,
    sharing: false,
    notifyArrival: false,
    query: "",
    placeId: "citycare",
    routeId: "accessible",
    step: 0,
    recovery: false,
    listening: false,
    voiceState: "idle",
    voiceReply: "",
    noisy: false,
    lastSpoken: "Waymark. Walking guidance. This is a prototype.",
    log: [],
    obstacleCount: 0,
    tutorial: 0,
    prefs: { voice: true, large: false, haptic: true, reader: true },
    report: "",
    reportSent: false,
    scene: "",
    sign: "",
    sosNote: "",
    listenTimer: 0,
    listenToken: 0
  };

  const SCREENS = [
    ["Onboarding", "splash", "1. Splash", "A quiet start. The name is spoken, and nothing else competes with it.", "Waymark. Walking guidance."],
    ["Onboarding", "welcome", "2. Welcome", "One job is stated: walk with less dependence on other people, without pretending the app can see traffic.", "Waymark helps you walk with voice and touch. Your cane, dog, and judgment still lead."],
    ["Onboarding", "intro", "3. Introduction", "Three rules before any map: voice leads, safety tools stay primary, and extra detail is opt-in.", "Three rules. Voice leads. Your mobility aids lead. Extra detail waits until you ask."],
    ["Onboarding", "prefs", "4. Accessibility preferences", "Preferences are switches with on or off text, not a visual theme picker.", "Choose what to switch on. Each choice says on or off."],
    ["Onboarding", "mode", "5. Blind or low vision", "Blind mode is text and sound. Low vision mode adds a large direction word and bigger type. Both keep the same order of controls.", "Choose blind mode or low vision mode. You can change this later."],
    ["Onboarding", "language", "6. Language", "Speech samples change language. The prototype interface stays English so the study remains reviewable.", "Choose a speech language. The sample phrase will play in that language."],
    ["Onboarding", "voiceSetup", "7. Voice settings", "Rate and output channel are chosen before the first trip, when there is no time pressure.", "Choose speech rate, and choose audio, haptic, or both."],
    ["Onboarding", "haptic", "8. Haptic tutorial", "Patterns are taught with words first, then a vibration the user can replay.", "Haptic tutorial. One pulse means straight. Two means left. Three means right."],
    ["Onboarding", "permissions", "9. Permissions", "Microphone and location can be skipped. The app explains what becomes unavailable.", "Location and microphone are optional. You can skip either one."],
    ["Onboarding", "contact", "10. Trusted contact", "A contact is optional. Emergency help still opens hospitals and the police desk.", "You can add one trusted contact, or skip this."],
    ["Onboarding", "tutorial", "11. Interactive tutorial", "The user practices the microphone, repeat, a caution label, and the emergency button before any trip.", "Practice four controls. Nothing is sent and no route starts."],
    ["Main", "home", "12. Home", "The microphone is the primary control. Typing, saved places, and emergency are always available beside it.", "Home. You are on MG Road, near Alliance Bank, in this sample."],
    ["Main", "search", "13. Destination search", "Typing is the fallback when speech fails or the street is loud.", "Search. Type a place, or speak."],
    ["Main", "voice", "14. Voice assistant", "Commands are confirmed in text before a route starts. Failed speech offers typing.", "Voice assistant. Speak a command, or choose one."],
    ["Main", "results", "15. Search results", "Results give distance and say whether an entrance note exists. They are not ranked as safe.", "Search results."],
    ["Main", "nearby", "16. Nearby places", "Categories are words, so a screen reader does not have to interpret a map pin.", "Nearby places in the MG Road sample."],
    ["Main", "destination", "17. Destination details", "Arrival is described as a reported entrance, with a phone number when one exists.", "Destination details."],
    ["Main", "routes", "18. Route comparison", "Routes are compared by sidewalk, crossings, and confidence. None is labeled safe.", "Three walking routes. None is certified safe."],
    ["Main", "overview", "19. Navigation overview", "The user hears the compromise before movement starts: crossings, confidence, and data age.", "Review the route, then start guidance when you are ready."],
    ["Main", "navigating", "20. Active navigation", "One instruction is on screen. Progress is a step count, not a color bar.", "Guidance is running."],
    ["Main", "turn", "21. Turn-by-turn list", "The whole remaining route is readable without leaving the trip.", "All maneuvers for this route."],
    ["Main", "paused", "22. Navigation paused", "Speech stops. The last instruction remains on screen.", "Guidance is paused. You have not arrived."],
    ["Main", "deviation", "23. Route deviation", "Leaving the route is described as a maybe. Recalculation is offered, not forced.", "You may have left the suggested route."],
    ["Main", "recalc", "24. Recalculation", "The new route is announced as a replacement, not as a safer street.", "A new route from this point is ready."],
    ["Main", "arrival", "25. Arrival", "Arrival means near the destination. The user confirms the entrance themselves.", "You are near the destination. Please confirm the entrance yourself."],
    ["Assist", "obstacles", "26. Obstacle awareness", "Alerts name the level, the direction, and the uncertainty. They defer to the cane or dog.", "Obstacle alert. This detection can be wrong."],
    ["Assist", "camera", "27. Scene description", "The sample description is labeled as a script. It does not claim a live camera reading.", "Scene description. This is a written example, not a live camera."],
    ["Assist", "sign", "28. Signboard reader", "Recognized text is repeated and the user is told it can be wrong.", "Sign reader. Point the phone, then listen to the text."],
    ["Assist", "crossing", "29. Crossing assistance", "The screen locates a mapped crossing and refuses to say when to cross.", "Crossing help. Waymark will not tell you when to cross."],
    ["Assist", "transit", "30. Public transport", "Stop names and sample route numbers are marked as not live.", "Public transport in the sample."],
    ["Assist", "facilities", "31. Nearby facilities", "Hospitals, police, restrooms, and ATMs are listed with distance, not a map.", "Nearby facilities."],
    ["Assist", "emergency", "32. Emergency assistance", "SOS is a labeled step, not the first tap. Other help does not require SOS.", "Emergency assistance. Nothing has been sent."],
    ["Assist", "sos", "33. SOS confirmation", "Confirmation names the contact. The prototype still does not dial.", "Confirm before alerting your contact. This prototype will not place a call."],
    ["Assist", "contacts", "34. Trusted contacts", "One contact can be replaced or removed. Removal stops sharing.", "Trusted contact."],
    ["Assist", "sharing", "35. Location sharing", "Sharing is opt-in, described in plain language, and stoppable.", "Journey sharing. Nothing leaves this browser."],
    ["Settings", "settings", "36. Accessibility settings", "The same choices from onboarding remain available during a trip.", "Accessibility settings."],
    ["Settings", "voiceSettings", "37. Voice and language", "Rate and language can change without restarting the app.", "Voice and language."],
    ["Settings", "hapticsCustom", "38. Haptic customization", "Intensity and a left-right swap are explicit because a forgotten swap is dangerous.", "Haptic patterns."],
    ["Settings", "notifications", "39. Notifications", "Users can reduce repeat alerts. Turning all guidance off is blocked.", "Notification settings."],
    ["Settings", "saved", "40. Saved places", "Home and work are large targets, not buried in a map.", "Saved places."],
    ["Settings", "history", "41. Journey history", "Past trips are text logs the user can repeat as a route.", "Recent journeys."],
    ["Settings", "offline", "42. Offline maps", "A saved map is clearly separate from obstacle detection, which stays unavailable offline.", "Offline maps."],
    ["Settings", "privacy", "43. Privacy and permissions", "Permissions can be withdrawn. Location sharing status is repeated here.", "Privacy. Data in this prototype stays in the browser."],
    ["Settings", "help", "44. Help", "Help restates the safety limits in the same voice as the product.", "Help and support."],
    ["Settings", "feedback", "45. Accessibility reports", "A report is stored locally and described as unverified.", "Report an access problem."]
  ];

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function ico(name) {
    const p = {
      mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M8 21h8"/>',
      back: '<path d="M15 5 8 12l7 7"/>',
      speaker: '<path d="M4 10h3l5-4v12l-5-4H4zM16 9a4 4 0 0 1 0 6"/>',
      search: '<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>'
    };
    return `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p[name] || ""}</svg>`;
  }
  function btn(html, act, arg, cls) {
    const a = arg != null && arg !== "" ? ` data-arg="${esc(arg)}"` : "";
    return `<button type="button" class="${cls || "btn btn-primary"}" data-act="${act}"${a}>${html}</button>`;
  }
  function place() { return PLACES[S.placeId] || PLACES.citycare; }
  function route() { return ROUTES[S.routeId] || ROUTES.accessible; }

  function steps() {
    const p = place();
    if (S.recovery) {
      return [
        { title: "Continue straight", metres: "25 metres", detail: `New route. Continue straight for about 25 metres toward ${p.name}. This replaces the earlier route. It is not a safety confirmation.`, haptic: "straight" },
        { title: "Entrance approach", metres: "15 metres", detail: `${p.name} is close. The reported entrance is about 15 metres ahead. Confirm the doorway yourself. Entrance notes can be wrong.`, haptic: "caution" }
      ];
    }
    if (S.placeId === "citycare" && S.routeId === "accessible") {
      return [
        { title: "Continue straight", metres: "40 metres", detail: "Continue straight for about 40 metres along MG Road. The mapped sidewalk is on your right.", haptic: "straight" },
        { title: "Intersection ahead", metres: "20 metres", detail: "An intersection is approaching. Slow down and check the crossing yourself before proceeding. A possible pole or signboard is slightly to your left. That detection is uncertain.", haptic: "caution", obstacle: true },
        { title: "Turn slightly right", metres: "30 metres", detail: "After you have crossed, turn slightly right toward the bus stop. Do this only after you have decided the crossing is clear.", haptic: "right" },
        { title: "Turn left", metres: "40 metres", detail: "Turn left after the bus stop, onto Church Street. CityCare Pharmacy is on this street in the sample.", haptic: "left" },
        { title: "Entrance approach", metres: "15 metres", detail: "Your destination entrance is about 15 metres ahead, slightly to your right. The note says the main door is beside the pharmacy awning. Please confirm it yourself.", haptic: "caution" }
      ];
    }
    return [
      { title: "Continue straight", metres: "40 metres", detail: `Continue straight for about 40 metres toward ${p.area}.`, haptic: "straight" },
      { title: "Intersection ahead", metres: "20 metres", detail: "An intersection is approaching. Slow down. A pedestrian crossing may be nearby. Check traffic yourself. Waymark cannot tell you when to cross.", haptic: "caution" },
      { title: "Turn slightly right", metres: "30 metres", detail: `Turn slightly right and continue toward ${p.name}.`, haptic: "right" },
      { title: "Entrance approach", metres: "15 metres", detail: `You are near ${p.name}. The reported entrance is about 15 metres ahead. Confirm it yourself.`, haptic: "caution" }
    ];
  }
  function step() {
    const list = steps();
    return list[Math.min(S.step, list.length - 1)];
  }
  function rateValue() {
    return S.rate === "Slow" ? 0.85 : S.rate === "Fast" ? 1.12 : 1;
  }
  function pattern(name) {
    let n = name;
    if (S.hapticSwap && n === "left") n = "right";
    else if (S.hapticSwap && n === "right") n = "left";
    const base = {
      straight: [90],
      left: [80, 100, 80],
      right: [80, 100, 80, 100, 80],
      caution: [340],
      urgent: [130, 70, 130, 70, 130, 70, 130]
    }[n] || [90];
    return base.map((x) => Math.round(x * S.hapticScale));
  }
  function hapticWords(name) {
    const swapped = S.hapticSwap;
    const map = {
      straight: "one short pulse means continue straight",
      left: swapped ? "three short pulses mean left, because you swapped the default" : "two short pulses mean left",
      right: swapped ? "two short pulses mean right, because you swapped the default" : "three short pulses mean right",
      caution: "one long pulse means caution",
      urgent: "repeated pulses mean urgent attention"
    };
    return map[name] || "";
  }
  function pulse(name) {
    if (S.feedback === "audio" || !name) return;
    if (navigator.vibrate) navigator.vibrate(pattern(name));
  }
  function speak(text, urgent) {
    S.lastSpoken = text;
    S.log.unshift(text);
    S.log = S.log.slice(0, 12);
    const node = $(urgent ? "assertive" : "polite");
    if (node) node.textContent = text;
    const say = $("c-say");
    if (say && (S.screen === "navigating" || urgent)) say.textContent = text;
    const allowTts = S.prefs.voice && S.feedback !== "haptic";
    if (!allowTts || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rateValue();
    u.lang = LANG_SAMPLE[S.lang].lang;
    window.speechSynthesis.speak(u);
  }
  function unlockSpeech() {
    if (!window.speechSynthesis || S.unlocked) return;
    S.unlocked = true;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(" "));
  }
  function screenText() {
    const screen = $("app")?.querySelector(".screen");
    if (!screen) return announcement();
    const copy = screen.cloneNode(true);
    copy.querySelectorAll("[data-act='read'], [aria-hidden='true'], .sr-only").forEach((el) => el.remove());
    copy.innerHTML = copy.innerHTML.replace(/></g, "> <");
    const text = copy.textContent.replace(/\s+/g, " ").trim();
    return text || announcement();
  }

  function statusLine() {
    const gps = !S.locOk ? "Location permission is off" : S.gpsOk ? "GPS ready, sample accuracy about 8 metres" : "GPS is too weak for turn guidance";
    const net = S.offline ? (S.mapReady ? "Offline, saved map available" : "Offline, no saved map") : "Online, sample data";
    const mode = S.mode === "low" ? "Low vision mode" : "Blind mode";
    return `${gps}. Battery 78 percent. ${net}. ${mode}.`;
  }
  function top(title, withBack) {
    const back = withBack === false ? "" : `<button type="button" class="icon-btn" data-act="back">${ico("back")} Back</button>`;
    return `<header class="top">${back}<h1>${esc(title)}</h1><button type="button" class="icon-btn" data-act="read">${ico("speaker")} Read</button></header>`;
  }
  function page(title, body, dock, withBack) {
    return `<div class="screen">${top(title, withBack)}<div class="scroll">${body}</div>${dock ? `<div class="dock">${dock}</div>` : ""}</div>`;
  }
  function arrow(h) {
    if (S.mode !== "low") return "";
    const word = { straight: "Straight ahead", left: "Left", right: "Right", caution: "Slow down", urgent: "Stop and listen" }[h] || "";
    const glyph = { straight: "↑", left: "←", right: "→", caution: "!", urgent: "!" }[h] || "";
    return `<p class="big" aria-hidden="true">${glyph}</p><p class="kicker">${word}</p>`;
  }

  function remaining() {
    const list = steps();
    const left = Math.max(list.length - S.step - 1, 0);
    const p = place();
    return `${p.distance} was the starting distance. Maneuver ${S.step + 1} of ${list.length}. ${left} after this one.`;
  }

  const VIEWS = {
    splash() {
      return `<div class="splash"><div><p class="kicker">Walking guidance</p><h1 class="word">Waymark</h1><p>Voice and touch for walking. Your cane, guide dog, and own judgment stay in charge.</p></div><div class="stack">${btn("Begin", "go", "welcome")}<p class="muted">Prototype. No live location or emergency call.</p></div></div>`;
    },
    welcome() {
      return page("Welcome", `<p>Waymark gives short walking instructions, names reported entrances, and warns when it is unsure.</p><p>It does not replace a white cane, a guide dog, or mobility training.</p><p>It will not tell you that a road is safe to cross.</p>`, btn("Continue", "go", "intro"), false);
    },
    intro() {
      return page("How Waymark behaves", `<div class="stack"><article class="panel"><h2>Voice leads</h2><p>The largest control is the microphone. Every result is also text.</p></article><article class="panel"><h2>You lead at the curb</h2><p>Crossing decisions stay with you. Waymark only says where a mapped crossing is.</p></article><article class="panel"><h2>Short, then more</h2><p>Instructions stay brief so traffic sound remains audible. Ask to hear more.</p></article></div>`, btn("Choose accessibility", "go", "prefs"));
    },
    prefs() {
      const item = (key, label, detail) => {
        const on = S.prefs[key];
        return `<button type="button" class="card-btn" data-act="pref" data-arg="${key}" aria-pressed="${on}"><span class="kicker">${on ? "On" : "Off"}</span><strong>${label}</strong><span>${detail}</span></button>`;
      };
      return page("Accessibility preferences", `<div class="stack">${item("voice", "Voice guidance", "Spoken instructions during a walk.")}${item("large", "Larger text", "Raises type size in low vision mode and throughout.")}${item("haptic", "Haptic cues", "Pulses for straight, left, right, and caution.")}${item("reader", "Screen reader labels", "Keeps every control named for TalkBack and VoiceOver.")}</div>`, btn("Continue", "go", "mode"));
    },
    mode() {
      return page("Vision mode", `<p>This changes emphasis. It does not remove speech or labels.</p><div class="stack">${btn(`<span class="kicker">${S.mode === "blind" ? "Selected" : "Choose"}</span><strong>Blind mode</strong><span>Text, speech, and haptics. No direction symbol.</span>`, "mode", "blind", "card-btn" + (S.mode === "blind" ? " selected" : ""))}${btn(`<span class="kicker">${S.mode === "low" ? "Selected" : "Choose"}</span><strong>Low vision mode</strong><span>Larger type, high contrast, and a direction word with a symbol.</span>`, "mode", "low", "card-btn" + (S.mode === "low" ? " selected" : ""))}</div>`, btn("Continue", "go", "language"));
    },
    language() {
      const opts = Object.keys(LANG_SAMPLE).map((name) => btn(`<span class="kicker">${S.lang === name ? "Selected" : "Speak in"}</span><strong>${esc(name)}</strong><span>${esc(LANG_SAMPLE[name].line)}</span>`, "lang", name, "card-btn" + (S.lang === name ? " selected" : ""))).join("");
      return page("Speech language", `<p>Interface labels in this prototype stay in English. The sample phrase uses the language you select.</p><div class="stack">${opts}</div>`, btn("Hear sample and continue", "play-lang"));
    },
    voiceSetup() {
      return page("Voice settings", voiceBlock(), btn("Continue", "go", "haptic"));
    },
    haptic() {
      return page("Haptic tutorial", hapticBlock(true), btn("Continue", "go", "permissions"));
    },
    permissions() {
      return page("Permissions", `<p>In a finished app, these would open the system prompt. Here they only record a choice in this browser.</p><div class="stack"><article class="panel"><h2>Location ${S.locOk ? "allowed" : "off"}</h2><p>Needed for turn guidance and the where-am-I answer.</p>${btn(S.locOk ? "Location allowed" : "Allow location", "grant", "loc", "btn btn-secondary")}</article><article class="panel"><h2>Microphone ${S.micOk ? "allowed" : "off"}</h2><p>Needed for voice commands. Typing still works if this stays off.</p>${btn(S.micOk ? "Microphone allowed" : "Allow microphone", "grant", "mic", "btn btn-secondary")}</article></div>`, btn("Continue", "go", "contact"));
    },
    contact() {
      const saved = S.contact ? `<p class="ok"><span class="kicker">Saved on this device</span><br>${esc(S.contact.name)}, ${esc(S.contact.phone)}</p>` : `<p>No contact yet. Emergency assistance can still list a hospital and a police desk.</p>`;
      return page("Trusted contact", `${saved}<div class="stack"><label class="field">Name<input id="cname" value="${S.contact ? esc(S.contact.name) : ""}" autocomplete="name"></label><label class="field">Phone<input id="cphone" value="${S.contact ? esc(S.contact.phone) : ""}" autocomplete="tel" inputmode="tel"></label>${btn("Save contact", "save-contact", "", "btn btn-secondary")}${btn("Use sample contact, Priya Sharma", "sample-contact", "", "btn btn-secondary")}</div>`, btn(S.contact ? "Continue" : "Skip for now", "go", "tutorial"));
    },
    tutorial() {
      const stepsT = [
        ["Tap the microphone", "This starts listening. It does not start a route.", `<button type="button" class="mic" data-act="tutor" data-arg="mic">${ico("mic")}<span>Speak</span></button>`],
        ["Tap Repeat", "Repeat reads the last instruction again.", btn("Repeat", "tutor", "repeat")],
        ["Read the caution", "Caution is written, not shown by color alone.", `<div class="caution"><p class="kicker">Caution</p><p>Possible obstacle. Detection can be wrong. Your cane or dog still checks the path.</p></div>${btn("I understand", "tutor", "ok", "btn btn-secondary")}`],
        ["Find emergency assistance", "It is a labeled button. The next screen asks before anything is sent.", btn("Emergency assistance", "tutor", "sos", "btn btn-danger")]
      ];
      const i = Math.min(S.tutorial, stepsT.length - 1);
      const done = S.tutorial >= stepsT.length;
      if (done) {
        return page("Practice complete", `<div class="ok"><p class="kicker">Completed</p><p>You used speech, repeat, a caution, and the emergency label.</p></div>`, btn("Go to home", "go", "home"));
      }
      return page(`Practice ${i + 1} of 4`, `<p class="kicker">Try it</p><h2>${stepsT[i][0]}</h2><p>${stepsT[i][1]}</p>${stepsT[i][2]}`, "");
    },
    home() {
      const recent = `<button type="button" class="card-btn" data-act="place" data-arg="citycare"><strong>CityCare Pharmacy</strong><span>Yesterday · Church Street</span></button><button type="button" class="card-btn" data-act="place" data-arg="college"><strong>City College, Gate 2</strong><span>Monday · saved entrance note</span></button>`;
      return page("Waymark", `<p class="status">${esc(statusLine())}</p><p>You are on <strong>MG Road</strong>, near Alliance Bank, in this sample scenario.</p><button type="button" class="mic" data-act="listen" aria-pressed="${S.listening}">${ico("mic")}<span>${S.listening ? "Listening" : "Speak"}</span></button><p style="text-align:center">Say a destination, or ask where you are.</p>${btn("Type a destination instead", "go", "search", "btn btn-secondary")}<h2>Saved</h2><div class="grid2">${btn("<strong>Home</strong><span>Indiranagar</span>", "place", "home", "card-btn")}${btn("<strong>Work</strong><span>City College</span>", "place", "work", "card-btn")}</div><h2>Recent</h2><div class="stack">${recent}</div><h2>More</h2><div class="stack">${moreLinks()}</div>`, btn("Emergency assistance", "go", "emergency", "btn btn-danger"), false);
    },
    search() {
      return page("Search", `<label class="field">Destination<input id="q" value="${esc(S.query)}" placeholder="Pharmacy, home, metro"></label><div class="stack" style="margin-top:12px">${btn("Search", "submit-query")}${btn("Speak instead", "listen", "", "btn btn-secondary")}</div><h2>Try</h2><div class="stack">${btn("Nearest pharmacy", "preset", "pharmacy", "btn btn-secondary")}${btn("Bus stop", "preset", "bus", "btn btn-secondary")}${btn("Home", "preset", "home", "btn btn-secondary")}</div>`);
    },
    voice() {
      let body = "";
      if (S.listening) body = `<div class="guide"><p class="kicker">Listening</p><p>${S.noisy ? "Background noise is high in this simulation." : "Speak a destination or a command."}</p></div>`;
      else if (S.voiceState === "fail") body = `<div class="urgent"><p class="kicker">Not understood</p><p>${esc(S.voiceReply)}</p></div>`;
      else if (S.voiceState === "ok") {
        const follow = S.query.toLowerCase().includes("pharmacy")
          ? `${btn("Open CityCare Pharmacy", "place", "citycare")}${btn("See other pharmacies", "preset", "pharmacy", "btn btn-secondary")}`
          : "";
        body = `<div class="guide"><p class="kicker">Heard</p><p>${esc(S.query)}</p><p>${esc(S.voiceReply)}</p></div><div class="stack" style="margin-top:12px">${follow}</div>`;
      }
      const chips = [["Where am I?", "where"], ["Navigate to the nearest pharmacy", "pharmacy"], ["Find a pharmacy", "list"], ["Take me home", "home"], ["Repeat the last instruction", "repeat"], ["How far is my destination?", "far"], ["What is ahead of me?", "ahead"], ["Find a pedestrian crossing", "cross"], ["Stop navigation", "stop"], ["Call my emergency contact", "sos"]];
      return page("Voice", `${body}<div class="stack" style="margin-top:12px">${btn("Tap to speak", "listen")}${chips.map(([l, a]) => btn(esc(l), "cmd", a, "btn btn-secondary")).join("")}</div><h2>Command history</h2>${historyHtml()}<p class="muted">Typing remains available if speech fails.</p>`, btn("Type instead", "go", "search", "btn btn-secondary"));
    },
    results() {
      const ids = resultIds();
      const list = ids.map((id) => placeBtn(id)).join("") || `<p>No sample place matches that. Try pharmacy, bus, hospital, or home.</p>`;
      return page("Results", `<p>Matches for “${esc(S.query || "nearby")}”. Distances are sample figures.</p><div class="stack">${list}</div>`);
    },
    nearby() {
      const cats = [["pharmacy", "Pharmacies"], ["transit", "Bus and metro"], ["hospital", "Hospitals"], ["restroom", "Restrooms"], ["atm", "ATMs"], ["college", "Colleges"], ["food", "Restaurants"], ["police", "Police help desk"]];
      return page("Nearby", `<p>Sample places near MG Road. This is not a live scan.</p><div class="stack">${cats.map(([id, label]) => btn(label, "cat", id, "btn btn-secondary")).join("")}</div>`);
    },
    destination() {
      const p = place();
      return page(p.kind, `<p class="kicker">${esc(p.distance)} in the sample</p><h2>${esc(p.name)}</h2><p>${esc(p.area)}</p><div class="panel"><p class="kicker">Reported entrance</p><p>${esc(p.entrance)}</p></div><p class="muted">Entrance notes can be wrong or out of date.</p>${p.phone ? `<p>Phone ${esc(p.phone)}</p>` : ""}`, `${btn("Compare walking routes", "go", "routes")}${btn("Share this trip", "go", "sharing", "btn btn-secondary")}`);
    },
    routes() {
      const cards = Object.entries(ROUTES).map(([id, r]) => `<article class="panel"><h2>${esc(r.name)}${S.routeId === id ? " · Selected" : ""}</h2><p>${esc(r.time)} · ${esc(r.distance)} · ${esc(r.turns)} · ${esc(r.crossings)}</p><p>${esc(r.access)}</p><p>${esc(r.confidence)}</p><p>${esc(r.hazards)}</p>${btn(S.routeId === id ? "Selected" : "Use this route", "route", id, "btn " + (S.routeId === id ? "btn-primary" : "btn-secondary"))}</article>`).join("");
      return page("Routes", `<p>Choose by walking conditions. No route is certified safe.</p><div class="stack">${cards}</div>`, btn("Review the selected route", "go", "overview"));
    },
    overview() {
      const r = route();
      const blocked = S.offline && !S.mapReady;
      const gpsBlocked = S.locOk && !S.gpsOk;
      let note = "";
      if (!S.locOk) note = `<div class="caution"><p class="kicker">Location off</p><p>Turn guidance needs location. You can still read the route description.</p></div>`;
      else if (gpsBlocked) note = `<div class="caution"><p class="kicker">GPS weak</p><p>Turn-by-turn guidance stays off until the sample GPS is restored.</p></div>`;
      else if (blocked) note = `<div class="caution"><p class="kicker">No offline map</p><p>Download the MG Road sample, or leave offline mode, before guidance.</p></div>`;
      else if (S.offline) note = `<div class="guide"><p class="kicker">Saved map</p><p>Guidance can run from the saved sample. Obstacle detection stays off offline.</p></div>`;
      return page("Ready to walk", `${note}<h2>${esc(place().name)}</h2><p>${esc(r.name)}. ${esc(r.time)}. ${esc(r.distance)}. ${esc(r.crossings)}.</p><p>${esc(r.confidence)}</p><p>Speech is ${esc(S.rate.toLowerCase())}. Output is ${esc(S.feedback)}. ${esc(hapticWords("straight"))}.</p>`, btn(blocked || gpsBlocked || !S.locOk ? "Guidance unavailable" : "Start guidance", "start", "", "btn btn-primary"));
    },
    navigating() {
      if (!S.locOk || !S.gpsOk) {
        return page("Guidance paused", `<div class="caution"><p class="kicker">Location unavailable</p><p>${S.gpsOk ? "Location permission is off." : "GPS is too weak in this simulation."} Last sample position: MG Road, near Alliance Bank.</p></div>`, `${btn("Nearby places from the sample", "go", "nearby")}${btn("Stop", "stop", "", "btn btn-secondary")}`);
      }
      const s = step();
      const list = steps();
      const box = s.obstacle ? `<div class="caution"><p class="kicker">Caution · uncertain</p><p>Possible pole or signboard, slightly left. This may be wrong. Check with your cane or dog.</p></div>` : "";
      return page("Guiding", `<p class="muted">${esc(place().name)} · ${esc(remaining())}</p><article class="guide"><p class="kicker">Guidance</p>${arrow(s.haptic)}<h2 class="display">${esc(s.title)}</h2><p class="big">${esc(s.metres)}</p><p>${esc(s.detail)}</p><p>Tactile cue: ${esc(hapticWords(s.haptic))}.</p></article>${box}<p>Step ${S.step + 1} of ${list.length}.</p><div class="stack">${btn("What is ahead", "ahead", "", "btn btn-secondary")}${btn("Check around me", "scan", "", "btn btn-secondary")}${btn("All steps", "go", "turn", "btn btn-secondary")}${btn("Stop guidance", "stop", "", "btn btn-secondary")}</div>`, `${btn("Repeat instruction", "repeat")}${btn("Pause", "pause", "", "btn btn-secondary")}`);
    },
    turn() {
      const list = steps();
      const items = list.map((s, i) => `<li class="${i === S.step ? "now" : ""}"><strong>${i === S.step ? "Current. " : ""}${esc(s.title)}</strong><br>${esc(s.detail)}</li>`).join("");
      return page("Maneuvers", `<ol class="steps">${items}</ol>`, btn("Back to guidance", "go", "navigating"));
    },
    paused() {
      return page("Paused", `<div class="panel"><p class="kicker">Last instruction</p><p>${esc(step().detail)}</p></div><p>Speech is stopped. You are still on the sample route.</p>`, `${btn("Resume", "resume")}${btn("Stop guidance", "stop", "", "btn btn-secondary")}`);
    },
    deviation() {
      return page("Off the route", `<div class="caution"><p class="kicker">Caution</p><p>You may have left the suggested route. This can also be a GPS error of several metres.</p></div><p>A new walking route can be offered from the sample position. That does not make the street safe.</p>`, `${btn("Offer a new route", "recalc")}${btn("Stay with the old instructions", "go", "navigating", "btn btn-secondary")}`);
    },
    recalc() {
      return page("New route", `<div class="guide"><p class="kicker">Recalculated</p><p>From the sample position, continue straight for about 25 metres toward ${esc(place().name)}. The earlier maneuvers were replaced.</p></div><p class="muted">Confidence is low because this is a short repair, not a freshly checked street.</p>`, btn("Use the new guidance", "use-new"));
    },
    arrival() {
      const p = place();
      return page("Nearby destination", `<div class="ok"><p class="kicker">Arrived nearby</p><p>You are near ${esc(p.name)}. ${esc(p.entrance)}</p></div><p>Waymark cannot confirm you are at the door.</p>`, `${btn("I found the entrance", "found")}${btn("Hear the entrance note", "entrance", "", "btn btn-secondary")}${btn("Tell my contact I arrived", "arrived-share", "", "btn btn-secondary")}`);
    },
    obstacles() {
      const level = S.obstacleCount > 1 && S.alertMode === "fewer" ? "Shorter repeat" : "Caution";
      return page("Obstacle alert", `<div class="caution"><p class="kicker">${level} · not confirmed</p><p>Possible obstacle ahead, slightly to your left. It may be a pole or a signboard. People may also be nearby. This can be wrong or late.</p></div><p>Informational, caution, and urgent are spoken as words. Urgent is reserved for something that may need attention now, and it is still not a certainty.</p><p>Alert setting: ${esc(S.alertMode)}. ${S.offline ? "Offline: a live scan is unavailable. This text is the scripted example only." : "This scan is scripted for the prototype."}</p>`, `${btn("Hear the alert", "hear-obstacle")}${btn("Return to guidance", "go", "navigating", "btn btn-secondary")}${btn("Alert settings", "go", "notifications", "btn btn-secondary")}`);
    },
    camera() {
      return page("Scene description", `<div class="finder"><p><strong>Sample frame</strong><br>No camera is connected.</p></div><p>Descriptions in a finished app would say what might be seen, and that the model can be wrong.</p>${S.scene ? `<div class="guide"><p class="kicker">Example description</p><p>${esc(S.scene)}</p></div>` : ""}`, btn("Play the sample description", "describe"));
    },
    sign() {
      return page("Sign reader", `<div class="signboard"><strong>CHURCH STREET</strong><span>CITYCARE PHARMACY</span></div><p>The sample sign is drawn here. A finished app would read the camera image and could misread letters.</p>${S.sign ? `<div class="guide"><p>${esc(S.sign)}</p></div>` : ""}`, btn("Read this sign", "read-sign"));
    },
    crossing() {
      return page("Crossing", `<div class="urgent"><p class="kicker">Do not cross on this app’s word</p><p>Waymark will not say when to cross. Camera guesses and unverified signal colors are not used as a command.</p></div><div class="panel"><p class="kicker">Mapped crossing</p><p>About 20 metres ahead on MG Road, in the sample. A pedestrian signal is recorded, and that record may be wrong.</p><p>Possible vehicle movement is a sensor idea for a later version. It is not active here.</p></div>`, `${btn("Hear the crossing note", "hear-cross")}${btn("I want more help", "go", "emergency", "btn btn-secondary")}`);
    },
    transit() {
      return page("Public transport", `<article class="panel"><h2>Church Street bus stop</h2><p>180 metres in the sample. Routes 201 and 335 are listed. Arrivals are not live.</p>${btn("Details", "place", "bus", "btn btn-secondary")}</article><article class="panel"><h2>MG Road Metro</h2><p>Entrance A is reported at the east end. Platform numbers are not confirmed.</p>${btn("Details", "place", "metro", "btn btn-secondary")}</article><p>Boarding would be announced only from a verified feed. This prototype does not have one.</p>`);
    },
    facilities() {
      return page("Facilities", `<div class="stack">${["hospital", "police", "restroom", "atm", "pharmacy"].map((cat) => {
        const id = Object.keys(PLACES).find((k) => PLACES[k].cat === cat);
        return placeBtn(id);
      }).join("")}</div>`);
    },
    emergency() {
      const who = S.contact ? `${esc(S.contact.name)} at ${esc(S.contact.phone)}` : "No trusted contact saved";
      const note = S.sosNote ? `<div class="ok"><p class="kicker">Prepared, not sent</p><p>${esc(S.sosNote)}</p></div>` : "";
      return page("Emergency", `<p class="status">${who}</p>${note}<p>Nothing is sent until you confirm SOS. This prototype never dials or messages anyone.</p><div class="stack">${btn("SOS, alert my contact", "go", "sos", "btn btn-danger")}${btn("Find a hospital", "place", "hospital", "btn btn-secondary")}${btn("Find a police help desk", "place", "police", "btn btn-secondary")}${btn("Share where I am", "go", "sharing", "btn btn-secondary")}</div>`);
    },
    sos() {
      if (!S.contact) {
        return page("SOS", `<p>Add a trusted contact before SOS. You can still open the hospital or police desk.</p>`, `${btn("Add a contact", "go", "contacts")}${btn("Hospital", "place", "hospital", "btn btn-secondary")}`);
      }
      return page("Confirm SOS", `<div class="urgent"><p class="kicker">Not sent yet</p><p>This would call ${esc(S.contact.name)} and include a sample location on MG Road. It will not happen in this prototype.</p></div>`, `${btn(`Yes, prepare an alert for ${esc(S.contact.name)}`, "sos-yes", "", "btn btn-danger")}${btn("Cancel", "sos-no", "", "btn btn-secondary")}`);
    },
    contacts() {
      const body = S.contact
        ? `<div class="panel"><p class="kicker">Trusted contact</p><p><strong>${esc(S.contact.name)}</strong><br>${esc(S.contact.phone)}</p></div>${btn("Remove contact", "remove-contact", "", "btn btn-secondary")}`
        : `<p>No contact saved.</p><label class="field">Name<input id="cname" autocomplete="name"></label><label class="field">Phone<input id="cphone" autocomplete="tel"></label>${btn("Save", "save-contact", "", "btn btn-secondary")}${btn("Use Priya Sharma", "sample-contact", "", "btn btn-secondary")}`;
      return page("Contacts", body);
    },
    sharing() {
      const p = place();
      return page("Share journey", `<p>Sharing is off until you start it. A finished app would send location to people you picked. This page only simulates the state.</p><p class="status">${S.sharing ? `Sharing is on for ${S.contact ? esc(S.contact.name) : "a contact"}. Destination: ${esc(p.name)}.` : "Sharing is off."}</p><p>Arrival notice is ${S.notifyArrival ? "on" : "off"}.</p>`, `${btn(S.sharing ? "Stop sharing" : "Start sharing", "share-toggle")}${btn(S.notifyArrival ? "Turn arrival notice off" : "Turn arrival notice on", "arrival-toggle", "", "btn btn-secondary")}${S.contact ? "" : btn("Add a contact first", "go", "contacts", "btn btn-secondary")}`);
    },
    settings() {
      return page("Accessibility", `<div class="stack">${btn(`Theme: ${S.theme === "dark" ? "High contrast dark" : "High contrast light"}`, "theme", "", "btn btn-secondary")}${btn(`Text: ${S.large ? "Larger" : "Standard large"}`, "large", "", "btn btn-secondary")}${btn(`Mode: ${S.mode === "low" ? "Low vision" : "Blind"}`, "flip-mode", "", "btn btn-secondary")}${btn("Voice and language", "go", "voiceSettings", "btn btn-secondary")}${btn("Haptics", "go", "hapticsCustom", "btn btn-secondary")}${btn("Notifications", "go", "notifications", "btn btn-secondary")}${btn("Privacy", "go", "privacy", "btn btn-secondary")}</div><p class="muted">Works with the phone’s screen reader. This prototype uses headings, names on buttons, and a live region.</p>`);
    },
    voiceSettings() {
      return page("Voice and language", voiceBlock());
    },
    hapticsCustom() {
      return page("Haptics", hapticBlock(false));
    },
    notifications() {
      const modes = [["all", "All alerts"], ["fewer", "Fewer repeats"], ["off", "Obstacle alerts off"]];
      return page("Notifications", `<p>Navigation speech stays available unless you also switch feedback to haptic only. Obstacle alerts can be reduced.</p><div class="stack">${modes.map(([id, label]) => btn(`<span class="kicker">${S.alertMode === id ? "Selected" : "Choose"}</span><strong>${label}</strong>`, "alerts", id, "card-btn")).join("")}</div><p class="muted">${S.alertMode === "off" ? "You will not get obstacle speech. The cane or dog remains the check for hazards." : "Caution and urgent are still spoken with those words."}</p>`);
    },
    saved() {
      return page("Saved places", `<div class="stack">${["home", "work", "metro", "citycare"].map(placeBtn).join("")}</div>`);
    },
    history() {
      return page("Journey history", `<article class="panel"><h2>Yesterday</h2><p>Home to CityCare Pharmacy. Sidewalk route. Sample only.</p>${btn("Use this destination", "place", "citycare", "btn btn-secondary")}</article><article class="panel"><h2>Monday</h2><p>Metro to City College, Gate 2.</p>${btn("Use this destination", "place", "college", "btn btn-secondary")}</article>`);
    },
    offline() {
      return page("Offline maps", `<p class="status">${S.mapReady ? "MG Road sample is saved on this device." : "No area is saved yet."} ${S.offline ? "You are offline." : "You are online."}</p><p>A saved map can speak a previously prepared route. It cannot scan obstacles or update construction.</p>`, `${btn(S.mapReady ? "Sample area saved" : "Download MG Road sample", "download")}${btn(S.offline ? "Return online" : "Switch this prototype offline", "offline-toggle", "", "btn btn-secondary")}`);
    },
    privacy() {
      return page("Privacy", `<p>Choices stay in this browser tab. Refreshing clears them. Nothing is uploaded.</p><div class="stack">${btn(`Location permission: ${S.locOk ? "On" : "Off"}`, "grant", "loc", "btn btn-secondary")}${btn(`Microphone: ${S.micOk ? "On" : "Off"}`, "grant", "mic", "btn btn-secondary")}${btn(`Sample GPS: ${S.gpsOk ? "Ready" : "Weak"}`, "gps", "", "btn btn-secondary")}${btn("Forget contact and stop sharing", "forget", "", "btn btn-secondary")}</div><p>Sharing is ${S.sharing ? "on" : "off"}.</p>`);
    },
    help() {
      return page("Help", `<div class="stack"><article class="panel"><h2>Repeat</h2><p>Says the last instruction again. It does not advance the route.</p></article><article class="panel"><h2>Crossings</h2><p>You get the location of a mapped crossing. You decide when to cross.</p></article><article class="panel"><h2>If speech fails</h2><p>Type the destination. Large targets cover the same actions.</p></article><article class="panel"><h2>This study</h2><p>Waymark is a design prototype for review. It is not a mobility device.</p></article></div>`, btn("Send an access report", "go", "feedback", "btn btn-secondary"));
    },
    feedback() {
      const kinds = ["Blocked sidewalk", "Broken tactile paving", "Construction", "Inaccessible entrance", "Damaged crossing", "Missing ramp", "Temporary obstacle"];
      return page("Report access", `<p>Reports in a finished app would be time-stamped, unverified until a second person confirms them, and expired if temporary. This form stays on this device.</p><div class="stack">${kinds.map((k) => btn(esc(k), "report-kind", k, "btn " + (S.report === k ? "btn-primary" : "btn-secondary"))).join("")}</div>${S.reportSent ? `<p class="ok">Saved on this device only. Not uploaded. Marked unverified.</p>` : ""}`, btn("Save report on this device", "report-save", "", "btn btn-secondary"));
    }
  };

  function moreLinks() {
    const items = [["nearby", "Nearby places"], ["transit", "Public transport"], ["camera", "Describe a scene"], ["sign", "Read a sign"], ["crossing", "Crossing help"], ["saved", "Saved places"], ["offline", "Offline maps"], ["settings", "Accessibility settings"], ["help", "Help"]];
    return items.map(([id, label]) => btn(label, "go", id, "btn btn-secondary")).join("");
  }
  function placeBtn(id) {
    const p = PLACES[id];
    return btn(`<strong>${esc(p.name)}</strong><span>${esc(p.kind)} · ${esc(p.distance)}</span><span>Entrance note available</span>`, "place", id, "card-btn");
  }
  function resultIds() {
    const q = S.query.toLowerCase();
    if (!q) return ["citycare", "bus", "metro"];
    return Object.keys(PLACES).filter((id) => {
      const p = PLACES[id];
      return [p.name, p.kind, p.area, p.cat, id].join(" ").toLowerCase().includes(q) || (q.includes("pharmacy") && p.cat === "pharmacy") || (q.includes("bus") && id === "bus") || (q.includes("home") && id === "home") || (q.includes("hospital") && id === "hospital");
    });
  }
  function voiceBlock() {
    const rates = ["Slow", "Normal", "Fast"].map((r) => btn(S.rate === r ? `${r}, selected` : r, "rate", r, "btn " + (S.rate === r ? "btn-primary" : "btn-secondary"))).join("");
    const feeds = [["audio", "Audio only"], ["haptic", "Haptic only"], ["both", "Audio and haptic"]].map(([id, label]) => btn(S.feedback === id ? `${label}, selected` : label, "feedback", id, "btn " + (S.feedback === id ? "btn-primary" : "btn-secondary"))).join("");
    const langs = Object.keys(LANG_SAMPLE).map((name) => btn(S.lang === name ? `${name}, selected` : name, "lang", name, "btn " + (S.lang === name ? "btn-primary" : "btn-secondary"))).join("");
    return `<h2>Rate</h2><div class="stack">${rates}</div><h2>Output</h2><div class="stack">${feeds}</div><h2>Language</h2><div class="stack">${langs}</div>${btn("Play sample", "play-lang", "", "btn btn-secondary")}`;
  }
  function hapticBlock(showLesson) {
    const lesson = showLesson ? `<p>Feel each pattern, then use the words to remember it. Default: one pulse straight, two left, three right, one long pulse caution, repeated pulses urgent.</p>` : `<p>Current left cue: ${esc(hapticWords("left"))}. Current right cue: ${esc(hapticWords("right"))}.</p>`;
    const keys = [["straight", "Straight"], ["left", "Left"], ["right", "Right"], ["caution", "Caution"], ["urgent", "Urgent"]];
    return `${lesson}<div class="stack">${keys.map(([id, label]) => btn(`Play ${label}. ${hapticWords(id)}`, "play-haptic", id, "btn btn-secondary")).join("")}${btn(S.hapticScale === 1 ? "Intensity short, selected" : "Intensity short", "intensity", "1", "btn btn-secondary")}${btn(S.hapticScale === 1.45 ? "Intensity medium, selected" : "Intensity medium", "intensity", "1.45", "btn btn-secondary")}${btn(S.hapticSwap ? "Left and right are swapped" : "Swap left and right patterns", "swap", "", "btn btn-secondary")}${btn(`Feedback: ${S.feedback}`, "cycle-feedback", "", "btn btn-secondary")}</div>`;
  }
  function historyHtml() {
    if (!S.log.length) return "<p>No commands yet.</p>";
    return S.log.slice(0, 5).map((line) => `<p class="history-item">${esc(line)}</p>`).join("");
  }
  function meta(id) {
    return SCREENS.find((s) => s[1] === id) || SCREENS[0];
  }
  function announcement() {
    if (S.screen === "navigating" && S.gpsOk && S.locOk) return step().detail;
    if (S.screen === "voice" && S.voiceReply) return S.voiceReply;
    if (S.screen === "home") return `Home. ${statusLine()} You are on MG Road, near Alliance Bank.`;
    return meta(S.screen)[4];
  }

  function render() {
    const phone = $("phone");
    phone.dataset.theme = S.theme;
    phone.dataset.wire = String(S.wire);
    phone.dataset.large = String(S.large || S.prefs.large);
    const view = VIEWS[S.screen] || VIEWS.home;
    $("app").innerHTML = view();
    const sc = $("app").querySelector(".scroll");
    if (sc) sc.scrollTop = 0;
    const h = $("app").querySelector("h1");
    if (h) { h.tabIndex = -1; h.focus(); }
    $("polite").textContent = announcement();
    const m = meta(S.screen);
    $("c-kicker").textContent = `${m[0]} · ${m[2]}`;
    $("c-title").textContent = m[2];
    $("c-note").textContent = m[3];
    $("c-say").textContent = announcement();
    $("c-actions").innerHTML = `<button type="button" data-sim="play">Play announcement</button><button type="button" data-sim="repeat">Repeat last instruction</button>`;
    $("c-sim").innerHTML = [
      ["theme", S.theme === "dark" ? "Use light theme" : "Use dark theme"],
      ["wire", S.wire ? "Show high fidelity" : "Show wireframe"],
      ["mode", S.mode === "low" ? "Use blind mode" : "Use low vision mode"],
      ["offline", S.offline ? "Return online" : "Go offline"],
      ["gps", S.gpsOk ? "Simulate weak GPS" : "Restore sample GPS"],
      ["noisy", S.noisy ? "Street noise off" : "Simulate a noisy street"],
      ["forward", "Walk to the next instruction"],
      ["deviate", "Simulate leaving the route"],
      ["arrive", "Simulate arrival"]
    ].map(([id, label]) => `<button type="button" data-sim="${id}">${label}</button>`).join("");
    const groups = {};
    SCREENS.forEach((s) => { (groups[s[0]] = groups[s[0]] || []).push(s); });
    $("c-nav").innerHTML = Object.entries(groups).map(([g, items]) => {
      const open = items.some((s) => s[1] === S.screen) ? " open" : "";
      const buttons = items.map((s) => `<button type="button" data-jump="${s[1]}" ${s[1] === S.screen ? 'aria-current="true"' : ""}>${esc(s[2])}</button>`).join("");
      return `<details${open}><summary>${esc(g)}</summary><div class="jump-list">${buttons}</div></details>`;
    }).join("");
  }

  function go(id, replace) {
    if (!VIEWS[id]) return;
    S.listenToken += 1;
    if (!replace && S.screen !== id) S.stack.push(S.screen);
    S.screen = id;
    S.listening = false;
    render();
  }
  function back() {
    go(S.stack.pop() || "home", true);
  }

  function startGuidance() {
    if (!S.locOk || !S.gpsOk || (S.offline && !S.mapReady)) {
      go("overview");
      speak("Guidance is not available until location and a map are ready.");
      return;
    }
    S.step = 0;
    S.recovery = false;
    go("navigating");
    const s = step();
    speak(s.detail);
    pulse(s.haptic);
  }

  function handleVoice(cmd) {
    const p = place();
    if (cmd === "where") {
      S.voiceState = "ok";
      S.query = "Where am I?";
      S.voiceReply = S.gpsOk && S.locOk
        ? "You are on MG Road, near Alliance Bank, in this sample. Accuracy is about 8 metres, which can be the wrong doorway."
        : "Location is unavailable. The last sample position was MG Road, near Alliance Bank.";
      go("voice");
      speak(S.voiceReply);
      return;
    }
    if (cmd === "pharmacy") {
      S.query = "Navigate to the nearest pharmacy";
      S.placeId = "citycare";
      S.voiceState = "ok";
      S.voiceReply = "The nearest pharmacy in this sample is CityCare Pharmacy, about 250 metres away. You can open it and compare routes.";
      go("voice");
      speak(S.voiceReply);
      return;
    }
    if (cmd === "list") {
      S.query = "pharmacy";
      go("results");
      speak("Three sample pharmacies are listed.");
      return;
    }
    if (cmd === "home") {
      S.placeId = "home";
      go("destination");
      speak("Home is saved on 12th Main, Indiranagar. Opening details.");
      return;
    }
    if (cmd === "repeat") { go("voice"); speak(S.lastSpoken); return; }
    if (cmd === "far") {
      const msg = S.screen === "navigating" ? remaining() : `${p.name} is ${p.distance} away in the sample, before a route is chosen.`;
      S.voiceReply = msg;
      S.voiceState = "ok";
      go("voice");
      speak(msg);
      return;
    }
    if (cmd === "ahead") {
      const msg = "Ahead in the sample: a sidewalk, then a mapped crossing near Church Street. I cannot see live traffic.";
      S.voiceReply = msg;
      go("voice");
      speak(msg);
      return;
    }
    if (cmd === "cross") { go("crossing"); speak("Opening crossing help. I will not tell you when to cross."); return; }
    if (cmd === "stop") { go("home"); speak("Guidance stopped."); return; }
    if (cmd === "sos") { go("emergency"); speak("Opening emergency assistance. Nothing has been sent."); return; }
  }

  function onAct(act, arg, root) {
    unlockSpeech();
    if (act === "go") return go(arg);
    if (act === "back") return back();
    if (act === "read") return speak(screenText());
    if (act === "pref") {
      S.prefs[arg] = !S.prefs[arg];
      if (arg === "large") S.large = S.prefs.large;
      if (arg === "haptic" && !S.prefs.haptic && S.feedback === "haptic") S.feedback = "both";
      if (arg === "haptic" && S.prefs.haptic && S.feedback === "audio") S.feedback = "both";
      render();
      return;
    }
    if (act === "mode") { S.mode = arg; if (arg === "low") S.large = true; render(); return; }
    if (act === "flip-mode") { S.mode = S.mode === "low" ? "blind" : "low"; if (S.mode === "low") S.large = true; render(); return; }
    if (act === "lang") { S.lang = arg; render(); return; }
    if (act === "rate") { S.rate = arg; render(); return; }
    if (act === "feedback") {
      if (arg === "audio" && S.alertMode === "off") {
        speak("Keep audio, or turn obstacle alerts back on. Guidance needs a channel.");
      }
      S.feedback = arg;
      render();
      return;
    }
    if (act === "play-lang") { speak(LANG_SAMPLE[S.lang].line); if (S.screen === "language") go("voiceSetup"); return; }
    if (act === "grant") {
      if (arg === "loc") S.locOk = !S.locOk;
      if (arg === "mic") S.micOk = !S.micOk;
      render();
      return;
    }
    if (act === "save-contact") {
      const name = ($("cname") && $("cname").value.trim()) || "";
      const phone = ($("cphone") && $("cphone").value.trim()) || "";
      if (!name || !phone) { speak("Enter a name and a phone number, or use the sample contact."); return; }
      S.contact = { name, phone };
      speak(`${name} saved on this device only.`);
      render();
      return;
    }
    if (act === "sample-contact") {
      S.contact = { name: "Priya Sharma", phone: "+91 98000 00000" };
      speak("Priya Sharma saved as a sample contact. No message has been sent.");
      render();
      return;
    }
    if (act === "remove-contact" || act === "forget") {
      S.contact = null; S.sharing = false;
      speak("Contact removed and sharing is off.");
      render();
      return;
    }
    if (act === "tutor") {
      if (arg === "mic") speak("Microphone tapped. Listening would start.");
      if (arg === "repeat") speak("Repeat reads the last instruction. It does not move you forward.");
      if (arg === "ok") speak("Caution is a word, not a color.");
      if (arg === "sos") speak("Emergency assistance opens a confirmation. Nothing is sent.");
      S.tutorial += 1;
      render();
      return;
    }
    if (act === "listen") {
      if (!S.micOk) {
        speak("Microphone permission is off. Type the destination instead.");
        go("search");
        return;
      }
      if (S.screen !== "voice") go("voice");
      S.listening = true;
      S.voiceState = "idle";
      const token = ++S.listenToken;
      render();
      clearTimeout(S.listenTimer);
      S.listenTimer = setTimeout(() => {
        if (token !== S.listenToken) return;
        S.listening = false;
        if (S.noisy) {
          S.voiceState = "fail";
          S.query = "";
          S.voiceReply = "I could not understand that. The street may be too loud. Repeat, or type the destination.";
          speak(S.voiceReply);
          render();
          return;
        }
        handleVoice("pharmacy");
      }, 900);
      return;
    }
    if (act === "cmd") return handleVoice(arg);
    if (act === "preset") {
      const map = { pharmacy: "pharmacy", bus: "bus stop", home: "home" };
      S.query = map[arg] || arg;
      go("results");
      return;
    }
    if (act === "submit-query") {
      S.query = ($("q") && $("q").value) || S.query;
      go("results");
      return;
    }
    if (act === "place") { S.placeId = arg; S.recovery = false; S.step = 0; go("destination"); return; }
    if (act === "cat") {
      const first = Object.keys(PLACES).find((id) => PLACES[id].cat === arg);
      S.query = PLACES[first].kind;
      go("results");
      return;
    }
    if (act === "route") { S.routeId = arg; render(); return; }
    if (act === "start") return startGuidance();
    if (act === "repeat") { speak(S.screen === "navigating" ? step().detail : S.lastSpoken); return; }
    if (act === "pause") { window.speechSynthesis && window.speechSynthesis.cancel(); go("paused"); return; }
    if (act === "resume") { go("navigating"); speak(step().detail); pulse(step().haptic); return; }
    if (act === "ahead") {
      const list = steps();
      const next = list[S.step + 1];
      speak(next ? `Next: ${next.detail}` : "No further maneuver. The entrance note is the last step.");
      return;
    }
    if (act === "scan") {
      S.obstacleCount += 1;
      if (S.alertMode === "off") { speak("Obstacle alerts are off in your settings."); return; }
      if (S.offline) { go("obstacles"); speak("Obstacle detection is unavailable on a saved map. Use your cane or guide dog."); return; }
      const short = S.alertMode === "fewer" && S.obstacleCount > 1;
      const line = short
        ? "Obstacle alert repeating. A possible obstacle may still be ahead. Details are reduced."
        : "Caution. Possible obstacle ahead, slightly left. It may be a pole or signboard. This can be wrong.";
      go("obstacles");
      speak(line, true);
      pulse("caution");
      return;
    }
    if (act === "hear-obstacle") {
      speak("Caution. Possible obstacle ahead, slightly to your left. Detection is uncertain. Your cane or dog still leads.", true);
      pulse("caution");
      return;
    }
    if (act === "stop") { window.speechSynthesis && window.speechSynthesis.cancel(); go("home"); speak("Guidance stopped."); return; }
    if (act === "recalc") { go("recalc"); speak("A replacement route is ready from the sample position. It is not a safety confirmation."); return; }
    if (act === "use-new") { S.recovery = true; S.step = 0; go("navigating"); speak(step().detail); pulse("straight"); return; }
    if (act === "found") { go("home"); speak("Entrance marked as found by you. Guidance is complete."); return; }
    if (act === "entrance") { speak(place().entrance); return; }
    if (act === "describe") {
      S.scene = "Example only. The entrance may be ahead. A staircase may be on the left, and a reception desk may be on the right. This is not a live description and can be wrong.";
      speak(S.scene);
      render();
      return;
    }
    if (act === "read-sign") {
      S.sign = "The sign appears to say Church Street, and CityCare Pharmacy. Please confirm. Text recognition can miss or invent letters.";
      speak(S.sign);
      render();
      return;
    }
    if (act === "hear-cross") {
      speak("A mapped crossing is about 20 metres ahead. I will not tell you when to cross. Check the traffic yourself.");
      return;
    }
    if (act === "sos-yes") {
      S.sosNote = `An alert for ${S.contact.name} was prepared and was not sent. This prototype does not call or share a live location.`;
      go("emergency");
      speak(S.sosNote);
      return;
    }
    if (act === "sos-no") { go("emergency"); speak("SOS cancelled. Nothing was sent."); return; }
    if (act === "share-toggle") {
      if (!S.contact) { go("contacts"); speak("Add a trusted contact before sharing."); return; }
      S.sharing = !S.sharing;
      speak(S.sharing ? `Sharing is on for ${S.contact.name}, inside this demo only.` : "Sharing is off.");
      render();
      return;
    }
    if (act === "arrival-toggle") { S.notifyArrival = !S.notifyArrival; render(); return; }
    if (act === "arrived-share") {
      if (!S.sharing) { go("sharing"); speak("Sharing is off. Open journey sharing if you want a contact to be told."); return; }
      speak(S.notifyArrival ? "Arrival note prepared and not sent." : "Arrival notices are off. Turn them on before a contact is told.");
      return;
    }
    if (act === "theme") { S.theme = S.theme === "dark" ? "light" : "dark"; render(); return; }
    if (act === "large") { S.large = !S.large; S.prefs.large = S.large; render(); return; }
    if (act === "play-haptic") { speak(hapticWords(arg)); pulse(arg); return; }
    if (act === "intensity") { S.hapticScale = Number(arg); render(); return; }
    if (act === "swap") {
      S.hapticSwap = !S.hapticSwap;
      speak(S.hapticSwap ? "Left and right pulses are swapped. Replay both before you walk." : "Left and right pulses are back to the default. Two is left. Three is right.");
      render();
      return;
    }
    if (act === "cycle-feedback") {
      S.feedback = S.feedback === "both" ? "audio" : S.feedback === "audio" ? "haptic" : "both";
      render();
      return;
    }
    if (act === "alerts") { S.alertMode = arg; render(); return; }
    if (act === "download") {
      S.mapReady = true;
      speak("MG Road sample saved on this device. Obstacle detection is still unavailable offline.");
      render();
      return;
    }
    if (act === "offline-toggle") {
      S.offline = !S.offline;
      speak(S.offline ? "Offline mode. Saved routes can be used if a map is downloaded. Live scans are off." : "Online sample data is available again.");
      render();
      return;
    }
    if (act === "gps") { S.gpsOk = !S.gpsOk; speak(S.gpsOk ? "Sample GPS restored." : "GPS marked weak. Turn guidance will stop."); render(); return; }
    if (act === "report-kind") { S.report = arg; S.reportSent = false; render(); return; }
    if (act === "report-save") {
      if (!S.report) { speak("Choose a problem type first."); return; }
      S.reportSent = true;
      speak(`${S.report} saved on this device. Marked unverified. Not uploaded.`);
      render();
      return;
    }
  }

  document.addEventListener("click", (e) => {
    const jump = e.target.closest("[data-jump]");
    if (jump) {
      unlockSpeech();
      S.stack = ["home"];
      S.screen = jump.dataset.jump;
      S.listening = false;
      render();
      return;
    }
    const sim = e.target.closest("[data-sim]");
    if (sim) {
      const id = sim.dataset.sim;
      if (id === "play") return speak(announcement());
      if (id === "repeat") return speak(S.lastSpoken);
      if (id === "theme") return onAct("theme");
      if (id === "wire") { S.wire = !S.wire; render(); return; }
      if (id === "mode") return onAct("flip-mode");
      if (id === "offline") return onAct("offline-toggle");
      if (id === "gps") return onAct("gps");
      if (id === "noisy") { S.noisy = !S.noisy; speak(S.noisy ? "The next voice attempt will fail as if the street were loud." : "Street noise simulation is off."); return; }
      if (id === "forward") {
        if (!S.locOk) S.locOk = true;
        if (S.screen !== "navigating") { startGuidance(); return; }
        const list = steps();
        if (S.step >= list.length - 1) {
          go("arrival");
          speak(`You are near ${place().name}. ${place().entrance}`);
          return;
        }
        S.step += 1;
        go("navigating");
        speak(step().detail);
        pulse(step().haptic);
        return;
      }
      if (id === "deviate") { go("deviation"); speak("You may have left the suggested route. This might also be a GPS error."); return; }
      if (id === "arrive") { go("arrival"); speak(`You are near ${place().name}. Confirm the entrance yourself.`); return; }
    }
    const el = e.target.closest("[data-act]");
    if (!el || !$("app").contains(el)) return;
    onAct(el.dataset.act, el.dataset.arg || "", el);
  });

  document.addEventListener("input", (e) => {
    if (e.target.id === "q") S.query = e.target.value;
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.id === "q") onAct("submit-query");
    if (e.key === "Escape" && S.stack.length) back();
  });

  render();
})();
