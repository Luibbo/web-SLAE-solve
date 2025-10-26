// import './App.css';
// import LoginSignup from './Components/LoginSignup/LoginSignup';

// function App() {
//   return (
//     <div>
//       <LoginSignup/>


//     </div>
//   );
// }

// export default App;


import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import TaskHistory from "./Components/TaskHistory/TaskHistory";
import CreateTask from "./Components/CreateTask/CreateTask";

function App() {
return (
<Router>
<Routes>
{/* Сторінка логіну/реєстрації */}
<Route path="/login" element={<LoginRedirectWrapper />} />

    {/* Головна сторінка (історія тасків) */}
    <Route path="/tasks" element={<TaskHistory />} />

    {/* Сторінка створення таску */}
    <Route path="/create" element={<CreateTask />} />

    {/* Якщо маршрут не знайдено → редірект */}
    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
</Router>


);
}

// Окрема компонента, що перевіряє токен і редіректить
function LoginRedirectWrapper() {
const navigate = useNavigate();

useEffect(() => {
const token = localStorage.getItem("ftoken"); // Replace ftoken to token!!!!!!!
if (token) {
navigate("/tasks");
}
}, [navigate]);

return <LoginSignup />;
}

export default App;
