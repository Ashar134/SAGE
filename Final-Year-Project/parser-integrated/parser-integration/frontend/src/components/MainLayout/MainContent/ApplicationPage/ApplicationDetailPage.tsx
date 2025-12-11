import { useParams, useNavigate } from 'react-router-dom';
import { applications } from './ApplicationData';
import type { Application } from './ApplicationData';
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
    month: 'long',
    day: 'numeric',
  });
};

const getDaysRemaining = (deadline: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const hasAttemptedTest = (application: Application): boolean => {
  return application.testStatus !== 'not_started' && application.testStatus !== 'in_progress';
};

const hasAttemptedInterview = (application: Application): boolean => {
  return application.interviewStatus !== 'scheduled' && application.interviewStatus !== undefined;
};

const canTakeTest = (application: Application): boolean => {
  if (hasAttemptedTest(application)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appDate = new Date(application.applicationDate);
  appDate.setHours(0, 0, 0, 0);
  const deadline = new Date(application.testDeadline);
  deadline.setHours(0, 0, 0, 0);
  return today >= appDate && today <= deadline;
};

const canAttendInterview = (application: Application): boolean => {
  if (!application.interviewDeadline || hasAttemptedInterview(application)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const interviewDeadline = new Date(application.interviewDeadline);
  interviewDeadline.setHours(0, 0, 0, 0);
  const interviewStartDate = new Date(interviewDeadline);
  interviewStartDate.setDate(interviewStartDate.getDate() - 7);
  interviewStartDate.setHours(0, 0, 0, 0);
  return today >= interviewStartDate && today <= interviewDeadline && application.interviewStatus === 'scheduled';
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
    hasAttemptedTest(application) ||
    application.applicationStatus === 'test_completed' ||
    application.applicationStatus === 'interview_pending'
  ) {
    return 2;
  }
  return 1;
};

function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const application = applications.find((a) => a.id === id);

  if (!application) {
    return (
      <div className="application-page">
        <div className="application-container">
          <div className="empty-state">
            <h2>Application not found</h2>
            <p>The application you are looking for does not exist.</p>
            <button className="action-button test-button" onClick={() => navigate('/app/application')}>
              Back to Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = statusConfig[application.applicationStatus] || {
    label: application.applicationStatus,
    className: 'status-default',
  };

  const progressStep = getProgressStep(application);
  const progressPercentage = (progressStep / 4) * 100;

  return (
    <div className="application-page">
      <div className="application-container">
        <div className="application-header">
          <h1 className="page-title">{application.jobTitle}</h1>
          <div className="header-meta">
            <p className="page-subtitle">
              {application.company} • {application.location}
            </p>
            <span className={`status-badge ${statusBadge.className}`}>{statusBadge.label}</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{progressPercentage}%</div>
              <div className="stat-label">Overall Progress</div>
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
              <div className="stat-value">{progressStep}/4</div>
              <div className="stat-label">Steps Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {(() => {
                  const daysSince = Math.floor((new Date().getTime() - application.applicationDate.getTime()) / (1000 * 60 * 60 * 24));
                  return `${daysSince}`;
                })()}
              </div>
              <div className="stat-label">Days Since Applied</div>
            </div>
          </div>
        </div>

        <div className="application-detail-panel">
          {/* Progress Bar */}
          <div className="application-progress">
            <div className="progress-header">
              <h2 className="detail-title">Application Progress</h2>
              <div className="progress-percentage">{Math.round(progressPercentage)}%</div>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <div className="progress-steps">
              {['Applied', 'Test', 'Interview', 'Decision'].map((label, index) => {
                const stepNumber = index + 1;
                const active = stepNumber <= progressStep;
                const completed = stepNumber < progressStep;
                return (
                  <div key={label} className={`progress-step ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}>
                    <div className="progress-circle-wrapper">
                      <div className="progress-circle">{completed ? '✓' : stepNumber}</div>
                    </div>
                    <span className="progress-label">{label}</span>
                    {stepNumber < 4 && (
                      <div className={`progress-line ${active ? 'active' : ''}`}>
                        <div className="progress-line-fill" style={{ width: completed ? '100%' : active && stepNumber === progressStep ? '50%' : '0%' }}></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="application-details">
            <div className="details-grid">
              <div className="detail-card">
                <div className="detail-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="detail-info">
                  <span className="detail-label">Institution</span>
                  <span className="detail-value">{application.company}</span>
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="detail-info">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{application.location}</span>
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="detail-info">
                  <span className="detail-label">Application Date</span>
                  <span className="detail-value">{formatDate(application.applicationDate)}</span>
                </div>
              </div>
            </div>

            {/* Test Section */}
            <div className="assessment-section">
              <div className="assessment-header">
                <div className="assessment-title-wrapper">
                  <div className="assessment-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                  </div>
                  <h3 className="assessment-title">Assessment Test</h3>
                </div>
                {application.testStatus === 'passed' && <span className="test-passed-badge">✓ Passed</span>}
                {application.testStatus === 'failed' && <span className="test-failed-badge">✗ Failed</span>}
                {application.testStatus === 'completed' && <span className="test-completed-badge">Completed</span>}
              </div>
              {hasAttemptedTest(application) ? (
                <div className="assessment-content">
                  <div className="assessment-status-card">
                    <div className="status-indicator status-success"></div>
                    <div className="status-text">
                      <span className="status-title">Test Status</span>
                      <span className="status-value">
                        {application.testStatus === 'passed' && '✓ Passed'}
                        {application.testStatus === 'failed' && '✗ Failed'}
                        {application.testStatus === 'completed' && 'Completed'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="assessment-content">
                  <div className="deadline-card">
                    <div className="deadline-header">
                      <span className="deadline-label">Test Deadline</span>
                      {(() => {
                        const testDaysRemaining = getDaysRemaining(application.testDeadline);
                        return (
                          <span
                            className={`deadline-badge ${
                              testDaysRemaining < 0 ? 'deadline-passed' : testDaysRemaining <= 3 ? 'deadline-soon' : 'deadline-normal'
                            }`}
                          >
                            {testDaysRemaining >= 0 ? `${testDaysRemaining} days left` : 'Expired'}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="deadline-date">{formatDate(application.testDeadline)}</div>
                    {(() => {
                      const testDaysRemaining = getDaysRemaining(application.testDeadline);
                      const totalDays = 14;
                      const daysUsed = totalDays - testDaysRemaining;
                      const progressPercent = Math.max(0, Math.min(100, (daysUsed / totalDays) * 100));
                      return (
                        <div className="deadline-progress">
                          <div className="deadline-progress-bar">
                            <div className="deadline-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
              {canTakeTest(application) && (
                <button className="action-button test-button" onClick={() => navigate('/app/test')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  {application.testStatus === 'in_progress' ? 'Continue Test' : 'Give Test'}
                </button>
              )}
            </div>

            {/* Interview Section */}
            {application.testStatus === 'passed' && application.interviewDeadline && (
              <div className="assessment-section interview-section">
                <div className="assessment-header">
                  <div className="assessment-title-wrapper">
                    <div className="assessment-icon interview-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <h3 className="assessment-title">Interview</h3>
                  </div>
                  {application.interviewStatus === 'completed' && <span className="interview-completed-badge">Completed</span>}
                  {application.interviewStatus === 'passed' && <span className="interview-passed-badge">✓ Passed</span>}
                  {application.interviewStatus === 'failed' && <span className="interview-failed-badge">✗ Failed</span>}
                </div>
                {hasAttemptedInterview(application) ? (
                  <div className="assessment-content">
                    <div className="assessment-status-card">
                      <div className={`status-indicator ${
                        application.interviewStatus === 'passed' ? 'status-success' : 
                        application.interviewStatus === 'failed' ? 'status-error' : 'status-info'
                      }`}></div>
                      <div className="status-text">
                        <span className="status-title">Interview Status</span>
                        <span className="status-value">
                          {application.interviewStatus === 'completed' && 'Completed'}
                          {application.interviewStatus === 'passed' && '✓ Passed'}
                          {application.interviewStatus === 'failed' && '✗ Failed'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="assessment-content">
                    <div className="deadline-card">
                      <div className="deadline-header">
                        <span className="deadline-label">Interview Deadline</span>
                        {(() => {
                          const interviewDaysRemaining = application.interviewDeadline
                            ? getDaysRemaining(application.interviewDeadline)
                            : null;
                          return (
                            <span
                              className={`deadline-badge ${
                                interviewDaysRemaining !== null && interviewDaysRemaining < 0
                                  ? 'deadline-passed'
                                  : interviewDaysRemaining !== null && interviewDaysRemaining <= 2
                                  ? 'deadline-soon'
                                  : 'deadline-normal'
                              }`}
                            >
                              {interviewDaysRemaining !== null && interviewDaysRemaining >= 0
                                ? `${interviewDaysRemaining} days left`
                                : 'Expired'}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="deadline-date">{formatDate(application.interviewDeadline)}</div>
                      {(() => {
                        const interviewDaysRemaining = application.interviewDeadline
                          ? getDaysRemaining(application.interviewDeadline)
                          : null;
                        const totalDays = 7;
                        const daysUsed = interviewDaysRemaining !== null ? totalDays - interviewDaysRemaining : 0;
                        const progressPercent = Math.max(0, Math.min(100, (daysUsed / totalDays) * 100));
                        return (
                          <div className="deadline-progress">
                            <div className="deadline-progress-bar">
                              <div className="deadline-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
                {canAttendInterview(application) && (
                  <button className="action-button interview-button" onClick={() => alert('Interview flow coming soon')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Attend Interview
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetailPage;

