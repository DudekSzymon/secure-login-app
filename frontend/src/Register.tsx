import React, { useState } from "react";
import { authAPI } from "./api";
import { Mail, Lock, ShieldCheck } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.register(formData);
      onSwitchToLogin();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Security Email</label>
          <div className="input-with-icon">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              placeholder="admin@secure.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>New Password</label>
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
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
            />
          </div>
        </div>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "ENCRYPTING..." : "SIGN UP"}
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account?{" "}
        <button onClick={onSwitchToLogin} className="link-button">
          Sign in
        </button>
      </p>
    </div>
  );
};

export default Register;
