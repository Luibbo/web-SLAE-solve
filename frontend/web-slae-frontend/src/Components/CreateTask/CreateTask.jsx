import React, { useState, useEffect } from "react";
import { createTask } from "../../api";
import { useNavigate } from "react-router-dom";
import "./CreateTask.css"

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const [n, setN] = useState(3);
  const [A, setA] = useState([]);
  const [b, setB] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setA(Array.from({ length: n }, () => Array(n).fill("")));
    setB(Array.from({ length: n }, () => ""));
  }, [n]);

  // const handleSizeChange = (value) => {
  //   const newN = Number(value);
  //   setN(newN);

  //   setA(Array(newN).fill(null).map(() => Array(newN).fill("")));
  //   setB(Array(newN).fill(""));
  // };

  const handleMatrixChange = (i, j, value) => {
    const updated = [...A];
    updated[i][j] = value;
    setA(updated);
  };

  const handleVectorChange = (i, value) => {
    const updated = [...b];
    updated[i] = value;
    setB(updated);
  };

  const isFullyFilled = () => {
    return A.every(row => row.every(cell => cell !== "")) &&
           b.every(cell => cell !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = { params: { n }};
    
    if (isFullyFilled()) {
      payload.params.values = A.map(row => row.map(Number));
      payload.params.b = b.map(Number);
    } else {
      alert("The parameters were not entered completely - the matrix will be generated automatically");
    }

    setCreating(true);
    try {
      const res = await createTask(payload);
      alert("Task created: " + res.task_id);
      navigate("/tasks");
    } catch (err) {
      console.error(err);
      alert("Create failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="create-form">
      <h2>Create Task</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>n (matrix size): </label>
          <input
            type="number"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            min={1}
            max={250}
          />
        </div>
        <div className="matrix-wrapper">
          <div className="matrix-box">
            <h4>Matrix A:</h4>
            <div className="matrix-input">
              {A.map((row, i) => (
                <div key={i} className="matrix-row">
                  {row.map((val, j) => (
                    <input
                      key={`${i}-${j}`}
                      type="number"
                      value={val}
                      onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="vector-box">
            <h4>Vector b:</h4>
            <div className="vector-input">
              {b.map((val, i) => (
                <input
                  key={i}
                  type="number"
                  value={val}
                  onChange={(e) => handleVectorChange(i, e.target.value)}
                />
              ))}
            </div>
          </div>
        </div>
        <div>
          <button className="btn-main" type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create"}
          </button>
          <button
            className="btn-grey"
            type="button"
            onClick={() => navigate("/tasks")}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
