import React, { useState } from "react";
import './LoginSignup.css';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const LoginSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const response = await fetch("https://localhost/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log("✅ Registered:", data);
      alert("Registered successfully! Token: " + data.access_token);
    } catch (error) {
      console.error("❌ Registration error:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("https://localhost/api/v1/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });
      const data = await response.json();
      console.log("✅ Logged in:", data);
      alert("Login successful! Token: " + data.access_token);
    } catch (error) {
      console.error("❌ Login error:", error);
    }
  };

  return (
    <div className='container'>
      <div className="header">
        <div className="text">Sign Up / Login</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        <div className="input">
          <img src={email_icon} alt="" />
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input">
          <img src={password_icon} alt="" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="submit-container">
        <div className="submit" onClick={handleRegister}>Sign Up</div>
        <div className="submit" onClick={handleLogin}>Login</div>
      </div>
    </div>
  );
};

export default LoginSignup;
