import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSavedJobs } from '../../../contexts/SavedJobsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { JobCardSkeleton } from '../../Skeletons/Skeletons';

import './HomePage.css';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Job {
    id: number | string;
    title: string;
    company: string;
    location: string;
    postedTime: string;
    createdAt: Date;
    type: string[];
    description: string;
    bullets?: string[];
    salary?: string;
    salaryMin?: number;
    salaryMax?: number;
    logoColor: string;
    logoInitial: string;
    isRemote?: boolean;
}

interface HeroMessage {
    title: string;
    subtitle: string;
    tag: string;
}

interface FilterState {
    jobType: {
        fullTime: boolean;
        internship: boolean;
        freelance: boolean;
        volunteer: boolean;
    };
    remote: {
        site: boolean;
        hybrid: boolean;
        remote: boolean;
    };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
};

const getDaysDifference = (date: Date): number => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ============================================================================
// DYNAMIC HERO MESSAGES (No static data)
// ============================================================================

// ============================================================================
// CHILD COMPONENTS
// ============================================================================

const HeroSection = ({
    currentMessage,
    heroMessages
}: {
    currentMessage: number;
    heroMessages: HeroMessage[];
}) => (
    <section className="hero-section">
        <div className="hero-content">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMessage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <span className="hero-tag">{heroMessages[currentMessage]?.tag}</span>
                    <h1 className="hero-title">{heroMessages[currentMessage]?.title}</h1>
                    <p className="hero-subtitle">{heroMessages[currentMessage]?.subtitle}</p>
                </motion.div>
            </AnimatePresence>
        </div>
        <div className="hero-graphics">
            <div className="shape shape-green"></div>
            <div className="shape shape-black"></div>
            <div className="shape shape-yellow"></div>
        </div>
    </section>
);

const SearchBar = ({
    searchTerm,
    locationTerm,
    onSearchChange,
    onLocationChange
}: {
    searchTerm: string;
    locationTerm: string;
    onSearchChange: (value: string) => void;
    onLocationChange: (value: string) => void;
}) => (
    <div className="search-bar-container">
        <div className="search-bar">
            <div className="input-group">
                <svg className="input-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search job title or keyword"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="input-group">
                <svg className="input-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Country or timezone"
                    className="search-input"
                    value={locationTerm}
                    onChange={(e) => onLocationChange(e.target.value)}
                />
            </div>
            <button className="btn-find">
                <span>Find jobs</span>

            </button>
        </div>
    </div>
);

