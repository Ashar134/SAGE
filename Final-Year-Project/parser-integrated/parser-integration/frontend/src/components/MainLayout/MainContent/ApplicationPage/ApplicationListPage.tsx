import { applications } from './ApplicationData';
import type { Application } from './ApplicationData';
import { useNavigate } from 'react-router-dom';
import './ApplicationPage.css';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'status-pending' },
  test_pending: { label: 'Test Pending', className: 'status-test-pending' },
  test_completed: { label: 'Test Completed', className: 'status-test-completed' },
  interview_pending: { label: 'Interview Pending', className: 'status-interview-pending' },
  interview_completed: { label: 'Interview Completed', className: 'status-interview-completed' },
  accepted: { label: 'Accepted', className: 'status-accepted' },
  rejected: { label: 'Rejected', className: 'status-rejected' },
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getProgressStep = (application: Application): number => {
  if (application.applicationStatus === 'accepted' || application.applicationStatus === 'rejected') {
    return 4;
  }
  if (
    application.interviewStatus === 'completed' ||
    application.interviewStatus === 'passed' ||
    application.interviewStatus === 'failed' ||
    application.applicationStatus === 'interview_completed'
  ) {
    return 3;
  }
  if (
    application.testStatus !== 'not_started' ||
    application.applicationStatus === 'test_completed' ||
    application.applicationStatus === 'interview_pending'
  ) {
    return 2;
  }
  return 1;
};

function ApplicationListPage() {
  const navigate = useNavigate();

  // Calculate statistics
  const totalApplications = applications.length;
  const pendingCount = applications.filter(
    (app) => app.applicationStatus === 'test_pending' || app.applicationStatus === 'interview_pending'
  ).length;
  const acceptedCount = applications.filter((app) => app.applicationStatus === 'accepted').length;
  const rejectedCount = applications.filter((app) => app.applicationStatus === 'rejected').length;

  return (
    <div className="application-page">
      <div className="application-container">
        <div className="application-header">
          <div>
            <h1 className="page-title">My Applications</h1>
            <p className="page-subtitle">Track and manage your job applications</p>
          </div>
        </div>

        {/* Statistics Cards */}
        {applications.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{totalApplications}</div>
                <div className="stat-label">Total Applications</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{pendingCount}</div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{acceptedCount}</div>
                <div className="stat-label">Accepted</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-red">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{rejectedCount}</div>
                <div className="stat-label">Rejected</div>
              </div>
            </div>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="empty-state">
            <svg
              className="empty-icon"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h2>No Applications Yet</h2>
            <p>You haven't applied to any jobs yet. Start exploring opportunities!</p>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application: Application, index: number) => {
              const config =
                statusConfig[application.applicationStatus] || {
                  label: application.applicationStatus,
                  className: 'status-default',
                };
              const progressStep = getProgressStep(application);
              const progressPercentage = (progressStep / 4) * 100;
              return (
                <div
                  key={application.id}
                  className="application-card"
                  onClick={() => navigate(`/app/application/${application.id}`)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="application-card-content">
                    <div className="application-card-header">
                      <div className="application-info">
                        <div className="job-title-row">
                          <h2 className="job-title">{application.jobTitle}</h2>
                          <span className={`status-badge ${config.className}`}>{config.label}</span>
                        </div>
                        <p className="company-name">{application.company}</p>
                        <div className="job-meta">
                          <div className="job-location">
                            <svg
                              className="location-icon"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {application.location}
                          </div>
                          <div className="application-date">
                            <svg
                              className="date-icon"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Applied {formatDate(application.applicationDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="application-card-progress">
                      <div className="card-progress-header">
                        <span className="card-progress-label">Application Progress</span>
                        <span className="card-progress-percentage">{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="card-progress-bar">
                        <div className="card-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                      </div>
                      <div className="card-progress-steps">
                        {['Applied', 'Test', 'Interview', 'Decision'].map((step, idx) => {
                          const stepNum = idx + 1;
                          const isActive = stepNum <= progressStep;
                          const isCompleted = stepNum < progressStep;
                          return (
                            <div key={step} className={`card-progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                              <div className="card-progress-dot"></div>
                              <span className="card-progress-step-label">{step}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationListPage;

