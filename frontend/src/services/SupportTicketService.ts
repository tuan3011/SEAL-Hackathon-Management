import api from './api';

export interface CreateTicketRequest {
    fullName: string;
    email: string;
    message: string;
}

export interface SupportTicketResponse {
    id: number;
    fullName: string;
    email: string;
    message: string;
    status: 'PENDING' | 'RESOLVED';
    createdAt: string;
}

export const SupportTicketService = {
    createTicket: async (data: CreateTicketRequest): Promise<SupportTicketResponse> => {
        const response = await api.post('/support-tickets', data);
        return response.data.data;
    },

    getAllTickets: async (page: number = 0, size: number = 20): Promise<SupportTicketResponse[]> => {
        const response = await api.get('/support-tickets', {
            params: { page, size }
        });
        return response.data.data;
    },

    resolveTicket: async (id: number): Promise<SupportTicketResponse> => {
        const response = await api.patch(`/support-tickets/${id}/resolve`);
        return response.data.data;
    },

    replyTicket: async (id: number, replyMessage: string): Promise<SupportTicketResponse> => {
        const response = await api.patch(`/support-tickets/${id}/reply`, { replyMessage });
        return response.data.data;
    }
};
