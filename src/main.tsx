
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import AuthPage from "./components/AuthPage.tsx";
import ProjectsPage from "./components/ProjectsPage.tsx";
import ProjectPage from "./components/ProjectPage.tsx";
import SessionPage from "./components/SessionPage.tsx";
import PricingPage from "./components/PricingPage.tsx";
import AccountPage from "./components/AccountPage.tsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (currentPath === "/auth" || currentPath === "/signup" || currentPath === "/login") {
    return <AuthPage />;
  }
  if (currentPath === "/app") {
    return <ProjectsPage />;
  }
  if (currentPath === "/pricing") {
    return <PricingPage />;
  }
  if (currentPath === "/account") {
    return <AccountPage />;
  }
  if (currentPath.includes("/sessions/")) {
    return <SessionPage />;
  }
  if (currentPath.startsWith("/projects/")) {
    return <ProjectPage />;
  }
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </ThemeProvider>
);
  