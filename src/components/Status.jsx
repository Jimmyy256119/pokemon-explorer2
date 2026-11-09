export default function Status({ kind, text, onRetry }) {
  const icon = { loading: "⏳", empty: "🔍", error: "⚠️" }[kind];
  return (
    <div className={`status ${kind}`} role={kind === "error" ? "alert" : "status"}>
      <span>{icon}</span><p>{text}</p>
      {kind === "error" && onRetry && <button onClick={onRetry}>ลองใหม่</button>}
    </div>
  );
}
