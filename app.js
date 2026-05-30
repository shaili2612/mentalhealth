const STORAGE_KEY = "campuscare-state-v1";
const USER_KEY = "campuscare-user-v1";
const GOOGLE_CLIENT_PLACEHOLDER = "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE";

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const defaultState = {
  checkins: [
    {
      id: createId(),
      date: daysAgo(6),
      mood: 6,
      stress: 5,
      sleep: 7,
      study: 3,
      exercise: 20,
      water: 5,
      note: "Caught up after lab and felt okay after walking with a friend.",
    },
    {
      id: createId(),
      date: daysAgo(5),
      mood: 5,
      stress: 7,
      sleep: 5.5,
      study: 6,
      exercise: 0,
      water: 4,
      note: "Long study night for chemistry and I felt behind.",
    },
    {
      id: createId(),
      date: daysAgo(3),
      mood: 8,
      stress: 3,
      sleep: 8,
      study: 2,
      exercise: 45,
      water: 7,
      note: "Swam in the morning and had more energy.",
    },
    {
      id: createId(),
      date: daysAgo(1),
      mood: 6,
      stress: 6,
      sleep: 6.5,
      study: 5,
      exercise: 10,
      water: 6,
      note: "Two deadlines are coming up but I made a plan.",
    },
  ],
  journals: [
    {
      id: createId(),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      text: "I felt lonely after dinner, but calling my roommate helped me reset.",
      tags: ["Loneliness", "Positive progress"],
      crisis: false,
    },
  ],
  assignments: [
    {
      id: createId(),
      title: "Chemistry lab report",
      course: "CHEM 110",
      dueDate: daysFromNow(2),
      type: "Assignment",
      difficulty: 2,
      complete: false,
    },
    {
      id: createId(),
      title: "Calculus exam",
      course: "MATH 201",
      dueDate: daysFromNow(5),
      type: "Exam",
      difficulty: 3,
      complete: false,
    },
  ],
};

const resources = [
  {
    category: "Counseling",
    name: "University Counseling Center",
    description: "Short-term counseling, wellness workshops, and referral support.",
    detail: "Mon-Fri, 8:00 AM-5:00 PM",
  },
  {
    category: "Emergency",
    name: "Campus Safety",
    description: "24/7 help for immediate campus safety concerns.",
    detail: "Call your campus emergency line",
  },
  {
    category: "Academic",
    name: "Tutoring and Writing Center",
    description: "Peer tutoring, writing reviews, and exam prep sessions.",
    detail: "Book through the student portal",
  },
  {
    category: "Study",
    name: "Quiet Study Spaces",
    description: "Library floors, reservable rooms, and late-night study areas.",
    detail: "Check availability before finals week",
  },
  {
    category: "Community",
    name: "Student Organizations",
    description: "Find clubs by interest, identity, major, or recreation.",
    detail: "Try one low-pressure meeting",
  },
  {
    category: "Wellness",
    name: "Recreation Center",
    description: "Fitness classes, intramurals, swimming, and movement breaks.",
    detail: "Bring your student ID",
  },
];

let state = loadState();
let currentUser = loadUser();

const views = document.querySelectorAll(".view");
const navItems = document.querySelectorAll(".nav-item");
const viewTitle = document.querySelector("#viewTitle");
const toast = document.querySelector("#toast");
const authScreen = document.querySelector("#authScreen");
const appShell = document.querySelector("#appShell");
const googleButton = document.querySelector("#googleButton");
const authSetupMessage = document.querySelector("#authSetupMessage");
const demoSigninButton = document.querySelector("#demoSigninButton");
const signoutButton = document.querySelector("#signoutButton");
const profileName = document.querySelector("#profileName");

document.querySelector("#todayLabel").textContent = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "short",
  day: "numeric",
}).format(new Date());

document.querySelector("#assignmentDate").value = daysFromNow(3);

navItems.forEach((item) => {
  item.addEventListener("click", () => switchView(item.dataset.view));
});

demoSigninButton.addEventListener("click", signInDemo);
signoutButton.addEventListener("click", signOut);

bindRange("moodInput", "moodValue");
bindRange("stressInput", "stressValue");

