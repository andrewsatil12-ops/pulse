// State & Mock Data
const state = {
  currentView: 'dashboard',
  onboardingStep: 1,
  chartTimeframe: 'week',
  plan: { selectedDayIndex: 3 },
  settings: {
    goal:            'strength',
    restTime:        90,
    weeklyDays:      '4-5',
    caloriesTarget:  2200,
    proteinTarget:   160,
    units:           'kg',
    theme:           'dark'
  }
};

const mockData = {
  dashboard: {
    activityPercent: 72,
    caloriesCurrent: 1840,
    weekly: [90, 60, 100, 40, 85, 70, 0],
    streak: 5
  },
  workout: {
    session: {
      name: 'Lower Body B',
      exercises: [
        { name: 'Back Squat',        sets: 4, reps: 8,  load: 82.5, unit: 'kg', completedSets: 0 },
        { name: 'Romanian Deadlift', sets: 3, reps: 10, load: 62.5, unit: 'kg', completedSets: 0 },
        { name: 'Leg Press',         sets: 3, reps: 12, load: 125,  unit: 'kg', completedSets: 0 },
        { name: 'Calf Raise',        sets: 4, reps: 15, load: 42.5, unit: 'kg', completedSets: 0 }
      ],
      currentExerciseIndex: 0,
      isComplete: false
    }
  },
  plan: {
    days: [
      { day: 'Mon', label: 'Monday',    type: 'Lower Body A', status: 'done',    exercises: [ {name:'Back Squat', sets:4, reps:8, load:80, unit:'kg'}, {name:'Romanian Deadlift', sets:3, reps:10, load:60, unit:'kg'}, {name:'Leg Press', sets:3, reps:12, load:120, unit:'kg'}, {name:'Calf Raise', sets:4, reps:15, load:40, unit:'kg'} ] },
      { day: 'Tue', label: 'Tuesday',   type: 'Rest',         status: 'rest',    exercises: [] },
      { day: 'Wed', label: 'Wednesday', type: 'Upper Body A', status: 'done',    exercises: [ {name:'Bench Press', sets:4, reps:8, load:70, unit:'kg'}, {name:'Barbell Row', sets:4, reps:8, load:60, unit:'kg'}, {name:'Overhead Press', sets:3, reps:10, load:45, unit:'kg'}, {name:'Pull-Up', sets:3, reps:8, load:0, unit:'BW'} ] },
      { day: 'Thu', label: 'Thursday',  type: 'Lower Body B', status: 'active',  exercises: [ {name:'Back Squat', sets:4, reps:8, load:82.5, unit:'kg'}, {name:'Romanian Deadlift', sets:3, reps:10, load:62.5, unit:'kg'}, {name:'Leg Press', sets:3, reps:12, load:125, unit:'kg'}, {name:'Calf Raise', sets:4, reps:15, load:42.5, unit:'kg'} ] },
      { day: 'Fri', label: 'Friday',    type: 'Upper Body B', status: 'planned', exercises: [ {name:'Incline Press', sets:4, reps:8, load:60, unit:'kg'}, {name:'Cable Row', sets:4, reps:10, load:50, unit:'kg'}, {name:'Lateral Raise', sets:3, reps:15, load:12, unit:'kg'}, {name:'Tricep Dip', sets:3, reps:12, load:0, unit:'BW'} ] },
      { day: 'Sat', label: 'Saturday',  type: 'Rest',         status: 'rest',    exercises: [] },
      { day: 'Sun', label: 'Sunday',    type: 'Full Body',    status: 'planned', exercises: [ {name:'Deadlift', sets:3, reps:5, load:100, unit:'kg'}, {name:'Pull-Up', sets:3, reps:8, load:0, unit:'BW'}, {name:'Dumbbell Press', sets:3, reps:10, load:24, unit:'kg'}, {name:'Goblet Squat', sets:3, reps:12, load:32, unit:'kg'} ] }
    ]
  },
  analytics: {
    week: [1200, 1500, 0, 1800, 1600, 2000, 0],
    month: [4500, 5200, 4800, 6100], // weeks in month
    year: [50000, 52000, 48000, 55000, 60000, 62000, 58000, 65000, 70000, 72000, 75000, 80000], // months
    timeline: [
      { date: 'Jun 19', event: 'Personal record — Back Squat 92.5 kg', type: 'pr' },
      { date: 'Jun 17', event: 'Session complete — Upper Body A · 14,200 kg volume', type: 'session' },
      { date: 'Jun 15', event: '5-day streak reached', type: 'streak' },
      { date: 'Jun 14', event: 'Session complete — Lower Body A · 11,080 kg volume', type: 'session' },
      { date: 'Jun 12', event: 'Personal record — Romanian Deadlift 65 kg', type: 'pr' },
      { date: 'Jun 10', event: 'Session complete — Full Body · 9,440 kg volume', type: 'session' },
      { date: 'Jun 8',  event: 'Personal record — Leg Press 125 kg', type: 'pr' },
      { date: 'Jun 6',  event: '10-day streak reached', type: 'streak' }
    ]
  }
};

