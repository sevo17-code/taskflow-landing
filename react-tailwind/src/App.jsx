import { useEffect, useState } from "react";

const TASKS_KEY = "tf-react-tasks";
const BOARD_KEY = "tf-react-board";
const TIMER_KEY = "tf-react-timer";
const LANG_KEY = "tf-react-lang";

const COLUMNS = ["backlog", "building", "launched"];
const MODES = ["focus", "short", "long"];

const tone = {
  high: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/25",
  medium: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/25",
  low: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/25",
};

const ui = {
  en: {
    switch: "العربية",
    badge: "Bilingual TaskFlow",
    heroTitle: "Manage tasks in a cleaner bilingual workspace.",
    heroText: "Add tasks, delete them, clear the list, or restore the starter state in one click.",
    views: { overview: "Overview", board: "Board", focus: "Focus" },
    stats: {
      total: ["Total tasks", "Tracked items"],
      done: ["Completed", "Finished items"],
      high: ["High priority", "Needs attention"],
      shipped: ["Shipped cards", "cards on board"],
    },
    quick: "Quick capture",
    quickTitle: "Add the next task.",
    active: (count) => `${count} active`,
    placeholder: "Example: Finalize launch announcement",
    priorities: { high: "High", medium: "Medium", low: "Low" },
    add: "Add task",
    list: "Live task list",
    lane: "Daily execution lane",
    summary: (done, total) => `${done}/${total} completed`,
    clear: "Clear all",
    restore: "Restore starter list",
    emptyTitle: "No tasks yet",
    emptyText: "Add a task above or restore the starter list.",
    toggle: "Toggle task",
    delete: "Delete",
    taskDone: "Completed and archived.",
    taskOpen: "Still in progress.",
    cols: {
      backlog: ["Backlog", "Ideas and prep work"],
      building: ["Building", "What the team is shipping"],
      launched: ["Launched", "Ready to celebrate"],
    },
    prev: "Prev",
    next: "Next",
    timer: "Focus timer",
    timerText: "Deep work with simple controls.",
    modes: { focus: "Focus", short: "Short break", long: "Long break" },
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    durations: "Duration controls",
    min: "min",
    status: "Status",
    statusTitle: "Ready for a cleaner workflow.",
    statusText: "The UI now stays focused on tasks, board movement, timer controls, and language switching.",
    snapshot: "Snapshot",
    openTasks: "Open tasks",
    boardCards: "Board cards",
    focusPreset: "Focus preset",
    currentMode: "Current mode",
  },
  ar: {
    switch: "English",
    badge: "تاسك فلو بلغتين",
    heroTitle: "إدارة المهام بشكل أوضح داخل واجهة عربية وإنجليزية.",
    heroText: "أضف المهام أو احذفها أو امسح القائمة أو استرجع الحالة الافتراضية بضغطة واحدة.",
    views: { overview: "نظرة عامة", board: "البورد", focus: "التركيز" },
    stats: {
      total: ["إجمالي المهام", "كل العناصر"],
      done: ["المكتمل", "العناصر المنتهية"],
      high: ["أولوية عالية", "تحتاج انتباه"],
      shipped: ["بطاقات منجزة", "بطاقات على البورد"],
    },
    quick: "إضافة سريعة",
    quickTitle: "أضف المهمة التالية.",
    active: (count) => `${count} نشطة`,
    placeholder: "مثال: إنهاء إعلان الإطلاق",
    priorities: { high: "عالية", medium: "متوسطة", low: "منخفضة" },
    add: "إضافة مهمة",
    list: "قائمة المهام المباشرة",
    lane: "مسار التنفيذ اليومي",
    summary: (done, total) => `${done}/${total} مكتمل`,
    clear: "مسح الكل",
    restore: "استرجاع القائمة الافتراضية",
    emptyTitle: "لا توجد مهام بعد",
    emptyText: "أضف مهمة من الأعلى أو استرجع القائمة الافتراضية.",
    toggle: "تغيير حالة المهمة",
    delete: "حذف",
    taskDone: "تم إنجازها وحفظها.",
    taskOpen: "ما زالت قيد التنفيذ.",
    cols: {
      backlog: ["الانتظار", "أفكار وتجهيزات أولية"],
      building: ["قيد التنفيذ", "ما يعمل عليه الفريق الآن"],
      launched: ["تم الإطلاق", "جاهزة للاحتفال"],
    },
    prev: "السابق",
    next: "التالي",
    timer: "مؤقت التركيز",
    timerText: "تركيز عميق بأدوات بسيطة.",
    modes: { focus: "تركيز", short: "استراحة قصيرة", long: "استراحة طويلة" },
    start: "ابدأ",
    pause: "إيقاف",
    reset: "إعادة ضبط",
    durations: "إعدادات المدة",
    min: "د",
    status: "الحالة",
    statusTitle: "جاهزة لتجربة أوضح.",
    statusText: "الواجهة الآن مركزة على المهام وحركة البورد ومؤقت التركيز وتبديل اللغة.",
    snapshot: "ملخص سريع",
    openTasks: "المهام المفتوحة",
    boardCards: "بطاقات البورد",
    focusPreset: "مدة التركيز",
    currentMode: "الوضع الحالي",
  },
};

