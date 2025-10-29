import React, { useEffect, useState } from "react";
import { fetchTasks, fetchTask, cancelTask } from "../../api";
import { TaskCard } from "../TaskCard/TaskCard";
import TaskDetails from "../TaskMetadata/TaskMetadata";

export default function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [taskDetail, setTaskDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

//   useEffect(() => {
//     loadTasks();
//     // optional: poll every 5 seconds
//     const t = setInterval(loadTasks, 5000);
//     return () => clearInterval(t);
//   }, []);

  useEffect(() => {
    if (!selected) { setTaskDetail(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const d = await fetchTask(selected);
        if (!cancelled) setTaskDetail(d);
      } catch (e) {
        console.error(e);
        alert("Failed to load task detail");
      }
    })();
    return () => { cancelled = true; };
  }, [selected]);

  const handleCancel = async (taskId) => {
    if (!window.confirm("Cancel this task?")) return;
    try {
      await cancelTask(taskId);
      alert("Cancelled");
      await loadTasks();
      if (selected === taskId) {
        const d = await fetchTask(taskId);
        setTaskDetail(d);
      }
    } catch (e) {
      console.error(e);
      alert("Cancel failed");
    }
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ width: 300 }}>
        <h3>Task History</h3>
        <button onClick={loadTasks} disabled={loading}>{loading ? "Loading..." : "Refresh"}</button>
        <div style={{ marginTop: 12 }}>
          {tasks.length === 0 ? <div>No tasks</div> : tasks.map(t => (
            <TaskCard key={t.id} task={t} onSelect={setSelected} />
          ))}
        </div>
      </div>

      {/* <div style={{ flex: 1 }}>
        <h2>Task Details</h2>
        {!selected ? <div>Select a task from the left</div> : (
          <>
            {taskDetail ? (
              <div>
                <div><strong>ID:</strong> {taskDetail.id}</div>
                <div><strong>Status:</strong> {taskDetail.status}</div>
                <div><strong>Progress:</strong> {taskDetail.progress ?? 0}%</div>

                <h4>Params</h4>
                <pre style={{ background: "#f7f7f7", padding: 12 }}>
{JSON.stringify(taskDetail.params, null, 2)}
                </pre>

                <div style={{ marginTop: 12 }}>
                  <button onClick={() => handleCancel(taskDetail.id)}>Cancel Task</button>
                </div>
              </div>
            ) : <div>Loading detail...</div>}
          </>
        )}
      </div> */}
      <div style={{ flex: 1 }}>
        <h2>Task Details</h2>
        <TaskDetails taskId={selected} />
        <div style={{ marginTop: 12 }}>
          <button onClick={() => handleCancel(taskDetail.id)}>Cancel Task</button>
        </div>
      </div>
    </div>
  );
}