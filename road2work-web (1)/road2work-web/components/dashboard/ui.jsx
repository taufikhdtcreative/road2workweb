export function Bar({ label, value, max = 100, suffix = '' }) {
  const pct = Math.max(0, Math.min(100, (Number(value) / max) * 100));
  return (
    <div className="bar-row">
      <div className="bar-head">
        <span>{label}</span>
        <b>
          {value}
          {suffix}
        </b>
      </div>
      <div className="bar-track" role="presentation">
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Chips({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="chips static">
      {items.map((t, i) => (
        <span key={i} className="chip">
          {t}
        </span>
      ))}
    </div>
  );
}

export function Empty({ title, text, action, actionLabel }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <button className="btn btn-lime" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
