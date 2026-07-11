import api from './api';

const API_URL = '/audit-logs';

export interface AuditLog {
    id: number;
    userEmail: string;
    action: string;
    timestamp: string;
    details: string;
}

const getAllAuditLogs = async (page: number = 0, size: number = 100): Promise<AuditLog[]> => {
    // Note: The backend returns a Page<AuditLogResponse>. We extract .content
    const response = await api.get(`${API_URL}?page=${page}&size=${size}`);
    const data = response.data.data;
    if (data && data.content) {
        return data.content;
    }
    return data || [];
};

const getAuditLogsByUser = async (userId: number): Promise<AuditLog[]> => {
    const response = await api.get(`${API_URL}/user/${userId}`);
    return response.data.data;
};

export const AuditLogService = {
    getAllAuditLogs,
    getAuditLogsByUser,
};