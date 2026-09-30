import { useState } from "react";
import { Plus, Trash2, Check, ClipboardList } from "lucide-react";

const PRIORITIES = {
  low: { label: "ต่ำ", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-400" },
  medium: { label: "กลาง", badge: "bg-amber-50 text-amber-700 ring-amber-200", bar: "bg-amber-400" },
  high: { label: "สูง", badge: "bg-rose-50 text-rose-700 ring-rose-200", bar: "bg-rose-500" },
};
const ORDER = ["low", "medium", "high"];

const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "active", label: "ยังไม่เสร็จ" },
  { key: "done", label: "เสร็จแล้ว" },
];

const EMPTY = {
  all: "ยังไม่มีงาน เพิ่มงานแรกของคุณด้านบนได้เลย",
  active: "ไม่มีงานที่ค้างอยู่ เยี่ยมมาก!",
  done: "ยังไม่มีงานที่เสร็จ",
};

export default function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: "ส่งรายงานวิชาโครงสร้างข้อมูล", done: false, priority: "high", removing: false },
    { id: 2, text: "อ่านบทที่ 5 เตรียมสอบ", done: false, priority: "medium", removing: false },
    { id: 3, text: "ซื้อกาแฟ", done: true, priority: "low", removing: false },
  ]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const addTodo = () => {
    const t = text.trim();
    if (!t) return;
    setTodos((p) => [{ id: Date.now(), text: t, done: false, priority, removing: false }, ...p]);
    setText("");
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
  };

  const saveEdit = () => {
    if (editingId === null) return;
    const v = editText.trim();
    if (v) setTodos((p) => p.map((t) => (t.id === editingId ? { ...t, text: v } : t)));
    setEditingId(null);
  };

  const clearDone = () => {
    const ids = todos.filter((t) => t.done).map((t) => t.id);
    ids.forEach(remove);
  };

  const remaining = todos.filter((t) => !t.done && !t.removing).length;
  const doneCount = todos.filter((t) => t.done && !t.removing).length;
  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done
  );

  return (
    <div
      className="min-h-screen bg-slate-50 px-4 py-8 sm:py-14"
      style={{ fontFamily: "'Noto Sans Thai', 'Sarabun', system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-xl">
        <header className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">รายการงานของฉัน</h1>
            <p className="text-sm text-slate-500">จัดการงานประจำวันให้เป็นระเบียบ</p>
          </div>
        </header>

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
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-slate-500">ความสำคัญ</span>
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
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 flex gap-1 rounded-xl bg-slate-200/60 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                filter === f.key ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <ul className="mt-4">
          {visible.length === 0 && (
            <li className="rounded-2xl bg-white px-4 py-10 text-center text-slate-400 shadow-md">
              {EMPTY[filter]}
            </li>
          )}
          {visible.map((t) => (
            <li
              key={t.id}
              style={{
                maxHeight: t.removing ? 0 : 120,
                opacity: t.removing ? 0 : 1,
                transform: t.removing ? "translateX(24px)" : "none",
                paddingBottom: t.removing ? 0 : 10,
                transition: "all 300ms ease",
                overflow: "hidden",
              }}
            >
              <div className="flex items-center gap-3 overflow-hidden rounded-2xl bg-white shadow-md">
                <span className={`self-stretch w-1.5 shrink-0 ${PRIORITIES[t.priority].bar}`} />
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
                  {editingId === t.id ? (
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="w-full rounded-md border border-slate-900 px-2 py-1 text-slate-900 outline-none"
                    />
                  ) : (
                    <p
                      onDoubleClick={() => startEdit(t)}
                      title="ดับเบิลคลิกเพื่อแก้ไข"
                      className={`cursor-text select-none break-words ${
                        t.done ? "text-slate-400 line-through" : "text-slate-800"
                      }`}
                    >
                      {t.text}
                    </p>
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
          ))}
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
      </div>
    </div>
  );
}
