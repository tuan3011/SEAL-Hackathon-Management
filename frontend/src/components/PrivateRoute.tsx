import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, hasRole, Role } from '../services/authUtils';

interface PrivateRouteProps {
    allowedRoles?: Role[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;