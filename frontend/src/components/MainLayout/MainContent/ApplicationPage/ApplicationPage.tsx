import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiDotsVertical, HiChevronDown } from 'react-icons/hi';
import { useAuth } from '../../../../contexts/AuthContext';
import { ApplicationPageSkeleton } from '../../../Skeletons/Skeletons';
import './ApplicationPage.css';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Application {
  id: string; // UUID from database
  jobId: string; // Job UUID for test generation
  jobTitle: string;
  company: string;
  logoColor: string;
  logoInitial: string;
  appliedDate: string;
  salary: string;
  location: string;
  status: 'applied' | 'reviewing' | 'interview' | 'offer' | 'rejected' | 'test' | 'accepted' | 'withdrawn';
  interviewType?: 'interview' | 'test'; // Optional field for interview stage
  interviewDate?: string; // ISO string from database
  offerDeadline?: string; // ISO string from database
  testDeadline?: string; // ISO string from database
  interviewDeadline?: string; // 2-day deadline after passing test
  testScore?: number | null;
  logoUrl?: string;
}

type StatusColumn = {
  id: string;
  title: string;
  color: string;
};

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_COLUMNS: StatusColumn[] = [
  { id: 'applied', title: 'Applied', color: '#6366f1' },
  { id: 'test', title: 'Assessments', color: '#f59e0b' },
  { id: 'interview', title: 'Interview', color: '#8b5cf6' },
  { id: 'reviewing', title: 'Under Review', color: '#0ea5e9' },
  { id: 'offer', title: 'Offer', color: '#10b981' },
  { id: 'rejected', title: 'Rejected', color: '#ef4444' }
];

const API_BASE_URL = 'http://localhost:8000/api';

// ============================================================================
// CHILD COMPONENTS
// ============================================================================

