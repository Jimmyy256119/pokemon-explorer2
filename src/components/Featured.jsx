import { useEffect, useState } from "react";
import { api, art, pretty } from "../api.js";
import Status from "./Status.jsx";

export default function Featured({ onSelect }) {
  const [s, setS] = useState({ status: "loading", items: [] });
  const [n, setN] = useState(0);
  useEffect(() => {
    setS({ status: "loading", items: [] });
    api("/api/featured")
      .then(d => setS({ status: d.items.length ? "ok" : "empty", items: d.items }))
      .catch(e => setS({ status: "error", items: [], message: e.message }));
  }, [n]);
  return (
    <section>
      <h2>Pokémon แนะนำ</h2>
      {s.status === "loading" && <Status kind="loading" text="กำลังโหลดรายการแนะนำ…" />}
      {s.status === "empty" && <Status kind="empty" text="ยังไม่มีรายการแนะนำ" />}
      {s.status === "error" && <Status kind="error" text={s.message} onRetry={() => setN(x => x + 1)} />}
      {s.status === "ok" && (
        <div className="grid">
          {s.items.map(p => (
            <button className="mini" key={p.id} onClick={() => onSelect(p.name)}>
              <img src={art(p.id)} alt={p.name} loading="lazy" /><span>{pretty(p.name)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
