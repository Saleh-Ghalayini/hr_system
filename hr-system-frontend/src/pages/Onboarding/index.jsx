import React from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const Onboarding = () => {
  const { user } = useAuthContext();
  const location = useLocation();

  if (location.pathname === '/onboarding' || location.pathname === '/onboarding/') {
    if (user?.role === 'admin') {
      return <Navigate to="/onboarding/new-hires" replace />;
    } else {
      return <Navigate to="/onboarding/documents" replace />;
    }
  }

  return (
    <>
      <Outlet />
    </>
  );
};

export default Onboarding;
