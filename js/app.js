/* ===========================
   LIFE DASHBOARD — app.js
   =========================== */

/* ---------- STORAGE HELPERS ---------- */
const LS = {
  get: (k, fallback = null) => {
    try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

/* ---------- TOAST ---------- */
const toast = (() => {
  const el = document.createElement('div');
  el.className = 'toast';
  document.body.appendChild(el);
  let t;
  return (msg) => {
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(t);
    t = setTimeout(() => el.classList.remove('show'), 2400);
  };
})();

/* ===========================
   1. THEME (Light / Dark)
   =========================== */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = themeToggle.querySelector('.theme-icon');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀' : '☾';
  LS.set('theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

applyTheme(LS.get('theme', 'dark'));

/* ===========================
   2. CLOCK & GREETING
   =========================== */
function getGreeting(h) {
  if (h < 5)  return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function updateClock() {
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2, '0');
  const mm  = String(now.getMinutes()).padStart(2, '0');
  const ss  = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hh}:${mm}:${ss}`;
  document.getElementById('greetingTime').textContent = getGreeting(now.getHours());
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}
setInterval(updateClock, 1000);
updateClock();

/* ===========================
   2b. DAILY QUOTE
   =========================== */
const QUOTES = [
  "Small steps every day lead to big results.",
  "Focus on progress, not perfection.",
  "Your only limit is your mind.",
  "Done is better than perfect.",
  "One task at a time. You've got this.",
  "Consistency beats motivation every time.",
  "Start where you are. Use what you have.",
  "Every expert was once a beginner.",
  "Make today count.",
  "The secret of getting ahead is getting started.",
  "You don't have to be great to start, but you have to start to be great.",
  "Breathe. Focus. Execute.",
];

function renderQuote() {
  const el = document.getElementById('dailyQuote');
  if (!el) return;
  const dayIndex = new Date().getDay() + new Date().getDate();
  el.textContent = `"${QUOTES[dayIndex % QUOTES.length]}"`;
}
renderQuote();

/* ===========================
   3. CUSTOM NAME
   =========================== */
const nameModal   = document.getElementById('nameModal');
const nameInput   = document.getElementById('nameInput');
const saveNameBtn = document.getElementById('saveNameBtn');
const userNameEl  = document.getElementById('userName');

function setUserName(name) {
  const display = name.trim() || 'Friend';
  userNameEl.textContent = display;
  LS.set('userName', display);
}

function saveName() {
  const name = nameInput.value.trim();
  if (name) { setUserName(name); nameModal.classList.remove('visible'); }
}

saveNameBtn.addEventListener('click', saveName);
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveName(); });

const savedName = LS.get('userName', null);
if (!savedName) { nameModal.classList.add('visible'); setTimeout(() => nameInput.focus(), 100); }
else setUserName(savedName);

/* ===========================
   4. FOCUS TIMER
   =========================== */
const timerDisplay  = document.getElementById('timerDisplay');
const timerMode     = document.getElementById('timerMode');
const startBtn      = document.getElementById('startBtn');
const stopBtn       = document.getElementById('stopBtn');
const resetBtn      = document.getElementById('resetBtn');
const ringProgress  = document.getElementById('ringProgress');
const pomoDuration  = document.getElementById('pomoDuration');
const applyDuration = document.getElementById('applyDuration');

const CIRCUMFERENCE = 2 * Math.PI * 88;

let totalSeconds  = LS.get('pomoDuration', 25) * 60;
let secondsLeft   = totalSeconds;
let timerInterval = null;
let isRunning     = false;

pomoDuration.value = LS.get('pomoDuration', 25);

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateRing() {
  const ratio  = secondsLeft / totalSeconds;
  const offset = CIRCUMFERENCE * (1 - ratio);
  ringProgress.style.strokeDashoffset = offset;
  ringProgress.classList.remove('paused', 'done');
  if (!isRunning && secondsLeft < totalSeconds && secondsLeft > 0) ringProgress.classList.add('paused');
  if (secondsLeft === 0) ringProgress.classList.add('done');
}

function renderTimer() { timerDisplay.textContent = formatTime(secondsLeft); updateRing(); }

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timerMode.textContent = 'FOCUS';
  timerInterval = setInterval(() => {
    if (secondsLeft <= 0) {
      clearInterval(timerInterval); isRunning = false;
      timerMode.textContent = 'DONE! 🎉'; updateRing(); return;
    }
    secondsLeft--; renderTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval); isRunning = false;
  timerMode.textContent = 'PAUSED'; updateRing();
}

function resetTimer() {
  clearInterval(timerInterval); isRunning = false;
  secondsLeft = totalSeconds; timerMode.textContent = 'FOCUS'; renderTimer();
}

applyDuration.addEventListener('click', () => {
  const mins = parseInt(pomoDuration.value, 10);
  if (!mins || mins < 1 || mins > 120) { toast('Enter 1–120 minutes'); return; }
  totalSeconds = mins * 60; secondsLeft = totalSeconds;
  LS.set('pomoDuration', mins);
  isRunning = false; clearInterval(timerInterval);
  timerMode.textContent = 'FOCUS'; renderTimer();
});

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

ringProgress.style.strokeDasharray = CIRCUMFERENCE;
renderTimer();

/* ===========================
   5. TO-DO LIST
   =========================== */
// Tasks now store { id, text, done, order } — order is explicit index for stable sort
let tasks    = LS.get('tasks', []);
let sortMode = LS.get('sortMode', 'default');

// Migration: add order field to old tasks that don't have it
tasks = tasks.map((t, i) => ({ order: i, ...t }));

const taskInput  = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList   = document.getElementById('taskList');
const todoFooter = document.getElementById('todoFooter');
const progressBar     = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');

function saveTasks() { LS.set('tasks', tasks); }

function getSortedTasks() {
  const copy = [...tasks];
  if (sortMode === 'default') copy.sort((a, b) => a.order - b.order);          // by insertion order
  if (sortMode === 'alpha')   copy.sort((a, b) => a.text.localeCompare(b.text)); // A-Z
  if (sortMode === 'done')    copy.sort((a, b) => Number(a.done) - Number(b.done)); // undone first
  return copy;
}

function renderProgress() {
  if (!progressBar || !progressPercent) return;
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);
  progressBar.style.width = pct + '%';
  progressPercent.textContent = total === 0 ? '' : `${pct}%`;
}

function renderTasks() {
  taskList.innerHTML = '';
  const sorted = getSortedTasks();

  if (sorted.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'task-empty';
    empty.textContent = 'No tasks yet — add one above!';
    taskList.appendChild(empty);
  }

  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    const chk = document.createElement('button');
    chk.className = `task-check${task.done ? ' checked' : ''}`;
    chk.title = task.done ? 'Mark incomplete' : 'Mark complete';
    chk.addEventListener('click', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
    span.contentEditable = 'true';
    span.spellcheck = false;
    span.textContent = task.text;
    span.addEventListener('blur', () => {
      const newText = span.textContent.trim();
      if (!newText) { span.textContent = task.text; return; }
      if (newText !== task.text && isDuplicate(newText, task.id)) {
        toast('Task already exists!'); span.textContent = task.text; return;
      }
      tasks = tasks.map(t => t.id === task.id ? { ...t, text: newText } : t);
      saveTasks();
    });
    span.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); span.blur(); } });

    const del = document.createElement('button');
    del.className = 'task-del';
    del.textContent = '×';
    del.title = 'Delete task';
    del.addEventListener('click', () => deleteTask(task.id));

    li.append(chk, span, del);
    taskList.appendChild(li);
  });

  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  todoFooter.textContent = `${done}/${total} task${total !== 1 ? 's' : ''} done`;
  renderProgress();
}

function isDuplicate(text, excludeId = null) {
  return tasks.some(t =>
    t.text.trim().toLowerCase() === text.trim().toLowerCase() && t.id !== excludeId
  );
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  if (isDuplicate(text)) { toast('Duplicate task — already in your list!'); return; }
  const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) + 1 : 0;
  tasks.push({ id: Date.now(), text, done: false, order: maxOrder });
  saveTasks(); taskInput.value = ''; renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks(); renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(); renderTasks();
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

document.querySelectorAll('.sort-btn').forEach(btn => {
  if (btn.dataset.sort === sortMode) btn.classList.add('active');
  else btn.classList.remove('active');

  btn.addEventListener('click', () => {
    sortMode = btn.dataset.sort;
    LS.set('sortMode', sortMode);
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
  });
});

renderTasks();

/* ===========================
   6. QUICK LINKS
   =========================== */
let links = LS.get('links', [
  { id: 1, label: 'GitHub',     url: 'https://github.com' },
  { id: 2, label: 'Google',     url: 'https://google.com' },
  { id: 3, label: 'YouTube',    url: 'https://youtube.com' },
  { id: 4, label: 'ChatGPT',    url: 'https://chat.openai.com' },
  { id: 5, label: 'Notion',     url: 'https://notion.so' },
  { id: 6, label: 'Figma',      url: 'https://figma.com' },
  { id: 7, label: 'LinkedIn',   url: 'https://linkedin.com' },
  { id: 8, label: 'Canva',      url: 'https://canva.com' },
]);

const linkName   = document.getElementById('linkName');
const linkUrl    = document.getElementById('linkUrl');
const addLinkBtn = document.getElementById('addLinkBtn');
const linksGrid  = document.getElementById('linksGrid');

function saveLinks() { LS.set('links', links); }

function getFavicon(url) {
  try { return `https://www.google.com/s2/favicons?sz=32&domain=${new URL(url).hostname}`; }
  catch { return null; }
}

function renderLinks() {
  linksGrid.innerHTML = '';
  links.forEach(link => {
    const a = document.createElement('a');
    a.className = 'link-chip';
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const favicon = getFavicon(link.url);
    if (favicon) {
      const img = document.createElement('img');
      img.className = 'link-favicon';
      img.src = favicon; img.alt = '';
      img.onerror = () => { img.style.display = 'none'; };
      a.appendChild(img);
    }

    const label = document.createElement('span');
    label.className = 'link-label';
    label.textContent = link.label;
    a.appendChild(label);

    const delBtn = document.createElement('button');
    delBtn.className = 'link-del-btn';
    delBtn.textContent = '×';
    delBtn.title = 'Remove link';
    delBtn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      links = links.filter(l => l.id !== link.id);
      saveLinks(); renderLinks();
    });
    a.appendChild(delBtn);
    linksGrid.appendChild(a);
  });
}

function addLink() {
  const label = linkName.value.trim();
  let url = linkUrl.value.trim();
  if (!label || !url) { toast('Please enter both a label and a URL'); return; }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try { new URL(url); } catch { toast('Invalid URL'); return; }
  links.push({ id: Date.now(), label, url });
  saveLinks(); linkName.value = ''; linkUrl.value = ''; renderLinks();
}

addLinkBtn.addEventListener('click', addLink);
linkUrl.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });

renderLinks();