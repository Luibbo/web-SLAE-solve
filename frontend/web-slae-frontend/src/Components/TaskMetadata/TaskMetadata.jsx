import React, { useEffect, useState } from "react";
import { fetchTask, cancelTask } from "../../api";

export default function TaskDetails({ taskId }) {
  const [task, setTask] = useState(null);

  // useEffect(() => {
  //   if (!taskId) return;
  //   fetchTask(taskId).then(setTask).catch(console.error);
  // }, [taskId]);
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

  return (
    <div>
      <h3>Task Metadata</h3>
      <p><strong>ID:</strong> {task.id}</p>
      <p><strong>Status:</strong> {task.status}</p>
      <p><strong>Progress:</strong> {task.progress ?? 0}%</p>

      {params ? (
        <div style={{ marginTop: 16 }}>
          <h4>Params</h4>
          <p><strong>Matrix size (n):</strong> {params.n}</p>

          <div>
            <h5>Matrix A:</h5>
            <table
              border="1"
              cellPadding="6"
              style={{ borderCollapse: "collapse", background: "#fafafa" }}
            >
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

          <div style={{ marginTop: 10 }}>
            <h5>Vector b:</h5>
            <table
              border="1"
              cellPadding="6"
              style={{ borderCollapse: "collapse", background: "#fafafa" }}
            >
              <tbody>
                {params.b.map((val, i) => (
                  <tr key={i}>
                    <td>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>No params available</div>
      )}
    </div>
  );
}
