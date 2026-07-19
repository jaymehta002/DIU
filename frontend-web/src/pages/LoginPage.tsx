import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { LoginForm } from '../components/LoginForm';
import { LoadingState } from '../components/LoadingState';

export function LoginPage() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingState label="Loading…" />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return <LoginForm />;
}
