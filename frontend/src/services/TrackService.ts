import axios from 'axios';

const API_URL = '/tracks';

export interface Track {
    id: number;
    name: string;
    description: string;
}

export interface CreateTrackRequest {
    name: string;
    description: string;
    hackathonEventId: number;
}

const createTrack = async (track: CreateTrackRequest): Promise<Track> => {
    const response = await axios.post(API_URL, track, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getTracksByHackathonEvent = async (hackathonEventId: number): Promise<Track[]> => {
    const response = await axios.get(`${API_URL}/hackathon/${hackathonEventId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

export const TrackService = {
    createTrack,
    getTracksByHackathonEvent,
};