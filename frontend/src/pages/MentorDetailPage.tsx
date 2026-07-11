import React from 'react';
import { useParams } from 'react-router-dom';

const MentorDetailPage: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Mentor Details</h1>
      <p className="text-gray-600">Details for mentor ID: {mentorId}</p>
      <p className="text-gray-600 mt-2">This page is under construction.</p>
    </div>
  );
};

export default MentorDetailPage;
