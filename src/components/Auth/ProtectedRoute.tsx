import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../types/rbac';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions; if false, ANY permission
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requireAll = false,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const { canAny, canAll } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? canAll(requiredPermissions)
      : canAny(requiredPermissions);

    if (!hasAccess) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  return <>{children}</>;
}
