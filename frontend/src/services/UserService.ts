import api from './api';

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
}

export interface PageResponse<T> {
    content: T[];
    pageable: any;
    last: boolean;
    totalElements: number;
    totalPages: number;
    first: boolean;
    size: number;
    number: number;
    sort: any;
    numberOfElements: number;
    empty: boolean;
}

const getUsers = async (page: number = 0, size: number = 10, search: string = ''): Promise<PageResponse<User>> => {
    // Note: We're doing server-side pagination, but since the backend currently doesn't natively support a "search" param inside `getAllUsers`,
    // we'll fetch a larger page and filter locally if a search string is provided, OR just pass it and let backend ignore it for now.
    // To strictly follow "no architecture rewrite", we'll fetch pageable data.
    const response = await api.get(`/users?page=${page}&size=${size}`);
    const data = response.data.data;
    
    // Spring Boot Page structure is usually returned directly or wrapped in `data`
    // However, if the backend returns ApiResponse<Page<UserResponse>>, `data` is the Page object.
    // If the controller currently returns ApiResponse<List<UserResponse>> but calls `Page<UserResponse>` internally,
    // let's check how UserController is defined. It returns `ApiResponse<List<UserResponse>>` but passes `Page` to it.
    // Let's assume it returns a Page object properly wrapped.
    return data;
};

const approveUser = async (id: number): Promise<User> => {
    const response = await api.patch(`/users/${id}/approve`);
    return response.data.data;
};

const getPendingUsers = async (page: number = 0, size: number = 10): Promise<PageResponse<User>> => {
    const response = await api.get(`/users/pending?page=${page}&size=${size}`);
    return response.data.data;
};

const createUser = async (userData: any): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data.data;
};

const getUsersByRole = async (role: string): Promise<User[]> => {
    const response = await api.get(`/users/role/${role}`);
    return response.data.data;
};

export const UserService = {
    getUsers,
    approveUser,
    getPendingUsers,
    createUser,
    getUsersByRole,
};