import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { InstallPWA } from "@/components/InstallPWA";
import { Component, ReactNode } from "react";
import AnimatedSplash from "./pages/AnimatedSplash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import Map from "./pages/Map";
import EmergencyFacilities from "./pages/EmergencyFacilities";
import Contacts from "./pages/Contacts";
import ContactsNew from "./pages/ContactsNew";
import ContactsEdit from "./pages/ContactsEdit";
import Incidents from "./pages/Incidents";
import IncidentDetail from "./pages/IncidentDetail";
import Settings from "./pages/Settings";
import Silent from "./pages/Silent";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple Error Boundary
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card p-6 rounded-lg border border-border shadow-lg">
            <h1 className="text-xl font-bold text-destructive mb-2">⚠️ App Error</h1>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message || 'Something went wrong'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <InstallPWA />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Splash screen is the entry point */}
                <Route path="/" element={<AnimatedSplash />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/setup" element={<ProtectedRoute><Setup /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
                <Route path="/emergency-facilities" element={<ProtectedRoute><EmergencyFacilities /></ProtectedRoute>} />
                <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                <Route path="/contacts/new" element={<ProtectedRoute><ContactsNew /></ProtectedRoute>} />
                <Route path="/contacts/edit/:index" element={<ProtectedRoute><ContactsEdit /></ProtectedRoute>} />
                <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
                <Route path="/incidents/:id" element={<ProtectedRoute><IncidentDetail /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/silent" element={<ProtectedRoute><Silent /></ProtectedRoute>} />
                <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
