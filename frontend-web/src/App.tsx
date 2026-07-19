import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { Dashboard } from './Dashboard';
import { LoginForm } from './components/LoginForm';
import { LoadingState } from './components/LoadingState';

function AppContent() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingState label="Loading…" />;
  }

  if (status === 'unauthenticated') {
    return <LoginForm />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
