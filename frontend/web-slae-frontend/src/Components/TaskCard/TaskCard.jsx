import "./TaskCard.css"

export function TaskCard({ task, onSelect }) {
  const progress = Math.round(task.progress ?? 0);
  const status = (task.status ?? "unknown").toString();

  return (
    <div className="task-card" onClick={() => onSelect(task.id)}>
      <div className="task-card-id">{task.id}</div>
      <div className="task-card-meta">
        <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>
        <span>{progress}%</span>
      </div>
      <div className="task-card-progress">
        <div className="task-card-progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
