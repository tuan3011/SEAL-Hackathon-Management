import api from './api';
export interface JudgeAssignment {
    id: number;
    judgeId: number;
    teamId?: number;
    roundId: number;
    criterionId?: number;
    assignedAt: string;

    // Display fields from backend
    submissionId?: number;
    teamName?: string;
    roundName?: string;
    trackId?: number;
    trackName?: string;
    status?: string;
}
export interface JudgeAssignmentCreateRequest {
    judgeId: number;
    teamId?: number;
    roundId?: number;
    trackId?: number;
    submissionId?: number;
    criterionId?: number;
}
const getMyAssignments = async (): Promise<JudgeAssignment[]> => {
    const response = await api.get('/judge-assignments/my-assignments');
    return response.data.data;
};
const assignJudge = async (request: JudgeAssignmentCreateRequest): Promise<JudgeAssignment> => {
    const response = await api.post('/judge-assignments', request);
    return response.data.data;
};
export const JudgeAssignmentService = {
    getMyAssignments,
    assignJudge
};
