import React, { useEffect, useState } from "react";
import { authAPI, User } from "./api";
import "./Dashboard.css"; // IMPORT SPECJALNYCH STYLI
import {
  ShieldCheck,
  User as UserIcon,
  Key,
  Activity,
  LogOut,
  Clock,
  Lock,
  Mail,
  Cpu,
} from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await authAPI.getCurrentUser();
      setUser(data.user);
    } catch (error) {
      console.error("Failed to load session", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      onLogout();
    } catch (error) {
      onLogout();
    }
  };

  if (loading) {
    return (
      <div
        className="soc-dashboard-wrapper"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Cpu className="soc-pulse" size={48} color="#2563eb" />
          <p style={{ marginTop: "20px", letterSpacing: "2px" }}>
            INITIALIZING SECURE TERMINAL...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="soc-dashboard-wrapper">
      <header className="soc-header">
        <div className="soc-title-group">
          <h1>Security Operations Center</h1>
          <div className="soc-status-line">
            <span className="soc-blink"></span>
            <span>
              SYSTEM STATUS: ACTIVE // OPERATOR:{" "}
              {user?.email.split("@")[0].toUpperCase()}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="soc-terminate-btn">
          <LogOut size={18} />
          <span>TERMINATE SESSION</span>
        </button>
      </header>

      <div className="soc-stats-grid">
        <div className="soc-stat-card active">
          <ShieldCheck className="soc-stat-icon" />
          <div>
            <span className="soc-stat-label">Protection Status</span>
            <span className="soc-stat-value">SHIELD ACTIVE</span>
          </div>
        </div>
        <div className="soc-stat-card">
          <Activity className="soc-stat-icon green" />
          <div>
            <span className="soc-stat-label">Integrity Level</span>
            <span className="soc-stat-value">100% SECURE</span>
          </div>
        </div>
        <div className="soc-stat-card">
          <Lock className="soc-stat-icon" />
          <div>
            <span className="soc-stat-label">Encryption Standard</span>
            <span className="soc-stat-value">AES-256-GCM</span>
          </div>
        </div>
      </div>

      <div className="soc-main-grid">
        <section className="soc-card">
          <div className="soc-card-header">
            <UserIcon size={20} color="#2563eb" />
            <h3>Operator Credentials</h3>
          </div>
          {user && (
            <div className="soc-card-body">
              <div className="soc-info-item">
                <Mail size={16} color="#71717a" />
                <div>
                  <label className="soc-info-label">Corporate Email</label>
                  <span className="soc-info-value">{user.email}</span>
                </div>
              </div>
              <div className="soc-info-item">
                <Key size={16} color="#71717a" />
                <div>
                  <label className="soc-info-label">Access ID (UID)</label>
                  <span className="soc-info-value soc-mono">{user.id}</span>
                </div>
              </div>
              <div className="soc-info-item">
                <Clock size={16} color="#71717a" />
                <div>
                  <label className="soc-info-label">Session Established</label>
                  <span className="soc-info-value">
                    {new Date(user.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="soc-card">
          <div className="soc-card-header">
            <ShieldCheck size={20} color="#2563eb" />
            <h3>Active Security Protocols</h3>
          </div>
          <div className="soc-protocol-list">
            {[
              "Bcrypt-Password-Hashing (v12)",
              "JWT-Auto-Refresh mechanism",
              "Advanced Rate-Limiting Protection",
              "HTTP-Only Cookie Injection Prevention",
              "SQL/NoSQL Shield Enabled",
              "Helmet.js Security Headers Active",
              "Strict Cross-Origin Resource Sharing",
            ].map((feature, idx) => (
              <div key={idx} className="soc-protocol-item">
                <div className="soc-dot"></div>
                {feature}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