function initialLang() {
  return localStorage.getItem(LANG_KEY) === "ar" ? "ar" : "en";
}

function starterTasks(lang) {
  const data = {
    en: [
      { id: "t1", title: "Draft launch checklist", priority: "high", done: false },
      { id: "t2", title: "Refine onboarding copy", priority: "medium", done: false },
      { id: "t3", title: "Record product walkthrough", priority: "low", done: true },
    ],
    ar: [
      { id: "t1", title: "إعداد قائمة إطلاق المنتج", priority: "high", done: false },
      { id: "t2", title: "تحسين نصوص البداية", priority: "medium", done: false },
      { id: "t3", title: "تسجيل عرض سريع للمنتج", priority: "low", done: true },
    ],
  };

  return data[lang].map((task) => ({ ...task }));
}

function starterBoard(lang) {
  const data = {
    en: {
      backlog: [
        { id: "c1", title: "Competitor teardown", tag: "Research" },
        { id: "c2", title: "New pricing experiment", tag: "Growth" },
      ],
      building: [
        { id: "c3", title: "Marketing site polish", tag: "Design" },
        { id: "c4", title: "Automated status emails", tag: "Automation" },
      ],
      launched: [{ id: "c5", title: "Team workspace setup", tag: "Ops" }],
    },
    ar: {
      backlog: [
        { id: "c1", title: "تحليل المنافسين", tag: "بحث" },
        { id: "c2", title: "تجربة تسعير جديدة", tag: "نمو" },
      ],
      building: [
        { id: "c3", title: "تحسين صفحة التسويق", tag: "تصميم" },
        { id: "c4", title: "أتمتة رسائل الحالة", tag: "أتمتة" },
      ],
      launched: [{ id: "c5", title: "إعداد مساحة الفريق", tag: "تشغيل" }],
    },
  };

  return {
    backlog: data[lang].backlog.map((card) => ({ ...card })),
    building: data[lang].building.map((card) => ({ ...card })),
    launched: data[lang].launched.map((card) => ({ ...card })),
  };
}

function defaultTimer() {
  return {
    mode: "focus",
    durations: { focus: 25, short: 5, long: 15 },
    secondsLeft: 25 * 60,
  };
}

