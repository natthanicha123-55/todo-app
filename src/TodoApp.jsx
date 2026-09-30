import { useState } from "react";
import {
  Plus, Trash2, Check, ClipboardList, Search, X, CalendarDays,
  Layers, Briefcase, User, ShoppingBag, HeartPulse,
} from "lucide-react";

/* ---------- constants ---------- */
const PRIORITIES = {
  low: { label: "ต่ำ", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-400" },
  medium: { label: "กลาง", badge: "bg-amber-50 text-amber-700 ring-amber-200", bar: "bg-amber-400" },
  high: { label: "สูง", badge: "bg-rose-50 text-rose-700 ring-rose-200", bar: "bg-rose-500" },
};
const ORDER = ["low", "medium", "high"];

const CATEGORIES = {
  work: { label: "งาน", icon: Briefcase, chip: "bg-sky-50 text-sky-700 ring-sky-200" },
  personal: { label: "ส่วนตัว", icon: User, chip: "bg-violet-50 text-violet-700 ring-violet-200" },
  shopping: { label: "ช้อปปิ้ง", icon: ShoppingBag, chip: "bg-pink-50 text-pink-700 ring-pink-200" },
  health: { label: "สุขภาพ", icon: HeartPulse, chip: "bg-teal-50 text-teal-700 ring-teal-200" },
};
const CAT_KEYS = Object.keys(CATEGORIES);

const STATUS_TABS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "active", label: "ยังไม่เสร็จ" },
  { key: "done", label: "เสร็จแล้ว" },
];

/* ---------- date helpers (local time, ISO strings compare lexically) ---------- */
const pad = (n) => String(n).padStart(2, "0");
const toStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayOffset = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toStr(d);
};
const fmtDate = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
};

const statusOf = (t, today) => (t.done ? "done" : t.due && t.due < today ? "overdue" : "active");

