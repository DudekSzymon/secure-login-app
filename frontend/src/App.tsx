import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import "./App.css";

type View = "login" | "register" | "dashboard";

function App() {
  const [currentView, setCurrentView] = useState<View>("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
      setCurrentView("dashboard");
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    setCurrentView("login");
  };

  return (
    <div className={`app-container ${isAuthenticated ? "dashboard-mode" : ""}`}>
      {/* LEWA STRONA: Formularze */}
      <div className="form-side">
        <div className="form-content">
          {!isAuthenticated && (
            <header className="logo-header">
              <div className="logo-placeholder">
                <span className="logo-icon">🛡️</span> SECURE
              </div>
            </header>
          )}

          <main className="auth-wrapper">
            {!isAuthenticated && currentView === "login" && (
              <div className="fade-in">
                <h1 className="auth-title">Sign In</h1>
                <Login
                  onSuccess={handleLoginSuccess}
                  onSwitchToRegister={() => setCurrentView("register")}
                />
              </div>
            )}

            {!isAuthenticated && currentView === "register" && (
              <div className="fade-in">
                <h1 className="auth-title">Sign Up</h1>
                <Register
                  onSuccess={() => setCurrentView("login")}
                  onSwitchToLogin={() => setCurrentView("login")}
                />
              </div>
            )}

            {isAuthenticated && (
              <div className="fade-in dashboard-view">
                <Dashboard onLogout={handleLogout} />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* PRAWA STRONA: Visual Content (Znika po zalogowaniu) */}
      {!isAuthenticated && (
        <div className="visual-side">
          <div className="visual-content">
            <h2>
              Your data, under full control. <br />
              Secure your application with us.
            </h2>
            <a href="#security" className="learn-more-link">
              READ SECURITY WHITE-PAPER
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
