import React from 'react';
import { Role, hasRole } from '../services/authUtils';

interface AuthorizableProps {
    allowedRoles: Role[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const Authorizable: React.FC<AuthorizableProps> = ({ allowedRoles, children, fallback = null }) => {
    if (hasRole(allowedRoles)) {
        return <>{children}</>;
    }
    return <>{fallback}</>;
};

export default Authorizable;
