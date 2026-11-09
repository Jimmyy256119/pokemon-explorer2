const express = require("express");
const path = require("path");
const fs = require("fs");

const API = "https://pokeapi.co/api/v2";
const FEATURED = ["pikachu", "mewtwo", "rayquaza", "arceus", "bulbasaur", "charmander",
  "squirtle", "eevee", "lucario", "gengar", "snorlax", "dragonite"];
const app = express();

/* ---------- DSA 1: Hash Table + LRU cache (Map keeps insertion order) ---------- */
class LRU {
  constructor(size) { this.size = size; this.map = new Map(); }
  get(key) {                              // O(1)
    if (!this.map.has(key)) return undefined;
    const v = this.map.get(key);
    this.map.delete(key); this.map.set(key, v);   // move to "most recent"
    return v;
  }
  set(key, val) {                         // O(1)
    this.map.delete(key); this.map.set(key, val);
    if (this.map.size > this.size) this.map.delete(this.map.keys().next().value); // evict oldest
  }
}

/* ---------- DSA 2: Trie (Tree) for autocomplete ---------- */
class Trie {
  constructor() { this.root = { kids: {}, end: false }; }
  insert(word) {                          // O(L)
    let n = this.root;
    for (const ch of word) n = n.kids[ch] ??= { kids: {}, end: false };
    n.end = true;
  }
  startsWith(prefix, limit = 8) {         // O(L + k) instead of scanning all N names
    let n = this.root;
    for (const ch of prefix) { n = n.kids[ch]; if (!n) return []; }
    const out = [];
    const walk = (node, acc) => {
      if (out.length >= limit) return;
      if (node.end) out.push(acc);
      for (const ch of Object.keys(node.kids).sort()) walk(node.kids[ch], acc + ch);
    };
    walk(n, prefix);
    return out;
  }
}

/* ---------- helpers ---------- */
const cache = new LRU(200);
const trie = new Trie();
let namesPromise = null;

async function getJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (res.status === 404) { const e = new Error("ไม่พบ Pokémon ตัวนี้"); e.status = 404; throw e; }
  if (!res.ok) { const e = new Error("PokéAPI ตอบกลับผิดปกติ"); e.status = 502; throw e; }
  return res.json();
}

function loadNames() {                    // load once, build Trie once
  namesPromise ??= getJson(`${API}/pokemon?limit=2000`)
    .then(d => d.results.forEach(p => trie.insert(p.name)))
    .catch(err => { namesPromise = null; throw err; });
  return namesPromise;
}

const clean = s => String(s ?? "").trim().toLowerCase();
const valid = s => /^[a-z0-9-]{1,40}$/.test(s);
const idOf = url => Number(url.split("/").filter(Boolean).pop());

// DSA 3: Queue — BFS over the evolution tree, one array per level (handles branches like Eevee)
function evolutionLevels(root) {
  const levels = [];
  let queue = [root];
  while (queue.length) {
    levels.push(queue.map(n => ({ name: n.species.name, id: idOf(n.species.url) })));
    queue = queue.flatMap(n => n.evolves_to);
  }
  return levels;
}

async function loadPokemon(name) {
  const hit = cache.get(name);
  if (hit) return hit;
  const p = await getJson(`${API}/pokemon/${name}`);
  const species = await getJson(p.species.url);
  const chain = await getJson(species.evolution_chain.url);
  const s = Object.fromEntries(p.stats.map(x => [x.stat.name, x.base_stat]));
  const result = {
    id: p.id, name: p.name, height: p.height / 10, weight: p.weight / 10,
    types: p.types.map(t => t.type.name),
    stats: { hp: s.hp, attack: s.attack, defense: s.defense, spAttack: s["special-attack"],
             spDefense: s["special-defense"], speed: s.speed },
    evolution: evolutionLevels(chain.chain),
    forms: species.varieties.map(v => v.pokemon.name).filter(n => n !== p.name)
  };
  cache.set(name, result);
  return result;
}

/* ---------- routes ---------- */
app.get("/api/search", async (req, res, next) => {
  try {
    const q = clean(req.query.q).replace(/\s+/g, "-");
    if (!valid(q)) return res.status(400).json({ error: "พิมพ์ได้เฉพาะ a-z, 0-9 และ -" });
    await loadNames();
    res.json({ results: trie.startsWith(q, 8) });
  } catch (e) { next(e); }
});

app.get("/api/pokemon/:name", async (req, res, next) => {
  try {
    const name = clean(req.params.name);
    if (!valid(name)) return res.status(400).json({ error: "ชื่อ Pokémon ไม่ถูกต้อง" });
    res.json(await loadPokemon(name));
  } catch (e) { next(e); }
});

app.get("/api/featured", async (req, res) => {
  const all = await Promise.allSettled(FEATURED.map(loadPokemon));   // one failure won't break the grid
  res.json({ items: all.filter(r => r.status === "fulfilled").map(r => ({ id: r.value.id, name: r.value.name })) });
});

const dist = path.join(__dirname, "..", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.status ? err.message : "เชื่อมต่อ PokéAPI ไม่ได้ ลองใหม่อีกครั้ง" });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
}
module.exports = app;
