import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const Onboarding = () => {
  const { user } = useAuthContext();
  const location = useLocation();

  // When at the root /onboarding path, redirect based on role
  if (location.pathname === '/onboarding' || location.pathname === '/onboarding/') {
    if (user?.role === 'admin') {
      return <Navigate to="/onboarding/management" replace />;
    } else {
      return <Navigate to="/onboarding/my" replace />;
    }
  }

  return (
    <>
      <Outlet />
    </>
  );
};

export default Onboarding;