import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './HomePage.css';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Job {
    id: number;
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

interface SalaryFilter {
    type: string;
    value: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const daysAgo = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

const getDaysDifference = (date: Date): number => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ============================================================================
// MOCK DATA
// ============================================================================

const JOBS_DATA: Job[] = [
    {
        id: 1,
        title: 'Human Interface Designer',
        company: 'Apple',
        location: 'Cupertino, California',
        postedTime: 'Posted 30 days ago',
        createdAt: daysAgo(30),
        type: ['Full-Time', 'Flexible schedule'],
        description: 'Design intuitive and beautiful user interfaces for Apple products. Work with cutting-edge technology.',
        logoColor: '#000000',
        logoInitial: '',
        salaryMin: 150,
        salaryMax: 220,
        isRemote: false
    },
    {
        id: 2,
        title: 'Product Designer',
        company: 'Google',
        location: 'Mountain View, California',
        postedTime: 'Posted 5 mins ago',
        createdAt: new Date(),
        type: ['Full-time', 'Remote'],
        description: 'Create world-class product experiences for billions of users. Join our design team.',
        logoColor: '#4285f4',
        logoInitial: 'G',
        salaryMin: 120,
        salaryMax: 180,
        isRemote: true
    },
    {
        id: 3,
        title: 'Senior UX Designer',
        company: 'Meta',
        location: 'Menlo Park, California',
        postedTime: 'Posted 2 days ago',
        createdAt: daysAgo(2),
        type: ['Full-time', 'Hybrid'],
        description: 'Shape the future of social connection through innovative design solutions.',
        logoColor: '#0668E1',
        logoInitial: 'M',
        salaryMin: 130,
        salaryMax: 200,
        isRemote: false
    },
    {
        id: 4,
        title: 'UI/UX Designer',
        company: 'Netflix',
        location: 'Los Gatos, California',
        postedTime: 'Posted 1 week ago',
        createdAt: daysAgo(7),
        type: ['Full-time'],
        description: 'Design experiences that entertain millions worldwide. Be part of our creative team.',
        logoColor: '#E50914',
        logoInitial: 'N',
        salaryMin: 110,
        salaryMax: 160,
        isRemote: false
    },
    {
        id: 5,
        title: 'Interaction Designer',
        company: 'Airbnb',
        location: 'San Francisco, California',
        postedTime: 'Posted 3 days ago',
        createdAt: daysAgo(3),
        type: ['Full-time', 'Remote'],
        description: 'Design delightful experiences for travelers and hosts around the world.',
        logoColor: '#FF5A5F',
        logoInitial: 'A',
        salaryMin: 115,
        salaryMax: 170,
        isRemote: true
    },
    {
        id: 6,
        title: 'Visual Designer',
        company: 'Spotify',
        location: 'New York, New York',
        postedTime: 'Posted 5 days ago',
        createdAt: daysAgo(5),
        type: ['Full-time', 'Flexible schedule'],
        description: 'Create stunning visual designs for the world\'s leading music streaming platform.',
        logoColor: '#1DB954',
        logoInitial: 'S',
        salaryMin: 100,
        salaryMax: 150,
        isRemote: false
    }
];

const HERO_MESSAGES: HeroMessage[] = [
    {
        title: "Welcome back, Ashar!",
        subtitle: "Ready to take the next step in your career journey?",
        tag: "Dashboard"
    },
    {
        title: "12 New Opportunities",
        subtitle: "Matched to your skills and preferences",
        tag: "Recommended"
    },
    {
        title: "Your Profile is 95% Complete",
        subtitle: "Add certifications to reach 100%",
        tag: "Profile"
    }
];

// ============================================================================
// CHILD COMPONENTS
// ============================================================================

const HeroSection = ({ currentMessage }: { currentMessage: number }) => (
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
                    <span className="hero-tag">{HERO_MESSAGES[currentMessage].tag}</span>
                    <h1 className="hero-title">{HERO_MESSAGES[currentMessage].title}</h1>
                    <p className="hero-subtitle">{HERO_MESSAGES[currentMessage].subtitle}</p>
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
    salaryFilter,
    onFilterChange,
    onDateChange,
    onSalaryChange,
    onClearAll
}: {
    filters: FilterState;
    datePostFilter: string;
    salaryFilter: SalaryFilter;
    onFilterChange: (category: 'jobType' | 'remote', key: string) => void;
    onDateChange: (value: string) => void;
    onSalaryChange: (value: SalaryFilter) => void;
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
                    { key: 'fullTime', label: 'Full-time', count: 2 },
                    { key: 'internship', label: 'Internship', count: 0 },
                    { key: 'freelance', label: 'Freelance', count: 1 },
                    { key: 'volunteer', label: 'Volunteer', count: 0 }
                ].map(({ key, label, count }) => (
                    <label key={key} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.jobType[key as keyof typeof filters.jobType]}
                            onChange={() => onFilterChange('jobType', key)}
                        />
                        <span className="checkbox-text">
                            {label}
                            <span className="checkbox-count">{count}</span>
                        </span>
                    </label>
                ))}
            </div>
        </div>

        <div className="filter-group">
            <div className="filter-group-title">Salary Range</div>
            <div className="salary-range">
                {[
                    { type: 'under_1000', label: 'Under $1,000', value: 1000 },
                    { type: '1000_2500', label: '$1,000 - $2,500', value: 2500 },
                    { type: '2500_5000', label: '$2,500 - $5,000', value: 5000 },
                    { type: 'custom', label: 'Custom Range', value: salaryFilter.value }
                ].map(({ type, label, value }) => (
                    <label key={type} className="checkbox-label">
                        <input
                            type="radio"
                            name="salary"
                            checked={salaryFilter.type === type}
                            onChange={() => onSalaryChange({ type, value })}
                        />
                        <span className="checkbox-text">{label}</span>
                    </label>
                ))}
                <div className="range-slider-container">
                    <input
                        type="range"
                        className="range-slider"
                        min="0"
                        max="5000"
                        step="100"
                        disabled={salaryFilter.type !== 'custom'}
                        value={salaryFilter.type === 'custom' ? salaryFilter.value : 5000}
                        onChange={(e) => onSalaryChange({ type: 'custom', value: Number(e.target.value) })}
                    />
                    <div className="range-labels">
                        <span>$0</span>
                        <span className="range-value">${salaryFilter.type === 'custom' ? salaryFilter.value.toLocaleString() : '5,000'}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="filter-group">
            <div className="filter-group-title">Work Location</div>
            <div className="checkbox-group">
                {[
                    { key: 'site', label: 'On-site', count: 2 },
                    { key: 'hybrid', label: 'Hybrid', count: 0 },
                    { key: 'remote', label: 'Remote', count: 1 }
                ].map(({ key, label, count }) => (
                    <label key={key} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.remote[key as keyof typeof filters.remote]}
                            onChange={() => onFilterChange('remote', key)}
                        />
                        <span className="checkbox-text">
                            {label}
                            <span className="checkbox-count">{count}</span>
                        </span>
                    </label>
                ))}
            </div>
        </div>
    </aside>
);

