import React from 'react';
import { useParams, Link } from 'react-router-dom';

const AdminMentorProfilePage: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/admin/pending-approvals" className="text-primary hover:underline font-semibold text-sm">
          &larr; Back to Approvals
        </Link>
      </div>
      <div className="bg-surface-container-lowest border border-neutral-border rounded-lg p-8 shadow-floating max-w-3xl">
        <h1 className="text-headline-lg font-bold text-on-surface mb-2">Mentor Management Profile</h1>
        <p className="text-body-md text-on-surface-variant mb-6">Admin view for Mentor ID: {mentorId}</p>
        <div className="border-t border-neutral-border pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-label-md text-on-surface-variant block">Full Name</span>
              <span className="text-body-md font-semibold text-on-surface">John Doe</span>
            </div>
            <div>
              <span className="text-label-md text-on-surface-variant block">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-active-bg text-status-active-text">
                Approved
              </span>
            </div>
          </div>
          <div className="flex space-x-4">
            <button className="bg-primary text-on-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary-container">
              Modify Assignment
            </button>
            <button className="bg-status-disqualified-bg text-status-disqualified-text px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-200">
              Revoke Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMentorProfilePage;
