import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import TaskHistory from "./Components/TaskHistory/TaskHistory";
import CreateTask from "./Components/CreateTask/CreateTask";

function App() {
  
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

    function HistoryRedirectWrapper() {
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        }
      }, [navigate]);

    return <TaskHistory/>;
  }

  function CreateRedirectWrapper() {
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        }
      }, [navigate]);

    return <CreateTask/>;
  }

return (
<Router>
  <Routes>
    <Route path="/login" element={<LoginRedirectWrapper />} />

    <Route path="/tasks" element={<HistoryRedirectWrapper />} />

    <Route path="/create" element={<CreateRedirectWrapper />} />

    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
</Router>
);
}



export default App;
