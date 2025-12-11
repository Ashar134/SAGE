export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  applicationDate: Date;
  testDeadline: Date;
  testStatus: 'not_started' | 'in_progress' | 'passed' | 'failed' | 'completed';
  interviewDeadline?: Date;
  interviewStatus?: 'scheduled' | 'completed' | 'passed' | 'failed';
  applicationStatus:
    | 'pending'
    | 'test_pending'
    | 'test_completed'
    | 'interview_pending'
    | 'interview_completed'
    | 'accepted'
    | 'rejected';
}

// Helpers to generate dates relative to today
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

// Dummy data - replace with backend data later
export const applications: Application[] = [
  {
    id: '1',
    jobTitle: 'Assistant Professor - Computer Science',
    company: 'University of Engineering and Technology (UET)',
    location: 'Lahore, Pakistan',
    applicationDate: getDateDaysAgo(20),
    testDeadline: getDateDaysAgo(6),
    testStatus: 'passed',
    interviewDeadline: getDateDaysFromNow(1),
    interviewStatus: 'scheduled',
    applicationStatus: 'interview_pending',
  },
  {
    id: '2',
    jobTitle: 'Lecturer - Software Engineering',
    company: 'National University of Sciences and Technology (NUST)',
    location: 'Islamabad, Pakistan',
    applicationDate: getDateDaysAgo(5),
    testDeadline: getDateDaysFromNow(9),
    testStatus: 'not_started',
    applicationStatus: 'test_pending',
  },
  {
    id: '3',
    jobTitle: 'Research Assistant - Artificial Intelligence',
    company: 'Lahore University of Management Sciences (LUMS)',
    location: 'Lahore, Pakistan',
    applicationDate: getDateDaysAgo(30),
    testDeadline: getDateDaysAgo(16),
    testStatus: 'completed',
    interviewDeadline: getDateDaysAgo(9),
    interviewStatus: 'completed',
    applicationStatus: 'accepted',
  },
  {
    id: '4',
    jobTitle: 'Associate Professor - Data Science',
    company: 'Institute of Business Administration (IBA)',
    location: 'Karachi, Pakistan',
    applicationDate: getDateDaysAgo(3),
    testDeadline: getDateDaysFromNow(11),
    testStatus: 'not_started',
    applicationStatus: 'test_pending',
  },
  {
    id: '5',
    jobTitle: 'Lab Instructor - Computer Networks',
    company: 'COMSATS University',
    location: 'Lahore, Pakistan',
    applicationDate: getDateDaysAgo(25),
    testDeadline: getDateDaysAgo(11),
    testStatus: 'failed',
    applicationStatus: 'rejected',
  },
];


