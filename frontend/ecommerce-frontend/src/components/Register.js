import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";

function Register(){

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 4) {
      errors.password = "Password must be at least 4 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = () => {
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    axios.post("http://localhost:8080/api/auth/register", {
      username,
      password
    })
    .then(res => {
      setSuccess("Registration Successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    })
    .catch(err => {
      setError(err.response?.data?.message || "Registration Failed");
    })
    .finally(() => {
      setLoading(false);
    });

  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  return(
    <div className="container d-flex justify-content-center align-items-center" style={{height:"100vh"}}>

      <div className="card p-4 shadow" style={{width:"300px"}}>

        <h3 className="text-center mb-3">📝 Register</h3>

        {error && (
          <ErrorMessage
            message={error}
            type="danger"
            onClose={() => setError("")}
          />
        )}

        {success && (
          <ErrorMessage
            message={success}
            type="success"
            onClose={() => setSuccess("")}
            autoClose={false}
          />
        )}

        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className={`form-control ${validationErrors.username ? "is-invalid" : ""}`}
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          {validationErrors.username && (
            <div className="invalid-feedback d-block">{validationErrors.username}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className={`form-control ${validationErrors.password ? "is-invalid" : ""}`}
            placeholder="Enter password (min 4 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          {validationErrors.password && (
            <div className="invalid-feedback d-block">{validationErrors.password}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className={`form-control ${validationErrors.confirmPassword ? "is-invalid" : ""}`}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          {validationErrors.confirmPassword && (
            <div className="invalid-feedback d-block">{validationErrors.confirmPassword}</div>
          )}
        </div>

        <button
          className="btn btn-primary w-100 mb-2"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <button
          className="btn btn-link w-100"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          Already have account? Login
        </button>

      </div>

    </div>
  );
}

export default Register;