const JobCard = ({ job, onBookmark, isBookmarked, onApply }: {
    job: Job;
    onBookmark: (id: number) => void;
    isBookmarked: boolean;
    onApply: (job: Job) => void;
}) => {
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

            {/* Job Title */}
            <h3 className="job-title">{job.title}</h3>

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

            {/* Salary and Location */}
            <div className="job-footer-info">
                <div className="salary-location">
                    {job.salaryMin && job.salaryMax && (
                        <span className="salary">${job.salaryMin}k - ${job.salaryMax}k</span>
                    )}
                    <span className="location">{formatLocation(job.location)}</span>
                </div>
            </div>

            {/* Apply Button */}
            <button
                className="btn-apply"
                onClick={() => onApply(job)}
            >
                Apply now
            </button>
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
    datePostFilter: string,
    salaryFilter: SalaryFilter
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

        // Salary filter
        const matchesSalary = salaryFilter.type === 'all' || (() => {
            if (salaryFilter.type === 'custom') {
                return job.salaryMin !== undefined && job.salaryMin <= salaryFilter.value;
            }
            if (salaryFilter.type === 'under_1000') {
                return job.salaryMax !== undefined && job.salaryMax < 1000;
            }
            if (salaryFilter.type === '1000_2500') {
                return job.salaryMin !== undefined && job.salaryMax !== undefined &&
                    job.salaryMin >= 1000 && job.salaryMax <= 2500;
            }
            if (salaryFilter.type === '2500_5000') {
                return job.salaryMin !== undefined && job.salaryMax !== undefined &&
                    job.salaryMin >= 2500 && job.salaryMax <= 5000;
            }
            return true;
        })();

        return matchesSearch && matchesLocation && matchesJobType && matchesRemote && matchesDate && matchesSalary;
    });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function HomePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [locationTerm, setLocationTerm] = useState('');
    const [datePostFilter, setDatePostFilter] = useState('Anytime');
    const [salaryFilter, setSalaryFilter] = useState<SalaryFilter>({ type: 'all', value: 5000 });
    const [currentMessage, setCurrentMessage] = useState(0);
    const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<number>>(new Set());
    const [filters, setFilters] = useState<FilterState>({
        jobType: { fullTime: false, internship: false, freelance: false, volunteer: false },
        remote: { site: false, hybrid: false, remote: false }
    });

    // Auto-rotate hero messages
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % HERO_MESSAGES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

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
        setSalaryFilter({ type: 'all', value: 5000 });
        setFilters({
            jobType: { fullTime: false, internship: false, freelance: false, volunteer: false },
            remote: { site: false, hybrid: false, remote: false }
        });
    };

    // Bookmark handlers
    const handleBookmark = (jobId: number) => {
        setBookmarkedJobs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(jobId)) {
                newSet.delete(jobId);
            } else {
                newSet.add(jobId);
            }
            return newSet;
        });
    };

    const handleApply = (job: Job) => {
        alert(`Applying for ${job.title} at ${job.company}!\n\nThis would redirect to the application page.`);
        // In a real app, this would navigate to an application form or external URL
    };

    // Filter jobs
    const filteredJobs = useJobFiltering(
        JOBS_DATA,
        searchTerm,
        locationTerm,
        filters,
        datePostFilter,
        salaryFilter
    );

    return (
        <div className="home-page">
            <HeroSection currentMessage={currentMessage} />
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
                    salaryFilter={salaryFilter}
                    onFilterChange={handleFilterChange}
                    onDateChange={setDatePostFilter}
                    onSalaryChange={setSalaryFilter}
                    onClearAll={handleClearAll}
                />

                <section className="job-list-section">
                    <div className="results-header">
                        <h2 className="results-count">
                            <span className="count-number"></span> Recommended Jobs
                        </h2>
                    </div>

                    <div className="job-list">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map(job => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    onBookmark={handleBookmark}
                                    isBookmarked={bookmarkedJobs.has(job.id)}
                                    onApply={handleApply}
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
                </section>
            </div>
        </div>
    );
}

export default HomePage;
