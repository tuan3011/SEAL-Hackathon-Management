import axios from 'axios';

const API_URL = '/rounds';

export interface Round {
    id: number;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    gradingEndTime?: string;
    gradingEnded?: boolean;
}

export interface CreateRoundRequest {
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    hackathonEventId: number;
}

const createRound = async (round: CreateRoundRequest): Promise<Round> => {
    const response = await axios.post(API_URL, round, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getRoundsByHackathonEvent = async (hackathonEventId: number): Promise<Round[]> => {
    const response = await axios.get(`${API_URL}/hackathon/${hackathonEventId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

export const RoundService = {
    createRound,
    getRoundsByHackathonEvent,
};