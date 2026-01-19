import React, { useState } from "react";
import { authAPI } from "./api";
import { Mail, Lock, ShieldCheck, AlertCircle } from "lucide-react";

interface RegisterProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDetails([]);

    try {
      await authAPI.register(formData);
      onSwitchToLogin();
    } catch (err: any) {
      const serverError = err.response?.data;
      setError(serverError?.error || "Registration encountered an error.");
      if (serverError?.details) {
        setDetails(serverError.details);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Corporate Email</label>
          <div className="input-with-icon">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              placeholder="e.g. operator@secure.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Security Password</label>
          <div className="input-with-icon">
            <Lock className="input-icon" size={18} />
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Confirm Identity</label>
          <div className="input-with-icon">
            <ShieldCheck className="input-icon" size={18} />
            <input
              type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
            />
          </div>
        </div>

        {error && (
          <div className="security-alert fade-in">
            <div className="alert-header">
              <AlertCircle size={16} />
              <span>VALIDATION ERROR</span>
            </div>
            <div className="alert-content">
              {error}
              {details.length > 0 && (
                <ul className="error-list">
                  {details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "ENCRYPTING DATA..." : "CREATE ACCOUNT"}
        </button>
      </form>

      <p className="auth-footer-text">
        Already registered?{" "}
        <button onClick={onSwitchToLogin} className="link-button">
          Sign In
        </button>
      </p>
    </div>
  );
};

export default Register;
