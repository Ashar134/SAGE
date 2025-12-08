import { useState, useEffect } from 'react';
import './HomePageStyle.css';

function HomePage() {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [fade, setFade] = useState(true);

  const messages = [
    { title: "Hi Ashar Naveed!", subtitle: "Sage is here to guide you." },
    { title: "Stand Out with Confidence", subtitle: "Advanced tools to highlight your strengths." },
    { title: "Explore Tailored Opportunities", subtitle: "Smart matches. Fair results." },
    { title: "Reach New Career Heights", subtitle: "Your future starts with one step." }
  ];

const jobListings = [
  {
    id: 1,
    title: "UI/UX Designer",
    type: "Full Time",
    schedule: "Flexible Schedule",
    level: "Mid Level",
    location: "Lahore, Pakistan",
    description: "A senior designer with strong branding and illustration skills is required for long-term projects.",
    company: "Systems Limited"
  },
  {
    id: 2,
    title: "Graphic Designer",
    type: "Full Time",
    schedule: "On-Site",
    level: "Entry Level",
    location: "Karachi, Pakistan",
    description: "A senior designer with strong branding and illustration skills is required for long-term projects.",
    company: "Beeztech"
  },
  {
    id: 3,
    title: "Front-End Developer",
    type: "Part Time",
    schedule: "Remote",
    level: "Mid Level",
    location: "Islamabad, Pakistan",
    description: "A senior designer with strong branding and illustration skills is required for long-term projects.",
    company: "10Pearls"
  },
  {
    id: 4,
    title: "Graphic Designer",
    type: "Project-Based",
    schedule: "Flexible Timings",
    level: "Senior Level",
    location: "Rawalpindi, Pakistan",
    description: "A senior designer with strong branding and illustration skills is required for long-term projects.",
    company: "S&P Global"
  },
  {
    id: 5,
    title: "Graphic Designer",
    type: "Project-Based",
    schedule: "Flexible Timings",
    level: "Senior Level",
    location: "Rawalpindi, Pakistan",
    description: "A senior designer with strong branding and illustration skills is required for long-term projects.",
    company: "Databrick"
  },
  {
    id: 6,
    title: "Graphic Designer",
    type: "Project-Based",
    schedule: "Flexible Timings",
    level: "Senior Level",
    location: "Rawalpindi, Pakistan",
    description: "A senior designer with strong branding and illustration skills is required for long-term projects.",
    company: "Databrick"
  }
  ,{
    id: 7,
    title: "Graphic Designer",
    type: "Project-Based",
    schedule: "Flexible Timings",
    level: "Senior Level",
    location: "Rawalpindi, Pakistan",
    description: "A senior designer with strong branding and illustration skills is required for long-term projects.",
    company: "Databrick"
  }
  ,
  {
    id: 8,
    title: "Graphic Designer",
    type: "Project-Based",
    schedule: "Flexible Timings",
    level: "Senior Level",
    location: "Rawalpindi, Pakistan",
    description: "A senior designer with strong branding and illustration skills is required for long-term projects.",
    company: "Databrick"
  }
];


  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setFade(false);
      
      // Change message after fade out
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
        setFade(true); // Fade in new message
      }, 500);
      
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="home-page">
      <div className="home-page-container">
        <div className="container-box">
          <main className="content-area"></main>
          <div className="welcome-message">
            <h1 className={`message-title ${fade ? 'fade-in' : 'fade-out'}`}>
              {messages[currentMessage].title}
            </h1>
            <h2 className={`message-subtitle ${fade ? 'fade-in' : 'fade-out'}`}>
              {messages[currentMessage].subtitle}
            </h2>
          </div>
        </div>
      </div>

      <div className="jobs-section">
        <div className="jobs-header">
          {/* <h2 className="jobs-title">Recommended jobs</h2> */}
          {/* <span className="jobs-count">640</span> */}
        </div>
        
        <div className="jobs-container">
          {jobListings.map((job) => (
            <div className="job-card" key={job.id}>
              <div className="job-card-header">
                <div className="job-title-section">
                  <h3 className="job-title">{job.title}</h3>
                </div>
                <div className="company-tag">{job.company}</div>
              </div>
              
              <div className="job-tags">
                <span className="job-tag">{job.type}</span>
                {job.schedule && <span className="job-tag">{job.schedule}</span>}
                {job.level && <span className="job-tag">{job.level}</span>}
              </div>
              
              <div className="job-location">
                <svg className="location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {job.location}
              </div>
              
              <p className="job-description">{job.description}</p>
              
              <div className="job-actions">
                <button className="apply-button">Apply</button>
                {/* <button className="contacts-button">Contacts</button> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;