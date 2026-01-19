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

  // Jeśli zalogowany - renderuj TYLKO Dashboard na pełnym ekranie
  if (isAuthenticated) {
    return (
      <div className="app-container dashboard-mode">
        <div className="fade-in full-width">
          <Dashboard onLogout={handleLogout} />
        </div>
      </div>
    );
  }

  // Jeśli NIE zalogowany - renderuj stary układ (Logowanie/Rejestracja)
  return (
    <div className="app-container">
      <div className="form-side">
        <div className="form-content">
          <header className="logo-header">
            <div className="logo-placeholder">
              <span className="logo-icon">🛡️</span> SECURE
            </div>
          </header>

          <main className="auth-wrapper">
            {currentView === "login" ? (
              <div className="fade-in">
                <h1 className="auth-title">Sign In</h1>
                <Login
                  onSuccess={handleLoginSuccess}
                  onSwitchToRegister={() => setCurrentView("register")}
                />
              </div>
            ) : (
              <div className="fade-in">
                <h1 className="auth-title">Sign Up</h1>
                <Register
                  onSuccess={() => setCurrentView("login")}
                  onSwitchToLogin={() => setCurrentView("login")}
                />
              </div>
            )}
          </main>
        </div>
      </div>

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
    </div>
  );
}

export default App;
