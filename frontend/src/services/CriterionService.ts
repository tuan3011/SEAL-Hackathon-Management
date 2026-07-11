import axios from 'axios';

const API_URL = '/criteria';

export interface Criterion {
    id: number;
    name: string;
    description: string;
    weight: number;
}

export interface CreateCriterionRequest {
    name: string;
    description: string;
    weight: number;
    hackathonEventId?: number;
}

export interface UpdateCriterionRequest {
    name?: string;
    description?: string;
    weight?: number;
}

const createCriterion = async (criterion: CreateCriterionRequest): Promise<Criterion> => {
    const response = await axios.post(API_URL, criterion, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getCriteriaForEvent = async (hackathonEventId: number): Promise<Criterion[]> => {
    const response = await axios.get(`${API_URL}/event/${hackathonEventId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getDefaultCriteria = async (): Promise<Criterion[]> => {
    const response = await axios.get(`${API_URL}/default`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const updateCriterion = async (id: number, criterion: UpdateCriterionRequest): Promise<Criterion> => {
    const response = await axios.put(`${API_URL}/${id}`, criterion, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const deleteCriterion = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
};

export const CriterionService = {
    createCriterion,
    getCriteriaForEvent,
    getDefaultCriteria,
    updateCriterion,
    deleteCriterion,
};