document.querySelector("#checkinForm").addEventListener("input", updateLiveCoach);
document.querySelector("#checkinForm").addEventListener("submit", saveCheckin);
document.querySelector("#journalForm").addEventListener("submit", saveJournal);
document.querySelector("#assignmentForm").addEventListener("submit", saveAssignment);
document.querySelector("#coachRefresh").addEventListener("click", () => {
  updateCoach();
  showToast("Coach suggestion refreshed.");
});

render();
updateLiveCoach();
updateAuthView();
initGoogleSignIn();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return clone(defaultState);
  }

  try {
    return JSON.parse(saved);
  } catch {
    return clone(defaultState);
  }
}

function loadUser() {
  const saved = localStorage.getItem(USER_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function signInDemo() {
  currentUser = {
    name: "Demo Student",
    email: "student@university.edu",
    provider: "demo",
  };

  localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
  updateAuthView();
  showToast("Signed in with demo account.");
}

function signInWithGoogleProfile(profile) {
  currentUser = {
    name: profile.name || profile.email || "Student",
    email: profile.email || "",
    picture: profile.picture || "",
    provider: "google",
  };

  localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
  updateAuthView();
  showToast(`Signed in as ${currentUser.name}.`);
}

function signOut() {
  currentUser = null;
  localStorage.removeItem(USER_KEY);
  updateAuthView();
  showToast("Signed out.");
}

function updateAuthView() {
  const signedIn = Boolean(currentUser);
  authScreen.classList.toggle("hidden", signedIn);
  appShell.classList.toggle("hidden", !signedIn);

  if (signedIn) {
    profileName.textContent = currentUser.name || currentUser.email || "Student";
  }
}

function initGoogleSignIn(attempt = 0) {
  window.handleGoogleCredentialResponse = (response) => {
    const profile = parseJwt(response.credential);
    signInWithGoogleProfile(profile);
  };

  const clientId = window.CAMPUSCARE_GOOGLE_CLIENT_ID;
  const isMissingClientId = !clientId || clientId === GOOGLE_CLIENT_PLACEHOLDER;
  const isFilePage = window.location.protocol === "file:";

  if (isMissingClientId) {
    authSetupMessage.textContent =
      "Google sign-in needs a real OAuth Client ID in config.js. Use demo sign-in until that is added.";
    googleButton.innerHTML = "";
    return;
  }

  if (isFilePage) {
    authSetupMessage.textContent =
      "Google sign-in must run from http://localhost:5500, not from a file:// page.";
    googleButton.innerHTML = "";
    return;
  }

  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    if (attempt < 40) {
      window.setTimeout(() => initGoogleSignIn(attempt + 1), 150);
      return;
    }

    authSetupMessage.textContent =
      "Google sign-in could not load. Check your internet connection and refresh.";
    return;
  }

  authSetupMessage.textContent = "Choose your Google account to continue.";
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: window.handleGoogleCredentialResponse,
  });
  window.google.accounts.id.renderButton(googleButton, {
    theme: "outline",
    size: "large",
    width: 320,
    text: "continue_with",
  });
}

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const json = decodeURIComponent(
      decoded
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );

    return JSON.parse(json);
  } catch {
    return {};
  }
}

