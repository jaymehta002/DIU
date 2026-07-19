import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { LoadingState } from '../components/LoadingState';

export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingState label="Checking session…" />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