// Initialization
let restTimerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initAnalyticsToggles();
  
  // Trigger initial animations for default view
  if(state.currentView === 'dashboard') {
    renderDashboard();
  }
});

// --- Navigation & View Switching ---
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      if (target) {
        switchView(target);
      }
    });
  });
}

function switchView(viewId) {
  state.currentView = viewId;
  
  if (restTimerInterval) {
    clearInterval(restTimerInterval);
    restTimerInterval = null;
  }
  
  // Update sidebar active states
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-target') === viewId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Hide all views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });

  // Show target view
  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Handle specific view logic
  if (viewId === 'onboarding') {
    resetOnboarding();
  }

  if (viewId === 'dashboard') renderDashboard();
  if (viewId === 'workout') renderWorkout();
  if (viewId === 'plan') renderPlan();
  if (viewId === 'settings') renderSettings();
  if (viewId === 'analytics') renderAnalytics();
}

window.switchView = switchView;

window.goToWorkout = () => {
  switchView('workout');
};

// --- Onboarding Logic ---

window.selectOption = (btn, step) => {
  // Visual selection within step
  const siblings = btn.parentElement.querySelectorAll('.option-card');
  siblings.forEach(s => s.style.borderColor = 'var(--card-border)');
  btn.style.borderColor = 'var(--accent-lime)';

  // If not last step, move to next after short delay
  if (step < 3) {
    setTimeout(() => {
      document.getElementById(`step-${step}`).classList.remove('active');
      document.getElementById(`step-${step + 1}`).classList.add('active');
      
      const dots = document.querySelectorAll('.progress-dots .dot');
      dots[step - 1].classList.remove('active');
      dots[step].classList.add('active');
      
      state.onboardingStep = step + 1;
    }, 300);
  }
};

window.finishOnboarding = () => {
  // In a real app, save preferences here
  switchView('dashboard');
};

function resetOnboarding() {
  document.querySelectorAll('.onboarding-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-1').classList.add('active');
  
  document.querySelectorAll('.progress-dots .dot').forEach((d, i) => {
    if(i===0) d.classList.add('active');
    else d.classList.remove('active');
  });
  
  document.querySelectorAll('.option-card').forEach(c => c.style.borderColor = 'var(--card-border)');
  state.onboardingStep = 1;
}

// --- Animation Utilities ---
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // Ease out quad
    const easeProgress = progress * (2 - progress);
    const current = Math.floor(easeProgress * (end - start) + start);
    
    obj.innerHTML = current.toLocaleString();
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end.toLocaleString(); // Ensure exact end
    }
  };
  window.requestAnimationFrame(step);
}

function animateRing(ringElement, percent, duration = 1200) {
  if(!ringElement) return;
  const radius = ringElement.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  
  // Set initial state
  ringElement.style.strokeDasharray = `${circumference} ${circumference}`;
  ringElement.style.strokeDashoffset = circumference;
  
  // Trigger reflow
  ringElement.getBoundingClientRect();
  
  // Set target state
  const offset = circumference - (percent / 100) * circumference;
  ringElement.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
  ringElement.style.strokeDashoffset = offset;
}

