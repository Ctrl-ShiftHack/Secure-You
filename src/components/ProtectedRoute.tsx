import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user needs to complete profile setup
  // Skip this check if already on setup page or verify-email page
  const isOnSetupPage = location.pathname === '/setup';
  const isOnVerifyPage = location.pathname === '/verify-email';
  
  if (!isOnSetupPage && !isOnVerifyPage && profile) {
    // Check if profile is incomplete (new user)
    const hasMinimalInfo = profile.full_name && profile.phone_number;
    
    if (!hasMinimalInfo) {
      console.log('🔄 Redirecting to setup - incomplete profile');
      return <Navigate to="/setup" replace />;
    }
  }

  return <>{children}</>;
};
