import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-soft text-sm">
        Loading your session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