// --- Dashboard Render ---
function renderDashboard() {
  // Animate Ring
  const dashRing = document.getElementById('dash-ring');
  animateRing(dashRing, mockData.dashboard.activityPercent);

  // Animate Numbers
  const dashRingVal = document.querySelector('#view-dashboard .ring-value .value');
  if(dashRingVal && dashRingVal.innerText === "0") {
     animateValue(dashRingVal, 0, mockData.dashboard.activityPercent, 1200);
  }

  const calVal = document.querySelector('#view-dashboard .data-card .value span[data-value]');
  if(calVal && calVal.innerText === "0") {
     animateValue(calVal, 0, mockData.dashboard.caloriesCurrent, 1000);
  }

  const streakVal = document.getElementById('streak-value');
  if (streakVal && streakVal.innerText === '0') {
    animateValue(streakVal, 0, mockData.dashboard.streak, 800);
  }

  // Render Bar Graph
  const barsContainer = document.getElementById('weekly-bars');
  if(barsContainer && barsContainer.children.length === 0) {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    let html = '';
    mockData.dashboard.weekly.forEach((val, i) => {
      html += `
        <div class="bar-col">
          <div class="bar" style="height: 0%" data-target-height="${val}%"></div>
          <span class="day">${days[i]}</span>
        </div>
      `;
    });
    barsContainer.innerHTML = html;
    
    // Animate bars
    setTimeout(() => {
      barsContainer.querySelectorAll('.bar').forEach(bar => {
        bar.style.height = bar.getAttribute('data-target-height');
      });
    }, 100);
  }
}

// --- Workout Render ---
function renderWorkout() {
  const session = mockData.workout.session;
  session.exercises.forEach(ex => ex.completedSets = 0);
  session.currentExerciseIndex = 0;
  session.isComplete = false;
  
  const nameEl = document.getElementById('workout-session-name');
  if(nameEl) nameEl.innerText = session.name;
  
  updateWorkoutView();
}

function updateWorkoutView() {
  const session = mockData.workout.session;
  if (session.isComplete) {
    renderSessionComplete();
  } else {
    updateSessionProgress();
    renderExerciseList();
    renderCurrentExercise();
  }
}

function updateSessionProgress() {
  const session = mockData.workout.session;
  const el = document.getElementById('session-progress-label');
  if (el) el.innerText = `Exercise ${session.currentExerciseIndex + 1} / ${session.exercises.length}`;
}

function renderExerciseList() {
  const session = mockData.workout.session;
  const panel = document.getElementById('exercise-list-panel');
  if(!panel) return;
  
  let html = '';
  session.exercises.forEach((ex, i) => {
    const isActive = i === session.currentExerciseIndex;
    const isDone = ex.completedSets >= ex.sets;
    let classes = 'exercise-list-item';
    if(isActive) classes += ' active';
    if(isDone) classes += ' done';
    
    const rightSide = isDone 
      ? `<div class="eli-status"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`
      : `<span class="eli-sets-done">${ex.completedSets}/${ex.sets}</span>`;
      
    html += `
      <div class="${classes}" onclick="jumpToExercise(${i})">
        <div class="eli-left">
          <div class="eli-number">${i + 1}</div>
          <div class="eli-info">
            <span class="eli-name">${ex.name}</span>
            <span class="eli-meta">${ex.sets} × ${ex.reps} — ${ex.load} ${ex.unit}</span>
          </div>
        </div>
        ${rightSide}
      </div>
    `;
  });
  panel.innerHTML = html;
}

