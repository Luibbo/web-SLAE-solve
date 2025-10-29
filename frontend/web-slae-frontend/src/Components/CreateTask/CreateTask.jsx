// src/pages/CreateTaskPage.jsx
import React, { useState } from "react";
import { createTask } from "../../api";
import { useNavigate } from "react-router-dom";

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const [n, setN] = useState(100);
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // build a simple params object: matrix and vector
    const vals = Array.from({length: n}, () => Array.from({length: n}, () => Math.floor(Math.random() * 10)));
    const b = Array.from({length: n}, () => Math.floor(Math.random() * 21) - 10);
    const payload = { params: { n, values: vals, b } };

    setCreating(true);
    try {
      const res = await createTask(payload);
      alert("Task created: " + res.task_id);
      console.log("Params", res.params)
      navigate("/tasks"); // back to home
    } catch (err) {
      console.error(err);
      alert("Create failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h2>Create Task</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>n (matrix size): </label>
          <input type="number" value={n} onChange={(e) => setN(Number(e.target.value))} min={1} max={1000} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={creating}>{creating ? "Creating..." : "Create"}</button>
          <button type="button" onClick={() => navigate("/tasks")}>Back</button>
        </div>
      </form>
    </div>
  );
}
