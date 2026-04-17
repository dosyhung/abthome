import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CSpinner } from '@coreui/react';

const ProtectedRoute = () => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="pt-3 text-center">
        <CSpinner color="primary" variant="grow" />
      </div>
    );
  }

  // Nếu không có token -> đá văng về /login kèm url muốn đến (để sau login chuyển lại)
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu có token -> render các màn hình Admin bên trong
  return <Outlet />;
};

export default ProtectedRoute;
