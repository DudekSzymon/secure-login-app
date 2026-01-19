import React, { useState } from "react";
import { authAPI } from "./api";
import { Mail, Lock } from "lucide-react";

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
    try {
      await authAPI.login(formData);
      onSuccess();
    } catch (err: any) {
      setError("Invalid credentials or server error.");
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
              placeholder="Enter your email"
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

        <a href="#forgot" className="forgot-password-link">
          FORGOT PASSWORD?
        </a>

        {error && <div className="error-message">❌ {error}</div>}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "VERIFYING..." : "SIGN IN"}
        </button>
      </form>

      <p className="auth-footer-text">
        Don't have an account?{" "}
        <button onClick={onSwitchToRegister} className="link-button">
          Sign up
        </button>
      </p>
    </div>
  );
};

export default Login;
