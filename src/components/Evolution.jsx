import { art, pretty } from "../api.js";

export default function Evolution({ pokemon, onSelect }) {
  const levels = pokemon.evolution;
  return (
    <section>
      <h2>สายวิวัฒนาการ</h2>
      {levels.length === 1 ? (
        <p className="note-text">Pokémon ตัวนี้ไม่มีการวิวัฒนาการ</p>
      ) : (
        <div className="evo">
          {levels.map((lvl, i) => (
            <div className="evo-level" key={i}>
              {i > 0 && <span className="arrow">→</span>}
              <div className="evo-col">
                {lvl.map(p => (
                  <button key={p.name} className={`mini ${p.name === pokemon.name ? "active" : ""}`} onClick={() => onSelect(p.name)}>
                    <img src={art(p.id)} alt={p.name} loading="lazy" /><span>{pretty(p.name)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {pokemon.forms.length > 0 && (
        <p className="forms">ร่างอื่น: {pokemon.forms.map(f => <button key={f} className="chip" onClick={() => onSelect(f)}>{pretty(f)}</button>)}</p>
      )}
    </section>
  );
}
