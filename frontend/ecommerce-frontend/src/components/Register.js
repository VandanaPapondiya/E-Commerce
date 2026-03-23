import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Username is required";
    } else if (name.length < 3) {
      errors.name = "Username must be at least 3 characters";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Enter a valid email";
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

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/auth/register", {
        name,
        email,
        password
      });

      console.log("SUCCESS RESPONSE 👉", res.data);

      setSuccess(res.data.message || "Registration Successful!");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {

      console.log("FULL ERROR 👉", err);

      // 🔥 important debug
      if (err.response) {
        console.log("BACKEND ERROR 👉", err.response.data);
        setError(err.response.data.message || "Registration Failed");
      } else if (err.request) {
        setError("Server not responding (check backend)");
      } else {
        setError("Something went wrong");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <div className="card p-4 shadow" style={{ width: "300px" }}>

        <h3 className="text-center mb-3">📝 Register</h3>

        {error && <ErrorMessage message={error} type="danger" onClose={() => setError("")} />}
        {success && <ErrorMessage message={success} type="success" onClose={() => setSuccess("")} autoClose={false} />}

        {/* Name */}
        <div className="mb-3">
          <label>Name</label>
          <input
            className={`form-control ${validationErrors.name ? "is-invalid" : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {validationErrors.name && <div className="text-danger">{validationErrors.name}</div>}
        </div>

        {/* Email */}
        <div className="mb-3">
          <label>Email</label>
          <input
            className={`form-control ${validationErrors.email ? "is-invalid" : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {validationErrors.email && <div className="text-danger">{validationErrors.email}</div>}
        </div>

        {/* Password */}
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className={`form-control ${validationErrors.password ? "is-invalid" : ""}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {validationErrors.password && <div className="text-danger">{validationErrors.password}</div>}
        </div>

        {/* Confirm Password */}
        <div className="mb-3">
          <label>Confirm Password</label>
          <input
            type="password"
            className={`form-control ${validationErrors.confirmPassword ? "is-invalid" : ""}`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {validationErrors.confirmPassword && <div className="text-danger">{validationErrors.confirmPassword}</div>}
        </div>

        <button className="btn btn-primary w-100" onClick={handleRegister} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

      </div>
    </div>
  );
}

export default Register;