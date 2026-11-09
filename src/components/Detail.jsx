import Status from "./Status.jsx";
import { art, pretty } from "../api.js";

const COLORS = { fire: "#f0803c", water: "#5b8def", grass: "#5cb85c", electric: "#f5c518", psychic: "#ef5f9a",
  ice: "#7fd3e0", dragon: "#6f5cf0", dark: "#6b5b4d", fairy: "#ee99ac", normal: "#a8a77a", fighting: "#c22e28",
  flying: "#a98ff3", poison: "#a33ea1", ground: "#d9b45a", rock: "#b6a136", bug: "#a6b91a", ghost: "#735797", steel: "#9aa3b5" };
const LABEL = { hp: "HP", attack: "Attack", defense: "Defense", spAttack: "Sp. Atk", spDefense: "Sp. Def", speed: "Speed" };

export default function Detail({ view, onRetry }) {
  if (view.status === "loading") return <Status kind="loading" text="กำลังโหลดข้อมูล Pokémon…" />;
  if (view.status === "error") return <Status kind="error" text={view.message} onRetry={onRetry} />;
  const p = view.pokemon;
  const main = COLORS[p.types[0]] || "#888";
  return (
    <section className="card detail" style={{ "--accent": main }}>
      <div className="art"><img src={art(p.id)} alt={p.name} /></div>
      <div>
        <p className="num">#{String(p.id).padStart(4, "0")}</p>
        <h2>{pretty(p.name)}</h2>
        <div className="types">
          {p.types.map(t => <span key={t} style={{ background: COLORS[t] || "#888" }}>{pretty(t)}</span>)}
        </div>
        <p className="meta">สูง {p.height} m • หนัก {p.weight} kg</p>
        {Object.entries(p.stats).map(([k, v]) => (
          <div className="stat" key={k}>
            <span>{LABEL[k]}</span><b>{v}</b>
            <div className="bar"><i style={{ width: `${Math.min(v / 2.55, 100)}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
