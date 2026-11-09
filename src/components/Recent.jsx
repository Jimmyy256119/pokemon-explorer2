import { useState } from "react";
import { art, pretty } from "../api.js";
import { mergeSort, stackView } from "../dsa.js";
import Status from "./Status.jsx";

const SORTS = {
  recent: null,
  id: (a, b) => a.id - b.id,
  name: (a, b) => a.name.localeCompare(b.name),
  hp: (a, b) => b.stats.hp - a.stats.hp,
  attack: (a, b) => b.stats.attack - a.stats.attack,
  speed: (a, b) => b.stats.speed - a.stats.speed
};

export default function Recent({ items, onSelect }) {
  const [by, setBy] = useState("recent");
  const view = stackView(items);                                   // newest first
  const shown = SORTS[by] ? mergeSort(view, SORTS[by]) : view;     // sort a copy, keep the stack intact
  return (
    <section>
      <div className="row">
        <h2>ดูล่าสุด</h2>
        <select value={by} onChange={e => setBy(e.target.value)} aria-label="เรียงลำดับ">
          <option value="recent">ล่าสุดก่อน (Stack)</option><option value="id">ID</option><option value="name">ชื่อ</option>
          <option value="hp">HP</option><option value="attack">Attack</option><option value="speed">Speed</option>
        </select>
      </div>
      {shown.length === 0 ? <Status kind="empty" text="ยังไม่เคยเปิดดู Pokémon ตัวไหนเลย" /> : (
        <div className="grid">
          {shown.map(p => (
            <button className="mini" key={p.id} onClick={() => onSelect(p.name)}>
              <img src={art(p.id)} alt={p.name} loading="lazy" /><span>{pretty(p.name)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
