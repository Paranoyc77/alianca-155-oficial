import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PublicHome from "./pages/PublicHome";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import { useState, useEffect } from "react";

function AdminRoute() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const logged = sessionStorage.getItem("alianca155_admin") === "true";
    setIsAdminLoggedIn(logged);
    setChecking(false);
  }, []);

  if (checking) return null;

  if (!isAdminLoggedIn) {
    return <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />;
  }

  return <AdminPanel onLogout={() => setIsAdminLoggedIn(false)} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicHome} />
      <Route path="/admin" component={AdminRoute} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
