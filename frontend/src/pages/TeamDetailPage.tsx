import React from 'react';
import { useParams } from 'react-router-dom';

const TeamDetailPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Team Details</h1>
      <p className="text-gray-600">Details for team ID: {teamId}</p>
      <p className="text-gray-600 mt-2">This page is under construction.</p>
    </div>
  );
};

export default TeamDetailPage;
