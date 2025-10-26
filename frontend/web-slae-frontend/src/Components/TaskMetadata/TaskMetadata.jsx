import React, { useEffect, useState } from "react";
import { fetchTask, cancelTask } from "../api";

export default function TaskDetails({ taskId }) {
  const [task, setTask] = useState(null);

  useEffect(() => {
    if (!taskId) return;
    fetchTask(taskId).then(setTask).catch(console.error);
  }, [taskId]);

  if (!taskId) return <div>Select a task</div>;
  if (!task) return <div>Loading...</div>;

  return (
    <div>
      <h3>Task Metadata</h3>
      <pre>{JSON.stringify(task.params, null, 2)}</pre>
      <p>Status: {task.status}</p>
      <p>Progress: {task.progress}</p>
      <button onClick={() => cancelTask(task.id)}>Cancel Task</button>
    </div>
  );
}
