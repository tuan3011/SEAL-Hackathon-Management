import api from './api';

export interface DashboardStats {
    activeTeams: number;
    submissionsReceived: number;
    pendingReviews: number;
    daysRemaining: number;
}

const getStats = async (): Promise<DashboardStats> => {
    // Adding hardcoded hackathonEventId=1 to match backend requirement
    const response = await api.get('/dashboard/stats?hackathonEventId=1');
    return response.data.data;
};

export const DashboardService = {
    getStats,
};