function renderCurrentExercise() {
  const session = mockData.workout.session;
  const panel = document.getElementById('workout-detail-panel');
  if(!panel) return;
  
  const ex = session.exercises[session.currentExerciseIndex];
  const allSetsDone = ex.completedSets >= ex.sets;
  const isLastExercise = session.currentExerciseIndex === session.exercises.length - 1;
  
  let dotsHtml = '';
  for(let i=0; i<ex.sets; i++) {
    if(i < ex.completedSets) {
      dotsHtml += `<button class="set-dot completed"></button>`;
    } else if(i === ex.completedSets) {
      dotsHtml += `<button class="set-dot next" onclick="completeSet()"></button>`;
    } else {
      dotsHtml += `<button class="set-dot pending"></button>`;
    }
  }
  
  let nextBtnHtml = '';
  if(allSetsDone) {
    const btnText = isLastExercise ? "Finish Session →" : "Next Exercise →";
    nextBtnHtml = `<button class="btn-next-exercise" onclick="nextExercise()">${btnText}</button>`;
  }
  
  panel.innerHTML = `
    <div class="card current-exercise-card">
      <div class="exercise-top">
        <span class="sub-label">${session.name}</span>
        <h2 class="exercise-name">${ex.name}</h2>
      </div>
      <div class="exercise-details">
        <div class="detail-item">
          <span class="label">Sets × Reps</span>
          <span class="value number">${ex.sets} × ${ex.reps}</span>
        </div>
        <div class="detail-item">
          <span class="label">Load</span>
          <span class="value number">${ex.load} <span class="unit">${ex.unit}</span></span>
        </div>
      </div>
      <div class="set-tracker">
        <span class="label">Track Sets</span>
        <div class="set-dots">${dotsHtml}</div>
      </div>
      ${nextBtnHtml}
    </div>
    
    <div class="card timer-card">
      <div class="card-content-wrap">
        <div class="ring-container timer-ring-container">
          <svg class="activity-ring" viewBox="0 0 100 100">
            <circle class="ring-bg" cx="50" cy="50" r="40"></circle>
            <circle class="ring-progress" id="timer-ring" cx="50" cy="50" r="40"></circle>
          </svg>
          <div class="ring-value">
            <span class="value number" id="timer-value">90</span><span class="unit">s</span>
          </div>
        </div>
        <div class="card-labels">
          <span class="label" id="timer-label">Resting</span>
        </div>
      </div>
    </div>
  `;
}

window.completeSet = function() {
  const session = mockData.workout.session;
  const ex = session.exercises[session.currentExerciseIndex];
  ex.completedSets++;
  
  renderExerciseList();
  renderCurrentExercise();
  
  if (ex.completedSets < ex.sets) {
    startRestTimer(90);
  } else {
    if(restTimerInterval) { clearInterval(restTimerInterval); restTimerInterval = null; }
    const timerVal = document.getElementById('timer-value');
    const timerLabel = document.getElementById('timer-label');
    const timerRing = document.getElementById('timer-ring');
    if(timerVal) { timerVal.innerText = '✓'; timerVal.nextElementSibling.style.display = 'none'; }
    if(timerLabel) timerLabel.innerText = 'Done';
    if(timerRing) timerRing.style.strokeDashoffset = 0;
  }
};

window.nextExercise = function() {
  if(restTimerInterval) { clearInterval(restTimerInterval); restTimerInterval = null; }
  const session = mockData.workout.session;
  if(session.currentExerciseIndex < session.exercises.length - 1) {
    session.currentExerciseIndex++;
    updateWorkoutView();
  } else {
    session.isComplete = true;
    renderSessionComplete();
  }
};

window.jumpToExercise = function(index) {
  const session = mockData.workout.session;
  if(index <= session.currentExerciseIndex) {
    if(restTimerInterval) { clearInterval(restTimerInterval); restTimerInterval = null; }
    session.currentExerciseIndex = index;
    updateWorkoutView();
  }
};