function switchView(viewName) {
  views.forEach((view) => view.classList.toggle("active", view.id === `${viewName}View`));
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  const activeView = document.querySelector(`#${viewName}View`);
  viewTitle.textContent = activeView.dataset.title;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindRange(inputId, outputId) {
  const input = document.querySelector(`#${inputId}`);
  const output = document.querySelector(`#${outputId}`);
  input.addEventListener("input", () => {
    output.textContent = input.value;
  });
}

function saveCheckin(event) {
  event.preventDefault();

  const entry = {
    id: createId(),
    date: todayIso(),
    mood: Number(document.querySelector("#moodInput").value),
    stress: Number(document.querySelector("#stressInput").value),
    sleep: Number(document.querySelector("#sleepInput").value),
    study: Number(document.querySelector("#studyInput").value),
    exercise: Number(document.querySelector("#exerciseInput").value),
    water: Number(document.querySelector("#waterInput").value),
    note: document.querySelector("#checkinNote").value.trim(),
  };

  state.checkins = state.checkins.filter((checkin) => checkin.date !== entry.date);
  state.checkins.push(entry);

  if (entry.note) {
    const analyzed = analyzeText(entry.note);
    state.journals.push({
      id: createId(),
      createdAt: new Date().toISOString(),
      text: entry.note,
      tags: analyzed.tags,
      crisis: analyzed.crisis,
    });
  }

  persist();
  render();
  showToast("Check-in saved. Your dashboard has been updated.");

  if (entry.note && analyzeText(entry.note).crisis) {
    switchView("campus");
    showToast("Support resources are visible in the Campus Hub.");
  }
}

function saveJournal(event) {
  event.preventDefault();
  const text = document.querySelector("#journalText").value.trim();
  if (!text) {
    showToast("Write a journal entry first.");
    return;
  }

  const analysis = analyzeText(text);
  state.journals.push({
    id: createId(),
    createdAt: new Date().toISOString(),
    text,
    tags: analysis.tags,
    crisis: analysis.crisis,
  });

  document.querySelector("#journalText").value = "";
  persist();
  render();
  showToast(analysis.crisis ? "Entry saved. Support resources are ready." : "Journal entry analyzed.");

  if (analysis.crisis) {
    switchView("campus");
  }
}

function saveAssignment(event) {
  event.preventDefault();

  state.assignments.push({
    id: createId(),
    title: document.querySelector("#assignmentTitle").value.trim(),
    course: document.querySelector("#assignmentCourse").value.trim(),
    dueDate: document.querySelector("#assignmentDate").value,
    type: document.querySelector("#assignmentType").value,
    difficulty: Number(document.querySelector("#assignmentDifficulty").value),
    complete: false,
  });

  event.currentTarget.reset();
  document.querySelector("#assignmentDate").value = daysFromNow(3);
  persist();
  render();
  showToast("Deadline added to your academic load.");
}

function render() {
  const checkins = sortedCheckins();
  const recent = checkins.slice(-7);
  const forecast = buildForecast();

  document.querySelector("#avgMood").textContent = formatAverage(recent.map((item) => item.mood));
  document.querySelector("#avgStress").textContent = formatAverage(recent.map((item) => item.stress));
  document.querySelector("#streakCount").textContent = `${calculateStreak()} days`;
  document.querySelector("#forecastText").textContent = forecast.title;
  document.querySelector("#forecastDetail").textContent = forecast.detail;
  document.querySelector("#forecastNeedle").style.transform = `rotate(${forecast.rotation}deg)`;
  document.querySelector("#sidebarInsight").textContent = getTopInsight();

  renderTrendChart(recent);
  renderDeadlines();
  renderInsights();
  renderJournal();
  renderAssignments();
  renderAnalytics();
  renderCampus();
  renderReport();
  updateCoach();
}

function renderTrendChart(checkins) {
  const chart = document.querySelector("#trendChart");
  if (!checkins.length) {
    chart.innerHTML = `<div class="empty-state">No check-ins yet.</div>`;
    return;
  }

  chart.innerHTML = checkins
    .map((item) => {
      const label = new Date(`${item.date}T00:00:00`).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      });
      return `
        <div class="chart-column" title="${label}">
          <div class="chart-bars">
            <div class="bar mood" style="height:${item.mood * 18}px"></div>
            <div class="bar stress" style="height:${item.stress * 18}px"></div>
          </div>
          <small>${label}</small>
        </div>
      `;
    })
    .join("");
}

function renderDeadlines() {
  const list = document.querySelector("#deadlineList");
  const upcoming = upcomingAssignments().slice(0, 4);

  if (!upcoming.length) {
    list.innerHTML = `<div class="empty-state">No upcoming deadlines.</div>`;
    return;
  }

  list.innerHTML = upcoming
    .map((item) => {
      return `
        <div class="list-item">
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.course)} - ${item.type} - ${relativeDate(item.dueDate)}</p>
        </div>
      `;
    })
    .join("");
}

function renderInsights() {
  const insights = [
    getSleepInsight(),
    getExerciseInsight(),
    getDeadlineInsight(),
  ];

  document.querySelector("#insightStrip").innerHTML = insights
    .map(
      (insight) => `
        <article class="insight-card">
          <strong>${insight.title}</strong>
          <p>${insight.body}</p>
        </article>
      `,
    )
    .join("");
}

