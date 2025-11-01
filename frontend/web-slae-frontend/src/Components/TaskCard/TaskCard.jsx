import "./TaskCard.css"

export function TaskCard({ task, onSelect }) {
  return (
    <div className="task-card" onClick={() => onSelect(task.id)}>
      <div><strong>{task.id}</strong></div>
      <div>Status: {task.status} | Progress: {task.progress ?? 0}%</div>
    </div>
  );
}