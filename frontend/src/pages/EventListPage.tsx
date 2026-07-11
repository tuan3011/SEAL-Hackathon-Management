import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Filter, Search, CalendarOff, ArrowRight } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Input from '../components/ui/Input';

interface Event {
    id: number;
    name: string;
    slug: string;
    description: string;
    startTime: string;
    endTime: string;
    status: string;
    imageUrl: string;
}

const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <Link 
        to={`/events/${event.slug}`} 
        className="group flex flex-col bg-white rounded-xl border border-neutral-border overflow-hidden hover:border-brand-orange/40 hover:shadow-floating transition-all duration-300 ease-in-out transform hover:-translate-y-1"
    >
        <div className="relative h-48 overflow-hidden bg-neutral-base">
            <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" 
                src={event.imageUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800'} 
                alt={event.name} 
            />
            <div className="absolute top-4 right-4 z-10 shadow-sm">
                <StatusBadge status={event.status} />
            </div>
            {/* Soft dark overlay on top of image for smooth contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        </div>
        <div className="p-6 flex flex-col flex-grow space-y-4">
            <div className="space-y-2">
                <h3 className="text-headline-sm font-semibold text-brand-navy group-hover:text-brand-orange transition-colors duration-200 line-clamp-1">
                    {event.name}
                </h3>
                <p className="text-body-sm text-on-surface-variant line-clamp-3 leading-relaxed">
                    {event.description}
                </p>
            </div>
            
            <div className="pt-2 mt-auto">
                <div className="flex items-center text-label-md text-on-surface-variant font-semibold bg-neutral-base border border-neutral-divider px-3 py-2.5 rounded-lg">
                    <Calendar size={14} className="mr-2 text-brand-orange shrink-0" />
                    <span className="truncate">
                        {new Date(event.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} &ndash; {new Date(event.endTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </div>
            
            <div className="flex items-center justify-end text-label-md font-bold text-brand-orange pt-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0">
                <span>View Details</span>
                <ArrowRight size={14} className="ml-1" />
            </div>
        </div>
    </Link>
);

const EventListPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/hackathon-events');
                setEvents(response.data.data ?? []);
            } catch (err) {
                console.error('Failed to fetch events', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = useMemo(() => {
        const list = events.filter(event => {
            const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                   event.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter ? event.status === statusFilter : true;
            return matchesSearch && matchesStatus;
        });

        return list.sort((a, b) => {
            const order: { [key: string]: number } = {
                'IN_PROGRESS': 1,
                'PUBLISHED': 2,
                'COMPLETED': 3,
                'CANCELLED': 4
            };
            const aOrder = order[a.status] || 99;
            const bOrder = order[b.status] || 99;
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
            return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        });
    }, [events, searchTerm, statusFilter]);

    return (
        <div className="space-y-8 max-w-[1440px] mx-auto px-4 md:px-0 py-6">
            {/* Page Header and Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 md:p-8 border border-neutral-border rounded-xl shadow-floating">
                <div>
                    <h1 className="text-headline-lg font-bold text-brand-navy tracking-tight">Hackathons</h1>
                    <p className="text-body-sm text-on-surface-variant mt-1">Discover, join, and build innovative projects at upcoming hackathons.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    {/* Status Filter */}
                    <div className="relative w-full sm:w-56">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Filter size={16} />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-10 py-3 w-full bg-white border border-neutral-border rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 transition-all duration-200 appearance-none cursor-pointer font-medium"
                        >
                            <option value="">All Statuses</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="w-full sm:w-72">
                        <Input
                            type="text"
                            placeholder="Search hackathons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftIcon={<Search size={16} />}
                        />
                    </div>
                </div>
            </div>

            {/* List Results */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-neutral-border rounded-xl p-6 space-y-4">
                            <Skeleton className="h-40 w-full rounded-lg" />
                            <Skeleton className="h-6 w-3/4 rounded" />
                            <Skeleton className="h-4 w-5/6 rounded" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : filteredEvents.length === 0 ? (
                <EmptyState
                    icon={<CalendarOff size={48} className="text-brand-orange animate-bounce" />}
                    title="No Hackathons Found"
                    description={searchTerm || statusFilter ? "Adjust your search parameters or check a different category status filter to find active events." : "There are currently no hackathons scheduled. Check back later!"}
                    className="max-w-2xl mx-auto py-16 px-8 bg-white border border-neutral-border rounded-xl shadow-floating"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventListPage;