function renderJournal() {
  const cloud = document.querySelector("#themeCloud");
  const counts = {};

  state.journals.forEach((entry) => {
    entry.tags.forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  const tags = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  cloud.innerHTML = tags.length
    ? tags.map(([tag, count]) => `<span class="tag">${escapeHtml(tag)} ${count}</span>`).join("")
    : `<div class="empty-state">Journal themes will appear here.</div>`;

  const entries = [...state.journals].reverse().slice(0, 6);
  document.querySelector("#journalList").innerHTML = entries.length
    ? entries
        .map((entry) => {
          const tagHtml = entry.tags
            .map((tag) => `<span class="tag ${tag === "Positive progress" ? "positive" : ""}">${escapeHtml(tag)}</span>`)
            .join("");
          return `
            <article class="journal-item">
              <strong>${formatDateTime(entry.createdAt)}</strong>
              <p>${escapeHtml(entry.text)}</p>
              <div class="tag-row">${tagHtml}${entry.crisis ? '<span class="tag warning">Support resources shown</span>' : ""}</div>
            </article>
          `;
        })
        .join("")
    : `<div class="empty-state">No journal entries yet.</div>`;
}

function renderAssignments() {
  const upcoming = upcomingAssignments();
  const heavyDays = buildBusyDayMap();
  const maxLoad = Math.max(0, ...Object.values(heavyDays));

  document.querySelector("#workloadTitle").textContent =
    maxLoad >= 3 ? "Heavy academic week detected." : "Academic load looks manageable.";
  document.querySelector("#workloadText").textContent =
    maxLoad >= 3
      ? "You have 3+ weighted deadlines clustered together. Plan recovery time around them."
      : "The app will flag weeks where deadlines cluster and stress may increase.";

  document.querySelector("#assignmentList").innerHTML = upcoming.length
    ? upcoming
        .map(
          (item) => `
            <article class="assignment-item">
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.course)} - ${item.type} - ${relativeDate(item.dueDate)} - ${difficultyLabel(item.difficulty)}</p>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">No assignments or exams yet.</div>`;

  const today = new Date();
  document.querySelector("#miniCalendar").innerHTML = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const iso = toIsoDate(date);
    return `<div class="day-dot ${heavyDays[iso] ? "busy" : ""}" title="${iso}">${date.getDate()}</div>`;
  }).join("");
}

function renderAnalytics() {
  const sleep = getSleepInsight();
  const exercise = getExerciseInsight();
  const deadlines = getDeadlineInsight();

  document.querySelector("#sleepMoodInsight").textContent = sleep.title;
  document.querySelector("#exerciseStressInsight").textContent = exercise.title;
  document.querySelector("#deadlineStressInsight").textContent = deadlines.title;

  const impacts = buildHabitImpact();
  document.querySelector("#habitBars").innerHTML = impacts
    .map(
      (impact) => `
        <div class="impact-row">
          <strong>${impact.label}</strong>
          <div class="impact-track"><div class="impact-fill" style="width:${impact.value}%"></div></div>
          <span>${impact.value}%</span>
        </div>
      `,
    )
    .join("");
}

function renderCampus() {
  document.querySelector("#resourceGrid").innerHTML = resources
    .map(
      (resource) => `
        <article class="resource-card">
          <p class="eyebrow">${resource.category}</p>
          <strong>${resource.name}</strong>
          <p>${resource.description}</p>
          <p>${resource.detail}</p>
        </article>
      `,
    )
    .join("");
}

function renderReport() {
  const checkins = sortedCheckins();
  const best = [...checkins].sort((a, b) => b.mood - a.mood)[0];
  const hardest = [...checkins].sort((a, b) => b.stress - a.stress)[0];
  const avgSleep = formatAverage(checkins.map((item) => item.sleep));
  const topTheme = topJournalTheme();

  document.querySelector("#reportTitle").textContent =
    checkins.length >= 3 ? "Your semester patterns are taking shape." : "Your report is warming up.";
  document.querySelector("#reportSummary").textContent =
    checkins.length >= 3
      ? "This recap highlights mood, stress, habits, and academic load without making medical claims."
      : "Add more check-ins to unlock a stronger semester wellness recap.";

  const cards = [
    {
      label: "Best mood day",
      value: best ? `${best.mood}/10` : "--",
      body: best ? `${formatDate(best.date)} had your strongest mood score.` : "No mood data yet.",
    },
    {
      label: "Most stressful day",
      value: hardest ? `${hardest.stress}/10` : "--",
      body: hardest ? `${formatDate(hardest.date)} had your highest stress score.` : "No stress data yet.",
    },
    {
      label: "Average sleep",
      value: avgSleep,
      body: avgSleep === "--" ? "No sleep data yet." : "Average hours across check-ins.",
    },
    {
      label: "Top journal theme",
      value: topTheme.name,
      body: topTheme.body,
    },
    {
      label: "Upcoming deadlines",
      value: String(upcomingAssignments().length),
      body: "Active academic items in your tracker.",
    },
    {
      label: "Positive signal",
      value: bestHabitSignal(),
      body: "A habit that appears connected to better days.",
    },
  ];

  document.querySelector("#reportGrid").innerHTML = cards
    .map(
      (card) => `
        <article class="report-card">
          <p class="eyebrow">${card.label}</p>
          <strong>${card.value}</strong>
          <p>${card.body}</p>
        </article>
      `,
    )
    .join("");
}

function updateLiveCoach() {
  const mood = Number(document.querySelector("#moodInput").value);
  const stress = Number(document.querySelector("#stressInput").value);
  const sleep = Number(document.querySelector("#sleepInput").value);
  const exercise = Number(document.querySelector("#exerciseInput").value);
  const note = document.querySelector("#checkinNote").value;
  const tags = analyzeText(note).tags;

  let title = "A balanced day is forming.";
  let body = "One small supportive habit can make this check-in more useful.";

  if (stress >= 7) {
    title = "Stress is running high.";
    body = "Try a short reset, then break the next academic task into a 20-minute step.";
  } else if (sleep < 6) {
    title = "Sleep may be affecting today.";
    body = "A lighter study plan and earlier wind-down could help protect tomorrow.";
  } else if (mood >= 8 && exercise > 20) {
    title = "Movement seems connected to a better day.";
    body = "This is a good habit to repeat later this week.";
  }

  document.querySelector("#liveCoachTitle").textContent = title;
  document.querySelector("#liveCoachText").textContent = body;
  document.querySelector("#liveTags").innerHTML =
    tags.length > 0
      ? tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")
      : `<span class="tag">No journal themes yet</span>`;
}

function updateCoach() {
  const latest = sortedCheckins().at(-1);
  const coach = buildCoachMessage(latest);
  document.querySelector("#coachHeadline").textContent = coach.title;
  document.querySelector("#coachBody").textContent = coach.body;
  document.querySelector("#goalTitle").textContent = coach.goalTitle;
  document.querySelector("#goalBody").textContent = coach.goalBody;
  document.querySelector("#goalBox").textContent = coach.goalBox;
}

function buildCoachMessage(latest) {
  if (!latest) {
    return {
      title: "Your coach is ready.",
      body: "Save a check-in or journal entry to get personalized suggestions.",
      goalTitle: "Build a steady baseline",
      goalBody: "Aim for one check-in and one supportive habit today.",
      goalBox: "Today's goal: complete a 2-minute reflection.",
    };
  }

  if (latest.stress >= 7) {
    return {
      title: "Your recent stress is elevated.",
      body: "Your recent pattern suggests it may help to reduce friction around the next deadline. Pick one task, define the first step, and stop after a focused block.",
      goalTitle: "Lower the next step",
      goalBody: "A smaller task can make a heavy week feel more manageable.",
      goalBox: "Today's goal: one 20-minute study block, then a 10-minute reset.",
    };
  }

  if (latest.sleep >= 8 && latest.mood >= 7) {
    return {
      title: "Sleep appears to be helping.",
      body: "You reported stronger mood on a higher-sleep day. Consider protecting the same bedtime routine before your next deadline.",
      goalTitle: "Protect what works",
      goalBody: "Repeat the habit that seems connected to a better day.",
      goalBox: "Today's goal: choose a wind-down time and keep it realistic.",
    };
  }

  if (latest.exercise >= 30) {
    return {
      title: "Movement showed up in your better-day pattern.",
      body: "You logged exercise recently. If that felt helpful, scheduling another movement break this week could be a strong experiment.",
      goalTitle: "Schedule one repeat",
      goalBody: "Turn a helpful habit into a planned habit.",
      goalBox: "Today's goal: add one walk, swim, class, or gym session.",
    };
  }

  return {
    title: "Your baseline is building.",
    body: "Keep logging mood, sleep, habits, and deadlines. The app will become more personal as your patterns grow.",
    goalTitle: "Add one signal",
    goalBody: "More complete data makes the coach more useful.",
    goalBox: "Today's goal: log sleep, stress, and one journal sentence.",
  };
}

function buildForecast() {
  const recent = sortedCheckins().slice(-3);
  const upcomingLoad = upcomingAssignments().filter((item) => daysUntil(item.dueDate) <= 5).length;
  const avgStress = average(recent.map((item) => item.stress));
  const avgSleep = average(recent.map((item) => item.sleep));
  const risk = Math.min(10, Math.round(avgStress + upcomingLoad * 1.2 + (avgSleep < 6.5 ? 1.5 : 0)));

  if (!recent.length) {
    return {
      title: "Your next few days look steady.",
      detail: "Add sleep, stress, and deadlines to make this smarter.",
      rotation: -58,
    };
  }

  if (risk >= 8) {
    return {
      title: "Stress may increase over the next few days.",
      detail: "Recent stress, lower sleep, or upcoming deadlines are raising the forecast.",
      rotation: 58,
    };
  }

  if (risk >= 6) {
    return {
      title: "Your forecast shows a moderate workload bump.",
      detail: "A short plan today may help prevent a stressful deadline pileup.",
      rotation: 10,
    };
  }

  return {
    title: "Your next few days look manageable.",
    detail: "Recent data suggests a steadier rhythm. Keep protecting the habits that helped.",
    rotation: -42,
  };
}

function getTopInsight() {
  const latest = sortedCheckins().at(-1);
  if (!latest) return "Log a check-in to unlock your first insight.";
  if (latest.sleep >= 8 && latest.mood >= 7) return "Your latest high-sleep day also had a stronger mood score.";
  if (latest.stress >= 7) return "Your recent stress is high. The coach has a smaller next-step goal ready.";
  if (upcomingAssignments().length >= 3) return "Your academic load is building. Plan recovery time around deadlines.";
  return "Your baseline is growing. More entries will make insights sharper.";
}

function getSleepInsight() {
  const highSleep = state.checkins.filter((item) => item.sleep >= 8);
  const lowSleep = state.checkins.filter((item) => item.sleep < 8);
  if (!highSleep.length || !lowSleep.length) {
    return {
      title: "Need more sleep variety",
      body: "Log both high-sleep and low-sleep days to compare mood patterns.",
    };
  }

  const diff = Math.round((average(highSleep.map((item) => item.mood)) - average(lowSleep.map((item) => item.mood))) * 10);
  return {
    title: diff >= 0 ? `Mood is ${diff}% higher` : `Mood is ${Math.abs(diff)}% lower`,
    body: "Compared days after 8+ hours of sleep with lower-sleep days.",
  };
}

function getExerciseInsight() {
  const active = state.checkins.filter((item) => item.exercise >= 20);
  const inactive = state.checkins.filter((item) => item.exercise < 20);
  if (!active.length || !inactive.length) {
    return {
      title: "Need more movement data",
      body: "Log active and low-activity days to compare stress patterns.",
    };
  }

  const diff = Math.round((average(inactive.map((item) => item.stress)) - average(active.map((item) => item.stress))) * 10);
  return {
    title: diff >= 0 ? `Stress is ${diff}% lower` : `Stress is ${Math.abs(diff)}% higher`,
    body: "Compared days with 20+ minutes of exercise against lower-activity days.",
  };
}

function getDeadlineInsight() {
  const busy = Object.values(buildBusyDayMap()).filter((weight) => weight >= 3).length;
  const highStress = state.checkins.filter((item) => item.stress >= 7).length;
  if (!state.assignments.length || !state.checkins.length) {
    return {
      title: "Need workload data",
      body: "Add deadlines and check-ins to compare academic load with stress.",
    };
  }

  return {
    title: busy || highStress ? "Busy weeks need recovery" : "No deadline spike yet",
    body:
      busy || highStress
        ? "Your tracker shows either clustered deadlines or elevated stress. Add buffer time early."
        : "Current deadlines are not yet clustering into a high-load week.",
  };
}

function buildHabitImpact() {
  return [
    { label: "Sleep", value: clamp(Math.round(average(state.checkins.map((item) => item.sleep)) * 10), 10, 100) },
    { label: "Exercise", value: clamp(Math.round(average(state.checkins.map((item) => item.exercise)) * 2), 10, 100) },
    { label: "Hydration", value: clamp(Math.round(average(state.checkins.map((item) => item.water)) * 11), 10, 100) },
    { label: "Study balance", value: clamp(100 - Math.round(average(state.checkins.map((item) => item.study)) * 9), 10, 100) },
  ];
}

function bestHabitSignal() {
  const latest = sortedCheckins().at(-1);
  if (!latest) return "Check-ins";
  if (latest.sleep >= 8) return "Sleep";
  if (latest.exercise >= 20) return "Exercise";
  if (latest.water >= 7) return "Hydration";
  return "Reflection";
}

function analyzeText(text) {
  const normalized = text.toLowerCase();
  const themes = [
    ["Academic stress", ["exam", "assignment", "deadline", "grade", "class", "homework", "study", "project"]],
    ["Anxiety", ["anxious", "panic", "worried", "overthinking", "nervous", "fear"]],
    ["Loneliness", ["lonely", "alone", "isolated", "homesick", "miss home"]],
    ["Motivation", ["motivated", "focused", "productive", "progress", "proud"]],
    ["Burnout", ["burned out", "burnout", "exhausted", "drained", "tired", "overwhelmed"]],
    ["Social stress", ["roommate", "friend", "relationship", "party", "group"]],
    ["Positive progress", ["better", "happy", "grateful", "hopeful", "good", "energy", "helped"]],
  ];

  const tags = themes
    .filter(([, words]) => words.some((word) => normalized.includes(word)))
    .map(([label]) => label);

  const crisisWords = ["hurt myself", "kill myself", "suicide", "end my life", "not want to live"];
  const crisis = crisisWords.some((word) => normalized.includes(word));

  return {
    tags: tags.length ? tags : ["General reflection"],
    crisis,
  };
}

function sortedCheckins() {
  return [...state.checkins].sort((a, b) => a.date.localeCompare(b.date));
}

function upcomingAssignments() {
  return [...state.assignments]
    .filter((item) => !item.complete && daysUntil(item.dueDate) >= 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

function buildBusyDayMap() {
  return state.assignments.reduce((map, item) => {
    map[item.dueDate] = (map[item.dueDate] || 0) + Number(item.difficulty || 1);
    return map;
  }, {});
}

function topJournalTheme() {
  const counts = {};
  state.journals.forEach((entry) => {
    entry.tags.forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top) {
    return {
      name: "No theme yet",
      body: "Journal themes will appear after entries are analyzed.",
    };
  }

  return {
    name: top[0],
    body: `${top[1]} journal entry or entries included this theme.`,
  };
}

function calculateStreak() {
  const dates = new Set(state.checkins.map((item) => item.date));
  let streak = 0;
  const cursor = new Date();

  while (dates.has(toIsoDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function formatAverage(values) {
  const avg = average(values);
  return avg ? avg.toFixed(1) : "--";
}

function difficultyLabel(value) {
  return Number(value) === 3 ? "Heavy" : Number(value) === 2 ? "Medium" : "Light";
}

function todayIso() {
  return toIsoDate(new Date());
}

function daysAgo(amount) {
  const date = new Date();
  date.setDate(date.getDate() - amount);
  return toIsoDate(date);
}

function daysFromNow(amount) {
  const date = new Date();
  date.setDate(date.getDate() + amount);
  return toIsoDate(date);
}

function daysUntil(isoDate) {
  const today = new Date(`${todayIso()}T00:00:00`);
  const target = new Date(`${isoDate}T00:00:00`);
  return Math.round((target - today) / 86400000);
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function relativeDate(isoDate) {
  const diff = daysUntil(isoDate);
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return `Due in ${diff} days`;
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(isoDateTime) {
  return new Date(isoDateTime).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value || min));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}
