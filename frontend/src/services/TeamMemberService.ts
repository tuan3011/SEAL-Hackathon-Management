import axios from 'axios';

const API_URL = '/team-members';

export interface TeamMember {
    id: number;
    userId: number;
    teamId: number;
    isLeader: boolean;
}

export interface AddTeamMemberRequest {
    userId: number;
    teamId: number;
    isLeader: boolean;
}

const addTeamMember = async (member: AddTeamMemberRequest): Promise<TeamMember> => {
    const response = await axios.post(API_URL, member, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getTeamMembers = async (teamId: number): Promise<TeamMember[]> => {
    const response = await axios.get(`${API_URL}/team/${teamId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const removeTeamMember = async (teamMemberId: number): Promise<void> => {
    await axios.delete(`${API_URL}/${teamMemberId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
};

export const TeamMemberService = {
    addTeamMember,
    getTeamMembers,
    removeTeamMember,
};
