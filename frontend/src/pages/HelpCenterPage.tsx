import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { SupportTicketService } from '../services/SupportTicketService';

const HelpCenterPage: React.FC = () => {
    const [supportName, setSupportName] = useState('');
    const [supportEmail, setSupportEmail] = useState('');
    const [supportMessage, setSupportMessage] = useState('');
    const [supportLoading, setSupportLoading] = useState(false);
    const [supportSuccess, setSupportSuccess] = useState(false);
    const [supportError, setSupportError] = useState('');

    const handleSupportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSupportLoading(true);
        setSupportSuccess(false);
        setSupportError('');

        try {
            await SupportTicketService.createTicket({
                fullName: supportName,
                email: supportEmail,
                message: supportMessage
            });
            setSupportSuccess(true);
            setSupportName('');
            setSupportEmail('');
            setSupportMessage('');
        } catch (error: any) {
            console.error('Support ticket error:', error);
            setSupportError('Failed to send message. Please try again.');
        } finally {
            setSupportLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full pt-20">
            <div className="mb-8">
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Help Center</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">We're here to help you with any questions or issues.</p>
            </div>

            <section className="py-6 w-full">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 border border-outline-variant shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-brand-orange"></div>
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-blue-50 text-primary mx-auto rounded-full flex items-center justify-center mb-4">
                            <Mail size={24} />
                        </div>
                        <h2 className="font-headline-md text-2xl font-bold text-brand-navy mb-2">Need Help?</h2>
                        <p className="text-on-surface-variant text-sm">
                            Our support team is available 24/7 to assist with your inquiries. Fill out the form below.
                        </p>
                    </div>
                    <form className="space-y-4" onSubmit={handleSupportSubmit}>
                        {supportSuccess && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium flex items-center gap-2">
                                <span>✅</span> Thank you! Your message has been sent. We will get back to you soon.
                            </div>
                        )}
                        {supportError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                                {supportError}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-label-md text-sm font-medium text-brand-navy mb-1.5">Full Name</label>
                                <input 
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                                    placeholder="Enter your name" 
                                    type="text" 
                                    required
                                    value={supportName}
                                    onChange={(e) => setSupportName(e.target.value)}
                                    disabled={supportLoading}
                                />
                            </div>
                            <div>
                                <label className="block font-label-md text-sm font-medium text-brand-navy mb-1.5">Email Address</label>
                                <input 
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                                    placeholder="student@fpt.edu.vn" 
                                    type="email" 
                                    required
                                    value={supportEmail}
                                    onChange={(e) => setSupportEmail(e.target.value)}
                                    disabled={supportLoading}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block font-label-md text-sm font-medium text-brand-navy mb-1.5">Message</label>
                            <textarea 
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none" 
                                placeholder="How can we help you?" 
                                rows={4}
                                required
                                value={supportMessage}
                                onChange={(e) => setSupportMessage(e.target.value)}
                                disabled={supportLoading}
                            ></textarea>
                        </div>
                        <button 
                            type="submit" 
                            disabled={supportLoading}
                            className={`w-full bg-primary-container text-on-primary py-3 rounded-lg font-label-lg font-medium hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 ${supportLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {supportLoading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default HelpCenterPage;
