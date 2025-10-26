
export function TaskCard({ task, onSelect }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: 8, marginBottom: 8, cursor: "pointer" }}
         onClick={() => onSelect(task.id)}>
      <div><strong>{task.id}</strong></div>
      <div>Status: {task.status} | Progress: {task.progress ?? 0}%</div>
    </div>
  );
}