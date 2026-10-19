import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(role)) {
    const home = role === 'farmer' ? '/farmer/dashboard' : role === 'admin' ? '/admin' : '/';
    return <Navigate to={home} replace />;
  }
  return <Outlet />;
}
