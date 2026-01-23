import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './JobPage.css';

// ============================================================================
// TYPES
// ============================================================================

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  posted: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  logoColor: string;
  logoText: string;
  saved?: boolean;
}

// ============================================================================
// DATA
// ============================================================================

const JOBS: Job[] = [
  {
    id: 1,
    title: 'Senior Product Designer',
    company: 'Google',
    location: 'Mountain View, CA',
    posted: '2d',
    type: 'Full-time',
    salary: '$120k - $180k',
    description: 'We are looking for a talented Product Designer to join our team and help shape the future of our products.',
    requirements: [
      '5+ years of product design experience',
      'Strong portfolio demonstrating UX/UI skills',
      'Proficiency in Figma or similar tools',
      'Experience with design systems',
      'Excellent communication skills'
    ],
    logoColor: '#4285f4',
    logoText: 'G',
    saved: true
  },
  {
    id: 2,
    title: 'UX Researcher',
    company: 'Meta',
    location: 'Menlo Park, CA',
    posted: '1w',
    type: 'Full-time',
    salary: '$100k - $150k',
    description: 'Join our UX Research team to uncover insights that drive product innovation.',
    requirements: [
      '3+ years of UX research experience',
      'Experience with qualitative methods',
      'Strong analytical skills',
      'Bachelor\'s degree in HCI or related field'
    ],
    logoColor: '#0668E1',
    logoText: 'M'
  },
  {
    id: 3,
    title: 'UI/UX Designer',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    posted: '3d',
    type: 'Full-time',
    salary: '$110k - $160k',
    description: 'Design experiences that entertain millions worldwide.',
    requirements: [
      '4+ years of UI/UX design experience',
      'Strong visual design skills',
      'Experience with streaming platforms',
      'Portfolio showcasing shipped products'
    ],
    logoColor: '#E50914',
    logoText: 'N',
    saved: true
  },
  {
    id: 4,
    title: 'Interaction Designer',
    company: 'Airbnb',
    location: 'San Francisco, CA',
    posted: '5d',
    type: 'Remote',
    salary: '$115k - $170k',
    description: 'Design delightful experiences for travelers and hosts around the world.',
    requirements: [
      '3+ years of interaction design experience',
      'Strong understanding of motion design',
      'Experience with prototyping tools',
      'Excellent problem-solving skills'
    ],
    logoColor: '#FF5A5F',
    logoText: 'A'
  }
];

// ============================================================================
// COMPONENT
// ============================================================================

function JobPage() {
  const [selected, setSelected] = useState<Job>(JOBS[0]);
  const [activeTab, setActiveTab] = useState('all');

  const filteredJobs = JOBS.filter(job => {
    if (activeTab === 'saved') return job.saved;
    return true;
  });

  const savedCount = JOBS.filter(job => job.saved).length;

  return (
    <div className='jobs-page'>
      <div className="job-header">
        <div>
          <h1 className="job-page-title">Find Your Dream Job</h1>
          <p className="job-page-subtitle">{JOBS.length} recommended jobs for you</p>
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
            const firstRecommended = JOBS[0];
            if (firstRecommended) setSelected(firstRecommended);
          }}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <span>All Jobs</span>
          <span className="tab-badge">{JOBS.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('saved');
            const firstSaved = JOBS.find(j => j.saved);
            if (firstSaved) setSelected(firstSaved);
            else setSelected(null as any);
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
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
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
            ))
          ) : (
            <div className="empty-state-jobs">
              <p>No saved jobs yet</p>
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
                  <button className="apply-btn">Apply Now</button>
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
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobPage;