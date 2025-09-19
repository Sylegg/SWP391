"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RoleName } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleName[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
  fallbackPath = "/login"
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      router.push(fallbackPath);
      return;
    }

    // If specific roles are required but user doesn't have the right role
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role.name as RoleName)) {
      router.push("/unauthorized");
      return;
    }
  }, [user, isLoading, requireAuth, allowedRoles, router, fallbackPath]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return null;
  }

  // If specific roles are required but user doesn't have the right role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role.name as RoleName)) {
    return null;
  }

  return <>{children}</>;
};

interface RoleBasedComponentProps {
  children: React.ReactNode;
  allowedRoles: RoleName[];
  fallback?: React.ReactNode;
}

export const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  children,
  allowedRoles,
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role.name as RoleName)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface PermissionGateProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  fallback = null
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};