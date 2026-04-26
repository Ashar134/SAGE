import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSavedJobs } from '../../../../contexts/SavedJobsContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { JobItemSkeleton, JobPageSkeleton } from '../../../Skeletons/Skeletons';
import { formatRelativeTime } from '../../../../utils/timeUtils';
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
  postedDate: Date;
  type: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  selectionProcess: string[];
  logoColor: string;
  logoText: string;
  saved?: boolean;
  logoUrl?: string;
}


// ============================================================================
// COMPONENT
// ============================================================================

function JobPage() {
  const { isAuthenticated, loading: authLoading, accessToken } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { isSaved, toggleSaveJob } = useSavedJobs();
  const [searchParams] = useSearchParams();
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string | number>>(new Set());

  // Fetch applied jobs to disable Apply button
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!isAuthenticated || !accessToken) return;
      try {
        const response = await fetch('http://localhost:8000/api/applications/', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await response.json();
        if (data.success) {
          const appliedSet = new Set<string | number>();
          data.applications.forEach((app: any) => {
            if (app.status !== 'withdrawn') {
              if (app.job) appliedSet.add(app.job);
              if (app.job_id) appliedSet.add(app.job_id);
            }
          });
          setAppliedJobIds(appliedSet);
        }
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
      }
    };
    fetchAppliedJobs();
  }, [isAuthenticated, accessToken]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;

  // Interval to refresh relative times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prevJobs => prevJobs.map(job => ({
        ...job,
        posted: formatRelativeTime(new Date(job.postedDate))
      })));
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch Jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/jobs/');
        const data = await response.json();

        if (data.success) {
          const mappedJobs: Job[] = data.jobs.map((apiJob: any) => {
            const date = new Date(apiJob.posted_date);
            return {
              id: apiJob.id,
              title: apiJob.title,
              company: apiJob.company_name,
              location: apiJob.location,
              posted: formatRelativeTime(date),
              postedDate: date,
              type: (apiJob.job_type && apiJob.job_type.length > 0) ? apiJob.job_type[0] : 'Full-time',
              description: apiJob.description,
              requirements: apiJob.requirements || [],
              responsibilities: apiJob.responsibilities || [],
              benefits: apiJob.benefits || [],
              selectionProcess: apiJob.selection_process || [],
              logoColor: apiJob.company?.logo_color || '#6366f1',
              logoText: apiJob.company?.logo_initial || (apiJob.company_name ? apiJob.company_name.charAt(0).toUpperCase() : 'L'),
              logoUrl: apiJob.company?.logo_url,
              saved: false
            };
          });

          setJobs(mappedJobs);

          const selectedJobId = searchParams.get('selectedJob');
          if (selectedJobId && mappedJobs.length > 0) {
            const jobToSelect = mappedJobs.find(job => String(job.id) === selectedJobId);
            if (jobToSelect) {
              setSelected(jobToSelect);
            } else {
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
    e.stopPropagation();
    const isCurrentlySelected = selected?.id === jobId;
    const isBeingUnsaved = isSaved(jobId);
    const isOnSavedTab = activeTab === 'saved';
    toggleSaveJob(jobId);
    if (isCurrentlySelected && isBeingUnsaved && isOnSavedTab) {
      const remainingSavedJobs = jobs.filter(job => job.id !== jobId && isSaved(job.id));
      if (remainingSavedJobs.length > 0) {
        setSelected(remainingSavedJobs[0]);
      } else {
        setSelected(null);
      }
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'saved') return isSaved(job.id);
    return true;
  });

  const savedCount = jobs.filter(job => isSaved(job.id)).length;
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };


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

      <div className="job-tabs">
        <button className={`tab-button ${activeTab === 'all' ? 'active' : ''}`} onClick={() => { setActiveTab('all'); setCurrentPage(1); if (jobs[0]) setSelected(jobs[0]); }}>
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <span>All Jobs</span><span className="tab-badge">{jobs.length}</span>
        </button>
        <button className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => { setActiveTab('saved'); setCurrentPage(1); const firstSaved = jobs.find(j => isSaved(j.id)); setSelected(firstSaved || null); }}>
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          <span>Saved Jobs</span><span className="tab-badge">{savedCount}</span>
        </button>
      </div>

      <div className="jobs-container">
        <div className="jobs-list">
          {loading ? [1, 2, 3, 4, 5].map(i => <JobItemSkeleton key={i} />) :
            currentJobs.length > 0 ? (
              <>
                {currentJobs.map((job) => (
                  <div key={job.id} className={`job-item ${selected?.id === job.id ? 'selected' : ''}`} onClick={() => setSelected(job)}>
                    <div className="job-item-top">
                      <div className="job-logo" style={{ background: '#ffffff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
                        <img src={job.logoUrl || "/loop.png"} alt="Company Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div className="job-item-info"><h3>{job.title}</h3><p className="company">{job.company}</p></div>
                      <button className={`btn-bookmark ${isSaved(job.id) ? 'bookmarked' : ''}`} onClick={(e) => handleBookmark(e, job.id)}>
                        <svg width="18" height="18" fill={isSaved(job.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      </button>
                    </div>
                    <div className="job-item-meta"><span>{job.location}</span><span>{job.posted}</span></div>
                    <div className="job-item-bottom">
                      <span className="type">{job.type}</span>
                    </div>
                  </div>
                ))}
                {totalPages > 1 && (
                  <div className="pagination-wrapper">
                    <div className="pagination-divider"></div>
                    <div className="pagination">
                      <div className="pagination-pages">
                        {getPageNumbers().map((page, index) => (
                          <button key={index} className={`pagination-page ${page === currentPage ? 'active' : ''} ${page === '...' ? 'ellipsis' : ''}`} onClick={() => typeof page === 'number' && setCurrentPage(page)} disabled={page === '...'}>{page}</button>
                        ))}
                      </div>
                      <button className="pagination-btn pagination-next" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                        Next <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : <div className="empty-state-jobs"><p>No jobs found</p></div>}
        </div>

        {(() => {
          const liveSelected = jobs.find(j => j.id === selected?.id) || selected;
          return liveSelected && (
            <div className="job-detail">
              <AnimatePresence mode="wait">
                <motion.div key={liveSelected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <div className="detail-header">
                    <div className="detail-top">
                      <div className="detail-logo" style={{ background: '#ffffff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
                        <img src={liveSelected.logoUrl || "/loop.png"} alt="Company Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <h1>{liveSelected.title}</h1>
                        <p className="detail-company">{liveSelected.company}</p>
                        <div className="detail-meta"><span>{liveSelected.location}</span><span>•</span><span>{liveSelected.type}</span><span>•</span><span>Posted {liveSelected.posted}</span></div>
                      </div>
                    </div>
                    {(() => {
                      const hasApplied = appliedJobIds.has(liveSelected.id) || appliedJobIds.has(String(liveSelected.id));
                      return (
                        <div className="apply-btn-container">
                          <button className={`apply-btn ${hasApplied ? 'applied' : ''}`} disabled={isApplying || hasApplied} onClick={async () => {
                            if (!isAuthenticated) { alert('Please login to apply for jobs'); window.location.href = 'http://localhost:8000/auth/'; return; }
                            setIsApplying(true);
                            try {
                              const response = await fetch('http://localhost:8000/api/applications/', {
                                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                                body: JSON.stringify({ job_id: liveSelected.id })
                              });
                              const data = await response.json();
                              if (data.success) {
                                alert(`Successfully applied for ${liveSelected.title} at ${liveSelected.company}!`);
                                setAppliedJobIds(prev => { const next = new Set(prev); next.add(liveSelected.id); next.add(String(liveSelected.id)); return next; });
                              } else { alert(`Failed to apply: ${data.error || 'Unknown error'}`); }
                            } catch (error) { alert('An error occurred while applying.'); } finally { setIsApplying(false); }
                          }}>{hasApplied ? 'Already Applied' : (isApplying ? 'Applying...' : 'Apply Now')}</button>
                          {hasApplied && <span className="already-applied-text">You have already submitted an application for this role.</span>}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="detail-section"><h2>About the role</h2><p>{liveSelected.description}</p></div>
                  <div className="detail-section"><h2>Requirements</h2><ul>{liveSelected.requirements.map((req, i) => <li key={i}>{req}</li>)}</ul></div>
                  {liveSelected.responsibilities?.length > 0 && <div className="detail-section"><h2>Job Responsibilities</h2><ul>{liveSelected.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}</ul></div>}
                  {liveSelected.benefits?.length > 0 && <div className="detail-section"><h2>Job Benefits</h2><ul>{liveSelected.benefits.map((benefit, i) => <li key={i}>{benefit}</li>)}</ul></div>}
                  {liveSelected.selectionProcess?.length > 0 && <div className="detail-section"><h2>Selection Process</h2><ul>{liveSelected.selectionProcess.map((step, i) => <li key={i}>{step}</li>)}</ul></div>}
                </motion.div>
              </AnimatePresence>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default JobPage;