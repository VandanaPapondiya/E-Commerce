import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/UserContext";
import ErrorMessage from "./ErrorMessage";

function Login(){

  const navigate = useNavigate();
  const { login } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email or username is required";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 4) {
      errors.password = "Password must be at least 4 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = () => {
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    axios.post("http://localhost:8080/api/auth/login", {
      email,    // backend supports both email and username via this field
      password
    })
    .then(res => {
      const data = res.data;
      // data: { token, refreshToken, userId, username, role, email, message }
      login(data);
      window.dispatchEvent(new Event("login"));
      setSuccess("Login Successful! Redirecting...");
      setTimeout(() => {
        if (data.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/products");
        }
      }, 1000);
    })
    .catch(err => {
      const msg = err.response?.data?.message || err.response?.data || "Invalid email or password";
      setError(typeof msg === "string" ? msg : "Invalid credentials");
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return(
    <div className="container d-flex justify-content-center align-items-center" style={{height:"100vh"}}>

      <div className="card p-4 shadow" style={{width:"340px"}}>

        <h3 className="text-center mb-3">🔐 Login</h3>

        {error && (
          <ErrorMessage message={error} type="danger" onClose={() => setError("")} />
        )}
        {success && (
          <ErrorMessage message={success} type="success" onClose={() => setSuccess("")} autoClose={false} />
        )}

        <div className="mb-3">
          <label className="form-label">Email / Username</label>
          <input
            type="text"
            className={`form-control ${validationErrors.email ? "is-invalid" : ""}`}
            placeholder="Enter email or username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          {validationErrors.email && (
            <div className="invalid-feedback d-block">{validationErrors.email}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className={`form-control ${validationErrors.password ? "is-invalid" : ""}`}
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          {validationErrors.password && (
            <div className="invalid-feedback d-block">{validationErrors.password}</div>
          )}
        </div>

        <button
          className="btn btn-success w-100 mb-2"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          className="btn btn-link w-100"
          onClick={() => navigate("/register")}
          disabled={loading}
        >
          New user? Register now
        </button>

      </div>

    </div>
  );
}

export default Login;