function renderSessionComplete() {
  const session = mockData.workout.session;
  session.exercises.forEach(ex => ex.completedSets = ex.sets);
  renderExerciseList();
  
  const panel = document.getElementById('workout-detail-panel');
  if(!panel) return;
  
  panel.innerHTML = `
    <div class="card session-complete-card">
      <div class="complete-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h2 class="complete-headline">Session complete</h2>
      <span class="sub-label">${session.name} · ${session.exercises.length} exercises</span>
      <div class="complete-stats">
        <div class="complete-stat">
          <span class="value number">14</span>
          <span class="label">Sets</span>
        </div>
        <div class="complete-stat">
          <span class="value number">11,080</span>
          <span class="label">kg Vol</span>
        </div>
        <div class="complete-stat">
          <span class="value number">48</span>
          <span class="label">Mins</span>
        </div>
      </div>
      <button class="btn-primary" onclick="switchView('dashboard')">Back to Dashboard</button>
    </div>
  `;
}

function startRestTimer(durationSeconds = 90) {
  if(restTimerInterval) { clearInterval(restTimerInterval); restTimerInterval = null; }
  const timerRing = document.getElementById('timer-ring');
  const timerVal = document.getElementById('timer-value');
  const timerLabel = document.getElementById('timer-label');
  
  if (!timerRing || !timerVal) return;
  
  let remaining = durationSeconds;
  timerVal.innerText = remaining;
  if(timerVal.nextElementSibling) timerVal.nextElementSibling.style.display = 'inline';
  if(timerLabel) timerLabel.innerText = 'Resting';
  
  const radius = timerRing.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  
  timerRing.style.strokeDasharray = `${circumference} ${circumference}`;
  timerRing.style.transition = 'none';
  timerRing.style.strokeDashoffset = 0;
  
  // Trigger reflow
  timerRing.getBoundingClientRect();
  timerRing.style.transition = 'stroke-dashoffset 1s linear';
  
  restTimerInterval = setInterval(() => {
    remaining--;
    if (remaining < 0) {
      clearInterval(restTimerInterval);
      restTimerInterval = null;
      if(timerVal) { timerVal.innerText = 'Go'; timerVal.nextElementSibling.style.display = 'none'; }
      if(timerLabel) timerLabel.innerText = 'Next set';
      return;
    }
    timerVal.innerText = remaining;
    const offset = circumference * (1 - (remaining / durationSeconds));
    timerRing.style.strokeDashoffset = offset;
  }, 1000);
}

// --- Plan Render ---
function renderPlan() {
  renderWeekStrip();
  renderDayDetail();
}

function renderWeekStrip() {
  const strip = document.getElementById('week-strip');
  if(!strip) return;
  
  const selectedIndex = state.plan.selectedDayIndex;
  let html = '';
  
  mockData.plan.days.forEach((dayObj, i) => {
    let classes = 'week-day-btn ' + dayObj.status;
    if(i === selectedIndex) classes += ' selected';
    
    html += `
      <div class="${classes}" onclick="selectPlanDay(${i})">
        <span class="week-day-label">${dayObj.day}</span>
        <span class="week-day-type">${dayObj.status === 'rest' ? '—' : dayObj.type}</span>
        <div class="week-day-dot"></div>
      </div>
    `;
  });
  
  strip.innerHTML = html;
}

