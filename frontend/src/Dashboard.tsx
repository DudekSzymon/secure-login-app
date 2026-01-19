import React, { useEffect, useState } from "react";
import { authAPI, User } from "./api";
import {
  ShieldCheck,
  User as UserIcon,
  Key,
  Activity,
  LogOut,
  Clock,
  Lock,
  Mail,
} from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await authAPI.getCurrentUser();
      setUser(data.user);
    } catch (error) {
      setError("Failed to fetch security credentials");
      console.error(error);
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
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Verifying session security...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* HEADER PANELU */}
      <header className="db-header">
        <div className="db-title-group">
          <h1>Security Operations Center</h1>
          <p className="db-subtitle">Terminal Session: Active</p>
        </div>
        <button onClick={handleLogout} className="logout-btn-premium">
          <LogOut size={18} />
          <span>Terminate Session</span>
        </button>
      </header>

      {/* STATYSTYKI SZYBKIEGO PODGLĄDU */}
      <div className="stats-grid">
        <div className="stat-card highlight">
          <ShieldCheck className="stat-icon-blue" />
          <div className="stat-info">
            <span className="stat-label">System Status</span>
            <span className="stat-value">PROTECTED</span>
          </div>
        </div>
        <div className="stat-card">
          <Activity className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Threat Level</span>
            <span className="stat-value text-low">LOW</span>
          </div>
        </div>
        <div className="stat-card">
          <Lock className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Encryption</span>
            <span className="stat-value">AES-256</span>
          </div>
        </div>
      </div>

      <div className="db-main-grid">
        {/* PROFIL UŻYTKOWNIKA */}
        <section className="db-card user-profile">
          <div className="card-header">
            <UserIcon size={20} />
            <h3>Operator Profile</h3>
          </div>
          {user && (
            <div className="card-body">
              <div className="info-item">
                <Mail size={16} />
                <div>
                  <label>Identified Email</label>
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="info-item">
                <Key size={16} />
                <div>
                  <label>Access UID</label>
                  <span className="mono-text">{user.id}</span>
                </div>
              </div>
              <div className="info-item">
                <Clock size={16} />
                <div>
                  <label>Deployment Date</label>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* LOGI BEZPIECZEŃSTWA */}
        <section className="db-card security-stack">
          <div className="card-header">
            <ShieldCheck size={20} />
            <h3>Active Security Protocols</h3>
          </div>
          <div className="protocol-list">
            {[
              "Bcrypt-Password-Hashing (12 rounds)",
              "JWT-Auto-Refresh (15 min)",
              "Rate-Limiting Protection",
              "HTTP-Only Secure Cookies",
              "SQL/NoSQL Injection Shield",
              "Helmet Security Headers",
            ].map((feature, idx) => (
              <div key={idx} className="protocol-item">
                <span className="status-dot"></span>
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
