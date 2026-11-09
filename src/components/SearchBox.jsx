import { useEffect, useState } from "react";
import { api, pretty } from "../api.js";

export default function SearchBox({ onSelect }) {
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);
  const [st, setSt] = useState("idle");   // idle | loading | ok | empty | error
  const [i, setI] = useState(-1);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = q.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t) { setList([]); setSt("idle"); return; }
    const ac = new AbortController();
    setSt("loading");
    const id = setTimeout(() => {          // debounce 250 ms: fewer requests while typing
      api(`/api/search?q=${encodeURIComponent(t)}`, ac.signal)
        .then(d => { setList(d.results); setI(-1); setSt(d.results.length ? "ok" : "empty"); })
        .catch(e => { if (e.name !== "AbortError") setSt("error"); });
    }, 250);
    return () => { clearTimeout(id); ac.abort(); };
  }, [q]);

  const pick = n => { onSelect(n); setQ(""); setOpen(false); };
  const onKey = e => {
    if (e.key === "ArrowDown") { e.preventDefault(); setI(x => Math.min(x + 1, list.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setI(x => Math.max(x - 1, 0)); }
    else if (e.key === "Enter") { const n = list[i] ?? list[0]; if (n) pick(n); }
    else if (e.key === "Escape") setOpen(false);
  };
  const typed = q.trim().length;

  return (
    <section className="search">
      <div className="search-wrap">
        <input value={q} placeholder="พิมพ์ชื่อ Pokémon เช่น pik, char, mew…" aria-label="ค้นหา Pokémon"
          role="combobox" aria-expanded={open && typed > 0}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} onKeyDown={onKey} />
        {open && typed > 0 && (
          <ul className="suggest" role="listbox">
            {st === "loading" && <li className="note">กำลังค้นหา…</li>}
            {st === "empty" && <li className="note">ไม่พบชื่อที่ขึ้นต้นด้วย “{q.trim()}”</li>}
            {st === "error" && <li className="note err">ค้นหาไม่ได้ ตรวจสอบการเชื่อมต่อแล้วลองใหม่</li>}
            {st === "ok" && list.map((n, idx) => (
              <li key={n} role="option" aria-selected={idx === i} className={idx === i ? "on" : ""}
                onMouseDown={() => pick(n)}>
                <b>{n.slice(0, typed)}</b>{n.slice(typed)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
