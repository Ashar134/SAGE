import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
    // State for form data
    const [personalInfo] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1 234 567 8900',
        bio: 'Software Engineer with 5+ years of experience in full-stack development'
    });

    const [addressInfo] = useState({
        country: 'United States',
        cityState: 'San Francisco, California',
        postalCode: '94102',
        streetAddress: '123 Market Street'
    });

    const [education] = useState([
        {
            id: 1,
            degree: 'Bachelor of Science in Computer Science',
            school: 'Stanford University',
            dates: '2015 - 2019',
            description: 'GPA: 3.8/4.0 • Dean\'s List • Computer Science Society President'
        },
        {
            id: 2,
            degree: 'Master of Science in Software Engineering',
            school: 'MIT',
            dates: '2019 - 2021',
            description: 'Specialization in Distributed Systems and Cloud Computing'
        }
    ]);

    const [experience] = useState([
        {
            id: 1,
            title: 'Senior Software Engineer',
            company: 'Tech Corp Inc.',
            dates: 'Jan 2022 - Present',
            description: 'Leading a team of 5 developers in building scalable microservices architecture. Improved system performance by 40% and reduced deployment time by 60%.'
        },
        {
            id: 2,
            title: 'Software Engineer',
            company: 'StartUp XYZ',
            dates: 'Jun 2019 - Dec 2021',
            description: 'Developed full-stack web applications using React, Node.js, and PostgreSQL. Contributed to product features used by 100K+ users.'
        }
    ]);

    const [skills] = useState({
        languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go'],
        frameworks: ['React', 'Node.js', 'Express', 'Django', 'Spring Boot'],
        tools: ['Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'MongoDB', 'Redis']
    });



    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-header-avatar">
                    {personalInfo.firstName.charAt(0)}{personalInfo.lastName.charAt(0)}
                </div>
                <div className="profile-header-info">
                    <h2 className="profile-header-name">{personalInfo.firstName} {personalInfo.lastName}</h2>
                    <p className="profile-header-title">Senior Software Engineer</p>
                    <p className="profile-header-location">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {addressInfo.cityState}, {addressInfo.country}
                    </p>
                </div>
            </div>

            {/* Profile Content */}
            <motion.div
                className="profile-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Main Profile Card */}
                <div className="overview-main-card">
                    <div className="overview-body">
                        {/* About */}
                        <div className="overview-section">
                            <h3 className="overview-section-title">About</h3>
                            <p className="overview-bio">{personalInfo.bio}</p>
                        </div>

                        {/* Contact */}
                        <div className="overview-section">
                            <h3 className="overview-section-title">Contact</h3>
                            <div className="overview-contact-grid">
                                <div className="overview-contact-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                    <span>{personalInfo.email}</span>
                                </div>
                                <div className="overview-contact-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                    <span>{personalInfo.phone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="overview-section">
                            <h3 className="overview-section-title">Top Skills</h3>
                            <div className="overview-skills-grid">
                                {[...skills.languages.slice(0, 4), ...skills.frameworks.slice(0, 4)].map((skill, index) => (
                                    <div key={index} className="overview-skill-tag">{skill}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Experience & Education Cards */}
                <div className="overview-cards-grid">
                    {/* Experience Card */}
                    <div className="overview-info-card">
                        <div className="info-card-header">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                            <h3>Work Experience</h3>
                        </div>
                        <div className="info-card-body">
                            {experience.map((exp) => (
                                <div key={exp.id} className="info-card-item">
                                    <h4 className="item-title">{exp.title}</h4>
                                    <p className="item-subtitle">{exp.company}</p>
                                    <p className="item-date">{exp.dates}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Education Card */}
                    <div className="overview-info-card">
                        <div className="info-card-header">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                            </svg>
                            <h3>Education</h3>
                        </div>
                        <div className="info-card-body">
                            {education.map((edu) => (
                                <div key={edu.id} className="info-card-item">
                                    <h4 className="item-title">{edu.degree}</h4>
                                    <p className="item-subtitle">{edu.school}</p>
                                    <p className="item-date">{edu.dates}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
