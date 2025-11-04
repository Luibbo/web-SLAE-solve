import React, { useEffect, useState } from "react";
import { fetchTasks, fetchTask, cancelTask } from "../../api";
import { TaskCard } from "../TaskCard/TaskCard";
import TaskDetails from "../TaskMetadata/TaskMetadata";
import LogoutButton from "../Logout/Logout";
import { useNavigate } from "react-router-dom";
import "./TaskHistory.css"

export default function HomePage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [taskDetail, setTaskDetail] = useState(null);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load tasks");
    } finally {
    }
  };

  useEffect(() => {
    loadTasks();
    const t = setInterval(loadTasks, 10000);
    return () => clearInterval(t);
  }, []);

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

    <div className="tasks-layout">
      <div className="history-panel">
        <h3 className="header">Task History</h3>

        <div className="history-actions">
          <button className="btn-main" onClick={loadTasks}>Refresh</button>
          <button className="btn-main" onClick={() => navigate("/create")}>New</button>
        </div>

        <div className="history-list">
          {tasks.map(t => <TaskCard key={t.id} task={t} onSelect={setSelected}/>)}
        </div>
      </div>

      <div className="details-panel">
          <div>
            <LogoutButton />
          </div>
        <h2 className="header">Task Details</h2>

        <TaskDetails taskId={selected}/>
        {selected ? (<div>
          <button className="btn-cancell" onClick={() => handleCancel(taskDetail.id)}>Cancel Task</button>
        </div>) : (<div></div>)}
      </div>
    </div>
  );
}