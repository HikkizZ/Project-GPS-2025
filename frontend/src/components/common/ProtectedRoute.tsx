import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { UserRole } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/dashboard'
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}; 