function renderDayDetail() {
  const detail = document.getElementById('day-detail');
  if(!detail) return;
  
  const dayObj = mockData.plan.days[state.plan.selectedDayIndex];
  
  if (dayObj.status === 'rest') {
    detail.innerHTML = `
      <div class="card">
        <div class="day-detail-header">
          <div>
            <h2 class="headline">${dayObj.label}</h2>
          </div>
          <span class="rest-badge">Rest day</span>
        </div>
      </div>
    `;
    return;
  }
  
  let badgeHtml = '';
  if (dayObj.status === 'done') {
    badgeHtml = `<span class="done-badge">Completed</span>`;
  } else if (dayObj.status === 'active') {
    badgeHtml = `<button class="day-cta" onclick="switchView('workout')">Start Session →</button>`;
  }
  
  let exercisesHtml = '';
  dayObj.exercises.forEach((ex, i) => {
    let loadHtml = ex.unit === 'BW' ? `BW` : `${ex.load} <span style="font-size: 0.7em; font-weight: normal; font-family: var(--font-body); color: var(--text-secondary);">${ex.unit}</span>`;
    exercisesHtml += `
      <div class="plan-exercise-row">
        <div class="plan-ex-num">${i + 1}</div>
        <div class="plan-ex-name">${ex.name}</div>
        <div class="plan-ex-detail">${ex.sets} × ${ex.reps}</div>
        <div class="plan-ex-load">${loadHtml}</div>
      </div>
    `;
  });
  
  detail.innerHTML = `
    <div class="card">
      <div class="day-detail-header">
        <div>
          <h2 class="headline">${dayObj.label}</h2>
          <span class="sub-label">${dayObj.type} · ${dayObj.exercises.length} exercises</span>
        </div>
        ${badgeHtml}
      </div>
      <div class="plan-exercise-list">
        ${exercisesHtml}
      </div>
    </div>
  `;
}

window.selectPlanDay = function(index) {
  state.plan.selectedDayIndex = index;
  renderWeekStrip();
  renderDayDetail();
};

// --- Analytics Render ---
function initAnalyticsToggles() {
  const toggles = document.querySelectorAll('#time-toggle .toggle-btn');
  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      toggles.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      
      state.chartTimeframe = e.target.getAttribute('data-time');
      drawChart();
    });
  });
}

function renderAnalytics() {
  drawChart();

  const container = document.querySelector('#view-analytics .analytics-content');
  if (!container) return;

  const existing = document.getElementById('timeline-card');
  if (existing) existing.remove();

  const timelineHTML = `
    <div class="card timeline-card" id="timeline-card">
      <span class="label">Activity</span>
      <div class="timeline-list">
        ${mockData.analytics.timeline.map(item => `
          <div class="timeline-item ${item.type}">
            <span class="timeline-date">${item.date}</span>
            <div class="timeline-dot-col">
              <div class="timeline-dot ${item.type}"></div>
            </div>
            <span class="timeline-event">${item.event}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', timelineHTML);
}

