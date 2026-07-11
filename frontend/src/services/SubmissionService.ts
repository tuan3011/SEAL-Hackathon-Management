import axios from 'axios';

const API_URL = '/submissions';

export interface Submission {
    id: number;
    content: string;
    teamId: number;
    roundId: number;
    submittedAt: string;
}

export interface CreateSubmissionRequest {
    content: string;
    teamId: number;
    roundId: number;
}

const createSubmission = async (submission: CreateSubmissionRequest): Promise<Submission> => {
    const response = await axios.post(API_URL, submission, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getSubmissionById = async (id: number): Promise<Submission> => {
    const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getSubmissionsByTeam = async (teamId: number): Promise<Submission[]> => {
    const response = await axios.get(`${API_URL}/team/${teamId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getSubmissionsByRound = async (roundId: number): Promise<Submission[]> => {
    const response = await axios.get(`${API_URL}/round/${roundId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

export const SubmissionService = {
    createSubmission,
    getSubmissionById,
    getSubmissionsByTeam,
    getSubmissionsByRound,
};