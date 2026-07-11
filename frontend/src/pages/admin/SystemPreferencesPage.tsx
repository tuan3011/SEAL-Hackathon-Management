import React from 'react';

const SystemPreferencesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-headline-lg font-bold text-on-surface mb-6">System Preferences</h1>
      <p className="text-body-md text-on-surface-variant mb-6">
        Configure system-wide constants, deadline rules, and registration locks.
      </p>
      <div className="bg-surface-container-lowest border border-neutral-border rounded-lg p-6 shadow-floating max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-on-surface">Hackathon Name</label>
            <input
              type="text"
              defaultValue="SEAL Hackathon Management System"
              className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-on-surface ring-1 ring-inset ring-outline-variant focus:ring-2 focus:ring-primary sm:text-sm bg-surface-container-lowest"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface">Maximum Team Size</label>
            <input
              type="number"
              defaultValue={5}
              className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-on-surface ring-1 ring-inset ring-outline-variant focus:ring-2 focus:ring-primary sm:text-sm bg-surface-container-lowest"
            />
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest"
            />
            <label className="text-sm font-medium text-on-surface">Enable public registrations</label>
          </div>
          <div>
            <button className="bg-primary text-on-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary-container">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemPreferencesPage;
