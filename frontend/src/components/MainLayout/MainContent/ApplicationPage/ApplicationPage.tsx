import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ApplicationPage.css';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  applicationDate: Date;
  testDeadline: Date;
  testStatus: 'not_started' | 'in_progress' | 'passed' | 'failed' | 'completed';
  interviewDeadline?: Date;
  interviewStatus?: 'scheduled' | 'completed' | 'passed' | 'failed';
  applicationStatus: 'pending' | 'test_pending' | 'test_completed' | 'interview_pending' | 'interview_completed' | 'accepted' | 'rejected';
}

// Helper function to get dates relative to today
const getDateDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDateDaysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Dummy data - will be replaced with actual backend data
const dummyApplications: Application[] = [
  {
    id: '1',
    jobTitle: 'Assistant Professor - Computer Science',
    company: 'University of Engineering and Technology (UET)',
    location: 'Lahore, Pakistan',
    applicationDate: getDateDaysAgo(20), // Applied 20 days ago
    testDeadline: getDateDaysAgo(6), // Test deadline was 6 days ago (passed)
    testStatus: 'passed',
    interviewDeadline: getDateDaysFromNow(1), // Interview deadline in 1 day (7 days after test pass - ACTIVE)
    interviewStatus: 'scheduled',
    applicationStatus: 'interview_pending'
  },
  {
    id: '2',
    jobTitle: 'Lecturer - Software Engineering',
    company: 'National University of Sciences and Technology (NUST)',
    location: 'Islamabad, Pakistan',
    applicationDate: getDateDaysAgo(5), // Applied 5 days ago
    testDeadline: getDateDaysFromNow(9), // Test deadline in 9 days (ACTIVE - can take test now)
    testStatus: 'not_started',
    applicationStatus: 'test_pending'
  },
  {
    id: '3',
    jobTitle: 'Research Assistant - Artificial Intelligence',
    company: 'Lahore University of Management Sciences (LUMS)',
    location: 'Lahore, Pakistan',
    applicationDate: getDateDaysAgo(30), // Applied 30 days ago
    testDeadline: getDateDaysAgo(16), // Test deadline was 16 days ago
    testStatus: 'completed',
    interviewDeadline: getDateDaysAgo(9), // Interview was 9 days ago
    interviewStatus: 'completed',
    applicationStatus: 'accepted'
  },
  {
    id: '4',
    jobTitle: 'Associate Professor - Data Science',
    company: 'Institute of Business Administration (IBA)',
    location: 'Karachi, Pakistan',
    applicationDate: getDateDaysAgo(3), // Applied 3 days ago
    testDeadline: getDateDaysFromNow(11), // Test deadline in 11 days (ACTIVE - can take test now)
    testStatus: 'not_started',
    applicationStatus: 'test_pending'
  },
  {
    id: '5',
    jobTitle: 'Lab Instructor - Computer Networks',
    company: 'COMSATS University',
    location: 'Lahore, Pakistan',
    applicationDate: getDateDaysAgo(25), // Applied 25 days ago
    testDeadline: getDateDaysAgo(11), // Test deadline was 11 days ago
    testStatus: 'failed',
    applicationStatus: 'rejected'
  }
];

