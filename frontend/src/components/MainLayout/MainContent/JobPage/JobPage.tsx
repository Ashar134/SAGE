import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSavedJobs } from '../../../../contexts/SavedJobsContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { JobItemSkeleton, JobPageSkeleton } from '../../../Skeletons/Skeletons';
import './JobPage.css';

// ============================================================================
// TYPES
// ============================================================================

interface Job {
  id: number | string;
  title: string;
  company: string;
  location: string;
  posted: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  selectionProcess: string[];
  logoColor: string;
  logoText: string;
  saved?: boolean;
}

// Helper for date formatting
const formatPostedDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return '1d';
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
  return `${Math.floor(diffDays / 30)}mo`;
};

// ============================================================================
// COMPONENT
// ============================================================================

function JobPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { isSaved, toggleSaveJob } = useSavedJobs(); // Use the saved jobs context
  const [searchParams] = useSearchParams();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;

  // Fetch Jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/jobs/');
        const data = await response.json();

        if (data.success) {
          const mappedJobs: Job[] = data.jobs.map((apiJob: any) => {
            // Construct salary string
            const min = apiJob.salary_min ? Math.round(apiJob.salary_min / 1000) + 'k' : '';
            const max = apiJob.salary_max ? Math.round(apiJob.salary_max / 1000) + 'k' : '';
            const salaryObj = (min && max) ? `$${min} - $${max}` : (min ? `$${min}+` : 'Competitive');

            return {
              id: apiJob.id,
              title: apiJob.title,
              company: apiJob.company_name,
              location: apiJob.location,
              posted: formatPostedDate(apiJob.posted_date),
              type: (apiJob.job_type && apiJob.job_type.length > 0) ? apiJob.job_type[0] : 'Full-time',
              salary: salaryObj,
              description: apiJob.description,
              requirements: apiJob.requirements || [],
              responsibilities: apiJob.responsibilities || [],
              benefits: apiJob.benefits || [],
              selectionProcess: apiJob.selection_process || [],
              logoColor: apiJob.company?.logo_color || '#6366f1',
              logoText: apiJob.company?.logo_initial || apiJob.company_name.charAt(0).toUpperCase(),
              saved: false // Default to false until auth is fully linked
            };
          });

          setJobs(mappedJobs);

          // Check if there's a selectedJob parameter in URL
          const selectedJobId = searchParams.get('selectedJob');
          if (selectedJobId && mappedJobs.length > 0) {
            // Find the job with matching ID
            const jobToSelect = mappedJobs.find(job => String(job.id) === selectedJobId);
            if (jobToSelect) {
              setSelected(jobToSelect);
            } else {
              // If job not found, select first job
              setSelected(mappedJobs[0]);
            }
          } else if (mappedJobs.length > 0) {
            setSelected(mappedJobs[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchParams]);

  // Bookmark handler
  const handleBookmark = (e: React.MouseEvent, jobId: string | number) => {
    e.stopPropagation(); // Prevent triggering job selection

    // Check if we're unsaving the currently selected job on the saved tab
    const isCurrentlySelected = selected?.id === jobId;
    const isBeingUnsaved = isSaved(jobId);
    const isOnSavedTab = activeTab === 'saved';

    // Toggle the save state
    toggleSaveJob(jobId);

    // If we just unsaved the selected job while on saved tab, select another job
    if (isCurrentlySelected && isBeingUnsaved && isOnSavedTab) {
      // Find the next saved job (excluding the one we just unsaved)
      const remainingSavedJobs = jobs.filter(job => job.id !== jobId && isSaved(job.id));

      if (remainingSavedJobs.length > 0) {
        setSelected(remainingSavedJobs[0]);
      } else {
        setSelected(null); // No more saved jobs
      }
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'saved') return isSaved(job.id);
    return true;
  });

  const savedCount = jobs.filter(job => isSaved(job.id)).length;

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
      <div className='jobs-page'>
        <div className="job-header">
          <div>
            <h1 className="job-page-title">Find Your Dream Job</h1>
            <p className="job-page-subtitle">Browse available positions</p>
          </div>
          <div className="job-quote">
            <svg className="quote-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor" opacity="0.2" />
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor" opacity="0.2" />
            </svg>
            <div className="quote-content">
              <p className="quote-text">Choose a job you love, and you will never have to work a day in your life.</p>
              <p className="quote-author">— Confucius</p>
            </div>
          </div>
        </div>
        <JobPageSkeleton />
      </div>
    );
  }

  return (
    <div className='jobs-page'>
      <div className="job-header">
        <div>
          <h1 className="job-page-title">Find Your Dream Job</h1>
          <p className="job-page-subtitle">{jobs.length} recommended jobs for you</p>
        </div>
        <div className="job-quote">
          <svg className="quote-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor" opacity="0.2" />
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor" opacity="0.2" />
          </svg>
          <div className="quote-content">
            <p className="quote-text">Choose a job you love, and you will never have to work a day in your life.</p>
            <p className="quote-author">— Confucius</p>
          </div>
        </div>
      </div>

      {/* Tab Section */}
      <div className="job-tabs">
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('all');
            setCurrentPage(1);
            const firstRecommended = jobs[0];
            if (firstRecommended) setSelected(firstRecommended);
          }}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <span>All Jobs</span>
          <span className="tab-badge">{jobs.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('saved');
            setCurrentPage(1);
            const firstSaved = jobs.find(j => isSaved(j.id));
            if (firstSaved) setSelected(firstSaved);
            else setSelected(null);
          }}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Saved Jobs</span>
          <span className="tab-badge">{savedCount}</span>
        </button>
      </div>

      <div className="jobs-container">
        {/* List */}
        <div className="jobs-list">
          {loading ? (
            <>
              {[1, 2, 3, 4, 5].map(i => (
                <JobItemSkeleton key={i} />
              ))}
            </>
          ) : currentJobs.length > 0 ? (
            <>
              {currentJobs.map((job) => (
                <div
                  key={job.id}
                  className={`job-item ${selected?.id === job.id ? 'selected' : ''}`}
                  onClick={() => setSelected(job)}
                >
                  <div className="job-item-top">
                    <div className="job-logo" style={{ background: job.logoColor }}>
                      {job.logoText}
                    </div>
                    <div className="job-item-info">
                      <h3>{job.title}</h3>
                      <p className="company">{job.company}</p>
                    </div>
                    <button
                      className={`btn-bookmark ${isSaved(job.id) ? 'bookmarked' : ''}`}
                      onClick={(e) => handleBookmark(e, job.id)}
                      aria-label={isSaved(job.id) ? "Remove bookmark" : "Save job"}
                    >
                      <svg width="18" height="18" fill={isSaved(job.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                  <div className="job-item-meta">
                    <span>{job.location}</span>
                    <span>{job.posted}</span>
                  </div>
                  <div className="job-item-bottom">
                    <span className="salary">{job.salary}</span>
                    <span className="type">{job.type}</span>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
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
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}


            </>
          ) : (
            <div className="empty-state-jobs">
              <p>No jobs found</p>
            </div>
          )}
        </div>

        {/* Details */}
        {selected && (
          <div className="job-detail">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="detail-header">
                  <div className="detail-top">
                    <div className="detail-logo" style={{ background: selected.logoColor }}>
                      {selected.logoText}
                    </div>
                    <div>
                      <h1>{selected.title}</h1>
                      <p className="detail-company">{selected.company}</p>
                      <div className="detail-meta">
                        <span>{selected.location}</span>
                        <span>•</span>
                        <span>{selected.type}</span>
                        <span>•</span>
                        <span>Posted {selected.posted} ago</span>
                      </div>
                    </div>
                  </div>
                  <button className="apply-btn" onClick={() => {
                    if (authLoading) return;

                    if (!isAuthenticated) {
                      alert('Please login to apply for jobs');
                      window.location.href = 'http://localhost:8000/auth/';
                      return;
                    }
                    alert(`Applying for ${selected.title} at ${selected.company}!`);
                  }}>Apply Now</button>
                </div>

                <div className="detail-salary">
                  <span className="salary-label">Salary</span>
                  <span className="salary-value">{selected.salary}</span>
                </div>

                <div className="detail-section">
                  <h2>About the role</h2>
                  <p>{selected.description}</p>
                </div>

                <div className="detail-section">
                  <h2>Requirements</h2>
                  <ul>
                    {selected.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                {selected.responsibilities && selected.responsibilities.length > 0 && (
                  <div className="detail-section">
                    <h2>Job Responsibilities</h2>
                    <ul>
                      {selected.responsibilities.map((resp, i) => (
                        <li key={i}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.benefits && selected.benefits.length > 0 && (
                  <div className="detail-section">
                    <h2>Job Benefits</h2>
                    <ul>
                      {selected.benefits.map((benefit, i) => (
                        <li key={i}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.selectionProcess && selected.selectionProcess.length > 0 && (
                  <div className="detail-section">
                    <h2>Selection Process</h2>
                    <ul>
                      {selected.selectionProcess.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobPage;