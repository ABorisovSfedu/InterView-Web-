
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import AuthPage from "./components/AuthPage.tsx";
import ProjectsPage from "./components/ProjectsPage.tsx";
import ProjectPage from "./components/ProjectPage.tsx";
import SessionPage from "./components/SessionPage.tsx";
import PricingPage from "./components/PricingPage.tsx";
import AccountPage from "./components/AccountPage.tsx";
import BuilderPage from "./components/BuilderPage.tsx";
import SessionViewPage from "./components/SessionViewPage.tsx";
import UnifiedSessionPage from "./components/UnifiedSessionPage.tsx";
import ComponentShowcase from "./components/dev/ComponentShowcase.tsx";
import LayoutViewer from "./components/dev/LayoutViewer.tsx";
import GeneratePage from "./components/GeneratePage.tsx";
import NotFoundPage from "./components/NotFoundPage.tsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./utils/toast";
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
        if (currentPath.startsWith("/builder/")) {
          return <BuilderPage />;
        }
        if (currentPath.startsWith("/session/")) {
          // Новая единая страница сессии
          return <UnifiedSessionPage />;
        }
        if (currentPath.startsWith("/generate/")) {
          // Страница генерации layout
          const sessionId = currentPath.split('/')[2];
          return <GeneratePage sessionId={sessionId} />;
        }
  
  // Dev-страницы
  if (currentPath === "/dev/components") {
    return <ComponentShowcase />;
  }
  if (currentPath === "/dev/layout-viewer") {
    return <LayoutViewer />;
  }
  
  // Главная страница
  if (currentPath === "/") {
    return <App />;
  }
  
  // 404 для всех остальных маршрутов
  return <NotFoundPage />;
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
  