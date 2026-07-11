import api from './api';

const API_URL = '/hackathon-events';

export interface HackathonEvent {
    id: number;
    name: string;
    description: string;
    slug: string;
    status: string;
    startTime: string;
    endTime: string;
    registrationStart?: string;
    registrationEnd?: string;
    minTeamSize: number;
    maxTeamSize: number;
    organizerId?: number;
    organizerName?: string;
}

export interface CreateHackathonEventRequest {
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    registrationStart?: string;
    registrationEnd?: string;
    minTeamSize?: number;
    maxTeamSize?: number;
    organizerId?: number;
}

export interface UpdateHackathonEventRequest {
    name?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    registrationStart?: string;
    registrationEnd?: string;
    minTeamSize?: number;
    maxTeamSize?: number;
    organizerId?: number;
}

const createHackathonEvent = async (event: CreateHackathonEventRequest): Promise<HackathonEvent> => {
    const response = await api.post(API_URL, event);
    return response.data.data;
};

const getHackathonEvents = async (page: number = 0, size: number = 100): Promise<HackathonEvent[]> => {
    // Note: The backend returns a Page<HackathonEventResponse>. We extract .content
    const response = await api.get(`${API_URL}?page=${page}&size=${size}`);
    const data = response.data.data;
    if (data && data.content) {
        return data.content;
    }
    return data || [];
};

const getAllEventsForAdmin = async (page: number = 0, size: number = 100): Promise<HackathonEvent[]> => {
    const response = await api.get(`${API_URL}/admin/all?page=${page}&size=${size}`);
    const data = response.data.data;
    if (data && data.content) {
        return data.content;
    }
    return data || [];
};

const getHackathonEventBySlug = async (slug: string): Promise<HackathonEvent> => {
    const response = await api.get(`${API_URL}/${slug}`);
    return response.data.data;
};

const updateHackathonEvent = async (id: number, event: UpdateHackathonEventRequest): Promise<HackathonEvent> => {
    const response = await api.put(`${API_URL}/${id}`, event);
    return response.data.data;
};

const updateHackathonEventStatus = async (id: number, status: string): Promise<HackathonEvent> => {
    const response = await api.patch(`${API_URL}/${id}/status?status=${status}`);
    return response.data.data;
};

const deleteHackathonEvent = async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
};

export const HackathonEventService = {
    createHackathonEvent,
    getHackathonEvents,
    getAllEventsForAdmin,
    getHackathonEventBySlug,
    updateHackathonEvent,
    updateHackathonEventStatus,
    deleteHackathonEvent,
};
