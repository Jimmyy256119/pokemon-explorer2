export async function api(path, signal) {
  const res = await fetch(path, { signal });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");
  return data;
}
export const art = id =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
export const pretty = n => n.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
