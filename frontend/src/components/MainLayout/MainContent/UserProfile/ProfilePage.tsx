import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import Header from '../../../MainLayout/Header/Header';
import './ProfilePage.css';
import '../../../Onboarding/CvOnboarding.css';

interface Skill {
    id: string;
    skill_name: string;
    skill_type: string;
}

interface Education {
    id: string;
    degree: string;
    school: string;
    description: string;
}

interface Experience {
    id: string;
    job_title: string;
    company: string;
    description: string;
}

interface ProjectItem {
    id: string;
    title: string;
    organization: string;
    period: string;
    details: string;
}

interface CertificateItem {
    id: string;
    name: string;
    issuer: string;
    year: string;
}

interface ResearchItem {
    id: string;
    title: string;
    organization: string;
    period: string;
    details: string;
}

interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    bio: string;
    city_state: string;
    country: string;
    skills: Skill[];
    education: Education[];
    work_experience: Experience[];
    certificates: CertificateItem[];
    research: ResearchItem[];
    projects: ProjectItem[];
}

const API_BASE_URL = "http://localhost:8000";

const ProfilePage: React.FC = () => {
    const { user, accessToken, isAuthenticated, loading: authLoading } = useAuth();
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            window.location.href = 'http://localhost:8000/auth/';
            return;
        }

        const fetchProfile = async () => {
            if (!user?.id || !accessToken) return;

            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    setProfileData(data.user);
                } else {
                    setError(data.error || "Failed to fetch profile");
                }
            } catch (err) {
                setError("Network error. Please try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, accessToken, isAuthenticated, authLoading]);

    if (authLoading || (loading && !profileData)) {
        return (
            <div className="cv-onboarding-page-container">
                <Header />
                <div className="cv-onboarding-content-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <div className="spinner small" />
                    <span style={{ marginLeft: '12px', color: '#64748b' }}>Loading your profile...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cv-onboarding-page-container">
                <Header />
                <div className="cv-onboarding-content-wrapper">
                    <div className="validation-message error" style={{ maxWidth: '600px', margin: '40px auto' }}>
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cv-onboarding-page-container profile-page-refined">
            <Header />

            <div className="cv-onboarding-content-wrapper">
                <div className="cv-onboarding-header-section">
                    <div>
                        <h1 className="page-title">User Profile</h1>
                        <p className="page-subtitle">View and manage your professional summary</p>
                    </div>
                </div>

                <div className="tabs-container">
                    {/* Tabs Navigation */}
                    <div className="onboarding-tabs">
                        <button className="tab-button active">Summary</button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        <div className="review-tab-layout fade-in">
                            <div className="review-main-grid">
                                {/* Left Column: Basics, Summary & Skills */}
                                <div className="review-col review-col-left">
                                    {/* Personal Details as a standard card */}
                                    <div className="summary-preview-section">
                                        <div className="summary-section-header">
                                            <h3 className="summary-section-title">Personal Details</h3>
                                        </div>
                                        <div className="summary-content">
                                            <div className="summary-details-grid">
                                                <div className="detail-row"><strong>Name:</strong> {profileData ? `${profileData.first_name} ${profileData.last_name}` : "Not provided"}</div>
                                                <div className="detail-row"><strong>Email:</strong> {profileData?.email || "Not provided"}</div>
                                                <div className="detail-row"><strong>Phone:</strong> {profileData?.phone || "Not provided"}</div>
                                                <div className="detail-row"><strong>Location:</strong> {profileData ? `${profileData.city_state}, ${profileData.country}` : "Not provided"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {profileData?.bio && (
                                        <div className="summary-preview-section">
                                            <div className="summary-section-header">
                                                <h3 className="summary-section-title">Professional Summary</h3>
                                            </div>
                                            <div className="summary-content">
                                                <p style={{ margin: 0 }}>{profileData.bio}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="summary-preview-section">
                                        <div className="summary-section-header">
                                            <h3 className="summary-section-title">Technical Skills</h3>
                                        </div>
                                        <div className="summary-content">
                                            {profileData?.skills && profileData.skills.length > 0 ? (
                                                <div className="summary-skills-list">
                                                    {profileData.skills.map((skill, idx) => (
                                                        <span key={idx} className="skill-tag">{skill.skill_name}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="summary-empty">No skills added</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Experience & Education */}
                                <div className="review-col review-col-right">
                                    <div className="summary-preview-section">
                                        <div className="summary-section-header">
                                            <h3 className="summary-section-title">Technical Projects</h3>
                                        </div>
                                        <div className="summary-content">
                                            {profileData?.projects && profileData.projects.length > 0 ? (
                                                profileData.projects.map((proj, idx) => (
                                                    <div key={idx} className="summary-item">
                                                        <div className="summary-item-title">{proj.title}</div>
                                                        <div className="summary-item-subtitle">{proj.organization}</div>
                                                        <div className="summary-item-meta" style={{ fontSize: '0.85rem', color: '#64748b' }}>{proj.period}</div>
                                                        {proj.details && <div className="summary-item-details" style={{ whiteSpace: 'pre-wrap' }}>{proj.details}</div>}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="summary-empty">No projects listed</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="summary-preview-section">
                                        <div className="summary-section-header">
                                            <h3 className="summary-section-title">Research Work</h3>
                                        </div>
                                        <div className="summary-content">
                                            {profileData?.research && profileData.research.length > 0 ? (
                                                profileData.research.map((res, idx) => (
                                                    <div key={idx} className="summary-item">
                                                        <div className="summary-item-title">{res.title}</div>
                                                        <div className="summary-item-subtitle">{res.organization}</div>
                                                        <div className="summary-item-meta" style={{ fontSize: '0.85rem', color: '#64748b' }}>{res.period}</div>
                                                        {res.details && <div className="summary-item-details" style={{ whiteSpace: 'pre-wrap' }}>{res.details}</div>}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="summary-empty">No research listed</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="summary-preview-section">
                                        <div className="summary-section-header">
                                            <h3 className="summary-section-title">Certifications</h3>
                                        </div>
                                        <div className="summary-content">
                                            {profileData?.certificates && profileData.certificates.length > 0 ? (
                                                profileData.certificates.map((cert, idx) => (
                                                    <div key={idx} className="summary-item">
                                                        <div className="summary-item-title">{cert.name}</div>
                                                        <div className="summary-item-subtitle">{cert.issuer} {cert.year ? `(${cert.year})` : ''}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="summary-empty">No certifications listed</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="summary-preview-section">
                                        <div className="summary-section-header">
                                            <h3 className="summary-section-title">Work Experience</h3>
                                        </div>
                                        <div className="summary-content">
                                            {profileData?.work_experience && profileData.work_experience.length > 0 ? (
                                                profileData.work_experience.map((exp, idx) => (
                                                    <div key={idx} className="summary-item">
                                                        <div className="summary-item-title">{exp.job_title || 'No title'}</div>
                                                        <div className="summary-item-subtitle">{exp.company || 'No organization'}</div>
                                                        {exp.description && <div className="summary-item-details" style={{ whiteSpace: 'pre-wrap' }}>{exp.description}</div>}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="summary-empty">No work experience added</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="summary-preview-section">
                                        <div className="summary-section-header">
                                            <h3 className="summary-section-title">Education</h3>
                                        </div>
                                        <div className="summary-content">
                                            {profileData?.education && profileData.education.length > 0 ? (
                                                profileData.education.map((edu, idx) => (
                                                    <div key={idx} className="summary-item">
                                                        <div className="summary-item-title">{edu.degree || 'No degree'}</div>
                                                        <div className="summary-item-subtitle">{edu.school || 'No institution'}</div>
                                                        {edu.description && <div className="summary-item-details" style={{ whiteSpace: 'pre-wrap' }}>{edu.description}</div>}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="summary-empty">No education added</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
