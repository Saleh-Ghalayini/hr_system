import React, { useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import "./style.css";

const Login = () => {
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const result = await login(email, password, rememberMe);
    if (result && !result.success) {
      setError(result.message || "Login failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left panel — branding */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="rgba(255,255,255,0.15)" />
              <path d="M24 10C16.268 10 10 16.268 10 24s6.268 14 14 14 14-6.268 14-14S31.732 10 24 10zm0 6a4 4 0 110 8 4 4 0 010-8zm0 20c-4.418 0-8-2.686-8-6 0-3.314 3.582-6 8-6s8 2.686 8 6c0 3.314-3.582 6-8 6z" fill="white" />
            </svg>
          </div>
          <h1 className="login-brand-name">HR System</h1>
          <p className="login-brand-tagline">Manage your workforce efficiently</p>
        </div>
        <div className="login-features">
          <div className="login-feature">
            <span className="login-feature-icon">✓</span>
            <span>Attendance tracking &amp; leave management</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">✓</span>
            <span>Payroll &amp; salary processing</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">✓</span>
            <span>Performance reviews &amp; reports</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <div className="login-options">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="forgot-btn"
                onClick={() => setShowForgot(true)}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgot && (
        <div className="modal-overlay" onClick={() => setShowForgot(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Password</h3>
            <p>
              To reset your password, please contact your HR administrator or
              system admin. They will send you a temporary password to your
              registered email address.
            </p>
            <button className="modal-close-btn" onClick={() => setShowForgot(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
