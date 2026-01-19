import React, { useState } from "react";
import { authAPI } from "./api";
import { Mail, Lock, AlertCircle } from "lucide-react";

interface LoginProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authAPI.login(formData);
      onSuccess();
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.error || "Authentication failed.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <div className="input-with-icon">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              placeholder="Enter your security email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="input-with-icon">
            <Lock className="input-icon" size={18} />
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
        </div>

        {error && (
          <div className="security-alert fade-in">
            <div className="alert-header">
              <AlertCircle size={16} />
              <span>SECURITY ALERT</span>
            </div>
            <div className="alert-content">{error}</div>
          </div>
        )}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "AUTHENTICATING..." : "SIGN IN"}
        </button>
      </form>

      <p className="auth-footer-text">
        Need access?{" "}
        <button onClick={onSwitchToRegister} className="link-button">
          Request Account
        </button>
      </p>
    </div>
  );
};

export default Login;
