import { useState } from 'react';
import { motion } from 'framer-motion';
import './ApplicationPage.css';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  logoColor: string;
  logoInitial: string;
  appliedDate: string;
  salary: string;
  location: string;
  status: 'applied' | 'reviewing' | 'interview' | 'offer' | 'rejected';
  interviewType?: 'interview' | 'test'; // Optional field for interview stage
}

type StatusColumn = {
  id: string;
  title: string;
  color: string;
};

// ============================================================================
// MOCK DATA
// ============================================================================

const STATUS_COLUMNS: StatusColumn[] = [
  { id: 'applied', title: 'Applied', color: '#6366f1' },
  { id: 'reviewing', title: 'In Review', color: '#f59e0b' },
  { id: 'interview', title: 'Interview', color: '#8b5cf6' },
  { id: 'offer', title: 'Offer', color: '#10b981' },
  { id: 'rejected', title: 'Rejected', color: '#ef4444' }
];

const APPLICATIONS_DATA: Application[] = [
  {
    id: 1,
    jobTitle: 'Senior Product Designer',
    company: 'Google',
    logoColor: '#4285f4',
    logoInitial: 'G',
    appliedDate: '2 days ago',
    salary: '$120k - $180k',
    location: 'Mountain View, CA',
    status: 'interview',
    interviewType: 'interview'
  },
  {
    id: 2,
    jobTitle: 'UX Researcher',
    company: 'Meta',
    logoColor: '#0668E1',
    logoInitial: 'M',
    appliedDate: '5 days ago',
    salary: '$100k - $150k',
    location: 'Menlo Park, CA',
    status: 'reviewing'
  },
  {
    id: 3,
    jobTitle: 'UI/UX Designer',
    company: 'Netflix',
    logoColor: '#E50914',
    logoInitial: 'N',
    appliedDate: '1 week ago',
    salary: '$110k - $160k',
    location: 'Los Gatos, CA',
    status: 'applied'
  },
  {
    id: 4,
    jobTitle: 'Interaction Designer',
    company: 'Airbnb',
    logoColor: '#FF5A5F',
    logoInitial: 'A',
    appliedDate: '3 days ago',
    salary: '$115k - $170k',
    location: 'San Francisco, CA',
    status: 'offer'
  },
  {
    id: 5,
    jobTitle: 'Visual Designer',
    company: 'Spotify',
    logoColor: '#1DB954',
    logoInitial: 'S',
    appliedDate: '1 week ago',
    salary: '$100k - $150k',
    location: 'New York, NY',
    status: 'applied'
  },
  {
    id: 6,
    jobTitle: 'Product Designer',
    company: 'Apple',
    logoColor: '#000000',
    logoInitial: '',
    appliedDate: '2 weeks ago',
    salary: '$150k - $220k',
    location: 'Cupertino, CA',
    status: 'rejected'
  },
  {
    id: 7,
    jobTitle: 'UX Designer',
    company: 'Amazon',
    logoColor: '#FF9900',
    logoInitial: 'A',
    appliedDate: '4 days ago',
    salary: '$130k - $190k',
    location: 'Seattle, WA',
    status: 'interview',
    interviewType: 'test'
  }
];

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
        <span className="app-salary">{application.salary}</span>
        <span className="app-date">{application.appliedDate}</span>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function ApplicationPage() {
  const [applications] = useState<Application[]>(APPLICATIONS_DATA);
  const [activeTab, setActiveTab] = useState<string>('pipeline');

  const getApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  const getTotalApplications = () => applications.length;
  const getStatusCount = (status: string) => applications.filter(app => app.status === status).length;
  const getActiveCount = () => applications.filter(app => app.status !== 'rejected').length;

  // Get upcoming interviews only
  const getUpcomingApplications = () => {
    return applications.filter(app =>
      app.status === 'interview'
    );
  };

  // Get timeline events (interviews, tests, offers with deadlines)
  const getTimelineEvents = () => {
    return applications.filter(app =>
      app.status === 'interview' || app.status === 'offer'
    ).map(app => ({
      ...app,
      eventType: app.status === 'interview'
        ? (app.interviewType === 'test' ? 'test' : 'interview')
        : 'offer',
      date: app.status === 'interview' ? 'Tomorrow, 2:00 PM' : 'Respond by: Jan 20',
      daysLeft: app.status === 'interview' ? '1 day' : '5 days'
    }));
  };

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
          className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="20" x2="12" y2="10"></line>
            <line x1="18" y1="20" x2="18" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="16"></line>
          </svg>
          <span>Insights</span>
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
              getUpcomingApplications().map((app) => (
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
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      <span>{app.salary}</span>
                    </div>
                  </div>
                  <div className="upcoming-actions">
                    {app.interviewType === 'test' ? (
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
          <div className="calendar-header">
            <h2>January 2026</h2>
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

            {/* Calendar Days - Week 1 */}
            {[29, 30, 31, 1, 2, 3, 4].map((day, index) => (
              <div key={`week1-${day}`} className={`calendar-day ${index < 3 ? 'other-month' : ''}`}>
                <span className="day-number">{day}</span>
              </div>
            ))}

            {/* Calendar Days - Week 2 */}
            {[5, 6, 7, 8, 9, 10, 11].map((day) => (
              <div key={`week2-${day}`} className="calendar-day">
                <span className="day-number">{day}</span>
              </div>
            ))}

            {/* Calendar Days - Week 3 with Events */}
            <div className="calendar-day">
              <span className="day-number">12</span>
            </div>
            <div className="calendar-day">
              <span className="day-number">13</span>
            </div>
            <div className="calendar-day">
              <span className="day-number">14</span>
            </div>

            {/* Day 15 - Today with Google Interview */}
            <div className="calendar-day today has-events">
              <span className="day-number">15</span>
              <div className="day-events">
                <motion.div
                  className="calendar-event interview"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => { }}
                >
                  <div className="event-time">2:00 PM</div>
                  <div className="event-title">Google Interview</div>
                  <div className="event-type">💼 Interview</div>
                </motion.div>
              </div>
            </div>

            {/* Day 16 - Amazon Test */}
            <div className="calendar-day has-events">
              <span className="day-number">16</span>
              <div className="day-events">
                <motion.div
                  className="calendar-event test"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="event-time">10:00 AM</div>
                  <div className="event-title">Amazon Assessment</div>
                  <div className="event-type">📝 Test</div>
                </motion.div>
              </div>
            </div>

            <div className="calendar-day">
              <span className="day-number">17</span>
            </div>
            <div className="calendar-day">
              <span className="day-number">18</span>
            </div>

            {/* Calendar Days - Week 4 */}
            <div className="calendar-day">
              <span className="day-number">19</span>
            </div>

            {/* Day 20 - Airbnb Offer Deadline */}
            <div className="calendar-day has-events">
              <span className="day-number">20</span>
              <div className="day-events">
                <motion.div
                  className="calendar-event offer"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="event-time">Deadline</div>
                  <div className="event-title">Airbnb Offer</div>
                  <div className="event-type">🎁 Respond</div>
                </motion.div>
              </div>
            </div>

            {[21, 22, 23, 24, 25].map((day) => (
              <div key={`week4-${day}`} className="calendar-day">
                <span className="day-number">{day}</span>
              </div>
            ))}

            {/* Calendar Days - Week 5 */}
            {[26, 27, 28, 29, 30, 31, 1].map((day, index) => (
              <div key={`week5-${day}`} className={`calendar-day ${index === 6 ? 'other-month' : ''}`}>
                <span className="day-number">{day}</span>
              </div>
            ))}
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
        </div>
      )}

      {/* Insights - Statistics View */}
      {activeTab === 'insights' && (
        <div className="statistics-view">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <h3>Total Applications</h3>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </div>
              <div className="stat-card-value">{getTotalApplications()}</div>
              <div className="stat-card-label">Applications submitted</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <h3>Active</h3>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <div className="stat-card-value">{getActiveCount()}</div>
              <div className="stat-card-label">In progress</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <h3>Interviews</h3>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="stat-card-value">{getStatusCount('interview')}</div>
              <div className="stat-card-label">Scheduled interviews</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <h3>Offers</h3>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="stat-card-value">{getStatusCount('offer')}</div>
              <div className="stat-card-label">Job offers received</div>
            </div>
          </div>

          <div className="status-breakdown">
            <h3 className="breakdown-title">Application Status Breakdown</h3>
            <div className="breakdown-list">
              {STATUS_COLUMNS.map((column) => {
                const count = getStatusCount(column.id);
                const percentage = getTotalApplications() > 0
                  ? Math.round((count / getTotalApplications()) * 100)
                  : 0;
                return (
                  <div key={column.id} className="breakdown-item">
                    <div className="breakdown-info">
                      <span className="breakdown-label">{column.title}</span>
                      <span className="breakdown-count">{count} applications</span>
                    </div>
                    <div className="breakdown-bar-container">
                      <div
                        className="breakdown-bar"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: column.color
                        }}
                      ></div>
                    </div>
                    <span className="breakdown-percentage">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationPage;