function ApplicationPage() {
  const [applications] = useState<Application[]>(dummyApplications);
  const navigate = useNavigate();

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
    // Cannot take test if already attempted
    if (hasAttemptedTest(application)) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appDate = new Date(application.applicationDate);
    appDate.setHours(0, 0, 0, 0);
    const deadline = new Date(application.testDeadline);
    deadline.setHours(0, 0, 0, 0);
    
    // Can take test if: test date has started (today >= application date) and deadline has not passed (today <= deadline)
    return today >= appDate && today <= deadline;
  };

  const canAttendInterview = (application: Application): boolean => {
    // Cannot attend interview if already attempted
    if (!application.interviewDeadline || hasAttemptedInterview(application)) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Interview can be attempted from when test is passed until interview deadline (7 days window)
    // Interview start date is when test was passed (application date + test completion)
    // For simplicity, we'll use the test deadline as the interview start date
    // In real implementation, this would be the actual test completion date
    const interviewDeadline = new Date(application.interviewDeadline);
    interviewDeadline.setHours(0, 0, 0, 0);
    
    // Interview start date is 7 days before deadline (when test was passed)
    const interviewStartDate = new Date(interviewDeadline);
    interviewStartDate.setDate(interviewStartDate.getDate() - 7);
    interviewStartDate.setHours(0, 0, 0, 0);
    
    // Can attend interview if: interview date has started (today >= start date) and deadline has not passed (today <= deadline)
    return today >= interviewStartDate && today <= interviewDeadline && application.interviewStatus === 'scheduled';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'pending': { label: 'Pending', className: 'status-pending' },
      'test_pending': { label: 'Test Pending', className: 'status-test-pending' },
      'test_completed': { label: 'Test Completed', className: 'status-test-completed' },
      'interview_pending': { label: 'Interview Pending', className: 'status-interview-pending' },
      'interview_completed': { label: 'Interview Completed', className: 'status-interview-completed' },
      'accepted': { label: 'Accepted', className: 'status-accepted' },
      'rejected': { label: 'Rejected', className: 'status-rejected' }
    };

    const config = statusConfig[status] || { label: status, className: 'status-default' };
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  const handleGiveTest = (_applicationId: string) => {
    // Navigate to test page with application ID
    // The test page is already implemented at /test route
    navigate('/app/test');
    // TODO: Pass application ID as query parameter or state when backend is integrated
    // Example: navigate(`/test?applicationId=${applicationId}`);
  };

  const handleAttendInterview = (applicationId: string) => {
    // TODO: Navigate to interview page or open interview interface
    console.log('Attend interview for application:', applicationId);
    alert('Interview interface will be implemented soon.');
  };

  return (
    <div className="application-page">
      <div className="application-container">
        <div className="application-header">
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">Track your job applications and assessments</p>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            {applications.map((application) => {
              const testDaysRemaining = getDaysRemaining(application.testDeadline);
              const interviewDaysRemaining = application.interviewDeadline 
                ? getDaysRemaining(application.interviewDeadline) 
                : null;

              return (
                <div key={application.id} className="application-card">
                  <div className="application-card-header">
                    <div className="application-info">
                      <h2 className="job-title">{application.jobTitle}</h2>
                      <p className="company-name">{application.company}</p>
                      <div className="job-location">
                        <svg className="location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {application.location}
                      </div>
                    </div>
                    {getStatusBadge(application.applicationStatus)}
                  </div>

                  <div className="application-details">
                    <div className="detail-item">
                      <span className="detail-label">Application Date:</span>
                      <span className="detail-value">{formatDate(application.applicationDate)}</span>
                    </div>

                    {/* Test Section */}
                    <div className="assessment-section">
                      <div className="assessment-header">
                        <h3 className="assessment-title">Assessment Test</h3>
                        {application.testStatus === 'passed' && (
                          <span className="test-passed-badge">✓ Passed</span>
                        )}
                        {application.testStatus === 'failed' && (
                          <span className="test-failed-badge">✗ Failed</span>
                        )}
                        {application.testStatus === 'completed' && (
                          <span className="test-completed-badge">Completed</span>
                        )}
                      </div>
                      {hasAttemptedTest(application) ? (
                        <div className="detail-item">
                          <span className="detail-label">Test Status:</span>
                          <span className="detail-value">
                            {application.testStatus === 'passed' && '✓ Passed'}
                            {application.testStatus === 'failed' && '✗ Failed'}
                            {application.testStatus === 'completed' && 'Completed'}
                          </span>
                        </div>
                      ) : (
                        <div className="detail-item">
                          <span className="detail-label">Test Deadline:</span>
                          <span className={`detail-value ${testDaysRemaining < 0 ? 'deadline-passed' : testDaysRemaining <= 3 ? 'deadline-soon' : ''}`}>
                            {formatDate(application.testDeadline)}
                            {testDaysRemaining >= 0 && (
                              <span className="days-remaining"> ({testDaysRemaining} days remaining)</span>
                            )}
                            {testDaysRemaining < 0 && (
                              <span className="days-remaining deadline-passed"> (Deadline passed)</span>
                            )}
                          </span>
                        </div>
                      )}
                      {canTakeTest(application) && (
                        <button 
                          className="action-button test-button"
                          onClick={() => handleGiveTest(application.id)}
                        >
                          {application.testStatus === 'in_progress' ? 'Continue Test' : 'Give Test'}
                        </button>
                      )}
                    </div>

                    {/* Interview Section - Only show if test is passed */}
                    {application.testStatus === 'passed' && application.interviewDeadline && (
                      <div className="assessment-section interview-section">
                        <div className="assessment-header">
                          <h3 className="assessment-title">Interview</h3>
                          {application.interviewStatus === 'completed' && (
                            <span className="interview-completed-badge">Completed</span>
                          )}
                          {application.interviewStatus === 'passed' && (
                            <span className="interview-passed-badge">✓ Passed</span>
                          )}
                          {application.interviewStatus === 'failed' && (
                            <span className="interview-failed-badge">✗ Failed</span>
                          )}
                        </div>
                        {hasAttemptedInterview(application) ? (
                          <div className="detail-item">
                            <span className="detail-label">Interview Status:</span>
                            <span className="detail-value">
                              {application.interviewStatus === 'completed' && 'Completed'}
                              {application.interviewStatus === 'passed' && '✓ Passed'}
                              {application.interviewStatus === 'failed' && '✗ Failed'}
                            </span>
                          </div>
                        ) : (
                          <div className="detail-item">
                            <span className="detail-label">Interview Deadline:</span>
                            <span className={`detail-value ${interviewDaysRemaining !== null && interviewDaysRemaining < 0 ? 'deadline-passed' : interviewDaysRemaining !== null && interviewDaysRemaining <= 2 ? 'deadline-soon' : ''}`}>
                              {formatDate(application.interviewDeadline)}
                              {interviewDaysRemaining !== null && interviewDaysRemaining >= 0 && (
                                <span className="days-remaining"> ({interviewDaysRemaining} days remaining)</span>
                              )}
                              {interviewDaysRemaining !== null && interviewDaysRemaining < 0 && (
                                <span className="days-remaining deadline-passed"> (Deadline passed)</span>
                              )}
                            </span>
                          </div>
                        )}
                        {canAttendInterview(application) && (
                          <button 
                            className="action-button interview-button"
                            onClick={() => handleAttendInterview(application.id)}
                          >
                            Attend Interview
                          </button>
                        )}
                      </div>
                    )}
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

export default ApplicationPage;
