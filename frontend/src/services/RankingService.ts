import api from './api';

const API_URL = '/rankings';

export interface Ranking {
    teamId: number;
    teamName: string;
    totalScore: number;
    rank: number;
}

const getRankingForRound = async (roundId: number): Promise<Ranking[]> => {
    const response = await api.get(`${API_URL}/round/${roundId}`);
    return response.data;
};

export const RankingService = {
    getRankingForRound,
};