/* ---------- donut chart ---------- */
function Donut({ done, active, overdue }) {
  const total = done + active + overdue;
  const segs = [
    { v: done, c: "#10b981" },
    { v: active, c: "#94a3b8" },
    { v: overdue, c: "#f43f5e" },
  ];
  let acc = 0;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={`เสร็จแล้ว ${pct}%`}>
      <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#e2e8f0" strokeWidth="5" />
        {total > 0 &&
          segs.map((s, i) => {
            if (!s.v) return null;
            const p = (s.v / total) * 100;
            const el = (
              <circle
                key={i}
                cx="21" cy="21" r="15.9155" fill="none"
                stroke={s.c} strokeWidth="5"
                strokeDasharray={`${p} ${100 - p}`}
                strokeDashoffset={-acc}
                style={{ transition: "all 400ms ease" }}
              />
            );
            acc += p;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800">
        {pct}%
      </div>
    </div>
  );
}

/* ---------- app ---------- */
export default function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: "ส่งรายงานวิชาโครงสร้างข้อมูล", done: false, priority: "high", category: "work", due: dayOffset(-2), removing: false },
    { id: 2, text: "อ่านบทที่ 5 เตรียมสอบ", done: false, priority: "medium", category: "personal", due: dayOffset(0), removing: false },
    { id: 3, text: "ซื้อกาแฟและขนมปัง", done: true, priority: "low", category: "shopping", due: dayOffset(-1), removing: false },
    { id: 4, text: "วิ่งสวนสาธารณะ 30 นาที", done: false, priority: "low", category: "health", due: dayOffset(2), removing: false },
    { id: 5, text: "ประชุมกลุ่มโปรเจกต์", done: false, priority: "medium", category: "work", due: "", removing: false },
  ]);

  // add form
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [due, setDue] = useState("");

  // filters
  const [status, setStatus] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch] = useState("");

  // inline edit
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDue, setEditDue] = useState("");
  const [editCat, setEditCat] = useState("");

  const today = toStr(new Date());

  /* actions */
  const addTodo = () => {
    const t = text.trim();
    if (!t) return;
    setTodos((p) => [{ id: Date.now(), text: t, done: false, priority, category, due, removing: false }, ...p]);
    setText("");
    setDue("");
  };

  const toggle = (id) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id) => {
    setTodos((p) => p.map((t) => (t.id === id ? { ...t, removing: true } : t)));
    setTimeout(() => setTodos((p) => p.filter((t) => t.id !== id)), 300);
  };

  const cyclePriority = (id) =>
    setTodos((p) =>
      p.map((t) => (t.id === id ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] } : t))
    );

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditText(t.text);
    setEditDue(t.due);
    setEditCat(t.category);
  };

  const saveEdit = () => {
    if (editingId === null) return;
    const v = editText.trim();
    setTodos((p) =>
      p.map((t) => (t.id === editingId ? { ...t, text: v || t.text, due: editDue, category: editCat } : t))
    );
    setEditingId(null);
  };

  const clearDone = () => todos.filter((t) => t.done).forEach((t) => remove(t.id));

  /* derived */
  const live = todos.filter((t) => !t.removing);
  const total = live.length;
  const doneCount = live.filter((t) => t.done).length;
  const overdueCount = live.filter((t) => statusOf(t, today) === "overdue").length;
  const activeCount = total - doneCount - overdueCount;
  const remaining = total - doneCount;
  const pctDone = total ? Math.round((doneCount / total) * 100) : 0;
  const catCount = (k) => live.filter((t) => t.category === k).length;

  const q = search.trim().toLowerCase();
  const visible = todos.filter(
    (t) =>
      (status === "all" || (status === "active" ? !t.done : t.done)) &&
      (catFilter === "all" || t.category === catFilter) &&
      (!q || t.text.toLowerCase().includes(q))
  );
  const emptyMsg = q
    ? "ไม่พบงานที่ตรงกับคำค้นหา"
    : total === 0
    ? "ยังไม่มีงาน เพิ่มงานแรกของคุณด้านบนได้เลย"
    : "ไม่มีงานในตัวกรองนี้";

  const inputCls =
    "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-900 focus:bg-white";

  /* due badge */
  const dueBadge = (t) => {
    if (!t.due) return null;
    let cls = "bg-slate-50 text-slate-600 ring-slate-200";
    let label = fmtDate(t.due);
    if (!t.done && t.due < today) {
      cls = "bg-red-50 text-red-700 ring-red-300";
      label = `เลยกำหนด · ${label}`;
    } else if (!t.done && t.due === today) {
      cls = "bg-yellow-50 text-yellow-800 ring-yellow-300";
      label = "ครบกำหนดวันนี้";
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
        <CalendarDays size={12} />
        {label}
      </span>
    );
  };

  return (
    <div
      className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12"
      style={{ fontFamily: "'Noto Sans Thai', 'Sarabun', system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">รายการงานของฉัน</h1>
            <p className="text-sm text-slate-500">จัดการงานประจำวันให้เป็นระเบียบ</p>
          </div>
        </header>

        {/* Statistics */}
        <section className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl bg-white p-5 shadow-md">
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold text-slate-900">{total}</p>
              <p className="text-sm text-slate-500">งานทั้งหมด</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{pctDone}%</p>
              <p className="text-sm text-slate-500">ทำเสร็จแล้ว</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-5">
            <ul className="space-y-1 text-sm text-slate-600">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />เสร็จแล้ว {doneCount}</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" />ค้างอยู่ {activeCount}</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />เลยกำหนด {overdueCount}</li>
            </ul>
            <Donut done={doneCount} active={activeCount} overdue={overdueCount} />
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-[200px_1fr]">
          {/* Category sidebar */}
          <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:flex-col md:self-start md:overflow-visible md:rounded-2xl md:bg-white md:p-2 md:shadow-md">
            {[{ key: "all", label: "ทุกหมวด", icon: Layers, n: total }, ...CAT_KEYS.map((k) => ({ key: k, label: CATEGORIES[k].label, icon: CATEGORIES[k].icon, n: catCount(k) }))].map((c) => {
              const Icon = c.icon;
              const on = catFilter === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCatFilter(c.key)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    on ? "bg-slate-900 text-white" : "bg-white text-slate-600 shadow-sm hover:bg-slate-100 md:bg-transparent md:shadow-none"
                  }`}
                >
                  <Icon size={16} />
                  <span className="flex-1 text-left">{c.label}</span>
                  <span className={`rounded-full px-2 text-xs ${on ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>{c.n}</span>
                </button>
              );
            })}
          </nav>

          <main className="min-w-0">
            {/* Add */}
            <div className="rounded-2xl bg-white p-4 shadow-md">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  placeholder="มีอะไรต้องทำบ้าง?"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:bg-white"
                />
                <button
                  onClick={addTodo}
                  aria-label="เพิ่มงาน"
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-700 active:scale-95"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">เพิ่ม</span>
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {ORDER.map((k) => (
                  <button
                    key={k}
                    onClick={() => setPriority(k)}
                    className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset transition ${
                      priority === k ? PRIORITIES[k].badge : "bg-white text-slate-400 ring-slate-200 hover:text-slate-600"
                    }`}
                  >
                    {PRIORITIES[k].label}
                  </button>
                ))}
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} aria-label="หมวดหมู่">
                  <option value="">ไม่ระบุหมวด</option>
                  {CAT_KEYS.map((k) => (
                    <option key={k} value={k}>{CATEGORIES[k].label}</option>
                  ))}
                </select>
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputCls} aria-label="วันครบกำหนด" />
              </div>
            </div>

            {/* Search */}
            <div className="relative mt-5">
              <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหางาน..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-slate-900"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="ล้างคำค้นหา"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Status tabs */}
            <div className="mt-3 flex gap-1 rounded-xl bg-slate-200/60 p-1">
              {STATUS_TABS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatus(f.key)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                    status === f.key ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List */}
            <ul className="mt-4">
              {visible.length === 0 && (
                <li className="rounded-2xl bg-white px-4 py-10 text-center text-slate-400 shadow-md">{emptyMsg}</li>
              )}
              {visible.map((t) => {
                const cat = CATEGORIES[t.category];
                const CatIcon = cat?.icon;
                const editing = editingId === t.id;
                return (
                  <li
                    key={t.id}
                    style={{
                      maxHeight: t.removing ? 0 : 220,
                      opacity: t.removing ? 0 : 1,
                      transform: t.removing ? "translateX(24px)" : "none",
                      paddingBottom: t.removing ? 0 : 10,
                      transition: "all 300ms ease",
                      overflow: "hidden",
                    }}
                  >
                    <div className="flex items-center gap-3 overflow-hidden rounded-2xl bg-white shadow-md">
                      <span className={`w-1.5 shrink-0 self-stretch ${PRIORITIES[t.priority].bar}`} />
                      <button
                        onClick={() => toggle(t.id)}
                        aria-label={t.done ? "ทำเครื่องหมายว่ายังไม่เสร็จ" : "ทำเครื่องหมายว่าเสร็จแล้ว"}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                          t.done ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 hover:border-slate-500"
                        }`}
                      >
                        {t.done && <Check size={14} strokeWidth={3} />}
                      </button>

                      <div className="min-w-0 flex-1 py-3.5">
                        {editing ? (
                          <div
                            className="space-y-2"
                            onBlur={(e) => {
                              if (!e.currentTarget.contains(e.relatedTarget)) saveEdit();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") setEditingId(null);
                            }}
                          >
                            <input
                              autoFocus
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full rounded-md border border-slate-900 px-2 py-1 text-slate-900 outline-none"
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <select value={editCat} onChange={(e) => setEditCat(e.target.value)} className={inputCls} aria-label="หมวดหมู่">
                                <option value="">ไม่ระบุหมวด</option>
                                {CAT_KEYS.map((k) => (
                                  <option key={k} value={k}>{CATEGORIES[k].label}</option>
                                ))}
                              </select>
                              <input type="date" value={editDue} onChange={(e) => setEditDue(e.target.value)} className={inputCls} aria-label="วันครบกำหนด" />
                              <button onClick={saveEdit} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
                                บันทึก
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p
                              onDoubleClick={() => startEdit(t)}
                              title="ดับเบิลคลิกเพื่อแก้ไข"
                              className={`cursor-text select-none break-words ${t.done ? "text-slate-400 line-through" : "text-slate-800"}`}
                            >
                              {t.text}
                            </p>
                            {(cat || t.due) && (
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                {cat && (
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cat.chip}`}>
                                    <CatIcon size={12} />
                                    {cat.label}
                                  </span>
                                )}
                                {dueBadge(t)}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => cyclePriority(t.id)}
                        title="คลิกเพื่อเปลี่ยนความสำคัญ"
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${PRIORITIES[t.priority].badge}`}
                      >
                        {PRIORITIES[t.priority].label}
                      </button>
                      <button
                        onClick={() => remove(t.id)}
                        aria-label="ลบงาน"
                        className="mr-3 shrink-0 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Footer */}
            <div className="mt-2 flex items-center justify-between px-1 text-sm">
              <span className="text-slate-500">เหลืออีก {remaining} งาน</span>
              <button
                onClick={clearDone}
                disabled={doneCount === 0}
                className="font-medium text-slate-600 hover:text-rose-600 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:text-slate-300"
              >
                ล้างงานที่เสร็จแล้ว{doneCount > 0 && ` (${doneCount})`}
              </button>
            </div>
            <p className="mt-6 text-center text-xs text-slate-400">
              ดับเบิลคลิกที่ข้อความเพื่อแก้ไข · คลิกป้ายความสำคัญเพื่อเปลี่ยนระดับ
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