function drawChart() {
  const canvas = document.getElementById('analytics-chart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Set actual size in memory (scaled for retina)
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const width = rect.width;
  const height = rect.height;
  
  // Get data
  const data = mockData.analytics[state.chartTimeframe];
  const maxVal = Math.max(...data) * 1.1; // 10% headroom
  
  ctx.clearRect(0, 0, width, height);
  
  if(data.length === 0) return;

  const padX = 20;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;
  
  // Draw points & lines
  ctx.beginPath();
  const points = data.map((val, i) => {
    const x = padX + (i / (data.length - 1)) * chartW;
    const y = padY + chartH - ((val / maxVal) * chartH);
    return {x, y};
  });
  
  // Smooth curve or straight lines. Let's do straight lines for "data speaks" functional vibe.
  ctx.moveTo(points[0].x, points[0].y);
  for(let i=1; i<points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  ctx.strokeStyle = '#C6FF3D'; // Lime
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // Fill under line
  ctx.lineTo(points[points.length-1].x, height);
  ctx.lineTo(points[0].x, height);
  ctx.closePath();
  
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(198, 255, 61, 0.2)');
  gradient.addColorStop(1, 'rgba(198, 255, 61, 0.0)');
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Draw data points
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#C6FF3D';
    ctx.fill();
    ctx.strokeStyle = '#16171B'; // card bg
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

// Redraw chart on resize
window.addEventListener('resize', () => {
  if (state.currentView === 'analytics') {
    drawChart();
  }
});

// --- Settings Render ---
function renderSettings() {
  const container = document.getElementById('settings-content');
  if(!container) return;
  
  const s = state.settings;
  
  container.innerHTML = `
    <!-- Card 1: Training -->
    <div class="settings-card">
      <div class="settings-card-title">Training</div>
      
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Goal</span>
        </div>
        <div class="seg-control">
          <button class="seg-btn ${s.goal === 'weight-loss' ? 'active' : ''}" onclick="updateSetting('goal', 'weight-loss')">Lose weight</button>
          <button class="seg-btn ${s.goal === 'strength' ? 'active' : ''}" onclick="updateSetting('goal', 'strength')">Build strength</button>
          <button class="seg-btn ${s.goal === 'conditioning' ? 'active' : ''}" onclick="updateSetting('goal', 'conditioning')">Improve conditioning</button>
        </div>
      </div>
      
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Rest between sets</span>
        </div>
        <div class="stepper">
          <button class="stepper-btn" onclick="updateSetting('restTime', Math.max(30, ${s.restTime} - 15))">−</button>
          <div class="stepper-value">${s.restTime}s</div>
          <button class="stepper-btn" onclick="updateSetting('restTime', Math.min(300, ${s.restTime} + 15))">+</button>
        </div>
      </div>
      
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Weekly target</span>
        </div>
        <div class="seg-control">
          <button class="seg-btn ${s.weeklyDays === '2-3' ? 'active' : ''}" onclick="updateSetting('weeklyDays', '2-3')">2–3 days</button>
          <button class="seg-btn ${s.weeklyDays === '4-5' ? 'active' : ''}" onclick="updateSetting('weeklyDays', '4-5')">4–5 days</button>
          <button class="seg-btn ${s.weeklyDays === '6-7' ? 'active' : ''}" onclick="updateSetting('weeklyDays', '6-7')">6–7 days</button>
        </div>
      </div>
    </div>
    
    <!-- Card 2: Nutrition -->
    <div class="settings-card">
      <div class="settings-card-title">Nutrition</div>
      
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Daily calorie target</span>
          <small>kcal</small>
        </div>
        <div class="stepper">
          <button class="stepper-btn" onclick="updateSetting('caloriesTarget', Math.max(1000, ${s.caloriesTarget} - 50))">−</button>
          <div class="stepper-value">${s.caloriesTarget.toLocaleString()} kcal</div>
          <button class="stepper-btn" onclick="updateSetting('caloriesTarget', Math.min(5000, ${s.caloriesTarget} + 50))">+</button>
        </div>
      </div>
      
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Protein target</span>
        </div>
        <div class="stepper">
          <button class="stepper-btn" onclick="updateSetting('proteinTarget', Math.max(50, ${s.proteinTarget} - 5))">−</button>
          <div class="stepper-value">${s.proteinTarget}g</div>
          <button class="stepper-btn" onclick="updateSetting('proteinTarget', Math.min(400, ${s.proteinTarget} + 5))">+</button>
        </div>
      </div>
    </div>
    
    <!-- Card 3: Preferences -->
    <div class="settings-card">
      <div class="settings-card-title">Preferences</div>
      
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Weight units</span>
        </div>
        <div class="toggle-pill-2">
          <button class="seg-btn ${s.units === 'kg' ? 'active' : ''}" onclick="updateSetting('units', 'kg')">kg</button>
          <button class="seg-btn ${s.units === 'lbs' ? 'active' : ''}" onclick="updateSetting('units', 'lbs')">lbs</button>
        </div>
      </div>
      
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Theme</span>
        </div>
        <div class="toggle-pill-2">
          <button class="seg-btn ${s.theme === 'dark' ? 'active' : ''}" onclick="updateSetting('theme', 'dark')">Dark</button>
          <button class="seg-btn ${s.theme === 'light' ? 'active' : ''}" onclick="updateSetting('theme', 'light')">Light</button>
        </div>
      </div>
    </div>
  `;
}

window.updateSetting = function(key, value) {
  state.settings[key] = value;

  // Live side effects
  if (key === 'restTime') {
    mockData.workout.restTime = value;
  }
  if (key === 'caloriesTarget') {
    mockData.dashboard.caloriesTarget = value;
  }
  if (key === 'theme') {
    document.documentElement.setAttribute('data-theme', value);
  }

  // Re-render the settings view
  renderSettings();

  // Show toast
  showToast('Saved');
};

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2000);
}
