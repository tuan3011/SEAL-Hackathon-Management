import { jwtDecode } from 'jwt-decode';

export enum Role {
    ADMIN = 'ADMIN',
    ORGANIZER = 'ORGANIZER',
    JUDGE = 'JUDGE',
    MENTOR = 'MENTOR',
    PARTICIPANT = 'PARTICIPANT'
}

interface JwtPayload {
    sub: string;
    roles: string;
    iat: number;
    exp: number;
}

export const getAccessToken = () => {
    return localStorage.getItem('accessToken');
};

export const getDecodedToken = (): JwtPayload | null => {
    const token = getAccessToken();
    if (!token) return null;
    try {
        return jwtDecode<JwtPayload>(token);
    } catch (e) {
        return null;
    }
};

export const getUserRole = (): Role | null => {
    const decoded = getDecodedToken();
    if (!decoded) return null;
    return decoded.roles as Role;
};

export const hasRole = (allowedRoles: Role[]): boolean => {
    const userRole = getUserRole();
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
};

export const isAuthenticated = (): boolean => {
    const decoded = getDecodedToken();
    if (!decoded) return false;
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return false;
    }
    return true;
};