import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

const ApplicationCard = ({ application }: { application: Application }) => {
  return (
    <motion.div
      className="app-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="app-card-header">
        <div className="app-logo" style={{ backgroundColor: application.logoColor }}>
          {application.logoInitial ? (
            application.logoInitial
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          )}
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

function ApplicationPage() {
  const { accessToken, isAuthenticated, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
            appliedDate: getRelativeTime(app.applied_at),
            salary: app.salary_range || 'Not specified',
            location: app.location || 'Remote',
            status: app.status as Application['status'],
            interviewType: (app.interview_type && isTestInterview(app.interview_type)) || app.status === 'test' ? 'test' :
              app.status === 'interview' ? 'interview' : undefined,
            interviewDate: app.interview_date,
            offerDeadline: app.offer_deadline,
            testDeadline: app.test_deadline || app.test_completed_at
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

  const getApplicationsByStatus = (status: string) => {
    // Make the 'Applied' column show all applications to act as a permanent record
    if (status === 'applied') {
      return applications;
    }
    if (status === 'offer') {
      return applications.filter(app => app.status === 'offer' || app.status === 'accepted');
    }
    if (status === 'reviewing') {
      return applications.filter(app => app.status === 'reviewing');
    }
    return applications.filter(app => app.status === status);
  };

  const getTotalApplications = () => applications.length;


  // Get upcoming interviews and assessments
  const getUpcomingApplications = () => {
    return applications.filter(app =>
      app.status === 'interview' || app.status === 'test'
    );
  };

  // Get timeline events (interviews, tests, offers with deadlines)
  const getTimelineEvents = () => {
    return applications.filter(app =>
      app.status === 'interview' || app.status === 'offer' || (app.status === 'test' && app.testDeadline)
    ).map(app => {
      let dateStr = 'Date TBD';
      let daysLeft = '';

      if (app.status === 'interview' && app.interviewDate) {
        const date = new Date(app.interviewDate);
        dateStr = date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const diff = date.getTime() - new Date().getTime();
        daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))) + ' days';
      } else if (app.status === 'test' && app.testDeadline) {
        const date = new Date(app.testDeadline);
        dateStr = 'Deadline: ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
        eventType: app.status === 'interview'
          ? (app.interviewType === 'test' ? 'test' : 'interview')
          : (app.status === 'test' ? 'test' : 'offer'),
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

      </div>

      {/* Pipeline - Full Kanban Board */}
      {activeTab === 'pipeline' && (
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
                      <ApplicationCard key={app.id} application={app} />
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
                    <div className="app-logo" style={{ backgroundColor: app.logoColor }}>
                      {app.logoInitial ? (
                        app.logoInitial
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                      )}
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
                          ? (app.testDeadline ? `Deadline: ${new Date(app.testDeadline).toLocaleDateString()}` : 'Date TBD')
                          : (app.interviewDate
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Take Test
                      </button>
                    ) : app.status === 'interview' ? (
                      <button
                        className="action-btn primary w-full flex items-center justify-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/interview?application_id=${app.id}`;
                        }}
                      >
                        🎙 Start Interview
                      </button>
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
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth(); // 0-indexed
            const currentDay = now.getDate();

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
                // For interviews: use actual date or fallback to calculated date
                if (app.status === 'interview') {
                  let eventDate: Date;

                  if (app.interviewDate) {
                    eventDate = new Date(app.interviewDate);
                  } else {
                    // Skip if no explicit date
                    return;
                  }

                  if (eventDate.getDate() === day &&
                    eventDate.getMonth() === currentMonth &&
                    eventDate.getFullYear() === currentYear) {

                    // Format time from the date object
                    const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    events.push({
                      type: app.interviewType === 'test' ? 'test' : 'interview',
                      title: `${app.company} ${app.interviewType === 'test' ? 'Assessment' : 'Interview'}`,
                      time: timeStr,
                      application: app
                    });
                  }
                }

                // For offers: use actual deadline
                if (app.status === 'offer') {
                  let eventDate: Date;

                  if (app.offerDeadline) {
                    eventDate = new Date(app.offerDeadline);
                  } else {
                    // Skip if no explicit date
                    return;
                  }

                  if (eventDate.getDate() === day &&
                    eventDate.getMonth() === currentMonth &&
                    eventDate.getFullYear() === currentYear) {
                    events.push({
                      type: 'offer',
                      title: `${app.company} Offer`,
                      time: 'Deadline',
                      application: app
                    });
                  }
                }

                // For tests: use test deadline when in test status
                if (app.status === 'test' && app.testDeadline) {
                  let eventDate = new Date(app.testDeadline);

                  if (eventDate.getDate() === day &&
                    eventDate.getMonth() === currentMonth &&
                    eventDate.getFullYear() === currentYear) {
                    events.push({
                      type: 'test',
                      title: `${app.company} Test Deadline`,
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
                  <h2>{monthNames[currentMonth]} {currentYear}</h2>
                  <p>View all your upcoming interviews, tests, and deadlines</p>
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
                    const isToday = dayInfo.currentMonth &&
                      dayInfo.day === currentDay &&
                      currentMonth === now.getMonth();

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


    </div>
  );
}

export default ApplicationPage;
