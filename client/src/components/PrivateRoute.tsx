import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import Loading from './Loading';

const PrivateRoute = () => {
  const location = useLocation();
  const { isAuthLoading, isAuthenticated } = useAuth();

  if (isAuthLoading) return <Loading fullScreen />;

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default PrivateRoute;