function readState(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function createId(prefix) {
  return window.crypto?.randomUUID
    ? `${prefix}-${window.crypto.randomUUID()}`
    : `${prefix}-${Date.now()}`;
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const secs = (totalSeconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function App() {
  const [lang, setLang] = useState(initialLang);
  const [view, setView] = useState("overview");
  const [tasks, setTasks] = useState(() => readState(TASKS_KEY, starterTasks(initialLang())));
  const [board, setBoard] = useState(() => readState(BOARD_KEY, starterBoard(initialLang())));
  const [timer, setTimer] = useState(() => readState(TIMER_KEY, defaultTimer()));
  const [running, setRunning] = useState(false);
  const [draftTask, setDraftTask] = useState("");
  const [draftPriority, setDraftPriority] = useState("medium");

  const t = ui[lang];
  const isArabic = lang === "ar";
  const totalTasks = tasks.length;
  const finishedTasks = tasks.filter((task) => task.done).length;
  const activeTasks = tasks.filter((task) => !task.done).length;
  const highPriorityTasks = tasks.filter((task) => task.priority === "high" && !task.done).length;
  const shippedCards = board.launched.length;
  const boardTotal = COLUMNS.reduce((sum, column) => sum + board[column].length, 0);
  const ringFill = `${(timer.secondsLeft / (timer.durations[timer.mode] * 60 || 1)) * 100}%`;

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(BOARD_KEY, JSON.stringify(board));
  }, [board]);

  useEffect(() => {
    localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
  }, [timer]);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [isArabic, lang]);

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setTimer((current) => {
        if (current.secondsLeft <= 1) {
          setRunning(false);
          return { ...current, secondsLeft: current.durations[current.mode] * 60 };
        }

        return { ...current, secondsLeft: current.secondsLeft - 1 };
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [running]);

  function addTask(event) {
    event.preventDefault();
    const cleanTitle = draftTask.trim();
    if (!cleanTitle) return;

    setTasks((current) => [
      { id: createId("task"), title: cleanTitle, priority: draftPriority, done: false },
      ...current,
    ]);
    setDraftTask("");
    setDraftPriority("medium");
  }

  function toggleTask(taskId) {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)),
    );
  }

  function deleteTask(taskId) {
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }

  function clearTasks() {
    setTasks([]);
  }

  function restoreTasks() {
    setTasks(starterTasks(lang));
  }

  function moveCard(cardId, fromColumn, direction) {
    const target = COLUMNS[COLUMNS.indexOf(fromColumn) + direction];
    if (!target) return;

    setBoard((current) => {
      const card = current[fromColumn].find((item) => item.id === cardId);
      if (!card) return current;

      return {
        ...current,
        [fromColumn]: current[fromColumn].filter((item) => item.id !== cardId),
        [target]: [...current[target], card],
      };
    });
  }

  function setMode(nextMode) {
    setRunning(false);
    setTimer((current) => ({
      ...current,
      mode: nextMode,
      secondsLeft: current.durations[nextMode] * 60,
    }));
  }

  function resetTimer() {
    setRunning(false);
    setTimer((current) => ({
      ...current,
      secondsLeft: current.durations[current.mode] * 60,
    }));
  }

  function updateDuration(mode, value) {
    const nextValue = Number(value);
    setRunning(false);
    setTimer((current) => {
      const nextTimer = {
        ...current,
        durations: { ...current.durations, [mode]: nextValue },
      };

      return current.mode === mode
        ? { ...nextTimer, secondsLeft: nextValue * 60 }
        : nextTimer;
    });
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.18),transparent_22%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.14),transparent_18%)]" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="panel overflow-hidden p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <span className="soft-label">{t.badge}</span>
            <button
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-white"
              onClick={() => setLang((current) => (current === "en" ? "ar" : "en"))}
              type="button"
            >
              {t.switch}
            </button>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-5">
              <div className="space-y-4">
                <h1 className="max-w-xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {t.heroTitle}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  {t.heroText}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {Object.entries(t.views).map(([id, label]) => (
                  <button
                    key={id}
                    className={`nav-chip ${view === id ? "nav-chip-active" : ""}`}
                    onClick={() => setView(id)}
                    type="button"
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-[420px]">
              <StatCard label={t.stats.total[0]} value={totalTasks} detail={t.stats.total[1]} />
              <StatCard label={t.stats.done[0]} value={finishedTasks} detail={t.stats.done[1]} />
              <StatCard label={t.stats.high[0]} value={highPriorityTasks} detail={t.stats.high[1]} />
              <StatCard label={t.stats.shipped[0]} value={shippedCards} detail={`${boardTotal} ${t.stats.shipped[1]}`} />
            </div>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <section className="space-y-6">
            {view === "overview" && (
              <>
                <div className="panel p-6">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="soft-label">{t.quick}</p>
                      <h2 className="mt-2 font-display text-2xl font-bold text-white">
                        {t.quickTitle}
                      </h2>
                    </div>
                    <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                      {t.active(activeTasks)}
                    </div>
                  </div>

                  <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]" onSubmit={addTask}>
                    <input
                      className="field"
                      placeholder={t.placeholder}
                      value={draftTask}
                      onChange={(event) => setDraftTask(event.target.value)}
                    />
                    <select
                      className="field"
                      value={draftPriority}
                      onChange={(event) => setDraftPriority(event.target.value)}
                    >
                      <option value="high">{t.priorities.high}</option>
                      <option value="medium">{t.priorities.medium}</option>
                      <option value="low">{t.priorities.low}</option>
                    </select>
                    <button className="rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300" type="submit">
                      {t.add}
                    </button>
                  </form>
                </div>

                <div className="panel p-6">
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="soft-label">{t.list}</p>
                      <h2 className="mt-2 font-display text-2xl font-bold text-white">
                        {t.lane}
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm text-slate-400">{t.summary(finishedTasks, totalTasks)}</div>
                      <button className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-white" onClick={clearTasks} type="button">
                        {t.clear}
                      </button>
                      <button className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-white" onClick={restoreTasks} type="button">
                        {t.restore}
                      </button>
                    </div>
                  </div>

                  {tasks.length ? (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <button
                              aria-label={t.toggle}
                              className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                                task.done ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-white/15 bg-slate-950/70 text-transparent"
                              }`}
                              onClick={() => toggleTask(task.id)}
                              type="button"
                            >
                              ✓
                            </button>
                            <div>
                              <p className={`text-sm font-medium ${task.done ? "text-slate-500 line-through" : "text-slate-100"}`}>
                                {task.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">{task.done ? t.taskDone : t.taskOpen}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${tone[task.priority]}`}>
                              {t.priorities[task.priority]}
                            </span>
                            <button
                              aria-label={t.delete}
                              className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-white"
                              onClick={() => deleteTask(task.id)}
                              type="button"
                            >
                              {t.delete}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                      <h3 className="font-display text-xl font-bold text-white">{t.emptyTitle}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-400">{t.emptyText}</p>
                      <button className="mt-5 rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300" onClick={restoreTasks} type="button">
                        {t.restore}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {view === "board" && (
              <div className="grid gap-4 xl:grid-cols-3">
                {COLUMNS.map((column) => (
                  <div key={column} className="panel p-5">
                    <p className="soft-label">{t.cols[column][0]}</p>
                    <h2 className="mt-2 font-display text-xl font-bold text-white">{board[column].length}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{t.cols[column][1]}</p>
                    <div className="mt-4 space-y-3">
                      {board[column].map((card) => (
                        <div key={card.id} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="rounded-full bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300 ring-1 ring-inset ring-sky-400/20">
                              {card.tag}
                            </span>
                            <div className="flex gap-2">
                              <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-white/20 hover:bg-white/5 disabled:opacity-40" disabled={column === COLUMNS[0]} onClick={() => moveCard(card.id, column, -1)} type="button">
                                {t.prev}
                              </button>
                              <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-white/20 hover:bg-white/5 disabled:opacity-40" disabled={column === COLUMNS[COLUMNS.length - 1]} onClick={() => moveCard(card.id, column, 1)} type="button">
                                {t.next}
                              </button>
                            </div>
                          </div>
                          <p className="text-sm font-medium leading-6 text-slate-100">{card.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {view === "focus" && (
              <div className="panel grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                  <p className="soft-label">{t.timer}</p>
                  <div className="mt-6 flex items-center justify-center">
                    <div
                      className="flex h-64 w-64 items-center justify-center rounded-full"
                      style={{ background: `conic-gradient(rgb(56 189 248) ${ringFill}, rgba(255,255,255,0.08) ${ringFill})` }}
                    >
                      <div className="flex h-[86%] w-[86%] flex-col items-center justify-center rounded-full bg-slate-950 text-center">
                        <span className="soft-label">{t.modes[timer.mode]}</span>
                        <div className="mt-3 font-display text-5xl font-bold text-white">{formatTime(timer.secondsLeft)}</div>
                        <p className="mt-3 text-sm text-slate-400">{t.timerText}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {MODES.map((mode) => (
                      <button key={mode} className={`nav-chip ${timer.mode === mode ? "nav-chip-active" : ""}`} onClick={() => setMode(mode)} type="button">
                        {t.modes[mode]}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 flex justify-center gap-3">
                    <button className="rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300" onClick={() => setRunning((current) => !current)} type="button">
                      {running ? t.pause : t.start}
                    </button>
                    <button className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/5" onClick={resetTimer} type="button">
                      {t.reset}
                    </button>
                  </div>
                </div>

                <div className="metric-card">
                  <p className="soft-label">{t.durations}</p>
                  <div className="mt-5 space-y-5">
                    {Object.entries(timer.durations).map(([mode, value]) => (
                      <label key={mode} className="block">
                        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                          <span>{t.modes[mode]}</span>
                          <span>{value} {t.min}</span>
                        </div>
                        <input
                          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-sky-400"
                          max={mode === "focus" ? 60 : 30}
                          min={mode === "short" ? 3 : 5}
                          onChange={(event) => updateDuration(mode, event.target.value)}
                          step={mode === "short" ? 1 : 5}
                          type="range"
                          value={value}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="panel p-6">
              <p className="soft-label">{t.status}</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">{t.statusTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{t.statusText}</p>
            </div>

            <div className="panel p-6">
              <p className="soft-label">{t.snapshot}</p>
              <div className="mt-5 space-y-4">
                <MetricRow label={t.openTasks} value={activeTasks} />
                <MetricRow label={t.boardCards} value={boardTotal} />
                <MetricRow label={t.focusPreset} value={`${timer.durations.focus}${t.min}`} />
                <MetricRow label={t.currentMode} value={t.modes[timer.mode]} />
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, detail }) {
  return (
    <div className="metric-card">
      <p className="soft-label">{label}</p>
      <div className="mt-3 font-display text-3xl font-bold text-white">{value}</div>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-display text-lg font-bold text-white">{value}</span>
    </div>
  );
}

export default App;
