import api from './api';

export interface Prize {
    id: number;
    name: string;
    description: string;
    hackathonEventId: number;
    trackId?: number;
    rank?: number;
    teamId?: number;
    teamName?: string;
}

export interface CreatePrizeRequest {
    name: string;
    description: string;
    hackathonEventId: number;
    trackId?: number;
    rank?: number;
}

export interface UpdatePrizeRequest {
    name: string;
    description: string;
    trackId?: number;
    rank?: number;
}

export interface AssignPrizeRequest {
    teamId: number;
}

const createPrize = async (prize: CreatePrizeRequest): Promise<Prize> => {
    const response = await api.post('/prizes', prize);
    return response.data;
};

const updatePrize = async (prizeId: number, prize: UpdatePrizeRequest): Promise<Prize> => {
    const response = await api.put(`/prizes/${prizeId}`, prize);
    return response.data;
};

const deletePrize = async (prizeId: number): Promise<void> => {
    await api.delete(`/prizes/${prizeId}`);
};

const assignPrizeToTeam = async (prizeId: number, request: AssignPrizeRequest): Promise<Prize> => {
    const response = await api.patch(`/prizes/${prizeId}/assign`, request);
    return response.data;
};

const getPrizesByEvent = async (hackathonEventId: number): Promise<Prize[]> => {
    const response = await api.get(`/prizes/event/${hackathonEventId}`);
    // If wrapped in ApiResponse
    return response.data.data || response.data;
};

const getPrizesByEventAndTrack = async (hackathonEventId: number, trackId: number): Promise<Prize[]> => {
    const response = await api.get(`/prizes/event/${hackathonEventId}/track/${trackId}`);
    return response.data.data || response.data;
};

export const PrizeService = {
    createPrize,
    updatePrize,
    deletePrize,
    assignPrizeToTeam,
    getPrizesByEvent,
    getPrizesByEventAndTrack
};