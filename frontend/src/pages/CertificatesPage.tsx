import React from 'react';

const CertificatesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-headline-lg font-bold text-on-surface mb-6">Awards & Certificates</h1>
      <p className="text-body-md text-on-surface-variant mb-4">
        View and download your hackathon awards and participation certificates.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards */}
        <div className="bg-surface-container-lowest border border-neutral-border rounded-lg p-6 shadow-floating">
          <div className="h-40 bg-surface-container-low rounded-md flex items-center justify-center mb-4">
            <span className="text-label-lg text-on-surface-variant">Certificate Preview</span>
          </div>
          <h3 className="text-headline-sm font-semibold text-on-surface mb-2">SEAL Hackathon Participant</h3>
          <p className="text-body-sm text-on-surface-variant mb-4">Awarded for active participation in the SEAL program.</p>
          <button className="bg-primary text-on-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary-container">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificatesPage;
