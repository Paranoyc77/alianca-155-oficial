import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PublicHome from "./pages/PublicHome";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

function AdminRoute() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean | null>(null);
  const { data, isLoading, refetch } = trpc.alianca.checkAdmin.useQuery();

  useEffect(() => {
    if (data !== undefined) {
      setIsAdminLoggedIn(data.isAdmin);
    }
  }, [data]);

  if (isLoading || isAdminLoggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <AdminLogin onLoginSuccess={() => refetch()} />;
  }

  return <AdminPanel onLogout={() => refetch()} />;
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