const FilterSidebar = ({
    filters,
    datePostFilter,
    onFilterChange,
    onDateChange,
    onClearAll
}: {
    filters: FilterState;
    datePostFilter: string;
    onFilterChange: (category: 'jobType' | 'remote', key: string) => void;
    onDateChange: (value: string) => void;
    onClearAll: () => void;
}) => (
    <aside className="filters-sidebar">
        <div className="filter-header">
            <h2 className="filter-title">Filters</h2>
            <button className="filter-clear" onClick={onClearAll}>Clear all</button>
        </div>

        <div className="filter-group">
            <div className="filter-group-title">Date Posted</div>
            <select className="select-input" value={datePostFilter} onChange={(e) => onDateChange(e.target.value)}>
                <option value="Anytime">Anytime</option>
                <option value="Today">Today</option>
                <option value="Yesterday">Last 2 days</option>
            </select>
        </div>

        <div className="filter-group">
            <div className="filter-group-title">Job Type</div>
            <div className="checkbox-group">
                {[
                    { key: 'fullTime', label: 'Full-time' },
                    { key: 'internship', label: 'Internship' },
                    { key: 'freelance', label: 'Freelance' },
                    { key: 'volunteer', label: 'Volunteer' }
                ].map(({ key, label }) => (
                    <label key={key} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.jobType[key as keyof typeof filters.jobType]}
                            onChange={() => onFilterChange('jobType', key)}
                        />
                        <span className="checkbox-text">
                            {label}
                        </span>
                    </label>
                ))}
            </div>
        </div>

        <div className="filter-group">
            <div className="filter-group-title">Work Location</div>
            <div className="checkbox-group">
                {[
                    { key: 'site', label: 'On-site' },
                    { key: 'hybrid', label: 'Hybrid' },
                    { key: 'remote', label: 'Remote' }
                ].map(({ key, label }) => (
                    <label key={key} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.remote[key as keyof typeof filters.remote]}
                            onChange={() => onFilterChange('remote', key)}
                        />
                        <span className="checkbox-text">
                            {label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    </aside>
);

const JobCard = ({ job, onBookmark, isBookmarked }: {
    job: Job;
    onBookmark: (id: number | string) => void;
    isBookmarked: boolean;
}) => {
    const navigate = useNavigate();
    const formatLocation = (location: string) => {
        const parts = location.split(',').map(p => p.trim());
        if (parts.length >= 2) {
            return `${parts[0]}, ${parts[parts.length - 1]}`;
        }
        return location;
    };

    return (
        <div className="job-card">
            {/* Card Header with Logo and Bookmark */}
            <div className="job-card-top">
                <div className="company-logo-wrapper">
                    <div className="company-logo" style={{ backgroundColor: job.logoColor }}>
                        {job.logoInitial ? (
                            <span style={{ color: '#ffffff' }}>{job.logoInitial}</span>
                        ) : (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                        )}
                    </div>
                </div>
                <button
                    className={`btn-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={() => onBookmark(job.id)}
                    aria-label={isBookmarked ? "Remove bookmark" : "Save job"}
                >
                    <svg width="18" height="18" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="bookmark-text">{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
            </div>

            {/* Company Name and Posted Time */}
            <div className="job-meta-top">
                <span className="company-name">{job.company}</span>
                <span className="posted-time">{job.postedTime.replace('Posted ', '')}</span>
            </div>

            {/* Job Title - Clickable */}
            <h3
                className="job-title"
                onClick={() => navigate(`/jobs?selectedJob=${job.id}`)}
                style={{ cursor: 'pointer' }}
            >
                {job.title}
            </h3>

            {/* Job Tags */}
            <div className="job-tags">
                {job.type.map((type, index) => (
                    <span key={index} className="job-tag">
                        {type}
                    </span>
                ))}
            </div>

            {/* Spacer for layout */}
            <div className="card-spacer"></div>

            {/* Location and Salary */}
            <div className="job-footer-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="location">{formatLocation(job.location)}</span>
                {job.salary && <span className="salary" style={{ fontWeight: 600, color: '#10b981', fontSize: '14px' }}>{job.salary}</span>}
            </div>

        </div>
    );
};

// ============================================================================
// FILTERING LOGIC
// ============================================================================

const useJobFiltering = (
    jobs: Job[],
    searchTerm: string,
    locationTerm: string,
    filters: FilterState,
    datePostFilter: string
) => {
    return jobs.filter(job => {
        // Search filter
        const matchesSearch = !searchTerm ||
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase());

        // Location filter
        const matchesLocation = !locationTerm ||
            job.location.toLowerCase().includes(locationTerm.toLowerCase());

        // Job type filter
        const jobTypeFiltersActive = Object.values(filters.jobType).some(Boolean);
        const matchesJobType = !jobTypeFiltersActive || (() => {
            const selectedTypes: string[] = [];
            if (filters.jobType.fullTime) selectedTypes.push('Full-time');
            if (filters.jobType.internship) selectedTypes.push('Internship');
            if (filters.jobType.freelance) selectedTypes.push('Freelance');
            if (filters.jobType.volunteer) selectedTypes.push('Volunteer');
            return job.type.some(t => selectedTypes.includes(t));
        })();

        // Remote filter
        const remoteFiltersActive = Object.values(filters.remote).some(Boolean);
        const matchesRemote = !remoteFiltersActive || (() => {
            const isJobRemote = job.isRemote || job.location.toLowerCase().includes('remote');
            const isJobSite = !isJobRemote;
            return (filters.remote.remote && isJobRemote) || (filters.remote.site && isJobSite);
        })();

        // Date filter
        const matchesDate = datePostFilter === 'Anytime' || (() => {
            const diffDays = getDaysDifference(job.createdAt);
            return datePostFilter === 'Today' ? diffDays <= 1 : diffDays <= 2;
        })();

        return matchesSearch && matchesLocation && matchesJobType && matchesRemote && matchesDate;
    });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

import { useNavigate } from 'react-router-dom';

function HomePage() {
    const { login, user, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [locationTerm, setLocationTerm] = useState('');

    // Redirect to onboarding if not onboarded
    useEffect(() => {
        if (user && user.is_onboarded === false) {
            navigate('/onboarding');
        }
    }, [user, navigate]);
    const [datePostFilter, setDatePostFilter] = useState('Anytime');
    const [currentMessage, setCurrentMessage] = useState(0);
    const { isSaved, toggleSaveJob } = useSavedJobs();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 8;
    const [filters, setFilters] = useState<FilterState>({
        jobType: { fullTime: false, internship: false, freelance: false, volunteer: false },
        remote: { site: false, hybrid: false, remote: false }
    });
    const [heroMessages, setHeroMessages] = useState<HeroMessage[]>([
        {
            title: "Welcome back!",
            subtitle: "Ready to take the next step in your career journey?",
            tag: "Dashboard"
        },
        {
            title: "New Opportunities",
            subtitle: "Matched to your skills and preferences",
            tag: "Recommended"
        },
        {
            title: "Your Career Story Begins Here",
            subtitle: "Discover jobs matched to your skills and goals",
            tag: "Profile"
        }

    ]);

    // Load User Data and update hero messages
    useEffect(() => {
        // Check for user_data and tokens from external auth (redirect from backend login)
        const params = new URLSearchParams(window.location.search);
        const userDataStr = params.get('user_data');
        const accessToken = params.get('access_token');

        if (userDataStr && accessToken) {
            try {
                const userData = JSON.parse(decodeURIComponent(userDataStr));

                // Use AuthContext to login (sets memory token)
                login(userData, decodeURIComponent(accessToken));

                // Clear query string to hide data
                window.history.replaceState({}, document.title, window.location.pathname);

                return;
            } catch (e) {
                console.error("Failed to parse auth data from URL:", e);
            }
        }

        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && user.first_name) {
            // Update hero messages dynamically with user's name
            setHeroMessages(prev => [
                {
                    ...prev[0],
                    title: `Welcome back, ${user.first_name}!`
                },
                prev[1],
                prev[2]
            ]);
        }
    }, [login]);

    // Fetch Jobs from API
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/jobs/');
                const data = await response.json();

                if (data.success) {
                    const mappedJobs: Job[] = data.jobs.map((apiJob: any) => {
                        const minStr = apiJob.salary_min ? Math.round(apiJob.salary_min / 1000) + 'k' : '';
                        const maxStr = apiJob.salary_max ? Math.round(apiJob.salary_max / 1000) + 'k' : '';
                        const salaryStr = (minStr && maxStr) ? `$${minStr} - $${maxStr}` : (minStr ? `$${minStr}+` : 'Not specified');

                        return {
                            id: apiJob.id,
                            title: apiJob.title,
                            company: apiJob.company_name,
                            location: apiJob.location,
                            postedTime: formatTimeAgo(new Date(apiJob.posted_date)),
                            createdAt: new Date(apiJob.posted_date),
                            type: apiJob.job_type || [],
                            description: apiJob.description,
                            bullets: apiJob.requirements,
                            salary: salaryStr !== 'Not specified' ? salaryStr : undefined,
                            salaryMin: apiJob.salary_min ? apiJob.salary_min / 1000 : undefined,
                            salaryMax: apiJob.salary_max ? apiJob.salary_max / 1000 : undefined,
                            logoColor: apiJob.company?.logo_color || '#6366f1',
                            logoInitial: apiJob.company?.logo_initial || apiJob.company_name.charAt(0),
                            isRemote: apiJob.is_remote
                        };
                    });
                    setJobs(mappedJobs);
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
                // No static fallback - show error state to user
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Update hero messages with job count
    useEffect(() => {
        if (jobs.length > 0) {
            setHeroMessages(prev => {
                const updatedMessages = [...prev];
                updatedMessages[1] = {
                    ...updatedMessages[1],
                    title: `${jobs.length} New Opportunities`
                };
                return updatedMessages;
            });
        }
    }, [jobs]);

    // Auto-rotate hero messages
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % heroMessages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [heroMessages]);

    const handleFilterChange = (category: 'jobType' | 'remote', key: string) => {
        setFilters(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key as keyof typeof prev[typeof category]]
            }
        }));
    };

    const handleClearAll = () => {
        setSearchTerm('');
        setLocationTerm('');
        setDatePostFilter('Anytime');
        setCurrentPage(1);
        setFilters({
            jobType: { fullTime: false, internship: false, freelance: false, volunteer: false },
            remote: { site: false, hybrid: false, remote: false }
        });
    };

    // Bookmark handlers
    const handleBookmark = (jobId: string | number) => {
        toggleSaveJob(jobId);
    };

    // Filter jobs
    const filteredJobs = useJobFiltering(
        jobs,
        searchTerm,
        locationTerm,
        filters,
        datePostFilter
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, locationTerm, filters, datePostFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const currentJobs = filteredJobs.slice(startIndex, endIndex);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    // Show skeleton with login banner for unauthenticated users
    if (!isAuthenticated && !authLoading) {
        return (
            <div className="home-page">
                <HeroSection currentMessage={currentMessage} heroMessages={heroMessages} />
                <SearchBar
                    searchTerm={searchTerm}
                    locationTerm={locationTerm}
                    onSearchChange={setSearchTerm}
                    onLocationChange={setLocationTerm}
                />
                <div className="main-layout">
                    <FilterSidebar
                        filters={filters}
                        datePostFilter={datePostFilter}
                        onFilterChange={handleFilterChange}
                        onDateChange={setDatePostFilter}
                        onClearAll={handleClearAll}
                    />
                    <section className="job-list-section">
                        <div className="results-header">
                            <h2 className="results-count">
                                <span className="count-number">--</span> Recommended Jobs
                            </h2>
                        </div>
                        <div className="job-list">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <JobCardSkeleton key={i} />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <HeroSection currentMessage={currentMessage} heroMessages={heroMessages} />
            <SearchBar
                searchTerm={searchTerm}
                locationTerm={locationTerm}
                onSearchChange={setSearchTerm}
                onLocationChange={setLocationTerm}
            />

            <div className="main-layout">
                <FilterSidebar
                    filters={filters}
                    datePostFilter={datePostFilter}
                    onFilterChange={handleFilterChange}
                    onDateChange={setDatePostFilter}
                    onClearAll={handleClearAll}
                />

                <section className="job-list-section">
                    <div className="results-header">
                        <h2 className="results-count">
                            <span className="count-number">{filteredJobs.length}</span> Recommended Jobs
                        </h2>
                    </div>

                    <div className="job-list">
                        {loading ? (
                            <>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <JobCardSkeleton key={i} />
                                ))}
                            </>
                        ) : currentJobs.length > 0 ? (
                            currentJobs.map(job => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    onBookmark={handleBookmark}
                                    isBookmarked={isSaved(job.id)}
                                />
                            ))
                        ) : (
                            <div className="no-results">
                                <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3>No jobs found</h3>
                                <p>Try adjusting your filters or search criteria</p>
                                <button className="btn-reset" onClick={handleClearAll}>Reset Filters</button>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {!loading && totalPages > 1 && (
                        <div className="pagination-wrapper">
                            <div className="pagination-divider"></div>
                            <div className="pagination">
                                <div className="pagination-pages">
                                    {getPageNumbers().map((page, index) => (
                                        <button
                                            key={index}
                                            className={`pagination-page ${page === currentPage ? 'active' : ''} ${page === '...' ? 'ellipsis' : ''}`}
                                            onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                            disabled={page === '...'}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className="pagination-btn pagination-next"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}


                </section>
            </div>
        </div>
    );
}

export default HomePage;
