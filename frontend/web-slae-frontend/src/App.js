import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import TaskHistory from "./Components/TaskHistory/TaskHistory";
import CreateTask from "./Components/CreateTask/CreateTask";

function App() {
return (
<Router>
  <Routes>
    <Route path="/login" element={<LoginRedirectWrapper />} />

    <Route path="/tasks" element={<TaskHistory />} />

    <Route path="/create" element={<CreateTask />} />

    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
</Router>


);
}

function LoginRedirectWrapper() {
const navigate = useNavigate();

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    navigate("/tasks");
    }
  }, [navigate]);

  return <LoginSignup/>;
}

export default App;
