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

  // If profile is still loading (null but user exists), show loading
  if (user && profile === null && !loading) {
    // Profile might not exist yet, redirect to setup
    if (location.pathname !== '/setup') {
      return <Navigate to="/setup" replace />;
    }
  }

  // Check if user needs to complete setup
  // Skip this check if already on setup page
  if (location.pathname !== '/setup' && profile) {
    const needsSetup = !profile.phone_number || profile.phone_number.trim() === '';
    
    if (needsSetup) {
      return <Navigate to="/setup" replace />;
    }
  }

  return <>{children}</>;
};
