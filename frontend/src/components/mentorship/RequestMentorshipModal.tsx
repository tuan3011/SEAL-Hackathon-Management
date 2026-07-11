import React from 'react';
import Modal from '../Modal';
import MentorshipRequestForm from './MentorshipRequestForm';

interface RequestMentorshipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const RequestMentorshipModal: React.FC<RequestMentorshipModalProps> = ({ isOpen, onClose, onSuccess }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose} // Note: Modal usually shouldn't be closed if submitting, but inner form handles disabled state. A robust modal might block onClose while submitting, but for now we rely on the user not clicking outside. Modal component might not support blocking onClose yet.
            title="Request Mentorship"
        >
            <div className="mt-2">
                <p className="text-sm text-gray-500 mb-6">
                    Fill out the form below. Your request will be broadcasted to all available mentors in your track.
                </p>
                
                <MentorshipRequestForm 
                    onSuccess={onSuccess} 
                    onCancel={onClose} 
                />
            </div>
        </Modal>
    );
};

export default RequestMentorshipModal;
