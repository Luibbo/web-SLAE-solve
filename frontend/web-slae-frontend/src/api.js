const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost/api/v1";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchTasks() {
  const res = await fetch(`${BASE_URL}/tasks`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error(`fetchTasks failed: ${res.status}`);
  return res.json(); // expect array of tasks
}

export async function fetchTask(taskId) {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`fetchTask failed: ${res.status}`);
  return res.json();
}

export async function createTask(payload) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`createTask failed: ${res.status} ${txt}`);
  }
  return res.json();
}

export async function cancelTask(taskId) {
  // Adjust endpoint to your backend: here we use POST /tasks/{id}/cancel
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`cancelTask failed: ${res.status} ${txt}`);
  }
  return res.json();
}
