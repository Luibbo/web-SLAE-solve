import React, { useEffect, useState } from "react";
import { fetchTask } from "../../api";
import "./TaskMetadata.css"
export default function TaskDetails({ taskId }) {
  const [task, setTask] = useState(null);

  const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  
  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ` +
         `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  useEffect(() => {
    if (!taskId) return;

    // 1️⃣ Завантажуємо початкові дані
    fetchTask(taskId)
      .then(setTask)
      .catch(console.error);

    // 2️⃣ Створюємо WebSocket-з’єднання
    const token = localStorage.getItem("token");
    if (!token) return;

    const ws = new WebSocket(
       `wss://localhost/api/v1/tasks/ws/${taskId}?token=${token}`
    );

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 WS message:", data);
        setTask((prev) => {
          if (!prev) return prev;
          return { ...prev, ...data }; // оновлюємо статус/прогрес
        });
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket closed");
    };

    ws.onerror = (err) => {
      console.error("⚠️ WebSocket error:", err);
    };

    // 3️⃣ Закриваємо з’єднання при виході
    return () => {
      ws.close();
    };
  }, [taskId]);



  if (!taskId) return <div>Select a task</div>;
  if (!task) return <div>Loading...</div>;
  const params = task.params ?? null;
  //console.log("Param.result", params.result)
  return (
    <div>
      <h3 className="header-meta">Task Metadata</h3>
      <div className="task-meta">
        <p className="metadata"><strong>ID:</strong> {task.id}</p>
        <p className="metadata"><strong>Status:</strong> {task.status}</p>
        <p className="metadata"><strong>Created at:</strong> {formatDate(task.created_at)}</p>
        <p className="metadata"><strong>Started at:</strong> {formatDate(task.started_at)}</p>
        <p className="metadata"><strong>Finished at:</strong> {formatDate(task.finished_at)}</p>
        <p className="metadata"><strong>Progress:</strong> {Math.round(task.progress ?? 0)}%</p>
        <p className="metadata"><strong>Estimated seconds:</strong> {Math.round(task.estimated_seconds ?? 0)}</p>
      </div>
      <div className="param-section">
        <h3 className="header-meta">Params</h3>
        {params ? (
          <div className="matrix-wrapper">
            <div className="params">
              <p><strong>Matrix size (n):</strong> {params.n}</p>
              <p><strong>Complexity metrics (O(n^3)):</strong> {task.complexity_metric ?? 0}</p>
            </div>
            <div className="matrix-box">
              <h5>Matrix A:</h5>
              <table>
                <tbody>
                  {params.values.map((row, i) => (
                    <tr key={i}>
                      {row.map((val, j) => (
                        <td key={j}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="vector-box">
              <h5>Vector b:</h5>
              <table>
                <tbody>
                  {params.b.map((val, i) => (
                    <tr key={i}>
                      <td>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {params.result ? (
            <div className="vector-box">
              <h5>Result:</h5>
              <table>
                <tbody>
                  {params.result.map((val, i) => (
                    <tr key={i}>
                      <td>{parseFloat(val).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>) : (
              <div>Evaluating result</div>
            )}

          </div>
        ) : (
          <div>No params available</div>
        )}
      </div>
    </div>
  );
}
