import { useEffect, useState, useCallback } from "react";
import { api } from "./api.js";
import { pushStack } from "./dsa.js";
import SearchBox from "./components/SearchBox.jsx";
import Featured from "./components/Featured.jsx";
import Detail from "./components/Detail.jsx";
import Evolution from "./components/Evolution.jsx";
import Recent from "./components/Recent.jsx";

export default function App() {
  const [name, setName] = useState("pikachu");
  const [view, setView] = useState({ status: "loading" });   // loading | success | error
  const [recent, setRecent] = useState([]);
  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "1");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    const ac = new AbortController();
    setView({ status: "loading" });
    api(`/api/pokemon/${encodeURIComponent(name)}`, ac.signal)
      .then(p => { setView({ status: "success", pokemon: p }); setRecent(r => pushStack(r, p)); })
      .catch(e => { if (e.name !== "AbortError") setView({ status: "error", message: e.message }); });
    return () => ac.abort();
  }, [name, retry]);

  const select = useCallback(n => { setName(n); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  return (
    <>
      <header className="header">
        <div><h1>Pokémon Explorer</h1><p>ค้นหา สำรวจ และดูสายวิวัฒนาการ</p></div>
        <button className="ghost" onClick={() => setDark(d => !d)} aria-pressed={dark}>
          {dark ? "🌙 โหมดกลางคืน" : "☀️ โหมดกลางวัน"}
        </button>
      </header>
      <main className="container">
        <SearchBox onSelect={select} />
        <Detail view={view} onRetry={() => setRetry(n => n + 1)} />
        {view.status === "success" && <Evolution pokemon={view.pokemon} onSelect={select} />}
        <Featured onSelect={select} />
        <Recent items={recent} onSelect={select} />
      </main>
      <footer>Pokémon Explorer • React + Vite + Express • PokéAPI</footer>
    </>
  );
}
