import api from './api';
import { Team } from './TeamService';
import { User } from './UserService';

export interface MentorshipRequest {
    id: number;
    team: Team;
    mentor: User | null;
    title: string;
    description: string;
    status: string;
    resolvedAt?: string;
    answer?: string;
    rejectReason?: string;
    mentorName?: string;
    createdAt: string;
}

export interface CreateMentorshipRequest {
    teamId: number;
    title: string;
    description: string;
}

const createRequest = async (request: CreateMentorshipRequest): Promise<MentorshipRequest> => {
    const response = await api.post('/mentorship-requests', request);
    return response.data.data;
};

const getOpenRequests = async (): Promise<MentorshipRequest[]> => {
    const response = await api.get('/mentorship-requests/open');
    return response.data.data;
};

const getMyRequests = async (): Promise<MentorshipRequest[]> => {
    const response = await api.get('/mentorship-requests/my-requests');
    return response.data.data;
};

const acceptRequest = async (id: number): Promise<MentorshipRequest> => {
    const response = await api.patch(`/mentorship-requests/${id}/accept`);
    return response.data.data;
};

const resolveRequest = async (id: number, payload: { answer: string }): Promise<MentorshipRequest> => {
    const response = await api.patch(`/mentorship-requests/${id}/resolve`, payload);
    return response.data.data;
};

const rejectRequest = async (id: number, payload: { reason: string }): Promise<MentorshipRequest> => {
    const response = await api.patch(`/mentorship-requests/${id}/reject`, payload);
    return response.data.data;
};

const cancelRequest = async (id: number): Promise<void> => {
    await api.delete(`/mentorship-requests/${id}`);
};

const releaseRequest = async (id: number): Promise<MentorshipRequest> => {
    const response = await api.patch(`/mentorship-requests/${id}/release`);
    return response.data.data;
};

export const MentorshipRequestService = {
    createRequest,
    getOpenRequests,
    getMyRequests,
    acceptRequest,
    resolveRequest,
    rejectRequest,
    cancelRequest,
    releaseRequest,
};