const ApplicationCard = ({
  application,
  onStatusUpdate,
  onDelete
}: {
  application: Application;
  onStatusUpdate: (appId: string, newStatus: string) => void;
  onDelete: (appId: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      className="app-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        // If it's an offer, maybe clicking the card should do something else, 
        // but for now we follow the user's request for the three dots.
      }}
      style={{ position: 'relative' }}
    >
      <div className="app-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="app-logo" style={{ backgroundColor: '#ffffff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
          <img src={application.logoUrl || "/loop.png"} alt="Company Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div className="card-options-container" style={{ position: 'relative' }}>
          <button
            className="dots-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px'
            }}
          >
            <HiDotsVertical size={18} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                className="options-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  borderRadius: '8px',
                  padding: '8px',
                  zIndex: 10,
                  minWidth: '150px',
                  border: '1px solid #eee'
                }}
              >
                {application.status === 'offer' ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusUpdate(application.id, 'accepted');
                        setShowMenu(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#666',
                        fontWeight: 600,
                        borderRadius: '4px',
                        display: 'block'
                      }}
                    >
                      Accept Offer
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusUpdate(application.id, 'rejected');
                        setShowMenu(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#666',
                        fontWeight: 600,
                        borderRadius: '4px',
                        display: 'block'
                      }}
                    >
                      Reject Offer
                    </button>
                  </>
                ) : (
                  (application.status === 'applied' || (application.status === 'test' && (application.testScore === null || application.testScore === undefined))) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to withdraw this application?')) {
                          onStatusUpdate(application.id, 'withdrawn');
                        }
                        setShowMenu(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#666',
                        borderRadius: '4px',
                        display: 'block'
                      }}
                    >
                      Withdraw
                    </button>
                  )
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/jobs?selectedJob=${application.jobId}`;
                    setShowMenu(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#666',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                >
                  View Details
                </button>
                {(application.status === 'applied' || (application.status === 'test' && (application.testScore === null || application.testScore === undefined))) && (
                  <>
                    <div style={{ height: '1px', background: '#eee', margin: '4px 0' }} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(application.id);
                        setShowMenu(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#ef4444',
                        fontWeight: 600,
                        borderRadius: '4px',
                        display: 'block'
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <h3 className="app-title">{application.jobTitle}</h3>
      <p className="app-company">{application.company}</p>
      <div className="app-meta">
        <span>{application.location}</span>
      </div>
      <div className="app-footer">
        <span className="app-date">{application.appliedDate}</span>
      </div>
    </motion.div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Convert database timestamp to relative time (e.g., "2 days ago")
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 14) return '1 week ago';
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 60) return '1 month ago';
  return `${Math.floor(diffInDays / 30)} months ago`;
};

// Check if interview type indicates a test
const isTestInterview = (interviewType: string | null): boolean => {
  if (!interviewType) return false;
  return ['test', 'assessment'].includes(interviewType);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Helper component for interview action button with deadline logic
const InterviewActionButton = ({ app }: { app: Application }) => {
  const deadlineExpired = app.interviewDeadline
    ? new Date() > new Date(app.interviewDeadline)
    : false;
  const hoursLeft = app.interviewDeadline
    ? Math.max(0, Math.ceil((new Date(app.interviewDeadline).getTime() - Date.now()) / (1000 * 60 * 60)))
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {app.interviewDeadline && (deadlineExpired || (hoursLeft !== null && hoursLeft < 24)) && (
        <div style={{
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 6,
          textAlign: 'center',
          background: deadlineExpired ? '#fee2e2' : '#fef3c7',
          color: deadlineExpired ? '#dc2626' : '#d97706',
          fontWeight: 600,
        }}>
          {deadlineExpired
            ? '⛔ Deadline passed'
            : `⚠ ${hoursLeft}h left to interview`}
        </div>
      )}
      <button
        className="action-btn primary w-full flex items-center justify-center gap-2"
        disabled={deadlineExpired}
        style={deadlineExpired ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        onClick={(e) => {
          e.stopPropagation();
          if (!deadlineExpired) window.location.href = `/interview?application_id=${app.id}`;
        }}
      >
        {deadlineExpired ? 'Deadline Passed' : 'Start Interview'}
      </button>
    </div>
  );
};

function ApplicationPage() {
  const { accessToken, isAuthenticated, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [calendarOffset, setCalendarOffset] = useState<number>(0);
  const [showMonthDropdown, setShowMonthDropdown] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch applications from the database
  useEffect(() => {
    const fetchApplications = async () => {
      // Don't do anything if auth is still initializing
      if (authLoading) return;

      try {
        if (!isAuthenticated || !accessToken) {
          // Don't fetch if not authenticated - UI will show login banner
          setLoading(false);
          return;
        }

        // Make the API call - let the backend handle authentication
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        };

        const response = await fetch(`${API_BASE_URL}/applications/`, {
          method: 'GET',
          headers,
          credentials: 'include'
        });

        const data = await response.json();

        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          setError('Your session has expired. Please login again.');
          setLoading(false);
          // Set a timeout to redirect to login
          setTimeout(() => {
            window.location.href = 'http://localhost:8000/auth/';
          }, 3000);
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch applications');
        }

        if (data.success) {
          // Transform database applications to match the Application interface
          const transformedApps: Application[] = data.applications.map((app: any) => ({
            id: app.id,
            jobId: app.job || '',
            jobTitle: app.job_title,
            company: app.company_name,
            logoColor: app.company_logo_color || '#6366f1',
            logoInitial: app.company_logo_initial || app.company_name.charAt(0),
            logoUrl: app.company_logo_url,
            appliedDate: getRelativeTime(app.applied_at),
            salary: app.salary_range || 'Not specified',
            location: app.location || 'Remote',
            status: app.status as Application['status'],
            interviewType: (app.interview_type && isTestInterview(app.interview_type)) || app.status === 'test' ? 'test' :
              app.status === 'interview' ? 'interview' : undefined,
            interviewDate: app.interview_date,
            offerDeadline: app.offer_deadline,
            testDeadline: app.test_deadline,
            interviewDeadline: app.interview_deadline,
            testScore: app.test_score
          }));

          setApplications(transformedApps);
        } else {
          throw new Error(data.error || 'Failed to load applications');
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err instanceof Error ? err.message : 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [isAuthenticated, accessToken, authLoading]);

  const handleStatusUpdate = async (appId: string, newStatus: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/applications/${appId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setApplications(prev => prev.map(app =>
          app.id === appId ? { ...app, status: newStatus as Application['status'] } : app
        ));
      } else {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      alert('Failed to update application status. Please try again.');
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!accessToken) return;
    if (!confirm('Are you sure you want to permanently delete this application? This action cannot be undone and will remove your record from the system.')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/applications/${appId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setApplications(prev => prev.filter(app => app.id !== appId));
      } else {
        throw new Error(data.error || 'Failed to delete application');
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      alert('Failed to delete application. Please try again.');
    }
  };

  const getApplicationsByStatus = (status: string) => {
    let activeApps = applications.filter(app => app.status !== 'withdrawn');

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      activeApps = activeApps.filter(app =>
        app.jobTitle.toLowerCase().includes(term) ||
        app.company.toLowerCase().includes(term)
      );
    }

    // Make the 'Applied' column show all active applications
    if (status === 'applied') {
      return activeApps;
    }
    if (status === 'offer') {
      return activeApps.filter(app => app.status === 'offer');
    }
    if (status === 'reviewing') {
      return activeApps.filter(app => app.status === 'reviewing');
    }
    return activeApps.filter(app => app.status === status);
  };

  const getTotalApplications = () => {
    let active = applications.filter(app => app.status !== 'withdrawn');
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      active = active.filter(app =>
        app.jobTitle.toLowerCase().includes(term) ||
        app.company.toLowerCase().includes(term)
      );
    }
    return active.length;
  };


  // Get upcoming interviews and assessments
  const getUpcomingApplications = () => {
    return applications.filter(app =>
      app.status === 'interview' || app.status === 'test'
    );
  };

  // Get timeline events (interviews, tests, offers with deadlines)
  const getTimelineEvents = () => {
    return applications.filter(app =>
      (app.status === 'interview' && app.interviewDeadline) ||
      app.status === 'offer' ||
      (app.status === 'test' && app.testDeadline)
    ).map(app => {
      let dateStr = 'Date TBD';
      let daysLeft = '';

      if (app.status === 'interview' && app.interviewDeadline) {
        const date = new Date(app.interviewDeadline);
        const diff = date.getTime() - new Date().getTime();
        const hours = Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
        dateStr = 'Interview by: ' + date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        daysLeft = hours < 24 ? `${hours}h left` : Math.ceil(diff / (1000 * 60 * 60 * 24)) + ' days';
      } else if (app.status === 'test' && app.testDeadline) {
        const date = new Date(app.testDeadline);
        dateStr = 'Test deadline: ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const diff = date.getTime() - new Date().getTime();
        daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))) + ' days';
      } else if (app.status === 'offer' && app.offerDeadline) {
        const date = new Date(app.offerDeadline);
        dateStr = 'Respond by: ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const diff = date.getTime() - new Date().getTime();
        daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))) + ' days';
      }

      return {
        ...app,
        eventType: app.status === 'interview' ? 'interview' : (app.status === 'test' ? 'test' : 'offer'),
        date: dateStr,
        daysLeft: daysLeft
      };
    });
  };

  // Show loading state or unauthenticated state with skeleton
  if (authLoading || loading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="application-page">
        <div className="app-header">
          <div>
            <h1 className="app-page-title">My Applications</h1>
            <p className="app-page-subtitle">
              {authLoading ? 'Checking authentication...' :
                !isAuthenticated ? 'Track your job applications' :
                  'Curating your pursuit...'}
            </p>
          </div>
        </div>
        <ApplicationPageSkeleton />
      </div>
    );
  }

  // Show error state (only for non-auth errors)
  if (error && isAuthenticated) {
    return (
      <div className="application-page">
        <div className="app-header">
          <div>
            <h1 className="app-page-title">My Applications</h1>
            <p className="app-page-subtitle">Error loading applications</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: '#ef4444' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="application-page">
      {/* Header */}
      <div className="app-header">
        <div>
          <h1 className="app-page-title">My Applications</h1>
          <p className="app-page-subtitle">{getTotalApplications()} total applications</p>
        </div>
        <div className="app-quote">
          <svg className="quote-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor" opacity="0.2" />
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor" opacity="0.2" />
          </svg>
          <div className="quote-content">
            <p className="quote-text">Success is not final, failure is not fatal: it is the courage to continue that counts.</p>
            <p className="quote-author">— Winston Churchill</p>
          </div>
        </div>
      </div>

      {/* Tab Header */}
      <div className="app-tabs">
        <button
          className={`tab-button ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <span>Pipeline</span>
          <span className="tab-badge">{getTotalApplications()}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Upcoming</span>
          <span className="tab-badge">{getUpcomingApplications().length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Calendar</span>
          <span className="tab-badge">{getTimelineEvents().length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'offered' ? 'active' : ''}`}
          onClick={() => setActiveTab('offered')}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Offered</span>
          <span className="tab-badge">{applications.filter(app => app.status === 'accepted').length}</span>
        </button>
      </div>

      {/* Pipeline - Full Kanban Board */}
      {activeTab === 'pipeline' && (
        <>
          <div className="pipeline-filters">
            <div className="search-wrapper">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pipeline-search-input"
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

          </div>
          <div className="kanban-board">
            {STATUS_COLUMNS.map((column) => {
              const columnApps = getApplicationsByStatus(column.id);
              return (
                <div key={column.id} className="kanban-column">
                  <div className="column-header">
                    <h2 className="column-title">{column.title}</h2>
                    <span className="column-count" style={{ color: column.color }}>
                      {columnApps.length}
                    </span>
                  </div>
                  <div className="column-content">
                    {columnApps.length > 0 ? (
                      columnApps.map((app) => (
                        <ApplicationCard
                          key={app.id}
                          application={app}
                          onStatusUpdate={handleStatusUpdate}
                          onDelete={handleDeleteApplication}
                        />
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>No applications</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Upcoming - Interviews & Tests */}
      {activeTab === 'upcoming' && (
        <div className="upcoming-view">
          <div className="upcoming-header">
            <h2>Upcoming Interviews & Tests</h2>
            <p>Prepare for your scheduled interviews and assessments</p>
          </div>
          <div className="upcoming-grid">
            {getUpcomingApplications().length > 0 ? (
              getUpcomingApplications().map((app: Application) => (
                <motion.div
                  key={app.id}
                  className="upcoming-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="upcoming-card-header">
                    <div className="app-logo" style={{ backgroundColor: '#ffffff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
                      <img src={app.logoUrl || "/loop.png"} alt="Company Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span className={`status-badge ${app.interviewType === 'test' ? 'status-test' : 'status-interview'}`}>
                      {app.interviewType === 'test' ? 'Assessment Test' : 'Interview Scheduled'}
                    </span>
                  </div>
                  <h3 className="upcoming-title">{app.jobTitle}</h3>
                  <p className="upcoming-company">{app.company}</p>
                  <div className="upcoming-details">
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{app.location}</span>
                    </div>
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>
                        {app.status === 'test'
                          ? (app.testDeadline
                            ? `Deadline: ${new Date(app.testDeadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
                            : 'Date TBD')
                          : (app.interviewDeadline
                            ? `Deadline: ${new Date(app.interviewDeadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                            : app.interviewDate
                              ? new Date(app.interviewDate).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                              : 'Date TBD')}
                      </span>
                    </div>
                  </div>
                  <div className="upcoming-actions">
                    {app.status === 'test' ? (
                      <button
                        className="action-btn primary w-full flex items-center justify-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          const cleanJobTitle = app.jobTitle.split('-')[0].trim();
                          window.open(`http://localhost:5173/test?job=${encodeURIComponent(cleanJobTitle)}&job_id=${app.jobId}`, '_blank');
                        }}
                      >

                        Take Test
                      </button>
                    ) : app.status === 'interview' ? (
                      <InterviewActionButton app={app} />
                    ) : app.interviewType === 'test' ? (
                      <>
                        <button className="action-btn primary">Start Test</button>
                        <button className="action-btn secondary">View Details</button>
                      </>
                    ) : (
                      <>
                        <button className="action-btn primary">Join Interview</button>
                        <button className="action-btn secondary">View Details</button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="empty-state-full">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <p>No upcoming interviews scheduled</p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Calendar/Timeline - Calendar Grid View */}
      {activeTab === 'calendar' && (
        <div className="calendar-view">
          {(() => {
            const now = new Date();
            const displayDate = new Date(now.getFullYear(), now.getMonth() + calendarOffset, 1);
            const currentYear = displayDate.getFullYear();
            const currentMonth = displayDate.getMonth(); // 0-indexed
            const currentDay = now.getDate();
            const isDisplayingCurrentMonth = calendarOffset === 0;

            // Get first day of month and calculate calendar grid
            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

            // Month names
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'];

            // Generate calendar days array
            const calendarDays: Array<{ day: number; currentMonth: boolean; hasEvents: boolean; events: any[] }> = [];

            // Add previous month days
            const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
            for (let i = startingDayOfWeek - 1; i >= 0; i--) {
              calendarDays.push({
                day: prevMonthLastDay - i,
                currentMonth: false,
                hasEvents: false,
                events: []
              });
            }

            // Add current month days and check for events
            for (let day = 1; day <= daysInMonth; day++) {
              const events: any[] = [];

              // Check each application for events on this day
              applications.forEach(app => {
                // For interviews: show the 2-day deadline on the calendar
                if (app.status === 'interview') {
                  const deadlineDate = app.interviewDeadline
                    ? new Date(app.interviewDeadline)
                    : app.interviewDate
                      ? new Date(app.interviewDate)
                      : null;

                  if (!deadlineDate) return;

                  if (deadlineDate.getDate() === day &&
                    deadlineDate.getMonth() === currentMonth &&
                    deadlineDate.getFullYear() === currentYear) {

                    const timeStr = deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isPast = deadlineDate < now;

                    events.push({
                      type: 'interview',
                      title: `${app.company} — Interview Deadline`,
                      time: isPast ? 'Expired' : `By ${timeStr}`,
                      application: app
                    });
                  }
                }

                // For offers: use actual deadline
                if (app.status === 'offer') {
                  if (!app.offerDeadline) return;
                  const eventDate = new Date(app.offerDeadline);

                  if (eventDate.getDate() === day &&
                    eventDate.getMonth() === currentMonth &&
                    eventDate.getFullYear() === currentYear) {
                    events.push({
                      type: 'offer',
                      title: `${app.company} — Offer Deadline`,
                      time: 'Respond by today',
                      application: app
                    });
                  }
                }

                // For tests: use test deadline
                if (app.status === 'test' && app.testDeadline) {
                  const eventDate = new Date(app.testDeadline);

                  if (eventDate.getDate() === day &&
                    eventDate.getMonth() === currentMonth &&
                    eventDate.getFullYear() === currentYear) {
                    events.push({
                      type: 'test',
                      title: `${app.company} — Test Deadline`,
                      time: 'Deadline',
                      application: app
                    });
                  }
                }
              });

              calendarDays.push({
                day,
                currentMonth: true,
                hasEvents: events.length > 0,
                events
              });
            }

            // Add next month days to complete the grid
            const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
            for (let day = 1; day <= remainingDays; day++) {
              calendarDays.push({
                day,
                currentMonth: false,
                hasEvents: false,
                events: []
              });
            }

            return (
              <>
                <div className="calendar-header">
                  <div className="calendar-title-group">
                    <h2 className="calendar-display-title">{monthNames[currentMonth]} {currentYear}</h2>
                    <p>View all your upcoming interviews, tests, and deadlines</p>
                  </div>

                  <div className="calendar-filter-container">
                    <div className="calendar-dropdown-wrapper">
                      <button 
                        className="calendar-month-selector"
                        onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', opacity: 0.6 }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>Select Month</span>
                        <HiChevronDown className={`chevron-icon ${showMonthDropdown ? 'open' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showMonthDropdown && (
                          <motion.div 
                            className="month-dropdown-picker"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="picker-header">
                              <button 
                                className="year-nav-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedYear(prev => prev - 1);
                                }}
                                disabled={selectedYear <= now.getFullYear()}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                              </button>
                              <span className="current-year-display">{selectedYear}</span>
                              <button 
                                className="year-nav-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedYear(prev => prev + 1);
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                              </button>
                            </div>
                            
                            <div className="month-picker-grid">
                              {monthNames.map((month, monthIndex) => {
                                // Calculate if this month is in the past
                                const isPast = selectedYear === now.getFullYear() && monthIndex < now.getMonth();
                                const isSelected = calendarOffset === (selectedYear - now.getFullYear()) * 12 + (monthIndex - now.getMonth());
                                
                                return (
                                  <button
                                    key={month}
                                    className={`month-picker-item ${isSelected ? 'active' : ''} ${isPast ? 'disabled' : ''}`}
                                    disabled={isPast}
                                    onClick={() => {
                                      const newOffset = (selectedYear - now.getFullYear()) * 12 + (monthIndex - now.getMonth());
                                      setCalendarOffset(newOffset);
                                      setShowMonthDropdown(false);
                                    }}
                                  >
                                    {month.slice(0, 3)}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="calendar-grid">
                  {/* Calendar Header - Days of Week */}
                  <div className="calendar-day-header">Sun</div>
                  <div className="calendar-day-header">Mon</div>
                  <div className="calendar-day-header">Tue</div>
                  <div className="calendar-day-header">Wed</div>
                  <div className="calendar-day-header">Thu</div>
                  <div className="calendar-day-header">Fri</div>
                  <div className="calendar-day-header">Sat</div>

                  {/* Calendar Days */}
                  {calendarDays.map((dayInfo, index) => {
                    const isToday = isDisplayingCurrentMonth &&
                      dayInfo.day === currentDay;

                    return (
                      <div
                        key={`day-${index}`}
                        className={`calendar-day 
                          ${!dayInfo.currentMonth ? 'other-month' : ''} 
                          ${isToday ? 'today' : ''} 
                          ${dayInfo.hasEvents ? 'has-events' : ''}`}
                      >
                        <span className="day-number">{dayInfo.day}</span>
                        {dayInfo.hasEvents && (
                          <div className="day-events">
                            {dayInfo.events.map((event, eventIndex) => (
                              <motion.div
                                key={`event-${index}-${eventIndex}`}
                                className={`calendar-event ${event.type}`}
                                whileHover={{ scale: 1.02 }}
                                title={`${event.title} - ${event.time}`}
                              >
                                <div className="event-time">{event.time}</div>
                                <div className="event-title">{event.title}</div>
                                <div className="event-type">
                                  {event.type === 'interview' ? '💼 Interview' :
                                    event.type === 'test' ? '📝 Test' :
                                      '🎁 Respond'}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="calendar-legend">
                  <div className="legend-item">
                    <div className="legend-dot interview"></div>
                    <span>Interview</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot test"></div>
                    <span>Assessment</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot offer"></div>
                    <span>Offer Deadline</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Offered View - Accepted Applications */}
      {activeTab === 'offered' && (
        <div className="upcoming-view">
          <div className="upcoming-header">
            <h2>Accepted Offers</h2>
            <p>Congratulations on your new roles! Here are the offers you've accepted.</p>
          </div>
          <div className="upcoming-grid">
            {applications.filter(app => app.status === 'accepted').length > 0 ? (
              applications.filter(app => app.status === 'accepted').map((app: Application) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDeleteApplication}
                />
              ))
            ) : (
              <div className="empty-state-full">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p>No accepted offers yet. Keep going!</p>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
}

export default ApplicationPage;
