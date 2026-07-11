import api from './api';
import toast from 'react-hot-toast';

const downloadFile = (data: any, filename: string) => {
    const blob = data instanceof Blob ? data : new Blob([data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
};

const exportTeamsCsv = async () => {
    const response = await api.get('/export/teams/csv', { responseType: 'blob' });
    downloadFile(response.data, 'teams_export.csv');
};

const exportParticipantsCsv = async () => {
    const response = await api.get('/export/participants/csv', { responseType: 'blob' });
    downloadFile(response.data, 'participants_export.csv');
};

const exportRoundScoring = async (roundId: number) => {
    try {
        const response = await api.get(`/export/rounds/${roundId}/scoring`, { responseType: 'blob' });
        const contentDisposition = response.headers['content-disposition'];
        let filename = `round_${roundId}_scoring.csv`;
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) filename = match[1];
        }
        downloadFile(response.data, filename);
        toast.success("Scoring exported successfully");
    } catch (error) {
        console.error("Export failed:", error);
        toast.error("Failed to export scoring. You may not have permission.");
    }
};

const exportRoundRanking = async (roundId: number) => {
    try {
        const response = await api.get(`/export/rounds/${roundId}/ranking`, { responseType: 'blob' });
        const contentDisposition = response.headers['content-disposition'];
        let filename = `round_${roundId}_ranking.csv`;
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) filename = match[1];
        }
        downloadFile(response.data, filename);
        toast.success("Ranking exported successfully");
    } catch (error) {
        console.error("Export failed:", error);
        toast.error("Failed to export ranking.");
    }
};

const exportMyScores = async () => {
    try {
        const response = await api.get('/scores/my-scores/export', { responseType: 'blob' });
        downloadFile(response.data, 'my_scores.csv');
        toast.success("Scores exported successfully");
    } catch (error) {
        console.error("Export failed:", error);
        toast.error("Failed to export scores.");
    }
};

export const ExportService = {
    exportTeamsCsv,
    exportParticipantsCsv,
    exportRoundScoring,
    exportRoundRanking,
    exportMyScores,
};
